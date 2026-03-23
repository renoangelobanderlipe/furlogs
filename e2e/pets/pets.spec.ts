import { expect, test } from '@playwright/test';

/**
 * Pet management — authenticated project.
 *
 * The DevSeeder creates 4 pets (Max, Luna, Bella, Milo) in the dev household.
 * Tests that mutate data (create/delete) use unique names to avoid
 * flakiness when retrying.
 */
test.describe('Pets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pets');
    // Wait for the pet list to be hydrated before interacting.
    await page.waitForLoadState('networkidle');
  });

  // ── Read ─────────────────────────────────────────────────────────────────

  test('pets list shows all seeded pets', async ({ page }) => {
    // Pet names appear as h3 headings inside the pet cards.
    await expect(page.getByRole('heading', { name: 'Max', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Luna', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bella', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Milo', level: 3 })).toBeVisible();
  });

  // ── Create ───────────────────────────────────────────────────────────────

  test('can create a new pet and it appears in the list', async ({ page }) => {
    const petName = `E2E-Dog-${Date.now()}`;

    // Open the add-pet dialog.
    await page.getByRole('button', { name: /add pet/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Name — label has no htmlFor; use placeholder instead.
    await dialog.getByPlaceholder(/biscuit/i).fill(petName);

    // Species — first combobox in the dialog form.
    await dialog.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: /dog/i }).click();

    // Sex — second combobox in the dialog form.
    await dialog.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /^male$/i }).click();

    await dialog.getByRole('button', { name: 'Add Pet' }).click();

    // Dialog should close and new pet should appear as an h3 heading.
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: petName, level: 3 })).toBeVisible({ timeout: 10_000 });
  });

  test('pet form shows a loading state while saving', async ({ page }) => {
    await page.getByRole('button', { name: /add pet/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByPlaceholder(/biscuit/i).fill('Loading Test Pet');
    await dialog.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: /cat/i }).click();
    await dialog.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /female/i }).click();

    await dialog.getByRole('button', { name: 'Add Pet' }).click();
    // Button is disabled while the mutation is in-flight.
    await expect(dialog.getByRole('button', { name: 'Add Pet' })).toBeDisabled();
  });

  // ── Detail ───────────────────────────────────────────────────────────────

  test('clicking a pet card navigates to the pet detail page', async ({ page }) => {
    // Click the Max pet card link; pet names are in h3 headings.
    await page.getByRole('heading', { name: 'Max', level: 3 }).click();

    await expect(page).toHaveURL(/\/pets\/[0-9a-f-]+/, { timeout: 10_000 });
    // The pet name should be prominent on the detail page (h1).
    await expect(page.getByRole('heading', { name: 'Max', level: 1 })).toBeVisible();
  });

  test('pet detail page shows key stat cards', async ({ page }) => {
    await page.getByRole('heading', { name: 'Max', level: 3 }).click();
    await page.waitForLoadState('networkidle');

    // The detail page renders Age, Weight, and Vet Visits stat cards.
    await expect(page.getByText(/^age$/i).first()).toBeVisible();
    await expect(page.getByText(/^weight$/i).first()).toBeVisible();
    await expect(page.getByText(/^vet visits$/i).first()).toBeVisible();
  });

  // ── Delete ───────────────────────────────────────────────────────────────

  test('can delete a newly created pet', async ({ page }) => {
    const petName = `E2E-Delete-${Date.now()}`;

    // Create a throwaway pet.
    await page.getByRole('button', { name: /add pet/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder(/biscuit/i).fill(petName);
    await dialog.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: /cat/i }).click();
    await dialog.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /female/i }).click();
    await dialog.getByRole('button', { name: 'Add Pet' }).click();
    await expect(page.getByRole('heading', { name: petName, level: 3 })).toBeVisible({ timeout: 10_000 });

    // Navigate to pet detail.
    await page.getByRole('heading', { name: petName, level: 3 }).click();
    await page.waitForLoadState('networkidle');

    // Trigger the "Remove" button on the detail page.
    await page.getByRole('button', { name: /^remove$/i }).click();

    // Confirm in the AlertDialog.
    await page.getByRole('button', { name: /remove pet/i }).click();

    // Should redirect back to the pets list after deletion.
    await expect(page).toHaveURL('/pets', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: petName, level: 3 })).not.toBeVisible();
  });
});
