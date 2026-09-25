import { test, expect } from '@playwright/test';
import { baniaLevel } from '../levels/43-bania';
import { heavyCaseLevel } from '../levels/42-heavy';

// Подписи координат (AxisToggle): номера столбцов над картой, номера рядов
// справа; тумблер между компасом и нуаром; дефолт выключен; персистентность
// в localStorage; подписи учитываются в fit-by-width на мобильном вьюпорте.

test('axis labels: off by default, toggle shows 1..N above and right of the board', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${baniaLevel.meta.id}`).click();

  // Тумблер в hud между компасом и нуаром.
  const hudItems = page.locator('.hud-bar > *');
  await expect(page.getByTestId('axis-toggle')).toHaveCount(1);
  const toggleIndex = await hudItems.evaluateAll((nodes) =>
    nodes.findIndex((n) => n.getAttribute('data-testid') === 'axis-toggle'),
  );
  const compassIndex = await hudItems.evaluateAll((nodes) =>
    nodes.findIndex((n) => n.getAttribute('data-testid') === 'hud-compass'),
  );
  const noirIndex = await hudItems.evaluateAll((nodes) =>
    nodes.findIndex((n) => n.getAttribute('data-testid') === 'noir-toggle'),
  );
  expect(compassIndex).toBeGreaterThanOrEqual(0);
  expect(noirIndex).toBeGreaterThanOrEqual(0);
  expect(toggleIndex).toBeGreaterThan(compassIndex);
  expect(toggleIndex).toBeLessThan(noirIndex);

  // Дефолт: подписей нет, кнопка неактивна.
  await expect(page.getByTestId('axis-col-1')).toHaveCount(0);
  await expect(page.getByTestId('axis-toggle')).toHaveAttribute('aria-pressed', 'false');

  // Включаем: столбцы 1..8 сверху, ряды 1..8 справа.
  await page.getByTestId('axis-toggle').click();
  await expect(page.getByTestId('axis-toggle')).toHaveAttribute('aria-pressed', 'true');
  for (const n of [1, 4, 8]) {
    await expect(page.getByTestId(`axis-col-${n}`)).toHaveText(String(n));
    await expect(page.getByTestId(`axis-row-${n}`)).toHaveText(String(n));
  }
  await expect(page.locator('.axis-label--col')).toHaveCount(8);
  await expect(page.locator('.axis-label--row')).toHaveCount(8);

  // Геометрия: столбцы НАД картой, ряды СПРАВА от неё.
  const boardBox = await page.locator('.board').boundingBox();
  const col1Box = await page.getByTestId('axis-col-1').boundingBox();
  const row1Box = await page.getByTestId('axis-row-1').boundingBox();
  expect(col1Box!.y + col1Box!.height).toBeLessThanOrEqual(boardBox!.y + 1);
  expect(row1Box!.x).toBeGreaterThanOrEqual(boardBox!.x + boardBox!.width - 1);

  // Персистентность: URL восстанавливает уровень, а настройки — подписи.
  await page.reload();
  await expect(page.getByTestId('axis-col-1')).toBeVisible();
  await expect(page.getByTestId('axis-toggle')).toHaveAttribute('aria-pressed', 'true');

  // Выключение: подписи пропадают.
  await page.getByTestId('axis-toggle').click();
  await expect(page.getByTestId('axis-col-1')).toHaveCount(0);
  await expect(page.getByTestId('axis-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('axis labels: 12×12 board with labels fits narrow viewport (mobile fit)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId(`level-card-${heavyCaseLevel.meta.id}`).click();

  await page.getByTestId('axis-toggle').click();
  await expect(page.getByTestId('axis-col-12')).toHaveText('12');
  await expect(page.getByTestId('axis-row-12')).toHaveText('12');

  // Доска с подписями не вылезает за узкий вьюпорт (fit-by-width).
  const boardBox = await page.locator('.board').boundingBox();
  const lastRow = await page.getByTestId('axis-row-12').boundingBox();
  const lastCol = await page.getByTestId('axis-col-12').boundingBox();
  expect(boardBox!.x + boardBox!.width).toBeLessThanOrEqual(390 + 1);
  expect(lastRow!.x + lastRow!.width).toBeLessThanOrEqual(390 + 1);
  expect(lastCol!.y + lastCol!.height).toBeLessThanOrEqual(boardBox!.y + 1);
});
