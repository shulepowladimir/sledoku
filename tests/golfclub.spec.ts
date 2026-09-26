import { test, expect } from '@playwright/test';
import { levels } from '../levels';
import { buildLevelIndex } from '../src/engine/board';
import { checkPuzzleQuality } from '../tools/solver/puzzleQuality';
import { evalClue, solveLevel } from '../tools/solver/solve';

const golfClubLevel = levels.find((level) => level.meta.id === 'golfclub-01');

test('Замах и удар keeps its numbered holes, approved cast, and unique solution', () => {
  expect(golfClubLevel).toBeDefined();
  if (!golfClubLevel) return;

  expect(golfClubLevel.size).toBe(12);
  expect(golfClubLevel.rooms.map((room) => room.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(golfClubLevel.people).toHaveLength(12);
  expect(golfClubLevel.people.find((person) => person.isVictim)?.id).toBe('harita');
  expect(golfClubLevel.people.find((person) => person.isMurderer)?.id).toBe('klim');
  expect(golfClubLevel.clues.filter((clue) => clue.type === 'roomNumberComparison')).toHaveLength(1);
  expect(golfClubLevel.clues.some((clue) => clue.id === 'golf-artem-lower-than-zahar')).toBe(false);
  expect(golfClubLevel.clues.some((clue) => clue.id === 'golf-gelena-higher-than-egor')).toBe(false);
  expect(golfClubLevel.clues.some((clue) => clue.id === 'golf-lidiya-lower-than-gelena')).toBe(false);
  expect(golfClubLevel.clues.some((clue) => clue.id === 'golf-gelena-higher-than-ida')).toBe(false);
  expect(golfClubLevel.clues).toEqual(expect.arrayContaining([
    expect.objectContaining({
      id: 'golf-zahar-higher-than-artem',
      subject: { type: 'person', id: 'zahar' },
      otherPersonId: 'artem',
      comparison: 'higher',
      text: 'Номер лунки Захара был выше номера лунки Артёма.',
    }),
  ]));
  expect(golfClubLevel.clues).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'golf-artem-on-grass', text: 'Артём находился на газоне.' }),
    expect.objectContaining({ id: 'golf-zahar-on-cart-path', text: 'Захар находился на дорожке.' }),
    expect.objectContaining({ id: 'golf-vadim-hole-1', text: 'Вадим находился на лунке 1.' }),
    expect.objectContaining({ id: 'golf-egor-hole-3', text: 'Егор находился на лунке 3.' }),
    expect.objectContaining({ id: 'golf-ida-hole-6', text: 'Ида находилась на лунке 6.' }),
    expect.objectContaining({
      id: 'golf-zhanna-east-of-cart-player',
      text: 'Жанна находилась восточнее хотя бы одного из игроков в гольф-карах.',
    }),
  ]));
  const personalClueCount = (personId: string) => golfClubLevel.clues.filter(
    (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === personId,
  ).length;
  expect(personalClueCount('artem')).toBe(3);

  const golfBags = golfClubLevel.items.filter((item) => item.typeId === 'golfBag');
  expect(golfBags.length).toBeGreaterThanOrEqual(3);
  const floorFeatureByCell = new Map(golfClubLevel.cells.map((cell) => [cell.id, cell.floorFeatureId]));
  for (const item of golfClubLevel.items.filter((candidate) => ['golfBag', 'golfTee'].includes(candidate.typeId))) {
    expect(item.cells.every((id) => floorFeatureByCell.get(id) !== 'pond')).toBe(true);
  }

  const personalFeatureIds = golfClubLevel.clues
    .filter((clue) => clue.type === 'floorFeature')
    .map((clue) => clue.featureId);
  expect(personalFeatureIds).toEqual(expect.arrayContaining(['cart-path', 'sand-trap', 'pond']));
  const roomNumberById = new Map(golfClubLevel.rooms.map((room) => [room.id, room.number]));
  const pondRoomNumbers = [...new Set(
    golfClubLevel.cells
      .filter((cell) => cell.floorFeatureId === 'pond')
      .map((cell) => roomNumberById.get(cell.roomId)),
  )].sort();
  expect(pondRoomNumbers).toEqual([2, 6]);
  expect(golfClubLevel.cells.filter((cell) => cell.floorFeatureId === 'pond')).toHaveLength(5);
  expect(golfClubLevel.clues.some((clue) => clue.type === 'floorTexture')).toBe(true);
  const cartGenderClues = golfClubLevel.clues.filter((clue) => clue.type === 'itemTypeGender' && clue.itemTypeId === 'golfCart');
  expect(cartGenderClues).toHaveLength(1);
  expect(cartGenderClues[0]).toMatchObject({
    gender: 'male',
    requireOccupied: true,
    text: 'В обоих гольф-карах были мужчины.',
  });
  expect(golfClubLevel.clues.some((clue) => clue.type === 'itemTypeFullyOccupied' && clue.itemTypeId === 'golfCart')).toBe(false);
  expect(golfClubLevel.clues.some((clue) => clue.type === 'relativeToItemOccupant' && clue.itemTypeId === 'golfCart')).toBe(true);
  expect(checkPuzzleQuality(golfClubLevel).fullyPinnedCount).toBe(0);

  const roomByCell = new Map(golfClubLevel.cells.map((cell) => [cell.id, cell.roomId]));
  const headcountByRoom = new Map(golfClubLevel.rooms.map((room) => [room.id, 0]));
  for (const cellId of Object.values(golfClubLevel.solution)) {
    const roomId = roomByCell.get(cellId)!;
    headcountByRoom.set(roomId, headcountByRoom.get(roomId)! + 1);
  }
  expect(golfClubLevel.rooms.map((room) => headcountByRoom.get(room.id))).toEqual([1, 2, 1, 2, 1, 2, 3]);
  expect(solveLevel(golfClubLevel).status).toBe('PROVEN_UNIQUE');
});

test('gender clue can require every golf cart to have a male occupant', () => {
  if (!golfClubLevel) return;

  const cartCells = new Set(
    golfClubLevel.items.filter((item) => item.typeId === 'golfCart').flatMap((item) => item.cells),
  );
  const cartOccupants = new Set(
    golfClubLevel.people
      .filter((person) => cartCells.has(golfClubLevel.solution[person.id]))
      .map((person) => person.id),
  );
  const getCell = (personId: string) => cartOccupants.has(personId) ? undefined : golfClubLevel.solution[personId];
  const clue = golfClubLevel.clues.find((candidate) => candidate.type === 'itemTypeGender' && candidate.itemTypeId === 'golfCart');
  expect(clue).toBeDefined();
  if (!clue || clue.type !== 'itemTypeGender') return;

  const index = buildLevelIndex(golfClubLevel);
  expect(evalClue({ ...clue, requireOccupied: false }, getCell, golfClubLevel, index, true)).toBe(true);
  expect(evalClue(clue, getCell, golfClubLevel, index, true)).toBe(false);
});

test('Замах и удар renders its full 12x12 board and seven hole labels', async ({ page }) => {
  test.skip(!golfClubLevel, 'The golf-club level has not been registered yet.');

  await page.goto('/');
  await page.getByTestId(`level-card-${golfClubLevel!.meta.id}`).click();
  await expect(page.locator('.board .grid-cell')).toHaveCount(144);
  await expect(page.locator('.room-label')).toHaveCount(7);
});
