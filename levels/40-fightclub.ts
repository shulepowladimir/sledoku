import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 8;

// «Восьмой раунд»: подпольный бойцовский клуб в подвале. Финальный бой —
// жертва-боец Харитон погиб на ринге. Твист: судья и есть убийца — игрок
// выводит это из цепочки «на ринге ровно двое» + «судья у ринга» + инварианта
// «жертва наедине с убийцей», не зная заранее, кто судья.
const rooms: Room[] = [
  { id: 'entry', name: 'Вход и коридор', floorTexture: 'concrete' },
  { id: 'bar', name: 'Бар', floorTexture: 'linoleum' },
  { id: 'lockerRoom', name: 'Раздевалка', floorTexture: 'wood' },
  { id: 'ring', name: 'Ринг', floorTexture: 'checker' },
  { id: 'gym', name: 'Тренировочный угол', floorTexture: 'concrete' },
  { id: 'stands', name: 'Трибуны', floorTexture: 'rubber' },
];

const itemTypes: ItemType[] = [
  // Уровневые (подвал клуба)
  { id: 'punchingBag', label: 'Боксёрская груша', kind: 'decorative', icon: 'punchingBag' },
  { id: 'ringCorner', label: 'Стойка ринга', kind: 'decorative', icon: 'ringCorner' },
  { id: 'boxingGloves', label: 'Боксёрские перчатки', kind: 'decorative', icon: 'boxingGloves' },
  ItemLibrary.locker(),
  // Библиотечные
  ItemLibrary.seat(),
  ItemLibrary.bench(),
  ItemLibrary.table(),
  ItemLibrary.cup(),
  ItemLibrary.trashcan(),
  ItemLibrary.clock(),
  ItemLibrary.treadmill('Беговая дорожка'),
  ItemLibrary.watercooler(),
];

const items: Item[] = [
  // — Ринг: два угла с табуретами секундантов (2кл occupiable) —
  { id: 'item-corner-1', typeId: 'ringCorner', cells: [cellId(2, 2), cellId(2, 3)] },
  { id: 'item-corner-2', typeId: 'ringCorner', cells: [cellId(4, 3), cellId(4, 4)] },
  // — Трибуны: ряды сидений + скамья —
  { id: 'item-seat-1', typeId: 'seat', cells: [cellId(5, 0)] },
  { id: 'item-seat-2', typeId: 'seat', cells: [cellId(5, 2)] },
  { id: 'item-seat-3', typeId: 'seat', cells: [cellId(5, 4)] },
  { id: 'item-seat-4', typeId: 'seat', cells: [cellId(6, 1)] },
  { id: 'item-seat-5', typeId: 'seat', cells: [cellId(6, 5)] },
  { id: 'item-seat-6', typeId: 'seat', cells: [cellId(6, 7)] },
  { id: 'item-bench-s', typeId: 'bench', cells: [cellId(7, 3), cellId(7, 4)] },
  // — Раздевалка: шкафчики и перчатки —
  { id: 'item-locker-1', typeId: 'locker', cells: [cellId(2, 0)] },
  { id: 'item-locker-2', typeId: 'locker', cells: [cellId(2, 1)] },
  { id: 'item-gloves', typeId: 'boxingGloves', cells: [cellId(3, 0)] },
  // — Тренировочный угол: груши, гантели, кулер —
  { id: 'item-bag-1', typeId: 'punchingBag', cells: [cellId(2, 5)] },
  { id: 'item-bag-2', typeId: 'punchingBag', cells: [cellId(2, 7)] },
  { id: 'item-treadmill-1', typeId: 'treadmill', cells: [cellId(3, 6)] },
  { id: 'item-treadmill-2', typeId: 'treadmill', cells: [cellId(4, 7)] },
  { id: 'item-cooler', typeId: 'watercooler', cells: [cellId(5, 5)] },
  // — Бар —
  { id: 'item-table-bar', typeId: 'table', cells: [cellId(1, 4)] },
  { id: 'item-cup-1', typeId: 'cup', cells: [cellId(0, 5)] },
  { id: 'item-cup-2', typeId: 'cup', cells: [cellId(0, 7)] },
  { id: 'item-trashcan-bar', typeId: 'trashcan', cells: [cellId(1, 7)] },
  // — Вход —
  { id: 'item-trashcan-e', typeId: 'trashcan', cells: [cellId(1, 0)] },
  { id: 'item-clock', typeId: 'clock', cells: [cellId(0, 3)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// e=вход, b=бар, l=раздевалка, r=ринг, g=тренажёрный, s=трибуны.
const ROOM_ROWS = [
  'eeeebbbb',
  'eeeebbbb',
  'llrrrggg',
  'llrrrggg',
  'llrrrggg',
  'sssssggg',
  'ssssssss',
  'ssssssss',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      e: 'entry',
      b: 'bar',
      l: 'lockerRoom',
      r: 'ring',
      g: 'gym',
      s: 'stands',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['veteran'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['veteran'] },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['veteran'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['judge', 'veteran'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Полная перестановка 8×8. Григорий (судья-убийца, 4,2) и Харитон (жертва-боец,
// 2,4) — вдвоём на ринге; судья южнее Жанны (3,7) — различитель миров.
const solution: Record<PersonId, CellId> = {
  andrey: cellId(7, 0),
  boris: cellId(5, 6),
  veronika: cellId(1, 5),
  grigory: cellId(4, 2),
  darya: cellId(6, 3),
  efim: cellId(0, 1),
  zhanna: cellId(3, 7),
  khariton: cellId(2, 4),
};

const clues: Clue[] = [
  // — Общие правила клуба —
  {
    id: 'fc1',
    type: 'zoneExactCount',
    roomId: 'ring',
    count: 2,
    text: 'На ринге находились ровно двое.',
  },
  {
    id: 'fc2',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Г',
    roleId: 'veteran',
    text: 'Все, чьё имя начинается с букв от А до Г, — ветераны клуба. Остальные — новички.',
  },
  {
    id: 'fc3',
    type: 'role',
    subject: { type: 'role', role: 'judge' },
    roleId: 'veteran',
    text: 'Среди ветеранов клуба был судья.',
  },
  {
    id: 'fc4',
    type: 'roomMembership',
    subject: { type: 'role', role: 'judge' },
    roomId: 'ring',
    text: 'Судья был на ринге.',
  },
  // — Личные —
  {
    id: 'fc5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'andrey' },
    roomId: 'stands',
    text: 'Андрей был на трибуне.',
  },
  {
    id: 'fc6',
    type: 'adjacency',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'watercooler',
    text: 'Борис находился рядом с кулером.',
  },
  {
    id: 'fc7',
    type: 'floorTexture',
    subject: { type: 'person', id: 'veronika' },
    textureKey: 'linoleum',
    text: 'Вероника была на линолеуме бара.',
  },
  {
    id: 'fc8',
    type: 'adjacency',
    subject: { type: 'person', id: 'grigory' },
    itemTypeId: 'ringCorner',
    text: 'Григорий находился у стойки ринга.',
  },
  {
    id: 'fc9',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'andrey',
    axis: 'row',
    direction: 'before',
    text: 'Дарья была севернее Андрея.',
  },
  {
    id: 'fc10',
    type: 'roomMembership',
    subject: { type: 'person', id: 'efim' },
    roomId: 'entry',
    text: 'Ефим дежурил во входном коридоре.',
  },
  {
    id: 'fc11',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'east',
    text: 'Жанна находилась у восточной стены.',
  },
  {
    id: 'fc12',
    type: 'floorTexture',
    subject: { type: 'person', id: 'zhanna' },
    textureKey: 'concrete',
    text: 'Жанна тренировалась на бетонном полу.',
  },
  {
    id: 'fc13',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherRole: 'judge',
    axis: 'row',
    direction: 'before',
    text: 'Жанна находилась севернее судьи.',
  },
  {
    id: 'fc14',
    type: 'parity',
    subject: { type: 'person', id: 'andrey' },
    axis: 'col',
    parity: 'odd',
    text: 'Андрей находился в нечётном столбце.',
  },
  {
    id: 'fc15',
    type: 'parity',
    subject: { type: 'person', id: 'efim' },
    axis: 'col',
    parity: 'even',
    text: 'Ефим находился в чётном столбце.',
  },
  {
    id: 'fc16',
    type: 'parity',
    subject: { type: 'person', id: 'darya' },
    axis: 'col',
    parity: 'even',
    text: 'Дарья находилась в чётном столбце.',
  },
];

const level: Level = {
  meta: {
    id: 'fightclub-01',
    title: 'Восьмой раунд',
    theme: 'fightclub',
    difficulty: 7,
    maxFullyPinnedPeople: 0,
    rosterColumnCounts: [3, 3, 2],
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

export const fightClubLevel: Level = level;
