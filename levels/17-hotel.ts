import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

const rooms: Room[] = [
  { id: 'corridor', name: 'Коридор', floorTexture: 'tile' },
  { id: 'room1', name: 'Номер №1', floorTexture: 'wood' },
  { id: 'room2', name: 'Номер №2', floorTexture: 'wood' },
  { id: 'stairW', name: 'Западная лестница', floorTexture: 'stairs' },
  { id: 'stairE', name: 'Восточная лестница', floorTexture: 'stairs' },
  { id: 'suite', name: 'Номер Люкс', floorTexture: 'marble' },
  { id: 'lobby', name: 'Лобби', floorTexture: 'marble' },
  { id: 'reception', name: 'Ресепшн', floorTexture: 'tile' },
  { id: 'bar', name: 'Бар-ресторан', floorTexture: 'carpet' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'runner', label: 'Ковёр', textureKey: 'rug' },
  { id: 'suite-carpet', label: 'Ковёр', textureKey: 'rug' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.sofa('Диван лобби'),
  ItemLibrary.fountain('Фонтан'),
  ItemLibrary.plant(),
  ItemLibrary.clock('Часы'),
  ItemLibrary.bed('Кровать'),
  ItemLibrary.bathtub('Ванна'),
  ItemLibrary.floorLamp('Торшер'),
  ItemLibrary.bed('Кровать'),
  ItemLibrary.jacuzzi(),
  ItemLibrary.tv(),
  ItemLibrary.portrait(),
  ItemLibrary.keyBox(),
  ItemLibrary.journal(),
  ItemLibrary.barCounter('Барная стойка'),
  ItemLibrary.table('Столик ресторана'),
  ItemLibrary.chair('Стул ресторана'),
];

const items: Item[] = [
  // Коридор: растение, часы (рядом с Аркадием (0,8))
  { id: 'item-plant-cor', typeId: 'plant', cells: [cellId(1, 0)] },
  { id: 'item-clock-cor', typeId: 'clock', cells: [cellId(1, 8)] },
  // Номер №1: кровать, ванна, торшер
  { id: 'item-bed-r1', typeId: 'bed', cells: [cellId(1, 1)] },
  { id: 'item-bath-r1', typeId: 'bathtub', cells: [cellId(2, 1)] },
  { id: 'item-lamp-r1', typeId: 'floorLamp', cells: [cellId(2, 3)] },
  // Номер №2: кровать, ванна, торшер
  { id: 'item-bed-r2', typeId: 'bed', cells: [cellId(1, 6)] },
  { id: 'item-bath-r2', typeId: 'bathtub', cells: [cellId(2, 7)] },
  { id: 'item-lamp-r2', typeId: 'floorLamp', cells: [cellId(2, 6)] },
  // Люкс: кровать 2-клеточная, джакузи, плазма, портрет
  { id: 'item-bed-suite', typeId: 'bed', cells: [cellId(3, 2), cellId(3, 3)] },
  { id: 'item-jacuzzi', typeId: 'jacuzzi', cells: [cellId(4, 2)] },
  { id: 'item-tv', typeId: 'tv', cells: [cellId(3, 6)] },
  { id: 'item-portrait-suite', typeId: 'portrait', cells: [cellId(4, 6)] },
  // Лобби: диваны ×2, фонтан, растение
  { id: 'item-sofa-l1', typeId: 'sofa', cells: [cellId(6, 5)] },
  { id: 'item-sofa-l2', typeId: 'sofa', cells: [cellId(7, 5)] },
  { id: 'item-fountain-lobby', typeId: 'fountain', cells: [cellId(5, 4), cellId(5, 5)] },
  { id: 'item-plant-lobby', typeId: 'plant', cells: [cellId(8, 5)] },
  // Ресепшн: ящик с ключами, журнал бронирований, растение
  { id: 'item-keybox', typeId: 'keyBox', cells: [cellId(5, 7)] },
  { id: 'item-journal', typeId: 'journal', cells: [cellId(6, 8)] },
  { id: 'item-plant-rec', typeId: 'plant', cells: [cellId(8, 7)] },
  // Бар: барная стойка 2-кл., столы 2-кл. ×2, стулья ×3, растение
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(5, 0), cellId(6, 0)] },
  { id: 'item-table-b1', typeId: 'table', cells: [cellId(6, 1), cellId(6, 2)] },
  { id: 'item-table-b2', typeId: 'table', cells: [cellId(8, 1), cellId(8, 2)] },
  { id: 'item-chair-b1', typeId: 'chair', cells: [cellId(7, 1)] },
  { id: 'item-chair-b2', typeId: 'chair', cells: [cellId(7, 2)] },
  { id: 'item-chair-b3', typeId: 'chair', cells: [cellId(8, 3)] },
  { id: 'item-plant-bar', typeId: 'plant', cells: [cellId(7, 0)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// K = corridor (top band), 1/2 = regular rooms (left/right under corridor), W/E = staircases
// (side notches), S = suite (middle band), B = lobby (center bottom), R = reception
// (bottom-right), E = bar-restaurant (bottom-left).
const ROOM_ROWS = [
  'KKKKKKKKK',
  'K1112222K',
  'K1111222K',
  'WSSSSSSSE',
  'WWSSSSSEE',
  'AWBBBBBRE',
  'AAAABBBRR',
  'AAAABBRRR',
  'AAAABBBRR',
];

const ROOM_BY_LETTER: Record<string, string> = {
  K: 'corridor',
  '1': 'room1',
  '2': 'room2',
  W: 'stairW',
  E: 'stairE',
  S: 'suite',
  B: 'lobby',
  R: 'reception',
  A: 'bar',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Ковровая дорожка — центр коридора (row 0, cols 3-5); ковёр люкса — 2×2 центр.
const RUNNER_CELLS = new Set<CellId>([cellId(0, 3), cellId(0, 4), cellId(0, 5)]);
const SUITE_CARPET_CELLS = new Set<CellId>([cellId(4, 4), cellId(4, 5)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (RUNNER_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'runner' };
  if (SUITE_CARPET_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'suite-carpet' };
  return cell;
});

// Последний постоялец. Ночная смена: постояльцы — только Зоя и жертва Харитон (буквы З..Х),
// остальные — персонал. Последний постоялец Харитон ночевал в люксе; гостья Зоя убила его там.
const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'beata', name: 'Беата', initialLetter: 'Б', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: true, roles: ['guest'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#e0a94a', isVictim: true, isMurderer: false, roles: ['guest'] },
];

// Перестановка scaffold (suite:2 — жертва+убийца; по 1 на corridor/room1/room2/stairW/lobby/
// reception/bar; восточная лестница пуста — при 9 людях на 9×9 каждая строка занята ровно одним
// человеком, ряды 6-8 держат bar/lobby/reception, поэтому пустой может быть только зона из
// рядов 3-5: stairE): [8, 5, 2, 3, 4, 1, 6, 7, 0]. Харитон — (3,3) люкс (на кровати);
// Зоя [убийца] — (4,4) люкс (на ковре); Аркадий — (0,8) коридор; Беата — (1,5) номер 2;
// Владимир — (2,2) номер 1; Глафира — (5,1) зап. лестница; Есения — (6,6) лобби;
// Ждан — (7,7) ресепшн; Демьян — (8,0) бар.
const solution: Record<PersonId, CellId> = {
  arkady: cellId(0, 8),
  beata: cellId(1, 5),
  vladimir: cellId(2, 2),
  khariton: cellId(3, 3),
  zoya: cellId(4, 4),
  glafira: cellId(5, 1),
  esenia: cellId(6, 6),
  zhdan: cellId(7, 7),
  demyan: cellId(8, 0),
};

const clues: Clue[] = [
  // — Правила ночного отеля —
  {
    id: 'h-r1',
    type: 'letterRangeRole',
    fromLetter: 'З',
    toLetter: 'Х',
    roleId: 'guest',
    text: 'Все с Зои по Харитона были постояльцами отеля, остальные — персоналом ночной смены.',
  },
  {
    id: 'h-r2',
    type: 'roleZoneLimit',
    roleId: 'guest',
    roomIds: ['corridor', 'stairW', 'stairE', 'lobby', 'reception', 'bar'],
    maxCount: 0,
    text: 'Ночью постояльцам был закрыт доступ всюду, кроме жилых номеров.',
  },
  {
    id: 'h-r3',
    type: 'roleZoneMin',
    roleId: 'guest',
    roomIds: ['suite'],
    minCount: 1,
    text: 'Люкс не пустовал: в нём ночевал постоялец.',
  },
  // — Общие правила отеля —
  { id: 'h-bed-gender', type: 'itemTypeGender', itemTypeId: 'bed', gender: 'male', text: 'Женщины не ложились в кровати.' },
  { id: 'h-bath-gender', type: 'itemTypeGender', itemTypeId: 'bathtub', gender: 'female', text: 'Мужчины не принимали ванну.' },
  // — Коридор —
  { id: 'h-arkady-corner', type: 'corner', subject: { type: 'person', id: 'arkady' }, text: 'Аркадий находился в углу своей зоны.' },
  { id: 'h-arkady-clock', type: 'adjacency', subject: { type: 'person', id: 'arkady' }, itemTypeId: 'clock', text: 'Аркадий находился рядом с часами.' },
  // — Номер №2 —
  { id: 'h-beata-bed', type: 'adjacency', subject: { type: 'person', id: 'beata' }, itemTypeId: 'bed', text: 'Беата находилась рядом с кроватью.' },
  { id: 'h-beata-parity', type: 'parity', subject: { type: 'person', id: 'beata' }, axis: 'col', parity: 'even', text: 'Беата находилась в столбце с чётным номером.' },
  // — Номер №1 —
  { id: 'h-vladimir-bath', type: 'adjacency', subject: { type: 'person', id: 'vladimir' }, itemTypeId: 'bathtub', text: 'Владимир находился рядом с ванной.' },
  // — Западная лестница —
  { id: 'h-glafira-room', type: 'roomMembership', subject: { type: 'person', id: 'glafira' }, roomId: 'stairW', text: 'Глафира находилась на западной лестнице.' },
  { id: 'h-glafira-parity', type: 'parity', subject: { type: 'person', id: 'glafira' }, axis: 'col', parity: 'even', text: 'Глафира находилась в столбце с чётным номером.' },
  // — Лобби —
  { id: 'h-esenia-sofa', type: 'adjacency', subject: { type: 'person', id: 'esenia' }, itemTypeId: 'sofa', text: 'Есения находилась рядом с диваном.' },
  // — Ресепшн —
  { id: 'h-zhdan-room', type: 'roomMembership', subject: { type: 'person', id: 'zhdan' }, roomId: 'reception', text: 'Ждан находился на ресепшне.' },
  { id: 'h-zhdan-plant', type: 'adjacency', subject: { type: 'person', id: 'zhdan' }, itemTypeId: 'plant', text: 'Ждан находился рядом с растением.' },
  // — Бар-ресторан —
  {
    id: 'h-demyan-south',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demyan' },
    otherPersonId: 'zhdan',
    axis: 'row',
    direction: 'after',
    text: 'Демьян находился южнее Ждана.',
  },
  // — Люкс —
  { id: 'h-zoya-carpet', type: 'floorFeature', subject: { type: 'person', id: 'zoya' }, featureId: 'suite-carpet', text: 'Зоя находилась на ковре.' },
];

export const hotelLevel: Level = {
  meta: { id: 'hotel-01', title: 'Последний постоялец', theme: 'hotel', difficulty: 8, maxFullyPinnedPeople: 0 },
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
