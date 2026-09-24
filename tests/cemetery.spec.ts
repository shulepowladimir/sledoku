import { test, expect } from '@playwright/test';
import { cemeteryLevel } from '../levels/44-cemetery';

// «Тихие соседи» (cemetery-01): 10×10, 10 действующих лиц, 8 зон. Твист:
// убийца — смотритель (роль раскрыта person-клю Галины; zoneBoundary
// склеп×часовня + zEC склеп=2 сплетают «жертва наедине со смотрителем»).
// Обманка: свежая могила с венком — ложный след, труп в склепе. Дебют
// F-механик: zoneBoundary / zoneNeighborOf / adjacentZonesPair.

test('cemetery-01: 100 cells, 10 people, tombstone decorative, bush polyomino tile', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${cemeteryLevel.meta.id}`).click();

  // Поле 10×10 целиком (без вырезов).
  await expect(page.locator('.board .grid-cell')).toHaveCount(100);

  // Надгробие (2,0): decorative — пунктирная обводка.
  await page.getByTestId('cell-2-0').hover();
  const tombOutline = page.getByTestId('item-outline');
  await expect(tombOutline).toBeVisible();
  await expect(tombOutline).toHaveClass(/item-outline--decorative/);
  await expect(tombOutline).not.toHaveClass(/item-outline--occupiable/);

  // 10 действующих лиц на 10×10 — полная перестановка.
  const rosterPeople = page.locator('[data-testid^="roster-person-"]');
  await expect(rosterPeople).toHaveCount(10);

  // Ворота кладбища (9,0) на входе; свежая могила с венком (9,5).
  await expect(page.getByTestId('cell-9-0')).toBeVisible();
  await expect(page.getByTestId('cell-9-5')).toBeVisible();

  // Куст-полиомино (8,7)+(8,8): render: 'tile' — overlay тайлов движка.
  await expect(page.getByTestId('item-tiles-item-bush-ny')).toBeVisible();

  // Общие подсказки: смотритель singleton + boundary, часовня=1, склеп=2.
  const generalItems = page.locator('[data-testid="roster-general"] .clue-item');
  await expect(generalItems).toHaveCount(4);
  await expect(generalItems.first()).toContainText('На кладбище дежурил ровно один смотритель.');
  await expect(generalItems.nth(1)).toContainText('Смотритель стоял на границе склепа и часовни.');
  await expect(generalItems.nth(2)).toContainText('В часовне находился ровно один человек.');
  await expect(generalItems.nth(3)).toContainText('В склепе находились ровно двое.');

  expect(errors).toEqual([]);
});

test('cemetery-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${cemeteryLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(cemeteryLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Галина');
});
