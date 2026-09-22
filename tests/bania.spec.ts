import { test, expect } from '@playwright/test';
import { baniaLevel } from '../levels/43-bania';

// «Лёгкий пар» (bania-01): 8×8, 6 зон районной бани. Твист G-ядра: обманка
// «в парилке ровно двое + банщик парился» разгромлена «в парилке только
// мужчины» (жертва — женщина); инвариант выдавливает пару в женскую
// раздевалку ⇒ убийца — женщина. Ключевые проверки: 64 клетки, купель
// occupiable (сплошная обводка), каменка decorative, победа с «Аглая».

test('bania-01: board renders 64 cells, kupel occupiable, kamenga decorative', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${baniaLevel.meta.id}`).click();

  // Поле 8×8 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(64);

  // Купель (2,7): occupiable — сплошная обводка.
  await page.getByTestId('cell-2-7').hover();
  const kupelOutline = page.getByTestId('item-outline');
  await expect(kupelOutline).toBeVisible();
  await expect(kupelOutline).toHaveClass(/item-outline--occupiable/);
  await expect(kupelOutline).not.toHaveClass(/item-outline--decorative/);

  // Каменка (6,0): decorative — пунктирная обводка.
  await page.getByTestId('cell-6-0').hover();
  const stoveOutline = page.getByTestId('item-outline');
  await expect(stoveOutline).toBeVisible();
  await expect(stoveOutline).toHaveClass(/item-outline--decorative/);
  await expect(stoveOutline).not.toHaveClass(/item-outline--occupiable/);

  // Полки в парилке и шкафчики в раздевалках на месте.
  for (const cid of ['cell-6-4', 'cell-7-4', 'cell-3-3', 'cell-5-4']) {
    await expect(page.getByTestId(cid)).toBeVisible();
  }

  // Общие подсказки: bn2+bn3 схлопнуты по groupId в одну строку,
  // всего строк две (объединённая G + «в парилке ровно двое»).
  const generalItems = page.locator('[data-testid="roster-general"] .clue-item');
  await expect(generalItems).toHaveCount(2);
  await expect(generalItems.first()).toContainText('В парилке и мужской раздевалке находились только мужчины.');
  await expect(generalItems.nth(1)).toContainText('В парилке находились ровно двое.');

  expect(errors).toEqual([]);
});

test('bania-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${baniaLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(baniaLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Аглая');
});
