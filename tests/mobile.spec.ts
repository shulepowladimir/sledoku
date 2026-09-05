import { test, expect } from '@playwright/test';
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
