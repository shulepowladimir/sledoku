import { expect, test } from '@playwright/test';
import { hippodromeLevel } from '../levels/72-hippodrome';
import { completionStories } from '../src/content/completionStories';

const expectedStory = {
  text: 'Зрители собирались на трибунах ипподрома, делали ставки на лошадей и готовились к старту скачек. Дина и Есения уже заняли места, когда судья Кирилл дал стартовый выстрел. Жокеи погнали скакунов по дорожкам: Василиса резко вырвалась вперёд, за ней шёл Андрей. Жанне и Захару повезло меньше — Жанна пока лишь отставала от лидеров, а лошадь Захара заупрямилась в загоне и вовсе не вышла на дорожку. Борис уже спешил на помощь Захару, когда прогремел второй выстрел. Ирина и Кирилл переглянулись: судейский пистолет лежал на столе. У букмекеров на ипподроме были жёсткие порядки, но жокей Харитон играл в свою игру. Григорий доходчиво объяснил ему правила этой игры.',
  victimGenitive: 'Харитона',
};

test('Подкова удачи shows the board, general notes, labeled gates, and the horse-count clue', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${hippodromeLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(121);
  await expect(page.locator('.roster-panel__title')).toHaveText('Подкова удачи');
  await expect(page.getByTestId('roster-general').locator('.clue-item')).toHaveCount(2);
  await expect(page.getByTestId('roster-general')).toContainText('Ровно одна лошадь осталась без наездника.');
  await expect(page.getByTestId('roster-general')).toContainText(
    'Если персонаж находился у ворот, то он мог быть в клетке над воротами или в клетке под воротами, в том числе в разных зонах',
  );
  for (const edgeItem of hippodromeLevel.edgeItems ?? []) {
    await expect(page.getByTestId(`edge-item-${edgeItem.id}`)).toBeVisible();
  }

  const gate = page.getByTestId('edge-item-gate-start');
  const gateBounds = await gate.boundingBox();
  if (!gateBounds) throw new Error('Expected the third-track gate to have visible bounds.');
  await page.mouse.move(gateBounds.x + gateBounds.width / 2, gateBounds.y + gateBounds.height / 2);
  const tooltip = page.getByTestId('item-label-tooltip');
  await expect(tooltip).toHaveText('Стартовые ворота');
  await expect(tooltip).toHaveCSS('background-color', 'rgb(255, 253, 247)');
  await expect(tooltip).toHaveCSS('border-radius', '7px');
});

test('solving hippodrome reveals its approved story and murderer', async ({ page }) => {
  expect(completionStories[hippodromeLevel.meta.id]).toEqual(expectedStory);

  await page.goto('/');
  await page.getByTestId(`level-card-${hippodromeLevel.meta.id}`).click();
  for (const [personId, cell] of Object.entries(hippodromeLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const dialog = page.getByTestId('completion-story-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(expectedStory.text);
  await expect(dialog).toContainText('Григорий оказался убийцей Харитона.');
});
