import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 6;

const rooms: Room[] = [
  { id: 'kitchen', name: 'Кухня', floorTexture: 'tile' },
  { id: 'living', name: 'Гостиная', floorTexture: 'carpet' },
  { id: 'bedroom', name: 'Спальня', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'bedroom-rug', label: 'Ковёр', textureKey: 'rug' },
  { id: 'kitchen-mat', label: 'Кухонный коврик', textureKey: 'rug' },
];
const RUG_CELLS = new Set([cellId(4, 2), cellId(4, 3), cellId(5, 2), cellId(5, 3)]);
const KITCHEN_MAT_CELLS = new Set([cellId(0, 1), cellId(1, 1)]);

const itemTypes: ItemType[] = [
  ItemLibrary.stove('Плита'),
  ItemLibrary.fridge(),
  ItemLibrary.chair(),
  ItemLibrary.sofa(),
  ItemLibrary.wardrobe(),
  ItemLibrary.bookshelf(),
  ItemLibrary.bed('Кровать'),
];

const items: Item[] = [
  { id: 'item-stove', typeId: 'stove', cells: [cellId(0, 0)] },
  { id: 'item-fridge', typeId: 'fridge', cells: [cellId(1, 0)] },
  { id: 'item-bookshelf', typeId: 'bookshelf', cells: [cellId(3, 0)] },
  { id: 'item-wardrobe', typeId: 'wardrobe', cells: [cellId(5, 0)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(2, 1)] },
  { id: 'item-sofa-1', typeId: 'sofa', cells: [cellId(1, 3)] },
  { id: 'item-sofa-2', typeId: 'sofa', cells: [cellId(4, 0)] },
  { id: 'item-bed-1', typeId: 'bed', cells: [cellId(3, 4)] },
  { id: 'item-bed-2', typeId: 'bed', cells: [cellId(5, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Non-rectangular floor plan: rooms are jagged, and several rows/columns cross
// through more than one room (e.g. row 2 touches kitchen, living AND bedroom).
const ROOM_ROWS = ['KKKKLL', 'KKKLLL', 'KKLLLB', 'LLLBBB', 'LBBBBB', 'BBBBBB'];
const ROOM_BY_LETTER: Record<string, string> = { K: 'kitchen', L: 'living', B: 'bedroom' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (RUG_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'bedroom-rug' };
  if (KITCHEN_MAT_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'kitchen-mat' };
  return cell;
});

const people: Person[] = [
  { id: 'andrei', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  galina: cellId(0, 2),
  andrei: cellId(1, 3),
  vladimir: cellId(2, 1),
  hristina: cellId(3, 4),
  boris: cellId(4, 0),
  denis: cellId(5, 5),
};

const clues: Clue[] = [
  {
    id: 'c1',
    type: 'position',
    subject: { type: 'person', id: 'andrei' },
    axis: 'col',
    value: 3,
    text: 'Андрей находился в 4-м столбце.',
  },
  {
    id: 'c2',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vladimir' },
    roomId: 'kitchen',
    text: 'Владимир находился на кухне.',
  },
  {
    id: 'c2b',
    type: 'position',
    subject: { type: 'person', id: 'vladimir' },
    axis: 'row',
    value: 2,
    text: 'Владимир находился в 3-м ряду.',
  },
  {
    id: 'c2c',
    type: 'position',
    subject: { type: 'person', id: 'vladimir' },
    axis: 'col',
    value: 1,
    text: 'Владимир находился во 2-м столбце.',
  },
  {
    id: 'c3',
    type: 'adjacency',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'bookshelf',
    text: 'Борис находился рядом с книжным шкафом.',
  },
  {
    id: 'c4',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'vladimir' },
    otherGender: 'female',
    text: 'Владимир находился в комнате с женщиной.',
  },
  {
    id: 'c6',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    value: 0,
    text: 'Галина находилась в 1-м ряду.',
  },
  {
    id: 'c7',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'denis' },
    otherGender: 'female',
    text: 'Денис находился в комнате с женщиной.',
  },
  {
    id: 'c8',
    type: 'position',
    subject: { type: 'person', id: 'denis' },
    axis: 'row',
    value: 5,
    text: 'Денис находился в последнем ряду.',
  },
  {
    id: 'c11',
    type: 'floorFeature',
    subject: { type: 'person', id: 'denis' },
    featureId: 'bedroom-rug',
    negated: true,
    text: 'Денис не находился на ковре.',
  },
  {
    id: 'c12',
    type: 'adjacency',
    subject: { type: 'person', id: 'denis' },
    itemTypeId: 'bed',
    negated: true,
    text: 'Денис не находился рядом с кроватью.',
  },
];

export const apartmentLevel: Level = {
  meta: { id: 'apartment-01', title: 'Тихий вечер в квартире', theme: 'apartment', difficulty: 1, maxFullyPinnedPeople: 1, clueBalanceExempt: true },
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
