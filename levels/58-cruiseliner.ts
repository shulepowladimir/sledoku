import type { Clue } from '../src/types/clue';
import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;
export const cols = 11;

const rooms: Room[] = [
  { id: 'bridge', name: 'Мостик', floorTexture: 'workshopFloor', labelPosition: 'bottom' },
  { id: 'pool', name: 'Палуба с бассейном', floorTexture: 'tile', labelPosition: 'bottom' },
  { id: 'restaurant', name: 'Ресторан', floorTexture: 'marble', labelPosition: 'bottom' },
  { id: 'cabinUpper', name: 'Каюты', floorTexture: 'wood', labelPosition: 'bottom' },
  { id: 'cabinLower', name: 'Каюты', floorTexture: 'wood', labelPosition: 'bottom' },
  { id: 'casino', name: 'Казино', floorTexture: 'checker', labelPosition: 'bottom' },
  { id: 'nose', name: 'Палуба на носу', floorTexture: 'cobble', labelPosition: 'bottom' },
  { id: 'tennis', name: 'Теннисный корт', floorTexture: 'grass', labelPosition: 'bottom' },
  { id: 'ocean', name: 'Океан', floorTexture: 'water', labelPosition: 'bottom' },
];

const ROOM_ROWS = [
  'MBBBBRROOOO',
  'MBBBBRRKOOO',
  'MBBBBBRKKOO',
  'MMBBBZRKKNO',
  'MMZZZZRKNNO',
  'MMZZZZRKNNO',
  'MMZZZZRRRNO',
  'MTTTTTKRROO',
  'MTTTTTKROOO',
  'MKKKKKKOOOO',
];

const ROOM_BY_CODE: Record<string, string> = {
  M: 'bridge',
  B: 'pool',
  R: 'restaurant',
  Z: 'casino',
  N: 'nose',
  T: 'tennis',
  O: 'ocean',
};

export function roomForCell(row: number, col: number): string {
  const code = ROOM_ROWS[row]?.[col];
  if (code === 'K') return row >= 7 ? 'cabinLower' : 'cabinUpper';
  return ROOM_BY_CODE[code];
}

const floorFeatures: FloorFeature[] = [
  { id: 'pool-water', label: 'Вода в бассейне', textureKey: 'water' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.wheel('Штурвал'),
  ItemLibrary.lamp(),
  ItemLibrary.computer(),
  ItemLibrary.radioStation(),
  ItemLibrary.satelliteDish(),
  ItemLibrary.inflatableMattress(),
  ItemLibrary.palm(),
  ItemLibrary.slide(),
  ItemLibrary.beachChair(),
  ItemLibrary.sunLounger(),
  ItemLibrary.beachUmbrella(),
  ItemLibrary.lifebuoy(),
  ItemLibrary.ladder(),
  ItemLibrary.iceCream(),
  ItemLibrary.speaker(),
  ItemLibrary.chair(),
  ItemLibrary.bathtub(),
  ItemLibrary.barCounter(),
  ItemLibrary.barStool(),
  ItemLibrary.fineDiningTable(),
  ItemLibrary.servingCloche(),
  ItemLibrary.flowerVase(),
  ItemLibrary.wineGlass(),
  ItemLibrary.rouletteTable(),
  ItemLibrary.slotMachine(),
  ItemLibrary.pokerTable(),
  ItemLibrary.berth(),
  ItemLibrary.suitcase(),
  ItemLibrary.bed(),
  ItemLibrary.bench(),
  ItemLibrary.yacht(),
  ItemLibrary.lifeboat(),
  ItemLibrary.tennisRacket(),
  ItemLibrary.tennisBall(),
  ItemLibrary.tennisNet(),
  ItemLibrary.anchorWinch(),
];

const items: Item[] = [
  { id: 'bridge-wheel', typeId: 'wheel', cells: [cellId(0, 0)] },
  { id: 'bridge-computer-1', typeId: 'computer', cells: [cellId(2, 0)] },
  { id: 'bridge-computer-2', typeId: 'computer', cells: [cellId(3, 0)] },
  { id: 'bridge-lamp', typeId: 'lamp', cells: [cellId(4, 0)] },
  { id: 'bridge-radio', typeId: 'radioStation', cells: [cellId(4, 1)] },
  { id: 'bridge-satellite-dish-1', typeId: 'satelliteDish', cells: [cellId(5, 0)] },
  { id: 'bridge-satellite-dish-2', typeId: 'satelliteDish', cells: [cellId(9, 0)] },

  { id: 'pool-palm', typeId: 'palm', cells: [cellId(0, 1)] },
  { id: 'pool-umbrella', typeId: 'beachUmbrella', cells: [cellId(0, 2)] },
  { id: 'pool-lounger-1', typeId: 'sunLounger', cells: [cellId(0, 3)] },
  { id: 'pool-lounger-2', typeId: 'sunLounger', cells: [cellId(0, 4)] },
  { id: 'pool-chair-1', typeId: 'beachChair', cells: [cellId(1, 1)] },
  { id: 'pool-chair-2', typeId: 'beachChair', cells: [cellId(2, 1)] },
  { id: 'pool-ice-cream-1', typeId: 'iceCream', cells: [cellId(2, 2)] },
  { id: 'pool-slide', typeId: 'slide', cells: [cellId(3, 2), cellId(3, 3)] },
  { id: 'pool-speaker', typeId: 'speaker', cells: [cellId(3, 4)] },
  { id: 'pool-mattress-boris', typeId: 'inflatableMattress', cells: [cellId(1, 4)] },
  { id: 'pool-mattress-2', typeId: 'inflatableMattress', cells: [cellId(2, 4)] },

  { id: 'restaurant-table-1', typeId: 'fineDiningTable', cells: [cellId(0, 5)] },
  { id: 'restaurant-table-2', typeId: 'fineDiningTable', cells: [cellId(7, 7)] },
  { id: 'restaurant-chair-1', typeId: 'chair', cells: [cellId(1, 5)] },
  { id: 'restaurant-chair-2', typeId: 'chair', cells: [cellId(1, 6)] },
  { id: 'restaurant-cloche', typeId: 'servingCloche', cells: [cellId(7, 8)] },
  { id: 'restaurant-vase', typeId: 'flowerVase', cells: [cellId(8, 7)] },
  { id: 'restaurant-wine-glass', typeId: 'wineGlass', cells: [cellId(4, 6)] },
  { id: 'restaurant-counter', typeId: 'barCounter', cells: [cellId(5, 6)] },
  { id: 'restaurant-ice-cream', typeId: 'iceCream', cells: [cellId(6, 6)] },
  { id: 'restaurant-bar-stool-1', typeId: 'barStool', cells: [cellId(6, 7)] },
  { id: 'restaurant-bar-stool-2', typeId: 'barStool', cells: [cellId(6, 8)] },

  { id: 'casino-slot-1', typeId: 'slotMachine', cells: [cellId(3, 5)] },
  { id: 'casino-slot-2', typeId: 'slotMachine', cells: [cellId(4, 2)] },
  { id: 'casino-roulette-1', typeId: 'rouletteTable', cells: [cellId(4, 4)] },
  { id: 'casino-roulette-2', typeId: 'rouletteTable', cells: [cellId(6, 3)] },
  { id: 'casino-poker', typeId: 'pokerTable', cells: [cellId(5, 3)] },

  { id: 'upper-berth-1', typeId: 'berth', cells: [cellId(1, 7)] },
  { id: 'upper-bed-1', typeId: 'bed', cells: [cellId(2, 7)] },
  { id: 'upper-chair-1', typeId: 'chair', cells: [cellId(3, 7)] },
  { id: 'upper-suitcase', typeId: 'suitcase', cells: [cellId(3, 8)] },
  { id: 'lower-bed-1', typeId: 'bed', cells: [cellId(8, 6)] },
  { id: 'lower-bed-2', typeId: 'bed', cells: [cellId(9, 4)] },
  { id: 'lower-bed-3', typeId: 'bed', cells: [cellId(9, 2)] },
  { id: 'lower-bathtub-1', typeId: 'bathtub', cells: [cellId(7, 6)] },
  { id: 'lower-chair-1', typeId: 'chair', cells: [cellId(9, 1)] },

  { id: 'tennis-net', typeId: 'tennisNet', cells: [cellId(7, 3), cellId(8, 3)] },
  { id: 'tennis-racket-1', typeId: 'tennisRacket', cells: [cellId(7, 4)] },
  { id: 'tennis-racket-2', typeId: 'tennisRacket', cells: [cellId(8, 1)] },
  { id: 'tennis-ball', typeId: 'tennisBall', cells: [cellId(8, 4)] },
  { id: 'tennis-bench-1', typeId: 'bench', cells: [cellId(7, 2)] },
  { id: 'tennis-bench-2', typeId: 'bench', cells: [cellId(8, 2)] },

  { id: 'nose-anchor-winch', typeId: 'anchorWinch', cells: [cellId(4, 9)] },
  { id: 'nose-lifebuoy', typeId: 'lifebuoy', cells: [cellId(4, 8)] },

  { id: 'ocean-yacht', typeId: 'yacht', cells: [cellId(0, 7), cellId(0, 8)] },
  { id: 'ocean-lifeboat', typeId: 'lifeboat', cells: [cellId(8, 9), cellId(8, 10)] },
  { id: 'ocean-lifebuoy-1', typeId: 'lifebuoy', cells: [cellId(4, 10)] },
  { id: 'ocean-lifebuoy-2', typeId: 'lifebuoy', cells: [cellId(6, 10)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const poolWaterCells = new Set([
  cellId(1, 2), cellId(1, 3), cellId(1, 4),
  cellId(2, 4), cellId(2, 5),
]);

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols).map((cell) => (
  poolWaterCells.has(cell.id) ? { ...cell, floorFeatureId: 'pool-water' } : cell
));

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'valeria', name: 'Валерия', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'elena', name: 'Елена', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: true, roles: ['passenger'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false, roles: ['passenger'] },
];

const solution: Record<PersonId, CellId> = {
  andrey: cellId(0, 6),
  boris: cellId(1, 4),
  valeria: cellId(6, 3),
  galina: cellId(4, 5),
  denis: cellId(7, 1),
  elena: cellId(2, 7),
  zhdan: cellId(8, 10),
  zoya: cellId(3, 9),
  inna: cellId(9, 2),
  khariton: cellId(5, 8),
};

const clues: Clue[] = [
  {
    id: 'cruise-edge-zone-empty',
    type: 'zoneEmptyDisjunction',
    roomIds: ['bridge', 'ocean'],
    text: 'Или на мостике, или в океане никого не было.',
  },
  {
    id: 'cruise-letter-roles',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Д',
    roleId: 'crew',
    text: 'Все, чьи имена начинались на букву от А до Д, были членами экипажа. Остальные были пассажирами.',
  },
  {
    id: 'cruise-passengers-off-bridge',
    type: 'roleZoneLimit',
    roleId: 'passenger',
    roomIds: ['bridge'],
    maxCount: 0,
    text: 'Пассажиры не допускались на мостик.',
  },
  {
    id: 'cruise-andrey-chair',
    type: 'adjacency',
    subject: { type: 'person', id: 'andrey' },
    itemTypeId: 'chair',
    text: 'Андрей находился рядом со стулом.',
  },
  {
    id: 'cruise-boris-water',
    type: 'floorTexture',
    subject: { type: 'person', id: 'boris' },
    textureKey: 'water',
    text: 'Борис был в воде.',
  },
  {
    id: 'cruise-boris-lounger-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'sunLounger',
    text: 'Борис находился в одном ряду или столбце с шезлонгом.',
  },
  {
    id: 'cruise-elena-chair',
    type: 'adjacency',
    subject: { type: 'person', id: 'elena' },
    itemTypeId: 'chair',
    text: 'Елена находилась рядом со стулом.',
  },
  {
    id: 'cruise-elena-suitcase-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'elena' },
    itemTypeId: 'suitcase',
    text: 'Елена находилась в той же каюте, что и чемодан.',
  },
  {
    id: 'cruise-zoya-lifebuoy-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'lifebuoy',
    text: 'Зоя находилась в той же зоне, что и спасательный круг.',
  },
  {
    id: 'cruise-zoya-winch',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'anchorWinch',
    text: 'Зоя находилась в одном ряду или столбце с носовой лебёдкой.',
  },
  {
    id: 'cruise-galina-roulette',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'rouletteTable',
    text: 'Галина находилась рядом со столом рулетки.',
  },
  {
    id: 'cruise-galina-wine-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'wineGlass',
    text: 'Галина находилась в одном ряду или столбце с бокалом вина.',
  },
  {
    id: 'cruise-valeria-roulette',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'valeria' },
    itemTypeId: 'rouletteTable',
    text: 'Валерия сидела за одним из столов рулетки.',
  },
  {
    id: 'cruise-denis-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'denis' },
    wallDirection: 'north',
    text: 'Денис стоял у северной стены теннисного корта.',
  },
  {
    id: 'cruise-zhdan-bed-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'bed',
    text: 'Ждан находился в одном ряду или столбце с кроватью.',
  },
  {
    id: 'cruise-zhdan-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'east',
    text: 'Ждан стоял у восточной стены своей зоны.',
  },
  {
    id: 'cruise-inna-on-bed',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'inna' },
    itemTypeId: 'bed',
    text: 'Инна лежала на одной из кроватей.',
  },
  {
    id: 'cruise-inna-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'inna' },
    wallDirection: 'south',
    text: 'Инна стояла у южной стены своей зоны.',
  },
];

export const cruiseLinerLevel: Level = {
  meta: {
    id: 'cruiseliner-01',
    title: 'Круиз в один конец',
    theme: 'cruiseliner',
    difficulty: 8,
    maxFullyPinnedPeople: 0,
    menuTag: 'hard',
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
