import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { gameLevels } from '../../levels';
import { cellId } from '../../src/types/level';
import { FLOOR_TEXTURE_KEYS } from '../../src/styles/floorTextureKeys';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { computeUnaryDomain, solveLevel } from './solve';

const level = gameLevels.find((candidate) => candidate.meta.id === 'underwater-01');

test('underwater preserves the fixed 11-by-10 zones and character placements', () => {
  assert.ok(level, 'underwater-01 must be registered');
  assert.equal(level.meta.title, 'Пошло ко дну');
  assert.equal(level.size, 11);
  assert.equal(level.cols, 10);
  assert.equal(level.cells.length, 110);
  assert.ok(FLOOR_TEXTURE_KEYS.includes('coral'));

  const roomLetters = new Map([
    ['surface', 'V'],
    ['ocean', 'O'],
    ['shipwreck', 'K'],
    ['reef', 'P'],
    ['seabed', 'D'],
  ]);
  const roomByLetter = new Map([...roomLetters].map(([roomId, letter]) => [letter, roomId]));
  const roomRows = Array.from({ length: level.size }, (_, row) =>
    Array.from({ length: level.cols! }, (_, col) => {
      const roomId = level.cells.find((cell) => cell.row === row && cell.col === col)?.roomId;
      const letter = [...roomByLetter].find(([, id]) => id === roomId)?.[0];
      assert.ok(letter, `missing room for ${row}-${col}`);
      return letter;
    }).join(''),
  );
  assert.deepEqual(roomRows, [
    'VVVVVVVVVV',
    'VVOOOOVVOO',
    'OOOOOOOOOO',
    'KKKKKKOOPP',
    'KKKKKOOOOP',
    'KKKKKOOPOP',
    'KKKKOOOPOP',
    'KKKOOOOPOP',
    'KKOOOOPPOP',
    'DDDDOOPPPP',
    'DDDDDDDDDD',
  ]);

  assert.deepEqual(level.solution, {
    anfisa: cellId(10, 1),
    boris: cellId(2, 2),
    vladimir: cellId(1, 5),
    galina: cellId(5, 9),
    demyan: cellId(3, 6),
    esenia: cellId(4, 8),
    zhanna: cellId(7, 0),
    zoya: cellId(9, 4),
    igor: cellId(6, 3),
    khariton: cellId(8, 7),
  });

  const breachCells = [cellId(5, 1), cellId(6, 1)];
  assert.deepEqual(
    level.cells.filter((cell) => cell.floorFeatureId === 'breach').map((cell) => cell.id),
    breachCells,
  );
  assert.deepEqual(level.floorFeatures.find((feature) => feature.id === 'breach'), {
    id: 'breach',
    label: 'Пробоина',
    textureKey: 'water',
  });
});

test('underwater preserves every sketched object footprint', () => {
  assert.ok(level, 'underwater-01 must be registered');
  const boatType = level.itemTypes.find((type) => type.id === 'boat');
  assert.equal(boatType?.label, 'Лодка');
  assert.equal(boatType?.kind, 'occupiable');

  const placements = Object.fromEntries(level.items.map((item) => [item.id, item.cells]));
  const c = cellId;

  assert.deepEqual(placements, {
    boat: [c(0, 4), c(0, 5)],
    'buoy-surface': [c(1, 1)],
    'buoy-ocean': [c(6, 5)],
    'buoy-shipwreck': [c(7, 0)],
    'fish-1': [c(2, 3)],
    'fish-2': [c(2, 8)],
    'fish-3': [c(4, 6)],
    'fish-4': [c(8, 4)],
    'shell-1': [c(2, 5)],
    'shell-2': [c(10, 0)],
    'shell-3': [c(10, 4)],
    'cannon-1': [c(3, 1), c(3, 2)],
    'cannon-2': [c(3, 4), c(3, 5)],
    'barrel-1': [c(4, 4)],
    'barrel-2': [c(8, 0)],
    'barrel-3': [c(9, 5)],
    wheel: [c(5, 0)],
    'treasure-chest': [c(5, 2), c(5, 3)],
    'crab-1': [c(4, 9)],
    'crab-2': [c(6, 7)],
    'crab-3': [c(9, 2)],
    'crab-4': [c(10, 8)],
    'message-bottle': [c(9, 1)],
    'seaweed-1': [c(0, 9), c(1, 9)],
    'seaweed-2': [c(2, 0), c(3, 0)],
    'seaweed-3': [c(6, 6), c(7, 6), c(8, 6)],
    'seaweed-4': [c(5, 8), c(6, 8), c(6, 9)],
  });

  const itemCells = new Set(level.items.flatMap((item) => item.cells));
  assert.equal(itemCells.size, level.items.reduce((count, item) => count + item.cells.length, 0));
  for (const item of level.items) {
    const type = level.itemTypes.find((candidate) => candidate.id === item.typeId)!;
    if (type.kind === 'decorative') {
      for (const person of level.people) {
        assert.ok(!item.cells.includes(level.solution[person.id]), `${person.id} overlaps ${item.id}`);
      }
    }
  }

  const seaweedType = level.itemTypes.find((type) => type.id === 'seaweed');
  assert.equal(seaweedType?.render, 'tile');
  assert.equal(seaweedType?.tileEdgeDepth, false);
});

test('underwater keeps the empty-zone choice as a clue and resolves it through deduction', () => {
  assert.ok(level, 'underwater-01 must be registered');
  const index = buildLevelIndex(level);
  const cellByPerson = (personId: string) => index.cellsById.get(level.solution[personId])!;
  const emptyZoneRule = level.clues.find((clue) => clue.type === 'zoneExactlyOneEmpty');
  assert.deepEqual(emptyZoneRule?.roomIds, ['surface', 'seabed']);
  assert.match(emptyZoneRule?.text ?? '', /ровно одна/);

  const withRoomOccupied = (roomId: 'surface' | 'seabed') => ({
    ...level,
    clues: [...level.clues, {
      id: `test-${roomId}-occupied`,
      type: 'zoneOccupancy' as const,
      roomIds: [roomId],
      text: 'test-only diagnostic',
    }],
  });
  assert.equal(solveLevel(withRoomOccupied('surface')).status, 'NO_SOLUTION');
  assert.equal(solveLevel(withRoomOccupied('seabed')).status, 'PROVEN_UNIQUE');

  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  assert.equal(victim.initialLetter, 'Х');
  assert.equal(murderer.initialLetter, 'Г');
  assert.equal(cellByPerson(victim.id).roomId, 'reef');
  assert.equal(cellByPerson(murderer.id).roomId, 'reef');
  assert.equal(level.people.filter((person) => cellByPerson(person.id).roomId === 'reef').length, 2);
  assert.equal(level.people.filter((person) => cellByPerson(person.id).roomId === 'surface').length, 0);
  assert.equal(level.people.filter((person) => cellByPerson(person.id).roomId === 'seabed').length, 1);
  assert.ok(!level.clues.some((clue) => clue.subject?.type === 'person' && clue.subject.id === victim.id));
  for (const person of level.people.filter((candidate) => !candidate.isVictim)) {
    assert.ok(level.clues.some((clue) => clue.subject?.type === 'person' && clue.subject.id === person.id));
  }
});

test('underwater avoids overloaded zone counts and redundant location clues', () => {
  assert.ok(level, 'underwater-01 must be registered');
  assert.equal(level.clues.some((clue) => clue.type === 'zoneCountParity' || clue.type === 'zoneExactCount'), false);
  assert.equal(level.clues.some((clue) =>
    clue.type === 'roomMembership' && clue.subject.type === 'person' && clue.subject.id === 'anfisa'), false);
  assert.equal(level.clues.some((clue) =>
    clue.type === 'adjacency' && clue.subject.type === 'person' && clue.subject.id === 'igor' && clue.itemTypeId === 'chest'), false);

  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  const boundaryCount = level.clues.filter((clue) => clue.type === 'zoneBoundary').length;
  assert.equal(boundaryCount, 3);
  assert.equal((boundaryCount / level.clues.length) * 100, 15);
});

test('underwater counts zone-boundary clues when checking Zoya personal domain', () => {
  assert.ok(level, 'underwater-01 must be registered');
  const index = buildLevelIndex(level);
  const legalCells = level.cells.filter((cell) => isLegalTarget(index, level, cell.id));

  const domain = computeUnaryDomain(level, index, legalCells, 'zoya');
  assert.ok(domain.length > 1);
  assert.ok(domain.includes(level.solution.zoya));
  assert.equal(checkPuzzleQuality(level).perPerson.find((person) => person.personId === 'zoya')?.fullyPinned, false);
});

test('underwater meets density and has a unique solution and murderer', () => {
  assert.ok(level, 'underwater-01 must be registered');
  assert.equal(level.meta.menuTag, 'hard');
  const occupiedCells = level.items.reduce((count, item) => count + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length;
  assert.equal(occupiedCells, 39);
  assert.ok(occupiedCells / level.cells.length < 0.4);
  assert.deepEqual(checkLevelAcceptance(level, 0), []);
  assert.equal(level.meta.maxFullyPinnedPeople, 0);
  assert.equal(level.meta.clueBalanceExempt, undefined);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const report = checkMurdererEpistemics(level);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
