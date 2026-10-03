import { test, expect } from '@playwright/test';

test.describe('SocialBubble Smoke Test', () => {
  test('creates a bubble, navigates to tabs, and sends a message', async ({ page }) => {
    await page.goto('/');

    // Wait for the Onboarding modal and dismiss it
    const skipBtn = page.getByRole('button', { name: /Skip/i });
    await skipBtn.click();
    await expect(skipBtn).not.toBeVisible();

    // We are on / (which is the Create Bubble page), fill name and click Create Bubble to submit
    await page.getByPlaceholder('e.g. Campus Fest Block A').fill('E2E Test Bubble');
    await page.getByRole('button', { name: /Create Bubble/i }).click();

    // Verify Bubble Created screen
    await expect(page.getByRole('heading', { name: /Bubble Created/i })).toBeVisible();

    // Click "Enter Bubble"
    await page.getByRole('button', { name: /Enter Bubble/i }).click();

    // Now in the bubble (defaulting to Messages)
    await expect(page.getByRole('button', { name: /Social/i })).toBeVisible();

    // Send a message
    const messageInput = page.getByPlaceholder('Type a message...');
    await messageInput.fill('Hello from E2E test!');
    await messageInput.press('Enter');

    // Verify message appears in the list
    await expect(page.getByText('Hello from E2E test!')).toBeVisible();

    // Navigate to Album
    await page.locator('a[href="/bubble/album"]').click();
    await expect(page.getByRole('button', { name: /Add Photo/i })).toBeVisible();

    // Navigate to Files
    await page.locator('a[href="/bubble/files"]').click();
    await expect(page.getByRole('heading', { name: /Shared Files/i })).toBeVisible();

    // Navigate to Notes
    await page.locator('a[href="/bubble/notes"]').click();
    await expect(page.getByPlaceholder(/Write a note/i)).toBeVisible();

    // Navigate to Polls
    await page.locator('a[href="/bubble/polls"]').click();
    await expect(page.getByRole('button', { name: /Create Poll/i })).toBeVisible();

    // Navigate to Location
    await page.locator('a[href="/bubble/location"]').click();
    await expect(page.getByText('Location Radar')).toBeVisible();

    // Click Home to return to the dashboard
    await page.getByRole('button', { name: /Back to Dashboard/i }).click();

    // Verify we are back on the start screen
    await expect(page.getByRole('button', { name: /Create Bubble/i })).toBeVisible();
  });
});
