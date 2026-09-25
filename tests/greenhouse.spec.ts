import { test, expect } from '@playwright/test';
import { greenhouseLevel } from '../levels/49-greenhouse';
import { polyominoEdgeSegments } from '../src/engine/polyomino';

test('greenhouse renders the agreed 9x9 map, flowerbeds, and shared clue', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${greenhouseLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(81);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(9);

  const flowerbeds = greenhouseLevel.items.filter((item) => item.typeId === 'flowerbed');
  expect(flowerbeds).toHaveLength(8);
  for (const flowerbed of flowerbeds) {
    await expect(page.getByTestId(`cell-${flowerbed.cells[0]}`).locator('svg.item-icon')).toHaveCount(1);
  }

  const clue = greenhouseLevel.clues.find((candidate) => candidate.type === 'itemAdjacencyOccupancy');
  expect(clue).toBeDefined();
  await expect(page.getByTestId('roster-general').getByText(clue!.text, { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('greenhouse hedge and rose-bush polyominoes render tile shadows and scallops', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${greenhouseLevel.meta.id}`).click();

  const polyominoes = greenhouseLevel.items.filter(
    (item) => ['bushHedge', 'roseBush'].includes(item.typeId) && item.cells.length > 1,
  );
  expect(polyominoes.some((item) => item.typeId === 'bushHedge')).toBe(true);
  expect(polyominoes.some((item) => item.typeId === 'roseBush')).toBe(true);

  for (const item of polyominoes) {
    const overlay = page.getByTestId(`item-tiles-${item.id}`);
    const segments = polyominoEdgeSegments(item.cells);
    const scallopCount = segments.filter((segment) =>
      (segment.dir === 'north' && segment.row > 0) || (segment.dir === 'west' && segment.col > 0),
    ).length;
    const shadowCount = segments.filter((segment) => segment.dir === 'south' || segment.dir === 'east').length;

    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.item-tile-overlay__tile')).toHaveCount(item.cells.length);
    await expect(overlay.locator('.item-tile-overlay__scallop path')).toHaveCount(scallopCount);
    await expect(overlay.locator('.item-tile-overlay__shadow rect')).toHaveCount(shadowCount);
    await expect(overlay.locator('.item-tile-overlay__contour')).toHaveCount(1);
  }
});

test('greenhouse full solution run reveals Zoya as the murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${greenhouseLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(greenhouseLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Зоя');
});
