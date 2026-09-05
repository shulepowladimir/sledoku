import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

test('menu -> full playthrough of apartment-01 -> victory -> back to menu', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(apartmentLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }

  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  const murderer = apartmentLevel.people.find((p) => p.isMurderer);
  await expect(banner).toContainText(`Убийцей оказался ${murderer?.name}.`);

  // Десктоп-регрессия раскладки: ростер прижат к доске (gap 24px), а не уехал к правому краю.
  const layoutGap = await page.evaluate(() => {
    const board = (document.querySelector('.board-wrap') ?? document.querySelector('.board'))!.getBoundingClientRect();
    const roster = document.querySelector('.roster-panel')!.getBoundingClientRect();
    return roster.left - board.right;
  });
  expect(layoutGap).toBeGreaterThanOrEqual(20);
  expect(layoutGap).toBeLessThanOrEqual(30);

  await page.getByTestId('menu-button').click();

  const card = page.getByTestId(`level-card-${apartmentLevel.meta.id}`);
  await expect(card).toContainText('Раскрыто');
});
