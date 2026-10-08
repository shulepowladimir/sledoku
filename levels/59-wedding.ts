import type { Clue } from '../src/types/clue';
import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;

const rooms: Room[] = [
  { id: 'west', name: 'Западный двор', floorTexture: 'grass' },
  { id: 'altar', name: 'Место церемонии', floorTexture: 'marble' },
  { id: 'east', name: 'Восточный двор', floorTexture: 'grass' },
  { id: 'guests', name: 'Гостевая зона', floorTexture: 'wood' },
  { id: 'aisle', name: 'Проход', floorTexture: 'carpet' },
  { id: 'entrance', name: 'Вход', floorTexture: 'cobble' },
];

const ROOM_ROWS = [
  'ZZAAAAAABB',
  'ZZAAAAAABB',
  'ZZAAAAAABB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZZGGGGBBB',
  'ZZZEEEEBBB',
  'ZZZEEEEBBB',
];

const ROOM_BY_CODE: Record<string, string> = {
  Z: 'west',
  A: 'altar',
  B: 'east',
  G: 'guests',
  D: 'aisle',
  E: 'entrance',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_CODE[ROOM_ROWS[row][col]];
}

const floorFeatures: FloorFeature[] = [
  { id: 'ceremony-rug', label: 'Ковровая дорожка', textureKey: 'carpet' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.tree(),
  ItemLibrary.broadleafTree(),
  ItemLibrary.speaker(),
  ItemLibrary.chair(),
  ItemLibrary.flowerVase(),
  ItemLibrary.roseBush('Куст роз'),
  ItemLibrary.bushHedge('Кустарник'),
  ItemLibrary.flowerArch(),
  ItemLibrary.weddingCake(),
];

const items: Item[] = [
  { id: 'fir-west-north', typeId: 'tree', cells: [cellId(1, 0)] },
  { id: 'fir-east-north', typeId: 'tree', cells: [cellId(2, 9)] },
  { id: 'fir-east-center', typeId: 'tree', cells: [cellId(4, 8)] },
  { id: 'fir-west-south', typeId: 'tree', cells: [cellId(8, 1)] },
  { id: 'broadleaf-west', typeId: 'broadleafTree', cells: [cellId(3, 1)] },
  { id: 'broadleaf-east', typeId: 'broadleafTree', cells: [cellId(6, 9)] },
  { id: 'rose-altar-west', typeId: 'roseBush', cells: [cellId(1, 2)] },
  { id: 'rose-altar-east', typeId: 'roseBush', cells: [cellId(1, 7)] },
  { id: 'rose-guests', typeId: 'roseBush', cells: [cellId(6, 3)] },
  { id: 'rose-east-south', typeId: 'roseBush', cells: [cellId(9, 8)] },
  { id: 'vase-altar-east', typeId: 'flowerVase', cells: [cellId(3, 7)] },
  { id: 'vase-guests', typeId: 'flowerVase', cells: [cellId(7, 4)] },
  { id: 'vase-east-south', typeId: 'flowerVase', cells: [cellId(9, 3)] },
  { id: 'vase-west-south', typeId: 'flowerVase', cells: [cellId(9, 0)] },
  { id: 'vase-east-north', typeId: 'flowerVase', cells: [cellId(0, 9)] },
  { id: 'flower-arch', typeId: 'flowerArch', cells: [cellId(1, 4), cellId(1, 5)] },
  { id: 'wedding-cake', typeId: 'weddingCake', cells: [cellId(8, 5), cellId(8, 6)] },
  { id: 'speaker-west', typeId: 'speaker', cells: [cellId(3, 3)] },
  { id: 'speaker-east', typeId: 'speaker', cells: [cellId(3, 6)] },
  { id: 'hedge-west', typeId: 'bushHedge', cells: [cellId(3, 0), cellId(4, 0)] },
  { id: 'hedge-east', typeId: 'bushHedge', cells: [cellId(8, 7), cellId(9, 7)] },
  { id: 'chair-1', typeId: 'chair', cells: [cellId(4, 2)] },
  { id: 'chair-2', typeId: 'chair', cells: [cellId(4, 3)] },
  { id: 'chair-3', typeId: 'chair', cells: [cellId(4, 6)] },
  { id: 'chair-4', typeId: 'chair', cells: [cellId(4, 7)] },
  { id: 'chair-5', typeId: 'chair', cells: [cellId(5, 2)] },
  { id: 'chair-6', typeId: 'chair', cells: [cellId(5, 3)] },
  { id: 'chair-7', typeId: 'chair', cells: [cellId(5, 6)] },
  { id: 'chair-8', typeId: 'chair', cells: [cellId(5, 7)] },
  { id: 'chair-9', typeId: 'chair', cells: [cellId(6, 2)] },
  { id: 'chair-10', typeId: 'chair', cells: [cellId(6, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const rugCells = new Set([cellId(2, 4), cellId(2, 5), cellId(7, 4), cellId(7, 5)]);
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => (
  rugCells.has(cell.id) ? { ...cell, floorFeatureId: 'ceremony-rug' } : cell
));

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: true, roles: ['bride'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false, roles: ['groom'] },
];

const solution: Record<PersonId, CellId> = {
  anfisa: cellId(3, 4),
  boris: cellId(8, 8),
  vladimir: cellId(7, 1),
  galina: cellId(1, 9),
  demyan: cellId(9, 5),
  esenia: cellId(4, 2),
  zhanna: cellId(6, 0),
  zoya: cellId(0, 6),
  igor: cellId(5, 7),
  khariton: cellId(2, 3),
};

const clues: Clue[] = [
  {
    id: 'wedding-ceremony-count',
    type: 'zoneExactCount',
    roomId: 'altar',
    count: 2,
    text: 'На месте церемонии находились ровно двое.',
  },
  {
    id: 'wedding-two-seated',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'chair',
    vacancies: 8,
    text: 'Занятыми были ровно 2 стула.',
  },
  {
    id: 'wedding-couple-symmetry',
    type: 'symmetricPosition',
    subject: { type: 'role', role: 'bride' },
    other: { type: 'role', role: 'groom' },
    anchorItemId: 'flower-arch',
    subjectGender: 'female',
    otherGender: 'male',
    text: 'Невеста и жених находились симметрично относительно центра цветочной арки.',
  },
  {
    id: 'wedding-bride-north-wall',
    type: 'wallSide',
    subject: { type: 'role', role: 'bride' },
    wallDirection: 'north',
    text: 'Невеста находилась у северной стены.',
  },
  {
    id: 'wedding-anfisa-aisle',
    type: 'roomMembership',
    subject: { type: 'person', id: 'anfisa' },
    roomId: 'aisle',
    text: 'Анфиса находилась на проходе.',
  },
  {
    id: 'wedding-boris-rose',
    type: 'adjacency',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'roseBush',
    text: 'Борис находился рядом с кустом роз.',
  },
  {
    id: 'wedding-vladimir-tree',
    type: 'adjacency',
    subject: { type: 'person', id: 'vladimir' },
    itemTypeId: 'tree',
    text: 'Владимир находился рядом с елью.',
  },
  {
    id: 'wedding-galina-tree',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'tree',
    text: 'Галина находилась рядом с елью.',
  },
  {
    id: 'wedding-galina-vase',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'flowerVase',
    text: 'Галина находилась рядом с вазой.',
  },
  {
    id: 'wedding-demyan-entrance',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demyan' },
    roomId: 'entrance',
    text: 'Демьян находился на входе.',
  },
  {
    id: 'wedding-esenia-west-anfisa',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'anfisa',
    axis: 'col',
    direction: 'before',
    offset: 2,
    text: 'Есения находилась на два столбца западнее Анфисы.',
  },
  {
    id: 'wedding-zhanna-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'west',
    text: 'Жанна находилась у западной стены.',
  },
  {
    id: 'wedding-zhanna-west-igor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'igor',
    axis: 'col',
    direction: 'before',
    offset: 7,
    text: 'Жанна находилась на семь столбцов западнее Игоря.',
  },
  {
    id: 'wedding-zoya-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zoya' },
    wallDirection: 'north',
    text: 'Зоя находилась у северной стены.',
  },
  {
    id: 'wedding-zoya-odd-column',
    type: 'parity',
    subject: { type: 'person', id: 'zoya' },
    axis: 'col',
    parity: 'odd',
    text: 'Зоя находилась в нечётном столбце.',
  },
  {
    id: 'wedding-igor-guests',
    type: 'roomMembership',
    subject: { type: 'person', id: 'igor' },
    roomId: 'guests',
    text: 'Игорь находился в гостевой зоне.',
  },
  {
    id: 'wedding-igor-north-vladimir',
    type: 'relativePosition',
    subject: { type: 'person', id: 'igor' },
    otherPersonId: 'vladimir',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Игорь находился на два ряда севернее Владимира.',
  },
];

export const weddingLevel: Level = {
  meta: {
    id: 'wedding-01',
    title: 'Горько!',
    theme: 'wedding',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    menuTag: 'hard',
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
