import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import type { AtEdgeItemClue, Clue } from '../../src/types/clue';
import { cellId, type Level } from '../../src/types/level';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue } from './solve';

const personId = apartmentLevel.people[0].id;
const clue: AtEdgeItemClue = {
  id: 'test-at-starting-gate',
  type: 'atEdgeItem',
  subject: { type: 'person', id: personId },
  edgeItemTypeId: 'startingGate',
  text: 'Персонаж находился у стартовых ворот.',
};

const level = {
  ...apartmentLevel,
  itemTypes: [{ id: 'startingGate', label: 'Стартовые ворота', kind: 'decorative' as const, icon: 'startingGate' }],
  edgeItems: [
    { id: 'gate-west', typeId: 'startingGate', cellA: cellId(1, 1), cellB: cellId(1, 2) },
    { id: 'gate-east', typeId: 'startingGate', cellA: cellId(3, 3), cellB: cellId(4, 3) },
  ],
  clues: [clue],
} as Level;

function getCellAt(row: number, col: number) {
  return (candidateId: string) => candidateId === personId ? cellId(row, col) : undefined;
}

test('atEdgeItem matches either cell on any gate of the requested type', () => {
  const index = buildLevelIndex(level);

  assert.equal(evalClue(clue, getCellAt(1, 1), level, index, true), true);
  assert.equal(evalClue(clue, getCellAt(4, 3), level, index, true), true);
  assert.equal(evalClue(clue, getCellAt(2, 2), level, index, true), false);
});

test('atEdgeItem can target one gate and remains undecided until its subject is placed', () => {
  const index = buildLevelIndex(level);
  const oneGate: Clue = { ...clue, edgeItemId: 'gate-west' };

  assert.equal(evalClue(oneGate, getCellAt(4, 3), level, index, true), false);
  assert.equal(evalClue(oneGate, () => undefined, level, index, false), undefined);
  assert.equal(evalClue({ ...oneGate, negated: true }, getCellAt(2, 2), level, index, true), true);
});

test('edge items leave both neighboring cells available for people', () => {
  const index = buildLevelIndex(level);

  assert.equal(isLegalTarget(index, level, cellId(1, 1)), true);
  assert.equal(isLegalTarget(index, level, cellId(1, 2)), true);
  assert.equal(level.cells.find((cell) => cell.id === cellId(1, 1))?.itemId, undefined);
  assert.equal(level.cells.find((cell) => cell.id === cellId(1, 2))?.itemId, undefined);
});

test('lint requires edge items to reference existing types and neighboring cells', () => {
  const invalidLevel = {
    ...level,
    edgeItems: [
      { id: 'broken', typeId: 'missingType', cellA: cellId(1, 1), cellB: cellId(3, 3) },
    ],
    clues: [{ ...clue, edgeItemId: 'unknown-gate' }],
  };
  const issues = lintLevel(invalidLevel);

  assert.ok(issues.some((issue) => issue.includes('missingType')));
  assert.ok(issues.some((issue) => issue.includes('ортогонально соседними')));
  assert.ok(issues.some((issue) => issue.includes('unknown-gate')));
});

test('edge-item clues use the item-related clue-balance allowance', () => {
  const repeatedClues = Array.from({ length: 4 }, (_, index) => ({ ...clue, id: `edge-clue-${index}` }));
  const report = checkPuzzleQuality({
    ...level,
    meta: { ...level.meta, clueBalanceExempt: false },
    clues: repeatedClues,
  });
  const balanceIssue = report.violations.find((issue) => issue.includes('atEdgeItem'));

  assert.ok(balanceIssue?.includes('выше предела 30%'));
});
