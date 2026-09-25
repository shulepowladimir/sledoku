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
  await page.clock.fastForward(5_000);
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

  await page.clock.fastForward(10_000);
  await page.reload();
  await page.goto(levelUrl);

  await expect(page.getByTestId(`cell-${placedCellId}`).locator('.person-token')).toHaveCount(1);
  await expect(page.getByTestId(`cell-${markCell}`).locator('.pencil-chip')).toHaveText(markPerson.initialLetter);
  await expect(page.getByTestId('hud-timer')).toHaveText('0:05');
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
