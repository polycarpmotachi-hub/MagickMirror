const { test, expect } = require('@playwright/test');
const path = require('path');

const SAMPLE = path.join(__dirname, 'fixtures', 'sample.jpg');

test.describe('Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('file-input').setInputFiles(SAMPLE);
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
  });

  test('downloads a JPEG file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.jpe?g$/i);
  });

  test('downloads a PNG file when PNG is selected', async ({ page }) => {
    await page.getByTestId('format-select').selectOption('png');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/i);
  });

  test('downloads a WebP file when WebP is selected', async ({ page }) => {
    await page.getByTestId('format-select').selectOption('webp');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.webp$/i);
  });

  test('downloads grayscale image with correct extension', async ({ page }) => {
    await page.getByTestId('toggle-grayscale').click();
    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });

    await page.getByTestId('format-select').selectOption('png');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/i);
  });
});
