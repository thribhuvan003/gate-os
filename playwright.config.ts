import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "mobile-320", use: { ...devices["iPhone 13 Mini"], browserName: "chromium", viewport: { width: 320, height: 700 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
