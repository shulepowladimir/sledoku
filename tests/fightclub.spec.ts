import { test, expect } from '@playwright/test';
import { fightClubLevel } from '../levels/40-fightclub';

// «Восьмой раунд» (fightclub-01): 8×8, 6 зон подпольного клуба. Твист уровня —
// судья и убийца один человек: ринг впускает только Григория и жертву (fc1),
// судья — ветеран (fc16+fc17), Харитон (Х) — новичок. Ключевые проверки:
// 64 клетки, углы ринга decorative (красная пунктирная обводка), полный
// прогон решения побеждает и называет Григория.

test('fightclub-01: board renders 64 cells, ring corners are decorative', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${fightClubLevel.meta.id}`).click();

  // Поле 8×8 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(64);

  // Стойка ринга (2,2)+(2,3): 2кл decorative — при наведении обводка decorative
  // (красная пунктирная), не occupiable: на столбе с подушкой не сидят.
  await page.getByTestId('cell-2-2').hover();
  const outline = page.getByTestId('item-outline');
  await expect(outline).toBeVisible();
  await expect(outline).toHaveClass(/item-outline--decorative/);
  await expect(outline).not.toHaveClass(/item-outline--occupiable/);

  // Груша и шкафчик на месте (клетки предметов существуют).
  for (const cid of ['cell-2-5', 'cell-2-0']) {
    await expect(page.getByTestId(cid)).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test('fightclub-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${fightClubLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(fightClubLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Григорий');
});
