import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'bungalow', name: 'Бунгало', floorTexture: 'wood' },
  { id: 'reception', name: 'Ресепшен', floorTexture: 'tile', labelAlign: 'left' },
  { id: 'buffet', name: 'Ресторан', floorTexture: 'linoleum', labelAlign: 'right' },
  { id: 'spa', name: 'Спа-зона', floorTexture: 'marble' },
  { id: 'pool', name: 'Главный бассейн', floorTexture: 'water' },
  { id: 'terrace', name: 'Солнечная терраса', floorTexture: 'concrete' },
  { id: 'poolBar', name: 'Бар у бассейна', floorTexture: 'carpet' },
  { id: 'waterpark', name: 'Аквапарк', floorTexture: 'rubber' },
  { id: 'beach', name: 'Пляж', floorTexture: 'sand' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.inflatableMattress(),
  ItemLibrary.sunLounger(),
  ItemLibrary.beachChair(),
  ItemLibrary.bathrobe(),
  ItemLibrary.beachUmbrella(),
  ItemLibrary.hut('Бунгало'),
  ItemLibrary.hammock(),
  ItemLibrary.palm(),
  ItemLibrary.coconut(),
  ItemLibrary.keyBox(),
  ItemLibrary.clock(),
  ItemLibrary.table(),
  ItemLibrary.chair(),
  ItemLibrary.plate(),
  ItemLibrary.jacuzzi(),
  ItemLibrary.bathtub(),
  ItemLibrary.towel(),
  ItemLibrary.barCounter(),
  ItemLibrary.barStool(),
  ItemLibrary.slide(),
  ItemLibrary.lifebuoy(),
  ItemLibrary.lifeboat(),
  ItemLibrary.shell(),
  ItemLibrary.rock(),
  ItemLibrary.suitcase(),
];

const items: Item[] = [
  // Бунгало
  { id: 'item-hut', typeId: 'hut', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-hammock-bungalow', typeId: 'hammock', cells: [cellId(2, 1)] },
  { id: 'item-palm-bungalow', typeId: 'palm', cells: [cellId(1, 0)] },
  { id: 'item-coconut-bungalow', typeId: 'coconut', cells: [cellId(0, 2)] },
  { id: 'item-bathrobe-bungalow', typeId: 'bathrobe', cells: [cellId(2, 0)] },
  { id: 'item-suitcase-bungalow', typeId: 'suitcase', cells: [cellId(1, 2)] },

  // Ресепшен
  { id: 'item-keybox', typeId: 'keyBox', cells: [cellId(1, 3)] },
  { id: 'item-clock-reception', typeId: 'clock', cells: [cellId(2, 3)] },

  // Ресторан-буфет
  { id: 'item-table-1', typeId: 'table', cells: [cellId(0, 4)] },
  { id: 'item-table-2', typeId: 'table', cells: [cellId(1, 5)] },
  { id: 'item-table-3', typeId: 'table', cells: [cellId(2, 6)] },
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(0, 5)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(0, 6)] },
  { id: 'item-chair-3', typeId: 'chair', cells: [cellId(1, 4)] },
  { id: 'item-plate', typeId: 'plate', cells: [cellId(1, 6)] },

  // Спа-зона
  { id: 'item-jacuzzi', typeId: 'jacuzzi', cells: [cellId(0, 9)] },
  { id: 'item-bathtub', typeId: 'bathtub', cells: [cellId(1, 8)] },
  { id: 'item-bathrobe-spa', typeId: 'bathrobe', cells: [cellId(1, 10)] },
  { id: 'item-towel-spa', typeId: 'towel', cells: [cellId(2, 9)] },

  // Надувные матрасы в бассейне
  { id: 'item-mattress-1', typeId: 'inflatableMattress', cells: [cellId(3, 4)] },
  { id: 'item-mattress-2', typeId: 'inflatableMattress', cells: [cellId(4, 5)] },
  { id: 'item-mattress-3', typeId: 'inflatableMattress', cells: [cellId(5, 6)] },
  { id: 'item-mattress-4', typeId: 'inflatableMattress', cells: [cellId(6, 7)] },
  { id: 'item-lifebuoy-pool-1', typeId: 'lifebuoy', cells: [cellId(3, 7)] },
  { id: 'item-lifebuoy-pool-2', typeId: 'lifebuoy', cells: [cellId(6, 4)] },

  // Солнечная терраса
  { id: 'item-lounger-1', typeId: 'sunLounger', cells: [cellId(4, 0)] },
  { id: 'item-lounger-2', typeId: 'sunLounger', cells: [cellId(6, 2)] },
  { id: 'item-umbrella-terrace-1', typeId: 'beachUmbrella', cells: [cellId(4, 3)] },
  { id: 'item-umbrella-terrace-2', typeId: 'beachUmbrella', cells: [cellId(6, 0)] },

  // Бар у бассейна
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(8, 8), cellId(9, 8)] },
  { id: 'item-bar-stool-1', typeId: 'barStool', cells: [cellId(5, 8)] },
  { id: 'item-bar-stool-2', typeId: 'barStool', cells: [cellId(5, 10)] },
  { id: 'item-bar-stool-3', typeId: 'barStool', cells: [cellId(6, 9)] },
  { id: 'item-bar-stool-4', typeId: 'barStool', cells: [cellId(7, 9)] },
  { id: 'item-bar-stool-5', typeId: 'barStool', cells: [cellId(8, 10)] },

  // Аквапарк
  { id: 'item-slide', typeId: 'slide', cells: [cellId(7, 4), cellId(7, 5)] },
  { id: 'item-lifebuoy-waterpark', typeId: 'lifebuoy', cells: [cellId(8, 2)] },
  { id: 'item-boat-waterpark', typeId: 'lifeboat', cells: [cellId(9, 1), cellId(9, 2)] },
  { id: 'item-palm-waterpark', typeId: 'palm', cells: [cellId(7, 2)] },
  { id: 'item-coconut-waterpark', typeId: 'coconut', cells: [cellId(7, 3)] },
  { id: 'item-rock-waterpark', typeId: 'rock', cells: [cellId(10, 0)] },

  // Пляж
  { id: 'item-hammock-beach', typeId: 'hammock', cells: [cellId(10, 5)] },
  { id: 'item-umbrella-beach-1', typeId: 'beachUmbrella', cells: [cellId(8, 6)] },
  { id: 'item-umbrella-beach-2', typeId: 'beachUmbrella', cells: [cellId(10, 8)] },
  { id: 'item-chair-beach-1', typeId: 'beachChair', cells: [cellId(9, 4)] },
  { id: 'item-chair-beach-2', typeId: 'beachChair', cells: [cellId(10, 6)] },
  { id: 'item-shell-1', typeId: 'shell', cells: [cellId(9, 6)] },
  { id: 'item-shell-2', typeId: 'shell', cells: [cellId(8, 5)] },
];

const ROOM_ROWS = [
  'GGGRDDDSSSS',
  'GGGRDDDSSSS',
  'GGGRRDDSSSS',
  'GGGGPPPPSSS',
  'TTTTPPPPSSS',
  'TTTTPPPPBBB',
  'TTTTPPPPBBB',
  'WWWWWWWHBBB',
  'WWWWWHHHBBB',
  'WWWWHHHHBBB',
  'WWWWHHHHHBB',
];

const roomIdsByLetter: Record<string, string> = {
  G: 'bungalow',
  R: 'reception',
  D: 'buffet',
  S: 'spa',
  P: 'pool',
  T: 'terrace',
  B: 'poolBar',
  W: 'waterpark',
  H: 'beach',
};

export function roomForCell(row: number, col: number): string {
  return roomIdsByLetter[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const floorFeatures: FloorFeature[] = [{ id: 'aquaWater', label: 'Вода', textureKey: 'water' }];
const waterCells = new Set([cellId(8, 1), cellId(8, 2), cellId(9, 1), cellId(9, 2)]);
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  waterCells.has(cell.id) ? { ...cell, floorFeatureId: 'aquaWater' } : cell,
);

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['animator'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];
const solution: Record<PersonId, CellId> = {
  artem: cellId(0, 3),
  bella: cellId(1, 1),
  vladimir: cellId(2, 5),
  galina: cellId(3, 8),
  demyan: cellId(4, 0),
  esenia: cellId(5, 6),
  zhdan: cellId(6, 2),
  zoya: cellId(8, 4),
  hristina: cellId(7, 10),
  igor: cellId(9, 9),
  kirill: cellId(10, 7),
};

const clues: Clue[] = [
  { id: 'rs-role-singleton', type: 'roleSingleton', roleId: 'animator', text: 'Среди отдыхающих был ровно один аниматор.' },
  {
    id: 'rs-animator-lounger',
    type: 'occupiesItem',
    subject: { type: 'role', role: 'animator' },
    itemTypeId: 'sunLounger',
    text: 'Аниматор находился на одном из шезлонгов.',
  },
  {
    id: 'rs-zhdan-south-animator',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherRole: 'animator',
    axis: 'row',
    direction: 'after',
    text: 'Ждан находился южнее аниматора.',
  },
  { id: 'rs-terrace-count', type: 'zoneExactCount', roomId: 'terrace', count: 2, text: 'На солнечной террасе находились ровно двое.' },
  { id: 'rs-room-occupancy', type: 'roomOccupancy', text: 'Ни одна зона курорта не осталась пустой.' },
  { id: 'rs-artem-room', type: 'roomMembership', subject: { type: 'person', id: 'artem' }, roomId: 'reception', text: 'Артём находился на ресепшене.' },
  { id: 'rs-bella-bungalow', type: 'roomMembership', subject: { type: 'person', id: 'bella' }, roomId: 'bungalow', text: 'Белла находилась в зоне бунгало.' },
  { id: 'rs-vladimir-room', type: 'roomMembership', subject: { type: 'person', id: 'vladimir' }, roomId: 'buffet', text: 'Владимир находился в ресторане.' },
  { id: 'rs-vladimir-column', type: 'parity', subject: { type: 'person', id: 'vladimir' }, axis: 'col', parity: 'even', text: 'Владимир находился в столбце с чётным номером.' },
  { id: 'rs-galina-west', type: 'wallSide', subject: { type: 'person', id: 'galina' }, wallDirection: 'west', text: 'Галина находилась у западной стены своей зоны.' },
  { id: 'rs-demyan-terrace', type: 'roomMembership', subject: { type: 'person', id: 'demyan' }, roomId: 'terrace', text: 'Демьян находился на солнечной террасе.' },
  { id: 'rs-esenia-row', type: 'parity', subject: { type: 'person', id: 'esenia' }, axis: 'row', parity: 'even', text: 'Есения находилась в ряду с чётным номером.' },
  { id: 'rs-esenia-mattress', type: 'occupiesItem', subject: { type: 'person', id: 'esenia' }, itemTypeId: 'inflatableMattress', text: 'Есения лежала на надувном матрасе.' },
  { id: 'rs-zhdan-lounger', type: 'occupiesItem', subject: { type: 'person', id: 'zhdan' }, itemTypeId: 'sunLounger', text: 'Ждан находился на шезлонге.' },
  { id: 'rs-zoya-slide', type: 'adjacency', subject: { type: 'person', id: 'zoya' }, itemTypeId: 'slide', text: 'Зоя находилась рядом с водной горкой.' },
  { id: 'rs-zoya-north-igor', type: 'relativePosition', subject: { type: 'person', id: 'zoya' }, otherPersonId: 'igor', axis: 'row', direction: 'before', text: 'Зоя находилась севернее Игоря.' },
  { id: 'rs-igor-counter', type: 'adjacency', subject: { type: 'person', id: 'igor' }, itemTypeId: 'barCounter', text: 'Игорь находился рядом с барной стойкой.' },
  { id: 'rs-igor-even-row', type: 'parity', subject: { type: 'person', id: 'igor' }, axis: 'row', parity: 'even', text: 'Игорь находился в ряду с чётным номером.' },
  { id: 'rs-kirill-south-wall', type: 'wallSide', subject: { type: 'person', id: 'kirill' }, wallDirection: 'south', text: 'Кирилл находился у южной стены своей зоны.' },
  { id: 'rs-kirill-south-vladimir', type: 'relativePosition', subject: { type: 'person', id: 'kirill' }, otherPersonId: 'vladimir', axis: 'row', direction: 'after', text: 'Кирилл находился южнее Владимира.' },
];

export const resortLevel: Level = {
  meta: { id: 'resort-01', title: 'Всё включено', theme: 'resort', difficulty: 9, maxFullyPinnedPeople: 0 },
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
