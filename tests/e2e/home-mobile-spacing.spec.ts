import { test, expect } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

for (const motion of ["no-preference", "reduce"] as const) {
  test(`mobile product flows into the next projects without a blank tail (${motion})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
    for (const viewport of [{ width: 390, height: 844 }, { width: 390, height: 1100 }, { width: 320, height: 568 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      const hero = page.locator("main section").first();
      const image = hero.getByRole("img", { name: "필로포스-검안기 제품 이미지" });
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let lastRow = canvas.height - 1;
        while (lastRow >= 0) {
          let visible = false;
          for (let x = 0; x < canvas.width; x++) if (data[(lastRow * canvas.width + x) * 4 + 3] > 0) { visible = true; break; }
          if (visible) break;
          lastRow--;
        }
        const box = img.getBoundingClientRect();
        const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
        const productBottom = box.top + (lastRow + 1) * scale;
        const projects = document.querySelector('section[aria-label="3D 모델이 있는 대표 프로젝트"]')!.getBoundingClientRect();
        return projects.top - productBottom;
      })).toBeLessThanOrEqual(80);
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
      await page.evaluate(() => {
        const hero = document.querySelector("main section")!;
        window.scrollTo(0, Math.max(0, hero.getBoundingClientRect().bottom + window.scrollY - innerHeight * 0.7));
      });
      await expect.poll(() => page.evaluate(() => {
        const hero = document.querySelector("main section")!.getBoundingClientRect();
        const cards = document.querySelector('section[aria-label="3D 모델이 있는 대표 프로젝트"]')!.getBoundingClientRect();
        return cards.top - hero.bottom;
      })).toBeGreaterThanOrEqual(-1);
      const firstCard = page.getByRole("region", { name: "3D 모델이 있는 대표 프로젝트" }).getByRole("link").first();
      await expect.poll(() => firstCard.evaluate((card) => {
        const hero = document.querySelector("main section")!;
        window.scrollTo(0, Math.max(0, hero.getBoundingClientRect().bottom + window.scrollY - innerHeight * 0.5));
        return Number(getComputedStyle(card).opacity);
      })).toBe(1);
      await page.screenshot({ path: testInfo.outputPath(`mobile-tail-${viewport.width}x${viewport.height}-${motion}.png`) });
    }
  });
}
