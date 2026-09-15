import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11;

// «Всё на зеро»: казино после закрытия. Север — бар и денежное хранилище,
// запад — зал игровых автоматов (рваные ряды с проходами), центр — холл,
// восток — комната охраны, юг — карточный зал, зал рулетки и кассы.
const rooms: Room[] = [
  { id: 'bar', name: 'Бар', floorTexture: 'wood' },
  { id: 'vault', name: 'Денежное хранилище', floorTexture: 'metal' },
  { id: 'hall', name: 'Холл', floorTexture: 'carpet' },
  { id: 'slots', name: 'Зал игровых автоматов', floorTexture: 'tile' },
  { id: 'security', name: 'Комната охраны', floorTexture: 'concrete' },
  { id: 'cards', name: 'Карточный зал', floorTexture: 'rug' },
  { id: 'roulette', name: 'Зал рулетки', floorTexture: 'marble' },
  { id: 'cage', name: 'Кассы', floorTexture: 'linoleum' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'entrance', label: 'Вход', textureKey: 'checker' },
];
const ENTRANCE_CELLS = new Set([cellId(10, 2), cellId(10, 3)]);

const itemTypes: ItemType[] = [
  ItemLibrary.slotMachine(),
  ItemLibrary.rouletteTable(),
  ItemLibrary.pokerTable(),
  ItemLibrary.kassa(),
  ItemLibrary.safe(),
  ItemLibrary.billiardTable(),
  { id: 'sculpture', label: 'Скульптура', kind: 'decorative', icon: 'sculpture' },
  ItemLibrary.barCounter(),
  ItemLibrary.barStool(),
  ItemLibrary.piano(),
  ItemLibrary.camera(),
  ItemLibrary.clock(),
  ItemLibrary.portrait(),
  ItemLibrary.palm(),
  ItemLibrary.armchair(),
  ItemLibrary.table(),
  ItemLibrary.tv(),
];

const items: Item[] = [
  // Бар: стойка, табуреты, пианино, портрет, часы
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-stool-1', typeId: 'barStool', cells: [cellId(1, 0)] },
  { id: 'item-stool-2', typeId: 'barStool', cells: [cellId(1, 1)] },
  { id: 'item-piano', typeId: 'piano', cells: [cellId(2, 1)] },
  { id: 'item-portrait-bar', typeId: 'portrait', cells: [cellId(0, 2)] },
  { id: 'item-clock-bar', typeId: 'clock', cells: [cellId(2, 2)] },
  // Денежное хранилище: сейфы
  { id: 'item-safe-1', typeId: 'safe', cells: [cellId(0, 5)] },
  { id: 'item-safe-2', typeId: 'safe', cells: [cellId(1, 5)] },
  { id: 'item-safe-3', typeId: 'safe', cells: [cellId(1, 9)] },
  { id: 'item-safe-4', typeId: 'safe', cells: [cellId(2, 10)] },
  // Холл: скульптура, ресепшн, пальмы, кресла, портрет, часы
  { id: 'item-sculpture', typeId: 'sculpture', cells: [cellId(2, 5)] },
  { id: 'item-reception', typeId: 'barCounter', cells: [cellId(2, 6), cellId(2, 7)] },
  { id: 'item-palm-1', typeId: 'palm', cells: [cellId(3, 8)] },
  { id: 'item-palm-2', typeId: 'palm', cells: [cellId(9, 4)] },
  { id: 'item-armchair-1', typeId: 'armchair', cells: [cellId(4, 6)] },
  { id: 'item-armchair-2', typeId: 'armchair', cells: [cellId(9, 3)] },
  { id: 'item-portrait-hall', typeId: 'portrait', cells: [cellId(2, 4)] },
  { id: 'item-clock-hall', typeId: 'clock', cells: [cellId(3, 6)] },
  // Зал игровых автоматов: 13 машин рваными рядами с проходами
  { id: 'item-slot-1', typeId: 'slotMachine', cells: [cellId(3, 0)] },
  { id: 'item-slot-2', typeId: 'slotMachine', cells: [cellId(3, 2)] },
  { id: 'item-slot-3', typeId: 'slotMachine', cells: [cellId(3, 4)] },
  { id: 'item-slot-4', typeId: 'slotMachine', cells: [cellId(4, 1)] },
  { id: 'item-slot-5', typeId: 'slotMachine', cells: [cellId(4, 3)] },
  { id: 'item-slot-6', typeId: 'slotMachine', cells: [cellId(5, 0)] },
  { id: 'item-slot-7', typeId: 'slotMachine', cells: [cellId(5, 2)] },
  { id: 'item-slot-8', typeId: 'slotMachine', cells: [cellId(5, 4)] },
  { id: 'item-slot-9', typeId: 'slotMachine', cells: [cellId(6, 0)] },
  { id: 'item-slot-10', typeId: 'slotMachine', cells: [cellId(6, 3)] },
  { id: 'item-slot-11', typeId: 'slotMachine', cells: [cellId(7, 1)] },
  { id: 'item-slot-12', typeId: 'slotMachine', cells: [cellId(7, 3)] },
  { id: 'item-slot-13', typeId: 'slotMachine', cells: [cellId(9, 0)] },
  // Комната охраны: камеры, пульт, телевизор
  { id: 'item-camera-1', typeId: 'camera', cells: [cellId(3, 9)] },
  { id: 'item-camera-2', typeId: 'camera', cells: [cellId(5, 9)] },
  { id: 'item-security-desk', typeId: 'table', cells: [cellId(3, 10)] },
  { id: 'item-tv', typeId: 'tv', cells: [cellId(4, 10)] },
  // Карточный зал: покерный стол (1-клеточный, крупный рендер), бильярд
  { id: 'item-poker-1', typeId: 'pokerTable', cells: [cellId(7, 6)] },
  { id: 'item-billiard', typeId: 'billiardTable', cells: [cellId(6, 8), cellId(6, 9)] },
  // Зал рулетки: два стола в разных рядах и столбцах (пермутация сидельцев)
  { id: 'item-roulette-1', typeId: 'rouletteTable', cells: [cellId(8, 8), cellId(8, 9)] },
  { id: 'item-roulette-2', typeId: 'rouletteTable', cells: [cellId(9, 7), cellId(9, 8)] },
  // Кассы: кассы, часы
  { id: 'item-kassa-1', typeId: 'kassa', cells: [cellId(9, 5)] },
  { id: 'item-kassa-2', typeId: 'kassa', cells: [cellId(9, 6)] },
  { id: 'item-clock-cage', typeId: 'clock', cells: [cellId(10, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// b=бар, z=хранилище, h=холл, s=автоматы, o=охрана, k=карты, r=рулетка, d=кассы.
const ROOM_ROWS = [
  'bbbbbzzzzzz',
  'bbbbbzzzzzz',
  'bbbhhhhhhzz',
  'ssssshhhhoo',
  'ssssshhkkoo',
  'ssssshhkkoo',
  'sssshhkkkkk',
  'sssshhkkrrr',
  'sssshhrrrrr',
  'sshhhddrrrr',
  'sshhdddrrrr',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return {
    b: 'bar', z: 'vault', h: 'hall', s: 'slots', o: 'security', k: 'cards', r: 'roulette', d: 'cage',
  }[ch] ?? 'hall';
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (ENTRANCE_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'entrance' };
  return cell;
});

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'valeria', name: 'Валерия', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'efrem', name: 'Ефрем', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'zinaida', name: 'Зинаида', initialLetter: 'З', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: true, roles: ['staff'] },
  { id: 'ignat', name: 'Игнат', initialLetter: 'И', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'klara', name: 'Клара', initialLetter: 'К', gender: 'female', color: '#8f7ca8', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#e0a94a', isVictim: true, isMurderer: false, roles: ['staff'] },
];

// Пермутация 11×11: ряды 0–10 и столбцы 0–10 у всех различны.
// Гости А–Д: Артём (0,3) и Валерия (1,1) — бар; Борис (4,4), Григорий (6,2),
// Дарья (10,0) — зал автоматов. Сотрудники Е–Х: Ефрем (2,9) — хранилище,
// Жанна (5,10) — охрана, Игнат (7,6) — карточный зал, Клара (3,5) — холл,
// Зинаида (8,8, убийца) и Харитон (9,7, жертва) — зал рулетки. Оба крупье
// выводятся: Зинаиду пиннят parity-клю среди клеток столов, Харитон не
// упомянут ни в одной клю — его выводит инвариант «жертва наедине с убийцей».
const solution: Record<PersonId, CellId> = {
  artem: cellId(0, 3),
  boris: cellId(4, 4),
  valeria: cellId(1, 1),
  grigory: cellId(6, 2),
  darya: cellId(10, 0),
  efrem: cellId(2, 9),
  zhanna: cellId(5, 10),
  zinaida: cellId(8, 8),
  ignat: cellId(7, 6),
  klara: cellId(3, 5),
  khariton: cellId(9, 7),
};

const clues: Clue[] = [
  // — Ролевой слой (load-bearing: без запретов гости допускались бы за столы рулетки) —
  {
    id: 'c1',
    type: 'letterRangeRole',
    fromLetter: 'Е',
    toLetter: 'Х',
    roleId: 'staff',
    text: 'Все, чьё имя начиналось с буквы от Е до Х, были сотрудниками казино. Остальные — посетителями.',
  },
  {
    id: 'c2',
    type: 'roleZoneLimit',
    roleId: 'guest',
    roomIds: ['vault', 'security'],
    maxCount: 0,
    text: 'Посетители не допускались в денежное хранилище и комнату охраны.',
  },
  {
    id: 'c3',
    type: 'roleZoneLimit',
    roleId: 'staff',
    roomIds: ['slots'],
    maxCount: 0,
    text: 'Сотрудники казино не ходили в зал игровых автоматов.',
  },
  {
    id: 'c4',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'rouletteTable',
    text: 'Ни один стол для рулетки не остался без крупье.',
  },
  // — Гости (позиционные клю: зоны им назначает ролевой слой c2/c3) —
  {
    id: 'c5',
    type: 'adjacency',
    subject: { type: 'person', id: 'artem' },
    itemTypeId: 'portrait',
    text: 'Артём находился рядом с портретом.',
  },
  {
    id: 'c6',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'valeria' },
    itemTypeId: 'barStool',
    text: 'Валерия сидела на барном табурете.',
  },
  {
    id: 'c7',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'grigory',
    axis: 'row',
    direction: 'before',
    text: 'Борис находился севернее Григория.',
  },
  {
    id: 'c9',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'zinaida',
    axis: 'row',
    direction: 'after',
    text: 'Дарья находилась южнее Зинаиды.',
  },
  {
    id: 'c10',
    type: 'relativePosition',
    subject: { type: 'person', id: 'artem' },
    otherPersonId: 'valeria',
    axis: 'row',
    direction: 'before',
    text: 'Артём находился севернее Валерии.',
  },
  // — Сотрудники —
  {
    id: 'c12',
    type: 'adjacency',
    subject: { type: 'person', id: 'efrem' },
    itemTypeId: 'safe',
    text: 'Ефрем находился рядом с сейфом.',
  },
  {
    id: 'c14',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'camera',
    text: 'Жанна находилась рядом с камерой наблюдения.',
  },
  {
    id: 'c15',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'ignat' },
    itemTypeId: 'pokerTable',
    text: 'Игнат находился в одной зоне со столом для покера.',
  },
  {
    id: 'c16',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'klara' },
    itemTypeId: 'clock',
    text: 'Клара находилась в одной зоне с часами.',
  },
  {
    id: 'c17',
    type: 'parity',
    subject: { type: 'person', id: 'zinaida' },
    axis: 'row',
    parity: 'odd',
    text: 'Зинаида находилась в нечётном ряду.',
  },
  {
    id: 'c18',
    type: 'parity',
    subject: { type: 'person', id: 'zinaida' },
    axis: 'col',
    parity: 'odd',
    text: 'Зинаида находилась в нечётном столбце.',
  },
  {
    id: 'c20',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ignat' },
    otherPersonId: 'klara',
    axis: 'col',
    direction: 'after',
    text: 'Игнат находился восточнее Клары.',
  },
  {
    id: 'c21',
    type: 'parity',
    subject: { type: 'person', id: 'ignat' },
    axis: 'row',
    parity: 'even',
    text: 'Игнат находился в чётном ряду.',
  },
  {
    id: 'c22',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'row',
    parity: 'odd',
    text: 'Борис находился в нечётном ряду.',
  },
  {
    id: 'c8',
    type: 'roomSize',
    subject: { type: 'person', id: 'grigory' },
    comparison: 'largest',
    text: 'Григорий находился в самой просторной зоне казино.',
  },
  {
    id: 'c23',
    type: 'betweenness',
    subject: { type: 'person', id: 'valeria' },
    otherPersonId1: 'darya',
    otherPersonId2: 'grigory',
    axis: 'col',
    text: 'По столбцам Валерия находилась ровно между Дарьей и Григорием.',
  },
];

export const casinoLevel: Level = {
  meta: { id: 'casino-01', title: 'Всё на зеро', theme: 'casino', difficulty: 9, maxFullyPinnedPeople: 0 },
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
