import type { Clue } from '../src/types/clue';
import type { FloorFeature, Item, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 12;

const rooms: Room[] = [
  { id: 'attic', name: 'Чердак', floorTexture: 'stairs', worldId: 'ordinary', familyId: 'attic' },
  { id: 'tree', name: 'Дерево', floorTexture: 'cliff', worldId: 'ordinary', familyId: 'tree' },
  { id: 'cloud', name: 'Облако', floorTexture: 'sky', worldId: 'ordinary', familyId: 'cloud' },
  { id: 'house', name: 'Дом', floorTexture: 'wood', worldId: 'ordinary', familyId: 'house' },
  { id: 'machine', name: 'Машина', floorTexture: 'cobble', worldId: 'ordinary', familyId: 'machine' },
  { id: 'other-house', name: 'Потусторонний дом', floorTexture: 'wood', worldId: 'otherworld', familyId: 'house' },
  { id: 'other-tree', name: 'Потустороннее дерево', floorTexture: 'cliff', worldId: 'otherworld', familyId: 'tree' },
  { id: 'other-machine', name: 'Потусторонняя машина', floorTexture: 'cobble', worldId: 'otherworld', familyId: 'machine' },
  { id: 'other-attic', name: 'Потусторонний чердак', floorTexture: 'stairs', worldId: 'otherworld', familyId: 'attic' },
  { id: 'tuch', name: 'Туча', floorTexture: 'sky', worldId: 'otherworld', familyId: 'cloud' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'tree-crown', label: 'Крона дерева', textureKey: 'grass' },
];

const itemTypes = [
  ItemLibrary.box(),
  ItemLibrary.clock(),
  ItemLibrary.radioStation(),
  ItemLibrary.portableRadio(),
  ItemLibrary.bed(),
  ItemLibrary.table(),
  ItemLibrary.chair(),
  ItemLibrary.sofa(),
  { ...ItemLibrary.garland(), render: 'tile' as const, tileEdgeDepth: false },
  ItemLibrary.computer(),
  ItemLibrary.basketball(),
  ItemLibrary.bicycle(),
  ItemLibrary.lamppost(),
  ItemLibrary.toolbox(),
];

const items: Item[] = [
  { id: 'box-attic', typeId: 'box', cells: [cellId(0, 1)] },
  { id: 'box-other-attic', typeId: 'box', cells: [cellId(9, 0)] },
  { id: 'clock-attic', typeId: 'clock', cells: [cellId(1, 0)] },
  { id: 'clock-other-attic', typeId: 'clock', cells: [cellId(9, 2)] },
  { id: 'radio-station-attic', typeId: 'radioStation', cells: [cellId(1, 2)] },
  { id: 'radio-station-other-tree', typeId: 'radioStation', cells: [cellId(11, 3)] },
  { id: 'radio-station-other-machine', typeId: 'radioStation', cells: [cellId(7, 8)] },
  { id: 'portable-radio-attic', typeId: 'portableRadio', cells: [cellId(2, 0)] },
  { id: 'portable-radio-other-attic', typeId: 'portableRadio', cells: [cellId(11, 0)] },
  { id: 'bed-house', typeId: 'bed', cells: [cellId(3, 0)] },
  { id: 'bed-other-house', typeId: 'bed', cells: [cellId(6, 0)] },
  { id: 'table-house', typeId: 'table', cells: [cellId(3, 1)] },
  { id: 'table-other-house', typeId: 'table', cells: [cellId(6, 1)] },
  { id: 'chair-house', typeId: 'chair', cells: [cellId(3, 2)] },
  { id: 'chair-other-house', typeId: 'chair', cells: [cellId(6, 2)] },
  { id: 'sofa-house', typeId: 'sofa', cells: [cellId(4, 0)] },
  { id: 'sofa-other-house', typeId: 'sofa', cells: [cellId(7, 0)] },
  { id: 'garland-tree', typeId: 'garland', cells: [cellId(0, 5), cellId(0, 6), cellId(1, 5), cellId(1, 6)] },
  { id: 'garland-other-tree', typeId: 'garland', cells: [cellId(9, 4), cellId(9, 5), cellId(10, 4), cellId(10, 5)] },
  { id: 'garland-house', typeId: 'garland', cells: [cellId(4, 1), cellId(4, 2), cellId(5, 1), cellId(5, 2)] },
  { id: 'garland-other-house', typeId: 'garland', cells: [cellId(7, 3), cellId(7, 4), cellId(8, 3), cellId(8, 4)] },
  { id: 'computer-machine', typeId: 'computer', cells: [cellId(4, 8)] },
  { id: 'basketball-tree', typeId: 'basketball', cells: [cellId(1, 7)] },
  { id: 'bicycle-tree', typeId: 'bicycle', cells: [cellId(1, 3)] },
  { id: 'bicycle-other-tree', typeId: 'bicycle', cells: [cellId(11, 8)] },
  { id: 'lamppost-tree', typeId: 'lamppost', cells: [cellId(3, 6)] },
  { id: 'lamppost-other-tree', typeId: 'lamppost', cells: [cellId(8, 5)] },
  { id: 'lamppost-machine', typeId: 'lamppost', cells: [cellId(3, 8)] },
  { id: 'bicycle-machine', typeId: 'bicycle', cells: [cellId(4, 10)] },
  { id: 'toolbox-machine', typeId: 'toolbox', cells: [cellId(5, 9)] },
  { id: 'toolbox-other-machine', typeId: 'toolbox', cells: [cellId(6, 10)] },
  { id: 'toolbox-house', typeId: 'toolbox', cells: [cellId(5, 0)] },
  { id: 'basketball-other-machine', typeId: 'basketball', cells: [cellId(8, 8)] },
];

const ROOM_ROWS = [
  'AAATTTTTTCCC',
  'AAATTTTTTCCC',
  'AAAATTTTCCCC',
  'HHHHHTTMMMCC',
  'HHHHHTTMMMMM',
  'HHHHHTTMMMMM',
  'hhhhhttmmmmm',
  'hhhhhttmmmmm',
  'hhhhhttmmmcc',
  'aaaattttcccc',
  'aaattttttccc',
  'aaattttttccc',
];

const ROOM_BY_LETTER: Record<string, string> = {
  A: 'attic',
  T: 'tree',
  C: 'cloud',
  H: 'house',
  M: 'machine',
  a: 'other-attic',
  t: 'other-tree',
  h: 'other-house',
  m: 'other-machine',
  c: 'tuch',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const ordinaryCrownCells = [
  ...[0, 1].flatMap((row) => [3, 4, 5, 6, 7, 8].map((col) => cellId(row, col))),
  ...[4, 5, 6, 7].map((col) => cellId(2, col)),
];
const crownCells = new Set([
  ...ordinaryCrownCells,
  ...ordinaryCrownCells.map((id) => {
    const [row, col] = id.split('-').map(Number);
    return cellId(11 - row, 11 - col);
  }),
]);

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  crownCells.has(cell.id) ? { ...cell, floorFeatureId: 'tree-crown' } : cell,
);

const people: Person[] = [
  { id: 'alexey', name: 'Алексей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bill', name: 'Билл', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: true },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'jimmy', name: 'Джимми', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'evgeny', name: 'Евгений', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'zina', name: 'Зина', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ida', name: 'Ида', initialLetter: 'И', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'karina', name: 'Карина', initialLetter: 'К', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'luka', name: 'Лука', initialLetter: 'Л', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'helen', name: 'Хелен', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, ReturnType<typeof cellId>> = {
  alexey: cellId(6, 9),
  bill: cellId(10, 8),
  viktor: cellId(11, 2),
  galina: cellId(1, 4),
  jimmy: cellId(2, 7),
  evgeny: cellId(7, 10),
  zhanna: cellId(0, 0),
  zina: cellId(4, 3),
  ida: cellId(8, 6),
  karina: cellId(5, 11),
  luka: cellId(3, 5),
  helen: cellId(9, 1),
};

const clues: Clue[] = [
  {
    id: 'sc-alexey-north-evgeny',
    type: 'relativePosition',
    subject: { type: 'person', id: 'alexey' },
    otherPersonId: 'evgeny',
    axis: 'row',
    direction: 'before',
    offset: 1,
    text: 'Алексей находился на ряд севернее Евгения.',
  },
  {
    id: 'sc-alexey-toolbox-adjacent',
    type: 'adjacency',
    subject: { type: 'person', id: 'alexey' },
    itemTypeId: 'toolbox',
    text: 'Алексей находился рядом с ящиком инструментов.',
  },
  {
    id: 'sc-bill-south-ida',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bill' },
    otherPersonId: 'ida',
    axis: 'row',
    direction: 'after',
    offset: 2,
    text: 'Билл находился ровно на два ряда южнее Иды.',
  },
  {
    id: 'sc-bill-bicycle-axis',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'bill' },
    itemTypeId: 'bicycle',
    text: 'Билл делил ряд или колонку с велосипедом.',
  },
  {
    id: 'sc-viktor-radio-row',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'viktor' },
    itemTypeId: 'radioStation',
    text: 'Виктор находился в ряду или колонке с радиостанцией.',
  },
  {
    id: 'sc-viktor-portable-radio-axis',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'viktor' },
    itemTypeId: 'portableRadio',
    text: 'Виктор делил ряд или колонку с переносной рацией.',
  },
  {
    id: 'sc-galina-basketball-axis',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'basketball',
    text: 'Галина делила ряд или колонку с баскетбольным мячом.',
  },
  {
    id: 'sc-galina-bicycle-adjacent',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'bicycle',
    text: 'Галина находилась рядом с велосипедом.',
  },
  {
    id: 'sc-jimmy-basketball-adjacent',
    type: 'adjacency',
    subject: { type: 'person', id: 'jimmy' },
    itemTypeId: 'basketball',
    text: 'Джимми находился рядом с баскетбольным мячом.',
  },
  {
    id: 'sc-evgeny-toolbox-axis',
    type: 'adjacency',
    subject: { type: 'person', id: 'evgeny' },
    itemTypeId: 'toolbox',
    text: 'Евгений находился рядом с ящиком инструментов.',
  },
  {
    id: 'sc-zhanna-near-tree',
    type: 'zoneNeighborOf',
    subject: { type: 'person', id: 'zhanna' },
    roomId: 'tree',
    text: 'Жанна находилась в зоне, соседней с деревом.',
  },
  {
    id: 'sc-zhanna-north-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'viktor',
    axis: 'row',
    direction: 'before',
    text: 'Жанна находилась севернее Виктора.',
  },
  {
    id: 'sc-zina-house',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zina' },
    roomId: 'house',
    text: 'Зина находилась в доме.',
  },
  {
    id: 'sc-zina-north-of-karina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zina' },
    otherPersonId: 'karina',
    axis: 'row',
    direction: 'before',
    offset: 1,
    text: 'Зина находилась на ряд севернее Карины.',
  },
  {
    id: 'sc-zina-east-of-zhanna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zina' },
    otherPersonId: 'zhanna',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Зина находилась ровно на три колонки восточнее Жанны.',
  },
  {
    id: 'sc-ida-cliff',
    type: 'floorTexture',
    subject: { type: 'person', id: 'ida' },
    textureKey: 'cliff',
    text: 'Ида находилась на стволе дерева.',
  },
  {
    id: 'sc-ida-lamppost-adjacent',
    type: 'adjacency',
    subject: { type: 'person', id: 'ida' },
    itemTypeId: 'lamppost',
    text: 'Ида находилась рядом с фонарём.',
  },
  {
    id: 'sc-karina-machine',
    type: 'roomMembership',
    subject: { type: 'person', id: 'karina' },
    roomId: 'machine',
    text: 'Карина находилась в машине.',
  },
  {
    id: 'sc-karina-toolbox-axis',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'karina' },
    itemTypeId: 'toolbox',
    text: 'Карина делила ряд или колонку с ящиком инструментов.',
  },
  {
    id: 'sc-luka-lamppost-adjacent',
    type: 'adjacency',
    subject: { type: 'person', id: 'luka' },
    itemTypeId: 'lamppost',
    text: 'Лука находился рядом с фонарём.',
  },
  {
    id: 'sc-vowels-same-world',
    type: 'letterGroupSameWorld',
    letterClass: 'vowel',
    text: 'Все персонажи на гласную букву находились в одном мире — обычном или потустороннем.',
  },
];

export const strangeCaseLevel: Level = {
  meta: {
    id: 'strange-case-01',
    title: 'Странноватое дело',
    theme: 'strangeCase',
    difficulty: 6,
    menuTag: 'hard',
    maxFullyPinnedPeople: 0,
    clueBalanceExempt: true, // User-approved: relativePosition is 5/21 (23.8%) to restore uniqueness.
    rosterColumnCounts: [4, 4, 4],
    generalNotes: ['Обозначения зон в подсказках могут быть как из обычного мира, так и из потустороннего.'],
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures,
  cells,
  people,
  solution,
  clues,
};
