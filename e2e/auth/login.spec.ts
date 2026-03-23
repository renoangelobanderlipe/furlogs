import { expect, test } from '@playwright/test';

/**
 * Login flow — unauthenticated project.
 *
 * Covers: happy path, wrong credentials, empty-form validation,
 * and navigation links to register / forgot-password.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid credentials redirect to the app', async ({ page }) => {
    await page.getByLabel('Email').fill('dev@furlogs.test');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // The proxy redirects authenticated users to /pets or /dashboard.
    await expect(page).toHaveURL(/\/(pets|dashboard)/, { timeout: 15_000 });
  });

  test('wrong password shows an error message', async ({ page }) => {
    await page.getByLabel('Email').fill('dev@furlogs.test');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByText(/invalid|incorrect|credentials|provided/i),
    ).toBeVisible({ timeout: 8_000 });

    // Must stay on the login page.
    await expect(page).toHaveURL(/\/login/);
  });

  test('unknown email shows an error message', async ({ page }) => {
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByText(/invalid|incorrect|credentials|provided/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('submit with empty fields keeps focus on the email input', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Browser native validation or React Hook Form should block submission
    // and focus the first invalid field.
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();
  });

  test('submit with missing password keeps focus on the password input', async ({ page }) => {
    await page.getByLabel('Email').fill('dev@furlogs.test');
    await page.getByRole('button', { name: 'Sign in' }).click();

    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeFocused();
  });

  test('loading state is shown while submitting', async ({ page }) => {
    await page.getByLabel('Email').fill('dev@furlogs.test');
    await page.getByLabel('Password').fill('password');

    // Intercept the login API call to keep the button in loading state long
    // enough to assert on it, then let the real response through.
    await page.route('**/api/auth/login', async route => {
      await page.waitForTimeout(100);
      await route.continue();
    });

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible();
  });

  test('forgot password link navigates to /forgot-password', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/forgot-password');
  });

  test('create account link navigates to /register', async ({ page }) => {
    await page.getByRole('link', { name: 'Create one free' }).click();
    await expect(page).toHaveURL('/register');
  });
});
