import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

test('level links open directly and browser history follows menu navigation', async ({ page }) => {
  const levelUrl = `/?level=${apartmentLevel.meta.id}`;
  await page.goto(levelUrl);

  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);
  await expect(page).toHaveURL(new RegExp(`level=${apartmentLevel.meta.id}`));

  await page.getByTestId('menu-button').click();
  await expect(page).toHaveURL('/');
  await page.goBack();
  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);
  await page.goForward();
  await expect(page.getByTestId(`level-card-${apartmentLevel.meta.id}`)).toBeVisible();
});

test('menu defers gallery and gameplay modules until they are opened', async ({ page }) => {
  const deferredRequests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (
      url.includes('/src/components/dev/AssetGallery.tsx') ||
      url.includes('/src/components/game/GameScreen.tsx') ||
      url.includes('/src/components/board/ItemIcon.tsx') ||
      url.includes('/src/components/board/PersonFigureSvg.tsx')
    ) {
      deferredRequests.push(url);
    }
  });

  await page.goto('/');
  await expect(page.getByTestId('level-card-library-01')).toBeVisible();
  expect(deferredRequests).toEqual([]);

  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);
  await expect.poll(() => deferredRequests.some((url) => url.includes('/src/components/game/GameScreen.tsx'))).toBe(true);
  await expect.poll(() => deferredRequests.some((url) => url.includes('/src/components/board/ItemIcon.tsx'))).toBe(true);
  await expect.poll(() => deferredRequests.some((url) => url.includes('/src/components/board/PersonFigureSvg.tsx'))).toBe(true);
  expect(deferredRequests.some((url) => url.includes('/src/components/dev/AssetGallery.tsx'))).toBe(false);
});

test('unfinished draft restores placements, pencil marks, and paused time', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-25T12:00:00Z') });
  await page.addInitScript((levelId) => {
    if (!localStorage.getItem('sledoku:guest-best-times')) {
      localStorage.setItem('sledoku:guest-best-times', JSON.stringify({ [levelId]: 60_000 }));
    }
    if (!localStorage.getItem('sledoku:guest-level-drafts:v1')) {
      localStorage.setItem('sledoku:guest-level-drafts:v1', JSON.stringify({
        [levelId]: {
          version: 1,
          levelId,
          savedAt: Date.now(),
          player: { placements: {}, cellMarks: {}, elapsedMs: 0, lastResult: null },
        },
      }));
    }
  }, apartmentLevel.meta.id);

  const levelUrl = `/?level=${apartmentLevel.meta.id}`;
  const [placedPersonId, placedCellId] = Object.entries(apartmentLevel.solution)[0];
  const markPerson = apartmentLevel.people.find((person) => person.id !== placedPersonId)!;
  const [placedRow, placedCol] = placedCellId.split('-').map(Number);
  const markCell = apartmentLevel.cells.find((cell) =>
    !cell.itemId && cell.row !== placedRow && cell.col !== placedCol,
  )!.id;

  await page.goto(levelUrl);
  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 5_000);
  await page.getByTestId(`roster-person-${placedPersonId}`).click();
  await page.getByTestId(`cell-${placedCellId}`).dblclick();
  await page.getByTestId(`roster-person-${markPerson.id}`).click();
  await page.getByTestId(`cell-${markCell}`).click();
  await expect(page.getByTestId(`cell-${markCell}`).locator('.pencil-chip')).toHaveText(markPerson.initialLetter);

  await page.getByTestId('menu-button').click();
  const card = page.getByTestId(`level-card-${apartmentLevel.meta.id}`);
  await expect(card).toContainText('Раскрыто');
  await expect(card).toContainText('В процессе расследования');
  await page.getByTestId('hide-solved-toggle').click();
  await expect(card).toBeVisible();

  const savedElapsedMs = await page.evaluate((levelId) => {
    const drafts = JSON.parse(localStorage.getItem('sledoku:guest-level-drafts:v1') ?? '{}');
    return drafts[levelId].player.elapsedMs as number;
  }, apartmentLevel.meta.id);
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 10_000);
  const elapsedAfterMenuWait = await page.evaluate((levelId) => {
    const drafts = JSON.parse(localStorage.getItem('sledoku:guest-level-drafts:v1') ?? '{}');
    return drafts[levelId].player.elapsedMs as number;
  }, apartmentLevel.meta.id);
  expect(elapsedAfterMenuWait).toBe(savedElapsedMs);
  await page.clock.resume();
  await page.reload();
  await page.goto(levelUrl);

  await expect(page.locator('.board .grid-cell')).toHaveCount(apartmentLevel.cells.length);
  await expect(page.getByTestId(`cell-${placedCellId}`).locator('.person-token')).toHaveCount(1);
  await expect(page.getByTestId(`cell-${markCell}`).locator('.pencil-chip')).toHaveText(markPerson.initialLetter);
  const [minutes, seconds] = (await page.getByTestId('hud-timer').textContent() ?? '0:00').split(':').map(Number);
  expect(minutes * 60 + seconds).toBeGreaterThanOrEqual(Math.floor(savedElapsedMs / 1_000));
});

test('legacy completed best time restores a solved board without an in-progress status', async ({ page }) => {
  await page.addInitScript((levelId) => {
    localStorage.setItem('sledoku:guest-best-times', JSON.stringify({ [levelId]: 60_000 }));
  }, apartmentLevel.meta.id);

  await page.goto(`/?level=${apartmentLevel.meta.id}`);
  await expect(page.getByTestId('victory-banner')).toBeVisible();
  await expect(page.locator('.person-token')).toHaveCount(apartmentLevel.people.length);

  await page.getByTestId('menu-button').click();
  const card = page.getByTestId(`level-card-${apartmentLevel.meta.id}`);
  await expect(card).toContainText('Раскрыто');
  await expect(page.getByTestId(`level-in-progress-${apartmentLevel.meta.id}`)).toHaveCount(0);
});

test('unknown level links return to the menu and remove the invalid level parameter', async ({ page }) => {
  await page.goto('/?level=does-not-exist');

  await expect(page.getByTestId('site-footer')).toBeVisible();
  await expect(page.locator('.board')).toHaveCount(0);
  await expect(page).toHaveURL('/');
});

test('tutorial links start the guided scenario from its first step', async ({ page }) => {
  await page.goto('/?level=tutorial-00');

  await expect(page.locator('[data-testid^="tutorial-step-"]').first()).toBeVisible();
  await expect(page).toHaveURL('/?level=tutorial-00');
});
