import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';
import { shopLevel } from '../levels/02-shop';
import { museumLevel } from '../levels/03-museum';
import { parkLevel } from '../levels/04-park';
import { wildwestLevel } from '../levels/05-wildwest';
import { wizardSchoolLevel } from '../levels/06-wizardschool';
import { officeLevel } from '../levels/07-office';
import { mallLevel } from '../levels/08-mall';
import { forestLevel } from '../levels/09-forest';
import { stationLevel } from '../levels/10-station';
import { egyptLevel } from '../levels/11-egypt';

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
  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Денис оказался убийцей Христины.');
  await page.getByTestId('completion-story-close').click();
  await expect(storyDialog).toHaveCount(0);
  await page.getByTestId('victory-story-button').click();
  await expect(storyDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(storyDialog).toHaveCount(0);

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
  await expect(storyDialog).toHaveCount(0);
  await expect(page.getByTestId('victory-story-button')).toBeVisible();
  await expect(page.locator('.person-token')).toHaveCount(apartmentLevel.people.length);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId('noir-toggle').click();
  await page.getByTestId('victory-story-button').click();
  await expect(storyDialog).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/noir/);
  await expect.poll(() => storyDialog.evaluate((node) => getComputedStyle(node).backgroundColor))
    .toBe('rgb(26, 26, 31)');
  const dialogBox = await storyDialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(844);
  const actionHeights = await storyDialog.locator('.completion-story__actions button').evaluateAll(
    (buttons) => buttons.map((button) => button.getBoundingClientRect().height),
  );
  expect(actionHeights.every((height) => height >= 44)).toBe(true);
  await page.getByTestId('completion-story-menu').click();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByTestId('victory-banner')).toBeVisible();
  await expect(storyDialog).toHaveCount(0);
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

test('shop-01 shows its authored story and the shared murderer reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${shopLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(shopLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Галина задержалась у кассы');
  await expect(storyDialog).toContainText('Дмитрий оказался убийцей Христофора.');
});

test('museum-01 uses the approved scene and shared murderer reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${museumLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(museumLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Ночь в музее шла размеренно');
  await expect(storyDialog).toContainText('Демьян оказался убийцей Христины.');
});

test('park-01 inflects the shared murderer reveal for a female murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${parkLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(parkLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Вечером Вадим раскачивал качели');
  await expect(storyDialog).toContainText('Глафира оказалась убийцей Хариты.');
});

test('wildwest-01 shows the approved bank story', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wildwestLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(wildwestLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Августа и Борислав доигрывали партию в пул в салуне');
  await expect(storyDialog).toContainText('в банк вошёл шериф Харитон');
  await expect(storyDialog).toContainText('Дарья оказалась убийцей Харитона.');
});

test('wizardschool-01 shows the approved lesson scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wizardSchoolLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(wizardSchoolLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Ученики и профессора находились на занятиях');
  await expect(storyDialog).toContainText('Ева с Вольдемаром что-то замышляли в гостиной');
  await expect(storyDialog).toContainText('Дарко оказался убийцей Харита.');
});

test('office-01 preserves the approved wordplay and murderer reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${officeLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(officeLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Алексей наливал воду у кулера, а девушки — в растения.');
  await expect(storyDialog).toContainText('Гелена оказалась убийцей Христиана.');
});

test('mall-01 shows the approved closing-time scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${mallLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(mallLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('покупатели спешили приобрести товары по акции');
  await expect(storyDialog).toContainText('Хиония проверяла работу оборудования');
  await expect(storyDialog).toContainText('Захар оказался убийцей Хионии.');
});

test('forest-01 shows the approved ranger-outpost scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${forestLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(forestLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Туристы разбили палатки, развели костёр');
  await expect(storyDialog).toContainText('Зоя пошла за ним');
  await expect(storyDialog).toContainText('Зоя оказалась убийцей Харитона.');
});

test('station-01 shows the approved departure scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${stationLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(stationLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Аркадий и Есения приехали к своей подруге Христине на поезде');
  await expect(storyDialog).toContainText('молодой человек и попросил помочь разобраться с расписанием');
  await expect(storyDialog).toContainText('Демьян оказался убийцей Христины.');
});

test('egypt-01 shows the approved pyramid scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${egyptLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(egyptLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Факелы освещали путаные коридоры и залы пирамиды');
  await expect(storyDialog).toContainText('что будет погребена там сама');
  await expect(storyDialog).toContainText('Даниил оказался убийцей Хионии.');
});
