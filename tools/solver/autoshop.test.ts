import assert from 'node:assert/strict';
import { test } from 'node:test';
import { autoshopLevel } from '../../levels/55-autoshop';
import { buildLevelIndex } from '../../src/engine/board';
import { checkLevelAcceptance } from './acceptance';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

test('autoshop keeps the approved board, zone, item and texture contract', () => {
  assert.equal(autoshopLevel.meta.id, 'autoshop-01');
  assert.equal(autoshopLevel.size, 7);
  assert.equal(autoshopLevel.cells.length, 49);
  assert.equal(autoshopLevel.people.length, 7);
  assert.deepEqual(
    autoshopLevel.rooms.map((room) => room.name),
    ['Приемная', 'Диагностика', 'Шиномонтаж', 'Ремонтная', 'Склад запчастей'],
  );
  assert.deepEqual(
    [...new Set(autoshopLevel.items.map((item) => item.typeId))].sort(),
    ['box', 'car', 'carJack', 'tireStack', 'toolbox'],
  );
  assert.ok(autoshopLevel.items.some(
    (item) => item.typeId === 'carJack' && item.cells.includes('2-5'),
    'the jack must block the alternative crime-scene cell',
  ));

  const workshopRooms = autoshopLevel.rooms.filter((room) => room.floorTexture === 'workshopFloor');
  assert.deepEqual(workshopRooms.map((room) => room.id), ['diagnostics', 'repair', 'parts']);
  assert.ok(autoshopLevel.clues.some(
    (clue) => clue.type === 'floorTexture' && clue.textureKey === 'workshopFloor',
  ));
  assert.ok(autoshopLevel.cells.some((cell) => cell.floorFeatureId === 'rubber-runoff'));
});

test('autoshop uses only personal clues and never references the known victim', () => {
  const victim = autoshopLevel.people.find((person) => person.isVictim);
  assert.equal(victim?.initialLetter, 'Х');
  assert.equal(autoshopLevel.clues.length, 14);
  assert.ok(autoshopLevel.clues.every(
    (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id !== victim?.id,
  ));
  assert.ok(autoshopLevel.clues.every((clue) => {
    const references = [
      ...('otherPersonId' in clue ? [clue.otherPersonId] : []),
      ...('otherPersonId1' in clue ? [clue.otherPersonId1] : []),
      ...('otherPersonId2' in clue ? [clue.otherPersonId2] : []),
    ];
    return !references.includes(victim?.id ?? '');
  }));
  for (const person of autoshopLevel.people.filter((candidate) => !candidate.isVictim)) {
    const personalClueCount = autoshopLevel.clues.filter(
      (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
    ).length;
    assert.ok(personalClueCount <= 3, `${person.name} has ${personalClueCount} personal clues`);
  }

  assert.ok(autoshopLevel.clues.some(
    (clue) => clue.type === 'relativePosition' && clue.subject.type === 'person' &&
      clue.subject.id === 'vasilisa' && clue.otherPersonId === 'glafira' &&
      clue.axis === 'row' && clue.direction === 'before',
  ));
  assert.ok(autoshopLevel.clues.some(
    (clue) => clue.type === 'sameRoomAsItem' && clue.subject.type === 'person' &&
      clue.subject.id === 'borislav' && clue.itemTypeId === 'toolbox',
  ));
  assert.ok(autoshopLevel.clues.some(
    (clue) => clue.type === 'adjacency' && clue.subject.type === 'person' &&
      clue.subject.id === 'demyan' && clue.itemTypeId === 'toolbox',
  ));
});

test('autoshop has a unique, unpinned solution meeting the density gate', () => {
  const quality = checkPuzzleQuality(autoshopLevel);
  assert.equal(solveLevel(autoshopLevel).status, 'PROVEN_UNIQUE');
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(autoshopLevel, quality.fullyPinnedCount), []);

  const occupiedCells = new Set([
    ...autoshopLevel.items.flatMap((item) => item.cells),
    ...autoshopLevel.cells.filter((cell) => cell.floorFeatureId).map((cell) => cell.id),
  ]);
  assert.ok(occupiedCells.size >= 20);

  const index = buildLevelIndex(autoshopLevel);
  const victim = autoshopLevel.people.find((person) => person.isVictim)!;
  const victimRoom = index.cellsById.get(autoshopLevel.solution[victim.id])!.roomId;
  const victimRoomOccupants = autoshopLevel.people.filter(
    (person) => index.cellsById.get(autoshopLevel.solution[person.id])!.roomId === victimRoom,
  );
  assert.equal(victimRoomOccupants.length, 2);

  const murderer = autoshopLevel.people.find((person) => person.isMurderer)!;
  for (const candidate of autoshopLevel.people.filter((person) => !person.isVictim && person.id !== murderer.id)) {
    const alternateWorld = {
      ...autoshopLevel,
      people: autoshopLevel.people.map((person) => ({
        ...person,
        isMurderer: person.id === candidate.id,
      })),
    };
    assert.equal(solveLevel(alternateWorld).status, 'NO_SOLUTION', `${candidate.name} must not be a viable murderer`);
  }
});
