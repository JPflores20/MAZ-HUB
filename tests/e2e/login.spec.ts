import { test, expect } from "@playwright/test";

test.describe("Login and Authentication Flow", () => {
  test("should show login page and allow user to type", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    
    // Check if the login form is visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Simulate user typing
    await emailInput.fill("test@maz-hub.com");
    await passwordInput.fill("password123");
    
    // We don't click submit here to avoid hitting real Firebase in E2E without mocks
    // But we check that the button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});
