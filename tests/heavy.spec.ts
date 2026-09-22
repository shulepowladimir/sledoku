import { test, expect } from '@playwright/test';
import { heavyCaseLevel } from '../levels/42-heavy';

// «Тяжкое дело» (heavy-01): 12×12, 7 зон гиблого квартала. Твист без скрытых
// ролей: пустая автомойка и правило «жертва наедине с убийцей» выводят пару
// Айлер+Хэнк в доме. Ключевые проверки: 144 клетки, трейлер occupiable
// (2кл), реакторный чан decorative, полный прогон побеждает.

test('heavy-01: board renders 144 cells, trailer occupiable, reactor vat decorative', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${heavyCaseLevel.meta.id}`).click();

  // Поле 12×12 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(144);

  // Трейлер (7,2)+(7,3): 2кл occupiable — при наведении сплошная обводка.
  await page.getByTestId('cell-7-2').hover();
  const trailerOutline = page.getByTestId('item-outline');
  await expect(trailerOutline).toBeVisible();
  await expect(trailerOutline).toHaveClass(/item-outline--occupiable/);
  await expect(trailerOutline).not.toHaveClass(/item-outline--decorative/);

  // Реакторный чан (8,8)+(9,8): 2кл decorative — пунктирная обводка.
  await page.getByTestId('cell-8-8').hover();
  const vatOutline = page.getByTestId('item-outline');
  await expect(vatOutline).toBeVisible();
  await expect(vatOutline).toHaveClass(/item-outline--decorative/);
  await expect(vatOutline).not.toHaveClass(/item-outline--occupiable/);

  expect(errors).toEqual([]);
});

test('heavy-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${heavyCaseLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(heavyCaseLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Айлер');
});
