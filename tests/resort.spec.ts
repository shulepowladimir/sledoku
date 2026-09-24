import { test, expect } from '@playwright/test';
import { resortLevel } from '../levels/45-resort';

test('resort-01: 121 cells, 11 people, occupiable mattress and decorative umbrella', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${resortLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(121);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(11);

  await page.getByTestId('cell-5-6').hover();
  await expect(page.getByTestId('item-outline')).toHaveClass(/item-outline--occupiable/);
  await page.getByTestId('cell-4-3').hover();
  await expect(page.getByTestId('item-outline')).toHaveClass(/item-outline--decorative/);

  expect(errors).toEqual([]);
});

test('resort-01: full solution run reveals the pool-bar murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${resortLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(resortLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Игорь');
});
