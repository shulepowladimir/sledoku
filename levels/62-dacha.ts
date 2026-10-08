import type { FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 6;

const rooms: Room[] = [
  { id: 'plot', name: 'Участок', floorTexture: 'grass' },
  { id: 'house', name: 'Домик', floorTexture: 'wood' },
  { id: 'greenhouse', name: 'Теплица', floorTexture: 'marble' },
  { id: 'toilet', name: 'Туалет', floorTexture: 'stairs' },
];

const floorFeatures: FloorFeature[] = [{ id: 'pit', label: 'Яма', textureKey: 'dirt' }];
const PIT_CELLS = new Set([cellId(1, 1), cellId(3, 2), cellId(4, 0), cellId(5, 0)]);

const itemTypes: ItemType[] = [
  ItemLibrary.gardenBed('Грядка', { render: 'tile', tileEdgeDepth: false }),
  ItemLibrary.well(),
  ItemLibrary.broadleafTree(),
  ItemLibrary.haystack(),
  ItemLibrary.washTub(),
  ItemLibrary.stove(),
  ItemLibrary.samovar(),
  ItemLibrary.table(),
  ItemLibrary.chair(),
  ItemLibrary.sofa(),
  ItemLibrary.plant('Рассада'),
  ItemLibrary.outhouseToilet(),
];

const items: Item[] = [
  { id: 'plot-bed-north', typeId: 'gardenBed', cells: [cellId(0, 0), cellId(1, 0), cellId(2, 0)] },
  { id: 'plot-bed-south', typeId: 'gardenBed', cells: [cellId(4, 3), cellId(5, 3)] },
  { id: 'greenhouse-bed', typeId: 'gardenBed', cells: [cellId(4, 1), cellId(4, 2)] },
  { id: 'plot-well', typeId: 'well', cells: [cellId(0, 1)] },
  { id: 'plot-tree', typeId: 'broadleafTree', cells: [cellId(2, 1)] },
  { id: 'plot-haystack', typeId: 'haystack', cells: [cellId(3, 4)] },
  { id: 'plot-wash-tub', typeId: 'washTub', cells: [cellId(5, 1)] },
  { id: 'house-stove', typeId: 'stove', cells: [cellId(0, 2)] },
  { id: 'house-chair', typeId: 'chair', cells: [cellId(0, 3)] },
  { id: 'house-samovar', typeId: 'samovar', cells: [cellId(1, 4)] },
  { id: 'house-table', typeId: 'table', cells: [cellId(2, 4)] },
  { id: 'house-sofa', typeId: 'sofa', cells: [cellId(2, 5)] },
  { id: 'greenhouse-seedlings', typeId: 'plant', cells: [cellId(3, 0)] },
  { id: 'toilet-seat', typeId: 'outhouseToilet', cells: [cellId(4, 4)] },
];

const ROOM_ROWS = [
  'PPHHHH',
  'PPHHHH',
  'PPHHHH',
  'GPPPPP',
  'GGGPTT',
  'GPPPTT',
];

const ROOM_BY_LETTER: Record<string, string> = {
  P: 'plot',
  H: 'house',
  G: 'greenhouse',
  T: 'toilet',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  PIT_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'pit' } : cell,
);

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: true },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'harita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, ReturnType<typeof cellId>> = {
  aglaya: cellId(1, 1),
  boris: cellId(2, 3),
  vladimir: cellId(3, 2),
  demid: cellId(4, 0),
  galina: cellId(5, 4),
  harita: cellId(0, 5),
};

const clues: Clue[] = [
  // Placement-only redundancy checks miss this relation's role in excluding alternate murderer worlds.
  {
    id: 'dacha-aglaya-north-vladimir',
    type: 'relativePosition',
    subject: { type: 'person', id: 'aglaya' },
    otherPersonId: 'vladimir',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Аглая находилась ровно на два ряда севернее Владимира.',
  },
  {
    id: 'dacha-aglaya-plot',
    type: 'roomMembership',
    subject: { type: 'person', id: 'aglaya' },
    roomId: 'plot',
    text: 'Аглая находилась на участке.',
  },
  {
    id: 'dacha-vladimir-aligned-haystack',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'vladimir' },
    itemTypeId: 'haystack',
    text: 'Владимир находился в одном ряду или столбце со стогом сена.',
  },
  {
    id: 'dacha-boris-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'boris' },
    wallDirection: 'south',
    text: 'Борис находился у южной стены своей зоны.',
  },
  {
    id: 'dacha-boris-between-vladimir-galina',
    type: 'betweenness',
    subject: { type: 'person', id: 'boris' },
    otherPersonId1: 'vladimir',
    otherPersonId2: 'galina',
    axis: 'col',
    text: 'Борис находился в столбце строго между Владимиром и Галиной.',
  },
  {
    id: 'dacha-galina-aligned-with-toilet',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'outhouseToilet',
    text: 'Галина находилась в одном ряду или столбце с деревенским туалетом.',
  },
  {
    id: 'dacha-demid-between-vladimir-galina',
    type: 'betweenness',
    subject: { type: 'person', id: 'demid' },
    otherPersonId1: 'vladimir',
    otherPersonId2: 'galina',
    axis: 'row',
    text: 'Ряд, в котором находился Демид, был между рядами Владимира и Галины.',
  },
];

export const dachaLevel: Level = {
  meta: {
    id: 'dacha-01',
    title: 'Шесть соток',
    theme: 'dacha',
    difficulty: 4,
    maxFullyPinnedPeople: 0,
    clueBalanceExempt: true,
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
