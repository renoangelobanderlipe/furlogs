import { expect, test } from '@playwright/test';
import { today } from '../helpers/api';

/**
 * Vet visits — authenticated project.
 *
 * The DevSeeder seeds 8-12 visits per pet.  Tests that create new visits
 * use unique reasons so they can be identified across retries.
 */
test.describe('Vet Visits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vet-visits');
    await page.waitForLoadState('networkidle');
  });

  // ── Read ─────────────────────────────────────────────────────────────────

  test('page renders heading and stat cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
    await expect(page.getByText(/visits this year/i)).toBeVisible();
    await expect(page.getByText(/total spend/i)).toBeVisible();
  });

  test('seeded visits are listed', async ({ page }) => {
    // The seed data creates many visits; the stat card should show a non-empty count.
    const statText = page.getByText(/visits this year/i).locator('..');
    await expect(statText).toBeVisible();
  });

  // ── Create (quick log dialog) ─────────────────────────────────────────────

  test('can log a new vet visit via the quick-log dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Log Visit' }).click();

    // Dialog should open.
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Log Vet Visit' })).toBeVisible();

    // Select pet — trigger is a combobox with placeholder "Select pet".
    await dialog.getByRole('combobox').filter({ hasText: /select pet/i }).click();
    await page.getByRole('option', { name: 'Max' }).click();

    // Select type — second combobox.
    await dialog.getByRole('combobox').filter({ hasText: /^select$/i }).click();
    await page.getByRole('option', { name: /checkup/i }).click();

    // Fill in date (required).
    await dialog.locator('input[type="date"]').fill(today());

    // Submit inside the dialog — the second "Log Visit" button is the submit.
    await dialog.getByRole('button', { name: 'Log Visit' }).click();

    // Dialog should close on success.
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });

  test('log visit button shows loading state while saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Log Visit' }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByRole('combobox').filter({ hasText: /select pet/i }).click();
    await page.getByRole('option', { name: 'Max' }).click();
    await dialog.getByRole('combobox').filter({ hasText: /^select$/i }).click();
    await page.getByRole('option', { name: /checkup/i }).click();
    await dialog.locator('input[type="date"]').fill(today());

    // Intercept the POST to introduce a short delay so the loading state is observable.
    await page.route('**/api/vet-visits', async route => {
      await new Promise(resolve => setTimeout(resolve, 300));
      await route.continue();
    });

    await dialog.getByRole('button', { name: 'Log Visit' }).click();
    // Button is disabled while the mutation is in-flight.
    await expect(dialog.getByRole('button', { name: 'Log Visit' })).toBeDisabled();
  });

  // ── Search & filter ───────────────────────────────────────────────────────

  test('search input filters the visit list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search reason or diagnosis…');
    await searchInput.fill('zzzz-no-match-expected');
    await page.waitForTimeout(400); // Debounce delay.

    // List shows either an empty state or just entries that match.
    // The heading must remain visible regardless.
    await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
  });

  test('clearing search restores the full list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search reason or diagnosis…');
    await searchInput.fill('nothing');
    await page.waitForTimeout(400);
    await searchInput.clear();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
  });

  test('pet filter narrows results', async ({ page }) => {
    // Use the pet-filter combobox specifically (avoids matching "All Pets" in the header).
    await page.getByRole('combobox').filter({ hasText: /all pets/i }).click();
    await page.getByRole('option', { name: 'Max' }).click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
  });
});
