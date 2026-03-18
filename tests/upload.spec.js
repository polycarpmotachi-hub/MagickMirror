const { test, expect } = require('@playwright/test');
const path = require('path');

const SAMPLE = path.join(__dirname, 'fixtures', 'sample.jpg');

test.describe('Upload flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the uploader dropzone on load', async ({ page }) => {
    await expect(page.getByTestId('dropzone')).toBeVisible();
    await expect(page.getByTestId('choose-file-btn')).toBeVisible();
  });

  test('toolbar is disabled before upload', async ({ page }) => {
    const toolbar = page.getByTestId('toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveClass(/disabled/);
  });

  test('download button is disabled before upload', async ({ page }) => {
    await expect(page.getByTestId('download-btn')).toBeDisabled();
  });

  test('uploads an image and shows it in the canvas', async ({ page }) => {
    await page.getByTestId('file-input').setInputFiles(SAMPLE);

    // Canvas should appear with the preview image
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('preview-image')).toBeVisible();
  });

  test('toolbar becomes enabled after upload', async ({ page }) => {
    await page.getByTestId('file-input').setInputFiles(SAMPLE);
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });

    const toolbar = page.getByTestId('toolbar');
    await expect(toolbar).not.toHaveClass(/disabled/);
  });

  test('download button becomes enabled after upload', async ({ page }) => {
    await page.getByTestId('file-input').setInputFiles(SAMPLE);
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('download-btn')).toBeEnabled({ timeout: 10000 });
  });

  test('uploading a second image resets transforms', async ({ page }) => {
    await page.getByTestId('file-input').setInputFiles(SAMPLE);
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });

    // Change brightness
    await page.getByTestId('slider-brightness').evaluate((el) => {
      el.value = 150;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Upload again
    await page.getByTestId('file-input').setInputFiles(SAMPLE);
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });

    // Brightness should be reset to 100
    const brightnessValue = await page.getByTestId('slider-brightness').inputValue();
    expect(brightnessValue).toBe('100');
  });
});
