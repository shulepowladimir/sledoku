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

const carCells = [cellId(0, 0), cellId(1, 1), cellId(2, 2)];
const letterGroupOccupiesItem = {
  id: 'test-vowels-in-cars',
  type: 'letterGroupOccupiesItem',
  letterClass: 'vowel',
  itemTypeId: 'car',
  text: 'Все, чьи имена начинались на гласную букву, находились в машинах.',
} as unknown as Clue;

const level: Level = {
  ...apartmentLevel,
  itemTypes: [{ id: 'car', label: 'Машина', kind: 'occupiable', icon: 'car' }],
  items: carCells.map((cell, index) => ({ id: `car-${index}`, typeId: 'car', cells: [cell] })),
  cells: apartmentLevel.cells.map((cell) => {
    const itemId = carCells.indexOf(cell.id);
    const { itemId: _previousItemId, ...cellWithoutItem } = cell;
    return { ...cellWithoutItem, ...(itemId >= 0 ? { itemId: `car-${itemId}` } : {}) };
  }),
  people: apartmentLevel.people.map((person, index) => ({
    ...person,
    initialLetter: ['А', 'Е', 'И', 'Б', 'В', 'Г'][index],
  })),
  clues: [letterGroupOccupiesItem],
};

function placements(entries: [string, number, number][]): (personId: string) => ReturnType<typeof cellId> | undefined {
  const cells = new Map(entries.map(([personId, row, col]) => [personId, cellId(row, col)]));
  return (personId) => cells.get(personId);
}

test('letterGroupOccupiesItem requires every vowel-initial person to occupy the item type', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([
    ['andrei', 0, 0],
    ['boris', 1, 1],
    ['vladimir', 2, 2],
    ['galina', 3, 3],
    ['denis', 4, 4],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(letterGroupOccupiesItem, getCell, level, index, true), true);
  assert.deepEqual(generalCluesForDisplay(level.clues).map((clue) => clue.text), [letterGroupOccupiesItem.text]);
  assert.ok(lintLevel(level).every((issue) => !issue.includes('(letterGroupOccupiesItem)')));
});

test('letterGroupOccupiesItem rejects a placed group member outside the item even in a partial solution', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([['andrei', 0, 1]]);

  assert.equal(evalClue(letterGroupOccupiesItem, getCell, level, index, false), false);
});

test('letterGroupOccupiesItem lint requires a matching letter class and a real occupiable item type', () => {
  const noVowels: Level = {
    ...level,
    people: level.people.map((person) => ({ ...person, initialLetter: 'Б' })),
  };
  assert.ok(lintLevel(noVowels).some((issue) => issue.includes('в ростере нет персонажей выбранного класса букв')));

  const decorativeCars: Level = {
    ...level,
    itemTypes: [{ id: 'car', label: 'Машина', kind: 'decorative', icon: 'car' }],
  };
  assert.ok(lintLevel(decorativeCars).some((issue) => issue.includes('не occupiable')));

  const missingCars: Level = {
    ...level,
    itemTypes: [],
    items: [],
    cells: level.cells.map((cell) => {
      const { itemId: _itemId, ...withoutItem } = cell;
      return withoutItem;
    }),
  };
  assert.ok(lintLevel(missingCars).some((issue) => issue.includes('не описан в level.itemTypes')));
  assert.ok(lintLevel(missingCars).some((issue) => issue.includes('на уровне нет предметов')));
});

test('letterGroupOccupiesItem uses the item-related 30% clue balance cap', () => {
  const fillerTypes = ['roomParity', 'roomOccupancy', 'zoneCountParity', 'zoneOccupancy', 'letterGroupRoom'];
  const balancedLevel: Level = {
    ...level,
    meta: { ...level.meta, clueBalanceExempt: false },
    clues: [
      { ...letterGroupOccupiesItem, id: 'vowels-in-cars-1' },
      { ...letterGroupOccupiesItem, id: 'vowels-in-cars-2' },
      ...fillerTypes.map((type, index) => ({
        id: `balance-filler-${index}`,
        type,
        text: 'Тестовая общая подсказка.',
      } as unknown as Clue)),
    ],
  };

  const quality = checkPuzzleQuality(balancedLevel);
  assert.equal(quality.clueTypeStats.find((stat) => stat.type === 'letterGroupOccupiesItem')?.percent, (2 / 7) * 100);
  assert.ok(!quality.violations.some((issue) => issue.includes('Тип подсказки "letterGroupOccupiesItem"')));
});
