import { expect, test } from '@playwright/test';
import { chessLevel } from '../levels/68-chess';

test('Мат в 8 ходов shows the checkerboard, grouped color clue, and all authored pieces', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('level-card-chess-01').click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(64);
  await expect(page.getByTestId('roster-general')).toContainText(
    'Все с А по Г стояли на тёмных клетках, остальные - на светлых.',
  );
  await expect(page.getByTestId('roster-general').locator('.clue-item')).toHaveCount(1);
  await expect(page.getByTestId('cell-0-0')).toHaveAttribute('title', 'Тёмная клетка');
  await expect(page.getByTestId('cell-5-0').locator('.item-icon')).toHaveCSS('color', 'rgb(245, 233, 208)');
  await expect(page.getByTestId('cell-7-7').locator('.item-icon')).toHaveCSS('color', 'rgb(26, 26, 26)');
  await expect(page.locator('.board .item-icon')).toHaveCount(16);
});

test('solving Мат в 8 ходов reveals the approved living-chess story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('level-card-chess-01').click();

  for (const [personId, targetCell] of Object.entries(chessLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Это была напряжённая партия в живые шахматы, где роль части фигур на себя взяли сами игроки.');
  await expect(storyDialog).toContainText('Дина оказалась убийцей Харитона.');
});
