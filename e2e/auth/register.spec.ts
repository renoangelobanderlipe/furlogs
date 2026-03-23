import { expect, test } from '@playwright/test';

/**
 * Registration flow — unauthenticated project.
 *
 * Covers: happy path (redirects to email verification), duplicate-email
 * error, password-confirmation mismatch, and navigation links.
 *
 * NOTE: Because the E2E database is reset once per run, tests that create
 * new users must use unique email addresses.  We append a timestamp to
 * guarantee uniqueness even across quick re-runs on the same DB snapshot.
 */
// A unique-enough password to avoid HaveIBeenPwned rejection (->uncompromised() rule).
const E2E_PASSWORD = 'FurL0g$E2eSpec!';

test.describe('Register', () => {
  let uniqueEmail: string;

  test.beforeEach(async ({ page }) => {
    // Fresh email per test so there are no duplicate-key conflicts.
    uniqueEmail = `e2e+${Date.now()}@example.com`;
    await page.goto('/register');
  });

  test('valid registration redirects to email verification page', async ({ page }) => {
    await page.getByLabel('Full name').fill('E2E Tester');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel('Confirm password').fill(E2E_PASSWORD);

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/verify-email', { timeout: 15_000 });
  });

  test('loading state is shown while submitting', async ({ page }) => {
    await page.getByLabel('Full name').fill('E2E Tester');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel('Confirm password').fill(E2E_PASSWORD);

    await page.route('**/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible();
  });

  test('duplicate email shows an error', async ({ page }) => {
    // dev@furlogs.test is created by the DevSeeder on every run.
    await page.getByLabel('Full name').fill('Duplicate User');
    await page.getByLabel('Email').fill('dev@furlogs.test');
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel('Confirm password').fill(E2E_PASSWORD);

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByText(/already.*exists|already.*taken|already.*registered|in use/i),
    ).toBeVisible({ timeout: 8_000 });

    await expect(page).toHaveURL('/register');
  });

  test('password confirmation mismatch shows an error', async ({ page }) => {
    await page.getByLabel('Full name').fill('E2E Tester');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel('Confirm password').fill('DifferentPass2!');

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByText(/do not match|confirmation|must match/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('sign in link navigates to /login', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');
  });
});
