import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gasStationLevel, roomForCell } from '../../levels/64-gasstation';
import { cellId } from '../../src/types/level';
import { checkLevelAcceptance } from './acceptance';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

const roomRows = [
  'GGGGPP',
  'GGGGPP',
  'GGGGPP',
  'WWSSPP',
  'WWSSSS',
  'WWSSSS',
];

const expectedSolution = {
  anfisa: cellId(0, 2),
  borislav: cellId(4, 4),
  vlada: cellId(5, 0),
  guriy: cellId(1, 5),
  darya: cellId(2, 3),
  khristofor: cellId(3, 1),
};

const roomAt = (id: string) => {
  const [row, col] = id.split('-').map(Number);
  return roomForCell(row, col);
};

function isRoomConnected(roomId: string): boolean {
  const cells = gasStationLevel.cells.filter((cell) => cell.roomId === roomId);
  const visited = new Set([cells[0]?.id]);
  const queue = [cells[0]].filter((cell) => cell != null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of gasStationLevel.cells) {
      const distance = Math.abs(neighbor.row - current.row) + Math.abs(neighbor.col - current.col);
      if (neighbor.roomId !== roomId || distance !== 1 || visited.has(neighbor.id)) continue;
      visited.add(neighbor.id);
      queue.push(neighbor);
    }
  }

  return visited.size === cells.length;
}

test('Route 66 station keeps the agreed 6x6 connected zone layout', () => {
  assert.equal(gasStationLevel.meta.id, 'gasstation-01');
  assert.equal(gasStationLevel.size, 6);
  const roomSymbols = { pumps: 'G', parking: 'P', wash: 'W', store: 'S' };
  assert.deepEqual(Array.from({ length: gasStationLevel.size }, (_, row) =>
    Array.from({ length: gasStationLevel.size }, (_, col) => roomSymbols[roomForCell(row, col)]).join(''),
  ), roomRows);

  const counts = Object.fromEntries(gasStationLevel.rooms.map((room) => [
    room.id,
    gasStationLevel.cells.filter((cell) => cell.roomId === room.id).length,
  ]));
  assert.deepEqual(counts, { pumps: 12, wash: 6, store: 10, parking: 8 });
  assert.ok(gasStationLevel.rooms.every((room) => isRoomConnected(room.id)));
  assert.deepEqual(gasStationLevel.solution, expectedSolution);
  assert.deepEqual(gasStationLevel.people.map((person) => person.initialLetter), ['А', 'Б', 'В', 'Г', 'Д', 'Х']);
  assert.equal(gasStationLevel.items.filter((item) => item.typeId === 'productShelf').length, 2);
  assert.equal(gasStationLevel.items.some((item) => item.typeId === 'kiosk'), false);
  assert.equal(gasStationLevel.itemTypes.find((type) => type.id === 'productShelf')?.label, 'Стенд с продукцией');
  assert.deepEqual(gasStationLevel.items.filter((item) => item.typeId === 'car').map((item) =>
    new Set(item.cells.map(roomAt)),
  ), [new Set(['pumps']), new Set(['parking']), new Set(['wash'])]);

  const occupiedRows = Object.values(expectedSolution).map((id) => id.split('-')[0]);
  const occupiedCols = Object.values(expectedSolution).map((id) => id.split('-')[1]);
  assert.equal(new Set(occupiedRows).size, 6);
  assert.equal(new Set(occupiedCols).size, 6);
});

test('the staff zones and customer wash clue support the authored crime scene', () => {
  const peopleById = new Map(gasStationLevel.people.map((person) => [person.id, person]));
  const staff = gasStationLevel.people.filter((person) => person.roles?.includes('employee'));
  const victim = peopleById.get('khristofor')!;
  const murderer = peopleById.get('vlada')!;
  const staffZonesClue = gasStationLevel.clues.find((clue) => clue.id === 'gs-employee-posts');
  const customerWashClue = gasStationLevel.clues.find((clue) => clue.id === 'gs-clients-wash');
  const displayedGeneralClues = generalCluesForDisplay(gasStationLevel.clues);

  assert.deepEqual(staff.map((person) => person.initialLetter), ['А', 'Б', 'В']);
  assert.equal(victim.isVictim, true);
  assert.equal(murderer.isMurderer, true);
  assert.deepEqual(gasStationLevel.people.filter((person) => person.roles?.includes('washer')).map((person) => person.id), ['vlada']);
  assert.ok(staffZonesClue?.type === 'roleZoneMin');
  assert.equal(staffZonesClue.text, 'В каждой зоне, кроме парковки, был сотрудник.');
  assert.deepEqual(staffZonesClue.roomIds, ['pumps', 'store', 'wash']);
  assert.ok(customerWashClue?.type === 'roleZoneMin');
  assert.equal(customerWashClue.roleId, 'customer');
  assert.deepEqual(customerWashClue.roomIds, ['wash']);
  assert.equal(customerWashClue.minCount, 1);
  assert.deepEqual(displayedGeneralClues.map((clue) => clue.text), [
    'Все с Анфисы по Владу были сотрудниками заправки; остальные — клиенты.',
    'В каждой зоне, кроме парковки, был сотрудник.',
    'Один из клиентов находился в автомойке.',
  ]);
  assert.ok(gasStationLevel.clues.every((clue) => ![
    'gs-one-washer',
    'gs-washer-at-wash',
    'gs-wash-two-people',
  ].includes(clue.id)));

  const victimRoom = roomAt(expectedSolution.khristofor);
  assert.equal(victimRoom, 'wash');
  assert.equal(roomAt(expectedSolution.vlada), victimRoom);
  assert.equal(
    gasStationLevel.people.filter((person) => roomAt(gasStationLevel.solution[person.id]) === victimRoom).length,
    2,
  );
  assert.ok(gasStationLevel.clues.every((clue) =>
    !('subject' in clue) || clue.subject.type !== 'person' || clue.subject.id !== victim.id,
  ));
  assert.ok(gasStationLevel.clues.every((clue) => !clue.text.includes(victim.name)));

  for (const roomId of ['pumps', 'store', 'wash']) {
    assert.equal(
      staff.filter((person) => roomAt(gasStationLevel.solution[person.id]) === roomId).length,
      1,
      `expected one employee in ${roomId}`,
    );
  }

  const personalClueCounts = new Map(gasStationLevel.people.map((person) => [
    person.id,
    gasStationLevel.clues.filter((clue) =>
      'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
    ).length,
  ]));
  assert.ok([...personalClueCounts.values()].every((count) => count <= 3));
});

test('the level passes authored validation, density, and quality budgets', () => {
  const quality = checkPuzzleQuality(gasStationLevel);
  assert.equal(generalCluesForDisplay(gasStationLevel.clues).length, 3);
  const occupiedCells = gasStationLevel.items.reduce((count, item) => count + item.cells.length, 0)
    + gasStationLevel.cells.filter((cell) => cell.floorFeatureId).length;

  assert.equal(gasStationLevel.meta.maxFullyPinnedPeople, 0);
  assert.ok(occupiedCells / gasStationLevel.cells.length >= 0.4);
  assert.deepEqual(lintLevel(gasStationLevel), []);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(checkLevelAcceptance(gasStationLevel, quality.fullyPinnedCount), []);
  assert.equal(solveLevel(gasStationLevel).status, 'PROVEN_UNIQUE');
});

test('only the authored murderer is consistent with player-visible clues', () => {
  const murdererReport = checkMurdererEpistemics(gasStationLevel);

  assert.equal(murdererReport.baseline, 'PROVEN_UNIQUE');
  assert.equal(murdererReport.worlds.length, gasStationLevel.people.length - 2);
  assert.ok(murdererReport.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
