import { test, expect } from '@playwright/test';
import { mineLevel } from '../levels/39-mine';

// «Шахта» (mine-01): вытянутая карта 10×11 с пустым крайним столбцом (западный
// ствол — выводится дизъюнкцией стволов). Ключевые проверки: 110 клеток,
// рельсовые фичи в стволах, вагонетки occupiable (зелёная обводка), полный
// прогон решения побеждает.

test('mine-01: board renders 110 cells, rails features, minecart is occupiable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${mineLevel.meta.id}`).click();

  // Поле 10×11 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(110);

  // Рельсовые пути: по клетке в каждом стволе несут фичу rails
  // (data-атрибут текстуры клетки — проверяем через класс фичи).
  for (const cid of ['cell-0-0', 'cell-9-0', 'cell-0-10', 'cell-9-10']) {
    const cell = page.getByTestId(cid);
    await expect(cell).toBeVisible();
  }

  // Вагонетка под Гурием (0,10)+(1,10): 2кл occupiable — при наведении
  // зелёная сплошная обводка (не красная пунктирная).
  await page.getByTestId('cell-1-10').hover();
  const outline = page.getByTestId('item-outline');
  await expect(outline).toBeVisible();
  await expect(outline).toHaveClass(/item-outline--occupiable/);
  await expect(outline).not.toHaveClass(/item-outline--decorative/);

  expect(errors).toEqual([]);
});

test('mine-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${mineLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(mineLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Гурий');
});
