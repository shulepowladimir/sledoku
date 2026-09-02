import { test, expect } from '@playwright/test';
import { levels } from '../levels';

test('asset gallery renders every used item key without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/?gallery');

  await expect(page.getByTestId('gallery-items')).toBeVisible();

  const usedItemKeys = new Set(levels.flatMap((level) => level.itemTypes.map((t) => t.icon)));
  const cards = page.locator('[data-testid^="gallery-item-"]');
  await expect(cards).toHaveCount(usedItemKeys.size);

  await expect(page.getByTestId('gallery-themes')).toBeVisible();
  await expect(page.getByTestId('gallery-textures')).toBeVisible();
  await expect(page.getByTestId('gallery-persons')).toBeVisible();

  expect(errors).toEqual([]);
});
