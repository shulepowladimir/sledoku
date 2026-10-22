import { expect, test } from '@playwright/test';
import { christmasFairLevel } from '../levels/71-christmas-fair';
import { completionStories } from '../src/content/completionStories';

test('Переполох с подарками показывает карту и подсказки без общих групп', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId(`level-card-${christmasFairLevel.meta.id}`))
    .toContainText('Переполох с подарками');
  await page.getByTestId(`level-card-${christmasFairLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(144);
  await expect(page.locator('.roster-panel__title')).toHaveText('Переполох с подарками');

  const commonClues = page.getByTestId('roster-general').locator('.clue-item');
  await expect(commonClues).toHaveCount(0);
  const aglayaHeader = page.getByTestId('roster-person-aglaya');
  await aglayaHeader.click();
  await expect(aglayaHeader.locator('..').locator('.roster-entry__clue')
    .filter({ hasText: 'Аглая находилась севернее Виктора.' })).toHaveCount(1);
  const liudmilaHeader = page.getByTestId('roster-person-liudmila');
  await liudmilaHeader.click();
  await expect(liudmilaHeader.locator('..').locator('.roster-entry__clue')
    .filter({ hasText: 'В столбце Людмилы не было саней.' })).toHaveCount(1);

  for (const [cellId, label] of [
    ['0-1', 'Праздничный прилавок'],
    ['1-1', 'Подарок'],
    ['1-9', 'Сани'],
    ['5-7', 'Гирлянда'],
  ]) {
    await page.getByTestId(`cell-${cellId}`).hover();
    await expect(page.getByTestId('item-label-tooltip')).toHaveText(label);
  }
});

test('solving christmas-fair-01 reveals the authored story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${christmasFairLevel.meta.id}`).click();

  for (const [personId, cell] of Object.entries(christmasFairLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const story = completionStories[christmasFairLevel.meta.id]!;
  const dialog = page.getByTestId('completion-story-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(story.text);
  await expect(dialog).toContainText('Жанна оказалась убийцей Харитона.');
});
