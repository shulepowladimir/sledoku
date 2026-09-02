import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

const rooms: Room[] = [
  { id: 'campsite', name: 'Стоянка', floorTexture: 'dirt' },
  { id: 'clearing', name: 'Поляна', floorTexture: 'grass' },
  { id: 'trail', name: 'Тропа', floorTexture: 'stone' },
  { id: 'cabin', name: 'Кордон лесника', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [{ id: 'forest-pond', label: 'Лесной пруд', textureKey: 'water' }];
const POND_CELLS = new Set([cellId(4, 4), cellId(4, 5), cellId(5, 4), cellId(5, 5)]);

const itemTypes: ItemType[] = [
  { id: 'tent', label: 'Палатка', kind: 'decorative', icon: 'tent' },
  { id: 'campfire', label: 'Костёр', kind: 'decorative', icon: 'campfire' },
  { id: 'tree', label: 'Ёлка', kind: 'decorative', icon: 'tree' },
  { id: 'stump', label: 'Пень', kind: 'decorative', icon: 'stump' },
  ItemLibrary.barrel(),
  ItemLibrary.stool(),
  ItemLibrary.bench(),
  ItemLibrary.box(),
  ItemLibrary.workbench(),
  ItemLibrary.safe(),
  ItemLibrary.bookshelf(),
  ItemLibrary.ladder(),
  ItemLibrary.chair(),
];

const items: Item[] = [
  // Campsite
  { id: 'item-tent-1', typeId: 'tent', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-tent-2', typeId: 'tent', cells: [cellId(2, 0), cellId(2, 1)] },
  { id: 'item-campfire', typeId: 'campfire', cells: [cellId(1, 1)] },
  { id: 'item-tree-1', typeId: 'tree', cells: [cellId(0, 3)] },
  { id: 'item-tree-2', typeId: 'tree', cells: [cellId(3, 3)] },
  { id: 'item-tree-3', typeId: 'tree', cells: [cellId(4, 3)] },
  { id: 'item-barrel-1', typeId: 'barrel', cells: [cellId(1, 5)] },
  { id: 'item-barrel-2', typeId: 'barrel', cells: [cellId(3, 4)] },
  { id: 'item-stool-1', typeId: 'stool', cells: [cellId(2, 4)] },
  { id: 'item-stool-2', typeId: 'stool', cells: [cellId(4, 0)] },
  // Clearing
  { id: 'item-tree-4', typeId: 'tree', cells: [cellId(0, 7)] },
  { id: 'item-tree-5', typeId: 'tree', cells: [cellId(3, 7)] },
  { id: 'item-tree-6', typeId: 'tree', cells: [cellId(6, 2)] },
  { id: 'item-tree-7', typeId: 'tree', cells: [cellId(8, 1)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(5, 1)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(5, 8)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(7, 3)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(1, 8)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(9, 1)] },
  { id: 'item-stump', typeId: 'stump', cells: [cellId(2, 7)] },
  // Cabin
  { id: 'item-workbench-1', typeId: 'workbench', cells: [cellId(6, 7)] },
  { id: 'item-workbench-2', typeId: 'workbench', cells: [cellId(8, 5)] },
  { id: 'item-safe', typeId: 'safe', cells: [cellId(9, 4)] },
  { id: 'item-bookshelf', typeId: 'bookshelf', cells: [cellId(7, 8), cellId(7, 9)] },
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(6, 8)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(9, 6)] },
  { id: 'item-ladder', typeId: 'ladder', cells: [cellId(8, 8)] },
  { id: 'item-box-3', typeId: 'box', cells: [cellId(9, 9)] },
  { id: 'item-tent-3', typeId: 'tent', cells: [cellId(7, 1)] },
  { id: 'item-stump-2', typeId: 'stump', cells: [cellId(6, 1)] },
  { id: 'item-box-4', typeId: 'box', cells: [cellId(7, 5)] },
  { id: 'item-ladder-2', typeId: 'ladder', cells: [cellId(6, 4)] },
  { id: 'item-campfire-2', typeId: 'campfire', cells: [cellId(8, 9)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four zones on a 10x10 board: campsite (S) top-left wedge, trail (T) the rectangular strip
// leaving the campsite south-west down to the clearing, clearing (P) the large diagonal band,
// cabin (K) bottom-right wedge. Trail holds exactly Gurii and Diana (roles-clue output).
const ROOM_ROWS = [
  'SSSSSPPPPP',
  'SSSSSSPPPP',
  'SSSSSSPPPP',
  'TTTTSPPPPP',
  'TTTTPPPPPP',
  'PPPPPPPPPP',
  'PPPPPPKKKK',
  'PPPPPKKKKK',
  'PPPPKKKKKK',
  'PPPKKKKKKK',
];
const ROOM_BY_LETTER: Record<string, string> = { S: 'campsite', P: 'clearing', T: 'trail', K: 'cabin' };

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (POND_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'forest-pond' } : cell));

// Пропажа в лесу. Егеря — диапазон Ж..Х (Жанна/Зоя/Иван + жертва Харитон), туристы — А..Е.
// Егерь Зоя застала егеря Харитона на кордоне; жертва не упоминается ни в одной личной клю.
const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'beatrisa', name: 'Беатриса', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'diana', name: 'Диана', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['tourist'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#8a5a3a', isVictim: false, isMurderer: false, roles: ['ranger'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: true, roles: ['ranger'] },
  { id: 'ivan', name: 'Иван', initialLetter: 'И', gender: 'male', color: '#e0a94a', isVictim: false, isMurderer: false, roles: ['ranger'] },
  { id: 'hariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#7cc9e8', isVictim: true, isMurderer: false, roles: ['ranger'] },
];

// Row → column permutation generated by `npm run scaffold-level -- levels/09-forest.ts
// campsite:4,clearing:4,cabin:2` — cabin holds exactly the victim and the murderer.
const solution: Record<PersonId, CellId> = {
  veronika: cellId(0, 6),
  artem: cellId(1, 3),
  beatrisa: cellId(2, 4),
  guriy: cellId(3, 2),
  diana: cellId(4, 1),
  efim: cellId(5, 9),
  zhanna: cellId(6, 5),
  hariton: cellId(7, 7),
  ivan: cellId(8, 0),
  zoya: cellId(9, 8),
};

const clues: Clue[] = [
  // — Правила леса —
  {
    id: 'f22',
    type: 'letterRangeRole',
    fromLetter: 'Ж',
    toLetter: 'Х',
    roleId: 'ranger',
    text: 'Все, чьё имя начиналось на букву от Ж до Х, были егерями; остальные — туристами.',
  },
  {
    id: 'f23',
    type: 'roleZoneLimit',
    roleId: 'tourist',
    roomIds: ['cabin'],
    maxCount: 0,
    text: 'Туристы не заходили на кордон лесника.',
  },
  {
    id: 'f24',
    type: 'roleZoneMin',
    roleId: 'ranger',
    roomIds: ['cabin'],
    minCount: 1,
    text: 'Кордон лесника не оставался без егеря.',
  },
  {
    id: 'f2',
    type: 'adjacency',
    subject: { type: 'person', id: 'artem' },
    itemTypeId: 'tree',
    text: 'Артём находился рядом с ёлкой.',
  },
  {
    id: 'f3',
    type: 'adjacency',
    subject: { type: 'person', id: 'beatrisa' },
    itemTypeId: 'barrel',
    text: 'Беатриса находилась рядом с бочкой.',
  },
  {
    id: 'f4',
    type: 'adjacency',
    subject: { type: 'person', id: 'guriy' },
    itemTypeId: 'tree',
    text: 'Гурий находился рядом с ёлкой.',
  },
  {
    id: 'f5',
    type: 'wallSide',
    subject: { type: 'person', id: 'diana' },
    wallDirection: 'south',
    text: 'Диана находилась у южной стены своей зоны.',
  },
  {
    id: 'f6',
    type: 'corner',
    subject: { type: 'person', id: 'efim' },
    text: 'Ефим находился в углу своей зоны.',
  },
  {
    id: 'f7',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'east',
    text: 'Жанна находилась у восточной стены своей зоны.',
  },
  {
    id: 'f8',
    type: 'adjacency',
    subject: { type: 'person', id: 'ivan' },
    itemTypeId: 'tree',
    text: 'Иван находился рядом с ёлкой.',
  },
  {
    id: 'f9',
    type: 'wallSide',
    subject: { type: 'person', id: 'zoya' },
    wallDirection: 'south',
    text: 'Зоя находилась у южной стены своей зоны.',
  },
  {
    id: 'f10',
    type: 'relativePosition',
    subject: { type: 'person', id: 'beatrisa' },
    otherPersonId: 'artem',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Беатриса находилась ровно на один ряд южнее Артёма.',
  },
  {
    id: 'f11',
    type: 'betweenness',
    subject: { type: 'person', id: 'guriy' },
    otherPersonId1: 'beatrisa',
    otherPersonId2: 'diana',
    axis: 'row',
    text: 'Гурий находился в ряду строго между Беатрисой и Дианой.',
  },
  {
    id: 'f12',
    type: 'relativePosition',
    subject: { type: 'person', id: 'diana' },
    otherPersonId: 'guriy',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Диана находилась ровно на один ряд южнее Гурия.',
  },
  {
    id: 'f13',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'efim',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Жанна находилась ровно на один ряд южнее Ефима.',
  },
  {
    id: 'f16',
    type: 'roomParity',
    parity: 'even',
    text: 'Во всех зонах уровня оказалось чётное число людей.',
  },
  {
    id: 'f17',
    type: 'roomMembership',
    subject: { type: 'person', id: 'artem' },
    roomId: 'campsite',
    text: 'Артём находился на стоянке.',
  },
  {
    id: 'f18',
    type: 'relativePosition',
    subject: { type: 'person', id: 'veronika' },
    otherPersonId: 'artem',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Вероника находилась ровно на три столбца восточнее Артёма.',
  },
  {
    id: 'f19',
    type: 'parity',
    subject: { type: 'person', id: 'zoya' },
    axis: 'col',
    parity: 'odd',
    text: 'Зоя находилась в столбце с нечётным номером.',
  },
  {
    id: 'f20',
    type: 'parity',
    subject: { type: 'person', id: 'ivan' },
    axis: 'row',
    parity: 'odd',
    text: 'Иван находился в ряду с нечётным номером.',
  },
  {
    id: 'f21',
    type: 'adjacency',
    subject: { type: 'person', id: 'veronika' },
    itemTypeId: 'tree',
    text: 'Вероника находилась рядом с ёлкой.',
  },
];

export const forestLevel: Level = {
  meta: { id: 'forest-01', title: 'Пропажа в лесу', theme: 'forest', difficulty: 9, maxFullyPinnedPeople: 0 },
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
