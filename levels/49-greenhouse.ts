import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

const rooms: Room[] = [
  { id: 'tropics', name: 'Тропики', floorTexture: 'grass' },
  { id: 'dryFlowers', name: 'Сухоцветы', floorTexture: 'sand' },
  { id: 'arboretum', name: 'Дендрарий', floorTexture: 'dirt' },
  { id: 'roseGarden', name: 'Розарий', floorTexture: 'cobble' },
  { id: 'aquatic', name: 'Водная оранжерея', floorTexture: 'stone' },
  { id: 'service', name: 'Служебная зона', floorTexture: 'concrete' },
];

const floorFeatures: FloorFeature[] = [{ id: 'pond', label: 'Пруд', textureKey: 'water' }];
const POND_CELLS = new Set([cellId(6, 7), cellId(6, 8)]);

const itemTypes: ItemType[] = [
  ItemLibrary.plant(),
  ItemLibrary.palm(),
  ItemLibrary.cactus(),
  ItemLibrary.broadleafTree(),
  ItemLibrary.fountain(),
  ItemLibrary.well(),
  ItemLibrary.bench(),
  ItemLibrary.toolbox(),
  ItemLibrary.ladder(),
  { id: 'flowerbed', label: 'Клумба', kind: 'decorative', icon: 'flowerbed' },
  { id: 'bushHedge', label: 'Куст', kind: 'decorative', icon: 'bushHedge', render: 'tile' },
  { id: 'roseBush', label: 'Розовый куст', kind: 'decorative', icon: 'roseBush', render: 'tile' },
];

const items: Item[] = [
  // Тропики — пальмы и кактусы, без лиственных деревьев.
  { id: 'tropics-palm', typeId: 'palm', cells: [cellId(0, 0)] },
  { id: 'tropics-palm-2', typeId: 'palm', cells: [cellId(1, 3)] },
  { id: 'tropics-palm-3', typeId: 'palm', cells: [cellId(2, 1)] },
  { id: 'tropics-cactus-1', typeId: 'cactus', cells: [cellId(2, 0)] },
  { id: 'tropics-cactus-2', typeId: 'cactus', cells: [cellId(2, 2)] },
  { id: 'tropics-flowerbed', typeId: 'flowerbed', cells: [cellId(3, 1)] },

  // Сухоцветы — только клумбы и горшечные растения.
  { id: 'dry-flowerbed-2', typeId: 'flowerbed', cells: [cellId(0, 6)] },
  { id: 'dry-flowerbed', typeId: 'flowerbed', cells: [cellId(1, 7)] },
  { id: 'dry-flowerbed-3', typeId: 'flowerbed', cells: [cellId(5, 7)] },
  { id: 'dry-plant-1', typeId: 'plant', cells: [cellId(2, 6)] },
  { id: 'dry-plant-2', typeId: 'plant', cells: [cellId(3, 8)] },
  { id: 'dry-plant-3', typeId: 'plant', cells: [cellId(4, 8)] },

  // Обычный куст-полиомино и лиственные деревья в дендрарии.
  { id: 'arboretum-bush', typeId: 'bushHedge', cells: [cellId(3, 3), cellId(3, 4), cellId(4, 3)] },
  { id: 'arboretum-tree-1', typeId: 'broadleafTree', cells: [cellId(3, 5)] },
  { id: 'arboretum-tree-2', typeId: 'broadleafTree', cells: [cellId(5, 3)] },
  { id: 'arboretum-well', typeId: 'well', cells: [cellId(5, 5)] },
  { id: 'arboretum-flowerbed', typeId: 'flowerbed', cells: [cellId(5, 4)] },

  { id: 'rose-fountain', typeId: 'fountain', cells: [cellId(6, 0)] },
  { id: 'rose-flowerbed', typeId: 'flowerbed', cells: [cellId(8, 0)] },
  { id: 'rose-flowerbed-2', typeId: 'flowerbed', cells: [cellId(7, 1)] },
  { id: 'rose-bush', typeId: 'roseBush', cells: [cellId(6, 2), cellId(6, 3), cellId(7, 2)] },

  { id: 'aquatic-fountain', typeId: 'fountain', cells: [cellId(7, 6)] },
  { id: 'aquatic-flowerbed', typeId: 'flowerbed', cells: [cellId(7, 8)] },
  { id: 'aquatic-plant', typeId: 'plant', cells: [cellId(7, 7)] },
  { id: 'aquatic-well', typeId: 'well', cells: [cellId(8, 8)] },

  { id: 'service-toolbox', typeId: 'toolbox', cells: [cellId(8, 3)] },
  { id: 'service-ladder', typeId: 'ladder', cells: [cellId(8, 6)] },
];

// T — тропики, D — сухоцветы, A — дендрарий, R — розарий, W — вода, S — служебная зона.
const ROOM_ROWS = [
  'TTTTTDDDD',
  'TTTTTDDDD',
  'TTTTTDDDD',
  'TTTAAADDD',
  'TTTAAADDD',
  'TTTAAADDD',
  'RRRRAWWWW',
  'RRRRAWWWW',
  'RRSSSSSSW',
];

const ROOM_BY_LETTER: Record<string, string> = {
  T: 'tropics',
  D: 'dryFlowers',
  A: 'arboretum',
  R: 'roseGarden',
  W: 'aquatic',
  S: 'service',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  POND_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'pond' } : cell,
);

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: true },
  { id: 'kharita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  aglaya: cellId(0, 5),
  boris: cellId(1, 0),
  viktor: cellId(2, 7),
  galina: cellId(3, 2),
  demid: cellId(4, 4),
  esenya: cellId(5, 6),
  zhdan: cellId(6, 8),
  kharita: cellId(7, 3),
  zoya: cellId(8, 1),
};

const clues: Clue[] = [
  {
    id: 'gh-flowerbeds-have-neighbors',
    type: 'itemAdjacencyOccupancy',
    itemTypeId: 'flowerbed',
    text: 'У каждой клумбы находился хотя бы один человек в соседней клетке той же зоны.',
  },
  {
    id: 'gh-rose-pair',
    type: 'zoneExactCount',
    roomId: 'roseGarden',
    count: 2,
    text: 'В Розарии находились ровно двое.',
  },
  {
    id: 'gh-dry-most-people',
    type: 'roomPopulation',
    roomId: 'dryFlowers',
    comparison: 'most',
    text: 'Сухоцветы — самая населённая зона оранжереи.',
  },
  {
    id: 'gh-aglaya-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'aglaya' },
    wallDirection: 'north',
    text: 'Аглая находилась у северной стены своей зоны.',
  },
  {
    id: 'gh-aglaya-room-corner',
    type: 'corner',
    subject: { type: 'person', id: 'aglaya' },
    text: 'Аглая находилась в углу своей зоны.',
  },
  {
    id: 'gh-boris-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'boris' },
    wallDirection: 'west',
    text: 'Борис находился у западной стены своей зоны.',
  },
  {
    id: 'gh-viktor-plant',
    type: 'adjacency',
    subject: { type: 'person', id: 'viktor' },
    itemTypeId: 'plant',
    text: 'Виктор находился рядом с горшечным растением.',
  },
  {
    id: 'gh-galina-south-boris',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'boris',
    axis: 'row',
    direction: 'after',
    offset: 2,
    text: 'Галина находилась ровно на два ряда южнее Бориса.',
  },
  {
    id: 'gh-boris-north-esenya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'esenya',
    axis: 'row',
    direction: 'before',
    text: 'Борис находился севернее Есении.',
  },
  {
    id: 'gh-demid-arboretum',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demid' },
    roomId: 'arboretum',
    text: 'Демид находился в Дендрарии.',
  },
  {
    id: 'gh-demid-between-galina-esenya',
    type: 'betweenness',
    subject: { type: 'person', id: 'demid' },
    otherPersonId1: 'galina',
    otherPersonId2: 'esenya',
    axis: 'row',
    text: 'Демид находился в ряду строго между Галиной и Есенией.',
  },
  {
    id: 'gh-esenya-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'esenya' },
    wallDirection: 'south',
    text: 'Есения находилась у южной стены своей зоны.',
  },
  {
    id: 'gh-esenya-west-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId: 'viktor',
    axis: 'col',
    direction: 'before',
    offset: 1,
    text: 'Есения находилась ровно на один столбец западнее Виктора.',
  },
  {
    id: 'gh-zhdan-pond',
    type: 'floorFeature',
    subject: { type: 'person', id: 'zhdan' },
    featureId: 'pond',
    text: 'Ждан находился в пруду.',
  },
  {
    id: 'gh-zoya-rose-garden',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'roseGarden',
    text: 'Зоя находилась в Розарии.',
  },
  {
    id: 'gh-zoya-flowerbed',
    type: 'adjacency',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'flowerbed',
    text: 'Зоя находилась рядом с клумбой.',
  },
];

export const greenhouseLevel: Level = {
  meta: {
    id: 'greenhouse-01',
    title: 'Опавшие лепестки',
    theme: 'greenhouse',
    difficulty: 8,
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
