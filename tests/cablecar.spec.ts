import { expect, test } from '@playwright/test';
import { cablecarLevel } from '../levels/53-cablecar';

test('cablecar-01: board, artwork, and item interaction render correctly', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  const card = page.getByTestId(`level-card-${cablecarLevel.meta.id}`);
  expect(await card.locator('.theme-icon path').count()).toBeGreaterThan(1);
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(110);
  const slopeLabel = await page.locator('.room-label', { hasText: 'Склон' }).boundingBox();
  const labelAnchor = await page.getByTestId('cell-8-8').boundingBox();
  expect(slopeLabel).not.toBeNull();
  expect(labelAnchor).not.toBeNull();
  expect(slopeLabel!.x + slopeLabel!.width / 2).toBeCloseTo(labelAnchor!.x + labelAnchor!.width / 2, 1);
  await expect(page.locator('.board .item-overlay')).toHaveCount(4);
  const sky = await page.getByTestId('cell-0-0').evaluate((cell) => getComputedStyle(cell).backgroundImage);
  expect(sky).toContain('url(');
  expect(sky).not.toBe('none');
  const cabinFloor = await page.getByTestId('cell-0-8').evaluate((cell) => getComputedStyle(cell).backgroundImage);
  expect(cabinFloor).toContain('cobble');
  for (const cellId of ['cell-9-0', 'cell-8-0', 'cell-9-5', 'cell-6-5', 'cell-5-10']) {
    const stairs = await page.getByTestId(cellId).evaluate((cell) => getComputedStyle(cell).backgroundImage);
    expect(stairs).toContain('stairs');
  }

  await page.getByTestId('cell-0-0').hover();
  await expect(page.getByTestId('item-outline')).toHaveClass(/item-outline--decorative/);
  await page.getByTestId('cell-3-6').hover();
  await expect(page.getByTestId('item-outline')).toHaveClass(/item-outline--decorative/);
  await page.getByTestId('cell-0-8').hover();
  const gondolaOutline = page.getByTestId('item-outline');
  await expect(gondolaOutline).toHaveClass(/item-outline--occupiable/);
  await expect(gondolaOutline).toHaveCSS('width', '128px');
  await expect(gondolaOutline).toHaveCSS('height', '128px');

  expect(errors).toEqual([]);
});

test('cablecar-01: full authored solution wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${cablecarLevel.meta.id}`).click();

  for (const [personId, id] of Object.entries(cablecarLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${id}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Борис');
});
