import { test, expect, type Page } from '@playwright/test';
import { gameLevels } from '../levels';
import { apartmentLevel } from '../levels/01-apartment';
import { isCustomBoard } from '../src/utils/boardSize';

async function seedBestTimes(page: Page, bestTimes: Record<string, number>) {
  await page.addInitScript((payload) => {
    localStorage.setItem('sledoku:guest-best-times', JSON.stringify(payload));
  }, bestTimes);
}

test('size filter shows only cards of the chosen size', async ({ page }) => {
  await page.goto('/');

  // The tutorial card is pinned outside the grid and hidden by any size filter.
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();

  await page.getByTestId('size-filter-11').click();

  await expect(page.getByTestId('level-card-tutorial-00')).toHaveCount(0);
  for (const level of gameLevels) {
    const card = page.getByTestId(`level-card-${level.meta.id}`);
    // Нестандартные доски (11×10 паркинг) живут в отдельном чипе «10×11», не в «11×11».
    if (level.size === 11 && !isCustomBoard(level)) {
      await expect(card).toBeVisible();
    } else {
      await expect(card).toHaveCount(0);
    }
  }

  // Отдельная категория нестандартных досок (10×11 и 11×10 — гонки и паркинг).
  await page.getByTestId('size-filter-custom').click();
  for (const level of gameLevels) {
    const card = page.getByTestId(`level-card-${level.meta.id}`);
    if (isCustomBoard(level)) {
      await expect(card).toBeVisible();
    } else {
      await expect(card).toHaveCount(0);
    }
  }

  await page.getByTestId('size-filter-all').click();
  // "Все" also shows the pinned tutorial card (it carries the .level-card class).
  await expect(page.locator('.level-card')).toHaveCount(gameLevels.length + 1);
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();
});

test('hide solved toggle combines with the size filter', async ({ page }) => {
  const solvedIds = gameLevels.filter((l) => l.size === 6).map((l) => l.meta.id);
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
  await expect(page.locator('.level-card')).toHaveCount(gameLevels.filter((l) => l.size === 7).length);
});

test('hide solved toggle can be turned back off', async ({ page }) => {
  await seedBestTimes(page, { [apartmentLevel.meta.id]: 60_000 });

  await page.goto('/');

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toHaveCount(0);

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toBeVisible();
});

test('hide solved toggle also hides the completed tutorial card', async ({ page }) => {
  // Пройденное обучение («Пройдено» на карточке) скрывается вместе с остальными.
  await page.addInitScript(() => {
    localStorage.setItem('sledoku:tutorial-done', '1');
  });

  await page.goto('/');
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();
  await expect(page.getByTestId('level-card-tutorial-00')).toContainText('Пройдено');

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId('level-card-tutorial-00')).toHaveCount(0);

  // Тумблер обратно — карточка возвращается.
  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();
});

test('hide solved toggle keeps the unfinished tutorial card visible', async ({ page }) => {
  await seedBestTimes(page, { [apartmentLevel.meta.id]: 60_000 });

  await page.goto('/');

  await page.getByTestId('hide-solved-toggle').click();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toHaveCount(0);
  // Обучение ещё не пройдено — карточка остаётся на месте.
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();
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
