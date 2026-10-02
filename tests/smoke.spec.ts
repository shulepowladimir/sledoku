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
import { spaceLevel } from '../levels/12-space';
import { hospitalLevel } from '../levels/13-hospital';
import { wildwest2Level } from '../levels/14-wildwest2';
import { stadiumLevel } from '../levels/15-stadium';
import { prisonLevel } from '../levels/16-prison';
import { hotelLevel } from '../levels/17-hotel';
import { islandLevel } from '../levels/18-island';
import { lighthouseLevel } from '../levels/19-lighthouse';
import { trainLevel } from '../levels/20-train';
import { medievalLevel } from '../levels/21-medieval';
import { amusementParkLevel } from '../levels/22-amusementpark';
import { airportLevel } from '../levels/23-airport';
import { zooLevel } from '../levels/24-zoo';
import { hollywoodLevel } from '../levels/25-hollywood';
import { streetLevel } from '../levels/26-street';
import { giantHouseLevel } from '../levels/27-gianthouse';
import { skiHotelLevel } from '../levels/28-skihotel';
import { circusLevel } from '../levels/29-circus';
import { dinerLevel } from '../levels/30-diner';

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

test('space-01 shows the approved orbital-station scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${spaceLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(spaceLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Аглая и Всеволод по очереди смотрели в телескоп');
  await expect(storyDialog).toContainText('В космосе никто не услышит твоих криков');
  await expect(storyDialog).toContainText('Есения оказалась убийцей Христофора.');
});

test('hospital-01 shows the approved consultation scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${hospitalLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(hospitalLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Борис осматривал Дарью, Геннадий принимал Захара');
  await expect(storyDialog).toContainText('этот приём стал для неё последним');
  await expect(storyDialog).toContainText('Ирина оказалась убийцей Христины.');
});

test('wildwest-02 shows the approved town scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${wildwest2Level.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(wildwest2Level.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('обычный размеренный день');
  await expect(storyDialog).toContainText('Шериф Илья и его помощница седлали лошадей в конюшне');
  await expect(storyDialog).toContainText('Демьян оказался убийцей Харитона.');
});

test('stadium-01 shows the approved match scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${stadiumLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(stadiumLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Аркадий и Инна подскочили во время опасного момента');
  await expect(storyDialog).toContainText('Дарья на беговой дорожке увидела главный удар этого матча');
  await expect(storyDialog).toContainText('Григорий оказался убийцей Христофора.');
});

test('prison-01 shows the approved shift-change scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${prisonLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(prisonLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Андрей следил за Дарьей во внутреннем дворе');
  await expect(storyDialog).toContainText('Захар давно точил зуб на Христофора');
  await expect(storyDialog).toContainText('Когда Ефим дошёл до зала, приговор уже был приведён в действие.');
  await expect(storyDialog).toContainText('Захар оказался убийцей Христофора.');
});

test('hotel-01 shows the approved night-shift scene and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${hotelLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(hotelLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('некая Зоя');
  await expect(storyDialog).toContainText('Утром ковёр из люкса пришлось сдавать в химчистку.');
  await expect(storyDialog).toContainText('Зоя оказалась убийцей Харитона.');
});

test('island-01 shows the approved island story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${islandLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(islandLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('На карте остров значился необитаемым');
  await expect(storyDialog).toContainText('Прилив вернулся на пляж, Харита — нет.');
  await expect(storyDialog).toContainText('Галина оказалась убийцей Хариты.');
});

test('lighthouse-01 shows the approved lighthouse story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${lighthouseLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(lighthouseLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Тёмная дождливая ночь окутала скалу');
  await expect(storyDialog).toContainText('Глафира уже спускалась со скал к Аркадию');
  await expect(storyDialog).toContainText('Обнаружили Хионию на дорожке только на рассвете.');
  await expect(storyDialog).toContainText('Демьян оказался убийцей Хионии.');
});

test('train-01 shows the approved story and places each car label on the opposite edge', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${trainLevel.meta.id}`).click();

  const expectedLabelPositions: Record<string, 'top' | 'bottom'> = {
    loco: 'bottom',
    baggage: 'top',
    sleeper: 'bottom',
    dining: 'top',
    platskart: 'bottom',
    service: 'top',
  };
  for (const room of trainLevel.rooms) {
    const position = expectedLabelPositions[room.id];
    const roomRows = trainLevel.cells.filter((cell) => cell.roomId === room.id).map((cell) => cell.row);
    const edgeRow = position === 'top' ? Math.min(...roomRows) : Math.max(...roomRows);
    const expectedTop = position === 'top' ? edgeRow * 64 + 4 : (edgeRow + 1) * 64;
    await expect(page.locator('.room-label').filter({ hasText: room.name })).toHaveCSS('top', `${expectedTop}px`);
  }

  for (const [personId, cellId] of Object.entries(trainLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Проводники Анфиса и Ефим разделились');
  await expect(storyDialog).toContainText('Но там под полкой его уже поджидал Ефим.');
  await expect(storyDialog).toContainText('Для Харитона конечная наступила раньше.');
  await expect(storyDialog).toContainText('Ефим оказался убийцей Харитона.');
});

test('medieval-01 shows the approved castle conspiracy and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${medievalLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(medievalLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('покушение на короля Харитона');
  await expect(storyDialog).toContainText('Гурий управлял операцией из королевских покоев');
  await expect(storyDialog).toContainText('он в этом деле был на коне.');
  await expect(storyDialog).toContainText('Елисей оказался убийцей Харитона.');
});

test('amusementpark-01 shows the approved season-closing story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${amusementParkLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(amusementParkLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Посетители гуляли по скверу и ужинали в кафе.');
  await expect(storyDialog).toContainText('Харитина ждала последних посетителей у колеса обозрения');
  await expect(storyDialog).toContainText('дело Харитины только открылось.');
  await expect(storyDialog).toContainText('Григорий оказался убийцей Харитины.');
});

test('airport-01 shows the approved delayed-flight story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${airportLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(airportLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Ночной рейс переносили раз за разом.');
  await expect(storyDialog).toContainText('И только багаж пассажиров всё никак не поступал на рейс');
  await expect(storyDialog).toContainText('для грузчика Харитона утро уже не наступило.');
  await expect(storyDialog).toContainText('Григорий оказался убийцей Харитона.');
});

test('zoo-01 shows the approved animal-keeper story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${zooLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(zooLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Ксения на кассе наблюдала, как Инна в сувенирной лавке выбирает');
  await expect(storyDialog).toContainText('Харитину ещё не скоро найдут на дне пруда.');
  await expect(storyDialog).toContainText('настоящему хищнику в этой истории только предстоит за неё попасть.');
  await expect(storyDialog).toContainText('Гурий оказался убийцей Харитины.');
});

test('hollywood-01 shows the approved final-take story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${hollywoodLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(hollywoodLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Режиссёр Всеволод объявляет');
  await expect(storyDialog).toContainText('сценаристы Леонид и Хиония пересматривали последние отснятые эпизоды');
  await expect(storyDialog).toContainText('он написал финал для неё.');
  await expect(storyDialog).toContainText('Леонид оказался убийцей Хионии.');
});

test('street-01 shows the approved dawn story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${streetLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(streetLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('В ночном предрассветном квартале день только начинал вступать в свои права.');
  await expect(storyDialog).toContainText('Есения шла на встречу с Демидом.');
  await expect(storyDialog).toContainText('а Виктор промочил ноги в луже.');
  await expect(storyDialog).toContainText('а веки Христины опустились навсегда.');
  await expect(storyDialog).toContainText('Белла оказалась убийцей Христины.');
});

test('gianthouse-01 shows the approved giant-house story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${giantHouseLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(giantHouseLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('В доме великана даже посуда была целой площадкой для человека');
  await expect(storyDialog).toContainText('Богдан изучал комнату, которая оказалась просто стулом размером с комнату');
  await expect(storyDialog).toContainText('За огромными тапками Геннадию удалось занять укрытие');
  await expect(storyDialog).toContainText('Геннадий оказался убийцей Харитины.');
});

test('skihotel-01 shows the approved avalanche story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${skiHotelLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(skiHotelLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('На склоне объявили сход лавины');
  await expect(storyDialog).toContainText('под горячительными напитками между Глафирой и Харитоном разгорелся жаркий спор.');
  await expect(storyDialog).toContainText('из бара вышла уже только Глафира.');
  await expect(storyDialog).toContainText('Глафира оказалась убийцей Харитона.');
});

test('circus-01 shows the approved wandering-circus story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${circusLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(circusLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('дрессировщики Анна и Борис репетировали в зверинце');
  await expect(storyDialog).toContainText('Зрители тоже занимали места, каждый — свои');
  await expect(storyDialog).toContainText('бородатая женщина — это на самом деле мужчина по имени Ждан.');
  await expect(storyDialog).toContainText('Ждан оказался убийцей Харитона.');
});

test('diner-01 shows the approved roadside-cafe story and reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${dinerLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(dinerLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Борис подъехал на мотоцикле на парковку придорожного кафе.');
  await expect(storyDialog).toContainText('В зале Григорий включил погромче песню на музыкальном автомате');
  await expect(storyDialog).toContainText('Кетчупа в его заказе не было.');
  await expect(storyDialog).toContainText('Григорий оказался убийцей Харитона.');
});
