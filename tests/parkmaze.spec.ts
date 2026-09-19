import { test, expect } from '@playwright/test';
import { parkMazeLevel } from '../levels/38-parkmaze';
import { polyominoEdgeSegments } from '../src/engine/polyomino';

// «Запутанный след» (parkmaze-01): механика ломаных предметов — кусты-полиомино
// с render: 'tile'. Ключевые проверки: 11 кустов рендерятся тайлами по клеткам,
// каждый несёт краевые декорации (тень-полоса по югу/востоку, волнистая «губа»
// по северу/западу, кроме кромки карты), hover даёт красную пунктирную обводку
// по полиомино, полный прогон решения побеждает.

const bushItems = parkMazeLevel.items.filter((i) => i.typeId === 'bushHedge');
const bushCellCount = bushItems.reduce((sum, i) => sum + i.cells.length, 0); // 66

// Ожидания считаем тем же движковым хелпером — единый источник правды.
const expectedScallops = (itemId: string) => {
  const item = parkMazeLevel.items.find((i) => i.id === itemId)!;
  return polyominoEdgeSegments(item.cells).filter(
    (s) => (s.dir === 'north' && s.row > 0) || (s.dir === 'west' && s.col > 0),
  ).length;
};
const expectedShadows = (itemId: string) => {
  const item = parkMazeLevel.items.find((i) => i.id === itemId)!;
  return polyominoEdgeSegments(item.cells).filter((s) => s.dir === 'south' || s.dir === 'east').length;
};

test('parkmaze-01: bush polyominoes render as seamless tiles with edge decorations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${parkMazeLevel.meta.id}`).click();

  // Поле 12×12 целиком.
  await expect(page.locator('.board .grid-cell')).toHaveCount(144);

  // 11 кустов-полиомино: тайлы по клеткам + краевые декорации.
  for (const item of bushItems) {
    const overlay = page.getByTestId(`item-tiles-${item.id}`);
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.item-tile-overlay__tile')).toHaveCount(item.cells.length);
    await expect(overlay.locator('.item-tile-overlay__scallop path')).toHaveCount(expectedScallops(item.id));
    await expect(overlay.locator('.item-tile-overlay__shadow rect')).toHaveCount(expectedShadows(item.id));
    await expect(overlay.locator('.item-tile-overlay__contour')).toHaveCount(1);
  }

  // Суммарно тайлов ровно столько, сколько «клеток-кустов» в гриде.
  await expect(page.locator('.item-tile-overlay__tile')).toHaveCount(bushCellCount);

  // Регрессия «гигантские квадраты»: кусты НЕ рендерятся старым bbox-оверлеем
  // (ItemOverlay) — все многоклеточные предметы уровня тайловые.
  await expect(page.locator('.board .item-overlay')).toHaveCount(0);

  // Регрессия labelAlign: подпись СЗ-зоны прижата к левому краю (её единственная
  // свободная клетка нижнего ряда — у шва с СВ), а не свисает над швом зон.
  const boardBox = await page.locator('.board').boundingBox();
  const nwLabel = await page.locator('.room-label', { hasText: 'Северо-запад парка' }).boundingBox();
  expect(boardBox).not.toBeNull();
  expect(nwLabel).not.toBeNull();
  expect(nwLabel!.x - boardBox!.x).toBeLessThan(boardBox!.width * 0.3);

  expect(errors).toEqual([]);
});

test('parkmaze-01: bent bush gets shadows on south/east and scallops on north/west', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${parkMazeLevel.meta.id}`).click();

  // item-bush-4 — уголок (2,10)(2,11)(3,10): 2 северных + 2 западных сегмента
  // (все вне кромки карты) = 4 лопасти; 2 южных + 2 восточных = 4 тени.
  const bent = page.getByTestId('item-tiles-item-bush-4');
  await expect(bent.locator('.item-tile-overlay__scallop path')).toHaveCount(4);
  await expect(bent.locator('.item-tile-overlay__shadow rect')).toHaveCount(4);

  // Лопасть — квадр. кривая наружу: path содержит Q, апекс выше кромки (минус).
  const scallopD = await bent.locator('.item-tile-overlay__scallop path').first().getAttribute('d');
  expect(scallopD).toMatch(/Q/);
  expect(scallopD).toMatch(/Q \d+ -\d+/);

  // Одиночный куст (item-bush-3, клетка 1,0): север лопасть, запад НА кромке
  // карты (col 0) — подрезан; юг+восток = 2 тени.
  const solo = page.getByTestId('item-tiles-item-bush-3');
  await expect(solo.locator('.item-tile-overlay__scallop path')).toHaveCount(1);
  await expect(solo.locator('.item-tile-overlay__shadow rect')).toHaveCount(2);

  // Куст у верхней кромки (item-bush-1, ряд 0): все 5 северных лопастей
  // подрезаны (row 0), остаются 3 западных — (0,2), (1,2), (1,6).
  const top = page.getByTestId('item-tiles-item-bush-1');
  await expect(top.locator('.item-tile-overlay__scallop path')).toHaveCount(3);
});

test('parkmaze-01: hover on a bush cell shows a red dashed decorative outline over the polyomino', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${parkMazeLevel.meta.id}`).click();

  // Клетка (2,10) — часть Г-образного куста; обводка decorative (ставить нельзя).
  await page.getByTestId('cell-2-10').hover();
  const outline = page.getByTestId('item-outline');
  await expect(outline).toBeVisible();
  await expect(outline).toHaveClass(/item-outline--decorative/);

  // Внутри — точный SVG-путь полиомино (не bbox-див).
  const svgPath = outline.locator('.item-outline__svg path');
  await expect(svgPath).toHaveCount(1);
  const d = await svgPath.getAttribute('d');
  expect(d!.match(/L/g)?.length ?? 0).toBeGreaterThanOrEqual(7);

  // Регрессия «обводит лишние клетки»: bbox-рамки нет — только SVG-силуэт.
  const borderless = await outline.evaluate((el) => getComputedStyle(el).borderTopWidth);
  expect(borderless).toBe('0px');

  // Уход с куста убирает обводку.
  await page.getByTestId('cell-4-4').hover(); // дорожка без предмета
  await expect(page.getByTestId('item-outline')).toHaveCount(0);
});

test('parkmaze-01: full solution run wins the level', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${parkMazeLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(parkMazeLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();
  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  await expect(banner).toContainText('Аркадий');
});
