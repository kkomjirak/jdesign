import { test, expect } from "@playwright/test";

test.describe("jiD design studio E2E Tests", () => {
  test("Home page loads properly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/jiD design studio/i);
    await expect(page.locator("nav")).toBeVisible();
  });

  test("Portfolio list page displays tab filters and products", async ({ page }) => {
    await page.goto("/portfolio");
    
    // Check tabs
    const allProjectsTab = page.getByRole("button", { name: /모든 프로젝트/i });
    await expect(allProjectsTab).toBeVisible();

    // Check product cards
    const productCards = page.locator("a[href^='/portfolio/jd']");
    await expect(productCards.first()).toBeVisible();
  });

  test("Portfolio detail page loads and lightbox opens on image click", async ({ page }) => {
    await page.goto("/portfolio/jd001");
    
    // Check main title
    await expect(page.locator("h1")).toBeVisible();

    // Check detail images
    const detailImage = page.locator("img[alt*='상세 이미지']").first();
    if (await detailImage.isVisible()) {
      await detailImage.click();
      // Lightbox modal should appear
      await expect(page.getByRole("button", { name: "닫기" })).toBeVisible();
      // Close lightbox
      await page.getByRole("button", { name: "닫기" }).click();
    }
  });

  test("Contact page renders contact form and location info", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "프로젝트 문의하기" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "이메일 문의" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "위치 & 운영시간" })).toBeVisible();
  });
});
