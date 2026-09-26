import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import type { Clue } from '../../src/types/clue';
import { buildLevelIndex } from '../../src/engine/board';
import type { Level, Room } from '../../src/types/level';
import { cellId } from '../../src/types/level';
import { evalClue } from './solve';
import { lintLevel } from './lint';

const people = apartmentLevel.people.filter((person) => !person.isVictim).slice(0, 2);
const [alpha, beta] = people;

const rooms = [
  { id: 'hole-1', name: 'Лунка 1', floorTexture: 'grass', number: 1 },
  { id: 'hole-2', name: 'Лунка 2', floorTexture: 'grass', number: 2 },
  { id: 'hole-3', name: 'Лунка 3', floorTexture: 'grass', number: 3 },
] as Room[];

const level: Level = {
  ...apartmentLevel,
  rooms,
  cells: apartmentLevel.cells.map((cell) => ({
    ...cell,
    roomId: cell.row < 2 ? 'hole-1' : cell.row < 4 ? 'hole-2' : 'hole-3',
  })),
  clues: [],
};

function clue(comparison: 'higher' | 'lower' = 'higher'): Clue {
  return {
    id: 'test-room-number-comparison',
    text: 'Номер лунки был больше.',
    type: 'roomNumberComparison',
    subject: { type: 'person', id: alpha.id },
    otherPersonId: beta.id,
    comparison,
  } as unknown as Clue;
}

test('roomNumberComparison strictly compares the numbered rooms of two people', () => {
  const index = buildLevelIndex(level);
  const getCell = (personId: string) =>
    personId === alpha.id ? cellId(4, 0) : cellId(2, 1);

  assert.equal(evalClue(clue('higher'), getCell, level, index, true), true);
  assert.equal(evalClue(clue('lower'), getCell, level, index, true), false);
  assert.equal(
    evalClue(clue('lower'), (personId) => personId === alpha.id ? cellId(0, 0) : cellId(4, 1), level, index, true),
    true,
  );
  assert.equal(
    evalClue(clue('higher'), (personId) => personId === alpha.id ? cellId(4, 0) : cellId(5, 1), level, index, true),
    false,
    'two people in the same room do not satisfy a strict comparison',
  );
  assert.equal(evalClue(clue(), () => undefined, level, index, false), undefined);
});

test('roomNumberComparison requires unique positive room numbers and valid non-victim people', () => {
  const comparison = clue();
  const missingNumber = {
    ...level,
    rooms: rooms.map((room, index) => index === 2 ? { ...room, number: undefined } : room),
    clues: [comparison],
  };
  const duplicateNumber = {
    ...level,
    rooms: rooms.map((room, index) => index === 2 ? { ...room, number: 2 } : room),
    clues: [comparison],
  };
  const victimId = apartmentLevel.people.find((person) => person.isVictim)!.id;
  const referencesVictim = {
    ...level,
    clues: [{ ...comparison, otherPersonId: victimId }],
  };
  const addressesVictimRole = {
    ...level,
    clues: [{ ...comparison, subject: { type: 'role' as const, role: 'victim' } }],
  };

  assert.ok(lintLevel(missingNumber).some((violation) => violation.includes('roomNumberComparison')));
  assert.ok(lintLevel(duplicateNumber).some((violation) => violation.includes('roomNumberComparison')));
  assert.ok(lintLevel(referencesVictim).some((violation) => violation.includes('жертву')));
  assert.ok(lintLevel(addressesVictimRole).some((violation) => violation.includes('жертву')));
});
