import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { getProjectModelPath } from "../../src/lib/portfolioModels";
import * as THREE from "three";
import { disposeModel } from "../../src/lib/modelViewerResources";
import { getRenderableModelBounds } from "../../src/lib/modelViewerBounds";
import { modelCases, modelProjects } from "./helpers/model-cases";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function discoverModel(files: string[]) {
  const original = fs.readdirSync;
  let enumerations = 0;
  // The allowlist must not inspect or select any legacy originals or backups.
  fs.readdirSync = (() => { enumerations++; return files; }) as unknown as typeof fs.readdirSync;
  try {
    const modelPath = getProjectModelPath("jd003");
    expect(enumerations).toBe(0);
    return modelPath;
  } finally { fs.readdirSync = original; }
}

test("model discovery selects the allowlisted web asset regardless of directory order", () => {
  expect(discoverModel(["aaa.glb", "jd003_bak.glb", "jd003.glb"])).toBe("/images/glb/jd003_web.glb");
  expect(discoverModel(["jd003.glb", "jd003_bak.glb", "aaa.glb"])).toBe("/images/glb/jd003_web.glb");
  expect(discoverModel([])).toBe("/images/glb/jd003_web.glb");
});

test("model discovery never falls back to originals or backups when the web asset is missing", () => {
  const original = fs.existsSync;
  const checkedPaths: string[] = [];
  fs.existsSync = ((assetPath) => {
    checkedPaths.push(String(assetPath));
    return !String(assetPath).endsWith("jd003_web.glb");
  }) as typeof fs.existsSync;
  try {
    expect(discoverModel(["jd003.glb", "jd003_bak.glb", "old_backup.GLB", "z.glb", ".hidden.glb", "a.GLB"])).toBeNull();
    expect(discoverModel(["a.GLB", "z.glb", "jd003.glb"])).toBeNull();
    expect(checkedPaths).toEqual([
      `${process.cwd()}/public/images/glb/jd003_web.glb`,
      `${process.cwd()}/public/images/glb/jd003_web.glb`,
    ]);
  } finally { fs.existsSync = original; }
});

test("shared model geometry, materials and textures are released exactly once", () => {
  const geometry = new THREE.BoxGeometry();
  const texture = new THREE.Texture();
  const material = new THREE.MeshStandardMaterial({ map: texture, normalMap: texture });
  const counts = { geometry: 0, texture: 0, material: 0 };
  geometry.addEventListener("dispose", () => counts.geometry++);
  texture.addEventListener("dispose", () => counts.texture++);
  material.addEventListener("dispose", () => counts.material++);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, [material, material]));
  disposeModel(group);
  expect(counts).toEqual({ geometry: 1, texture: 1, material: 1 });
});

test("camera bounds exclude invisible and fully transparent helper geometry", () => {
  const group = new THREE.Group();
  const visible = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshStandardMaterial());
  visible.position.set(3, 2, 0);
  group.add(visible);
  const transparent = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }));
  group.add(transparent);
  const hidden = new THREE.Group();
  hidden.visible = false;
  hidden.add(new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200), new THREE.MeshStandardMaterial()));
  group.add(hidden);
  const bounds = getRenderableModelBounds(group);
  expect(bounds.min.toArray()).toEqual([2, 0, -1]);
  expect(bounds.max.toArray()).toEqual([4, 4, 1]);
  disposeModel(group);
});

test("camera bounds use instance transforms and ancestor world transforms instead of template geometry", () => {
  const group = new THREE.Group();
  group.position.set(5, -3, 7);
  group.scale.set(2, 3, 4);
  const geometry = new THREE.BoxGeometry(20, 40, 60);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial(), 2);
  const transforms = [
    new THREE.Matrix4().compose(new THREE.Vector3(1, 2, 3), new THREE.Quaternion(), new THREE.Vector3(0.1, 0.2, 0.05)),
    new THREE.Matrix4().compose(new THREE.Vector3(-2, -1, 0), new THREE.Quaternion(), new THREE.Vector3(0.2, 0.1, 0.1)),
  ];
  transforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
  group.add(mesh);
  // Exclusions must also hold for hidden/transparent instanced meshes.
  const transparent = new THREE.InstancedMesh(new THREE.BoxGeometry(1000, 1000, 1000), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }), 1);
  const hidden = new THREE.InstancedMesh(new THREE.BoxGeometry(2000, 2000, 2000), new THREE.MeshStandardMaterial(), 1);
  hidden.visible = false;
  group.add(transparent, hidden);
  group.updateWorldMatrix(true, true);
  const expected = new THREE.Box3();
  // Independent oracle: transform every actual template vertex through each
  // stored instance matrix and world matrix, without using object bounding boxes.
  for (let instance = 0; instance < mesh.count; instance++) {
    const matrix = new THREE.Matrix4();
    mesh.getMatrixAt(instance, matrix);
    const positions = geometry.getAttribute("position");
    for (let vertex = 0; vertex < positions.count; vertex++) {
      expected.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, vertex).applyMatrix4(matrix).applyMatrix4(mesh.matrixWorld));
    }
  }
  const actual = getRenderableModelBounds(group);
  expect(actual.min.distanceTo(expected.min)).toBeLessThan(1e-10);
  expect(actual.max.distanceTo(expected.max)).toBeLessThan(1e-10);
  disposeModel(group);
});

test("camera bounds remain empty for an entirely transparent model", () => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }));
  expect(getRenderableModelBounds(mesh).isEmpty()).toBe(true);
  disposeModel(mesh);
});


test("missing GLB disables renderer controls and offers accessible fallback", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/images/glb/jd003_web.glb", async (route) => {
    await blocked;
    await route.fulfill({ status: 404, body: "Missing model" });
  });
  await page.goto(`${basePath}/portfolio/jd003/`);
  await page.getByRole("region", { name: /3D 모델/ }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "시점 리셋" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /자동 회전/ })).toBeDisabled();
  release();
  const region = page.getByRole("region", { name: /3D 모델/ });
  await expect(region).toHaveAttribute("data-state", "error");
  await expect(region.getByRole("alert")).toContainText("이미지");
  await expect(region.getByRole("button", { name: "시점 리셋" })).toBeDisabled();
  await region.screenshot({ path: testInfo.outputPath("missing-model-fallback.png") });
  expect(errors).toEqual([]);
});

test("unsupported WebGL shows fallback without an uncaught exception", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto(`${basePath}/portfolio/jd003/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "error");
  await expect(region.getByRole("alert")).toContainText("이미지");
  expect(errors).toEqual([]);
});

test("fullscreen state belongs only to the viewer whose container is fullscreen", async ({ page }) => {
  await page.goto(`${basePath}/portfolio/jd003/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
  await page.evaluate(() => {
    const foreign = document.createElement("div");
    document.body.appendChild(foreign);
    Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => foreign });
    document.dispatchEvent(new Event("fullscreenchange"));
  });
  await expect(region.getByRole("button", { name: "전체화면", exact: true })).toHaveAttribute("aria-pressed", "false");
});

for (const mode of ["unavailable", "denied"] as const) {
test(`fullscreen ${mode} keeps normal view without an uncaught exception`, async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((mode) => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      value: mode === "unavailable" ? undefined : () => Promise.reject(new Error("Fullscreen denied")),
      configurable: true,
    });
  }, mode);
  await page.goto(`${basePath}/portfolio/jd003/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
  const fullscreen = region.getByRole("button", { name: "전체화면", exact: true });
  await fullscreen.click();
  // A failed/unsupported request must not optimistically claim fullscreen.
  await expect(fullscreen).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});
}

test("offscreen viewer delays downloads and pauses drawing without reloading", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => { if (request.url().endsWith("/images/glb/jd003_web.glb")) requests.push(request.url()); });
  await page.addInitScript(() => {
    Object.assign(window, { modelDraws: 0 });
    const draw = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      (window as unknown as { modelDraws: number }).modelDraws++;
      draw.apply(this, args);
    };
  });
  await page.goto(`${basePath}/portfolio/jd003/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await expect(region).toBeAttached();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(requests).toEqual([]);
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
  await expect.poll(() => page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300); // Allow IntersectionObserver and one already scheduled frame to settle.
  const stopped = await page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws)).toBe(stopped);
  await region.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as unknown as { modelDraws: number }).modelDraws)).toBeGreaterThan(stopped);
  expect(requests).toHaveLength(1);
});

test("late GLB completion after navigation releases decoded image bitmaps", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const counts = { created: 0, closed: 0, wheelAttached: 0, wheelDetached: 0 };
    Object.assign(window, { bitmapCounts: counts });
    const create = window.createImageBitmap;
    window.createImageBitmap = (async (...args: unknown[]) => {
      const bitmap = await Reflect.apply(create, window, args) as ImageBitmap;
      counts.created++;
      return bitmap;
    }) as typeof create;
    const close = ImageBitmap.prototype.close;
    ImageBitmap.prototype.close = function () { counts.closed++; close.call(this); };
    const add = HTMLCanvasElement.prototype.addEventListener;
    const remove = HTMLCanvasElement.prototype.removeEventListener;
    const wheelListeners = new WeakMap<HTMLCanvasElement, Set<EventListenerOrEventListenerObject>>();
    HTMLCanvasElement.prototype.addEventListener = function (this: HTMLCanvasElement, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      if (type === "wheel" && listener) {
        const listeners = wheelListeners.get(this) ?? new Set<EventListenerOrEventListenerObject>();
        if (!listeners.has(listener)) counts.wheelAttached++;
        listeners.add(listener);
        wheelListeners.set(this, listeners);
      }
      Reflect.apply(add, this, [type, listener, options]);
    };
    HTMLCanvasElement.prototype.removeEventListener = function (this: HTMLCanvasElement, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
      // Three calls disconnect() before its initial connect(); absent removals are no-ops.
      if (type === "wheel" && listener && wheelListeners.get(this)?.delete(listener)) counts.wheelDetached++;
      Reflect.apply(remove, this, [type, listener, options]);
    };
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let requested!: () => void;
  const started = new Promise<void>((resolve) => { requested = resolve; });
  await page.route("**/images/glb/jd003_web.glb", async (route) => {
    requested();
    await pending;
    await route.continue();
  });
  await page.goto(`${basePath}/portfolio/jd003/`);
  await page.getByRole("region", { name: /3D 모델/ }).scrollIntoViewIfNeeded();
  await started;
  await page.getByRole("link", { name: "포트폴리오 목록으로 돌아가기" }).click();
  await expect(page).toHaveURL(/\/portfolio\/?$/);
  release();
  await expect.poll(() => page.evaluate(() => (window as unknown as { bitmapCounts: { created: number } }).bitmapCounts.created), { timeout: 100_000 }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => {
    const counts = (window as unknown as { bitmapCounts: { created: number; closed: number } }).bitmapCounts;
    return counts.closed === counts.created;
  }), { timeout: 20_000 }).toBe(true);
  await expect(page.locator("canvas")).toHaveCount(0);
  const listeners = await page.evaluate(() => (window as unknown as { bitmapCounts: { wheelAttached: number; wheelDetached: number } }).bitmapCounts);
  expect(listeners.wheelAttached).toBeGreaterThan(0);
  expect(listeners.wheelDetached).toBe(listeners.wheelAttached);
  expect(errors).toEqual([]);
});

test("automatic rotation, drag, zoom and reset controls remain interactive", async ({ page }, testInfo) => {
  await page.goto(`${basePath}/portfolio/jd003/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
  const rotate = region.getByRole("button", { name: /자동 회전/ });
  await expect(rotate).toHaveAttribute("aria-pressed", "true");
  await rotate.click();
  await expect(rotate).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(500); // Settle OrbitControls damping before comparing rendered pixels.
  const canvas = region.locator("canvas");
  const initial = await canvas.screenshot({ path: testInfo.outputPath("controls-initial.png") });
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const { x, y, width, height } = box!;
  const touch = testInfo.project.use.isMobile ? await page.context().newCDPSession(page) : null;
  if (touch) {
    await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x + width * 0.5, y: y + height * 0.5, id: 1 }] });
    for (let step = 1; step <= 12; step++) {
      await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + width * (0.5 + step * 0.0125), y: y + height * (0.5 + step * 0.0125), id: 1 }] });
    }
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await page.mouse.move(x + width * 0.5, y + height * 0.5);
    await page.mouse.down();
    await page.mouse.move(x + width * 0.65, y + height * 0.65, { steps: 12 });
    await page.mouse.up();
  }
  await page.waitForTimeout(500);
  const dragged = await canvas.screenshot({ path: testInfo.outputPath("controls-dragged.png") });
  expect(initial.equals(dragged)).toBe(false);
  if (touch) {
    const points = (spread: number) => [
      { x: x + width * (0.5 - spread), y: y + height * 0.5, id: 1 },
      { x: x + width * (0.5 + spread), y: y + height * 0.5, id: 2 },
    ];
    await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: points(0.1) });
    for (let step = 1; step <= 10; step++) {
      await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: points(0.1 + step * 0.015) });
    }
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await touch.detach();
  } else {
    await page.mouse.wheel(0, -200);
  }
  await page.waitForTimeout(500);
  const zoomed = await canvas.screenshot({ path: testInfo.outputPath("controls-zoomed.png") });
  expect(dragged.equals(zoomed)).toBe(false);
  await region.getByRole("button", { name: "시점 리셋" }).click();
  await page.waitForTimeout(500);
  const reset = await canvas.screenshot({ path: testInfo.outputPath("controls-reset.png") });
  expect(zoomed.equals(reset)).toBe(false);
  await expect(rotate).toHaveAttribute("aria-pressed", "false");
  await rotate.click();
  await expect(rotate).toHaveAttribute("aria-pressed", "true");
});

test("viewer toolbar stays on one line per button at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => {
    const probe = { requested: false, topFraction: -1 };
    Object.assign(window, { toolbarProbe: probe });
    const draw = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      draw.apply(this, args);
      if (!probe.requested) return;
      probe.requested = false;
      queueMicrotask(() => {
        const width = this.drawingBufferWidth, height = this.drawingBufferHeight;
        const pixels = new Uint8Array(width * height * 4);
        this.readPixels(0, 0, width, height, this.RGBA, this.UNSIGNED_BYTE, pixels);
        for (let y = height - 1; y >= 0; y -= 2) {
          for (let x = 0; x < width; x += 2) {
            if (pixels[(y * width + x) * 4 + 3] > 24) {
              probe.topFraction = (height - 1 - y) / height;
              return;
            }
          }
        }
      });
    };
  });
  await page.goto(`${basePath}/portfolio/jd006/`);
  const region = page.getByRole("region", { name: /3D 모델/ });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
  await region.getByRole("button", { name: /자동 회전/ }).click();
  await region.getByRole("button", { name: "시점 리셋" }).click();
  await page.evaluate(() => { (window as unknown as { toolbarProbe: { requested: boolean } }).toolbarProbe.requested = true; });
  const getTop = () => page.evaluate(() => (window as unknown as { toolbarProbe: { topFraction: number } }).toolbarProbe.topFraction);
  await expect.poll(getTop).toBeGreaterThan(0);
  const canvasBox = (await region.locator("canvas").boundingBox())!;
  const productTop = canvasBox.y + canvasBox.height * await getTop();
  for (const button of await region.getByRole("button").all()) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height, "toolbar must not cover actual product pixels").toBeLessThanOrEqual(productTop);
    expect(box!.height).toBeLessThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const { id, files } of modelProjects.filter((project) => project.files.length > 1)) {
  test(`${id}: multiple viewers lazy-load and keep controls and fullscreen state independent`, async ({ page }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (/\.glb(?:\?|$)/i.test(request.url())) requests.push(request.url()); });
    await page.goto(`${basePath}/portfolio/${id}/`);
    const viewers = page.getByRole("region", { name: /3D 모델$/ });
    await expect(viewers).toHaveCount(files.length);
    expect(requests).toEqual([]);
    for (let index = 0; index < files.length; index++) {
      const viewer = viewers.nth(index);
      await viewer.scrollIntoViewIfNeeded();
      await expect(viewer).toHaveAttribute("data-state", "ready", { timeout: 100_000 });
      await viewer.getByRole("button", { name: /자동 회전/ }).click();
      await expect(viewer.getByRole("button", { name: /자동 회전/ })).toHaveAttribute("aria-pressed", "false");
      for (let other = index + 1; other < files.length; other++) {
        await expect(viewers.nth(other).getByRole("button", { name: /자동 회전/ })).toHaveAttribute("aria-pressed", "true");
      }
    }
    const fullscreen = await viewers.nth(0).locator("canvas").evaluateHandle((canvas) => canvas.parentElement);
    await page.evaluate((container) => {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => container });
      document.dispatchEvent(new Event("fullscreenchange"));
    }, fullscreen);
    await expect(viewers.nth(0).getByRole("button", { name: "축소", exact: true })).toHaveAttribute("aria-pressed", "true");
    for (let index = 1; index < files.length; index++) {
      await expect(viewers.nth(index).getByRole("button", { name: "전체화면", exact: true })).toHaveAttribute("aria-pressed", "false");
    }
    await page.evaluate(() => {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => null });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    await expect(viewers.nth(0).getByRole("button", { name: "전체화면", exact: true })).toHaveAttribute("aria-pressed", "false");
    await fullscreen.dispose();
    for (let index = 0; index < files.length; index++) {
      await viewers.nth(index).scrollIntoViewIfNeeded();
      await expect(viewers.nth(index)).toHaveAttribute("data-state", "ready");
      await expect(viewers.nth(index).getByRole("button", { name: /자동 회전/ })).toHaveAttribute("aria-pressed", "false");
    }
    expect(requests.map((url) => new URL(url).pathname).sort()).toEqual(files.map((file) => `${basePath}/images/glb/${file}`).sort());
    expect(errors).toEqual([]);
  });
}

for (const { id, file, index, count } of modelCases) {
  test(`${id}/${file}: actual GLTFLoader renders nonblank model pixels`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
    // Read actual GPU output immediately after the final draw of a frame.
    // No production-only diagnostic hooks or preserveDrawingBuffer required.
    await page.addInitScript(() => {
      type Probe = { requested: boolean; draws: number; pixels: number; colors: number; width: number; height: number; edgePixels: number; spanFraction: number };
      const probe: Probe = { requested: false, draws: 0, pixels: 0, colors: 0, width: 0, height: 0, edgePixels: 0, spanFraction: 0 };
      Object.assign(window, { modelProbe: probe, modelProbeTarget: null });
      const original = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        original.apply(this, args);
        if (this.canvas !== (window as unknown as { modelProbeTarget: HTMLCanvasElement | null }).modelProbeTarget) return;
        probe.draws++;
        if (!probe.requested) return;
        // All draw calls are synchronous inside a frame; a microtask sees the completed frame.
        probe.requested = false;
        queueMicrotask(() => {
          const width = this.drawingBufferWidth;
          const height = this.drawingBufferHeight;
          const pixels = new Uint8Array(width * height * 4);
          this.readPixels(0, 0, width, height, this.RGBA, this.UNSIGNED_BYTE, pixels);
          let visible = 0;
          let edgePixels = 0;
          let minX = width, maxX = -1, minY = height, maxY = -1;
          const colors = new Set<number>();
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] > 0) {
              visible++;
              const x = (i / 4) % width;
              const y = Math.floor(i / 4 / width);
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
              if (x < 3 || x > width - 4 || y < 3 || y > height - 4) edgePixels++;
              colors.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
            }
          }
          const spanFraction = Math.max((maxX - minX + 1) / width, (maxY - minY + 1) / height);
          Object.assign(probe, { pixels: visible, colors: colors.size, width, height, edgePixels, spanFraction });
        });
      };
    });
    const assetUrl = new URL(`${basePath}/images/glb/${file}`, testInfo.project.use.baseURL).href;
    const requestedModels: string[] = [];
    page.on("request", (request) => {
      if (/\.glb(?:\?|$)/i.test(request.url())) requestedModels.push(request.url());
    });
    // Chromium's default inspector resource cache evicts responses above ~10 MB.
    // Capture the SAME loader request through a separately bounded CDP cache:
    // no extra fetch, rewritten response, interception or weaker byte assertion.
    const network = await page.context().newCDPSession(page);
    await network.send("Network.enable", {
      maxTotalBufferSize: 128 * 1024 * 1024,
      maxResourceBufferSize: 64 * 1024 * 1024,
    });
    let targetRequestId: string | undefined;
    network.on("Network.responseReceived", (event) => {
      if (event.response.url === assetUrl) targetRequestId = event.requestId;
    });
    const responseBody = new Promise<Buffer>((resolve, reject) => {
      network.on("Network.loadingFinished", (event) => {
        if (event.requestId !== targetRequestId) return;
        void network.send("Network.getResponseBody", { requestId: event.requestId }).then(
          (result) => resolve(Buffer.from(result.body, result.base64Encoded ? "base64" : "utf8")),
          reject,
        );
      });
    }).then((body) => ({ body, error: null }), (error: unknown) => ({ body: Buffer.alloc(0), error: String(error) }));
    const modelResponse = page.waitForResponse((response) => response.url() === assetUrl && response.ok());
    await page.goto(`${basePath}/portfolio/${id}/`);
    const viewers = page.getByRole("region", { name: /3D 모델$/ });
    await expect(viewers).toHaveCount(count);
    const region = viewers.nth(index);
    await region.scrollIntoViewIfNeeded();
    const response = await modelResponse;
    expect(response.url()).toBe(assetUrl);
    // The actual loader must request the supplied binary, not a rewritten model.
    const captured = await responseBody;
    expect(captured.error).toBeNull();
    expect(Buffer.compare(captured.body, fs.readFileSync(`public/images/glb/${file}`))).toBe(0);
    await network.detach();
    const canvas = region.locator("canvas");
    await expect(canvas).toBeVisible();
    await expect(region.getByText("3D 모델 데이터를 불러오는 중...")).toBeHidden({ timeout: 100_000 });
    await expect(region.getByRole("alert")).toHaveCount(0);
    await expect(region).toHaveAttribute("data-state", "ready");
    await canvas.evaluate((element) => {
      Object.assign(window, { modelProbeTarget: element });
      (window as unknown as { modelProbe: { requested: boolean } }).modelProbe.requested = true;
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { modelProbe: { pixels: number } }).modelProbe.pixels), { timeout: 20_000 }).toBeGreaterThan(500);
    const probe = await page.evaluate(() => (window as unknown as { modelProbe: object }).modelProbe);
    expect((probe as { colors: number }).colors).toBeGreaterThan(20);
    expect((probe as { edgePixels: number }).edgePixels).toBe(0);
    if (id === "jd006") {
      expect((probe as { spanFraction: number }).spanFraction).toBeGreaterThanOrEqual(0.35);
      expect((probe as { spanFraction: number }).spanFraction).toBeLessThanOrEqual(0.8);
    }
    expect(errors).toEqual([]);
    const allowedUrls = modelProjects.find((project) => project.id === id)!.files
      .map((filename) => new URL(`${basePath}/images/glb/${filename}`, testInfo.project.use.baseURL).href);
    expect(requestedModels.filter((url) => url === assetUrl)).toHaveLength(1);
    expect(requestedModels.every((url) => allowedUrls.includes(url))).toBe(true);
    expect(new Set(requestedModels).size).toBe(requestedModels.length);
    const screenshotPath = testInfo.outputPath(`${id}-${file}-rendered.png`);
    await canvas.screenshot({ path: screenshotPath });
    const evidence = JSON.stringify({ id, file, index, modelCount: count, status: "passed", assetUrl, requestedModels, originalAssetBytesVerified: true, probe, errors, warnings, screenshotPath }, null, 2);
    fs.writeFileSync(testInfo.outputPath(`${id}-${file}-result.json`), evidence);
    await testInfo.attach("render-evidence", { body: evidence, contentType: "application/json" });
    console.log(`${id} GPU evidence: ${JSON.stringify(probe)}; warnings: ${JSON.stringify(warnings)}`);
  });
}
