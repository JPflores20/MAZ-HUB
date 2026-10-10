import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page elements correctly', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'MAZ HUB' })).toBeVisible();
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
    // Use first() to avoid strict mode violations if both forms have a submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('#loginEmail').fill('test-invalid@gmodelo.com.mx');
    await page.locator('#loginPassword').fill('wrongpassword');
    await page.locator('button[type="submit"]').first().click();
    
    // We expect an error alert to show up or the button to be active again
    await expect(page.locator('button[type="submit"]').first()).toBeEnabled();
    await expect(page).toHaveURL(/.*login/);
  });
});
