import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 12;

// «Сундук мертвеца»: архипелаг на рассвете. Основная часть карты — море; на нём
// три корабля (фрегат «Морская ведьма», шхуна «Кречет», барк «Пеликан») и остров
// Косой на юго-востоке. Зоны-двойники: «Трюм» ×2 и «Палуба» ×2 — расследование
// определяет, кто на каком корабле. Скрытый капитан — у штурвала фрегата.
const rooms: Room[] = [
  { id: 'deckF', name: 'Палуба', floorTexture: 'wood' },
  { id: 'cabinF', name: 'Каюта капитана', floorTexture: 'carpet' },
  { id: 'galleyF', name: 'Камбуз', floorTexture: 'metal' },
  { id: 'holdF', name: 'Трюм', floorTexture: 'dirt' },
  { id: 'deckS', name: 'Палуба', floorTexture: 'wood' },
  { id: 'holdS', name: 'Трюм', floorTexture: 'dirt' },
  { id: 'deckB', name: 'Палуба', floorTexture: 'wood' },
  { id: 'messB', name: 'Кают-компания', floorTexture: 'stairs' },
  { id: 'island', name: 'Остров сокровищ', floorTexture: 'grass' },
  { id: 'sea', name: 'Открытое море', floorTexture: 'water' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'ford', label: 'Отмель', textureKey: 'sand' },
  { id: 'reef', label: 'Рифы', textureKey: 'cliff' },
  { id: 'beach', label: 'Пляж', textureKey: 'sand' },
];
const FORD_CELLS = new Set([cellId(11, 9), cellId(10, 2), cellId(10, 7)]);
const REEF_CELLS = new Set([cellId(0, 10), cellId(2, 11), cellId(8, 0), cellId(11, 4), cellId(11, 11)]);
const BEACH_CELLS = new Set([cellId(8, 9), cellId(9, 9), cellId(10, 9)]);

const itemTypes: ItemType[] = [
  ItemLibrary.wheel(),
  ItemLibrary.cannon(),
  ItemLibrary.parrot(),
  ItemLibrary.lifebuoy(),
  ItemLibrary.lifeboat('Шлюпка'),
  ItemLibrary.chest('Сундук мертвеца'),
  ItemLibrary.barrel('Бочка с ромом'),
  ItemLibrary.bottle('Бутылка рома'),
  ItemLibrary.telescope('Подзорная труба'),
  ItemLibrary.stove('Камбузная печь'),
  ItemLibrary.table('Стол кают-компании'),
  ItemLibrary.chair('Стул кают-компании'),
  ItemLibrary.box('Ящик с ядрями'),
  ItemLibrary.palm(),
  ItemLibrary.campfire('Костёр пиратов'),
];

const items: Item[] = [
  // Фрегат «Морская ведьма» (r0-4, c0-7): палуба → каюта → камбуз → трюм
  { id: 'item-wheel', typeId: 'wheel', cells: [cellId(0, 3)] },
  { id: 'item-telescope', typeId: 'telescope', cells: [cellId(0, 6)] },
  { id: 'item-parrot-f', typeId: 'parrot', cells: [cellId(0, 4)] },
  { id: 'item-chest', typeId: 'chest', cells: [cellId(4, 4)] },
  { id: 'item-stove-f', typeId: 'stove', cells: [cellId(2, 7)] },
  { id: 'item-cannon-f1', typeId: 'cannon', cells: [cellId(3, 2), cellId(3, 3)] },
  { id: 'item-cannon-f2', typeId: 'cannon', cells: [cellId(4, 1), cellId(4, 2)] },
  { id: 'item-barrel-f', typeId: 'barrel', cells: [cellId(4, 7)] },
  { id: 'item-box-f', typeId: 'box', cells: [cellId(1, 6)] },
  // Шхуна «Кречет» (r5-6, c9-11)
  { id: 'item-parrot-s', typeId: 'parrot', cells: [cellId(5, 10)] },
  { id: 'item-cannon-s', typeId: 'cannon', cells: [cellId(6, 9), cellId(6, 10)] },
  // Барк «Пеликан» (r7-9, c2-7)
  { id: 'item-table-b', typeId: 'table', cells: [cellId(8, 6)] },
  { id: 'item-chair-b', typeId: 'chair', cells: [cellId(9, 6)] },
  { id: 'item-bottle-b', typeId: 'bottle', cells: [cellId(9, 5)] },
  { id: 'item-barrel-b', typeId: 'barrel', cells: [cellId(7, 3)] },
  // Остров Косой (r8-11, c8-11)
  { id: 'item-palm-1', typeId: 'palm', cells: [cellId(9, 10)] },
  { id: 'item-palm-2', typeId: 'palm', cells: [cellId(10, 9)] },
  { id: 'item-campfire', typeId: 'campfire', cells: [cellId(9, 9)] },
  // Море: шлюпки, круги, рифы
  { id: 'item-boat-1', typeId: 'lifeboat', cells: [cellId(5, 1)] },
  { id: 'item-boat-2', typeId: 'lifeboat', cells: [cellId(6, 8)] },
  { id: 'item-boat-3', typeId: 'lifeboat', cells: [cellId(8, 8)] },
  { id: 'item-buoy-1', typeId: 'lifebuoy', cells: [cellId(4, 9)] },
  { id: 'item-buoy-2', typeId: 'lifebuoy', cells: [cellId(11, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// D=палуба фрегата, C=каюта, G=камбуз, H=трюм фрегата, S=палуба шхуны (c9-11),
// H в r6 = трюм шхуны, B=палуба барка, M=кают-компания, I=остров, ~=открытое море.
// Отмели/рифы/пляж — фичи пола поверх зон (FORD/REEF/BEACH_CELLS).
const ROOM_ROWS = [
  'DDDDDDDD~~~~',
  'DCDDDDGG~~~~',
  'CCCCDDGG~~~~',
  'HHHHHHGG~~~~',
  'HHHHHHHG~~~~',
  '~~~~~~~~~SSS',
  '~~~~~~~~~HHH',
  '~~BBBBBB~~~~',
  '~~BBBBMM~I~~',
  '~~BBBBMM~III',
  '~~~~~~~~~III',
  '~~~~~~~~~~II',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  if (ch === 'S') return 'deckS';
  if (ch === 'H') return col >= 9 ? 'holdS' : 'holdF';
  if (ch === 'B') return 'deckB';
  if (ch === 'M') return 'messB';
  if (ch === 'D') return 'deckF';
  if (ch === 'C') return 'cabinF';
  if (ch === 'G') return 'galleyF';
  if (ch === 'I') return 'island';
  return 'sea';
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (FORD_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'ford' };
  if (REEF_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'reef' };
  if (BEACH_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'beach' };
  return cell;
});

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['captain'] },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'victor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true, roles: ['mate'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'lidia', name: 'Лидия', initialLetter: 'Л', gender: 'female', color: '#e0a94a', isVictim: false, isMurderer: false, roles: ['mate'] },
  { id: 'kharita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['mate'] },
];

// Судоку-инвариант: все ряды и столбцы различны (полная пермутация).
// Капитан Аркадий — НА штурвале (0,3); жертва Харита и убийца Ждан — вдвоём в трюме
// фрегата, сундук мертвеца (4,6) рядом с Жданом; Леонид в шлюпке на штилевой глади;
// Лидия на отмели; Зоя сидит на пушке шхуны рядом с Беллой; Есения в джунглях.
const solution: Record<PersonId, CellId> = {
  arkady: cellId(0, 3),
  demyan: cellId(1, 7),
  glafira: cellId(2, 0),
  kharita: cellId(3, 1),
  zhdan: cellId(4, 5),
  bella: cellId(5, 11),
  kirill: cellId(6, 8),
  victor: cellId(7, 2),
  zoya: cellId(8, 4),
  inna: cellId(9, 6),
  esenia: cellId(10, 10),
  lidia: cellId(11, 9),
};

const clues: Clue[] = [
  // — Роль-слой: скрытый капитан + офицеры/матросы (load-bearing) —
  { id: 'c1', type: 'roleSingleton', roleId: 'captain', text: 'Среди команды был ровно один капитан, а все остальные — матросы.' },
  {
    id: 'c2',
    type: 'occupiesItem',
    subject: { type: 'role', role: 'captain' },
    itemTypeId: 'wheel',
    text: 'Капитан стоял за штурвалом.',
  },
  {
    id: 'c3',
    type: 'bareCellBan',
    roomId: 'sea',
    text: 'Никого не было в открытой воде: в море можно было оказаться лишь в шлюпке, на спасательном кругу, на отмели или на рифе.',
  },
  // — Общие правила архипелага —
  {
    id: 'c4',
    type: 'wallSide',
    subject: { type: 'person', id: 'arkady' },
    wallDirection: 'north',
    text: 'Аркадий находился у северной стены своей зоны.',
  },
  // — Аркадий (капитан, палуба фрегата) —
  // — Зоя (палуба барка — для игрока одна из трёх «Палуб») —
  {
    id: 'c5',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'deckB',
    text: 'Зоя находилась на палубе.',
  },
  {
    id: 'c6',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'victor',
    axis: 'col',
    direction: 'after',
    text: 'Зоя находилась восточнее Виктора.',
  },
  {
    id: 'c22',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'arkady',
    axis: 'row',
    direction: 'after',
    text: 'Зоя находилась южнее Аркадия.',
  },
  // — Есения (остров сокровищ) —
  {
    id: 'c7',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'campfire',
    text: 'Есения находилась в одной зоне с костром пиратов.',
  },
  // — Леонид (шлюпка на штилевой глади) —
  {
    id: 'c8',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'kirill' },
    itemTypeId: 'lifeboat',
    text: 'Кирилл сидел в шлюпке.',
  },
  {
    id: 'c9',
    type: 'relativePosition',
    subject: { type: 'person', id: 'kirill' },
    otherPersonId: 'bella',
    axis: 'col',
    direction: 'before',
    text: 'Кирилл находился западнее Беллы.',
  },
  // — Лидия (отмель юга) —
  {
    id: 'c10',
    type: 'floorFeature',
    subject: { type: 'person', id: 'lidia' },
    featureId: 'ford',
    text: 'Лидия находилась на отмели.',
  },
  // — Белла (палуба шхуны) —
  {
    id: 'c11',
    type: 'adjacency',
    subject: { type: 'person', id: 'bella' },
    itemTypeId: 'parrot',
    text: 'Белла находилась рядом с попугаем.',
  },
  // — Виктор (палуба барка) —
  {
    id: 'c12',
    type: 'adjacency',
    subject: { type: 'person', id: 'victor' },
    itemTypeId: 'barrel',
    text: 'Виктор находился рядом с бочкой рома.',
  },
  // — Инна (кают-компания) —
  {
    id: 'c13',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'inna' },
    itemTypeId: 'table',
    text: 'Инна находилась в одной зоне со столом кают-компании.',
  },
  // — Демьян (камбуз) —
  {
    id: 'c15',
    type: 'adjacency',
    subject: { type: 'person', id: 'demyan' },
    itemTypeId: 'stove',
    text: 'Демьян находился рядом с камбузной печью.',
  },
  // — Глафира (каюта капитана) —
  {
    id: 'c16',
    type: 'roomMembership',
    subject: { type: 'person', id: 'glafira' },
    roomId: 'cabinF',
    text: 'Глафира находилась в каюте капитана.',
  },
  {
    id: 'c17',
    type: 'parity',
    subject: { type: 'person', id: 'glafira' },
    axis: 'col',
    parity: 'odd',
    text: 'Глафира находилась в нечётном столбце.',
  },
  {
    id: 'c18',
    type: 'relativePosition',
    subject: { type: 'person', id: 'glafira' },
    otherPersonId: 'demyan',
    axis: 'row',
    direction: 'after',
    text: 'Глафира находилась южнее Демьяна.',
  },
  // — Ждан (убийца, трюм фрегата) —
  {
    id: 'c19',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zhdan' },
    roomId: 'holdF',
    text: 'Ждан находился в трюме.',
  },
  {
    id: 'c20',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'chest',
    text: 'Ждан находился рядом с сундуком мертвеца.',
  },
  {
    id: 'c21',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'south',
    text: 'Ждан находился у южной стены своей зоны.',
  },
];

export const piratesLevel: Level = {
  meta: { id: 'pirates-01', title: 'Сундук мертвеца', theme: 'pirates', difficulty: 9, maxFullyPinnedPeople: 0, rosterColumnCounts: [5, 3, 4] },
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
