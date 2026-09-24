import { test, expect } from '@playwright/test';
import { libraryLevel } from '../levels/47-library';

test('library-01 renders the seven zones and five item types', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${libraryLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(100);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(10);
  const countParity = libraryLevel.clues.find((clue) => clue.type === 'zoneCountParity');
  expect(countParity).toBeDefined();
  await expect(page.getByTestId('roster-general').getByText(countParity!.text, { exact: true })).toBeVisible();
  for (const typeId of ['bookshelf', 'ladder', 'table', 'floorLamp', 'armchair']) {
    const item = libraryLevel.items.find((candidate) => candidate.typeId === typeId);
    expect(item, `expected at least one ${typeId}`).toBeDefined();
    await expect(page.getByTestId(`cell-${item!.cells[0]}`).locator('svg.item-icon')).toHaveCount(1);
  }

  expect(errors).toEqual([]);
});

test('library-01 full solution run reveals Anna as the murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${libraryLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(libraryLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Анна');
});
