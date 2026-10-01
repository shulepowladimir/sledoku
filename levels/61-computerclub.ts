import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 7;

const rooms: Room[] = [
  { id: 'consoleHall', name: 'Зал консолей', floorTexture: 'rubber' },
  { id: 'vip', name: 'VIP-зал', floorTexture: 'carpet' },
  { id: 'retro', name: 'Ретро-зал', floorTexture: 'wood' },
  { id: 'common', name: 'Общий зал', floorTexture: 'linoleum' },
  { id: 'lobby', name: 'Лобби', floorTexture: 'tile' },
];

const ROOM_ROWS = [
  'KKKVVVV',
  'KKKRRVV',
  'KKRRRRV',
  'KKORRVV',
  'OOOOLLL',
  'OOOLLLL',
  'OOOLLLL',
];

const ROOM_BY_CODE: Record<string, string> = {
  K: 'consoleHall',
  V: 'vip',
  R: 'retro',
  O: 'common',
  L: 'lobby',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_CODE[ROOM_ROWS[row][col]];
}

const itemTypes: ItemType[] = [
  { ...ItemLibrary.computer('Игровой компьютер'), kind: 'occupiable' },
  { id: 'consoleSetup', label: 'Игровая приставка', kind: 'occupiable', icon: 'consoleSetup' },
  { id: 'arcadeCabinet', label: 'Аркадный автомат', kind: 'decorative', icon: 'arcadeCabinet' },
  ItemLibrary.sofa(),
  ItemLibrary.kassa('Стойка администратора'),
];

const items: Item[] = [
  { id: 'computer-common-1', typeId: 'computer', cells: [cellId(3, 2)] },
  { id: 'computer-common-2', typeId: 'computer', cells: [cellId(4, 0)] },
  { id: 'computer-common-3', typeId: 'computer', cells: [cellId(5, 2)] },
  { id: 'computer-common-4', typeId: 'computer', cells: [cellId(6, 0)] },
  { id: 'computer-vip-1', typeId: 'computer', cells: [cellId(0, 3)] },
  { id: 'computer-vip-2', typeId: 'computer', cells: [cellId(1, 5)] },
  { id: 'console-hall-1', typeId: 'consoleSetup', cells: [cellId(0, 1)] },
  { id: 'console-hall-2', typeId: 'consoleSetup', cells: [cellId(1, 0)] },
  { id: 'console-hall-3', typeId: 'consoleSetup', cells: [cellId(3, 1)] },
  { id: 'console-hall-4', typeId: 'consoleSetup', cells: [cellId(0, 0)] },
  { id: 'console-vip-1', typeId: 'consoleSetup', cells: [cellId(0, 4)] },
  { id: 'console-vip-2', typeId: 'consoleSetup', cells: [cellId(3, 6)] },
  { id: 'arcade-retro-1', typeId: 'arcadeCabinet', cells: [cellId(1, 4)] },
  { id: 'arcade-retro-2', typeId: 'arcadeCabinet', cells: [cellId(2, 5)] },
  { id: 'arcade-retro-3', typeId: 'arcadeCabinet', cells: [cellId(3, 3)] },
  { id: 'sofa-vip-1', typeId: 'sofa', cells: [cellId(1, 6), cellId(2, 6)] },
  { id: 'sofa-vip-2', typeId: 'sofa', cells: [cellId(3, 5)] },
  { id: 'sofa-lobby-1', typeId: 'sofa', cells: [cellId(4, 4), cellId(4, 5)] },
  { id: 'sofa-lobby-2', typeId: 'sofa', cells: [cellId(6, 3), cellId(6, 4)] },
  { id: 'reception', typeId: 'kassa', cells: [cellId(5, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'alina', name: 'Алина', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: true },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'kharita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#e0a94a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  alina: cellId(0, 0),
  boris: cellId(3, 5),
  vera: cellId(5, 2),
  galina: cellId(4, 6),
  darya: cellId(2, 4),
  esenia: cellId(6, 1),
  kharita: cellId(1, 3),
};

const clues: Clue[] = [
  { id: 'cc-room-occupancy', type: 'roomOccupancy', text: 'Во всех залах клуба кто-то был.' },
  { id: 'cc-vip-single-guest', type: 'zoneExactCount', roomId: 'vip', count: 1, text: 'В VIP-зале был только один посетитель.' },
  {
    id: 'cc-alina-console',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'alina' },
    itemTypeId: 'consoleSetup',
    text: 'Алина играла на приставке.',
  },
  {
    id: 'cc-boris-sofa',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'sofa',
    text: 'Борис сидел на диване.',
  },
  {
    id: 'cc-vera-computer',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'vera' },
    itemTypeId: 'computer',
    text: 'Вера сидела за компьютером.',
  },
  {
    id: 'cc-galina-north-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'vera',
    axis: 'row',
    direction: 'before',
    text: 'Галина находилась севернее Веры.',
  },
  {
    id: 'cc-galina-kassa',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'kassa',
    text: 'Галина находилась рядом со стойкой администратора.',
  },
  {
    id: 'cc-darya-arcade',
    type: 'adjacency',
    subject: { type: 'person', id: 'darya' },
    itemTypeId: 'arcadeCabinet',
    text: 'Дарья находилась рядом с игровым автоматом.',
  },
  {
    id: 'cc-darya-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'darya' },
    axis: 'row',
    parity: 'odd',
    text: 'Дарья находилась в нечётном ряду.',
  },
  {
    id: 'cc-esenia-computer',
    type: 'adjacency',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'computer',
    text: 'Есения находилась рядом с компьютером.',
  },
  {
    id: 'cc-esenia-odd-col',
    type: 'parity',
    subject: { type: 'person', id: 'esenia' },
    axis: 'col',
    parity: 'even',
    text: 'Есения находилась в чётном столбце.',
  },
  {
    id: 'cc-esenia-south-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'vera',
    axis: 'row',
    direction: 'after',
    text: 'Есения находилась южнее Веры.',
  },
];

export const computerClubLevel: Level = {
  meta: {
    id: 'computerclub-01',
    title: 'Убойная катка',
    theme: 'computerclub',
    difficulty: 7,
    maxFullyPinnedPeople: 0,
  },
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
