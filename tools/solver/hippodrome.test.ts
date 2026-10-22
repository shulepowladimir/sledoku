import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue, solveLevel } from './solve';
import { hippodromeLevel } from '../../levels/72-hippodrome';
import { buildLevelIndex } from '../../src/engine/board';
import { cellId, parseCellId } from '../../src/types/level';

test('Hippodrome uses its approved title and expert tag', () => {
  assert.equal(hippodromeLevel.meta.title, 'Подкова удачи');
  assert.equal(hippodromeLevel.meta.menuTag, 'expert');
});

test('Hippodrome rooms, pen-to-track gates, label offset, and textures match QA', () => {
  const roomCodeById: Record<string, string> = {
    stable: 'к',
    startPen: 'з',
    stands: 'т',
    track1: '1',
    track2: '2',
    track3: '3',
    track4: '4',
    vet: 'в',
    judges: 'с',
  };
  const actualRows = Array.from({ length: hippodromeLevel.size }, (_, row) =>
    Array.from({ length: hippodromeLevel.size }, (_, col) => {
      const cell = hippodromeLevel.cells.find((candidate) => candidate.id === cellId(row, col));
      return roomCodeById[cell?.roomId ?? ''] ?? '?';
    }).join(''),
  );

  assert.deepEqual(actualRows, [
    'ккккккккккк',
    'кзззккккккк',
    'тзззззккввв',
    'тт12зззвввв',
    'тт123ззвввв',
    'тт12334ввсс',
    'тт122344ссс',
    'тт1123344сс',
    'ттт122334сс',
    'ттт1122344с',
    'тттт1123344',
  ]);

  assert.deepEqual(hippodromeLevel.edgeItems?.map(({ cellA, cellB }) => [cellA, cellB]), [
    [cellId(2, 2), cellId(3, 2)],
    [cellId(2, 3), cellId(3, 3)],
    [cellId(3, 4), cellId(4, 4)],
    [cellId(4, 6), cellId(5, 6)],
  ]);
  const roomsById = new Map(hippodromeLevel.rooms.map((room) => [room.id, room]));
  for (const gate of hippodromeLevel.edgeItems ?? []) {
    const roomA = hippodromeLevel.cells.find((cell) => cell.id === gate.cellA)?.roomId;
    const roomB = hippodromeLevel.cells.find((cell) => cell.id === gate.cellB)?.roomId;
    assert.ok([roomA, roomB].includes('startPen'), `${gate.id} should border the starting pen`);
  }
  assert.equal(roomsById.get('track3')?.labelOffsetCells?.col, 0.75);
  assert.deepEqual(hippodromeLevel.floorFeatures, []);
  assert.equal(hippodromeLevel.rooms.find((room) => room.id === 'track1')?.floorTexture, 'dirt');
  assert.equal(hippodromeLevel.rooms.find((room) => room.id === 'track2')?.floorTexture, 'sand');
  assert.equal(hippodromeLevel.rooms.find((room) => room.id === 'track3')?.floorTexture, 'dirt');
  assert.equal(hippodromeLevel.rooms.find((room) => room.id === 'track4')?.floorTexture, 'sand');
});

test('Hippodrome spaces out seating and keeps horse columns distinct', () => {
  const horseItems = hippodromeLevel.items.filter((item) => item.typeId === 'horse');
  const horseColumns = horseItems.map((item) => parseCellId(item.cells[0]).col);
  const roomByCell = new Map(hippodromeLevel.cells.map((cell) => [cell.id, cell.roomId]));
  const itemCountInRoom = (typeId: string, roomId: string) => hippodromeLevel.items.filter((item) =>
    item.typeId === typeId && roomByCell.get(item.cells[0]) === roomId,
  ).length;
  const itemTypeById = new Map(hippodromeLevel.itemTypes.map((itemType) => [itemType.id, itemType]));
  const levelIndex = buildLevelIndex(hippodromeLevel);
  const initialOptionsFor = (personId: string) => {
    const personalClues = hippodromeLevel.clues.filter((clue) =>
      clue.subject?.type === 'person' && clue.subject.id === personId,
    );

    return hippodromeLevel.cells.filter((cell) => {
      const item = hippodromeLevel.items.find((candidate) => candidate.cells.includes(cell.id));
      if (item && itemTypeById.get(item.typeId)?.kind === 'decorative') return false;
      return personalClues.every((clue) =>
        evalClue(clue, (id) => id === personId ? cell.id : undefined, hippodromeLevel, levelIndex, false) === true,
      );
    });
  };

  assert.equal(horseItems.length, 6);
  assert.equal(new Set(horseColumns).size, horseColumns.length);
  assert.equal(initialOptionsFor('boris').length, 8);
  assert.equal(initialOptionsFor('grigory').length, 4);
  assert.ok(!hippodromeLevel.clues.some((clue) => clue.id === 'h-grigory-row'));
  assert.ok(!hippodromeLevel.clues.some((clue) => clue.id === 'h-irina-judges'));
  assert.equal(itemCountInRoom('seat', 'stands'), 9);
  assert.equal(itemCountInRoom('chair', 'judges'), 2);
  assert.deepEqual(['track1', 'track2', 'track3', 'track4'].map((roomId) => itemCountInRoom('hurdle', roomId)), [4, 3, 3, 4]);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'haystack').length, 3);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'trough').length, 3);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'hitchingPost').length, 6);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'examTable').length, 2);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'medicineCabinet').length, 2);
  assert.equal(hippodromeLevel.items.filter((item) => item.typeId === 'camera').length, 1);
  assert.ok(hippodromeLevel.items.filter((item) => item.typeId === 'camera').every((item) =>
    roomByCell.get(item.cells[0]) === 'judges',
  ));
});

test('Hippodrome clues are true of the authored solution and omit removable room-count clues', () => {
  const index = buildLevelIndex(hippodromeLevel);
  const cluesById = new Map(hippodromeLevel.clues.map((clue) => [clue.id, clue]));
  const getCell = (personId: string) => hippodromeLevel.solution[personId];
  const removedClueIds = new Set([
    'h-common-stable-count',
    'h-common-stands-count',
    'h-common-judges-count',
  ]);

  assert.ok(hippodromeLevel.clues.every((clue) => evalClue(clue, getCell, hippodromeLevel, index, true) === true));
  assert.ok(hippodromeLevel.clues.every((clue) => !removedClueIds.has(clue.id)));
  assert.equal(
    cluesById.get('h-esenia-shares-woman')?.text,
    'В зоне с Есенией была минимум ещё одна женщина.',
  );
  assert.equal(
    hippodromeLevel.clues.filter((clue) => clue.type === 'occupiesItem' && clue.itemTypeId === 'horse').length,
    0,
    'riders and the empty horse should be deduced from the clue network, not named by horse-occupancy clues',
  );
  assert.ok(!hippodromeLevel.clues.some((clue) => clue.id === 'h-boris-not-riding'));
  assert.deepEqual(hippodromeLevel.meta.generalNotes, [
    'Если персонаж находился у ворот, то он мог быть в клетке над воротами или в клетке под воротами, в том числе в разных зонах',
  ]);

  assert.deepEqual(hippodromeLevel.roomGroups?.find((group) => group.id === 'raceTracks')?.roomIds, [
    'track1', 'track2', 'track3', 'track4',
  ]);
  assert.equal(cluesById.get('h-andrey-race-tracks')?.type, 'roomGroupMembership');
  assert.equal(cluesById.get('h-esenia-no-horse-row')?.type, 'itemAbsentInLine');
  assert.equal(cluesById.get('h-kirill-shares-vowel')?.type, 'sharedRoomLetterGroup');
  assert.equal(cluesById.get('h-kirill-shares-vowel')?.text, 'В зоне с Кириллом у кого-то было имя на гласную.');
  assert.equal(cluesById.get('h-irina-judges'), undefined);
  assert.equal(cluesById.get('h-irina-column'), undefined);
  assert.equal(cluesById.get('h-irina-west-wall')?.type, 'wallSide');
  assert.equal(cluesById.get('h-irina-corner')?.text, 'Ирина находилась в углу своей зоны.');
  const distanceClue = cluesById.get('h-dina-south-irina');
  assert.equal(distanceClue?.type, 'relativePosition');
  if (distanceClue?.type === 'relativePosition') assert.equal(distanceClue.minOffset, 2);
});

test('Hippodrome has one solution and the murderer is deducible from player-visible clues', () => {
  assert.equal(solveLevel(hippodromeLevel).status, 'PROVEN_UNIQUE');
  const withoutKirillVowelClue = {
    ...hippodromeLevel,
    clues: hippodromeLevel.clues.filter((clue) => clue.id !== 'h-kirill-shares-vowel'),
  };
  assert.equal(solveLevel(withoutKirillVowelClue).status, 'MULTIPLE');

  const report = checkMurdererEpistemics(hippodromeLevel);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('Hippodrome meets the clue, pinning, and board acceptance rules', () => {
  const quality = checkPuzzleQuality(hippodromeLevel);

  assert.deepEqual(lintLevel(hippodromeLevel), []);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(checkLevelAcceptance(hippodromeLevel, quality.fullyPinnedCount), []);
});
