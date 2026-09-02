import { test, expect, type Page } from '@playwright/test';
import { levels } from '../levels';
import { apartmentLevel } from '../levels/01-apartment';

async function seedBestTimes(page: Page, bestTimes: Record<string, number>) {
  await page.addInitScript((payload) => {
    localStorage.setItem('sledoku:best-times', JSON.stringify(payload));
  }, bestTimes);
}

test('size filter shows only cards of the chosen size', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('size-filter-11').click();

  for (const level of levels) {
    const card = page.getByTestId(`level-card-${level.meta.id}`);
    if (level.size === 11) {
      await expect(card).toBeVisible();
    } else {
      await expect(card).toHaveCount(0);
    }
  }

  await page.getByTestId('size-filter-all').click();
  await expect(page.locator('.level-card')).toHaveCount(levels.length);
});

test('hide solved toggle combines with the size filter', async ({ page }) => {
  const solvedIds = levels.filter((l) => l.size === 6).map((l) => l.meta.id);
  const bestTimes = Object.fromEntries(solvedIds.map((id) => [id, 60_000]));
  await seedBestTimes(page, bestTimes);

  await page.goto('/');
  await page.getByTestId('size-filter-6').click();

  for (const id of solvedIds) {
    await expect(page.getByTestId(`level-card-${id}`)).toBeVisible();
  }

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId('level-menu-empty')).toBeVisible();
  await expect(page.locator('.level-card')).toHaveCount(0);

  await page.getByTestId('size-filter-7').click();
  await expect(page.getByTestId('level-menu-empty')).toHaveCount(0);
  await expect(page.locator('.level-card')).toHaveCount(levels.filter((l) => l.size === 7).length);
});

test('hide solved toggle can be turned back off', async ({ page }) => {
  await seedBestTimes(page, { [apartmentLevel.meta.id]: 60_000 });

  await page.goto('/');

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toHaveCount(0);

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toBeVisible();
});

test('timer starts as soon as the level opens', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

  await page.waitForTimeout(1_600);
  await expect(page.locator('.timer')).not.toHaveText('0:00');
});

test('undoing every action keeps the timer running', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

  const [personId, cellId] = Object.entries(apartmentLevel.solution)[0];
  await page.getByTestId(`roster-person-${personId}`).click();
  await page.getByTestId(`cell-${cellId}`).click();

  await page.getByTestId('undo-button').click();

  await page.waitForTimeout(1_600);
  await expect(page.locator('.timer')).not.toHaveText('0:00');
});
