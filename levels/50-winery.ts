import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'vineyard', name: 'Виноградник', floorTexture: 'grass', labelAlign: 'left' },
  { id: 'courtyard', name: 'Внутренний двор', floorTexture: 'cobble' },
  { id: 'press', name: 'Прессовая', floorTexture: 'tile' },
  { id: 'fermentation', name: 'Цех брожения', floorTexture: 'stone', labelPosition: 'top', labelAlign: 'left' },
  { id: 'cellar', name: 'Погреб', floorTexture: 'dirt', labelAlign: 'right' },
  { id: 'bottling', name: 'Цех розлива', floorTexture: 'linoleum' },
  { id: 'office', name: 'Офис', floorTexture: 'concrete' },
  { id: 'tasting', name: 'Дегустационный зал', floorTexture: 'carpet' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'tasting-rug', label: 'Ковёр дегустационного зала', textureKey: 'rug' },
];
const TASTING_RUG_CELLS = new Set([cellId(9, 4), cellId(9, 5), cellId(10, 4), cellId(10, 5)]);

const itemTypes: ItemType[] = [
  { id: 'grapeVine', label: 'Виноградная лоза', kind: 'decorative', icon: 'grapeVine', render: 'tile', tileEdgeDepth: false },
  { id: 'winePress', label: 'Винный пресс', kind: 'decorative', icon: 'winePress' },
  { id: 'wineRack', label: 'Стеллаж с бутылками', kind: 'decorative', icon: 'wineRack' },
  { id: 'grapeCrate', label: 'Ящик винограда', kind: 'decorative', icon: 'grapeCrate' },
  { id: 'wineGlass', label: 'Бокал с вином', kind: 'decorative', icon: 'wineGlass' },
  ItemLibrary.box('Ящик вина'),
  ItemLibrary.barrel('Винная бочка'),
  ItemLibrary.plant(),
  ItemLibrary.bench(),
  ItemLibrary.fountain(),
  ItemLibrary.table(),
  ItemLibrary.workbench(),
];

const items: Item[] = [
  // Full-bleed vine tiles leave open paths between the rows for visitors and workers.
  { id: 'vine-row-nw', typeId: 'grapeVine', cells: [cellId(0, 0), cellId(0, 1), cellId(1, 0), cellId(1, 1)] },
  { id: 'vine-row-ne', typeId: 'grapeVine', cells: [cellId(0, 3), cellId(0, 4), cellId(1, 3), cellId(1, 4), cellId(2, 3)] },
  // Keep 4-0 open as the north/south passage and 4-1 occupied to rule out Galina's alternate corner.
  { id: 'vine-row-south', typeId: 'grapeVine', cells: [cellId(3, 1), cellId(4, 1)] },

  { id: 'press-wine-press', typeId: 'winePress', cells: [cellId(3, 8), cellId(3, 9)] },
  { id: 'fermentation-rack-1', typeId: 'wineRack', cells: [cellId(9, 6), cellId(9, 7)] },
  { id: 'fermentation-rack-2', typeId: 'wineRack', cells: [cellId(5, 8), cellId(5, 9)] },
  { id: 'fermentation-glass', typeId: 'wineGlass', cells: [cellId(5, 7)] },
  { id: 'fermentation-wine-box', typeId: 'box', cells: [cellId(8, 6)] },
  { id: 'cellar-rack', typeId: 'wineRack', cells: [cellId(8, 9), cellId(9, 9)] },
  { id: 'press-crate-1', typeId: 'grapeCrate', cells: [cellId(2, 7)] },
  { id: 'press-crate-2', typeId: 'grapeCrate', cells: [cellId(4, 6)] },
  { id: 'bottling-crate-1', typeId: 'grapeCrate', cells: [cellId(6, 1)] },
  { id: 'bottling-crate-2', typeId: 'grapeCrate', cells: [cellId(7, 2)] },
  { id: 'bottling-crate-3', typeId: 'grapeCrate', cells: [cellId(8, 0)] },
  { id: 'bottling-wine-box', typeId: 'box', cells: [cellId(9, 1)] },

  { id: 'cellar-barrel-1', typeId: 'barrel', cells: [cellId(7, 10)] },
  { id: 'cellar-barrel-2', typeId: 'barrel', cells: [cellId(8, 10)] },
  { id: 'cellar-barrel-3', typeId: 'barrel', cells: [cellId(9, 10)] },

  { id: 'tasting-glass-1', typeId: 'wineGlass', cells: [cellId(7, 4)] },
  { id: 'tasting-glass-2', typeId: 'wineGlass', cells: [cellId(8, 5)] },
  { id: 'tasting-glass-3', typeId: 'wineGlass', cells: [cellId(9, 5)] },
  { id: 'tasting-glass-4', typeId: 'wineGlass', cells: [cellId(10, 4)] },
  { id: 'tasting-table-1', typeId: 'table', cells: [cellId(9, 3)] },
  { id: 'tasting-table-2', typeId: 'table', cells: [cellId(10, 3)] },

  { id: 'courtyard-plant-1', typeId: 'plant', cells: [cellId(0, 9)] },
  { id: 'courtyard-plant-2', typeId: 'plant', cells: [cellId(1, 9)] },
  { id: 'courtyard-plant-3', typeId: 'plant', cells: [cellId(2, 4)] },
  { id: 'courtyard-plant-4', typeId: 'plant', cells: [cellId(3, 3)] },
  { id: 'courtyard-plant-5', typeId: 'plant', cells: [cellId(5, 2)] },
  { id: 'courtyard-bench-1', typeId: 'bench', cells: [cellId(1, 8)] },
  { id: 'courtyard-bench-2', typeId: 'bench', cells: [cellId(3, 4)] },
  { id: 'courtyard-fountain', typeId: 'fountain', cells: [cellId(2, 5)] },
  { id: 'office-workbench', typeId: 'workbench', cells: [cellId(7, 3)] },
];

// V — виноградник, D — внутренний двор, P — прессовая, F — брожение,
// C — погреб, B — цех розлива, O — офис, T — дегустационный зал.
const ROOM_ROWS = [
  'VVVVVDDDDDD',
  'VVVVVDDDDDD',
  'VVVVDDPPPPP',
  'VVVDDPPPPPP',
  'VVDDDPPPPFF',
  'VDDDDPFFFFF',
  'BBBOOPFFFFC',
  'BBBOTTFFFCC',
  'BBBOTTFFFCC',
  'BBBTTTFFFCC',
  'BBBTTTFFFCC',
];

const ROOM_BY_LETTER: Record<string, string> = {
  V: 'vineyard',
  D: 'courtyard',
  P: 'press',
  F: 'fermentation',
  C: 'cellar',
  B: 'bottling',
  O: 'office',
  T: 'tasting',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  TASTING_RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'tasting-rug' } : cell,
);

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: true },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'klim', name: 'Клим', initialLetter: 'К', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  andrey: cellId(0, 6),
  denis: cellId(1, 10),
  viktor: cellId(2, 8),
  galina: cellId(3, 2),
  klim: cellId(4, 5),
  bella: cellId(5, 0),
  zhdan: cellId(6, 9),
  inna: cellId(7, 3),
  zoya: cellId(8, 1),
  esenya: cellId(9, 4),
  khariton: cellId(10, 7),
};

const clues: Clue[] = [
  {
    id: 'wy-andrey-courtyard',
    type: 'roomMembership',
    subject: { type: 'person', id: 'andrey' },
    roomId: 'courtyard',
    text: 'Андрей находился во внутреннем дворе.',
  },
  {
    id: 'wy-andrey-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'andrey' },
    axis: 'row',
    parity: 'odd',
    text: 'Андрей находился в нечётном ряду.',
  },
  {
    id: 'wy-andrey-column-parity',
    type: 'parity',
    subject: { type: 'person', id: 'andrey' },
    axis: 'col',
    parity: 'odd',
    text: 'Андрей находился в нечётном столбце.',
  },
  {
    id: 'wy-bella-vineyard',
    type: 'roomMembership',
    subject: { type: 'person', id: 'bella' },
    roomId: 'vineyard',
    text: 'Белла находилась в винограднике.',
  },
  {
    id: 'wy-bella-west-galina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bella' },
    otherPersonId: 'galina',
    axis: 'col',
    direction: 'before',
    text: 'Белла находилась западнее Галины.',
  },
  {
    id: 'wy-bella-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'bella' },
    wallDirection: 'south',
    text: 'Белла находилась у южной стены своей зоны.',
  },
  {
    id: 'wy-galina-corner',
    type: 'corner',
    subject: { type: 'person', id: 'galina' },
    text: 'Галина находилась в углу своей зоны.',
  },
  {
    id: 'wy-viktor-wine-press',
    type: 'adjacency',
    subject: { type: 'person', id: 'viktor' },
    itemTypeId: 'winePress',
    text: 'Виктор находился рядом с винным прессом.',
  },
  {
    id: 'wy-galina-vineyard-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'galina' },
    textureKey: 'grass',
    text: 'Галина находилась на траве.',
  },
  {
    id: 'wy-denis-column-parity',
    type: 'parity',
    subject: { type: 'person', id: 'denis' },
    axis: 'col',
    parity: 'odd',
    text: 'Денис находился в нечётном столбце.',
  },
  {
    id: 'wy-denis-corner',
    type: 'corner',
    subject: { type: 'person', id: 'denis' },
    text: 'Денис находился в углу своей зоны.',
  },
  {
    id: 'wy-denis-press-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'denis' },
    roomId: 'courtyard',
    otherRoomId: 'press',
    text: 'Денис находился на границе внутреннего двора и прессовой.',
  },
  {
    id: 'wy-esenya-tasting-rug',
    type: 'floorFeature',
    subject: { type: 'person', id: 'esenya' },
    featureId: 'tasting-rug',
    text: 'Есения находилась на ковре дегустационного зала.',
  },
  {
    id: 'wy-zhdan-south-andrey',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'andrey',
    axis: 'row',
    direction: 'after',
    offset: 6,
    text: 'Ждан находился на шесть рядов южнее Андрея.',
  },
  {
    id: 'wy-zhdan-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'east',
    text: 'Ждан находился у восточной стены своей зоны.',
  },
  {
    id: 'wy-zoya-bottling',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'bottling',
    text: 'Зоя находилась в цехе розлива.',
  },
  {
    id: 'wy-zoya-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'zoya' },
    axis: 'row',
    parity: 'odd',
    text: 'Зоя находилась в нечётном ряду.',
  },
  {
    id: 'wy-zoya-north-esenya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'esenya',
    axis: 'row',
    direction: 'before',
    text: 'Зоя находилась севернее Есении.',
  },
  {
    id: 'wy-inna-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'inna' },
    wallDirection: 'east',
    text: 'Инна находилась у восточной стены своей зоны.',
  },
  {
    id: 'wy-inna-smallest-room',
    type: 'roomSize',
    subject: { type: 'person', id: 'inna' },
    comparison: 'smallest',
    text: 'Инна находилась в самой маленькой зоне.',
  },
  {
    id: 'wy-klim-west-andrey',
    type: 'relativePosition',
    subject: { type: 'person', id: 'klim' },
    otherPersonId: 'andrey',
    axis: 'col',
    direction: 'before',
    text: 'Клим находился западнее Андрея.',
  },
  {
    id: 'wy-klim-press',
    type: 'roomMembership',
    subject: { type: 'person', id: 'klim' },
    roomId: 'press',
    text: 'Клим находился в прессовой.',
  },
];

export const wineryLevel: Level = {
  meta: {
    id: 'winery-01',
    title: 'Капли красного',
    theme: 'winery',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
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
