import { test, expect } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

test("footer centers the JiD copyright and removes social links", async ({ page }, testInfo) => {
  await page.goto(`${basePath}/`, { waitUntil: "domcontentloaded" });
  const footer = page.getByRole("contentinfo");
  for (const name of ["Behance", "Dribbble", "LinkedIn", "Instagram"]) {
    await expect(footer.getByRole("link", { name, exact: true })).toHaveCount(0);
  }
  const copyright = footer.getByText(/^Copyright © \d{4} JiD\. All rights reserved\.$/);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await footer.scrollIntoViewIfNeeded();
    await expect(copyright).toBeVisible();
    await expect.poll(async () => {
      const [f, c] = await Promise.all([footer.boundingBox(), copyright.boundingBox()]);
      return !!f && !!c && Math.abs(c.x + c.width / 2 - f.x - f.width / 2) <= 1;
    }).toBe(true);
    expect(await copyright.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    for (const name of ["About Us", "Portfolio", "Contact"]) {
      await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(footer.getByRole("button", { name: "페이지 맨 위로 이동" })).toBeVisible();
    await footer.screenshot({ path: testInfo.outputPath(`footer-JiD-${width}.png`) });
  }
});
