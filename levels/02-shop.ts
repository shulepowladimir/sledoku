import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 6;

const rooms: Room[] = [
  { id: 'checkout', name: 'Касса и вход', floorTexture: 'tile' },
  { id: 'grocery', name: 'Отдел продуктов', floorTexture: 'linoleum' },
  { id: 'clothing', name: 'Отдел одежды', floorTexture: 'carpet' },
  { id: 'storage', name: 'Склад', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [{ id: 'clothing-rug', label: 'Ковёр примерочной', textureKey: 'rug' }];
const CLOTHING_RUG_CELLS = new Set([cellId(5, 2), cellId(5, 3)]);

const itemTypes: ItemType[] = [
  ItemLibrary.kassa(),
  { id: 'veggieCounter', label: 'Прилавок с овощами', kind: 'decorative', icon: 'veggieCounter' },
  { id: 'cart', label: 'Тележка', kind: 'decorative', icon: 'cart' },
  ItemLibrary.chair(),
  ItemLibrary.plant(),
  ItemLibrary.rack('Стойка с одеждой'),
  ItemLibrary.box(),
  ItemLibrary.stool(),
  ItemLibrary.ladder(),
  ItemLibrary.barrel(),
];

const items: Item[] = [
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(0, 1), cellId(0, 2)] },
  { id: 'item-plant', typeId: 'plant', cells: [cellId(2, 0)] },
  { id: 'item-veggie', typeId: 'veggieCounter', cells: [cellId(1, 4)] },
  { id: 'item-cart', typeId: 'cart', cells: [cellId(2, 5)] },
  { id: 'item-plant-g', typeId: 'plant', cells: [cellId(0, 4)] },
  { id: 'item-box-g1', typeId: 'box', cells: [cellId(1, 5)] },
  { id: 'item-box-g2', typeId: 'box', cells: [cellId(2, 4)] },
  { id: 'item-rack', typeId: 'rack', cells: [cellId(4, 4)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(5, 4)] },
  { id: 'item-box', typeId: 'box', cells: [cellId(3, 1)] },
  { id: 'item-stool', typeId: 'stool', cells: [cellId(4, 1)] },
  { id: 'item-ladder-s', typeId: 'ladder', cells: [cellId(4, 2)] },
  { id: 'item-barrel-s', typeId: 'barrel', cells: [cellId(3, 0)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four jagged zones: checkout/entrance (E), grocery (G), clothing (C), storage (S).
const ROOM_ROWS = ['EEEEGG', 'EEEGGG', 'EESGGG', 'SSSGGC', 'SSSCCC', 'SSCCCC'];
const ROOM_BY_LETTER: Record<string, string> = { E: 'checkout', G: 'grocery', S: 'storage', C: 'clothing' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (CLOTHING_RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'clothing-rug' } : cell));

const people: Person[] = [
  { id: 'alexey', name: 'Алексей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true },
  { id: 'hristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  galina: cellId(0, 3),
  alexey: cellId(1, 0),
  hristofor: cellId(2, 2),
  viktor: cellId(3, 4),
  bella: cellId(4, 5),
  dmitry: cellId(5, 1),
};

const clues: Clue[] = [
  {
    id: 's1',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    value: 0,
    text: 'Галина находилась в 1-м ряду.',
  },
  {
    id: 's1b',
    type: 'roomMembership',
    subject: { type: 'person', id: 'galina' },
    roomId: 'grocery',
    negated: true,
    text: 'Галина не находилась в отделе продуктов.',
  },
  {
    id: 's2',
    type: 'roomMembership',
    subject: { type: 'person', id: 'alexey' },
    roomId: 'checkout',
    text: 'Алексей находился в зоне кассы.',
  },
  {
    id: 's2b',
    type: 'adjacency',
    subject: { type: 'person', id: 'alexey' },
    itemTypeId: 'kassa',
    negated: true,
    text: 'Алексей не находился рядом с кассой.',
  },
  {
    id: 's3',
    type: 'position',
    subject: { type: 'person', id: 'viktor' },
    axis: 'col',
    value: 4,
    text: 'Виктор находился в 5-м столбце.',
  },
  {
    id: 's4',
    type: 'adjacency',
    subject: { type: 'person', id: 'bella' },
    itemTypeId: 'rack',
    text: 'Белла находилась рядом со стойкой с одеждой.',
  },
  {
    id: 's5',
    type: 'adjacency',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'stool',
    text: 'Дмитрий находился рядом с табуретом.',
  },
];

export const shopLevel: Level = {
  meta: { id: 'shop-01', title: 'Ночь в универмаге', theme: 'shop', difficulty: 2, maxFullyPinnedPeople: 0, clueBalanceExempt: true },
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
