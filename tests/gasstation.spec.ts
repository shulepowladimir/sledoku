import { test, expect } from '@playwright/test';
import { gasStationLevel } from '../levels/64-gasstation';

test('У трассы 66 shows the revised common clues', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId('level-card-gasstation-01');
  await expect(card).toContainText('У трассы 66');
  await card.click();

  const general = page.getByTestId('roster-general');
  await expect(general).toContainText('Все с Анфисы по Владу были сотрудниками заправки; остальные — клиенты.');
  await expect(general).toContainText('В каждой зоне, кроме парковки, был сотрудник.');
  await expect(general).toContainText('Один из клиентов находился в автомойке.');
  await expect(general).not.toContainText(/ровно один мойщик|ровно двое/i);
});

test('У трассы 66 reveals its approved story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${gasStationLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(gasStationLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'Полуденная жара плавила асфальт на трассе 66. Путники заезжали на небольшую заправку около трассы: залить топливо в бак и холодные напитки — в себя. Дарья оставила свой автомобиль заправлять Анфисе и направилась за газировкой с френч-догом. Борислав стоял на кассе и наслаждался прохладой кондиционера. Гурий только подъехал на парковку и искал мелочь в бардачке. Христофор загнал свою машину в автомойку, и следом в бокс вошла мойщица Влада. За шумом щёток не было слышно, что происходит, но когда пена уже стекала по асфальту, белые пузыри сменились красными.',
  );
  await expect(storyDialog).toContainText('Влада оказалась убийцей Христофора.');
});
