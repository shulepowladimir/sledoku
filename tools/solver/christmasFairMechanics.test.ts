import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import { buildLevelIndex } from '../../src/engine/board';
import type { Clue } from '../../src/types/clue';
import { cellId, type Level } from '../../src/types/level';
import { lintLevel } from './lint';
import { evalClue } from './solve';

type TestRoomGroup = { id: string; name: string; roomIds: string[] };
type TestLevel = Level & { roomGroups?: TestRoomGroup[] };

const people = apartmentLevel.people.map((person, index) => ({
  ...person,
  initialLetter: ['А', 'Б', 'Е', 'Г', 'Д', 'Х'][index],
}));

function mechanicsLevel(roomGroups: TestRoomGroup[] = [
  { id: 'market', name: 'Торговые ряды', roomIds: ['food', 'rink'] },
]): TestLevel {
  const level = {
    ...apartmentLevel,
    rooms: [
      { id: 'food', name: 'Ряд еды', floorTexture: 'snow' },
      { id: 'rink', name: 'Каток', floorTexture: 'ice' },
      { id: 'cabin', name: 'Домик', floorTexture: 'wood' },
    ],
    roomGroups,
    cells: apartmentLevel.cells.map((cell) => ({
      ...cell,
      roomId: cell.col < 2 ? 'food' : cell.col < 4 ? 'rink' : 'cabin',
      itemId: undefined,
    })),
    itemTypes: [{ id: 'gift', label: 'Подарок', kind: 'decorative', icon: 'gift' }],
    items: [
      { id: 'gift-a', typeId: 'gift', cells: [cellId(0, 1)] },
      { id: 'gift-b', typeId: 'gift', cells: [cellId(4, 4)] },
    ],
    people,
    clues: [],
  };
  return level as unknown as TestLevel;
}

function clue(data: Record<string, unknown>): Clue {
  return data as unknown as Clue;
}

function placements(entries: [string, number, number][]): (personId: string) => ReturnType<typeof cellId> | undefined {
  const cells = new Map(entries.map(([personId, row, col]) => [personId, cellId(row, col)]));
  return (personId) => cells.get(personId);
}

test('roomGroupMembership accepts any listed room and supports negation', () => {
  const level = mechanicsLevel();
  const index = buildLevelIndex(level);
  const groupClue = clue({
    id: 'market-membership',
    type: 'roomGroupMembership',
    subject: { type: 'person', id: 'andrei' },
    roomGroupId: 'market',
    text: 'Андрей находился в одном из торговых рядов.',
  });
  const getCell = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 4],
    ['galina', 3, 5],
    ['denis', 4, 3],
    ['hristina', 5, 1],
  ]);

  assert.equal(evalClue(groupClue, getCell, level, index, true), true);
  assert.equal(evalClue(groupClue, (id) => id === 'andrei' ? cellId(0, 2) : getCell(id), level, index, true), true);
  assert.equal(evalClue(groupClue, (id) => id === 'andrei' ? cellId(0, 4) : getCell(id), level, index, true), false);
  assert.equal(evalClue({ ...groupClue, negated: true }, (id) => id === 'andrei' ? cellId(0, 4) : getCell(id), level, index, true), true);
});

test('roomGroupMembership validates the group reference and non-empty room list', () => {
  const level = mechanicsLevel();
  const valid = clue({
    id: 'market-membership',
    type: 'roomGroupMembership',
    subject: { type: 'person', id: 'andrei' },
    roomGroupId: 'market',
    text: 'Андрей находился в одном из торговых рядов.',
  });

  assert.ok(!lintLevel({ ...level, clues: [valid] }).some((issue) => issue.includes('(roomGroupMembership)')));
  assert.ok(lintLevel({ ...level, clues: [{ ...valid, roomGroupId: 'missing' }] }).some((issue) => issue.includes('группа зон')));
  assert.ok(lintLevel({ ...level, roomGroups: [{ id: 'market', name: 'Пустая группа', roomIds: [] }], clues: [valid] })
    .some((issue) => issue.includes('не должна быть пустой')));
});

test('sharedRoomLetterGroup relates the subject to another matching person, never itself', () => {
  const level = mechanicsLevel();
  const index = buildLevelIndex(level);
  const groupClue = clue({
    id: 'same-room-as-vowel',
    type: 'sharedRoomLetterGroup',
    subject: { type: 'person', id: 'andrei' },
    letterClass: 'vowel',
    text: 'Андрей находился в одной зоне с человеком, чьё имя начинается на гласную.',
  });
  const together = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 1],
    ['galina', 3, 3],
    ['denis', 4, 4],
    ['hristina', 5, 5],
  ]);
  const apart = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 3],
    ['galina', 3, 1],
    ['denis', 4, 4],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(groupClue, together, level, index, true), true);
  assert.equal(evalClue(groupClue, apart, level, index, true), false);
  assert.equal(evalClue(groupClue, placements([['andrei', 0, 0]]), level, index, false), undefined);
});

test('sharedRoomLetterGroup rejects a selector that could relate someone to the known victim', () => {
  const level = mechanicsLevel();
  const consonants = clue({
    id: 'same-room-as-consonant',
    type: 'sharedRoomLetterGroup',
    subject: { type: 'person', id: 'andrei' },
    letterClass: 'consonant',
    text: 'Андрей находился в одной зоне с человеком, чьё имя начинается на согласную.',
  });

  assert.ok(lintLevel({ ...level, clues: [consonants] }).some((issue) => issue.includes('не может включать жертву')));
});

test('relativePosition minimum offset enforces a lower bound rather than direction alone', () => {
  const level = mechanicsLevel();
  const index = buildLevelIndex(level);
  const minDistance = clue({
    id: 'at-least-four-rows-north',
    type: 'relativePosition',
    subject: { type: 'person', id: 'andrei' },
    otherPersonId: 'boris',
    axis: 'row',
    direction: 'before',
    minOffset: 4,
    text: 'Андрей находился не менее чем на четыре ряда севернее Бориса.',
  });

  assert.equal(evalClue(minDistance, placements([['andrei', 0, 0], ['boris', 4, 1]]), level, index, true), true);
  assert.equal(evalClue(minDistance, placements([['andrei', 1, 0], ['boris', 4, 1]]), level, index, true), false);
  assert.equal(evalClue(minDistance, placements([['andrei', 4, 0], ['boris', 1, 1]]), level, index, true), false);
});

test('relativePosition validates positive minimum offsets and forbids exact and minimum offsets together', () => {
  const level = mechanicsLevel();
  const base = {
    id: 'distance',
    type: 'relativePosition',
    subject: { type: 'person', id: 'andrei' },
    otherPersonId: 'boris',
    axis: 'row',
    direction: 'before',
    text: 'Андрей находился севернее Бориса.',
  };

  assert.ok(lintLevel({ ...level, clues: [clue({ ...base, minOffset: 0 })] }).some((issue) => issue.includes('minOffset')));
  assert.ok(lintLevel({ ...level, clues: [clue({ ...base, offset: 2, minOffset: 3 })] }).some((issue) => issue.includes('offset')));
});

test('itemAbsentInLine checks only the clue-selected axis', () => {
  const level = mechanicsLevel();
  const index = buildLevelIndex(level);
  const rowAbsence = clue({
    id: 'no-gift-in-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'andrei' },
    itemTypeId: 'gift',
    axis: 'row',
    text: 'В ряду с Андреем не было подарков.',
  });
  const colAbsence = { ...rowAbsence, id: 'no-gift-in-column', axis: 'col' };
  const onGiftColumn = placements([
    ['andrei', 3, 1],
    ['boris', 1, 2],
    ['vladimir', 2, 3],
    ['galina', 0, 4],
    ['denis', 4, 0],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(rowAbsence, onGiftColumn, level, index, true), true);
  assert.equal(evalClue(colAbsence, onGiftColumn, level, index, true), false);
});

test('itemAbsentInLine validates item type and requires gifts across distinct lines', () => {
  const level = mechanicsLevel();
  const base = {
    id: 'no-gift-in-column',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'andrei' },
    itemTypeId: 'gift',
    axis: 'col',
    text: 'В столбце с Андреем не было подарков.',
  };

  assert.ok(!lintLevel({ ...level, clues: [clue(base)] }).some((issue) => issue.includes('(itemAbsentInLine)')));
  assert.ok(lintLevel({ ...level, clues: [clue({ ...base, itemTypeId: 'missing' })] }).some((issue) => issue.includes('тип предмета')));
  const oneGift = { ...level, items: [level.items[0], { ...level.items[1], cells: [cellId(3, 1)] }] };
  assert.ok(lintLevel({ ...oneGift, clues: [clue(base)] }).some((issue) => issue.includes('нескольких столбцах')));
});
