import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;

// «Тихие соседи»: старое городское кладбище на девятерых. Твист: убийца —
// смотритель кладбища (roleSingleton + F-механики). Обманка «не там»: свежая
// могила с венком на новом кладбище + «на новом ровно двое» ведут к ложному
// следу; на самом деле труп находят в склепе, где Христина была наедине со
// смотрителем. F-механики: zoneBoundary (зоновый wallSide), zoneNeighborOf,
// adjacentZonesPair — дебют трёх новых типов.
const rooms: Room[] = [
  { id: 'chapel', name: 'Часовня', floorTexture: 'tile' },
  { id: 'crypt', name: 'Склеп', floorTexture: 'stone' },
  { id: 'oldGrave', name: 'Старое кладбище', floorTexture: 'grass' },
  { id: 'newGrave', name: 'Новое кладбище', floorTexture: 'grass' },
  { id: 'alley', name: 'Аллея', floorTexture: 'cobble' },
  { id: 'gate', name: 'Вход', floorTexture: 'concrete' },
  { id: 'yard', name: 'Двор смотрителя', floorTexture: 'dirt' },
  { id: 'waste', name: 'Пустырь', floorTexture: 'sand' },
];

const itemTypes: ItemType[] = [
  // Уровневые (кладбище)
  { id: 'tombstone', label: 'Надгробие', kind: 'decorative', icon: 'tombstone' },
  { id: 'freshGrave', label: 'Свежая могила', kind: 'decorative', icon: 'freshGrave' },
  { id: 'cemeteryGate', label: 'Ворота кладбища', kind: 'decorative', icon: 'cemeteryGate' },
  { id: 'stela', label: 'Стела', kind: 'decorative', icon: 'stela' },
  { id: 'bushHedge', label: 'Куст', kind: 'decorative', icon: 'bushHedge', render: 'tile' },
  { id: 'sarcophagus', label: 'Саркофаг', kind: 'decorative', icon: 'sarcophagus' },
  // Библиотечные
  ItemLibrary.candleStand(),
  ItemLibrary.monument('Памятник'),
  ItemLibrary.well('Колодец'),
  ItemLibrary.tree('Дерево'),
  ItemLibrary.bench('Скамейка'),
  ItemLibrary.lamppost(),
  ItemLibrary.rock(),
];

const items: Item[] = [
  // — Часовня: памятник, подсвечники —
  { id: 'item-monument', typeId: 'monument', cells: [cellId(0, 0)] },
  { id: 'item-candles-1', typeId: 'candleStand', cells: [cellId(1, 0)] },
  { id: 'item-candles-2', typeId: 'candleStand', cells: [cellId(1, 1)] },
  // — Склеп: стела-блокер у дальней стены (клетка (2,4) свободна для человека) —
  { id: 'item-stela-c', typeId: 'stela', cells: [cellId(1, 5)] },
  // — Старое кладбище: именные надгробия, стелы, колодец —
  { id: 'item-tomb-o1', typeId: 'tombstone', cells: [cellId(2, 0)] },
  { id: 'item-tomb-o2', typeId: 'tombstone', cells: [cellId(2, 1)] },
  { id: 'item-tomb-o3', typeId: 'tombstone', cells: [cellId(3, 2)] },
  { id: 'item-tomb-o4', typeId: 'tombstone', cells: [cellId(4, 0)] },
  { id: 'item-stela-o1', typeId: 'stela', cells: [cellId(4, 2)] },
  { id: 'item-stela-o2', typeId: 'stela', cells: [cellId(5, 0)] },
  { id: 'item-well', typeId: 'well', cells: [cellId(6, 1)] },
  { id: 'item-bush-o1', typeId: 'bushHedge', cells: [cellId(6, 0)] },
  // — Новое кладбище: надгробия + СВЕЖАЯ МОГИЛА С ВЕНКОМ (обманка) —
  { id: 'item-tomb-n1', typeId: 'tombstone', cells: [cellId(5, 5)] },
  { id: 'item-tomb-n2', typeId: 'tombstone', cells: [cellId(6, 4)] },
  { id: 'item-tomb-n3', typeId: 'tombstone', cells: [cellId(7, 5)] },
  { id: 'item-tomb-n4', typeId: 'tombstone', cells: [cellId(8, 5)] },
  { id: 'item-tomb-n5', typeId: 'tombstone', cells: [cellId(9, 4)] },
  { id: 'item-fresh-grave', typeId: 'freshGrave', cells: [cellId(9, 5)] },

  // — Аллея: фонари, скамья —
  { id: 'item-lamp-a1', typeId: 'lamppost', cells: [cellId(4, 4)] },
  { id: 'item-lamp-a2', typeId: 'lamppost', cells: [cellId(6, 3)] },
  { id: 'item-bench-a', typeId: 'bench', cells: [cellId(8, 4)] },
  { id: 'item-bench-b', typeId: 'bench', cells: [cellId(5, 3)] },
  // — Вход: ворота кладбища —
  { id: 'item-cemetery-gate', typeId: 'cemeteryGate', cells: [cellId(9, 0)] },
  { id: 'item-rock-g1', typeId: 'rock', cells: [cellId(7, 0)] },
  // — Двор смотрителя: колодец? нет — домик-бытовка из камня и кусты —
  { id: 'item-rock-y1', typeId: 'rock', cells: [cellId(3, 8)] },
  { id: 'item-rock-y2', typeId: 'rock', cells: [cellId(4, 8)] },
  { id: 'item-bush-y1', typeId: 'bushHedge', cells: [cellId(6, 8)] },
  // Куст-полиомино через границу нового кладбища и двора
  { id: 'item-bush-ny', typeId: 'bushHedge', cells: [cellId(8, 7), cellId(8, 8)] },
  // — Пустырь: сухое дерево, камни, забытый саркофаг —
  { id: 'item-tree-w', typeId: 'tree', cells: [cellId(0, 7)] },
  { id: 'item-rock-w1', typeId: 'rock', cells: [cellId(1, 6)] },
  { id: 'item-rock-w2', typeId: 'rock', cells: [cellId(3, 6)] },
  { id: 'item-sarcophagus', typeId: 'sarcophagus', cells: [cellId(2, 8), cellId(2, 9)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// ч=часовня, с=склеп, о=старое, н=новое, а=аллея, в=вход, д=двор, п=пустырь.
const ROOM_ROWS = [
  'ччччпппппп'.slice(0, 10),
  'ччччсспппп',
  'ооччсспппп',
  'ооооопппдд',
  'ооооапппдд',
  'оооааннндд',
  'ооаанннндд',
  'вааанннндд',
  'вввааннндд',
  'ввввнннннд',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      ч: 'chapel',
      с: 'crypt',
      о: 'oldGrave',
      н: 'newGrave',
      а: 'alley',
      в: 'gate',
      д: 'yard',
      п: 'waste',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bel', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'vlad', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: true, roles: ['watchman'] },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'elisey', name: 'Елисей', initialLetter: 'Е', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'ignat', name: 'Игнат', initialLetter: 'И', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Полная перестановка 10×10 (10 действующих лиц). В склепе — Галина
// (смотритель-убийца, 1,4) и Христина (жертва, 2,5); на новом кладбище у
// свежей могилы — живая пара Белла (9,8) и Зоя (6,6) — приманка обманки;
// Игнат (8,3) гуляет по аллее у скамьи.
const solution: Record<PersonId, CellId> = {
  arkady: cellId(0, 2),
  bel: cellId(9, 8),
  vlad: cellId(5, 9),
  galina: cellId(1, 4),
  demyan: cellId(7, 1),
  elisey: cellId(4, 7),
  zhdan: cellId(3, 0),
  zoya: cellId(6, 6),
  ignat: cellId(8, 3),
  hristina: cellId(2, 5),
};

const clues: Clue[] = [
  // — Общие: твист смотрителя —
  {
    id: 'cm1',
    type: 'roleSingleton',
    roleId: 'watchman',
    text: 'На кладбище дежурил ровно один смотритель.',
  },
  {
    id: 'cm2',
    type: 'zoneBoundary',
    subject: { type: 'role', role: 'watchman' },
    roomId: 'crypt',
    otherRoomId: 'chapel',
    text: 'Смотритель стоял на границе склепа и часовни.',
  },
  // — Общие: обманка «не там» и счётчики —
  {
    id: 'cm4',
    type: 'zoneExactCount',
    roomId: 'chapel',
    count: 1,
    text: 'В часовне находился ровно один человек.',
  },
  {
    id: 'cm24',
    type: 'zoneExactCount',
    roomId: 'crypt',
    count: 2,
    text: 'В склепе находились ровно двое.',
  },
  // — Личные —
  {
    id: 'cm5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'arkady' },
    roomId: 'chapel',
    text: 'Аркадий находился в часовне.',
  },
  {
    id: 'cm21',
    type: 'parity',
    subject: { type: 'person', id: 'arkady' },
    axis: 'col',
    parity: 'odd',
    text: 'Аркадий находился в нечётном столбце.',
  },
  {
    id: 'cm6',
    type: 'floorTexture',
    subject: { type: 'person', id: 'bel' },
    textureKey: 'grass',
    text: 'Белла была на траве.',
  },
  {
    id: 'cm7',
    type: 'roomMembership',
    subject: { type: 'person', id: 'vlad' },
    roomId: 'yard',
    text: 'Владимир был во дворе смотрителя.',
  },
  {
    id: 'cm17',
    type: 'parity',
    subject: { type: 'person', id: 'vlad' },
    axis: 'row',
    parity: 'even',
    text: 'Владимир находился в чётном ряду.',
  },
  {
    id: 'cm8',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'demyan' },
    roomId: 'alley',
    otherRoomId: 'gate',
    text: 'Демьян стоял на границе аллеи и входа.',
  },
  {
    id: 'cm25',
    type: 'parity',
    subject: { type: 'person', id: 'demyan' },
    axis: 'row',
    parity: 'even',
    text: 'Демьян находился в чётном ряду.',
  },
  {
    id: 'cm9',
    type: 'roomMembership',
    subject: { type: 'person', id: 'elisey' },
    roomId: 'waste',
    text: 'Елисей бродил по пустырю.',
  },
  {
    id: 'cm16',
    type: 'parity',
    subject: { type: 'person', id: 'elisey' },
    axis: 'col',
    parity: 'even',
    text: 'Елисей находился в чётном столбце.',
  },
  {
    id: 'cm10',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'west',
    text: 'Ждан находился у западной стены.',
  },
  {
    id: 'cm14',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'tombstone',
    text: 'Ждан находился у надгробия.',
  },
  {
    id: 'cm11',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bel' },
    otherPersonId: 'zoya',
    axis: 'row',
    direction: 'after',
    text: 'Белла находилась южнее Зои.',
  },
  {
    id: 'cm12',
    type: 'adjacentZonesPair',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'elisey',
    text: 'Зоя и Елисей были в соседних зонах.',
  },
  {
    id: 'cm18',
    type: 'zoneNeighborOf',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'yard',
    text: 'Зоя находилась в соседней от двора смотрителя зоне.',
  },
  {
    id: 'cm22',
    type: 'adjacency',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'tombstone',
    negated: true,
    text: 'Зоя не находилась у надгробия.',
  },
  {
    id: 'cm26',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'stela',
    text: 'Галина находилась у стелы.',
  },
  {
    id: 'cm28',
    type: 'adjacency',
    subject: { type: 'person', id: 'ignat' },
    itemTypeId: 'bench',
    text: 'Игнат находился у скамьи.',
  },
];

const level: Level = {
  meta: {
    id: 'cemetery-01',
    title: 'Тихие соседи',
    theme: 'cemetery',
    difficulty: 8,
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

export const cemeteryLevel: Level = level;
