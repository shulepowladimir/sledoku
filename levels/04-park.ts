import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 6;

const rooms: Room[] = [
  { id: 'playground', name: 'Детская площадка', floorTexture: 'dirt' },
  { id: 'alley', name: 'Аллея', floorTexture: 'stone' },
  { id: 'lawn', name: 'Газон', floorTexture: 'grass' },
];

const floorFeatures: FloorFeature[] = [{ id: 'pond', label: 'Пруд', textureKey: 'water' }];
const POND_CELLS = new Set([cellId(3, 4), cellId(3, 5)]);

const itemTypes: ItemType[] = [
  ItemLibrary.bench(),
  ItemLibrary.swing(),
  ItemLibrary.fountain(),
  ItemLibrary.lamppost(),
  ItemLibrary.trashcan(),
  { id: 'flowerbed', label: 'Клумба', kind: 'decorative', icon: 'flowerbed' },
  ItemLibrary.kiosk('Киоск с мороженым'),
  ItemLibrary.tree(),
  ItemLibrary.rock(),
];

const items: Item[] = [
  { id: 'item-bench', typeId: 'bench', cells: [cellId(0, 1)] },
  { id: 'item-swing', typeId: 'swing', cells: [cellId(1, 0)] },
  { id: 'item-fountain', typeId: 'fountain', cells: [cellId(2, 2), cellId(2, 3)] },
  { id: 'item-lamppost', typeId: 'lamppost', cells: [cellId(4, 0)] },
  { id: 'item-trashcan', typeId: 'trashcan', cells: [cellId(5, 0)] },
  { id: 'item-flowerbed', typeId: 'flowerbed', cells: [cellId(5, 2)] },
  { id: 'item-kiosk', typeId: 'kiosk', cells: [cellId(1, 5)] },
  { id: 'item-tree-a', typeId: 'tree', cells: [cellId(0, 4)] },
  { id: 'item-tree-l', typeId: 'tree', cells: [cellId(2, 5)] },
  { id: 'item-rock-l', typeId: 'rock', cells: [cellId(4, 4)] },
  { id: 'item-lamppost-l', typeId: 'lamppost', cells: [cellId(2, 4)] },
  { id: 'item-flowerbed-l', typeId: 'flowerbed', cells: [cellId(5, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Three diagonal-band zones: playground (P), alley (A), lawn (L).
const ROOM_ROWS = ['PPPPAA', 'PPPAAL', 'PPAALL', 'PAALLL', 'AALLLL', 'ALLLLL'];
const ROOM_BY_LETTER: Record<string, string> = { P: 'playground', A: 'alley', L: 'lawn' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (POND_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'pond' } : cell));

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'beata', name: 'Беата', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0a94a', isVictim: false, isMurderer: true },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'harita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  artem: cellId(0, 5),
  beata: cellId(1, 2),
  vadim: cellId(2, 0),
  glafira: cellId(3, 4),
  demid: cellId(4, 1),
  harita: cellId(5, 3),
};

const clues: Clue[] = [
  {
    id: 'p1',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vadim' },
    roomId: 'playground',
    text: 'Вадим находился на детской площадке.',
  },
  {
    id: 'p2',
    type: 'adjacency',
    subject: { type: 'person', id: 'vadim' },
    itemTypeId: 'swing',
    text: 'Вадим находился рядом с качелями.',
  },
  {
    id: 'p3',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'beata' },
    otherPersonId: 'vadim',
    text: 'Беата находилась в одной зоне с Вадимом.',
  },
  {
    id: 'p4',
    type: 'relativePosition',
    subject: { type: 'person', id: 'beata' },
    otherPersonId: 'vadim',
    axis: 'col',
    direction: 'after',
    text: 'Беата находилась восточнее Вадима.',
  },
  {
    id: 'p5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demid' },
    roomId: 'alley',
    text: 'Демид находился на аллее.',
  },
  {
    id: 'p6',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demid' },
    otherPersonId: 'artem',
    axis: 'row',
    direction: 'after',
    text: 'Демид находился южнее Артёма.',
  },
  {
    id: 'p7',
    type: 'corner',
    subject: { type: 'person', id: 'artem' },
    text: 'Артём находился в углу своей зоны.',
  },
  {
    id: 'p8',
    type: 'parity',
    subject: { type: 'person', id: 'artem' },
    axis: 'row',
    parity: 'odd',
    text: 'Артём находился в ряду с нечётным номером.',
  },
  {
    id: 'p9',
    type: 'floorFeature',
    subject: { type: 'person', id: 'glafira' },
    featureId: 'pond',
    text: 'Глафира находилась в пруду.',
  },
  {
    id: 'p10',
    type: 'roomParity',
    parity: 'even',
    text: 'Во всех зонах парка оказалось чётное число людей.',
  },
];

export const parkLevel: Level = {
  meta: { id: 'park-01', title: 'Происшествие в парке', theme: 'park', difficulty: 4, maxFullyPinnedPeople: 0 },
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
