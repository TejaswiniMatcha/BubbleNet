import { test, expect } from '@playwright/test';

test.describe('SOS Mode Test', () => {
  test('triggers SOS mode and verifies UI changes', async ({ page }) => {
    await page.goto('/');

    // Wait for the Onboarding modal and dismiss it
    const skipBtn = page.getByRole('button', { name: /Skip/i });
    if (await skipBtn.isVisible()) {
        await skipBtn.click();
        await expect(skipBtn).not.toBeVisible();
    }

    // Fill name and create a bubble
    await page.getByPlaceholder('e.g. Campus Fest Block A').fill('Emergency Bubble');
    await page.getByRole('button', { name: /Create Bubble/i }).click();

    // Verify Bubble Created screen
    await expect(page.getByRole('heading', { name: /Bubble Created/i })).toBeVisible();
    
    // Click "Enter Bubble"
    await page.getByRole('button', { name: /Enter Bubble/i }).click();

    // Check we are in Social mode
    await expect(page.getByRole('button', { name: /Social/i })).toBeVisible();

    // Switch to SOS Mode
    await page.getByRole('button', { name: /SOS/i }).click();

    // Verify SOS warning/modal appears
    const confirmSOSBtn = page.getByRole('button', { name: /Activate SOS/i });
    if (await confirmSOSBtn.isVisible()) {
        await confirmSOSBtn.click();
    }

    // Verify the SOS button is now active (aria-pressed="true")
    const sosBtn = page.getByRole('button', { name: /SOS/i });
    await expect(sosBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
