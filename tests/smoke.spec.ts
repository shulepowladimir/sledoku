import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

test('menu -> full playthrough of apartment-01 -> victory -> back to menu', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-25T12:00:00Z') });
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
  await expect(page.getByTestId(`level-in-progress-${apartmentLevel.meta.id}`)).toHaveCount(0);

  await page.reload();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByTestId('victory-banner')).toBeVisible();
  await expect(page.locator('.person-token')).toHaveCount(apartmentLevel.people.length);
  const solvedTime = await page.getByTestId('hud-timer').innerText();
  await expect(page.getByTestId('hud-clear')).toBeDisabled();
  await expect(page.getByTestId('undo-button')).toBeDisabled();
  await expect(page.getByTestId('check-button')).toBeDisabled();

  const freeCell = apartmentLevel.cells.find(
    (cell) => !cell.itemId && !Object.values(apartmentLevel.solution).includes(cell.id),
  )!;
  await page.getByTestId(`roster-person-${apartmentLevel.people[0].id}`).click();
  await page.getByTestId(`cell-${freeCell.id}`).dblclick();
  await expect(page.getByTestId(`cell-${freeCell.id}`).locator('.person-token')).toHaveCount(0);

  await page.clock.fastForward(10_000);
  await expect(page.getByTestId('hud-timer')).toHaveText(solvedTime);
  await page.getByTestId('menu-button').click();
  await expect(card).toContainText('Раскрыто');
  await expect(page.getByTestId(`level-in-progress-${apartmentLevel.meta.id}`)).toHaveCount(0);

  await card.click();
  await expect(page.getByTestId('victory-banner')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTestId('hud-restart').click();
  await expect(page.locator('.person-token')).toHaveCount(0);
  await expect(page.getByTestId('victory-banner')).toHaveCount(0);

  await page.getByTestId('menu-button').click();
  await expect(card).toContainText('Раскрыто');
  await expect(page.getByTestId(`level-in-progress-${apartmentLevel.meta.id}`)).toBeVisible();

  await card.click();
  await expect(page.locator('.person-token')).toHaveCount(0);
  await expect(page.getByTestId('victory-banner')).toHaveCount(0);
});
