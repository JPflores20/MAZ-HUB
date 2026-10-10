import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Debería redirigir al login si no hay sesión
  await expect(page).toHaveURL(/.*login/);
  await expect(page).toHaveTitle(/MAZ HUB/i);
});
