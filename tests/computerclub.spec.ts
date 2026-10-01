import { test, expect } from '@playwright/test';
import { computerClubLevel } from '../levels/61-computerclub';

test('computer club renders the approved board, cast, and new equipment art', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  const card = page.getByTestId(`level-card-${computerClubLevel.meta.id}`);
  await expect(card).toContainText('Убойная катка');
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(49);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(7);
  for (const itemTypeId of ['consoleSetup', 'arcadeCabinet']) {
    const item = computerClubLevel.items.find((candidate) => candidate.typeId === itemTypeId)!;
    await expect(page.getByTestId(`cell-${item.cells[0]}`).locator('svg.item-icon')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('computer club accepts the authored placement and reveals the murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${computerClubLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(computerClubLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дарья');
});
