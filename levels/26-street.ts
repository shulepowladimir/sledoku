import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 8;

// Ночной квартал. Дорога Г-образная: «Проулок» уходит вертикально на север,
// «Мостовая» — горизонтально на запад; тротуары cobble огибают угол булочной
// и двор. Поворот дороги — первый в игре (все предыдущие улицы линейные).
const rooms: Room[] = [
  { id: 'bakery', name: 'Булочная', floorTexture: 'tile' },
  { id: 'sidewalkN', name: 'Северный тротуар', floorTexture: 'cobble' },
  { id: 'lane', name: 'Проулок', floorTexture: 'asphalt' },
  { id: 'road', name: 'Мостовая', floorTexture: 'asphalt' },
  { id: 'sidewalkE', name: 'Восточный тротуар', floorTexture: 'cobble' },
  { id: 'laundry', name: 'Прачечная', floorTexture: 'linoleum' },
  { id: 'sidewalkS', name: 'Южный тротуар', floorTexture: 'cobble' },
  { id: 'yard', name: 'Внутренний двор', floorTexture: 'concrete' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'hatch', label: 'Люки канализации', textureKey: 'metal' },
  { id: 'zebra', label: 'Зебра', textureKey: 'tile' },
  { id: 'puddle', label: 'Лужа', textureKey: 'water' },
];
const HATCH_CELLS = new Set([cellId(4, 0), cellId(3, 6)]);
const ZEBRA_CELLS = new Set([cellId(3, 1), cellId(4, 1)]);
const PUDDLE_CELLS = new Set([cellId(6, 6), cellId(7, 6)]);

const itemTypes: ItemType[] = [
  ItemLibrary.stove('Пекарная печь'),
  ItemLibrary.kassa(),
  ItemLibrary.box('Ящик с мукой'),
  ItemLibrary.car(),
  ItemLibrary.bench(),
  ItemLibrary.lamppost(),
  ItemLibrary.trafficLight(),
  ItemLibrary.trashcan(),
  ItemLibrary.trafficSign(),
  ItemLibrary.chair('Стул ожидания'),
  ItemLibrary.watercooler(),
  ItemLibrary.tv(),
  ItemLibrary.suitcase('Тележка с бельём'),
  ItemLibrary.tree(),
  ItemLibrary.barrel(),
  ItemLibrary.washer(),
];

const items: Item[] = [
  // Булочная (ночная пекарня при ней)
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(0, 0)] },
  { id: 'item-flour-1', typeId: 'box', cells: [cellId(0, 1)] },
  { id: 'item-oven', typeId: 'stove', cells: [cellId(1, 0)] },
  { id: 'item-flour-2', typeId: 'box', cells: [cellId(1, 3)] },
  // Улица: машины (первый 2-клеточный occupiable после трона), светофор и знак у поворота
  { id: 'item-car-parked', typeId: 'car', cells: [cellId(1, 5), cellId(1, 6)] },
  { id: 'item-car-road', typeId: 'car', cells: [cellId(3, 3), cellId(3, 4)] },
  { id: 'item-bench', typeId: 'bench', cells: [cellId(2, 0)] },
  { id: 'item-lamp-n', typeId: 'lamppost', cells: [cellId(2, 2)] },
  { id: 'item-traffic-light', typeId: 'trafficLight', cells: [cellId(2, 4)] },
  { id: 'item-trashcan-n', typeId: 'trashcan', cells: [cellId(2, 3)] },
  { id: 'item-lamp-e', typeId: 'lamppost', cells: [cellId(3, 7)] },
  { id: 'item-traffic-sign', typeId: 'trafficSign', cells: [cellId(5, 4)] },
  { id: 'item-trashcan-s', typeId: 'trashcan', cells: [cellId(5, 7)] },
  // Прачечная (круглосуточная)
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(5, 0)] },
  { id: 'item-washer-1', typeId: 'washer', cells: [cellId(5, 1)] },
  { id: 'item-cooler', typeId: 'watercooler', cells: [cellId(5, 2)] },
  { id: 'item-tv', typeId: 'tv', cells: [cellId(5, 3)] },
  { id: 'item-washer-2', typeId: 'washer', cells: [cellId(7, 0)] },
  { id: 'item-trolley', typeId: 'suitcase', cells: [cellId(7, 3)] },
  // Внутренний двор за прачечной
  { id: 'item-tree', typeId: 'tree', cells: [cellId(6, 5)] },
  { id: 'item-barrel', typeId: 'barrel', cells: [cellId(7, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// B = булочная, N = северный тротуар, L = проулок, R = мостовая, E = восточный тротуар,
// P = прачечная, S = южный тротуар, Y = внутренний двор.
const ROOM_ROWS = [
  'BBBBNLLE',
  'BBBBNLLE',
  'NNNNNLLE',
  'RRRRRLLE',
  'RRRRRLLE',
  'PPPPSSSS',
  'PPPPSYYY',
  'PPPPSYYY',
];

const ROOM_BY_LETTER: Record<string, string> = {
  B: 'bakery',
  N: 'sidewalkN',
  L: 'lane',
  R: 'road',
  E: 'sidewalkE',
  P: 'laundry',
  S: 'sidewalkS',
  Y: 'yard',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (HATCH_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'hatch' };
  if (ZEBRA_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'zebra' };
  if (PUDDLE_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'puddle' };
  return cell;
});

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: true },
  { id: 'victor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'khristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false },
];

// Судоку-инвариант: все строки и все столбцы различны. Жертва Христина и убийца Белла —
// вдвоём в булочной; Аркадий сидит в машине на мостовой; Есения — южнее него, у фонаря.
const solution: Record<PersonId, CellId> = {
  bella: cellId(0, 3),
  khristina: cellId(1, 2),
  zhdan: cellId(2, 1),
  arkady: cellId(3, 4),
  esenia: cellId(4, 7),
  galina: cellId(6, 0),
  demid: cellId(5, 5),
  victor: cellId(7, 6),
};

const clues: Clue[] = [
  {
    id: 'c1',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'arkady' },
    itemTypeId: 'car',
    text: 'Аркадий сидел в машине.',
  },
  {
    id: 'c2',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'car',
    axis: 'row',
    direction: 'after',
    text: 'Есения находилась южнее человека, сидевшего в машине.',
  },
  {
    id: 'c3',
    type: 'roomMembership',
    subject: { type: 'person', id: 'bella' },
    roomId: 'bakery',
    text: 'Белла находилась в булочной.',
  },
  {
    id: 'c4',
    type: 'adjacency',
    subject: { type: 'person', id: 'bella' },
    itemTypeId: 'box',
    text: 'Белла находилась рядом с ящиком с мукой.',
  },
  {
    id: 'c4b',
    type: 'parity',
    subject: { type: 'person', id: 'bella' },
    axis: 'col',
    parity: 'even',
    text: 'Белла находилась в столбце с чётным номером.',
  },
  {
    id: 'c5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'galina' },
    roomId: 'laundry',
    text: 'Галина находилась в прачечной.',
  },
  {
    id: 'c6',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'col',
    value: 0,
    text: 'Галина находилась в 1-м столбце.',
  },
  {
    id: 'c7',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'victor' },
    itemTypeId: 'tree',
    text: 'Виктор находился в одной зоне с деревом.',
  },
  {
    id: 'c9',
    type: 'adjacency',
    subject: { type: 'person', id: 'demid' },
    itemTypeId: 'trafficSign',
    text: 'Демид находился рядом с дорожным знаком.',
  },
  {
    id: 'c11',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'bench',
    text: 'Ждан находился в одной зоне со скамейкой.',
  },
  {
    id: 'c12',
    type: 'adjacency',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'lamppost',
    text: 'Есения находилась рядом с фонарём.',
  },
];

export const streetLevel: Level = {
  meta: { id: 'street-01', title: 'Тёмные дворы', theme: 'street', difficulty: 8, maxFullyPinnedPeople: 0 },
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
