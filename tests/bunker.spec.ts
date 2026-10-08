import { expect, test } from '@playwright/test';
import { bunkerLevel } from '../levels/67-bunker';

test('110 метров под землёй shows the authored 11-by-10 board and empty-floor clue', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId(`level-card-${bunkerLevel.meta.id}`);

  await expect(card).toContainText('110 метров под землёй');
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(110);
  await expect(page.getByTestId('roster-general')).toContainText(
    'Пустым остался ровно один из этажей −20, −40 и −80 м.',
  );
  await expect(page.getByTestId('roster-general').getByText(
    'В энергоблоке и шлюзе выхода было ровно по два человека.',
    { exact: true },
  )).toHaveCount(1);
});

test('bunker greenhouse bed gets soil-colored tile shadows and scalloped edges', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${bunkerLevel.meta.id}`).click();

  const bed = bunkerLevel.items.find((item) => item.typeId === 'gardenBed');
  expect(bed).toBeDefined();
  const overlay = page.getByTestId(`item-tiles-${bed!.id}`);
  await expect(overlay).toBeVisible();
  await expect(overlay.locator('.item-tile-overlay__tile')).toHaveCount(bed!.cells.length);
  await expect(overlay.locator('.item-tile-overlay__scallop path')).toHaveCount(4);
  await expect(overlay.locator('.item-tile-overlay__shadow rect')).toHaveCount(4);
  await expect(overlay.locator('.item-tile-overlay__scallop path').first()).toHaveCSS('fill', 'rgb(143, 90, 58)');
  await expect(overlay.locator('.item-tile-overlay__shadow rect').first()).toHaveCSS('fill', 'rgb(90, 59, 43)');
  await expect(overlay.locator('.item-tile-overlay__contour')).toHaveCSS('stroke', 'rgb(58, 42, 32)');
});

test('solving the bunker reveals the blackout story and names Gleb as Hariton’s murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${bunkerLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(bunkerLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'В бункере на глубине 110 метров внезапно погас свет. Ада и Борис в этот момент протирали стекло у выходного шлюза. Дина была на приёме у Веры в медблоке. Жанна отшатнулась от края лестницы, чтобы не упасть — только что они через балкон общались с Зоей в оранжерее. Егор в это время спал, поэтому даже не заметил отключения. Глеб отправил Илью в технический отдел за инструментом, пока он сам с Харитоном поищет причину в энергоблоке. Хотя именно Глеб сам и вывел из строя реактор через пульт жизнеобеспечения. Через несколько мгновений всё загудело, и лампочки на этажах снова стали зажигаться сверху вниз. Все завороженно смотрели на этот свет, а Харитон отправился на тот.',
  );
  await expect(storyDialog).toContainText('Глеб оказался убийцей Харитона.');
});
