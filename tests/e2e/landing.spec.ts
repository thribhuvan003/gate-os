import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing remains reachable and accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("preparation");
  await expect(page.getByLabel("Invitation code")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("workspace navigation remains reachable without page overflow", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Good|quiet/i);
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  const workspaceNav = page.locator('nav[aria-label="Workspace"]:visible');
  await expect(workspaceNav.getByRole("link", { name: "Settings" })).toBeAttached();
  await workspaceNav.getByRole("link", { name: "Focus" }).click();
  await expect(page.getByRole("heading", { name: /Make the next block matter/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Begin focus/i })).toBeVisible();
});
