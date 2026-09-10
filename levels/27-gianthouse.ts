import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 7;

// Дом, в котором всё огромно: мебель — целые зоны. Плита-металл и пол-линолеум
// на северо-западе (кухня), диван-carpet и стол-tile в центре, стул-wood и
// шкаф-stairs на юго-востоке. Гигантские предметы стоят внутри зон.
const rooms: Room[] = [
  { id: 'plateZone', name: 'Плита', floorTexture: 'metal' },
  { id: 'floorZone', name: 'Пол', floorTexture: 'linoleum' },
  { id: 'sofaZone', name: 'Диван', floorTexture: 'carpet' },
  { id: 'tableZone', name: 'Стол', floorTexture: 'tile' },
  { id: 'chairZone', name: 'Стул', floorTexture: 'wood' },
  { id: 'wardrobeZone', name: 'Шкаф', floorTexture: 'stairs' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'carpetFeat', label: 'Ковёр', textureKey: 'rug' },
];
// Ковёр поверх «пола» и «стола» — 9 клеток, на нём жертва.
const CARPET_CELLS = new Set([
  cellId(2, 3), cellId(2, 4), cellId(2, 5), cellId(2, 6),
  cellId(3, 5), cellId(3, 6),
  cellId(4, 5),
  cellId(5, 4), cellId(5, 5),
]);

const itemTypes: ItemType[] = [
  ItemLibrary.kettle(),
  ItemLibrary.fryingPan('Сковорода'),
  ItemLibrary.burner(),
  ItemLibrary.pillow('Подушка'),
  ItemLibrary.remote(),
  ItemLibrary.plate('Тарелка'),
  ItemLibrary.candleStand(),
  ItemLibrary.cup(),
  ItemLibrary.tv(),
  ItemLibrary.box('Коробка'),
  ItemLibrary.trough('Миска'),
  ItemLibrary.slippers(),
  ItemLibrary.cat(),
];

const items: Item[] = [
  // Кухня великана
  { id: 'item-kettle', typeId: 'kettle', cells: [cellId(0, 0)] },
  { id: 'item-pan', typeId: 'fryingPan', cells: [cellId(2, 0)] },
  { id: 'item-burner', typeId: 'burner', cells: [cellId(1, 1)] },
  // Гостиная
  { id: 'item-pillow-1', typeId: 'pillow', cells: [cellId(0, 4)] },
  { id: 'item-pillow-2', typeId: 'pillow', cells: [cellId(0, 6)] },
  { id: 'item-remote', typeId: 'remote', cells: [cellId(1, 6)] },
  { id: 'item-plate-1', typeId: 'plate', cells: [cellId(2, 1)] },
  { id: 'item-plate-2', typeId: 'plate', cells: [cellId(3, 2)] },
  { id: 'item-plate-3', typeId: 'plate', cells: [cellId(4, 1)] },
  { id: 'item-plate-4', typeId: 'plate', cells: [cellId(5, 2)] },
  { id: 'item-candle', typeId: 'candleStand', cells: [cellId(3, 1)] },
  { id: 'item-cup', typeId: 'cup', cells: [cellId(2, 2)] },
  { id: 'item-tv', typeId: 'tv', cells: [cellId(4, 6)] },
  { id: 'item-box', typeId: 'box', cells: [cellId(6, 4)] },
  { id: 'item-bowl', typeId: 'trough', cells: [cellId(6, 0)] },
  { id: 'item-slippers', typeId: 'slippers', cells: [cellId(1, 3)] },
  { id: 'item-cat', typeId: 'cat', cells: [cellId(2, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// P = плита, F = пол, S = диван, T = стол, C = стул, W = шкаф (по черновику пользователя).
const ROOM_ROWS = [
  'PPFFDDD',
  'PPFFDDD',
  'PSSFFFF',
  'FSSTTFF',
  'FSSTTFW',
  'FSSFFFW',
  'FFFFWWW',
];

const ROOM_BY_LETTER: Record<string, string> = {
  P: 'plateZone',
  F: 'floorZone',
  D: 'sofaZone',
  S: 'tableZone',
  T: 'chairZone',
  W: 'wardrobeZone',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  CARPET_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'carpetFeat' } : cell,
);

const people: Person[] = [
  { id: 'augusta', name: 'Августа', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'bogdan', name: 'Богдан', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'gennady', name: 'Геннадий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'darina', name: 'Дарина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'kharitina', name: 'Харитина', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false },
];

// По черновику пользователя: А на подушке (0,6), Б в центре стола (3,3), В на сковороде (2,0),
// Г-убийца (1,2), Д на тарелке (4,1), Е у шкафа (6,5), Х-жертва на ковре (5,4).
const solution: Record<PersonId, CellId> = {
  augusta: cellId(0, 6),
  bogdan: cellId(3, 3),
  vasilisa: cellId(2, 0),
  gennady: cellId(1, 2),
  darina: cellId(4, 1),
  efim: cellId(6, 5),
  kharitina: cellId(5, 4),
};

const clues: Clue[] = [
  {
    id: 'g1',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'augusta' },
    itemTypeId: 'pillow',
    text: 'Августа находилась на подушке.',
  },
  {
    id: 'g2',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vasilisa' },
    roomId: 'plateZone',
    text: 'Василиса находилась на плите.',
  },
  {
    id: 'g2b',
    type: 'parity',
    subject: { type: 'person', id: 'vasilisa' },
    axis: 'row',
    parity: 'odd',
    text: 'Василиса находилась в ряду с нечётным номером.',
  },
  {
    id: 'g3',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'darina' },
    itemTypeId: 'plate',
    text: 'Дарина находилась на тарелке.',
  },
  {
    id: 'g4',
    type: 'roomMembership',
    subject: { type: 'person', id: 'bogdan' },
    roomId: 'chairZone',
    text: 'Богдан находился на стуле.',
  },
  {
    id: 'g7',
    type: 'adjacency',
    subject: { type: 'person', id: 'gennady' },
    itemTypeId: 'slippers',
    text: 'Геннадий находился рядом с тапками.',
  },
  {
    id: 'g8',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'efim' },
    itemTypeId: 'plate',
    axis: 'row',
    direction: 'after',
    text: 'Ефим находился южнее человека, находившегося на тарелке.',
  },
  {
    id: 'g14',
    type: 'position',
    subject: { type: 'person', id: 'bogdan' },
    axis: 'col',
    value: 3,
    text: 'Богдан находился в 4-м столбце.',
  },
  {
    id: 'g15',
    type: 'wallSide',
    subject: { type: 'person', id: 'efim' },
    wallDirection: 'east',
    negated: true,
    text: 'Ефим не находился у восточной стены своей зоны.',
  },
  {
    id: 'g16',
    type: 'roomPopulation',
    roomId: 'floorZone',
    comparison: 'most',
    text: 'Пол — самая населённая зона дома.',
  },
];

export const giantHouseLevel: Level = {
  meta: { id: 'gianthouse-01', title: 'В доме великана', theme: 'gianthouse', difficulty: 7, maxFullyPinnedPeople: 0 },
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
