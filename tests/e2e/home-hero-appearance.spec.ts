import { test, expect } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

for (const width of [320, 390, 768, 1440]) {
  test(`hero headline is bottom-centered with a quiet corner icon (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
    const hero = page.getByRole("region", { name: "JID 소개 영상" });
    const title = hero.getByRole("heading", { name: "JID. Turning imagination into reality", exact: true });
    await expect(title).toBeVisible();
    const button = hero.getByRole("button", { name: "영상 재생", exact: true });
    await expect(button).toHaveText("");
    await expect(button.locator("svg")).toBeVisible();
    const [h, t, b] = await Promise.all([hero.boundingBox(), title.boundingBox(), button.boundingBox()]);
    expect(h && t && b).toBeTruthy();
    expect(Math.abs(t!.x + t!.width / 2 - h!.x - h!.width / 2)).toBeLessThanOrEqual(1);
    expect(h!.y + h!.height - t!.y - t!.height).toBeLessThanOrEqual(112);
    expect(h!.x + h!.width - b!.x - b!.width).toBeLessThanOrEqual(32);
    expect(h!.y + h!.height - b!.y - b!.height).toBeLessThanOrEqual(24);
    expect(t!.y + t!.height).toBeLessThanOrEqual(b!.y);
    expect(b!.width).toBeGreaterThanOrEqual(44);
    expect(b!.height).toBeGreaterThanOrEqual(44);
    const appearance = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, background: s.backgroundColor, border: s.borderTopWidth };
    });
    expect(appearance).toEqual({ color: "rgb(255, 255, 255)", background: "rgba(0, 0, 0, 0)", border: "0px" });
    expect(await title.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    expect(await title.locator("strong").allTextContents()).toEqual(["imagination", "reality"]);
    const weights = await title.evaluate((el) => ({ normal: Number(getComputedStyle(el).fontWeight), bold: Number(getComputedStyle(el.querySelector("strong")!).fontWeight) }));
    expect(weights.bold).toBeGreaterThan(weights.normal);
    if (width < 768) expect(await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(24);
    await button.focus();
    expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await button.evaluate((el: HTMLButtonElement) => el.blur());
    await hero.screenshot({ path: testInfo.outputPath(`hero-refined-${width}.png`) });
  });
}
