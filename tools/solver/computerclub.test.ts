import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameLevels } from '../../levels';
import { buildLevelIndex } from '../../src/engine/board';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

const level = gameLevels.find((candidate) => candidate.meta.id === 'computerclub-01');
const ROOM_ROWS = [
  'KKKVVVV',
  'KKKRRVV',
  'KKRRRRV',
  'KKORRVV',
  'OOOOLLL',
  'OOOLLLL',
  'OOOLLLL',
];
function itemsInRoom(itemTypeId: string, roomId: string) {
  assert.ok(level);
  const cells = new Map(level.cells.map((cell) => [cell.id, cell]));
  return level.items.filter((item) =>
    item.typeId === itemTypeId && cells.get(item.cells[0])?.roomId === roomId,
  );
}

test('computer club preserves the approved map and has seven people without occupational roles', () => {
  assert.ok(level, 'computerclub-01 must be registered');
  assert.equal(level.meta.title, 'Убойная катка');
  assert.equal(level.size, 7);
  assert.equal(level.cells.length, 49);
  assert.equal(level.people.length, 7);
  assert.ok(level.people.every((person) => !person.roles?.length));

  const roomLetters = new Map([
    ['consoleHall', 'K'],
    ['vip', 'V'],
    ['retro', 'R'],
    ['common', 'O'],
    ['lobby', 'L'],
  ]);
  const roomByCell = new Map(level.cells.map((cell) => [cell.id, cell.roomId]));
  const actualRows = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => {
      const roomId = roomByCell.get(`${row}-${col}`);
      const letter = [...roomLetters].find(([id]) => id === roomId)?.[1];
      assert.ok(letter, `missing room at ${row}-${col}`);
      return letter;
    }).join(''),
  );
  assert.deepEqual(actualRows, ROOM_ROWS);

  const roomCounts = new Map<string, number>();
  for (const cell of level.cells) roomCounts.set(cell.roomId, (roomCounts.get(cell.roomId) ?? 0) + 1);
  assert.deepEqual(Object.fromEntries(roomCounts), {
    consoleHall: 10,
    vip: 9,
    retro: 8,
    common: 11,
    lobby: 11,
  });
});

test('computer club places the requested equipment in its matching zones without crowding the common hall', () => {
  assert.ok(level, 'computerclub-01 must be registered');
  const itemTypes = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  const cells = new Map(level.cells.map((cell) => [cell.id, cell]));
  const roomOf = (item: (typeof level.items)[number]) => cells.get(item.cells[0])!.roomId;
  const computers = level.items.filter((item) => item.typeId === 'computer');
  const commonComputers = computers.filter((item) => roomOf(item) === 'common');

  assert.equal(itemTypes.get('computer')?.kind, 'occupiable');
  assert.ok(commonComputers.length >= 4, `expected at least 4 common-hall computers, got ${commonComputers.length}`);
  const computerCoords = commonComputers.map((item) => item.cells[0].split('-').map(Number));
  for (let i = 0; i < computerCoords.length; i += 1) {
    for (let j = i + 1; j < computerCoords.length; j += 1) {
      const distance = Math.abs(computerCoords[i][0] - computerCoords[j][0])
        + Math.abs(computerCoords[i][1] - computerCoords[j][1]);
      assert.ok(distance >= 2, `common-hall computers are crowded at ${computerCoords[i]} and ${computerCoords[j]}`);
    }
  }
  assert.ok(computers.filter((item) => roomOf(item) === 'vip').length >= 2);

  const consoles = level.items.filter((item) => item.typeId === 'consoleSetup');
  assert.equal(itemTypes.get('consoleSetup')?.kind, 'occupiable');
  assert.ok(consoles.filter((item) => roomOf(item) === 'consoleHall').length >= 3);
  assert.ok(consoles.filter((item) => roomOf(item) === 'vip').length >= 2);

  const arcades = level.items.filter((item) => item.typeId === 'arcadeCabinet');
  assert.equal(itemTypes.get('arcadeCabinet')?.kind, 'decorative');
  assert.ok(arcades.length >= 2);
  assert.ok(arcades.every((item) => roomOf(item) === 'retro'));
  assert.ok(itemsInRoom('sofa', 'vip').length >= 2);
  assert.ok(itemsInRoom('sofa', 'lobby').length >= 2);
  assert.ok(itemsInRoom('kassa', 'lobby').length >= 1);

  const occupiedCells = level.items.reduce((count, item) => count + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length;
  assert.ok(occupiedCells >= 20, `expected at least 20 occupied cells, got ${occupiedCells}`);
});

test('computer club has no extra role clues, keeps the victim clue-free, and isolates the crime-scene pair', () => {
  assert.ok(level, 'computerclub-01 must be registered');
  assert.ok(level.clues.every((clue) => !clue.type.toLowerCase().includes('role')));
  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  assert.equal(victim.initialLetter, 'Х');
  assert.ok(!level.clues.some((clue) =>
    ('subject' in clue && clue.subject.type === 'person' && clue.subject.id === victim.id)
    || ('otherPersonId' in clue && clue.otherPersonId === victim.id)
    || ('otherPersonId1' in clue && clue.otherPersonId1 === victim.id)
    || ('otherPersonId2' in clue && clue.otherPersonId2 === victim.id),
  ));

  const index = buildLevelIndex(level);
  const victimRoom = index.cellsById.get(level.solution[victim.id])!.roomId;
  const occupants = level.people.filter((person) =>
    index.cellsById.get(level.solution[person.id])!.roomId === victimRoom,
  );
  assert.deepEqual(occupants.map((person) => person.id).sort(), [victim.id, murderer.id].sort());
  assert.ok(level.people.filter((person) => !person.isVictim).every((person) =>
    level.clues.some((clue) => clue.subject?.type === 'person' && clue.subject.id === person.id),
  ));
});

test('computer club keeps the VIP headcount but does not directly give away its sole visitor', () => {
  assert.ok(level, 'computerclub-01 must be registered');
  const removedClueIds = [
    'cc-galina-between',
    'cc-darya-between',
    'cc-alina-west-boris',
    'cc-boris-vip',
    'cc-boris-even-row',
  ];

  assert.ok(level.clues.some((clue) => clue.id === 'cc-vip-single-guest'));
  assert.ok(level.clues.some((clue) => clue.id === 'cc-boris-sofa'));
  for (const clueId of removedClueIds) {
    assert.ok(!level.clues.some((clue) => clue.id === clueId), `${clueId} should be removed`);
  }
});

test('computer club meets quality gates and uniquely identifies its murderer', () => {
  assert.ok(level, 'computerclub-01 must be registered');
  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  assert.equal(level.meta.maxFullyPinnedPeople, 0);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const murdererReport = checkMurdererEpistemics(level);
  assert.equal(murdererReport.baseline, 'PROVEN_UNIQUE');
  assert.ok(murdererReport.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
