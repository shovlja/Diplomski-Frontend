import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/'); // valid origin
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('register → login → /app → logout flow', async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;
  const password = 'Test12345!';

  await page.goto('/register');
  await page.getByLabel('Username', { exact: true }).fill('e2e user');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password', { exact: true }).fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/app/);

  const token = await page.evaluate(() => window.localStorage.getItem('pmhub_token'));
  expect(token).toBeTruthy();

  await page.goto('/app');
  await expect(page.getByText('Your private app/dashboard goes here.')).toBeVisible();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
  const tokenAfter = await page.evaluate(() => window.localStorage.getItem('pmhub_token'));
  expect(tokenAfter).toBeNull();
});

test('unauthenticated user is redirected from /app to /login', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
});
