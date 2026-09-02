import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 7;

const rooms: Room[] = [
  { id: 'saloon', name: 'Салун', floorTexture: 'wood' },
  { id: 'street', name: 'Улица', floorTexture: 'dirt' },
  { id: 'bank', name: 'Банк', floorTexture: 'stone' },
  { id: 'stable', name: 'Конюшня', floorTexture: 'dirt' },
];

const floorFeatures: FloorFeature[] = [{ id: 'boardwalk', label: 'Дощатый настил', textureKey: 'wood' }];
const BOARDWALK_CELLS = new Set([cellId(3, 2), cellId(3, 3)]);

const itemTypes: ItemType[] = [
  ItemLibrary.barCounter(),
  ItemLibrary.piano(),
  ItemLibrary.billiardTable(),
  ItemLibrary.barStool(),
  ItemLibrary.barrel(),
  ItemLibrary.hitchingPost(),
  ItemLibrary.haystack(),
  ItemLibrary.safe(),
  ItemLibrary.chair('Стул кассира'),
  ItemLibrary.trashcan(),
  ItemLibrary.trough(),
  ItemLibrary.cactus(),
  ItemLibrary.box(),
  ItemLibrary.lamppost(),
  ItemLibrary.plant(),
];

const items: Item[] = [
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-piano', typeId: 'piano', cells: [cellId(2, 2)] },
  { id: 'item-billiard', typeId: 'billiardTable', cells: [cellId(1, 2), cellId(1, 3)] },
  { id: 'item-bar-stool-1', typeId: 'barStool', cells: [cellId(1, 1)] },
  { id: 'item-bar-stool-2', typeId: 'barStool', cells: [cellId(0, 2)] },
  { id: 'item-barrel', typeId: 'barrel', cells: [cellId(3, 1)] },
  { id: 'item-hitching-post', typeId: 'hitchingPost', cells: [cellId(4, 4)] },
  { id: 'item-haystack', typeId: 'haystack', cells: [cellId(6, 1)] },
  { id: 'item-safe', typeId: 'safe', cells: [cellId(1, 5)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(2, 5)] },
  { id: 'item-trashcan', typeId: 'trashcan', cells: [cellId(5, 4)] },
  { id: 'item-trough', typeId: 'trough', cells: [cellId(5, 2)] },
  { id: 'item-cactus', typeId: 'cactus', cells: [cellId(5, 1)] },
  { id: 'item-box', typeId: 'box', cells: [cellId(2, 1)] },
  { id: 'item-lamppost', typeId: 'lamppost', cells: [cellId(4, 3)] },
  { id: 'item-plant', typeId: 'plant', cells: [cellId(2, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four zones on a 7x7 board: saloon (S) top-left, bank (B) staircasing down the right side,
// a diagonal street (T) cutting through the middle, stable (K) tucked in the bottom-left.
const ROOM_ROWS = [
  'SSSSBBB',
  'SSSSBBB',
  'SSSTBBB',
  'TTTTTBB',
  'KKTTTTB',
  'KKKTTTT',
  'KKKKTTT',
];
const ROOM_BY_LETTER: Record<string, string> = { S: 'saloon', T: 'street', B: 'bank', K: 'stable' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (BOARDWALK_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'boardwalk' } : cell));

const people: Person[] = [
  { id: 'augusta', name: 'Августа', initialLetter: 'А', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'gury', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#8a5a3a', isVictim: false, isMurderer: false },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'hariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  hariton: cellId(0, 6),
  augusta: cellId(1, 1),
  borislav: cellId(2, 0),
  darya: cellId(3, 5),
  vasilisa: cellId(4, 2),
  efim: cellId(5, 3),
  gury: cellId(6, 4),
};

const clues: Clue[] = [
  {
    id: 'w1',
    type: 'roomMembership',
    subject: { type: 'person', id: 'augusta' },
    roomId: 'saloon',
    text: 'Августа находилась в салуне.',
  },
  {
    id: 'w2',
    type: 'adjacency',
    subject: { type: 'person', id: 'augusta' },
    itemTypeId: 'barCounter',
    text: 'Августа находилась рядом с барной стойкой.',
  },
  {
    id: 'w3',
    type: 'roomMembership',
    subject: { type: 'person', id: 'borislav' },
    roomId: 'saloon',
    text: 'Борислав находился в салуне.',
  },
  {
    id: 'w5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vasilisa' },
    roomId: 'street',
    text: 'Василиса находилась на улице.',
  },
  {
    id: 'w7',
    type: 'roomMembership',
    subject: { type: 'person', id: 'gury' },
    roomId: 'street',
    text: 'Гурий находился на улице.',
  },
  {
    id: 'w8',
    type: 'relativePosition',
    subject: { type: 'person', id: 'gury' },
    otherPersonId: 'efim',
    axis: 'col',
    direction: 'after',
    text: 'Гурий находился восточнее Ефима.',
  },
  {
    id: 'w9',
    type: 'roomMembership',
    subject: { type: 'person', id: 'efim' },
    roomId: 'street',
    text: 'Ефим находился на улице.',
  },
  {
    id: 'w10',
    type: 'relativePosition',
    subject: { type: 'person', id: 'efim' },
    otherPersonId: 'vasilisa',
    axis: 'row',
    direction: 'after',
    text: 'Ефим находился южнее Василисы.',
  },
  {
    id: 'w11',
    type: 'roomMembership',
    subject: { type: 'person', id: 'darya' },
    roomId: 'bank',
    text: 'Дарья находилась в банке.',
  },
  {
    id: 'w12',
    type: 'adjacency',
    subject: { type: 'person', id: 'darya' },
    itemTypeId: 'chair',
    text: 'Дарья находилась рядом со стулом кассира.',
  },
  {
    id: 'w14',
    type: 'relativePosition',
    subject: { type: 'person', id: 'gury' },
    otherPersonId: 'hariton',
    axis: 'col',
    direction: 'before',
    text: 'Гурий находился западнее Харитона.',
  },
  {
    id: 'w15',
    type: 'adjacency',
    subject: { type: 'person', id: 'augusta' },
    itemTypeId: 'billiardTable',
    text: 'Августа находилась рядом с бильярдным столом.',
  },
  {
    id: 'w16',
    type: 'corner',
    subject: { type: 'person', id: 'borislav' },
    text: 'Борислав находился в углу своей зоны.',
  },
  {
    id: 'w17',
    type: 'corner',
    subject: { type: 'person', id: 'vasilisa' },
    text: 'Василиса находилась в углу своей зоны.',
  },
  {
    id: 'w18',
    type: 'corner',
    subject: { type: 'person', id: 'efim' },
    text: 'Ефим находился в углу своей зоны.',
  },
  {
    id: 'w19',
    type: 'itemTypeGender',
    itemTypeId: 'barStool',
    gender: 'female',
    text: 'Мужчины не садились на барный табурет.',
  },
];

export const wildwestLevel: Level = {
  meta: { id: 'wildwest-01', title: 'Ограбление банка', theme: 'wildwest', difficulty: 5, maxFullyPinnedPeople: 0, clueBalanceExempt: true },
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
