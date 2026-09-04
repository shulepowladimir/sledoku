import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 5;

const rooms: Room[] = [
  { id: 'office', name: 'Кабинет детектива', floorTexture: 'carpet' },
  { id: 'reception', name: 'Приёмная', floorTexture: 'wood' },
  { id: 'archive', name: 'Архив', floorTexture: 'tile' },
];

const floorFeatures: FloorFeature[] = [{ id: 'reception-carpet', label: 'Ковёр', textureKey: 'rug' }];
const CARPET_CELLS = new Set([cellId(3, 0), cellId(3, 1)]);

const itemTypes: ItemType[] = [
  ItemLibrary.chair(),
  ItemLibrary.clueBoard(),
  ItemLibrary.table(),
  ItemLibrary.box(),
  ItemLibrary.plant(),
  ItemLibrary.bookshelf(),
];

const items: Item[] = [
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(0, 2)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(1, 4)] },
  { id: 'item-chair-3', typeId: 'chair', cells: [cellId(4, 0)] },
  { id: 'item-clue-board', typeId: 'clueBoard', cells: [cellId(0, 3)] },
  { id: 'item-table-1', typeId: 'table', cells: [cellId(3, 0)] },
  { id: 'item-table-2', typeId: 'table', cells: [cellId(1, 1)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(3, 4)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(4, 4)] },
  { id: 'item-plant', typeId: 'plant', cells: [cellId(2, 3)] },
  { id: 'item-bookshelf-1', typeId: 'bookshelf', cells: [cellId(2, 4)] },
  { id: 'item-bookshelf-2', typeId: 'bookshelf', cells: [cellId(3, 2)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

const ROOM_ROWS = ['KKKKK', 'KKKKK', 'PKKKA', 'PPAAA', 'PPAAA'];
const ROOM_BY_LETTER: Record<string, string> = { K: 'office', P: 'reception', A: 'archive' };

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (CARPET_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'reception-carpet' };
  return cell;
});

const people: Person[] = [
  { id: 'andrei', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  andrei: cellId(0, 1),
  boris: cellId(1, 4),
  vladimir: cellId(3, 3),
  galina: cellId(2, 0),
  hristina: cellId(4, 2),
};

const clues: Clue[] = [
  {
    id: 't1',
    type: 'position',
    subject: { type: 'person', id: 'andrei' },
    axis: 'row',
    value: 0,
    text: 'Андрей находился в 1-м ряду.',
  },
  {
    id: 't2',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'andrei' },
    itemTypeId: 'chair',
    negated: true,
    text: 'Андрей не сидел на стуле.',
  },
  {
    id: 't3',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'chair',
    text: 'Борис сидел на стуле.',
  },
  {
    id: 't4',
    type: 'corner',
    subject: { type: 'person', id: 'boris' },
    text: 'Борис находился в углу своей зоны.',
  },
  {
    id: 't5',
    type: 'adjacency',
    subject: { type: 'person', id: 'vladimir' },
    itemTypeId: 'box',
    text: 'Владимир находился рядом с коробкой.',
  },
  {
    id: 't6',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vladimir' },
    otherPersonId: 'galina',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Владимир находился на один ряд южнее Галины.',
  },
  {
    id: 't7',
    type: 'roomMembership',
    subject: { type: 'person', id: 'galina' },
    roomId: 'reception',
    text: 'Галина находилась в приёмной.',
  },
  {
    id: 't8',
    type: 'floorFeature',
    subject: { type: 'person', id: 'galina' },
    featureId: 'reception-carpet',
    negated: true,
    text: 'Галина не находилась на ковре.',
  },
  {
    id: 't9',
    type: 'itemAdjacencyOccupancy',
    itemTypeId: 'table',
    text: 'У каждого стола находился хотя бы один человек.',
  },
];

export const tutorialLevel: Level = {
  meta: { id: 'tutorial-00', title: 'Твоё первое дело', theme: 'agency', difficulty: 1, maxFullyPinnedPeople: 1, clueBalanceExempt: true, isTutorial: true },
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
