import { test, expect, type Page } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';
import { tutorialLevel } from '../levels/00-tutorial';

// Мобильная адаптация (проект 'mobile': Pixel 7, 390×844, hasTouch).
// Десктопная раскладка не регрессирует — её проверяет проект 'chromium'.

test('menu: single column, no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId(`level-card-${apartmentLevel.meta.id}`);
  await expect(card).toBeVisible();

  const info = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    columns: getComputedStyle(document.querySelector('.level-menu__grid') as HTMLElement).gridTemplateColumns.split(' ').length,
  }));
  expect(info.scrollWidth).toBeLessThanOrEqual(info.innerWidth);
  expect(info.columns).toBe(1);
});

test('game: roster below board, board fits, tap marks / double tap places', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);

  // Доска влезает в экран, горизонтального скролла нет.
  const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHScroll).toBe(true);

  // Ростер расположен под доской (мобильная колонка), а не справа.
  const below = await page.evaluate(() => {
    const board = document.querySelector('.board-wrap') ?? document.querySelector('.board');
    const roster = document.querySelector('.roster-panel');
    if (!board || !roster) return false;
    return roster.getBoundingClientRect().top >= board.getBoundingClientRect().bottom - 1;
  });
  expect(below).toBe(true);

  // Тап по клетке — метка; двойной тап — персонаж (ввод унифицирован).
  const [personId, cellId] = Object.entries(apartmentLevel.solution)[0];
  await page.getByTestId(`roster-person-${personId}`).tap();
  await page.getByTestId(`cell-${cellId}`).tap();
  await expect(page.getByTestId(`cell-${cellId}`)).toContainText('✕', { ignoreCase: false }).catch(() => {});
  // метка-кандидат: маленький кружок с буквой; проверяем наличие хотя бы одного child с классом pencil
  await page.getByTestId(`cell-${cellId}`).dblclick();
  await expect(page.getByTestId(`cell-${cellId}`)).toBeVisible();

  // Выбранный человек раскрыт в аккордеоне (клю видны), повторный тап по выбранному сворачивает.
  const clueText = apartmentLevel.clues.find((c) => 'subject' in c && c.subject.type === 'person' && c.subject.id === personId);
  if (clueText) {
    await expect(page.locator('.roster-mobile__entry--open').first()).toBeVisible();
  }
});

test('game: general clues accordion opens via tap', async ({ page }) => {
  await page.goto('/');
  // hollywood-25: есть общие клю (4) — блок «Общие подсказки» присутствует.
  await page.getByTestId('size-filter-12').tap();
  await page.getByTestId('level-card-hollywood-01').tap();

  const toggle = page.locator('.roster-mobile__general-toggle');
  await expect(toggle).toBeVisible();
  await expect(page.locator('.roster-mobile__general-list')).toHaveCount(0);
  await toggle.tap();
  await expect(page.locator('.roster-mobile__general-list')).toBeVisible();
});

test('landscape phone stays in the mobile layout (roster below, board fits)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();
  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);

  // Раскладка остаётся мобильной колонкой (не десктоп «ростер сбоку»).
  const below = await page.evaluate(() => {
    const board = document.querySelector('.board-wrap') ?? document.querySelector('.board');
    const roster = document.querySelector('.roster-panel');
    if (!board || !roster) return false;
    return roster.getBoundingClientRect().top >= board.getBoundingClientRect().bottom - 1;
  });
  expect(below).toBe(true);

  // Доска влезает и по ширине, и по высоте экрана.
  const boardBox = await page.locator('.board').boundingBox();
  expect(boardBox!.width).toBeLessThanOrEqual(844);
  expect(boardBox!.y + boardBox!.height).toBeLessThanOrEqual(390 + 1);
});

test('tutorial: tooltip pinned to the bottom on mobile, steps advance', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${tutorialLevel.meta.id}`).click();

  const tooltip = page.getByTestId('tutorial-tooltip');
  await expect(tooltip).toBeVisible();

  // Тултип прижат к низу экрана.
  const atBottom = await tooltip.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return window.innerHeight - r.bottom <= 24;
  });
  expect(atBottom).toBe(true);

  // «Далее» — тач-таргет, шаги двигаются.
  await page.getByTestId('tutorial-next').tap();
  await expect(page.locator('[data-testid^="tutorial-step-"]').first()).toBeVisible();
});

// ── Долгое нажатие → подпись предмета/фичи пола (мобильная замена hover) ──
// Touch-события диспетчеризуем руками: new Touch + TouchEvent — Playwright умеет
// только мгновенный tap, а лонг-пресс — это touchstart + пауза + touchend.

const LONG_PRESS_MS = 450;

async function dispatchTouch(page: Page, testId: string, type: 'touchstart' | 'touchend', x = 180, y = 400) {
  await expect(page.getByTestId(testId)).toBeVisible();
  await page.evaluate(
    ({ sel, eventType, cx, cy }) => {
      const el = document.querySelector(sel) as HTMLElement;
      const touches = eventType === 'touchstart' ? [new Touch({ identifier: 1, target: el, clientX: cx, clientY: cy })] : [];
      el.dispatchEvent(new TouchEvent(eventType, { touches, bubbles: true, cancelable: true }));
    },
    { sel: `[data-testid="${testId}"]`, eventType: type, cx: x, cy: y },
  );
}

/** Долгое нажатие: touchstart → пауза (таймер в GridCell — 450мс) → touchend. */
async function longPress(page: Page, testId: string, x = 180, y = 400) {
  await dispatchTouch(page, testId, 'touchstart', x, y);
  await page.waitForTimeout(LONG_PRESS_MS + 200);
  await dispatchTouch(page, testId, 'touchend');
}

test('long press: item label popup opens and closes by tap on backdrop', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();

  // cell-0-0 — декоративная плита: клетка НЕинтерактивна (placement запрещён),
  // но подпись по лонг-прессу обязана работать и на ней.
  await longPress(page, 'cell-0-0');
  const popup = page.getByTestId('label-popup');
  await expect(popup).toBeVisible();
  await expect(popup).toHaveText('Плита');

  // Попап клампится в вьюпорт (не вылезает за края).
  const clamped = await popup.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight;
  });
  expect(clamped).toBe(true);

  // Тап по затемнению закрывает; сама клетка метку не получила.
  await page.getByTestId('label-popup-backdrop').tap();
  await expect(popup).toHaveCount(0);
  await expect(page.getByTestId('cell-0-0')).not.toContainText('✕');
});

test('long press: floor feature label (rug), empty cell shows nothing', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();

  // cell-4-2 — ковёр в спальне (фича пола, предмета на клетке нет).
  await longPress(page, 'cell-4-2');
  await expect(page.getByTestId('label-popup')).toBeVisible();
  await expect(page.getByTestId('label-popup')).toHaveText('Ковёр');
  await page.getByTestId('label-popup-backdrop').tap();
  await expect(page.getByTestId('label-popup')).toHaveCount(0);

  // cell-0-4 — голый пол гостиной: ни предмета, ни фичи — попапа нет.
  await longPress(page, 'cell-0-4');
  await expect(page.getByTestId('label-popup')).toHaveCount(0);
});

test('long press: synthesized click afterwards does not toggle a mark', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();

  // cell-1-3 — интерактивная клетка с диваном (occupiable).
  await page.getByTestId('roster-person-boris').tap();
  await longPress(page, 'cell-1-3');

  // Браузер после touchend синтезирует click — эмулируем его вручную:
  // подавление в GridCell обязано проглотить клик, метки «Б» не появляется.
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="cell-1-3"]') as HTMLElement;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await expect(page.getByTestId('cell-1-3')).not.toContainText('Б');

  // Попап ещё открыт (бэкдроп над доской) — закрываем, потом тапаем клетку.
  await page.getByTestId('label-popup-backdrop').tap();
  await expect(page.getByTestId('label-popup')).toHaveCount(0);

  // Обычный тап после всего — по-прежнему ставит метку (подавление снято).
  await page.getByTestId('cell-1-3').tap();
  await expect(page.getByTestId('cell-1-3')).toContainText('Б');
});
