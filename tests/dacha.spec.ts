import { test, expect } from '@playwright/test';
import { dachaLevel } from '../levels/62-dacha';

test('Шесть соток renders its board, textures, polyomino beds, and new items', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  const card = page.getByTestId(`level-card-${dachaLevel.meta.id}`);
  await expect(card).toContainText('Шесть соток');
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(36);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(6);

  for (const [id, texture] of [
    ['0-0', 'grass'],
    ['0-2', 'wood'],
    ['3-0', 'marble'],
    ['4-4', 'stairs'],
  ]) {
    const background = await page.getByTestId(`cell-${id}`).evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(background, `${texture} should render on cell ${id}`).toContain('url(');
  }

  const beds = dachaLevel.items.filter((item) => item.typeId === 'gardenBed');
  expect(beds).toHaveLength(3);
  for (const bed of beds) {
    const overlay = page.getByTestId(`item-tiles-${bed.id}`);
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.item-tile-overlay__tile')).toHaveCount(bed.cells.length);
    await expect(overlay.locator('.item-tile-overlay__scallop path')).toHaveCount(0);
    await expect(overlay.locator('.item-tile-overlay__shadow rect')).toHaveCount(0);
    await expect(overlay.locator('.item-tile-overlay__contour')).toHaveCount(1);
  }

  for (const cellId of ['0-3', '2-5', '4-4']) {
    await expect(page.getByTestId(`cell-${cellId}`).locator('svg.item-icon')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('solving the approved placement reveals Борис and the approved completion story', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${dachaLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(dachaLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Борис');
  await expect(page.getByTestId('victory-story-button')).toBeVisible();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'На дачном участке всегда все при деле. Аглая хлопотала на грядках, Владимир собирал сено, а Демид — урожай из теплицы. Галина вышла из домика до туалета, и в нём остались только Борис, хозяин дома, и соседка Харита. Позже Борис вышел один и сказал, что Харита уже взяла соль, за которой заходила, и ушла к себе на участок. Но на соседний участок хозяйка не вернулась.',
  );
  await expect(storyDialog).toContainText('Борис оказался убийцей Хариты.');
});
