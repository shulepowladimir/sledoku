import { test, expect } from '@playwright/test';
import { barbershopLevel } from '../levels/48-barbershop';
import { buildLevelIndex, isLegalTarget } from '../src/engine/board';

test('barbershop clue board visibly alternates light and dark checkerboard tiles', async ({ page }) => {
  await page.goto('/?level=barbershop-01');

  await expect(page.getByTestId('cell-0-0')).toHaveClass(/grid-cell--checker-light/);
  await expect(page.getByTestId('cell-0-1')).toHaveClass(/grid-cell--checker-dark/);
  await expect(page.getByTestId('cell-1-1')).toHaveClass(/grid-cell--checker-light/);
  await expect(page.locator('.grid-cell--checker-light')).toHaveCount(32);
  await expect(page.locator('.grid-cell--checker-dark')).toHaveCount(32);

  const darkOverlay = await page.getByTestId('cell-0-1').evaluate((cell) => getComputedStyle(cell).boxShadow);
  expect(darkOverlay).toContain('0.52');

  await page.locator('.noir-toggle').click();
  await expect(page.locator('body')).toHaveClass(/noir/);
  const noirDarkOverlay = await page.getByTestId('cell-0-1').evaluate((cell) => getComputedStyle(cell).boxShadow);
  expect(noirDarkOverlay).toContain('0.52');
});

test('barbershop staff-room label fits between the dyeing room and display labels', async ({ page }) => {
  await page.goto('/?level=barbershop-01');

  const labelBox = async (name: string) => {
    const box = await page.locator('.room-label', { hasText: name }).boundingBox();
    expect(box, `missing label: ${name}`).not.toBeNull();
    return box!;
  };
  const color = await labelBox('Кабинет окрашивания');
  const staff = await labelBox('Комната персонала');
  const display = await labelBox('Витрина');

  expect(color.x + color.width).toBeLessThanOrEqual(staff.x);
  expect(staff.x + staff.width).toBeLessThanOrEqual(display.x);
});

test('barbershop roster keeps its current order in three columns of 3-3-2', async ({ page }) => {
  await page.goto('/?level=barbershop-01');

  const columns = page.locator('.roster-columns > .roster-list');
  await expect(columns).toHaveCount(3);
  const columnNames = await Promise.all(
    [0, 1, 2].map((index) => columns.nth(index).locator('.roster-entry__name').allTextContents()),
  );

  expect(columnNames).toEqual([
    barbershopLevel.people.slice(0, 3).map((person) => person.name),
    barbershopLevel.people.slice(3, 6).map((person) => person.name),
    barbershopLevel.people.slice(6, 8).map((person) => person.name),
  ]);
});

test('completed board crosses every unoccupied legal cell, including occupiable items', async ({ page }) => {
  await page.addInitScript((levelId) => {
    localStorage.setItem('sledoku:guest-best-times', JSON.stringify({ [levelId]: 60_000 }));
  }, barbershopLevel.meta.id);

  await page.goto(`/?level=${barbershopLevel.meta.id}`);
  await expect(page.getByTestId('victory-banner')).toBeVisible();

  const index = buildLevelIndex(barbershopLevel);
  const occupiedCells = new Set(Object.values(barbershopLevel.solution));
  const emptyLegalCells = barbershopLevel.cells.filter(
    (cell) => !occupiedCells.has(cell.id) && isLegalTarget(index, barbershopLevel, cell.id),
  );
  const itemTypes = new Map(barbershopLevel.itemTypes.map((itemType) => [itemType.id, itemType]));
  const items = new Map(barbershopLevel.items.map((item) => [item.id, item]));
  const emptyOccupiableItemCells = emptyLegalCells.filter((cell) => {
    const item = cell.itemId ? items.get(cell.itemId) : undefined;
    return itemTypes.get(item?.typeId ?? '')?.kind === 'occupiable';
  });

  expect(emptyOccupiableItemCells.length).toBeGreaterThan(0);
  for (const cell of emptyLegalCells) {
    await expect(page.getByTestId(`cell-${cell.id}`).locator('.cross-mark')).toHaveCount(1);
  }
  for (const cellId of occupiedCells) {
    await expect(page.getByTestId(`cell-${cellId}`).locator('.cross-mark')).toHaveCount(0);
  }
});
