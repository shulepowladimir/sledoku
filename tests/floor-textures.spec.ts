import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

// Regression: a designer wood.svg texture (2.5KB — under Vite's assetsInlineLimit) is
// served as a data-URI containing single quotes. An unquoted CSS url() was silently
// dropped, leaving black cells. Every designer-texture cell must resolve to a real
// background-image.
test('designer floor texture renders as background-image on wood cells', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
  await page.waitForSelector('.board');

  // 5-1 is a bedroom (wood) cell with no item on it.
  const bg = await page.getByTestId('cell-5-1').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('url(');
  expect(bg).not.toBe('none');
});
