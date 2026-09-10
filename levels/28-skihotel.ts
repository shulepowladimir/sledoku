import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 9;

// Горный отель перед сходом лавины. Север — улица: трасса snow, каток (фича ice)
// и стойка лыж; юг — отель: подъезд, лобби, спа, бар и каминный зал.
const rooms: Room[] = [
  { id: 'slope', name: 'Трасса', floorTexture: 'snow' },
  { id: 'rink', name: 'Каток', floorTexture: 'concrete' },
  { id: 'skirack', name: 'Стойка лыж', floorTexture: 'wood' },
  { id: 'drive', name: 'Подъезд', floorTexture: 'cobble' },
  { id: 'lobby', name: 'Лобби', floorTexture: 'tile' },
  { id: 'spa', name: 'Спа', floorTexture: 'marble' },
  { id: 'bar', name: 'Бар', floorTexture: 'carpet' },
  { id: 'fireside', name: 'Каминный зал', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'rinkIce', label: 'Лёд катка', textureKey: 'ice' },
  { id: 'pool', label: 'Бассейн', textureKey: 'water' },
  { id: 'runner', label: 'Дорожка к бару', textureKey: 'rug' },
];
const POOL_CELLS = new Set([cellId(3, 6), cellId(3, 7), cellId(4, 6), cellId(4, 7)]);
const RINK_CELLS = new Set([cellId(1, 1), cellId(1, 2), cellId(2, 1), cellId(2, 2)]);
const RUNNER_CELLS = new Set([cellId(5, 4), cellId(6, 4), cellId(7, 4)]);

const itemTypes: ItemType[] = [
  ItemLibrary.goal('Ворота трассы'),
  ItemLibrary.skiRack(),
  ItemLibrary.fireplace(),
  ItemLibrary.kassa('Стойка регистрации'),
  ItemLibrary.armchair(),
  ItemLibrary.bench(),
  ItemLibrary.lamppost(),
  ItemLibrary.tree(),
  ItemLibrary.barCounter(),
  ItemLibrary.barStool(),
  ItemLibrary.table('Столик бара'),
  ItemLibrary.tv(),
  ItemLibrary.box('Ящик с электрокабелем'),
  ItemLibrary.suitcase('Чемоданы гостей'),
  ItemLibrary.clock(),
  ItemLibrary.floorLamp(),
  ItemLibrary.jacuzzi(),
  ItemLibrary.bathtub('Ванна спа'),
];

const items: Item[] = [
  // Трасса
  { id: 'item-goal', typeId: 'goal', cells: [cellId(0, 0)] },
  { id: 'item-tree-1', typeId: 'tree', cells: [cellId(0, 3)] },
  { id: 'item-tree-2', typeId: 'tree', cells: [cellId(1, 0)] },
  { id: 'item-tree-3', typeId: 'tree', cells: [cellId(2, 0)] },
  // Каток (лавка для переобувания)
  { id: 'item-bench-rink', typeId: 'bench', cells: [cellId(2, 2)] },
  // Стойка лыж: два стенда у входа на трассу
  { id: 'item-skirack-1', typeId: 'skiRack', cells: [cellId(1, 4)] },
  { id: 'item-skirack-2', typeId: 'skiRack', cells: [cellId(3, 4)] },
  // Подъезд
  { id: 'item-lamp-drive', typeId: 'lamppost', cells: [cellId(4, 1)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(3, 0)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(4, 2)] },
  // Лобби
  { id: 'item-reception', typeId: 'kassa', cells: [cellId(5, 0)] },
  { id: 'item-suitcase-1', typeId: 'suitcase', cells: [cellId(5, 3)] },
  { id: 'item-clock', typeId: 'clock', cells: [cellId(6, 1)] },
  // Спа (север: зоны отдыха; юг: бассейн)
  { id: 'item-bench-spa-1', typeId: 'bench', cells: [cellId(1, 5)] },
  { id: 'item-bench-spa-2', typeId: 'bench', cells: [cellId(5, 8)] },
  { id: 'item-jacuzzi-1', typeId: 'jacuzzi', cells: [cellId(5, 7)] },
  { id: 'item-jacuzzi-2', typeId: 'jacuzzi', cells: [cellId(0, 6)] },
  { id: 'item-bath-1', typeId: 'bathtub', cells: [cellId(1, 7)] },
  { id: 'item-bath-2', typeId: 'bathtub', cells: [cellId(4, 8)] },
  // Бар
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(6, 0)] },
  { id: 'item-barstool-1', typeId: 'barStool', cells: [cellId(7, 0)] },
  { id: 'item-barstool-2', typeId: 'barStool', cells: [cellId(8, 1)] },
  { id: 'item-table-bar', typeId: 'table', cells: [cellId(8, 2)] },
  { id: 'item-tv', typeId: 'tv', cells: [cellId(7, 2)] },
  // Каминный зал
  { id: 'item-fireplace', typeId: 'fireplace', cells: [cellId(8, 8)] },
  { id: 'item-armchair-1', typeId: 'armchair', cells: [cellId(7, 8)] },
  { id: 'item-armchair-2', typeId: 'armchair', cells: [cellId(8, 5)] },
  { id: 'item-floorlamp', typeId: 'floorLamp', cells: [cellId(6, 7)] },
  { id: 'item-suitcase-2', typeId: 'suitcase', cells: [cellId(6, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// S = трасса, R = каток, K = стойка лыж, D = подъезд, L = лобби, P = спа, B = бар, F = каминный зал.
const ROOM_ROWS = [
  'SSSSKKPPP',
  'SRRKKKPPP',
  'SRRKKKPPP',
  'DDDDKKPPP',
  'DDDDLPPPP',
  'LLLLLPPPP',
  'BBBBBFFFF',
  'BBBBBFFFF',
  'BBBBBFFFF',
];

const ROOM_BY_LETTER: Record<string, string> = {
  S: 'slope',
  R: 'rink',
  K: 'skirack',
  D: 'drive',
  L: 'lobby',
  P: 'spa',
  B: 'bar',
  F: 'fireside',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (RINK_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'rinkIce' };
  if (POOL_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'pool' };
  if (RUNNER_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'runner' };
  return cell;
});

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'beata', name: 'Беата', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: true },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8f7ca8', isVictim: true, isMurderer: false },
];

// Судоку-инвариант (все ряды/столбцы различны): А(0,8) Д(1,1) Е(2,6) Б(3,5) В(4,4)
// Ж(5,2) Г(6,3) Х(7,0) З(8,7). Гласные А и Е — в спа; убийца Глафира и жертва Харитон —
// вдвоём в баре; Беата стоит на стойке лыж (женщина — itemTypeGender), Демид на льду катка.
const solution: Record<PersonId, CellId> = {
  artem: cellId(0, 8),
  demid: cellId(1, 1),
  esenia: cellId(2, 6),
  beata: cellId(3, 5),
  vadim: cellId(4, 4),
  zhdan: cellId(5, 2),
  glafira: cellId(6, 3),
  khariton: cellId(7, 0),
  zoya: cellId(8, 7),
};

const clues: Clue[] = [
  // — Общие правила отеля (без ролей) —
  {
    id: 's1',
    type: 'itemTypeGender',
    itemTypeId: 'bathtub',
    gender: 'female',
    text: 'Мужчины не принимали ванну в спа.',
  },
  {
    id: 's2',
    type: 'letterGroupRoom',
    letterClass: 'vowel',
    text: 'Люди с именами на гласную букву находились в одной и той же зоне.',
  },
  // — Личные —
  {
    id: 's4',
    type: 'wallSide',
    subject: { type: 'person', id: 'artem' },
    wallDirection: 'east',
    text: 'Артём находился у восточной стены своей зоны.',
  },
  {
    id: 's5',
    type: 'adjacency',
    subject: { type: 'person', id: 'beata' },
    itemTypeId: 'skiRack',
    text: 'Беата находилась рядом со стойкой с лыжами.',
  },
  {
    id: 's6',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'vadim' },
    otherPersonId: 'zhdan',
    text: 'Вадим находился в той же зоне, что и Ждан.',
  },
  {
    id: 's7',
    type: 'floorFeature',
    subject: { type: 'person', id: 'demid' },
    featureId: 'rinkIce',
    text: 'Демид находился на льду катка.',
  },
  {
    id: 's9',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'jacuzzi',
    text: 'Есения находилась в одной зоне с джакузи.',
  },
  {
    id: 's9b',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'artem',
    axis: 'row',
    direction: 'after',
    offset: 2,
    text: 'Есения находилась ровно на два ряда южнее Артёма.',
  },
  {
    id: 's10b',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'suitcase',
    text: 'Ждан находился рядом с чемоданом.',
  },
  {
    id: 's11',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'glafira' },
    itemTypeId: 'table',
    text: 'Глафира находилась в одной зоне со столиком бара.',
  },
  {
    id: 's11b',
    type: 'parity',
    subject: { type: 'person', id: 'glafira' },
    axis: 'col',
    parity: 'even',
    text: 'Глафира находилась в столбце с чётным номером.',
  },
  {
    id: 's12',
    type: 'adjacency',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'fireplace',
    text: 'Зоя находилась рядом с камином.',
  },
];

export const skiHotelLevel: Level = {
  meta: { id: 'skihotel-01', title: 'Перед лавиной', theme: 'ski', difficulty: 8, maxFullyPinnedPeople: 0 },
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
