import { test, expect } from '@playwright/test';
import { levels } from '../levels';

const bakeryLevel = levels.find((level) => level.meta.id === 'bakery-01');

test('Жаркий замес declares the approved cast and guest restrictions', () => {
  expect(bakeryLevel).toBeDefined();
  if (!bakeryLevel) return;

  expect(bakeryLevel.meta.title).toBe('Жаркий замес');
  expect(bakeryLevel.size).toBe(7);
  expect(bakeryLevel.rooms).toHaveLength(5);
  expect(bakeryLevel.people).toHaveLength(7);
  expect(bakeryLevel.people.find((person) => person.isVictim)?.id).toBe('khariton');
  expect(bakeryLevel.people.find((person) => person.isMurderer)?.id).toBe('esenya');

  const letterRule = bakeryLevel.clues.find((clue) => clue.type === 'letterRole');
  expect(letterRule).toMatchObject({ letterClass: 'vowel', roleId: 'staff' });
  expect(letterRule?.text).not.toMatch(/ссор|спор|последн.{0,20}буханк/i);

  const guestRestriction = bakeryLevel.clues.find(
    (clue) => clue.type === 'roleZoneLimit' && clue.roleId === 'guest',
  );
  expect(guestRestriction).toMatchObject({ maxCount: 0, roomIds: ['bakery', 'service'] });
  expect(bakeryLevel.clues.some((clue) =>
    clue.subject?.type === 'person' && clue.subject.id === 'khariton',
  )).toBe(false);
});

test('Жаркий замес accepts its authored murderer solution', async ({ page }) => {
  test.skip(!bakeryLevel, 'The bakery level has not been registered yet.');

  await page.goto('/');
  await page.getByTestId(`level-card-${bakeryLevel!.meta.id}`).click();
  await expect(page.locator('.board .grid-cell')).toHaveCount(bakeryLevel!.cells.length);

  for (const [personId, cellId] of Object.entries(bakeryLevel!.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }

  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('victory-banner')).toContainText('Есения');
});

test('Жаркий замес shows Vasilisa\'s paired zone boundaries as one clue', async ({ page }) => {
  test.skip(!bakeryLevel, 'The bakery level has not been registered yet.');

  await page.goto('/');
  await page.getByTestId(`level-card-${bakeryLevel!.meta.id}`).click();

  const entry = page.locator('.roster-entry').filter({
    has: page.getByTestId('roster-person-vasilisa'),
  });
  const clues = entry.locator('.roster-entry__clue');
  await expect(clues).toHaveCount(2);
  await expect(clues.filter({ hasText: 'Василиса соседствовала с двумя другими зонами.' }))
    .toHaveCount(1);
});

test('Жаркий замес room labels stay inside the board without overlapping', async ({ page }) => {
  test.skip(!bakeryLevel, 'The bakery level has not been registered yet.');

  await page.goto('/');
  await page.getByTestId(`level-card-${bakeryLevel!.meta.id}`).click();
  const labels = page.locator('.room-label');
  await expect(labels).toHaveCount(bakeryLevel!.rooms.length);

  const boardBox = await page.locator('.board').boundingBox();
  const boxes = await Promise.all((await labels.all()).map(async (label) => ({
    name: await label.textContent(),
    box: await label.boundingBox(),
  })));

  expect(boardBox).not.toBeNull();
  for (let i = 0; i < boxes.length; i += 1) {
    expect(boxes[i].box, `${boxes[i].name} should be visible`).not.toBeNull();
    const current = boxes[i].box!;
    expect(current.x).toBeGreaterThanOrEqual(boardBox!.x);
    expect(current.y).toBeGreaterThanOrEqual(boardBox!.y);
    expect(current.x + current.width).toBeLessThanOrEqual(boardBox!.x + boardBox!.width);
    expect(current.y + current.height).toBeLessThanOrEqual(boardBox!.y + boardBox!.height);

    for (let j = i + 1; j < boxes.length; j += 1) {
      expect(boxes[j].box, `${boxes[j].name} should be visible`).not.toBeNull();
      const other = boxes[j].box!;
      const overlaps = current.x < other.x + other.width && other.x < current.x + current.width &&
        current.y < other.y + other.height && other.y < current.y + current.height;
      expect(overlaps, `${boxes[i].name} overlaps ${boxes[j].name}`).toBe(false);
    }
  }
});
