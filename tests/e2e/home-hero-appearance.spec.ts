import { test, expect } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

for (const width of [320, 390, 430, 600, 767, 768, 1440]) {
  test(`hero headline is bottom-centered with a quiet corner icon (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
    const hero = page.getByRole("region", { name: "JiD 소개 영상" });
    const title = hero.getByRole("heading", { name: "Turning imagination into reality", exact: true });
    await expect(title).toBeVisible();
    const button = hero.getByRole("button", { name: "영상 재생", exact: true });
    await expect(button).toHaveText("");
    await expect(button.locator("svg")).toBeVisible();
    const [h, t, b] = await Promise.all([hero.boundingBox(), title.boundingBox(), button.boundingBox()]);
    expect(h && t && b).toBeTruthy();
    expect(Math.abs(t!.x + t!.width / 2 - h!.x - h!.width / 2)).toBeLessThanOrEqual(1);
    const bottomInset = h!.y + h!.height - t!.y - t!.height;
    expect(bottomInset).toBeLessThanOrEqual(width < 768 ? 24 : 112);
    expect(bottomInset).toBeGreaterThanOrEqual(width < 768 ? 16 : 0);
    const rightInset = h!.x + h!.width - b!.x - b!.width;
    const controlBottomInset = h!.y + h!.height - b!.y - b!.height;
    expect(rightInset).toBeGreaterThanOrEqual(0);
    expect(rightInset).toBeLessThanOrEqual(32);
    expect(controlBottomInset).toBeGreaterThanOrEqual(0);
    expect(controlBottomInset).toBeLessThanOrEqual(24);
    const overlaps = t!.x < b!.x + b!.width && t!.x + t!.width > b!.x
      && t!.y < b!.y + b!.height && t!.y + t!.height > b!.y;
    expect(overlaps).toBe(false);
    expect(b!.width).toBeGreaterThanOrEqual(44);
    expect(b!.height).toBeGreaterThanOrEqual(44);
    const appearance = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, background: s.backgroundColor, border: s.borderTopWidth, opacity: s.opacity };
    });
    expect(appearance).toEqual({ color: "rgb(255, 255, 255)", background: "rgba(0, 0, 0, 0)", border: "0px", opacity: "0.65" });
    const icon = await button.locator("svg").boundingBox();
    expect(icon?.width).toBe(18);
    expect(icon?.height).toBe(18);
    if (width < 768) {
      expect(Math.abs(icon!.y + icon!.height / 2 - t!.y - t!.height / 2)).toBeLessThanOrEqual(1);
      const fontSize = await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(18);
      expect(fontSize).toBeLessThanOrEqual(20);
    }
    expect(await title.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    expect(await title.locator("strong").allTextContents()).toEqual(["imagination", "reality"]);
    const weights = await title.evaluate((el) => ({ normal: Number(getComputedStyle(el).fontWeight), bold: Number(getComputedStyle(el.querySelector("strong")!).fontWeight) }));
    expect(weights.bold).toBeGreaterThan(weights.normal);
    await button.focus();
    expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await button.evaluate((el: HTMLButtonElement) => el.blur());
    await hero.screenshot({ path: testInfo.outputPath(`hero-refined-${width}.png`) });
  });
}

test("mobile title and icon stay aligned when the fallback status appears", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
  const hero = page.getByRole("region", { name: "JiD 소개 영상" });
  // Native media can decode before React installs its effects on a slow
  // connection. Prove the controls are interactive before dispatching an error.
  const playButton = hero.getByRole("button", { name: "영상 재생", exact: true });
  await playButton.click();
  const pauseButton = hero.getByRole("button", { name: "영상 일시 정지", exact: true });
  await expect(pauseButton).toBeVisible();
  await pauseButton.click();
  await expect(playButton).toBeVisible();
  await expect.poll(() => hero.locator("video").evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  await hero.locator("video").dispatchEvent("error");
  await expect(hero.getByRole("status")).toBeVisible();
  const button = hero.getByRole("button", { name: "영상 재생", exact: true });
  await expect(button).toBeDisabled();
  const [title, icon] = await Promise.all([hero.getByRole("heading").boundingBox(), button.locator("svg").boundingBox()]);
  expect(title && icon).toBeTruthy();
  expect(Math.abs(icon!.y + icon!.height / 2 - title!.y - title!.height / 2)).toBeLessThanOrEqual(1);
});

test("mobile slogan leaves only a small bottom inset", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
  const hero = page.getByRole("region", { name: /소개 영상$/ });
  const [h, title] = await Promise.all([hero.boundingBox(), hero.getByRole("heading").boundingBox()]);
  expect(h && title).toBeTruthy();
  const inset = h!.y + h!.height - title!.y - title!.height;
  expect(inset).toBeGreaterThanOrEqual(16);
  expect(inset).toBeLessThanOrEqual(24);
});
