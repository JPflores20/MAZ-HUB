import { test, expect } from "@playwright/test";

test("app mounts correctly", async ({ page }) => {
  // Go to default Vite dev server port, adjust if needed
  await page.goto("http://localhost:5173/");

  // Simple validation to ensure the page renders
  await expect(page.locator("body")).toBeVisible();
});
