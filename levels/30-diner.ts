import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 6;

// Придорожное кафе у пустынного шоссе, ночная смена. Слева — парковка с машиной
// и мотоциклом, сверху-справа — крыльцо с неоновой вывеской; внутри — кухня,
// стойка с табуретами и зал с кабинками на шахматном полу.
const rooms: Room[] = [
  { id: 'parking', name: 'Парковка', floorTexture: 'asphalt' },
  { id: 'porch', name: 'Крыльцо', floorTexture: 'concrete' },
  { id: 'kitchen', name: 'Кухня', floorTexture: 'metal' },
  { id: 'counter', name: 'Стойка', floorTexture: 'tile' },
  { id: 'hall', name: 'Зал', floorTexture: 'checker' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.car(),
  ItemLibrary.motorcycle(),
  ItemLibrary.trafficSign(),
  ItemLibrary.trashcan(),
  ItemLibrary.neonSign(),
  ItemLibrary.stove('Плита'),
  ItemLibrary.fridge(),
  ItemLibrary.barCounter(),
  ItemLibrary.kassa(),
  ItemLibrary.barStool(),
  ItemLibrary.booth(),
  ItemLibrary.jukebox(),
  ItemLibrary.pieDisplay(),
  ItemLibrary.cat(),
];

const items: Item[] = [
  // Парковка: машина и мотоцикл носом к крыльцу, знак и урна у въезда
  { id: 'item-car', typeId: 'car', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-moto', typeId: 'motorcycle', cells: [cellId(1, 0), cellId(1, 1)] },
  { id: 'item-sign', typeId: 'trafficSign', cells: [cellId(0, 3)] },
  { id: 'item-urn', typeId: 'trashcan', cells: [cellId(1, 3)] },
  // Крыльцо: неоновая вывеска над входом
  { id: 'item-neon', typeId: 'neonSign', cells: [cellId(0, 4)] },
  // Кухня: плита и холодильник
  { id: 'item-stove', typeId: 'stove', cells: [cellId(2, 0)] },
  { id: 'item-fridge', typeId: 'fridge', cells: [cellId(3, 1)] },
  // Стойка: барная стойка, касса и пара табуретов
  { id: 'item-bar', typeId: 'barCounter', cells: [cellId(2, 2), cellId(2, 3)] },
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(3, 2)] },
  { id: 'item-stool-1', typeId: 'barStool', cells: [cellId(3, 3)] },
  { id: 'item-stool-2', typeId: 'barStool', cells: [cellId(4, 2)] },
  // Зал: две кабинки, витрина с пирогами, музыкальный автомат, кот
  { id: 'item-booth-1', typeId: 'booth', cells: [cellId(2, 4), cellId(2, 5)] },
  { id: 'item-booth-2', typeId: 'booth', cells: [cellId(4, 0), cellId(4, 1)] },
  { id: 'item-pie', typeId: 'pieDisplay', cells: [cellId(4, 5)] },
  { id: 'item-jukebox', typeId: 'jukebox', cells: [cellId(5, 1)] },
  { id: 'item-cat', typeId: 'cat', cells: [cellId(5, 3)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// P = парковка, R = крыльцо, K = кухня, C = стойка, H = зал.
const ROOM_ROWS = [
  'PPPPRR',
  'PPPPRR',
  'KKCCHH',
  'KKCCHH',
  'HHCCHH',
  'HHHHHH',
];

const ROOM_BY_LETTER: Record<string, string> = {
  P: 'parking',
  R: 'porch',
  K: 'kitchen',
  C: 'counter',
  H: 'hall',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['waitress'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8f7ca8', isVictim: true, isMurderer: false },
];

// Судоку-инвариант: все ряды и столбцы различны (полная пермутация).
// Жертва Харитон и убийца Григорий — вдвоём в зале; Вероника (официантка) —
// на табурете у стойки; Анфиса — на кухне; Борис — у мотоцикла; Демьян — в углу крыльца.
const solution: Record<PersonId, CellId> = {
  demyan: cellId(0, 5),
  boris: cellId(1, 2),
  anfisa: cellId(2, 1),
  veronika: cellId(3, 3),
  khariton: cellId(4, 4),
  grigory: cellId(5, 0),
};

const clues: Clue[] = [
  // — Механика скрытой официантки (общие, урок шерифа из «Тени шерифа») —
  { id: 'c1', type: 'roleSingleton', roleId: 'waitress', text: 'В кафе работала ровно одна официантка.' },
  {
    id: 'c3',
    type: 'occupiesItem',
    subject: { type: 'role', role: 'waitress' },
    itemTypeId: 'barStool',
    text: 'Официантка сидела на барном табурете.',
  },
  // — Личные улики —
  {
    id: 'c4n',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'demyan',
    axis: 'row',
    direction: 'after',
    text: 'Борис находился южнее Демьяна.',
  },
  {
    id: 'c7',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'anfisa' },
    itemTypeId: 'fridge',
    text: 'Анфиса находилась в одной комнате с холодильником.',
  },
  {
    id: 'c9',
    type: 'adjacency',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'motorcycle',
    text: 'Борис находился рядом с мотоциклом.',
  },
  { id: 'c10', type: 'corner', subject: { type: 'person', id: 'demyan' }, text: 'Демьян находился в углу своей зоны.' },
  {
    id: 'c11',
    type: 'adjacency',
    subject: { type: 'person', id: 'grigory' },
    itemTypeId: 'jukebox',
    text: 'Григорий находился рядом с музыкальным автоматом.',
  },
  {
    id: 'c13',
    type: 'parity',
    subject: { type: 'person', id: 'veronika' },
    axis: 'col',
    parity: 'even',
    text: 'Вероника находилась в столбце с чётным номером.',
  },
];

export const dinerLevel: Level = {
  meta: { id: 'diner-01', title: 'Кетчуп на рубашке', theme: 'diner', difficulty: 4, maxFullyPinnedPeople: 0 },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};
