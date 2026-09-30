import { test, expect } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const modelIds = ["jd001", "jd003", "jd005_a", "jd005_b", "jd006", "jd026", "jd030"];

for (const id of modelIds) {
  test(`${id}: 3D viewer omits the format caption but keeps its accessible name and controls`, async ({ page }) => {
    await page.goto(`${basePath}/portfolio/${id}/`);
    const viewer = page.getByRole("region", { name: /.+ 3D 모델$/ });
    await expect(viewer).toHaveCount(1);
    await expect(viewer).not.toContainText("• GLB");
    await expect(viewer.getByRole("heading", { name: "3D 모델링 뷰어", exact: true })).toHaveCount(1);
    await expect(viewer.getByRole("button", { name: /자동 회전/ })).toHaveCount(1);
    await expect(viewer.getByRole("button", { name: "시점 리셋", exact: true })).toHaveCount(1);
    await expect(viewer.getByRole("button", { name: "전체화면", exact: true })).toHaveCount(1);
  });
}
