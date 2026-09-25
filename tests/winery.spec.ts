import { test, expect } from '@playwright/test';
import { wineryLevel } from '../levels/50-winery';
import { parkMazeLevel } from '../levels/38-parkmaze';

test('winery grapevine tiles render without scallops or shadows', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wineryLevel.meta.id}`).click();

  const vineyards = wineryLevel.items.filter((item) => item.typeId === 'grapeVine');
  expect(vineyards.length).toBeGreaterThan(0);

  for (const vine of vineyards) {
    const overlay = page.getByTestId(`item-tiles-${vine.id}`);
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.item-tile-overlay__tile')).toHaveCount(vine.cells.length);
    await expect(overlay.locator('.item-tile-overlay__scallop path')).toHaveCount(0);
    await expect(overlay.locator('.item-tile-overlay__shadow rect')).toHaveCount(0);
    await expect(overlay.locator('.item-tile-overlay__contour')).toHaveCount(1);
  }
});

test('winery single-cell props render at the preview scale', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wineryLevel.meta.id}`).click();

  const expectedSize = '51'; // The 64px preview cell at 80% scale, rounded by the game.
  const singleCellItems = wineryLevel.items.filter((item) => item.cells.length === 1);
  for (const item of singleCellItems) {
    const cell = page.getByTestId(`cell-${item.cells[0]}`);
    await expect(cell.locator('svg.item-icon')).toHaveAttribute('width', expectedSize);
  }
});

test('winery authored solution is accepted by the game', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wineryLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(wineryLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Ждан');
});

test('single-cell item icons default to 80% in other levels too', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${parkMazeLevel.meta.id}`).click();

  for (const itemTypeId of ['bench', 'fountain']) {
    const item = parkMazeLevel.items.find((candidate) => candidate.typeId === itemTypeId)!;
    const cell = page.getByTestId(`cell-${item.cells[0]}`);
    await expect(cell.locator('svg.item-icon')).toHaveAttribute('width', '51');
  }
});

test('winery room labels do not overlap', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wineryLevel.meta.id}`).click();
  await expect(page.locator('.room-label')).toHaveCount(wineryLevel.rooms.length);

  const labels = await page.locator('.room-label').all();
  const boardBox = await page.locator('.board').boundingBox();
  const boxes = await Promise.all(labels.map(async (label) => ({
    name: await label.textContent(),
    box: await label.boundingBox(),
  })));
  expect(boardBox).not.toBeNull();
  expect(boxes).toHaveLength(wineryLevel.rooms.length);

  for (let i = 0; i < boxes.length; i++) {
    expect(boxes[i].box, `${boxes[i].name} should be visible`).not.toBeNull();
    const current = boxes[i].box!;
    expect(current.x, `${boxes[i].name} should stay inside the board`).toBeGreaterThanOrEqual(boardBox!.x);
    expect(current.y, `${boxes[i].name} should stay inside the board`).toBeGreaterThanOrEqual(boardBox!.y);
    expect(current.x + current.width, `${boxes[i].name} should stay inside the board`).toBeLessThanOrEqual(boardBox!.x + boardBox!.width);
    expect(current.y + current.height, `${boxes[i].name} should stay inside the board`).toBeLessThanOrEqual(boardBox!.y + boardBox!.height);
    for (let j = i + 1; j < boxes.length; j++) {
      expect(boxes[j].box, `${boxes[j].name} should be visible`).not.toBeNull();
      const right = boxes[j].box!;
      const overlapsHorizontally = current.x < right.x + right.width && right.x < current.x + current.width;
      const overlapsVertically = current.y < right.y + right.height && right.y < current.y + current.height;
      expect(
        overlapsHorizontally && overlapsVertically,
        `${boxes[i].name} overlaps ${boxes[j].name}`,
      ).toBe(false);
    }
  }
});
