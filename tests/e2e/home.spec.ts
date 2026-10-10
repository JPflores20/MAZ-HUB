import { test, expect } from "@playwright/test";

test("app mounts correctly", async ({ page }) => {
  // Go to default Vite dev server port, adjust if needed
  await page.goto("/");

  // Simple validation to ensure the page renders
  await expect(page.locator("body")).toBeVisible();
});
