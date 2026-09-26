import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 12;

const rooms: Room[] = [
  { id: 'hole1', name: 'Лунка 1', floorTexture: 'grass', number: 1, labelAlign: 'left' },
  { id: 'hole2', name: 'Лунка 2', floorTexture: 'grass', number: 2, labelAlign: 'right' },
  { id: 'hole3', name: 'Лунка 3', floorTexture: 'grass', number: 3, labelPosition: 'bottom' },
  { id: 'hole4', name: 'Лунка 4', floorTexture: 'grass', number: 4, labelAlign: 'left' },
  { id: 'hole5', name: 'Лунка 5', floorTexture: 'grass', number: 5, labelAlign: 'left' },
  { id: 'hole6', name: 'Лунка 6', floorTexture: 'grass', number: 6, labelAlign: 'right' },
  { id: 'hole7', name: 'Лунка 7', floorTexture: 'grass', number: 7, labelAlign: 'right' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'cart-path', label: 'Дорожка для гольф-каров', textureKey: 'cobble' },
  { id: 'sand-trap', label: 'Песчаный бункер', textureKey: 'sand' },
  { id: 'pond', label: 'Пруд', textureKey: 'water' },
];

const itemTypes: ItemType[] = [
  { id: 'golfHole', label: 'Лунка с флажком', kind: 'decorative', icon: 'golfHole' },
  { id: 'golfTee', label: 'Ти с мячом', kind: 'decorative', icon: 'golfTee' },
  { id: 'golfBag', label: 'Сумка для клюшек', kind: 'decorative', icon: 'golfBag' },
  { id: 'golfCart', label: 'Гольф-кар', kind: 'occupiable', icon: 'golfCart' },
  ItemLibrary.tree(),
  ItemLibrary.broadleafTree(),
  ItemLibrary.rock(),
  ItemLibrary.bench(),
];

const items: Item[] = [
  // Every hole has a cup with its flag and a tee with a ball.
  { id: 'cup-hole-1', typeId: 'golfHole', cells: [cellId(0, 0)] },
  { id: 'tee-hole-1', typeId: 'golfTee', cells: [cellId(1, 1)] },
  { id: 'cup-hole-2', typeId: 'golfHole', cells: [cellId(0, 11)] },
  { id: 'tee-hole-2', typeId: 'golfTee', cells: [cellId(1, 10)] },
  { id: 'cup-hole-3', typeId: 'golfHole', cells: [cellId(6, 4)] },
  { id: 'tee-hole-3', typeId: 'golfTee', cells: [cellId(5, 5)] },
  { id: 'cup-hole-4', typeId: 'golfHole', cells: [cellId(5, 1)] },
  { id: 'tee-hole-4', typeId: 'golfTee', cells: [cellId(6, 0)] },
  { id: 'cup-hole-5', typeId: 'golfHole', cells: [cellId(11, 0)] },
  { id: 'tee-hole-5', typeId: 'golfTee', cells: [cellId(10, 0)] },
  { id: 'cup-hole-6', typeId: 'golfHole', cells: [cellId(11, 8)] },
  { id: 'tee-hole-6', typeId: 'golfTee', cells: [cellId(10, 11)] },
  { id: 'cup-hole-7', typeId: 'golfHole', cells: [cellId(5, 10)] },
  { id: 'tee-hole-7', typeId: 'golfTee', cells: [cellId(6, 10)] },

  { id: 'golf-cart-north', typeId: 'golfCart', cells: [cellId(0, 5), cellId(0, 6)] },
  { id: 'golf-cart-south', typeId: 'golfCart', cells: [cellId(4, 9), cellId(4, 10)] },
  { id: 'golf-bag-hole-4-west', typeId: 'golfBag', cells: [cellId(7, 1)] },
  { id: 'golf-bag-hole-5-north', typeId: 'golfBag', cells: [cellId(9, 1)] },
  { id: 'golf-bag-hole-6', typeId: 'golfBag', cells: [cellId(9, 10)] },

  { id: 'spruce-northwest', typeId: 'tree', cells: [cellId(0, 2)] },
  { id: 'spruce-fairway', typeId: 'tree', cells: [cellId(2, 3)] },
  { id: 'spruce-southwest', typeId: 'tree', cells: [cellId(10, 2)] },
  { id: 'broadleaf-west', typeId: 'broadleafTree', cells: [cellId(4, 1)] },
  { id: 'broadleaf-east', typeId: 'broadleafTree', cells: [cellId(8, 11)] },
  { id: 'rough-rock-north', typeId: 'rock', cells: [cellId(3, 0)] },
  { id: 'rough-rock-south', typeId: 'rock', cells: [cellId(11, 6)] },
  { id: 'bench-east', typeId: 'bench', cells: [cellId(5, 9)] },
  { id: 'bench-south', typeId: 'bench', cells: [cellId(10, 1)] },
];

const ROOM_ROWS = [
  '111112222222',
  '111111222222',
  '111111232222',
  '114313337722',
  '444333337777',
  '444333337777',
  '444333337777',
  '444666666777',
  '444444466777',
  '555555556666',
  '555555566666',
  '555555566666',
];

const ROOM_BY_NUMBER: Record<string, string> = {
  '1': 'hole1',
  '2': 'hole2',
  '3': 'hole3',
  '4': 'hole4',
  '5': 'hole5',
  '6': 'hole6',
  '7': 'hole7',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_NUMBER[ROOM_ROWS[row][col]];
}

const CART_PATH_CELLS = [
  [2, 4], [2, 5], [2, 6], [2, 7], [3, 7], [4, 7], [4, 6], [4, 5], [4, 4], [4, 3], [4, 2],
  [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8],
  [8, 8], [7, 8], [7, 9], [6, 9], [5, 9],
].map(([row, col]) => cellId(row, col));

const SAND_TRAP_CELLS = [
  cellId(1, 6), cellId(1, 7), cellId(1, 8), cellId(2, 8), cellId(2, 9), cellId(2, 10),
  cellId(10, 4), cellId(10, 5), cellId(11, 5),
];
const POND_CELLS = [cellId(1, 11), cellId(2, 11), cellId(10, 10), cellId(11, 9), cellId(11, 10)];
const featureByCell = new Map([
  ...CART_PATH_CELLS.map((id) => [id, 'cart-path'] as const),
  ...SAND_TRAP_CELLS.map((id) => [id, 'sand-trap'] as const),
  ...POND_CELLS.map((id) => [id, 'pond'] as const),
]);
const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  const floorFeatureId = featureByCell.get(cell.id);
  return floorFeatureId ? { ...cell, floorFeatureId } : cell;
});

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'beata', name: 'Беата', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'gelena', name: 'Гелена', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ida', name: 'Ида', initialLetter: 'И', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'klim', name: 'Клим', initialLetter: 'К', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: true },
  { id: 'lidiya', name: 'Лидия', initialLetter: 'Л', gender: 'female', color: '#8a5a3a', isVictim: false, isMurderer: false },
  { id: 'harita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#9b7ce0', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  artem: cellId(0, 5),
  beata: cellId(1, 6),
  vadim: cellId(2, 0),
  gelena: cellId(3, 8),
  dmitry: cellId(4, 9),
  egor: cellId(5, 3),
  zhanna: cellId(6, 11),
  harita: cellId(7, 2),
  klim: cellId(8, 1),
  zahar: cellId(9, 4),
  ida: cellId(10, 7),
  lidiya: cellId(11, 10),
};

const clues: Clue[] = [
  {
    id: 'golf-zone-parity',
    type: 'zoneCountParity',
    zones: rooms.map((room) => ({ roomId: room.id, parity: room.number! % 2 === 0 ? 'even' : 'odd' })),
    text: 'На лунках с чётным номером было чётное число игроков, а на лунках с нечётным номером — нечётное.',
  },
  {
    id: 'golf-all-holes-used',
    type: 'roomOccupancy',
    text: 'На каждой из семи лунок находился хотя бы один игрок.',
  },
  {
    id: 'golf-artem-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'artem' },
    axis: 'row',
    parity: 'odd',
    text: 'Артём находился в ряду с нечётным номером.',
  },
  {
    id: 'golf-artem-north-of-beata',
    type: 'relativePosition',
    subject: { type: 'person', id: 'artem' },
    otherPersonId: 'beata',
    axis: 'row',
    direction: 'before',
    text: 'Артём находился севернее Беаты.',
  },
  {
    id: 'golf-beata-north-of-vadim',
    type: 'relativePosition',
    subject: { type: 'person', id: 'beata' },
    otherPersonId: 'vadim',
    axis: 'row',
    direction: 'before',
    text: 'Беата находилась севернее Вадима.',
  },
  {
    id: 'golf-beata-in-sand-trap',
    type: 'floorFeature',
    subject: { type: 'person', id: 'beata' },
    featureId: 'sand-trap',
    text: 'Беата находилась в песчаном бункере.',
  },
  {
    id: 'golf-vadim-hole-1',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vadim' },
    roomId: 'hole1',
    text: 'Вадим находился на лунке 1.',
  },
  {
    id: 'golf-vadim-column-parity',
    type: 'parity',
    subject: { type: 'person', id: 'vadim' },
    axis: 'col',
    parity: 'odd',
    text: 'Вадим находился в столбце с нечётным номером.',
  },
  {
    id: 'golf-vadim-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'vadim' },
    wallDirection: 'west',
    text: 'Вадим находился у западной границы своей зоны.',
  },
  {
    id: 'golf-gelena-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'gelena' },
    wallDirection: 'north',
    text: 'Гелена находилась у северной границы своей зоны.',
  },
  {
    id: 'golf-dmitry-near-bench',
    type: 'adjacency',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'bench',
    text: 'Дмитрий находился рядом со скамейкой.',
  },
  {
    id: 'golf-egor-hole-3',
    type: 'roomMembership',
    subject: { type: 'person', id: 'egor' },
    roomId: 'hole3',
    text: 'Егор находился на лунке 3.',
  },
  {
    id: 'golf-egor-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'egor' },
    axis: 'col',
    parity: 'even',
    text: 'Егор находился в столбце с чётным номером.',
  },
  {
    id: 'golf-zhanna-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'east',
    text: 'Жанна находилась у восточной границы своей зоны.',
  },
  {
    id: 'golf-zhanna-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'zhanna' },
    axis: 'row',
    parity: 'odd',
    text: 'Жанна находилась в ряду с нечётным номером.',
  },
  {
    id: 'golf-klim-next-to-bag',
    type: 'adjacency',
    subject: { type: 'person', id: 'klim' },
    itemTypeId: 'golfBag',
    text: 'Клим находился рядом с сумкой для клюшек.',
  },
  {
    id: 'golf-klim-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'klim' },
    axis: 'row',
    parity: 'odd',
    text: 'Клим находился в ряду с нечётным номером.',
  },
  {
    id: 'golf-zahar-on-cart-path',
    type: 'floorFeature',
    subject: { type: 'person', id: 'zahar' },
    featureId: 'cart-path',
    text: 'Захар находился на дорожке.',
  },
  {
    id: 'golf-zahar-higher-than-artem',
    type: 'roomNumberComparison',
    subject: { type: 'person', id: 'zahar' },
    otherPersonId: 'artem',
    comparison: 'higher',
    text: 'Номер лунки Захара был выше номера лунки Артёма.',
  },
  {
    id: 'golf-ida-hole-6',
    type: 'roomMembership',
    subject: { type: 'person', id: 'ida' },
    roomId: 'hole6',
    text: 'Ида находилась на лунке 6.',
  },
  {
    id: 'golf-ida-west-of-lidiya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ida' },
    otherPersonId: 'lidiya',
    axis: 'col',
    direction: 'before',
    text: 'Ида находилась западнее Лидии.',
  },
  {
    id: 'golf-ida-north-of-lidiya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ida' },
    otherPersonId: 'lidiya',
    axis: 'row',
    direction: 'before',
    text: 'Ида находилась севернее Лидии.',
  },
  {
    id: 'golf-ida-east-of-artem',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ida' },
    otherPersonId: 'artem',
    axis: 'col',
    direction: 'after',
    text: 'Ида находилась восточнее Артёма.',
  },
  {
    id: 'golf-artem-on-grass',
    type: 'floorTexture',
    subject: { type: 'person', id: 'artem' },
    textureKey: 'grass',
    text: 'Артём находился на газоне.',
  },
  {
    id: 'golf-lidiya-at-pond',
    type: 'floorFeature',
    subject: { type: 'person', id: 'lidiya' },
    featureId: 'pond',
    text: 'Лидия находилась в пруду.',
  },
  {
    id: 'golf-cart-drivers-men',
    type: 'itemTypeGender',
    itemTypeId: 'golfCart',
    gender: 'male',
    requireOccupied: true,
    text: 'В обоих гольф-карах были мужчины.',
  },
  {
    id: 'golf-zhanna-east-of-cart-player',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'golfCart',
    axis: 'col',
    direction: 'after',
    text: 'Жанна находилась восточнее хотя бы одного из игроков в гольф-карах.',
  },
];

const level: Level = {
  meta: {
    id: 'golfclub-01',
    title: 'Замах и удар',
    theme: 'golfclub',
    difficulty: 7,
    maxFullyPinnedPeople: 1,
    menuTag: 'expert',
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

export const golfClubLevel = level;
