import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const imagePath = "/images/home/philophos-optometry.png";
const tagline = "편안한 검안 경험을 위한 정제된 디자인.";

test("hero uses the supplied Philophos image and project copy instead of placeholders", async ({ page, request }) => {
  await page.goto(`${basePath}/`);
  const hero = page.locator("main section").first();
  await expect(hero.getByRole("heading", { name: "필로포스-검안기", exact: true })).toBeVisible();
  await expect(hero.getByText(tagline, { exact: true })).toBeVisible();
  await expect(hero).not.toContainText(/iPhone 15 Pro|티타늄|Product Media Area|Video \/ Image Placeholder/);
  const image = hero.getByRole("img", { name: "필로포스-검안기 제품 이미지", exact: true });
  await expect(image).toHaveAttribute("src", `${basePath}${imagePath}`);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 732 && img.naturalHeight === 1019)).toBe(true);
  const response = await request.get(`${basePath}${imagePath}`);
  expect(response.status()).toBe(200);
  expect(await response.body()).toEqual(fs.readFileSync(path.join(process.cwd(), "public", imagePath)));
  expect(await image.evaluate((img) => getComputedStyle(img).objectFit)).toBe("contain");
});

for (const motion of ["no-preference", "reduce"] as const) {
  test(`hero image stays fully within the hero and clear of text with ${motion} motion`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto(`${basePath}/`);
    const hero = page.locator("main section").first();
    const image = hero.getByRole("img", { name: "필로포스-검안기 제품 이미지", exact: true });
    const copy = hero.getByText(tagline, { exact: true });
    await expect(image).toBeVisible();
    await expect(page.locator(".pin-spacer")).toHaveCount(motion === "reduce" ? 0 : 1);
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }, { width: 320, height: 568 }, { width: 390, height: 1100 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(async () => {
        const [heroBox, imageBox, copyBox] = await Promise.all([hero.boundingBox(), image.boundingBox(), copy.boundingBox()]);
        if (!heroBox || !imageBox || !copyBox) return false;
        return imageBox.y >= copyBox.y + copyBox.height - 1
          && imageBox.y + imageBox.height <= heroBox.y + heroBox.height + 1
          && imageBox.x >= heroBox.x - 1
          && imageBox.x + imageBox.width <= heroBox.x + heroBox.width + 1;
      }).toBe(true);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      // Measure the visible alpha bounds, not the full object-contain box:
      // the source has transparent padding and can be letterboxed on tall phones.
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => {
        if (!img.complete || !img.naturalWidth) return Infinity;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let firstRow = 0;
        while (firstRow < canvas.height && !Array.from({ length: canvas.width }, (_, x) => pixels[(firstRow * canvas.width + x) * 4 + 3]).some((alpha) => alpha > 0)) firstRow++;
        const box = img.getBoundingClientRect();
        const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
        const position = getComputedStyle(img).objectPosition.split(" ")[1];
        const letterbox = (box.height - img.naturalHeight * scale) * (position === "0%" || position === "top" ? 0 : 0.5);
        const copy = img.closest("section")!.querySelector("p")!.getBoundingClientRect();
        return box.top + letterbox + firstRow * scale - copy.bottom;
      })).toBeLessThanOrEqual(viewport.width < 768 ? 64 : 80);
      await hero.screenshot({ path: testInfo.outputPath(`hero-${viewport.width}x${viewport.height}-${motion}.png`) });
    }
  });
}
