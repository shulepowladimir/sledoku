import { expect, test } from '@playwright/test';
import { airplaneLevel } from '../levels/70-9000m';

test('9000м над землёй shows the cabin map and exactly three common clues', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('level-card-airplane-01')).toContainText('9000м над землёй');
  await page.getByTestId('level-card-airplane-01').click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(81);
  await expect(page.locator('.roster-panel__title')).toHaveText('9000м над землёй');
  const commonClues = page.getByTestId('roster-general').locator('.clue-item');
  await expect(commonClues).toHaveCount(3);
  await expect(page.getByTestId('roster-general')).toContainText('Все с А по Г были членами экипажа, остальные — пассажирами.');
  await expect(page.getByTestId('roster-general')).toContainText('Члены экипажа находились в кабине пилотов и в проходе, пассажиры — на своих местах.');
  await expect(page.getByTestId('roster-general')).toContainText('В небе никто не находился.');

  await expect(page.locator('.board .item-icon')).toHaveCount(48);
  await expect(page.getByTestId('cell-0-1').locator('.item-icon')).toHaveCSS('transform', 'matrix(0, -1, 1, 0, 0, 0)');
  await expect(page.getByTestId('cell-1-4').locator('.item-icon')).toHaveCSS('transform', 'matrix(0, -1, 1, 0, 0, 0)');
  for (const [cellId, label] of [
    ['0-0', 'Иллюминатор'],
    ['1-6', 'Пульт управления'],
    ['4-2', 'Тележка стюардессы'],
    ['4-6', 'Станция связи'],
    ['5-8', 'Рация'],
    ['2-7', 'Штурвал самолёта'],
    ['0-1', 'Кресло самолёта'],
  ]) {
    await page.getByTestId(`cell-${cellId}`).hover();
    await expect(page.getByTestId('item-label-tooltip')).toHaveText(label);
  }
});

test('9000м над землёй reveals the approved story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${airplaneLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(airplaneLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'Трансатлантический рейс шёл по своему курсу. Стюардессы Анна и Галина уже разнесли питание пассажирам. Галина зашла в кабину пилотов к Вере и Борису, а Анна осталась в проходе наводить порядок. Пассажиры сидели по своим местам: Егор и Зоя летели бизнес-классом, а в экономе — Жанна, Харитон и Дмитрий. На обед Харитон выбрал курицу, Жанна — рыбу, а Дмитрий — убийство.',
  );
  await expect(storyDialog).toContainText('Дмитрий оказался убийцей Харитона.');
});
