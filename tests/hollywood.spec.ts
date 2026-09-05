import { test, expect } from '@playwright/test';
import { hollywoodLevel } from '../levels/25-hollywood';

test('hollywood-25: card, 144 cells, full playthrough, no console errors', async ({ page }) => {
  // Широкий вьюпорт: при 12 персажнах сайдбар раскрывается в 3 колонки (720px), и на стандартном
  // 1280 fit-by-width честно ужимает доску до остатка строки. Ступень 0.875 проверяем на 1920.
  await page.setViewportSize({ width: 1920, height: 1080 });
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
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Убийцей оказался Леонид.');
  expect(errors).toEqual([]);
});

// Мобильная адаптация: fit-by-width — на узком вьюпорте доска ужимается и не вылезает за экран
// (на десктопе действует базовая ступень 0.875 — см. ассерт 672px в тесте выше; мобильная
// раскладка переносит ростер под доску, обёртка получает всю ширину — см. mobile-этап).
test('hollywood-25: mobile viewport fits the board on screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId(`size-filter-12`).click();
  await page.getByTestId(`level-card-${hollywoodLevel.meta.id}`).click();
  await expect(page.locator('.grid-cell')).toHaveCount(144);

  const boardBox = await page.locator('.board').boundingBox();
  expect(boardBox).toBeTruthy();
  expect(boardBox!.width).toBeLessThanOrEqual(390);
  expect(boardBox!.x).toBeGreaterThanOrEqual(0);
});
