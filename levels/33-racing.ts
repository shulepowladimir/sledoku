import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10; // рядов
const cols = 11; // столбцов — нестандартная карта 10×11; решение живёт в квадрате 10×10,
// один крайний столбец пуст (какой именно — загадка общей подсказки).

// «Убийственная скорость»: городское гран-при. Уличная трасса петляет между
// трибунами, парком и площадью; на пит-стопе — боксы команд, в лагуне — яхты
// богатых зрителей. Жертва найдена на северной трибуне.
const rooms: Room[] = [
  { id: 'north', name: 'Северная трибуна', floorTexture: 'rubber' },
  { id: 'pit', name: 'Пит-стоп', floorTexture: 'metal' },
  { id: 'track', name: 'Трасса', floorTexture: 'asphalt' },
  { id: 'park', name: 'Городской парк', floorTexture: 'grass' },
  { id: 'square', name: 'Городская площадь', floorTexture: 'cobble' },
  { id: 'lagoon', name: 'Лагуна', floorTexture: 'water' },
  { id: 'south', name: 'Южная трибуна', floorTexture: 'rubber' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'finish', label: 'Старт-финиш', textureKey: 'checker' },
];
const FINISH_CELLS = new Set([cellId(5, 4), cellId(5, 5)]);

const itemTypes: ItemType[] = [
  ItemLibrary.raceCar(),
  ItemLibrary.yacht(),
  ItemLibrary.seat(),
  ItemLibrary.popcornStand(),
  ItemLibrary.tireStack(),
  ItemLibrary.toolbox(),
  ItemLibrary.trafficLight(),
  ItemLibrary.bench(),
  ItemLibrary.tree(),
  ItemLibrary.fountain(),
  ItemLibrary.monument(),
  ItemLibrary.townhouse(),
  ItemLibrary.lifebuoy(),
];

const items: Item[] = [
  // Гоночные машины (2-клеточные, occupiable) — все на трассе
  { id: 'item-car-1', typeId: 'raceCar', cells: [cellId(4, 1), cellId(4, 2)] },
  { id: 'item-car-2', typeId: 'raceCar', cells: [cellId(3, 8), cellId(3, 9)] },
  { id: 'item-car-3', typeId: 'raceCar', cells: [cellId(6, 9), cellId(6, 10)] },
  { id: 'item-car-4', typeId: 'raceCar', cells: [cellId(7, 3), cellId(7, 4)] },
  // Северная трибуна: ряды сидений + попкорн
  { id: 'item-seat-n1', typeId: 'seat', cells: [cellId(0, 1)] },
  { id: 'item-seat-n2', typeId: 'seat', cells: [cellId(0, 3)] },
  { id: 'item-seat-n3', typeId: 'seat', cells: [cellId(0, 8)] },
  { id: 'item-seat-n4', typeId: 'seat', cells: [cellId(0, 10)] },
  { id: 'item-seat-n5', typeId: 'seat', cells: [cellId(1, 0)] },
  { id: 'item-seat-n6', typeId: 'seat', cells: [cellId(1, 4)] },
  { id: 'item-seat-n7', typeId: 'seat', cells: [cellId(1, 6)] },
  { id: 'item-seat-n8', typeId: 'seat', cells: [cellId(2, 1)] },
  { id: 'item-seat-n9', typeId: 'seat', cells: [cellId(2, 3)] },
  { id: 'item-seat-n10', typeId: 'seat', cells: [cellId(2, 5)] },
  { id: 'item-seat-n11', typeId: 'seat', cells: [cellId(2, 6)] },
  { id: 'item-popcorn', typeId: 'popcornStand', cells: [cellId(2, 2)] },
  // Южная трибуна
  { id: 'item-seat-s1', typeId: 'seat', cells: [cellId(7, 10)] },
  { id: 'item-seat-s2', typeId: 'seat', cells: [cellId(8, 9)] },
  { id: 'item-seat-s3', typeId: 'seat', cells: [cellId(9, 10)] },
  // Пит-стоп
  { id: 'item-toolbox', typeId: 'toolbox', cells: [cellId(2, 8)] },
  { id: 'item-tires-1', typeId: 'tireStack', cells: [cellId(3, 1)] },
  { id: 'item-tires-2', typeId: 'tireStack', cells: [cellId(3, 6)] },
  { id: 'item-traffic', typeId: 'trafficLight', cells: [cellId(4, 5)] },
  // Городской парк
  { id: 'item-bench', typeId: 'bench', cells: [cellId(7, 5)] },
  { id: 'item-tree', typeId: 'tree', cells: [cellId(6, 3)] },
  { id: 'item-fountain', typeId: 'fountain', cells: [cellId(7, 6)] },
  // Городская площадь
  { id: 'item-monument', typeId: 'monument', cells: [cellId(5, 8)] },
  { id: 'item-townhouse', typeId: 'townhouse', cells: [cellId(6, 8)] },
  // Лагуна
  { id: 'item-yacht-1', typeId: 'yacht', cells: [cellId(9, 0)] },
  { id: 'item-yacht-2', typeId: 'yacht', cells: [cellId(8, 2)] },
  { id: 'item-buoy', typeId: 'lifebuoy', cells: [cellId(7, 1)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// n=северная трибуна, p=пит-стоп, t=трасса, g=парк, q=площадь, l=лагуна, u=южная трибуна.
const ROOM_ROWS = [
  'nnnnnnnnnnn',
  'nnnnnnnnppn',
  'nnnnnnnpptt',
  'ppppppppttt',
  'tttttptttqt',
  'ttggtttqqqt',
  'tttggggqqtt',
  'lltttgggttu',
  'llltttgttuu',
  'llllltttuuu',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return { n: 'north', p: 'pit', t: 'track', g: 'park', q: 'square', l: 'lagoon', u: 'south' }[ch] ?? 'track';
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols).map((cell) => {
  if (FINISH_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'finish' };
  return cell;
});

const people: Person[] = [
  { id: 'anton', name: 'Антон', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bogdan', name: 'Богдан', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'gleb', name: 'Глеб', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['spectator'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: true, roles: ['spectator'] },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['spectator'] },
  { id: 'irma', name: 'Ирма', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['spectator'] },
  { id: 'kharitina', name: 'Харитина', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['spectator'] },
];

// Судоку-инвариант: 10 людей, все ряды 0–9 и столбцы 0–9 различны; столбец 10 пуст.
// Водители: Антон (4,1), Вера (3,8), Глеб (7,4), Дина (6,9) — на машинах;
// Богдан — механик на пит-стопе (2,7) у ящика с инструментами; Ефим на яхте (9,0);
// убийца Жанна и жертва Харитина — вдвоём на северной трибуне; Захар и Ирма — в парке.
const solution: Record<PersonId, CellId> = {
  anton: cellId(4, 1),
  bogdan: cellId(2, 7),
  vera: cellId(3, 8),
  gleb: cellId(7, 4),
  dina: cellId(6, 9),
  efim: cellId(9, 0),
  zhanna: cellId(1, 2),
  zakhar: cellId(8, 6),
  irma: cellId(5, 3),
  kharitina: cellId(0, 5),
};

const clues: Clue[] = [
  // — Общие правила гран-при (все load-bearing) —
  {
    id: 'c1',
    type: 'letterRangeRole',
    fromLetter: 'Е',
    toLetter: 'Х',
    roleId: 'spectator',
    text: 'Все, чьё имя начиналось с буквы от Е до Х, были зрителями.',
  },
  {
    id: 'c2',
    type: 'roleZoneLimit',
    roleId: 'spectator',
    roomIds: ['track', 'pit'],
    maxCount: 0,
    text: 'Зрители не допускались ни на трассу, ни на пит-стоп.',
  },
  {
    id: 'c3',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'raceCar',
    text: 'Ни одна гоночная машина не осталась без водителя.',
  },
  {
    id: 'c4',
    type: 'edgeColumnEmpty',
    text: 'Первый или последний столбец был пустым.',
  },
  // — Антон (водитель, машина на пит-прямой) —
  {
    id: 'c5',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'anton' },
    itemTypeId: 'raceCar',
    text: 'Антон сидел в гоночной машине.',
  },
  // — Богдан (механик, пит-стоп) —
  {
    id: 'c6',
    type: 'adjacency',
    subject: { type: 'person', id: 'bogdan' },
    itemTypeId: 'toolbox',
    text: 'Богдан находился рядом с ящиком инструментов.',
  },
  // — Вера (водительница, машина у пит-выезда) —
  {
    id: 'c15',
    type: 'parity',
    subject: { type: 'person', id: 'vera' },
    axis: 'row',
    parity: 'even',
    text: 'Вера находилась в чётном ряду.',
  },
  {
    id: 'c16',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vera' },
    otherPersonId: 'anton',
    axis: 'row',
    direction: 'before',
    text: 'Вера находилась севернее Антона.',
  },
  // — Глеб (водитель, южная петля трассы) —
  {
    id: 'c8',
    type: 'corner',
    subject: { type: 'person', id: 'gleb' },
    text: 'Глеб находился в углу своей зоны.',
  },
  // — Дина (водительница, восточная прямая) —
  {
    id: 'c9',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dina' },
    otherPersonId: 'vera',
    axis: 'col',
    direction: 'after',
    text: 'Дина находилась восточнее Веры.',
  },
  // — Ефим (зритель, яхта в лагуне) —
  {
    id: 'c10',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'efim' },
    itemTypeId: 'yacht',
    text: 'Ефим сидел на яхте.',
  },
  // — Жанна (зритель, северная трибуна; убийца) —
  {
    id: 'c11',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'popcornStand',
    text: 'Жанна находилась рядом со стойкой с попкорном.',
  },
  {
    id: 'c12',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'bogdan',
    axis: 'row',
    direction: 'before',
    offset: 1,
    text: 'Жанна находилась ровно на один ряд севернее Богдана.',
  },
  // — Захар (зритель, парк) —
  {
    id: 'c13',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zakhar' },
    itemTypeId: 'fountain',
    text: 'Захар находился в одной зоне с фонтаном.',
  },
  // — Ирма (зритель, парк) —
  {
    id: 'c17',
    type: 'adjacency',
    subject: { type: 'person', id: 'irma' },
    itemTypeId: 'tree',
    text: 'Ирма находилась рядом с деревом.',
  },
];

export const racingLevel: Level = {
  meta: { id: 'racing-01', title: 'Убийственная скорость', theme: 'racing', difficulty: 9, maxFullyPinnedPeople: 0 },
  size,
  cols,
  rooms,
  itemTypes,
  items,
  floorFeatures,
  cells,
  people,
  solution,
  clues,
};
