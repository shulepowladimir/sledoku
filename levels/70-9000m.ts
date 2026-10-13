import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 9;
const GRID = [
  'EEEBBSSSS',
  'EEEBBBCSS',
  'EEEBBBCCS',
  'PEEBBPCCC',
  'PPPPPPCCC',
  'PeebbPCCC',
  'eeebbbCCS',
  'eeebbbCSS',
  'eeebbSSSS',
];

const roomByCode: Record<string, Room> = {
  E: { id: 'west-economy', name: 'Западный эконом', floorTexture: 'carpet' },
  e: { id: 'east-economy', name: 'Восточный эконом', floorTexture: 'carpet' },
  B: { id: 'west-business', name: 'Западный бизнес', floorTexture: 'rug' },
  b: { id: 'east-business', name: 'Восточный бизнес', floorTexture: 'rug' },
  P: { id: 'aisle', name: 'Проход', floorTexture: 'stairs' },
  C: { id: 'cockpit', name: 'Кабина пилотов', floorTexture: 'metal' },
  S: { id: 'sky', name: 'Небо', floorTexture: 'sky' },
};

const rooms = Object.values(roomByCode);

function roomForCell(row: number, col: number): string {
  return roomByCode[GRID[row][col]].id;
}

type Placement = {
  id: string;
  typeId: string;
  row: number;
  col: number;
  iconVariant?: string;
  rotation?: 90 | 180 | 270;
};

// Coordinates are 0-based here; these preserve the approved 1-based cabin plan.
const itemPlacements: Placement[] = [
  // Economy seats — blue upholstery.
  ...[
    [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 1],
    [5, 1], [6, 0], [6, 1], [6, 2], [7, 0], [7, 1], [7, 2], [8, 1], [8, 2],
  ].map(([row, col]) => ({ id: `economy-seat-${row}-${col}`, typeId: 'airplaneSeat', row, col, rotation: 270 as const })),
  // Business seats — wine upholstery, same item type with an icon variant.
  ...[
    [0, 4], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5], [3, 3],
    [5, 4], [6, 3], [6, 4], [6, 5], [7, 3], [7, 4], [7, 5], [8, 3],
  ].map(([row, col]) => ({ id: `business-seat-${row}-${col}`, typeId: 'airplaneSeat', row, col, iconVariant: 'airplaneSeatBusiness', rotation: 270 as const })),
  // Cabin windows: reuse the existing airlock illustration under the approved label.
  { id: 'window-north-west', typeId: 'airlock', row: 0, col: 0 },
  { id: 'window-north-middle', typeId: 'airlock', row: 0, col: 3 },
  { id: 'window-south-west', typeId: 'airlock', row: 8, col: 0 },
  { id: 'window-south-middle', typeId: 'airlock', row: 8, col: 4 },
  // Overhead luggage racks.
  { id: 'rack-west-economy', typeId: 'luggageRack', row: 3, col: 2 },
  { id: 'rack-west-business', typeId: 'luggageRack', row: 3, col: 4 },
  { id: 'rack-aisle-west', typeId: 'luggageRack', row: 5, col: 2 },
  { id: 'rack-aisle-east', typeId: 'luggageRack', row: 5, col: 3 },
  // Galley and cockpit equipment.
  { id: 'service-trolley', typeId: 'waiterTrolley', row: 4, col: 2 },
  { id: 'director-console', typeId: 'directorConsole', row: 1, col: 6 },
  { id: 'aircraft-yoke', typeId: 'aircraftYoke', row: 2, col: 7 },
  { id: 'cockpit-radio-station', typeId: 'radioStation', row: 4, col: 6 },
  { id: 'cockpit-portable-radio', typeId: 'portableRadio', row: 5, col: 8 },
  // A plane far beyond the window line.
  { id: 'distant-plane', typeId: 'plane', row: 0, col: 7 },
];

const itemTypes: ItemType[] = [
  ItemLibrary.airplaneSeat(),
  ItemLibrary.airlock('Иллюминатор'),
  ItemLibrary.luggageRack(),
  ItemLibrary.waiterTrolley('Тележка стюардессы'),
  ItemLibrary.directorConsole('Пульт управления'),
  ItemLibrary.aircraftYoke(),
  ItemLibrary.radioStation('Станция связи'),
  ItemLibrary.portableRadio('Рация'),
  ItemLibrary.plane(),
];

const items: Item[] = itemPlacements.map(({ id, typeId, row, col, iconVariant, rotation }) => ({
  id,
  typeId,
  cells: [cellId(row, col)],
  ...(iconVariant ? { iconVariant } : {}),
  ...(rotation ? { rotation } : {}),
}));

const itemIdByCell = new Map<CellId, string>();
for (const item of items) {
  const cell = item.cells[0];
  if (itemIdByCell.has(cell)) throw new Error(`Overlapping airplane level items at ${cell}.`);
  itemIdByCell.set(cell, item.id);
}

const cells = buildCells(size, roomForCell, () => undefined).map((cell) => ({
  ...cell,
  ...(itemIdByCell.has(cell.id) ? { itemId: itemIdByCell.get(cell.id) } : {}),
}));

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['passenger'] },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e0', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['passenger'] },
];

const solution: Record<PersonId, CellId> = {
  dmitry: cellId(0, 1),
  egor: cellId(1, 4),
  khariton: cellId(2, 2),
  anna: cellId(3, 5),
  boris: cellId(4, 8),
  vera: cellId(5, 7),
  zhanna: cellId(6, 0),
  galina: cellId(7, 6),
  zoya: cellId(8, 3),
};

const clues: Clue[] = [
  {
    id: 'flight-crew-by-name',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Г',
    roleId: 'crew',
    text: 'Все с А по Г были членами экипажа, остальные — пассажирами.',
  },
  {
    id: 'flight-crew-zones',
    type: 'roleZoneLimit',
    roleId: 'crew',
    roomIds: ['west-economy', 'east-economy', 'west-business', 'east-business'],
    maxCount: 0,
    groupId: 'flight-crew-and-passenger-places',
    text: 'Члены экипажа находились в кабине пилотов и в проходе, пассажиры — на своих местах.',
  },
  {
    id: 'flight-passengers-seated',
    type: 'roleOccupiesItem',
    roleId: 'passenger',
    itemTypeId: 'airplaneSeat',
    groupId: 'flight-crew-and-passenger-places',
    text: 'Члены экипажа находились в кабине пилотов и в проходе, пассажиры — на своих местах.',
  },
  {
    id: 'flight-sky-empty',
    type: 'zoneExactCount',
    roomId: 'sky',
    count: 0,
    text: 'В небе никто не находился.',
  },
  {
    id: 'flight-anna-aisle-cockpit-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'anna' },
    roomId: 'aisle',
    otherRoomId: 'cockpit',
    text: 'Анна находилась на границе прохода и кабины пилотов.',
  },
  {
    id: 'flight-anna-north-of-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'anna' },
    otherPersonId: 'vera',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Анна находилась ровно на два ряда севернее Веры.',
  },
  {
    id: 'flight-boris-row',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'radioStation',
    text: 'Находился в одном ряду или столбце со станцией связи',
  },
  {
    id: 'flight-vera-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'vera' },
    axis: 'col',
    parity: 'even',
    text: 'Вера находилась в столбце с чётным номером.',
  },
  {
    id: 'flight-galina-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    parity: 'even',
    text: 'Галина находилась в ряду с чётным номером.',
  },
  {
    id: 'flight-galina-seventh-column',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'col',
    value: 6,
    text: 'Галина находилась в седьмом столбце.',
  },
  {
    id: 'flight-dmitry-first-row',
    type: 'position',
    subject: { type: 'person', id: 'dmitry' },
    axis: 'row',
    value: 0,
    text: 'Дмитрий находился в первом ряду.',
  },
  {
    id: 'flight-dmitry-west-of-egor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dmitry' },
    otherPersonId: 'egor',
    axis: 'col',
    direction: 'before',
    offset: 3,
    text: 'Дмитрий находился ровно на три столбца западнее Егора.',
  },
  {
    id: 'flight-egor-west-business',
    type: 'roomMembership',
    subject: { type: 'person', id: 'egor' },
    roomId: 'west-business',
    text: 'Егор находился в западном салоне бизнес-класса.',
  },
  {
    id: 'flight-egor-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'egor' },
    axis: 'row',
    parity: 'even',
    text: 'Егор находился в ряду с чётным номером.',
  },
  {
    id: 'flight-zhanna-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'north',
    text: 'Жанна находилась у северной стены своего салона.',
  },
  {
    id: 'flight-zoya-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zoya' },
    wallDirection: 'west',
    text: 'Зоя находилась у западной стены своего салона.',
  },
  {
    id: 'flight-zoya-window-adjacency',
    type: 'adjacency',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'airlock',
    text: 'Зоя сидела рядом с иллюминатором.',
  },
];

export const airplaneLevel: Level = {
  meta: {
    id: 'airplane-01',
    title: '9000м над землёй',
    theme: 'airplane',
    difficulty: 7,
    maxFullyPinnedPeople: 0,
  },
  size,
  rooms,
  itemTypes,
  items,
  cells,
  floorFeatures: [],
  people,
  solution,
  clues,
};
