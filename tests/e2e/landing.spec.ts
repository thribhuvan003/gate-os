import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing remains reachable and accessible", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(750);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("preparation");
  await expect(page.getByLabel("Invitation code")).toBeVisible();
  const focusPreview = page.getByRole("button", { name: "Start focus preview" });
  await focusPreview.click();
  await expect(page.getByRole("button", { name: "Preview focus paused" })).toHaveAttribute("aria-pressed", "true");
  const syllabusPreview = page.getByRole("button", { name: /Mark Trees and heaps complete/i });
  await syllabusPreview.click();
  await expect(page.getByRole("button", { name: /Mark Trees and heaps incomplete/i })).toHaveAttribute("aria-pressed", "true");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("private workspace redirects safely to login without page overflow", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\?next=%2Fapp$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome in.");
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use email instead" })).toBeVisible();
});
