import { expect, test } from '@playwright/test';

/**
 * Smoke tests — unauthenticated project.
 *
 * Verifies that the app is reachable and public pages render without errors.
 * These run before every CI build as the fastest possible sanity check.
 */
test.describe('Smoke', () => {
  test('root path is reachable', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('login page renders all interactive elements', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create one free' })).toBeVisible();
  });

  test('register page renders all interactive elements', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('unauthenticated access to a protected route redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('unauthenticated access to /pets redirects to /login', async ({ page }) => {
    await page.goto('/pets');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('no JavaScript errors on login page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    expect(errors, `Unexpected JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });
});
