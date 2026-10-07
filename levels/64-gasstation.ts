import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 6;

const rooms: Room[] = [
  { id: 'pumps', name: 'Колонки', floorTexture: 'asphalt' },
  { id: 'wash', name: 'Автомойка', floorTexture: 'concrete' },
  { id: 'store', name: 'Магазин', floorTexture: 'tile' },
  { id: 'parking', name: 'Парковка и выезд', floorTexture: 'asphalt' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.car(),
  ItemLibrary.fuelPump(),
  ItemLibrary.carWashBrush(),
  ItemLibrary.gasPriceSign(),
  ItemLibrary.kassa(),
  ItemLibrary.fridge(),
  ItemLibrary.clock(),
  ItemLibrary.productShelf('Стенд с продукцией'),
];

const items: Item[] = [
  { id: 'pump-1', typeId: 'fuelPump', cells: [cellId(0, 1)] },
  { id: 'pump-2', typeId: 'fuelPump', cells: [cellId(1, 2)] },
  { id: 'pump-3', typeId: 'fuelPump', cells: [cellId(2, 2)] },
  { id: 'car-pumps', typeId: 'car', cells: [cellId(0, 2), cellId(0, 3)] },
  { id: 'car-parking', typeId: 'car', cells: [cellId(1, 4), cellId(1, 5)] },
  { id: 'car-wash', typeId: 'car', cells: [cellId(5, 0), cellId(5, 1)] },
  { id: 'gas-price-sign', typeId: 'gasPriceSign', cells: [cellId(2, 5)] },
  { id: 'wash-brush-1', typeId: 'carWashBrush', cells: [cellId(4, 0)] },
  { id: 'wash-brush-2', typeId: 'carWashBrush', cells: [cellId(4, 1)] },
  { id: 'store-shelf', typeId: 'productShelf', cells: [cellId(3, 2)] },
  { id: 'store-fridge', typeId: 'fridge', cells: [cellId(3, 3)] },
  { id: 'store-kassa', typeId: 'kassa', cells: [cellId(4, 3)] },
  { id: 'store-clock', typeId: 'clock', cells: [cellId(5, 3)] },
  { id: 'store-shelf-2', typeId: 'productShelf', cells: [cellId(5, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

// G = gasoline pumps, W = wash, S = store, P = parking/exit.
const ROOM_ROWS = [
  'GGGGPP',
  'GGGGPP',
  'GGGGPP',
  'WWSSPP',
  'WWSSSS',
  'WWSSSS',
];

const ROOM_BY_LETTER: Record<string, string> = {
  G: 'pumps',
  W: 'wash',
  S: 'store',
  P: 'parking',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['employee'] },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['employee'] },
  { id: 'vlada', name: 'Влада', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: true, roles: ['employee', 'washer'] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['customer'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['customer'] },
  { id: 'khristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['customer'] },
];

// The employee posts are pumps, store, and wash. The washer and victim are alone in the wash.
const solution: Record<PersonId, CellId> = {
  anfisa: cellId(0, 2),
  guriy: cellId(1, 5),
  darya: cellId(2, 3),
  khristofor: cellId(3, 1),
  borislav: cellId(4, 4),
  vlada: cellId(5, 0),
};

const clues: Clue[] = [
  { id: 'gs-employees-by-letter', type: 'letterRangeRole', fromLetter: 'А', toLetter: 'В', roleId: 'employee', text: 'Все с Анфисы по Владу были сотрудниками заправки; остальные — клиенты.' },
  {
    id: 'gs-employee-posts',
    type: 'roleZoneMin',
    roleId: 'employee',
    roomIds: ['pumps', 'store', 'wash'],
    minCount: 1,
    text: 'В каждой зоне, кроме парковки, был сотрудник.',
  },
  {
    id: 'gs-clients-wash',
    type: 'roleZoneMin',
    roleId: 'customer',
    roomIds: ['wash'],
    minCount: 1,
    text: 'Один из клиентов находился в автомойке.',
  },
  { id: 'gs-anfisa-pump', type: 'adjacency', subject: { type: 'person', id: 'anfisa' }, itemTypeId: 'fuelPump', text: 'Анфиса находилась рядом с топливной колонкой.' },
  { id: 'gs-anfisa-north-of-darya', type: 'relativePosition', subject: { type: 'person', id: 'anfisa' }, otherPersonId: 'darya', axis: 'row', direction: 'before', text: 'Анфиса находилась севернее Дарьи.' },
  { id: 'gs-borislav-kassa', type: 'adjacency', subject: { type: 'person', id: 'borislav' }, itemTypeId: 'kassa', text: 'Борислав находился рядом с кассой.' },
  { id: 'gs-guriy-sign', type: 'adjacency', subject: { type: 'person', id: 'guriy' }, itemTypeId: 'gasPriceSign', text: 'Гурий находился рядом с табло цен.' },
  { id: 'gs-darya-even-row', type: 'parity', subject: { type: 'person', id: 'darya' }, axis: 'row', parity: 'odd', text: 'Дарья находилась в ряду с нечётным номером.' },
  { id: 'gs-vlada-in-car', type: 'occupiesItem', subject: { type: 'person', id: 'vlada' }, itemTypeId: 'car', text: 'Влада находилась в машине.' },
  { id: 'gs-vlada-odd-column', type: 'parity', subject: { type: 'person', id: 'vlada' }, axis: 'col', parity: 'odd', text: 'Влада находилась в столбце с нечётным номером.' },
];

export const gasStationLevel: Level = {
  meta: { id: 'gasstation-01', title: 'У трассы 66', theme: 'gasStation', difficulty: 4, maxFullyPinnedPeople: 0 },
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
