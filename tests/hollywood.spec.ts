import { test, expect } from '@playwright/test';
import { hollywoodLevel } from '../levels/25-hollywood';

test('hollywood-25: card, 144 cells, full playthrough, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.getByTestId(`size-filter-12`).click();
  const card = page.getByTestId(`level-card-${hollywoodLevel.meta.id}`);
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('.grid-cell')).toHaveCount(144);
  await expect(page.locator('.room-label').first()).toBeVisible();

  // Large boards scale down in steps (12×12 → 0.875): visual cell size 64→56px, board 768→672px.
  const boardBox = await page.locator('.board').boundingBox();
  expect(boardBox?.width).toBeCloseTo(12 * 64 * 0.875, 0);

  for (const [personId, cellId] of Object.entries(hollywoodLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).click();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Убийцей оказался Леонид.');
  expect(errors).toEqual([]);
});
