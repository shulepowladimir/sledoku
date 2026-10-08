import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';

const size = 8;

const rooms: Room[] = [
  { id: 'white-side', name: 'Сторона белых', floorTexture: 'marble' },
  { id: 'black-side', name: 'Сторона чёрных', floorTexture: 'marble' },
  { id: 'left-board', name: 'Левая часть доски', floorTexture: 'marble' },
  { id: 'right-board', name: 'Правая часть доски', floorTexture: 'marble' },
];

function roomForCell(row: number, col: number): string {
  if (row < 2) return 'white-side';
  if (row >= 6) return 'black-side';
  return col < 4 ? 'left-board' : 'right-board';
}

const WHITE = '#F5E9D0';
const BLACK = '#1A1A1A';

const itemTypes: ItemType[] = [
  { id: 'whiteKing', label: 'Белый король', kind: 'decorative', icon: 'chessKing', iconColor: WHITE },
  { id: 'blackKing', label: 'Чёрный король', kind: 'decorative', icon: 'chessKing', iconColor: BLACK },
  { id: 'whiteQueen', label: 'Белый ферзь', kind: 'decorative', icon: 'chessQueen', iconColor: WHITE },
  { id: 'blackQueen', label: 'Чёрный ферзь', kind: 'decorative', icon: 'chessQueen', iconColor: BLACK },
  { id: 'whiteRook', label: 'Белая ладья', kind: 'decorative', icon: 'chessRook', iconColor: WHITE },
  { id: 'blackRook', label: 'Чёрная ладья', kind: 'decorative', icon: 'chessRook', iconColor: BLACK },
  { id: 'whiteKnight', label: 'Белый конь', kind: 'decorative', icon: 'chessKnight', iconColor: WHITE },
  { id: 'blackKnight', label: 'Чёрный конь', kind: 'decorative', icon: 'chessKnight', iconColor: BLACK },
  { id: 'whitePawn', label: 'Белая пешка', kind: 'decorative', icon: 'chessPawn', iconColor: WHITE },
  { id: 'blackPawn', label: 'Чёрная пешка', kind: 'decorative', icon: 'chessPawn', iconColor: BLACK },
];

const itemPlacements: { id: string; typeId: string; row: number; col: number }[] = [
  { id: 'chess-white-king', typeId: 'whiteKing', row: 0, col: 3 },
  { id: 'chess-white-knight', typeId: 'whiteKnight', row: 0, col: 6 },
  { id: 'chess-white-pawn-1', typeId: 'whitePawn', row: 1, col: 1 },
  { id: 'chess-white-pawn-2', typeId: 'whitePawn', row: 1, col: 5 },
  { id: 'chess-white-pawn-3', typeId: 'whitePawn', row: 2, col: 6 },
  { id: 'chess-white-pawn-4', typeId: 'whitePawn', row: 3, col: 3 },
  { id: 'chess-white-pawn-5', typeId: 'whitePawn', row: 3, col: 4 },
  { id: 'chess-white-rook', typeId: 'whiteRook', row: 5, col: 0 },
  { id: 'chess-black-knight', typeId: 'blackKnight', row: 2, col: 1 },
  { id: 'chess-black-pawn-1', typeId: 'blackPawn', row: 4, col: 7 },
  { id: 'chess-black-pawn-2', typeId: 'blackPawn', row: 5, col: 1 },
  { id: 'chess-black-pawn-3', typeId: 'blackPawn', row: 6, col: 0 },
  { id: 'chess-black-pawn-4', typeId: 'blackPawn', row: 6, col: 4 },
  { id: 'chess-black-king', typeId: 'blackKing', row: 7, col: 3 },
  { id: 'chess-black-rook', typeId: 'blackRook', row: 7, col: 7 },
  { id: 'chess-black-queen', typeId: 'blackQueen', row: 3, col: 2 },
];

const items: Item[] = itemPlacements.map(({ id, typeId, row, col }) => ({
  id,
  typeId,
  cells: [cellId(row, col)],
}));
const itemIdByCell = new Map(items.map((item) => [item.cells[0], item.id]));
const cells = buildCells(size, roomForCell, (_row, _col) => undefined).map((cell) => ({
  ...cell,
  ...(cell.row % 2 === cell.col % 2 ? { floorFeatureId: 'dark-square' } : {}),
  ...(itemIdByCell.has(cell.id) ? { itemId: itemIdByCell.get(cell.id) } : {}),
}));

const people: Person[] = [
  { id: 'anastasia', name: 'Анастасия', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'gleb', name: 'Глеб', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: true },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'hariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anastasia: cellId(5, 3),
  boris: cellId(2, 4),
  vera: cellId(3, 7),
  gleb: cellId(6, 6),
  dina: cellId(1, 2),
  egor: cellId(4, 5),
  zhanna: cellId(7, 0),
  hariton: cellId(0, 1),
};

const clues: Clue[] = [
  {
    id: 'chess-square-color-groups',
    type: 'floorFeatureCohorts',
    groups: [
      { personIds: ['anastasia', 'boris', 'vera', 'gleb'], featureId: 'dark-square' },
      { personIds: ['dina', 'egor', 'zhanna', 'hariton'], featureId: 'dark-square', negated: true },
    ],
    text: 'Все с А по Г стояли на тёмных клетках, остальные - на светлых.',
  },
  {
    id: 'chess-anastasia-between-sides',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'anastasia' },
    roomId: 'left-board',
    otherRoomId: 'right-board',
    text: 'Анастасия стояла на границе левой и правой частей доски.',
  },
  {
    id: 'chess-boris-right-side',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'right-board',
    text: 'Борис находился в правой части доски.',
  },
  {
    id: 'chess-dina-west-of-boris',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dina' },
    otherPersonId: 'boris',
    axis: 'col',
    direction: 'before',
    offset: 2,
    text: 'Дина стояла на два столбца левее Бориса.',
  },
  {
    id: 'chess-vera-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'vera' },
    wallDirection: 'east',
    text: 'Вера стояла у восточного края своей зоны.',
  },
  {
    id: 'chess-vera-neighbor-of-white-side',
    type: 'zoneNeighborOf',
    subject: { type: 'person', id: 'vera' },
    roomId: 'white-side',
    text: 'Зона, где стояла Вера, граничила со Стороной белых.',
  },
  {
    id: 'chess-gleb-black-side',
    type: 'roomMembership',
    subject: { type: 'person', id: 'gleb' },
    roomId: 'black-side',
    text: 'Глеб находился на Стороне чёрных.',
  },
  {
    id: 'chess-gleb-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'gleb' },
    axis: 'row',
    parity: 'odd',
    text: 'Глеб стоял в ряду с нечётным номером.',
  },
  {
    id: 'chess-dina-white-pawn',
    type: 'adjacency',
    subject: { type: 'person', id: 'dina' },
    itemTypeId: 'whitePawn',
    text: 'Дина стояла рядом с белой пешкой.',
  },
  {
    id: 'chess-egor-east-of-dina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'egor' },
    otherPersonId: 'dina',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Егор стоял на три столбца правее Дины.',
  },
  {
    id: 'chess-egor-black-pawn-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'egor' },
    itemTypeId: 'blackPawn',
    text: 'Егор стоял в одном ряду или столбце с чёрной пешкой.',
  },
  {
    id: 'chess-zhanna-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'zhanna' },
    axis: 'row',
    parity: 'even',
    text: 'Жанна стояла в ряду с чётным номером.',
  },
];

const level: Level = {
  meta: {
    id: 'chess-01',
    title: 'Мат в 8 ходов',
    theme: 'chess',
    difficulty: 8,
    maxFullyPinnedPeople: 0,
    menuTag: 'hard',
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [{ id: 'dark-square', label: 'Тёмная клетка', textureKey: 'asphalt' }],
  cells,
  people,
  solution,
  clues,
};

export const chessLevel = level;
