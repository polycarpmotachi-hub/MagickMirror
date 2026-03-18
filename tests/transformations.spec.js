const { test, expect } = require('@playwright/test');
const path = require('path');

const SAMPLE = path.join(__dirname, 'fixtures', 'sample.jpg');

async function uploadAndWait(page) {
  await page.getByTestId('file-input').setInputFiles(SAMPLE);
  await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 10000 });
  // Wait for initial transform to complete (spinner gone)
  await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
}

async function getPreviewSrc(page) {
  return page.getByTestId('preview-image').getAttribute('src');
}

test.describe('Transformations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await uploadAndWait(page);
  });

  test('brightness slider updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('slider-brightness').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '150' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('contrast slider updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('slider-contrast').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '5' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('blur slider updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('slider-blur').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '5' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('sharpen slider updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('slider-sharpen').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '3' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('rotate slider updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('slider-rotate').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '90' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('grayscale toggle updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('toggle-grayscale').click();

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('flip horizontal updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('flip-horizontal').click();

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('flip vertical updates the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('flip-vertical').click();

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('resize inputs update the preview', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('resize-width').fill('50');

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });

  test('reset button restores defaults', async ({ page }) => {
    await page.getByTestId('toggle-grayscale').click();
    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 10000 });

    await page.getByTestId('reset-btn').click();

    const brightnessValue = await page.getByTestId('slider-brightness').inputValue();
    expect(brightnessValue).toBe('100');

    const grayscaleBtn = page.getByTestId('toggle-grayscale');
    await expect(grayscaleBtn).not.toHaveClass(/active/);
  });

  test('multiple transformations chain correctly', async ({ page }) => {
    const before = await getPreviewSrc(page);

    await page.getByTestId('toggle-grayscale').click();
    await page.getByTestId('flip-horizontal').click();

    await page.getByTestId('slider-brightness').evaluate((el) => {
      Object.defineProperty(el, 'value', { writable: true, value: '130' });
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });

    await expect(page.getByTestId('loading-overlay')).toBeHidden({ timeout: 15000 });
    const after = await getPreviewSrc(page);
    expect(after).not.toBe(before);
  });
});
