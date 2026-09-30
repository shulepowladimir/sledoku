import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Clue } from '../../src/types/clue';
import { cellId } from '../../src/types/level';
import { apartmentLevel } from '../../levels/01-apartment';
import { buildLevelIndex } from '../../src/engine/board';
import { lintLevel } from './lint';
import { evalClue } from './solve';

const archCells = [cellId(1, 2), cellId(1, 3)];
const archId = 'test-flower-arch';

const level = {
  ...apartmentLevel,
  itemTypes: [
    ...apartmentLevel.itemTypes,
    { id: 'flowerArch', label: 'Цветочная арка', kind: 'decorative' as const, icon: 'flowerArch' },
  ],
  items: [...apartmentLevel.items, { id: archId, typeId: 'flowerArch', cells: archCells }],
  cells: apartmentLevel.cells.map((cell) =>
    archCells.includes(cell.id) ? { ...cell, itemId: archId } : cell,
  ),
  people: apartmentLevel.people.map((person) => ({
    ...person,
    roles: person.id === 'galina' ? ['bride'] : person.id === 'andrei' ? ['groom'] : [],
  })),
  clues: apartmentLevel.clues,
};

const symmetryClue = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-bride-groom-symmetry',
  type: 'symmetricPosition',
  subject: { type: 'role', role: 'bride' },
  other: { type: 'role', role: 'groom' },
  anchorItemId: archId,
  subjectGender: 'female',
  otherGender: 'male',
  text: 'Невеста и жених находились симметрично относительно цветочной арки.',
  ...overrides,
}) as unknown as Clue;

function placements(entries: [string, number, number][]) {
  const assigned = new Map(entries.map(([personId, row, col]) => [personId, cellId(row, col)]));
  return (personId: string) => assigned.get(personId);
}

test('symmetricPosition matches a 180-degree reflection around a two-cell anchor', () => {
  const index = buildLevelIndex(level);
  const clue = symmetryClue();
  const reflected = placements([
    ['galina', 0, 4],
    ['andrei', 2, 1],
  ]);
  const notReflected = placements([
    ['galina', 0, 4],
    ['andrei', 2, 2],
  ]);

  assert.equal(evalClue(clue, reflected, level, index, true), true);
  assert.equal(evalClue(clue, notReflected, level, index, true), false);
  assert.equal(evalClue(clue, placements([['galina', 0, 4]]), level, index, false), undefined);
});

test('symmetricPosition enforces the gender semantics of bride and groom roles', () => {
  const wrongGender = {
    ...level,
    people: level.people.map((person) => person.id === 'galina'
      ? { ...person, gender: 'male' as const }
      : person),
  };

  assert.equal(
    evalClue(symmetryClue(), placements([['galina', 0, 4], ['andrei', 2, 1]]), wrongGender, buildLevelIndex(wrongGender), true),
    false,
  );
});

test('symmetricPosition lint requires distinct unique roles and a two-cell adjacent anchor', () => {
  const clue = symmetryClue();
  assert.deepEqual(lintLevel({ ...level, clues: [...level.clues, clue] }), []);
  assert.ok(lintLevel({ ...level, clues: [...level.clues, symmetryClue({ anchorItemId: 'missing' })] }).some((issue) => issue.includes('предмет-якорь')));
  assert.ok(lintLevel({ ...level, clues: [...level.clues, symmetryClue({ other: { type: 'role', role: 'bride' } })] }).some((issue) => issue.includes('самим собой')));
  assert.ok(lintLevel({
    ...level,
    items: level.items.map((item) => item.id === archId ? { ...item, cells: [archCells[0]] } : item),
    cells: level.cells.map((cell) => cell.id === archCells[1] ? { ...cell, itemId: undefined } : cell),
    clues: [clue],
  }).some((issue) => issue.includes('две смежные клетки')));
});
