import { defineConfig, devices } from "@playwright/test";
import existingConfig from "../../playwright.config";

const launchOptions = { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] };

// Expensive real-WebGL tests run serially, including genuine touch gestures.
export default defineConfig({
  ...existingConfig,
  testDir: ".",
  testMatch: "model-viewer.spec.ts",
  testIgnore: [],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  retries: 0,
  outputDir: process.env.MODEL_TEST_OUTPUT_DIR ?? "../../test-results/model-viewer",
  reporter: "list",
  use: {
    ...existingConfig.use,
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "webgl-chromium", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "webgl-mobile-chromium", use: { ...devices["Pixel 5"], deviceScaleFactor: 2, launchOptions } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: "npm run dev", reuseExistingServer: true, url: "http://127.0.0.1:3000", timeout: 120_000,
  },
});
