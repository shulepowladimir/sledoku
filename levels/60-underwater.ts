import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11;
const cols = 10;

const rooms: Room[] = [
  { id: 'surface', name: 'Поверхность', floorTexture: 'sky' },
  { id: 'ocean', name: 'Открытая вода', floorTexture: 'water' },
  { id: 'shipwreck', name: 'Затонувший корабль', floorTexture: 'wood' },
  { id: 'reef', name: 'Коралловый риф', floorTexture: 'coral' },
  { id: 'seabed', name: 'Морское дно', floorTexture: 'sand' },
];

const ROOM_ROWS = [
  'VVVVVVVVVV',
  'VVOOOOVVOO',
  'OOOOOOOOOO',
  'KKKKKKOOPP',
  'KKKKKOOOOP',
  'KKKKKOOPOP',
  'KKKKOOOPOP',
  'KKKOOOOPOP',
  'KKOOOOPPOP',
  'DDDDOOPPPP',
  'DDDDDDDDDD',
];

const ROOM_BY_CODE: Record<string, string> = {
  V: 'surface',
  O: 'ocean',
  K: 'shipwreck',
  P: 'reef',
  D: 'seabed',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_CODE[ROOM_ROWS[row][col]];
}

const itemTypes: ItemType[] = [
  { ...ItemLibrary.boat('Лодка'), kind: 'occupiable' },
  ItemLibrary.lifebuoy(),
  { id: 'fish', label: 'Рыба', kind: 'decorative', icon: 'fish', render: 'span' },
  ItemLibrary.shell(),
  ItemLibrary.cannon(),
  ItemLibrary.barrel(),
  ItemLibrary.wheel(),
  ItemLibrary.chest('Сундук сокровищ'),
  { id: 'crab', label: 'Краб', kind: 'decorative', icon: 'crab' },
  ItemLibrary.bottle(),
  { id: 'seaweed', label: 'Водоросли', kind: 'decorative', icon: 'seaweed', render: 'tile', tileEdgeDepth: false },
];

const items: Item[] = [
  { id: 'boat', typeId: 'boat', cells: [cellId(0, 4), cellId(0, 5)] },
  { id: 'buoy-surface', typeId: 'lifebuoy', cells: [cellId(1, 1)] },
  { id: 'buoy-ocean', typeId: 'lifebuoy', cells: [cellId(6, 5)] },
  { id: 'buoy-shipwreck', typeId: 'lifebuoy', cells: [cellId(7, 0)] },
  { id: 'fish-1', typeId: 'fish', cells: [cellId(2, 3)] },
  { id: 'fish-2', typeId: 'fish', cells: [cellId(2, 8)] },
  { id: 'fish-3', typeId: 'fish', cells: [cellId(4, 6)] },
  { id: 'fish-4', typeId: 'fish', cells: [cellId(8, 4)] },
  { id: 'shell-1', typeId: 'shell', cells: [cellId(2, 5)] },
  { id: 'shell-2', typeId: 'shell', cells: [cellId(10, 0)] },
  { id: 'shell-3', typeId: 'shell', cells: [cellId(10, 4)] },
  { id: 'cannon-1', typeId: 'cannon', cells: [cellId(3, 1), cellId(3, 2)] },
  { id: 'cannon-2', typeId: 'cannon', cells: [cellId(3, 4), cellId(3, 5)] },
  { id: 'barrel-1', typeId: 'barrel', cells: [cellId(4, 4)] },
  { id: 'barrel-2', typeId: 'barrel', cells: [cellId(8, 0)] },
  { id: 'barrel-3', typeId: 'barrel', cells: [cellId(9, 5)] },
  { id: 'wheel', typeId: 'wheel', cells: [cellId(5, 0)] },
  { id: 'treasure-chest', typeId: 'chest', cells: [cellId(5, 2), cellId(5, 3)] },
  { id: 'crab-1', typeId: 'crab', cells: [cellId(4, 9)] },
  { id: 'crab-2', typeId: 'crab', cells: [cellId(6, 7)] },
  { id: 'crab-3', typeId: 'crab', cells: [cellId(9, 2)] },
  { id: 'crab-4', typeId: 'crab', cells: [cellId(10, 8)] },
  { id: 'message-bottle', typeId: 'bottle', cells: [cellId(9, 1)] },
  { id: 'seaweed-1', typeId: 'seaweed', cells: [cellId(0, 9), cellId(1, 9)] },
  { id: 'seaweed-2', typeId: 'seaweed', cells: [cellId(2, 0), cellId(3, 0)] },
  { id: 'seaweed-3', typeId: 'seaweed', cells: [cellId(6, 6), cellId(7, 6), cellId(8, 6)] },
  { id: 'seaweed-4', typeId: 'seaweed', cells: [cellId(5, 8), cellId(6, 8), cellId(6, 9)] },
];

const floorFeatures: FloorFeature[] = [
  { id: 'breach', label: 'Пробоина', textureKey: 'water' },
];

const featureCells = new Set([cellId(5, 1), cellId(6, 1)]);
const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols)
  .map((cell) => featureCells.has(cell.id) ? { ...cell, floorFeatureId: 'breach' } : cell);

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: true },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anfisa: cellId(10, 1),
  boris: cellId(2, 2),
  vladimir: cellId(1, 5),
  galina: cellId(5, 9),
  demyan: cellId(3, 6),
  esenia: cellId(4, 8),
  zhanna: cellId(7, 0),
  zoya: cellId(9, 4),
  igor: cellId(6, 3),
  khariton: cellId(8, 7),
};

const clues: Clue[] = [
  {
    id: 'underwater-exactly-one-empty-zone',
    type: 'zoneExactlyOneEmpty',
    roomIds: ['surface', 'seabed'],
    text: 'Пустой осталась ровно одна из двух зон: поверхность или морское дно.',
  },
  {
    id: 'underwater-anfisa-shell',
    type: 'adjacency',
    subject: { type: 'person', id: 'anfisa' },
    itemTypeId: 'shell',
    text: 'Анфиса находилась рядом с ракушкой.',
  },
  {
    id: 'underwater-boris-fish',
    type: 'adjacency',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'fish',
    text: 'Борис находился рядом с рыбой.',
  },
  {
    id: 'underwater-boris-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'row',
    parity: 'odd',
    text: 'Борис находился в нечётном ряду.',
  },
  {
    id: 'underwater-boris-column-parity',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'col',
    parity: 'odd',
    text: 'Борис находился в нечётном столбце.',
  },
  {
    id: 'underwater-vladimir-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'vladimir' },
    wallDirection: 'north',
    text: 'Владимир находился у северной стены своей зоны.',
  },
  {
    id: 'underwater-vladimir-water',
    type: 'floorTexture',
    subject: { type: 'person', id: 'vladimir' },
    textureKey: 'water',
    text: 'Владимир находился в воде.',
  },
  {
    id: 'underwater-demyan-ocean',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demyan' },
    roomId: 'ocean',
    text: 'Демьян был в открытой воде.',
  },
  {
    id: 'underwater-demyan-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'demyan' },
    axis: 'row',
    parity: 'even',
    text: 'Демьян находился в чётном ряду.',
  },
  {
    id: 'underwater-esenia-reef-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'esenia' },
    roomId: 'ocean',
    otherRoomId: 'reef',
    text: 'Есения находилась на границе открытой воды и рифа.',
  },
  {
    id: 'underwater-esenia-demyan',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'demyan',
    axis: 'row',
    direction: 'after',
    text: 'Есения находилась южнее Демьяна.',
  },
  {
    id: 'underwater-galina-crab-room',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'seaweed',
    text: 'Галина находилась рядом с водорослями.',
  },
  {
    id: 'underwater-galina-esenia',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'esenia',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Галина находилась на один ряд южнее Есении.',
  },
  {
    id: 'underwater-galina-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'galina' },
    wallDirection: 'east',
    text: 'Галина находилась у восточной стены своей зоны.',
  },
  {
    id: 'underwater-zhanna-buoy',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'lifebuoy',
    text: 'Жанна находилась на спасательном круге.',
  },
  {
    id: 'underwater-zhanna-igor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'boris',
    axis: 'col',
    direction: 'before',
    text: 'Жанна находилась западнее Бориса.',
  },
  {
    id: 'underwater-zoya-water',
    type: 'floorTexture',
    subject: { type: 'person', id: 'zoya' },
    textureKey: 'water',
    text: 'Зоя находилась в воде.',
  },
  {
    id: 'underwater-zoya-east-igor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'igor',
    axis: 'col',
    direction: 'after',
    text: 'Зоя находилась восточнее Игоря.',
  },
  {
    id: 'underwater-zoya-seabed-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'ocean',
    otherRoomId: 'seabed',
    text: 'Зоя находилась на границе открытой воды и морского дна.',
  },
  {
    id: 'underwater-igor-ocean-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'igor' },
    roomId: 'shipwreck',
    otherRoomId: 'ocean',
    text: 'Игорь находился на границе корабля и открытой воды.',
  },
];

export const underwaterLevel: Level = {
  meta: {
    id: 'underwater-01',
    title: 'Пошло ко дну',
    theme: 'underwater',
    difficulty: 8,
    menuTag: 'hard',
    maxFullyPinnedPeople: 0,
  },
  size,
  cols,
  rooms,
  itemTypes,
  items,
  floorFeatures,
  cells,
  people,
  solution,
  clues,
};
