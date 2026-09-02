import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 9;

const rooms: Room[] = [
  { id: 'openspace', name: 'Опенспейс', floorTexture: 'tile' },
  { id: 'meeting', name: 'Переговорная', floorTexture: 'wood' },
  { id: 'director', name: 'Кабинет директора', floorTexture: 'carpet' },
];

const floorFeatures: FloorFeature[] = [{ id: 'director-rug', label: 'Ковёр', textureKey: 'rug' }];
const RUG_CELLS = new Set([cellId(6, 1), cellId(6, 2)]);

const itemTypes: ItemType[] = [
  ItemLibrary.computer(),
  ItemLibrary.watercooler(),
  ItemLibrary.chair(),
  ItemLibrary.armchair('Кресло директора'),
  ItemLibrary.workbench('Стол переговоров'),
  ItemLibrary.plant(),
  ItemLibrary.box('Архивная коробка'),
  ItemLibrary.safe('Сейф с документами'),
  ItemLibrary.bookshelf('Стеллаж с документами'),
  ItemLibrary.table(),
  ItemLibrary.trashcan(),
];

const items: Item[] = [
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(0, 2)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(2, 4)] },
  { id: 'item-chair-3', typeId: 'chair', cells: [cellId(1, 4)] },
  { id: 'item-chair-4', typeId: 'chair', cells: [cellId(6, 6)] },
  { id: 'item-chair-5', typeId: 'chair', cells: [cellId(2, 6)] },
  { id: 'item-chair-6', typeId: 'chair', cells: [cellId(7, 3)] },
  { id: 'item-armchair-1', typeId: 'armchair', cells: [cellId(6, 1)] },
  { id: 'item-armchair-2', typeId: 'armchair', cells: [cellId(3, 3)] },
  { id: 'item-armchair-3', typeId: 'armchair', cells: [cellId(3, 6)] },
  { id: 'item-workbench-1', typeId: 'workbench', cells: [cellId(1, 7)] },
  { id: 'item-workbench-2', typeId: 'workbench', cells: [cellId(4, 3)] },
  { id: 'item-workbench-3', typeId: 'workbench', cells: [cellId(1, 8)] },
  { id: 'item-computer-1', typeId: 'computer', cells: [cellId(3, 1)] },
  { id: 'item-computer-2', typeId: 'computer', cells: [cellId(5, 4)] },
  { id: 'item-watercooler', typeId: 'watercooler', cells: [cellId(7, 7)] },
  { id: 'item-plant-1', typeId: 'plant', cells: [cellId(4, 7)] },
  { id: 'item-plant-2', typeId: 'plant', cells: [cellId(1, 2)] },
  { id: 'item-plant-3', typeId: 'plant', cells: [cellId(5, 6)] },
  { id: 'item-plant-4', typeId: 'plant', cells: [cellId(0, 7)] },
  { id: 'item-plant-5', typeId: 'plant', cells: [cellId(5, 1)] },
  { id: 'item-safe-1', typeId: 'safe', cells: [cellId(7, 1)] },
  { id: 'item-safe-2', typeId: 'safe', cells: [cellId(8, 7)] },
  { id: 'item-safe-3', typeId: 'safe', cells: [cellId(7, 0)] },
  { id: 'item-bookshelf-1', typeId: 'bookshelf', cells: [cellId(8, 1), cellId(8, 2)] },
  { id: 'item-bookshelf-2', typeId: 'bookshelf', cells: [cellId(6, 4)] },
  { id: 'item-box', typeId: 'box', cells: [cellId(2, 3)] },
  { id: 'item-table-o1', typeId: 'table', cells: [cellId(0, 4)] },
  { id: 'item-trashcan-o1', typeId: 'trashcan', cells: [cellId(0, 0)] },
  { id: 'item-box-o2', typeId: 'box', cells: [cellId(2, 2)] },
  { id: 'item-table-m1', typeId: 'table', cells: [cellId(2, 7)] },
  { id: 'item-trashcan-o2', typeId: 'trashcan', cells: [cellId(5, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Three zones on a 9x9 board: meeting (M) wedge top-right, director (D) wedge growing bottom-left,
// openspace (O) the large diagonal band wrapping between them.
const ROOM_ROWS = [
  'OOOOOOMMM',
  'OOOOOOMMM',
  'OOOOOMMMM',
  'OOOOOMMMM',
  'DDOOOOOOO',
  'DDDOOOOOO',
  'DDDDOOOOO',
  'DDDDDOOOO',
  'DDDDDDOOO',
];
const ROOM_BY_LETTER: Record<string, string> = { O: 'openspace', M: 'meeting', D: 'director' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'director-rug' } : cell));

const people: Person[] = [
  { id: 'aleksey', name: 'Алексей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'beata', name: 'Беата', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vsevolod', name: 'Всеволод', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'gelena', name: 'Гелена', initialLetter: 'Г', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: true },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#8a5a3a', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'hristian', name: 'Христиан', initialLetter: 'Х', gender: 'male', color: '#e0a94a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  esenia: cellId(0, 2),
  zhdan: cellId(1, 7),
  beata: cellId(2, 4),
  demyan: cellId(3, 0),
  zoya: cellId(4, 8),
  vsevolod: cellId(5, 3),
  gelena: cellId(6, 1),
  aleksey: cellId(7, 6),
  hristian: cellId(8, 5),
};

const clues: Clue[] = [
  {
    id: 'z1',
    type: 'roomMembership',
    subject: { type: 'person', id: 'esenia' },
    roomId: 'openspace',
    text: 'Есения находилась в опенспейсе.',
  },
  {
    id: 'z2',
    type: 'wallSide',
    subject: { type: 'person', id: 'esenia' },
    wallDirection: 'north',
    text: 'Есения находилась у северной стены своей зоны.',
  },
  {
    id: 'z3',
    type: 'adjacency',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'plant',
    text: 'Есения находилась рядом с растением.',
  },
  {
    id: 'z5',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'beata',
    axis: 'row',
    direction: 'before',
    text: 'Ждан находился севернее Беаты.',
  },
  {
    id: 'z6',
    type: 'roomSize',
    subject: { type: 'person', id: 'zhdan' },
    comparison: 'smallest',
    text: 'Ждан находился в самой маленькой зоне офиса.',
  },
  {
    id: 'z7',
    type: 'roomMembership',
    subject: { type: 'person', id: 'beata' },
    roomId: 'openspace',
    text: 'Беата находилась в опенспейсе.',
  },
  {
    id: 'z8',
    type: 'wallSide',
    subject: { type: 'person', id: 'beata' },
    wallDirection: 'east',
    text: 'Беата находилась у восточной стены своей зоны.',
  },
  {
    id: 'z9',
    type: 'corner',
    subject: { type: 'person', id: 'demyan' },
    text: 'Демьян находился в углу своей зоны.',
  },
  {
    id: 'z10',
    type: 'adjacency',
    subject: { type: 'person', id: 'demyan' },
    itemTypeId: 'computer',
    text: 'Демьян находился рядом с компьютером.',
  },
  {
    id: 'z11',
    type: 'wallSide',
    subject: { type: 'person', id: 'demyan' },
    wallDirection: 'west',
    text: 'Демьян находился у западной стены своей зоны.',
  },
  {
    id: 'z12',
    type: 'corner',
    subject: { type: 'person', id: 'zoya' },
    text: 'Зоя находилась в углу своей зоны.',
  },
  {
    id: 'z13',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'beata',
    axis: 'col',
    direction: 'after',
    text: 'Зоя находилась восточнее Беаты.',
  },
  {
    id: 'z14',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vsevolod' },
    roomId: 'openspace',
    text: 'Всеволод находился в опенспейсе.',
  },
  {
    id: 'z15',
    type: 'corner',
    subject: { type: 'person', id: 'vsevolod' },
    text: 'Всеволод находился в углу своей зоны.',
  },
  {
    id: 'z16',
    type: 'adjacency',
    subject: { type: 'person', id: 'vsevolod' },
    itemTypeId: 'workbench',
    text: 'Всеволод находился рядом со столом переговоров.',
  },
  {
    id: 'z17',
    type: 'floorFeature',
    subject: { type: 'person', id: 'gelena' },
    featureId: 'director-rug',
    text: 'Гелена находилась на ковре.',
  },
  {
    id: 'z18',
    type: 'adjacency',
    subject: { type: 'person', id: 'aleksey' },
    itemTypeId: 'watercooler',
    text: 'Алексей находился рядом с кулером с водой.',
  },
  {
    id: 'z19',
    type: 'parity',
    subject: { type: 'person', id: 'aleksey' },
    axis: 'row',
    parity: 'even',
    text: 'Алексей находился в ряду с чётным номером.',
  },
  {
    id: 'z20',
    type: 'itemTypeGender',
    itemTypeId: 'chair',
    gender: 'female',
    text: 'Мужчины не садились на стулья.',
  },
  {
    id: 'z21',
    type: 'roomOccupancy',
    text: 'Ни одна зона офиса не осталась пустой.',
  },
];

// Баланс типов без исключения держит общая клю z21 (roomOccupancy): 20 клю, adjacency 4/20 = 20%
// — на границе потолка (сравнение строгое).
export const officeLevel: Level = {
  meta: { id: 'office-01', title: 'Сверхурочные в офисе', theme: 'office', difficulty: 7, maxFullyPinnedPeople: 0 },
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
