import { test, expect } from '@playwright/test';
import { policeStationLevel } from '../levels/65-policestation';

test('Участок 99 shows the three approved general clue groups on its 9x9 board', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId(`level-card-${policeStationLevel.meta.id}`);
  await expect(card).toContainText('Участок 99');
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(81);
  const general = page.getByTestId('roster-general');
  await expect(general).toContainText('Все с Анфисы по Гурия были полицейскими, остальные — посетителями.');
  await expect(general).toContainText('Среди полицейских был шеф полиции, а среди посетителей — преступник. Они могли быть или не быть убийцами.');
  await expect(general).toContainText('Шеф находился в своём кабинете, а преступник был рядом с пакетом улик.');
  await expect(general).not.toContainText('служебном помещении');
  await expect(general).not.toContainText('Харитон');
});

test('solving Участок 99 reveals the approved story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${policeStationLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(policeStationLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('В 99 участке царила повседневная суета.');
  await expect(storyDialog).toContainText('Анфиса оказалась убийцей Харитона.');
});
