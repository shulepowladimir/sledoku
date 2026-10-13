import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import type { Clue } from '../../src/types/clue';
import { buildLevelIndex } from '../../src/engine/board';
import type { Level } from '../../src/types/level';
import { cellId } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { evalClue } from './solve';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';

const seatCells = [cellId(0, 0), cellId(1, 1)];
const roleOccupiesItem = {
  id: 'test-passengers-in-airplane-seats',
  type: 'roleOccupiesItem',
  roleId: 'passenger',
  itemTypeId: 'airplaneSeat',
  text: 'Все пассажиры сидели в креслах самолёта.',
} as unknown as Clue;

const level: Level = {
  ...apartmentLevel,
  itemTypes: [{ id: 'airplaneSeat', label: 'Кресло самолёта', kind: 'occupiable', icon: 'airplaneSeat' }],
  items: seatCells.map((cell, index) => ({ id: `seat-${index}`, typeId: 'airplaneSeat', cells: [cell] })),
  cells: apartmentLevel.cells.map((cell) => {
    const seatIndex = seatCells.indexOf(cell.id);
    const { itemId: _previousItemId, ...cellWithoutItem } = cell;
    return { ...cellWithoutItem, ...(seatIndex >= 0 ? { itemId: `seat-${seatIndex}` } : {}) };
  }),
  people: apartmentLevel.people.map((person, index) => ({
    ...person,
    roles: index < 2 ? ['passenger'] : ['crew'],
  })),
  clues: [roleOccupiesItem],
};

function placements(entries: [string, number, number][]): (personId: string) => ReturnType<typeof cellId> | undefined {
  const cells = new Map(entries.map(([personId, row, col]) => [personId, cellId(row, col)]));
  return (personId) => cells.get(personId);
}

test('roleOccupiesItem requires every holder of a multi-person role to occupy the item type', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([
    [level.people[0].id, 0, 0],
    [level.people[1].id, 1, 1],
  ]);

  assert.equal(evalClue(roleOccupiesItem, getCell, level, index, true), true);
  assert.deepEqual(generalCluesForDisplay(level.clues).map((clue) => clue.text), [roleOccupiesItem.text]);
  assert.ok(lintLevel(level).every((issue) => !issue.includes('(roleOccupiesItem)')));
});

test('roleOccupiesItem rejects a placed role-holder outside the item even in a partial solution', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([[level.people[0].id, 0, 1]]);

  assert.equal(evalClue(roleOccupiesItem, getCell, level, index, false), false);
});

test('roleOccupiesItem remains undecided until every role-holder has been placed', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([[level.people[0].id, 0, 0]]);

  assert.equal(evalClue(roleOccupiesItem, getCell, level, index, false), undefined);
});

test('roleOccupiesItem lint requires role-holders and a real occupiable item with placements', () => {
  const noPassengers: Level = {
    ...level,
    people: level.people.map((person) => ({ ...person, roles: ['crew'] })),
  };
  assert.ok(lintLevel(noPassengers).some((issue) => issue.includes('в ростере нет носителей роли "passenger"')));

  const decorativeSeats: Level = {
    ...level,
    itemTypes: [{ id: 'airplaneSeat', label: 'Кресло самолёта', kind: 'decorative', icon: 'airplaneSeat' }],
  };
  assert.ok(lintLevel(decorativeSeats).some((issue) => issue.includes('не occupiable')));

  const missingSeatType: Level = {
    ...level,
    itemTypes: [],
    items: [],
    cells: level.cells.map((cell) => {
      const { itemId: _itemId, ...withoutItem } = cell;
      return withoutItem;
    }),
  };
  assert.ok(lintLevel(missingSeatType).some((issue) => issue.includes('не описан в level.itemTypes')));
  assert.ok(lintLevel(missingSeatType).some((issue) => issue.includes('на уровне нет предметов')));
});

test('roleOccupiesItem uses the item-related clue-balance cap', () => {
  const fillerTypes = ['roomParity', 'roomOccupancy', 'zoneCountParity', 'zoneOccupancy', 'letterGroupRoom'];
  const balancedLevel: Level = {
    ...level,
    meta: { ...level.meta, clueBalanceExempt: false },
    clues: [
      { ...roleOccupiesItem, id: 'passengers-in-seats-1' },
      { ...roleOccupiesItem, id: 'passengers-in-seats-2' },
      ...fillerTypes.map((type, index) => ({
        id: `balance-filler-${index}`,
        type,
        text: 'Тестовая общая подсказка.',
      } as unknown as Clue)),
    ],
  };

  const quality = checkPuzzleQuality(balancedLevel);
  assert.equal(quality.clueTypeStats.find((stat) => stat.type === 'roleOccupiesItem')?.percent, (2 / 7) * 100);
  assert.ok(!quality.violations.some((issue) => issue.includes('Тип подсказки "roleOccupiesItem"')));
});
