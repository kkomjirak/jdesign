import { test, expect } from "@playwright/test";
import portfolioData from "../../public/images/portfolio/portfolio_data.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const featuredIds = ["jd003", "jd005_a", "jd026", "jd030"];

test("home cards show four real portfolio projects with working images", async ({ page }) => {
  await page.goto(`${basePath}/`);
  const cards = page.locator("section").filter({ has: page.locator("h2") });
  await expect(cards.locator("h2")).toHaveCount(4);
  for (const id of featuredIds) {
    const project = portfolioData.find((item) => item.id === id)!;
    await expect(cards.getByRole("heading", { name: project.title, exact: true })).toBeAttached();
    const link = cards.getByRole("link", { name: new RegExp(project.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    await expect(link).toHaveAttribute("href", `${basePath}/portfolio/${id}/`);
    await expect(link).toContainText("3D 모델 보기");
    const image = cards.getByRole("img", { name: project.title, exact: true });
    await expect(image).toHaveAttribute("src", `${basePath}${project.image}`);
    // WebKit does not fetch images far below the pinned hero until scrolled into view.
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('img[src*="_sample.jpg"]')).toHaveCount(0);
});
