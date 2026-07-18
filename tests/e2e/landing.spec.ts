import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing remains reachable and accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("preparation");
  await expect(page.getByLabel("Beta invitation code")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

