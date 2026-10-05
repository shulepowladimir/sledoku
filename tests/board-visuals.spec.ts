import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';
import { dinerLevel } from '../levels/30-diner';
import { hollywoodLevel } from '../levels/25-hollywood';
import { strangeCaseLevel } from '../levels/63-strange-case';

for (const level of [apartmentLevel, dinerLevel, hollywoodLevel]) {
  test(`${level.meta.id} uses shared room-label styling`, async ({ page }) => {
    await page.goto('/');
    if (level.size === 12) await page.getByTestId('size-filter-12').click();
    await page.getByTestId(`level-card-${level.meta.id}`).click();

    const board = page.locator('.board');
    const label = page.locator('.room-label').first();
    await expect(board).not.toHaveClass(/visual-trial/);
    await expect(label).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(label).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const textShadow = await label.evaluate((element) => getComputedStyle(element).textShadow);
    expect(textShadow).toContain('255, 255, 255');
  });
}

test('the otherworld tints floors and rotates only room labels and item art', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('size-filter-12').click();
  await page.getByTestId(`level-card-${strangeCaseLevel.meta.id}`).click();

  const ordinaryCell = page.getByTestId('cell-0-1');
  const otherworldCell = page.getByTestId('cell-9-0');
  await expect(ordinaryCell).toHaveAttribute('data-world-id', 'ordinary');
  await expect(otherworldCell).toHaveAttribute('data-world-id', 'otherworld');
  expect(await ordinaryCell.evaluate((node) => getComputedStyle(node).backgroundImage)).not.toContain('123, 36, 49');
  expect(await otherworldCell.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain('123, 36, 49');

  const ordinaryLabel = page.locator('.room-label[data-world-id="ordinary"]').first();
  const otherworldLabel = page.locator('.room-label[data-world-id="otherworld"]').first();
  await expect(ordinaryLabel).toHaveCSS('transform', /none|matrix\(1, 0, 0, 1/);
  await expect(otherworldLabel).toHaveCSS('transform', /matrix\(-1, 0, 0, -1/);

  await expect(ordinaryCell.locator('.item-icon')).toHaveCSS('transform', 'none');
  await expect(otherworldCell.locator('.item-icon')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  const otherworldGarland = page.getByTestId('item-tiles-garland-other-house');
  await expect(otherworldGarland).toHaveCSS('transform', 'none');
  await expect(otherworldGarland.locator('.item-icon').first()).toHaveCSS('transform', /matrix\(-1, 0, 0, -1/);

  const sofaBounds = await page.getByTestId('cell-7-0').locator('.item-icon').boundingBox();
  const garlandTileBounds = await otherworldGarland.locator('.item-tile-overlay__tile').evaluateAll((tiles) =>
    tiles.map((tile) => {
      const { x, y, right, bottom } = tile.getBoundingClientRect();
      return { x, y, right, bottom };
    }),
  );
  expect(sofaBounds).not.toBeNull();
  expect(garlandTileBounds.some((tile) =>
    sofaBounds!.x < tile.right && sofaBounds!.x + sofaBounds!.width > tile.x &&
    sofaBounds!.y < tile.bottom && sofaBounds!.y + sofaBounds!.height > tile.y,
  )).toBe(false);

  await page.getByTestId('cell-8-3').hover();
  const garlandOutline = page.getByTestId('item-outline');
  await expect(garlandOutline).toHaveClass(/item-outline--decorative/);
  const outlineBox = await garlandOutline.boundingBox();
  const garlandBox = await otherworldGarland.boundingBox();
  expect(outlineBox).not.toBeNull();
  expect(garlandBox).not.toBeNull();
  expect(outlineBox!.x).toBeCloseTo(garlandBox!.x, 0);
  expect(outlineBox!.y).toBeCloseTo(garlandBox!.y, 0);

  await page.getByTestId('roster-person-alexey').click();
  await page.getByTestId('cell-6-9').dblclick();
  await expect(page.getByTestId('cell-6-9').locator('.person-token')).toHaveCSS('transform', 'none');
});

test('shared board styling preserves hover, person colors, initials, and enlarged single-cell items', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

  const kitchenLabel = page.locator('.room-label').filter({ hasText: 'Кухня' });
  await page.getByTestId('cell-0-0').hover();
  await expect(kitchenLabel).toHaveClass(/room-label--highlighted/);
  await expect(page.getByTestId('cell-0-0')).toHaveCSS('border-top-color', 'rgb(255, 207, 77)');
  const highlightedTextShadow = await kitchenLabel.evaluate((element) => getComputedStyle(element).textShadow);
  expect(highlightedTextShadow).toContain('255, 207, 77');

  await page.getByTestId('roster-person-andrei').click();
  await page.getByTestId('cell-1-3').dblclick();
  const occupiedSofa = page.getByTestId('cell-1-3');
  const token = occupiedSofa.locator('.person-token');
  await expect(token).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(token).toHaveCSS('border-color', 'rgb(77, 141, 255)');
  await expect(token).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
  await expect(token).toHaveCSS('outline-width', '1px');
  await expect(token).toHaveCSS('outline-offset', '1px');
  await expect(token).toHaveCSS('width', '44px');
  await expect(token.locator('.person-figure')).toHaveAttribute('width', '40');
  await expect(token.locator('.person-initial')).toHaveCSS('top', '-2px');
  await expect(occupiedSofa.locator('.grid-cell__item-under svg')).toHaveAttribute('width', '58');
});

test('a two-cell occupiable item stays a single enlarged overlay under its occupant', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('size-filter-12').click();
  await page.getByTestId(`level-card-${hollywoodLevel.meta.id}`).click();

  await page.getByTestId('roster-person-bogdan').click();
  await page.getByTestId('cell-11-3').dblclick();

  const overlay = page.getByTestId('item-overlay-item-horse-w');
  await expect(overlay).toBeVisible();
  await expect(overlay.locator('svg')).toHaveAttribute('width', '58');
  await expect(overlay).toHaveCSS('z-index', '1');
  await expect(page.getByTestId('cell-11-2').locator('.item-icon')).toHaveCount(0);
  await expect(page.getByTestId('cell-11-3').locator('.item-icon')).toHaveCount(0);
  await expect(page.getByTestId('cell-11-3').locator('.person-token')).toHaveCSS('z-index', '2');
});

test('person rings keep their green and red placement-status colors after checking', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('size-filter-12').click();
  await page.getByTestId(`level-card-${hollywoodLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(hollywoodLevel.solution)) {
    if (personId === 'anna' || personId === 'esenia') continue;
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }

  await page.getByTestId('roster-person-anna').click();
  await page.getByTestId('cell-1-6').dblclick();
  await page.getByTestId('roster-person-esenia').click();
  await page.getByTestId('cell-0-2').dblclick();

  const anna = page.getByTestId('cell-1-6').locator('.person-token');
  const esenia = page.getByTestId('cell-0-2').locator('.person-token');
  const bogdan = page.getByTestId('cell-11-3').locator('.person-token');
  await page.getByTestId('check-button').click();

  await expect(anna).toHaveClass(/person-token--incorrect/);
  await expect(anna).toHaveCSS('border-color', 'rgb(229, 72, 77)');
  await expect(anna).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
  await expect(esenia).toHaveCSS('border-color', 'rgb(229, 72, 77)');
  await expect(bogdan).toHaveClass(/person-token--correct/);
  await expect(bogdan).toHaveCSS('border-color', 'rgb(62, 207, 107)');
});
