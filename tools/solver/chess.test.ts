import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chessLevel } from '../../levels/68-chess';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { computeUnaryDomain, solveLevel } from './solve';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';

test('Мат в 8 ходов preserves the sketched people and figure coordinates', () => {
  assert.equal(chessLevel.size, 8);
  assert.equal(chessLevel.cells.length, 64);
  assert.equal(chessLevel.people.length, 8);
  assert.equal(chessLevel.items.length, 16);

  const expectedPositions = {
    anastasia: '5-3',
    boris: '2-4',
    vera: '3-7',
    gleb: '6-6',
    dina: '1-2',
    egor: '4-5',
    zhanna: '7-0',
    hariton: '0-1',
  };
  assert.deepEqual(chessLevel.solution, expectedPositions);

  const rooks = chessLevel.items.filter((item) => item.typeId.toLowerCase().endsWith('rook'));
  assert.deepEqual(rooks.map((item) => item.cells[0]).sort(), ['5-0', '7-7']);
  const queens = chessLevel.items.filter((item) => item.typeId.toLowerCase().endsWith('queen'));
  assert.deepEqual(queens.map((item) => item.cells[0]), ['3-2']);
  assert.equal(new Set(chessLevel.itemTypes.map((itemType) => itemType.icon)).size, 5);

  assert.equal(chessLevel.people.find((person) => person.isMurderer)?.id, 'dina');
  assert.equal(chessLevel.people.find((person) => person.isVictim)?.id, 'hariton');
});

test('Мат в 8 ходов has one common clue and leaves Анастасия, Дина, and Егор unpinned by their own clues', () => {
  const generalClues = chessLevel.clues.filter((clue) => clue.type === 'floorFeatureCohorts');
  assert.equal(generalClues.length, 1);
  assert.equal(generalClues[0].text, 'Все с А по Г стояли на тёмных клетках, остальные - на светлых.');
  assert.equal(chessLevel.clues.some((clue) => clue.type === 'zoneExactCount'), false);

  const index = buildLevelIndex(chessLevel);
  const legalCells = chessLevel.cells.filter((cell) => isLegalTarget(index, chessLevel, cell.id));
  for (const personId of ['anastasia', 'dina', 'egor']) {
    const group = generalClues[0].groups.find((candidate) => candidate.personIds.includes(personId));
    assert.ok(group, `${personId} must belong to a floor-feature cohort`);
    const directDomain = computeUnaryDomain(chessLevel, index, legalCells, personId).filter((cellId) => {
      const cell = index.cellsById.get(cellId)!;
      return group.negated ? cell.floorFeatureId !== group.featureId : cell.floorFeatureId === group.featureId;
    });
    assert.ok(directDomain.length > 1, `${personId} is pinned by own clues and square color`);
  }
});

test('Мат в 8 ходов renders dark squares as asphalt features and reaches required density', () => {
  const darkCells = chessLevel.cells.filter((cell) => cell.floorFeatureId === 'dark-square');
  assert.equal(darkCells.length, 32);
  assert.ok(darkCells.every((cell) => (cell.row + cell.col) % 2 === 0));

  const occupiedCount = chessLevel.items.reduce((count, item) => count + item.cells.length, 0)
    + chessLevel.cells.filter((cell) => cell.floorFeatureId).length;
  assert.ok(occupiedCount / chessLevel.cells.length >= 0.4);
  assert.deepEqual(checkLevelAcceptance(chessLevel, 0), []);
});

test('Мат в 8 ходов has a unique placement and uniquely deducible murderer', () => {
  const quality = checkPuzzleQuality(chessLevel);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.equal(solveLevel(chessLevel).status, 'PROVEN_UNIQUE');

  const report = checkMurdererEpistemics(chessLevel);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
