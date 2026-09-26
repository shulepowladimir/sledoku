import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11; // рядов (этажи паркинга)
const cols = 10; // столбцов

// «Пойман на парковке»: вертикальная уровневая парковка. Крыша сверху, ниже —
// этажи 4→1, внизу — въезд с шлагбаумом. Решение живёт в квадрате 10×10:
// один ряд остаётся пустым (крыша) — загадка общей подсказки-дизъюнкции.
const rooms: Room[] = [
  { id: 'roof', name: 'Крыша', floorTexture: 'rubber' },
  { id: 'floor4', name: 'Четвёртый этаж', floorTexture: 'stone' },
  { id: 'floor3', name: 'Третий этаж', floorTexture: 'cobble' },
  { id: 'floor2', name: 'Второй этаж', floorTexture: 'concrete' },
  { id: 'floor1', name: 'Первый этаж', floorTexture: 'marble' },
  { id: 'entrance', name: 'Въезд', floorTexture: 'asphalt' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.motorcycle(),
  ItemLibrary.car(),
  { id: 'satelliteDish', label: 'Антенна', kind: 'decorative', icon: 'satelliteDish' },
  ItemLibrary.spotlight(),
  ItemLibrary.clock(),
  ItemLibrary.trafficSign(),
  ItemLibrary.tireStack(),
  ItemLibrary.trashcan(),
  ItemLibrary.camera(),
  ItemLibrary.trafficLight(),
];

const items: Item[] = [
  // Мотоциклы (2-клеточные, occupiable)
  { id: 'item-moto-1', typeId: 'motorcycle', cells: [cellId(0, 4), cellId(0, 5)] },
  { id: 'item-moto-2', typeId: 'motorcycle', cells: [cellId(1, 7), cellId(1, 8)] },
  { id: 'item-moto-3', typeId: 'motorcycle', cells: [cellId(3, 5), cellId(3, 6)] },
  { id: 'item-moto-4', typeId: 'motorcycle', cells: [cellId(5, 3), cellId(5, 4)] },
  { id: 'item-moto-5', typeId: 'motorcycle', cells: [cellId(6, 6), cellId(6, 7)] },
  { id: 'item-moto-6', typeId: 'motorcycle', cells: [cellId(9, 0), cellId(9, 1)] },
  { id: 'item-moto-7', typeId: 'motorcycle', cells: [cellId(10, 6), cellId(10, 7)] },
  // Машины (2-клеточные, occupiable)
  { id: 'item-car-1', typeId: 'car', cells: [cellId(2, 3), cellId(2, 4)] },
  { id: 'item-car-2', typeId: 'car', cells: [cellId(4, 6), cellId(4, 7)] },
  { id: 'item-car-3', typeId: 'car', cells: [cellId(5, 1), cellId(5, 2)] },
  { id: 'item-car-4', typeId: 'car', cells: [cellId(6, 0), cellId(6, 1)] },
  { id: 'item-car-5', typeId: 'car', cells: [cellId(7, 3), cellId(7, 4)] },
  { id: 'item-car-6', typeId: 'car', cells: [cellId(8, 0), cellId(8, 1)] },
  // Прочее (из библиотеки)
  { id: 'item-antenna-1', typeId: 'satelliteDish', cells: [cellId(0, 2)] },
  { id: 'item-antenna-2', typeId: 'satelliteDish', cells: [cellId(0, 8)] },
  { id: 'item-spotlight', typeId: 'spotlight', cells: [cellId(1, 0)] },
  { id: 'item-clock-1', typeId: 'clock', cells: [cellId(1, 2)] },
  { id: 'item-clock-2', typeId: 'clock', cells: [cellId(8, 5)] },
  { id: 'item-sign-1', typeId: 'trafficSign', cells: [cellId(2, 8)] },
  { id: 'item-sign-2', typeId: 'trafficSign', cells: [cellId(4, 0)] },
  { id: 'item-sign-3', typeId: 'trafficSign', cells: [cellId(6, 9)] },
  { id: 'item-sign-4', typeId: 'trafficSign', cells: [cellId(10, 8)] },
  { id: 'item-tires-1', typeId: 'tireStack', cells: [cellId(3, 1)] },
  { id: 'item-tires-2', typeId: 'tireStack', cells: [cellId(9, 4)] },
  { id: 'item-trash-1', typeId: 'trashcan', cells: [cellId(4, 5)] },
  { id: 'item-trash-2', typeId: 'trashcan', cells: [cellId(7, 6)] },
  { id: 'item-trash-3', typeId: 'trashcan', cells: [cellId(10, 0)] },
  { id: 'item-camera-1', typeId: 'camera', cells: [cellId(3, 9)] },
  { id: 'item-camera-2', typeId: 'camera', cells: [cellId(7, 8)] },
  { id: 'item-traffic-light', typeId: 'trafficLight', cells: [cellId(10, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// К=крыша, Ч=четвёртый этаж, Т=третий, Д=второй, О=первый, В=въезд.
const ROOM_ROWS = [
  'кккккккккк',
  'ккчччччччч',
  'чччччччччч',
  'ччтттттттт',
  'тттттттттт',
  'тттттддддд',
  'дддддддддд',
  'ддддддддоо',
  'оооооооооо',
  'оооооооовв',
  'вввввввввв',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return { к: 'roof', ч: 'floor4', т: 'floor3', д: 'floor2', о: 'floor1', в: 'entrance' }[ch] ?? 'roof';
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols);

const people: Person[] = [
  { id: 'aleksey', name: 'Алексей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: true },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'evgenia', name: 'Евгения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'khristian', name: 'Христиан', initialLetter: 'Х', gender: 'male', color: '#e0a94a', isVictim: true, isMurderer: false },
];

// Пермутация 10×10 внутри 11×10: ряды 1–10 и столбцы 0–9 различны, ряд 0 пуст (крыша).
// Алексей (убийца, 1,9) и Христиан (жертва, 2,5) — вдвоём на четвёртом этаже;
// пустая машина — (2,3)+(2,4); Борис на мотоцикле въезда.
const solution: Record<PersonId, CellId> = {
  aleksey: cellId(1, 9),
  boris: cellId(10, 7),
  vera: cellId(7, 4),
  grigory: cellId(4, 6),
  dmitry: cellId(9, 8),
  evgenia: cellId(5, 2),
  zhanna: cellId(3, 3),
  zoya: cellId(6, 1),
  igor: cellId(8, 0),
  khristian: cellId(2, 5),
};

const clues: Clue[] = [
  // — Общие правила парковки —
  {
    id: 'p1',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'car',
    vacancies: 1,
    text: 'Ровно одна машина осталась пустой.',
  },
  {
    id: 'p2',
    type: 'zoneEmptyDisjunction',
    roomIds: ['roof', 'entrance'],
    text: 'На крыше или на въезде никого не было.',
  },
  {
    id: 'p3',
    type: 'zoneCountParity',
    zones: [
      { roomId: 'floor4', parity: 'even' },
      { roomId: 'floor3', parity: 'odd' },
      { roomId: 'floor2', parity: 'even' },
      { roomId: 'floor1', parity: 'odd' },
    ],
    text: 'На чётных этажах паркинга было чётное число людей, на нечётных — нечётное.',
  },
  // — Личные —
  {
    id: 'p4',
    type: 'adjacency',
    subject: { type: 'person', id: 'grigory' },
    itemTypeId: 'trashcan',
    text: 'Григорий находился рядом с мусорным баком.',
  },
  {
    id: 'p5',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'trafficSign',
    text: 'Дмитрий находился в одной зоне с дорожным знаком.',
  },
  {
    id: 'p6',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'motorcycle',
    text: 'Борис сидел на мотоцикле.',
  },
  {
    id: 'p7',
    type: 'corner',
    subject: { type: 'person', id: 'aleksey' },
    text: 'Алексей находился в углу своей зоны.',
  },
  {
    id: 'p8',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'vera' },
    itemTypeId: 'car',
    text: 'Вера сидела в машине.',
  },
  {
    id: 'p9',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'evgenia' },
    itemTypeId: 'car',
    text: 'Евгения сидела в машине.',
  },
  {
    id: 'p10',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zhanna' },
    roomId: 'floor3',
    text: 'Жанна находилась на третьем этаже.',
  },
  {
    id: 'p11',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'floor2',
    text: 'Зоя находилась на втором этаже.',
  },
  {
    id: 'p12',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'igor' },
    itemTypeId: 'car',
    text: 'Игорь сидел в машине.',
  },
  {
    id: 'p13',
    type: 'corner',
    subject: { type: 'person', id: 'dmitry' },
    text: 'Дмитрий находился в углу своей зоны.',
  },
  {
    id: 'p14',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dmitry' },
    otherPersonId: 'aleksey',
    axis: 'row',
    direction: 'after',
    text: 'Дмитрий находился южнее Алексея.',
  },
  {
    id: 'p15',
    type: 'parity',
    subject: { type: 'person', id: 'vera' },
    axis: 'row',
    parity: 'even',
    text: 'Вера находилась в чётном ряду.',
  },
  {
    id: 'p16',
    type: 'adjacency',
    subject: { type: 'person', id: 'evgenia' },
    itemTypeId: 'motorcycle',
    text: 'Евгения находилась рядом с мотоциклом.',
  },
  {
    id: 'p17',
    type: 'adjacency',
    subject: { type: 'person', id: 'igor' },
    itemTypeId: 'motorcycle',
    text: 'Игорь находился рядом с мотоциклом.',
  },
  {
    id: 'p18',
    type: 'parity',
    subject: { type: 'person', id: 'vera' },
    axis: 'col',
    parity: 'odd',
    text: 'Вера находилась в нечётном столбце.',
  },
  {
    id: 'p19',
    type: 'parity',
    subject: { type: 'person', id: 'aleksey' },
    axis: 'row',
    parity: 'even',
    text: 'Алексей находился в чётном ряду.',
  },
  {
    id: 'p20',
    type: 'relativePosition',
    subject: { type: 'person', id: 'grigory' },
    otherPersonId: 'zoya',
    axis: 'row',
    direction: 'before',
    text: 'Григорий находился севернее Зои.',
  },
  {
    id: 'p21',
    type: 'relativePosition',
    subject: { type: 'person', id: 'evgenia' },
    otherPersonId: 'zhanna',
    axis: 'row',
    direction: 'after',
    text: 'Евгения находилась южнее Жанны.',
  },
  {
    id: 'p22',
    type: 'relativePosition',
    subject: { type: 'person', id: 'igor' },
    otherPersonId: 'evgenia',
    axis: 'row',
    direction: 'after',
    text: 'Игорь находился южнее Евгении.',
  },
  {
    id: 'p23',
    type: 'parity',
    subject: { type: 'person', id: 'zoya' },
    axis: 'col',
    parity: 'even',
    text: 'Зоя находилась в чётном столбце.',
  },
];

export const parkingLevel: Level = {
  meta: { id: 'parking-01', title: 'Пойман на парковке', theme: 'parking', difficulty: 10, maxFullyPinnedPeople: 0, menuTag: 'expert' },
  size,
  cols,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};
