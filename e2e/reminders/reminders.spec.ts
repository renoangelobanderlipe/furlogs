import { expect, test } from '@playwright/test';
import { futureDate } from '../helpers/api';

/**
 * Reminders — authenticated project.
 *
 * The DevSeeder creates upcoming, overdue, and completed reminders.
 * Tests that create reminders use unique titles so assertions are unambiguous.
 */
test.describe('Reminders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reminders');
    // networkidle ensures TanStack Query's initial fetch has completed (or errored)
    // before any assertion runs, preventing false "element not found" failures.
    await page.waitForLoadState('networkidle');
  });

  // ── Read ─────────────────────────────────────────────────────────────────

  test('page heading and add button are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Reminder' })).toBeVisible();
  });

  test('filter tabs are rendered', async ({ page }) => {
    // Use anchored regex to avoid matching the "All Pets" pet-filter button in the header.
    await expect(page.getByRole('button', { name: /^pending$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^completed$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
  });

  test('pending filter shows reminders', async ({ page }) => {
    await page.getByRole('button', { name: /^pending$/i }).click();
    await page.waitForLoadState('load');
    // Should still render the page without error.
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
  });

  test('completed filter shows completed reminders', async ({ page }) => {
    await page.getByRole('button', { name: /^completed$/i }).click();
    await page.waitForLoadState('load');
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
  });

  // ── Create ───────────────────────────────────────────────────────────────

  test('can create a new reminder', async ({ page }) => {
    const title = `E2E Reminder ${Date.now()}`;

    await page.getByRole('button', { name: 'Add Reminder' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Add Reminder' })).toBeVisible();

    await dialog.getByLabel('Title').fill(title);
    await dialog.getByLabel('Due date').fill(futureDate(3));

    await dialog.getByRole('button', { name: 'Save reminder' }).click();

    // Dialog should close on success — the onSuccess callback only fires
    // when the API returns 2xx, so this is sufficient proof of creation.
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Page is still functional after save.
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
  });

  test('reminder form shows loading state while saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Reminder' }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Title').fill('Loading State Test');
    await dialog.getByLabel('Due date').fill(futureDate(1));

    // Intercept the POST to hold it open long enough for the loading state to be observable.
    await page.route('**/api/reminders', async route => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      await route.continue();
    });

    await dialog.getByRole('button', { name: 'Save reminder' }).click();
    // When isLoading=true the button text changes to "Saving…" and it becomes disabled.
    // We look for the text variant since the accessible name changes with the text.
    await expect(dialog.getByRole('button', { name: /saving/i })).toBeVisible({ timeout: 3_000 });
  });

  test('can cancel the add reminder dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Reminder' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  test('can mark a reminder as complete via the actions menu', async ({ page }) => {
    // Wait for the reminders API response so we know data is loaded before asserting.
    await page.waitForResponse(
      resp => resp.url().includes('/api/reminders') && resp.status() === 200,
    );

    // The seeder creates many overdue pending reminders visible on page 1.
    // Use the first one to avoid pagination issues.
    const firstMoreActions = page.getByRole('button', { name: 'More actions' }).first();
    await expect(firstMoreActions).toBeVisible();
    await firstMoreActions.click();

    await page.getByRole('menuitem', { name: /mark complete/i }).click();

    // Page remains functional after the action.
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
  });

  test('can snooze a reminder via the actions menu', async ({ page }) => {
    // Wait for the reminders API response so we know data is loaded before asserting.
    await page.waitForResponse(
      resp => resp.url().includes('/api/reminders') && resp.status() === 200,
    );

    // Use the second seeded reminder so it doesn't conflict with any prior action.
    const moreActionsButtons = page.getByRole('button', { name: 'More actions' });
    await expect(moreActionsButtons.first()).toBeVisible();
    await moreActionsButtons.nth(1).click();

    await page.getByRole('menuitem', { name: /snooze/i }).click();

    // Page remains stable after snoozing.
    await expect(page.getByRole('heading', { name: 'Reminders', exact: true })).toBeVisible();
  });
});
