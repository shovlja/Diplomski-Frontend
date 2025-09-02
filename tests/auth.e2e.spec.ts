// tests/auth.e2e.spec.ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("register → login → /app → logout flow", async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;
  const password = "Test12345!";

  // REGISTER
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill("e2e user");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#confirm_password").fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\b/);

  // LOGIN
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\b/);

  // umesto teksta, tražimo Logout dugme – stabilniji selektor
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // token postoji
  const token = await page.evaluate(() => localStorage.getItem("pmhub_token"));
  expect(token).toBeTruthy();

  // LOGOUT
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login\b/);

  // token uklonjen
  const tokenAfter = await page.evaluate(() => localStorage.getItem("pmhub_token"));
  expect(tokenAfter).toBeNull();
});

test("unauthenticated user is redirected from /app to /login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\b/);
});
