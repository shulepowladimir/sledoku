import { test, expect } from '@playwright/test';
import { stadiumLevel } from '../levels/15-stadium';

test('stadium-01 board renders cut-out corners, 96 cells, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${stadiumLevel.meta.id}`).click();

  const board = page.locator('.board');
  await expect(board).toHaveClass(/board--cut/);

  // The four rounded-corner cut-outs are absent from the DOM.
  for (const cut of ['cell-0-0', 'cell-0-9', 'cell-9-0', 'cell-9-9']) {
    await expect(page.getByTestId(cut)).toHaveCount(0);
  }

  // 96 rendered cells = 10x10 minus 4 cut-outs.
  await expect(board.locator('.grid-cell')).toHaveCount(96);

  // All 10 people are placeable: run the full solution and verify victory.
  for (const [personId, cellId] of Object.entries(stadiumLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');

  expect(errors).toEqual([]);
});
