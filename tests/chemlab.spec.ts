import { test, expect } from '@playwright/test';
import { chemLabLevel } from '../levels/41-chemlab';

// «Опасная реакция» (chemlab-01): 9×9, 7 зон ночной лаборатории. Обманка
// «не там»: «у реактора ровно двое» + «старший при запуске» создают ложный
// вывод об убийстве у реактора, а труп — в коридоре. Ключевые проверки:
// 81 клетка, чан decorative (пунктирная обводка), полный прогон побеждает.

test('chemlab-01: board renders 81 cells, reactor vat is decorative', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${chemLabLevel.meta.id}`).click();

  // Поле 9×9 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(81);

  // Реакторный чан (4,0)+(4,1): 2кл decorative — при наведении пунктирная
  // обводка decorative, не occupiable.
  await page.getByTestId('cell-4-0').hover();
  const outline = page.getByTestId('item-outline');
  await expect(outline).toBeVisible();
  await expect(outline).toHaveClass(/item-outline--decorative/);
  await expect(outline).not.toHaveClass(/item-outline--occupiable/);

  // Стеллаж пробирок и огнетушитель на месте.
  for (const cid of ['cell-1-0', 'cell-4-4']) {
    await expect(page.getByTestId(cid)).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test('chemlab-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${chemLabLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(chemLabLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Борис');
});
