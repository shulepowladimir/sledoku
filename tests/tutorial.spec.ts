import { test, expect, type Page } from '@playwright/test';
import { tutorialLevel } from '../levels/00-tutorial';

const step = (page: Page, id: string) => page.getByTestId(`tutorial-step-${id}`);
const next = (page: Page) => page.getByTestId('tutorial-next').click();
const click = (page: Page, testId: string) => page.getByTestId(testId).click();
const rclick = (page: Page, testId: string) => page.getByTestId(testId).click({ button: 'right' });

test('tutorial: full guided playthrough ends with victory and no record', async ({ page }) => {
  await page.goto('/');
  await click(page, 'level-card-tutorial-00');

  // The tutorial must start automatically on entering the level.
  await expect(step(page, 'welcome')).toBeVisible();

  // Act 0: greeting — three "Далее" steps.
  await next(page);
  await expect(step(page, 'goal')).toBeVisible();
  await next(page);
  await expect(step(page, 'main-rule')).toBeVisible();
  await next(page);
  await expect(step(page, 'board')).toBeVisible();

  // Act 1: interface tour.
  await next(page); // board
  await expect(step(page, 'items-occupiable')).toBeVisible();
  await next(page); // items-occupiable
  await expect(step(page, 'items-decorative')).toBeVisible();
  await next(page); // items-decorative
  await expect(step(page, 'roster')).toBeVisible();
  await click(page, 'roster-person-andrei'); // roster (action: select Andrei)
  await expect(step(page, 'roster-2')).toBeVisible();
  await next(page); // roster-2
  await expect(step(page, 'victim')).toBeVisible();
  await next(page); // victim
  await expect(step(page, 'general')).toBeVisible();
  await next(page); // general
  await expect(step(page, 'timer')).toBeVisible();
  await next(page); // timer
  await expect(step(page, 'howto')).toBeVisible();
  await next(page); // howto
  await expect(step(page, 'boris-clues')).toBeVisible();

  // Act 2: Boris — two corner chairs, marks, lesson B (cross at the intersection).
  await next(page); // boris-clues
  await click(page, 'roster-person-boris'); // boris-select (action)
  await expect(step(page, 'boris-marks')).toBeVisible();
  await rclick(page, 'cell-1-4'); // boris-marks (action)
  await rclick(page, 'cell-4-0');
  await expect(step(page, 'lesson-b')).toBeVisible();
  await click(page, 'hud-mode-cross'); // switch to cross mode
  await click(page, 'cell-1-0'); // lesson-b (action): cross the live intersection cell
  await expect(step(page, 'boris-hold')).toBeVisible();
  await next(page); // boris-hold
  await expect(step(page, 'andrei-clues')).toBeVisible();

  // Act 3: Andrei — three marks in one row, lesson A (cross the row's chair).
  await next(page); // andrei-clues
  await click(page, 'roster-person-andrei'); // andrei-select (action)
  await expect(step(page, 'andrei-marks')).toBeVisible();
  await rclick(page, 'cell-0-0'); // andrei-marks (action)
  await rclick(page, 'cell-0-1');
  await rclick(page, 'cell-0-4');
  await expect(step(page, 'lesson-a')).toBeVisible();
  await click(page, 'hud-mode-cross'); // andrei-select returned person mode — switch back to cross
  await click(page, 'cell-0-2'); // lesson-a (action): cross the row's chair
  await expect(step(page, 'andrei-hold')).toBeVisible();
  await next(page); // andrei-hold
  await expect(step(page, 'galina-clues')).toBeVisible();

  // Act 4: Galina — marks, clue-based elimination, placement.
  await next(page); // galina-clues
  await click(page, 'roster-person-galina'); // galina-select (action, also returns person mode)
  await expect(step(page, 'galina-marks')).toBeVisible();
  await rclick(page, 'cell-2-0'); // galina-marks (action)
  await rclick(page, 'cell-4-0');
  await rclick(page, 'cell-4-1');
  await expect(step(page, 'galina-deduce')).toBeVisible();
  await rclick(page, 'cell-4-0'); // galina-deduce (action): remove wrong marks
  await rclick(page, 'cell-4-1');
  await expect(step(page, 'galina-place')).toBeVisible();
  await click(page, 'cell-2-0'); // galina-place (action)
  await expect(step(page, 'boris-resolved')).toBeVisible();

  // Act 5: Boris resolved by Galina's auto-cross → autocross tour → Andrei resolved → undo/clear practice.
  await click(page, 'roster-person-boris'); // boris-resolved (action)
  await click(page, 'cell-1-4');
  await expect(step(page, 'autocross')).toBeVisible();
  await next(page); // autocross
  await expect(step(page, 'andrei-resolved')).toBeVisible();
  await click(page, 'roster-person-andrei'); // andrei-resolved (action)
  await click(page, 'cell-0-1');
  await expect(step(page, 'mistake')).toBeVisible();
  await click(page, 'roster-person-galina'); // mistake (action): deliberate wrong move
  await click(page, 'cell-4-0');
  await expect(step(page, 'undo')).toBeVisible();
  await click(page, 'undo-button'); // undo (action) — Galina is back on 2-0
  await expect(step(page, 'clear')).toBeVisible();
  page.once('dialog', (dialog) => void dialog.accept()); // window.confirm in clearBoard
  await click(page, 'hud-clear'); // clear (action)
  await expect(step(page, 'rebuild-boris')).toBeVisible();
  await click(page, 'roster-person-boris'); // rebuild: select + place each
  await click(page, 'cell-1-4');
  await expect(step(page, 'rebuild-galina')).toBeVisible();
  await click(page, 'roster-person-galina');
  await click(page, 'cell-2-0');
  await expect(step(page, 'rebuild-andrei')).toBeVisible();
  await click(page, 'roster-person-andrei');
  await click(page, 'cell-0-1');
  await expect(step(page, 'restart-info')).toBeVisible();
  await next(page); // restart-info
  await expect(step(page, 'vladimir-clues')).toBeVisible();

  // Act 7: Vladimir — adjacency marks + relative-position elimination.
  await next(page); // vladimir-clues
  await click(page, 'roster-person-vladimir'); // vladimir-select (action)
  await expect(step(page, 'vladimir-marks')).toBeVisible();
  await rclick(page, 'cell-3-3'); // vladimir-marks (action)
  await rclick(page, 'cell-4-3');
  await expect(step(page, 'vladimir-deduce')).toBeVisible();
  await rclick(page, 'cell-4-3'); // vladimir-deduce (action)
  await expect(step(page, 'vladimir-place')).toBeVisible();
  await click(page, 'cell-3-3'); // vladimir-place (action)
  await expect(step(page, 'victim-deduce')).toBeVisible();

  // Act 8: victim + check + finale + bridge to menu.
  await next(page); // victim-deduce
  await expect(step(page, 'victim-reveal')).toBeVisible();
  await next(page); // victim-reveal
  await click(page, 'roster-person-hristina'); // victim-select (action)
  await expect(step(page, 'victim-place')).toBeVisible();
  await click(page, 'cell-4-2'); // victim-place (action)
  await expect(step(page, 'check')).toBeVisible();
  await click(page, 'check-button'); // check (action)
  await expect(step(page, 'finale')).toBeVisible();

  // No standard victory banner during the tutorial — the scenario owns the finale.
  await expect(page.getByTestId('victory-banner')).toHaveCount(0);

  await next(page); // finale
  await expect(step(page, 'go-menu')).toBeVisible();
  await click(page, 'menu-button'); // go-menu (action)
  await expect(step(page, 'bridge')).toBeVisible();
  await expect(page.getByTestId('level-card-apartment-01')).toBeVisible();
  await next(page); // bridge — last step, finish()

  // The overlay is gone and the tutorial is marked done.
  await expect(page.getByTestId('tutorial-tooltip')).toHaveCount(0);
  const done = await page.evaluate(() => localStorage.getItem('sledoku:tutorial-done'));
  expect(done).toBe('1');

  // No best time was recorded for the tutorial level.
  const guestTimes = await page.evaluate(() => localStorage.getItem('sledoku:guest-best-times'));
  expect(guestTimes == null || !JSON.parse(guestTimes)[tutorialLevel.meta.id]).toBeTruthy();

  // The menu shows the tutorial card with the "Пройдено" badge.
  await expect(page.getByTestId('level-card-tutorial-00')).toBeVisible();
  await expect(page.getByTestId('level-card-tutorial-00')).toContainText('Пройдено');
});

test('tutorial: back button revisits previous steps without breaking the scenario', async ({ page }) => {
  await page.goto('/');
  await click(page, 'level-card-tutorial-00');
  await expect(step(page, 'welcome')).toBeVisible();

  // No back button on the very first step.
  await expect(page.getByTestId('tutorial-back')).toHaveCount(0);

  await next(page); // → goal
  await expect(step(page, 'goal')).toBeVisible();

  // Step back from goal to welcome.
  await click(page, 'tutorial-back');
  await expect(step(page, 'welcome')).toBeVisible();

  // Step forward again — the scenario continues normally.
  await next(page);
  await expect(step(page, 'goal')).toBeVisible();
});

test('tutorial: back onto a completed action step offers Далее instead of repeating', async ({ page }) => {
  await page.goto('/');
  await click(page, 'level-card-tutorial-00');

  // Fast-forward: 6 info steps reach 'roster' (action: select Andrei).
  for (let i = 0; i < 6; i++) await next(page);
  await expect(step(page, 'roster')).toBeVisible();
  await click(page, 'roster-person-andrei');
  await expect(step(page, 'roster-2')).toBeVisible();

  // Step back onto the completed 'roster' step: Andrei is still selected, so the
  // tooltip must offer "Далее" instead of demanding the selection again.
  await click(page, 'tutorial-back');
  await expect(step(page, 'roster')).toBeVisible();
  await expect(page.getByTestId('tutorial-next')).toBeVisible();
  await expect(page.getByTestId('tutorial-next')).toBeEnabled();
  await next(page);
  await expect(step(page, 'roster-2')).toBeVisible();
});

test('tutorial: leaving to a regular level silently stops the scenario', async ({ page }) => {
  await page.goto('/');
  await click(page, 'level-card-tutorial-00');
  await expect(step(page, 'welcome')).toBeVisible();

  // Leaving via the menu button drops the tutorial without marking it done.
  await click(page, 'menu-button');
  await expect(page.getByTestId('tutorial-tooltip')).toHaveCount(0);
  await click(page, 'level-card-apartment-01');
  await expect(page.getByTestId('tutorial-tooltip')).toHaveCount(0);
  const done = await page.evaluate(() => localStorage.getItem('sledoku:tutorial-done'));
  expect(done).toBeNull();
});
