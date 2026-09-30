import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

for (const path of ["/", "/about/", "/contact/"]) {
  test(`branded favicon and mobile icons load on ${path}`, async ({ page, request }) => {
    await page.goto(`${basePath}${path}`);
    const assets = [
      { selector: 'link[rel="icon"][type="image/png"][sizes="96x96"]', file: "icon.png", type: "image/png" },
      { selector: 'link[rel="apple-touch-icon"][sizes="180x180"]', file: "apple-icon.png", type: "image/png" },
      { selector: 'link[rel="shortcut icon"][href*="favicon.ico"]', file: "favicon.ico", type: /image\/(x-icon|vnd.microsoft.icon)/ },
    ];
    for (const asset of assets) {
      const link = page.locator(asset.selector);
      await expect(link).toHaveCount(1);
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      const url = new URL(href!, page.url());
      expect(url.pathname.startsWith(`${basePath}/`)).toBe(true);
      const response = await request.get(url.href);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(asset.type);
      expect(await response.body()).toEqual(readFileSync(resolve("src/app", asset.file)));
    }
  });
}
