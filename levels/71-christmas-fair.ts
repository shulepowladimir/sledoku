import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room, RoomGroup } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 12;

const ROOM_ROWS = [
  'CCCCCCBBBBBB',
  'CCCCCBBBBBBB',
  'SSSSDDDDFFFF',
  'SSSSSDDDFFFF',
  'KKKPPPPPFFFF',
  'KKKKPPPPFFFF',
  'KKKKPPPPFFFF',
  'KKKKPPPPFFFF',
  'IIIIPPPPHHHH',
  'IIIIIPPPPHHH',
  'IIIIIPPPPHHH',
  'IIIIIIPPPPHH',
];

const rooms: Room[] = [
  { id: 'crafts', name: 'Ремесленные ряды', floorTexture: 'wood' },
  { id: 'souvenirs', name: 'Сувенирные ряды', floorTexture: 'rug' },
  { id: 'delicacies', name: 'Ряд деликатесов', floorTexture: 'bakeryTile' },
  { id: 'food', name: 'Ряд горячей еды', floorTexture: 'wood' },
  { id: 'sweets', name: 'Сладкий ряд', floorTexture: 'bakeryTile' },
  { id: 'drinks', name: 'Ряд горячих напитков', floorTexture: 'cobble' },
  { id: 'plaza', name: 'Центральная площадь', floorTexture: 'snow' },
  { id: 'iceRink', name: 'Каток', floorTexture: 'ice' },
  { id: 'santaHut', name: 'Домик Деда Мороза', floorTexture: 'wood' },
];

const ROOM_BY_CODE: Record<string, string> = {
  C: 'crafts',
  B: 'souvenirs',
  S: 'delicacies',
  D: 'food',
  F: 'sweets',
  K: 'drinks',
  P: 'plaza',
  I: 'iceRink',
  H: 'santaHut',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_CODE[ROOM_ROWS[row][col]];
}

const roomGroups: RoomGroup[] = [
  {
    id: 'marketRows',
    name: 'Торговые ряды',
    roomIds: ['crafts', 'souvenirs', 'delicacies', 'food', 'sweets', 'drinks'],
  },
];

const itemTypes: ItemType[] = [
  ItemLibrary.christmasStand(),
  ItemLibrary.gift(),
  ItemLibrary.sleigh(),
  ItemLibrary.garland('Гирлянда', { render: 'tile', tileEdgeDepth: false }),
  ItemLibrary.ferrisWheel(),
  ItemLibrary.carousel(),
  ItemLibrary.swing(),
  ItemLibrary.popcornStand(),
  ItemLibrary.tree(),
  ItemLibrary.bench(),
  ItemLibrary.lamppost(),
  ItemLibrary.trashcan(),
];

function singleItems(typeId: string, prefix: string, coordinates: [number, number][]): Item[] {
  return coordinates.map(([row, col], index) => ({
    id: `${prefix}-${index + 1}`,
    typeId,
    cells: [cellId(row - 1, col - 1)],
  }));
}

const items: Item[] = [
  // Two little stalls in each of the six market rows.
  ...singleItems('christmasStand', 'stand-crafts', [[1, 2], [2, 4]]),
  ...singleItems('christmasStand', 'stand-souvenirs', [[1, 9], [2, 11]]),
  ...singleItems('christmasStand', 'stand-delicacies', [[3, 2], [4, 4]]),
  ...singleItems('christmasStand', 'stand-food', [[3, 6], [4, 7]]),
  ...singleItems('christmasStand', 'stand-sweets', [[3, 10], [7, 11]]),
  ...singleItems('christmasStand', 'stand-drinks', [[5, 2], [8, 2]]),

  // Wrapped presents scattered between the rows and recreation areas.
  ...singleItems('gift', 'gift', [
    [2, 2], [2, 8], [3, 5], [5, 3], [5, 10],
    [7, 3], [9, 6], [9, 11], [11, 2], [11, 7],
  ]),

  // Sledges are occupiable props, repeated across the map rather than separate rooms.
  ...singleItems('sleigh', 'sleigh', [[2, 10], [7, 6], [10, 3], [4, 12], [12, 4]]),

  // Garland patches replace the gallery, selected market decorations, and southern rink bin.
  { id: 'garland-plaza-ride', typeId: 'garland', cells: [cellId(5, 7), cellId(6, 7)] },
  { id: 'garland-sweets-row', typeId: 'garland', cells: [cellId(2, 10), cellId(2, 11)] },
  { id: 'garland-souvenir-north', typeId: 'garland', cells: [cellId(0, 10), cellId(0, 11)] },
  ...singleItems('garland', 'garland-single', [[12, 2], [1, 1], [11, 1], [8, 6]]),

  // The central plaza hosts the remaining rides and its Christmas tree.
  { id: 'ferris-wheel', typeId: 'ferrisWheel', cells: [cellId(5, 6), cellId(6, 6)] },
  { id: 'carousel', typeId: 'carousel', cells: [cellId(7, 6), cellId(8, 6)] },
  { id: 'swing', typeId: 'swing', cells: [cellId(7, 7)] },
  { id: 'christmas-tree', typeId: 'tree', cells: [cellId(5, 5)] },

  // A few familiar fairground comforts and winter-greenery at the outer paths.
  ...singleItems('tree', 'tree', [[2, 7], [9, 1], [12, 11]]),
  ...singleItems('popcornStand', 'popcorn', [[4, 9], [5, 9], [5, 11], [12, 8]]),
  ...singleItems('bench', 'bench', [[7, 2], [10, 11], [11, 3], [7, 4], [8, 4], [4, 1], [3, 3], [8, 10]]),
  ...singleItems('lamppost', 'lamp', [[9, 12], [9, 4], [11, 5], [6, 1], [10, 9], [5, 4]]),
  ...singleItems('trashcan', 'bin', [[10, 5], [9, 3], [11, 10]]),
];

const itemIdByCell = new Map<CellId, string>();
for (const item of items) {
  for (const itemCell of item.cells) {
    if (itemIdByCell.has(itemCell)) throw new Error(`Overlapping Christmas Fair items at ${itemCell}.`);
    itemIdByCell.set(itemCell, item.id);
  }
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: true },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ivan', name: 'Иван', initialLetter: 'И', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'klavdia', name: 'Клавдия', initialLetter: 'К', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'liudmila', name: 'Людмила', initialLetter: 'Л', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// One person per row and column. The victim and murderer are the only people in the plaza.
const solution: Record<PersonId, CellId> = {
  aglaya: cellId(0, 2),
  boris: cellId(1, 9),
  viktor: cellId(2, 0),
  galina: cellId(3, 7),
  zhanna: cellId(4, 6),
  dmitry: cellId(5, 1),
  khariton: cellId(6, 5),
  liudmila: cellId(7, 10),
  klavdia: cellId(8, 8),
  esenia: cellId(9, 3),
  zahar: cellId(10, 11),
  ivan: cellId(11, 4),
};

const clues: Clue[] = [
  {
    id: 'cf-market-row-membership',
    type: 'roomGroupMembership',
    subject: { type: 'person', id: 'boris' },
    roomGroupId: 'marketRows',
    text: 'Борис находился в одном из торговых рядов.',
  },
  {
    id: 'cf-esenia-shared-vowel',
    type: 'sharedRoomLetterGroup',
    subject: { type: 'person', id: 'esenia' },
    letterClass: 'vowel',
    text: 'В зоне с Есенией был ещё хотя бы один человек на гласную букву.',
  },
  {
    id: 'cf-esenia-near-trashcan',
    type: 'adjacency',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'trashcan',
    text: 'Есения находилась рядом с урной.',
  },
  {
    id: 'cf-aglaya-north-of-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'aglaya' },
    otherPersonId: 'viktor',
    axis: 'row',
    direction: 'before',
    text: 'Аглая находилась севернее Виктора.',
  },
  {
    id: 'cf-aglaya-no-gift-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'aglaya' },
    itemTypeId: 'gift',
    axis: 'row',
    text: 'В ряду с Аглаей не было подарков.',
  },
  {
    id: 'cf-boris-on-sleigh',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'sleigh',
    text: 'Борис находился на санях.',
  },
  {
    id: 'cf-viktor-delicacies',
    type: 'roomMembership',
    subject: { type: 'person', id: 'viktor' },
    roomId: 'delicacies',
    text: 'Виктор находился в ряду деликатесов.',
  },
  {
    id: 'cf-galina-no-gift-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'gift',
    axis: 'row',
    text: 'В ряду с Галиной не было подарков.',
  },
  {
    id: 'cf-galina-wood-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'galina' },
    textureKey: 'wood',
    text: 'Галина находилась на деревянном настиле.',
  },
  {
    id: 'cf-dmitry-near-lamppost',
    type: 'adjacency',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'lamppost',
    text: 'Дмитрий находился рядом с фонарём.',
  },
  {
    id: 'cf-dmitry-no-gift-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'gift',
    axis: 'row',
    text: 'В ряду с Дмитрием не было подарков.',
  },
  {
    id: 'cf-zhanna-on-plaza',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zhanna' },
    roomId: 'plaza',
    text: 'Жанна находилась на центральной площади.',
  },
  {
    id: 'cf-zhanna-near-ferris-wheel',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'ferrisWheel',
    text: 'Жанна находилась рядом с колесом обозрения.',
  },
  {
    id: 'cf-zhanna-north-of-dmitry',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'dmitry',
    axis: 'row',
    direction: 'before',
    text: 'Жанна находилась севернее Дмитрия.',
  },
  {
    id: 'cf-zahar-south-of-klavdia',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zahar' },
    otherPersonId: 'klavdia',
    axis: 'row',
    direction: 'after',
    minOffset: 2,
    text: 'Захар находился не менее чем на два ряда южнее Клавдии.',
  },
  {
    id: 'cf-zahar-santa-hut',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zahar' },
    roomId: 'santaHut',
    text: 'Захар находился в домике Деда Мороза.',
  },
  {
    id: 'cf-ivan-next-to-sleigh',
    type: 'adjacency',
    subject: { type: 'person', id: 'ivan' },
    itemTypeId: 'sleigh',
    text: 'Иван находился рядом с санями.',
  },
  {
    id: 'cf-ivan-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'ivan' },
    wallDirection: 'south',
    text: 'Иван находился у южной стены своей зоны.',
  },
  {
    id: 'cf-ivan-east-of-aglaya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ivan' },
    otherPersonId: 'aglaya',
    axis: 'col',
    direction: 'after',
    minOffset: 2,
    text: 'Иван находился не менее чем на два столбца восточнее Аглаи.',
  },
  {
    id: 'cf-klavdia-no-gift-column',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'klavdia' },
    itemTypeId: 'gift',
    axis: 'col',
    text: 'В столбце с Клавдией не было подарков.',
  },
  {
    id: 'cf-klavdia-wood-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'klavdia' },
    textureKey: 'wood',
    text: 'Клавдия находилась на деревянном настиле.',
  },
  {
    id: 'cf-liudmila-no-gift-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'liudmila' },
    itemTypeId: 'gift',
    axis: 'row',
    text: 'В ряду с Людмилой не было подарков.',
  },
  {
    id: 'cf-liudmila-no-sleigh-column',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'liudmila' },
    itemTypeId: 'sleigh',
    axis: 'col',
    text: 'В столбце Людмилы не было саней.',
  },
];

export const christmasFairLevel: Level = {
  meta: {
    id: 'christmas-fair-01',
    title: 'Переполох с подарками',
    theme: 'christmasFair',
    difficulty: 8,
    maxFullyPinnedPeople: 0,
  },
  size,
  rooms,
  roomGroups,
  itemTypes,
  items,
  cells,
  floorFeatures: [],
  people,
  solution,
  clues,
};
