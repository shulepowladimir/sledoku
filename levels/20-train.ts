import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 8;

// Ночной поезд, вид сверху: состав идёт с запада (локомотив) на восток. Вагоны — вертикальные
// полосы; в спальном вагоне западная колонна — купе (полки и столик), восточная — коридор с
// ковровой дорожкой. Вместимость вагона = число его колонн (по одному человеку на столбец).
const rooms: Room[] = [
  { id: 'loco', name: 'Локомотив', floorTexture: 'metal', labelPosition: 'top' },
  { id: 'baggage', name: 'Багажный вагон', floorTexture: 'wood' },
  { id: 'sleeper', name: 'Спальный вагон', floorTexture: 'carpet', labelPosition: 'top' },
  { id: 'dining', name: 'Вагон-ресторан', floorTexture: 'marble' },
  { id: 'platskart', name: 'Плацкартный вагон', floorTexture: 'linoleum', labelPosition: 'top' },
  { id: 'service', name: 'Служебный вагон', floorTexture: 'tile' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'runner', label: 'Ковровая дорожка', textureKey: 'rug' },
];

const itemTypes: ItemType[] = [
  { id: 'stove', label: 'Топка', kind: 'decorative', icon: 'saunaStove' },
  ItemLibrary.toolbox(),
  ItemLibrary.barrel('Бочка с водой'),
  ItemLibrary.box('Ящик с углем'),
  { id: 'linenBox', label: 'Ящик с бельём', kind: 'decorative', icon: 'box' },
  ItemLibrary.suitcase(),
  ItemLibrary.luggageRack(),
  ItemLibrary.berth(),
  ItemLibrary.table('Столик'),
  ItemLibrary.chair('Стул'),
  ItemLibrary.samovar(),
  ItemLibrary.bench('Нижняя полка'),
  ItemLibrary.rack('Стойка'),
  ItemLibrary.clock('Часы'),
  ItemLibrary.trashcan(),
];

const items: Item[] = [
  // Локомотив: топка, ящик с инструментами, бочка с водой, ящик с углем
  { id: 'item-stove', typeId: 'stove', cells: [cellId(1, 0)] },
  { id: 'item-toolbox', typeId: 'toolbox', cells: [cellId(3, 0)] },
  { id: 'item-barrel', typeId: 'barrel', cells: [cellId(5, 0)] },
  { id: 'item-coal', typeId: 'box', cells: [cellId(7, 0)] },
  // Багажный вагон: чемоданы ×3, багажная полка
  { id: 'item-suit-b1', typeId: 'suitcase', cells: [cellId(0, 1)] },
  { id: 'item-suit-b2', typeId: 'suitcase', cells: [cellId(2, 1)] },
  { id: 'item-suit-b3', typeId: 'suitcase', cells: [cellId(4, 1)] },
  { id: 'item-rack-b', typeId: 'luggageRack', cells: [cellId(6, 1)] },
  // Спальный вагон: полки ×4, столик купе, чемодан (колонна купе — запад)
  { id: 'item-berth-s1', typeId: 'berth', cells: [cellId(0, 2)] },
  { id: 'item-berth-s2', typeId: 'berth', cells: [cellId(1, 2)] },
  { id: 'item-table-s', typeId: 'table', cells: [cellId(2, 2), cellId(3, 2)] },
  { id: 'item-berth-s3', typeId: 'berth', cells: [cellId(4, 2)] },
  { id: 'item-berth-s4', typeId: 'berth', cells: [cellId(5, 2)] },
  { id: 'item-suit-s', typeId: 'suitcase', cells: [cellId(7, 2)] },
  // Вагон-ресторан: столики ×2, стулья ×2, самовар
  { id: 'item-table-r1', typeId: 'table', cells: [cellId(0, 4), cellId(1, 4)] },
  { id: 'item-table-r2', typeId: 'table', cells: [cellId(2, 4), cellId(3, 4)] },
  { id: 'item-chair-r1', typeId: 'chair', cells: [cellId(4, 4)] },
  { id: 'item-chair-r2', typeId: 'chair', cells: [cellId(5, 4)] },
  { id: 'item-samovar', typeId: 'samovar', cells: [cellId(7, 4)] },
  // Плацкартный вагон: нижние полки ×2, столик, чемодан (запад), багажная полка, ящик (восток)
  { id: 'item-bench-p1', typeId: 'bench', cells: [cellId(0, 5), cellId(1, 5)] },
  { id: 'item-bench-p2', typeId: 'bench', cells: [cellId(2, 5), cellId(3, 5)] },
  { id: 'item-table-p', typeId: 'table', cells: [cellId(4, 5), cellId(5, 5)] },
  { id: 'item-suit-p', typeId: 'suitcase', cells: [cellId(7, 5)] },
  { id: 'item-rack-p', typeId: 'luggageRack', cells: [cellId(2, 6)] },
  { id: 'item-box-p', typeId: 'linenBox', cells: [cellId(6, 6)] },
  // Служебный вагон: стойка, ящик с бельём, часы, урна
  { id: 'item-rack-v', typeId: 'rack', cells: [cellId(0, 7)] },
  { id: 'item-linen', typeId: 'box', cells: [cellId(2, 7)] },
  { id: 'item-clock-v', typeId: 'clock', cells: [cellId(4, 7)] },
  { id: 'item-trash-v', typeId: 'trashcan', cells: [cellId(7, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// L = локомотив, B = багажный, S = спальный (купе+коридор), R = вагон-ресторан,
// P = плацкартный, V = служебный.
const ROOM_ROWS = [
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
  'LBSSRPPV',
];

const ROOM_BY_LETTER: Record<string, string> = {
  L: 'loco',
  B: 'baggage',
  S: 'sleeper',
  R: 'dining',
  P: 'platskart',
  V: 'service',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Ковровая дорожка — коридор спального вагона (восточная колонна).
const RUNNER_CELLS = new Set<CellId>(
  Array.from({ length: size }, (_, row) => cellId(row, 3)),
);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (RUNNER_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'runner' } : cell));

// Перестановка: колонны-вагоны фиксируют вместимость (ширина вагона = число людей в нём),
// поэтому выбрана вручную под цепочку дедукции. Жертва Харитон и убийца Ефим — вдвоём в
// спальном вагоне (Ефим на полке у столика, Харитон — в коридоре на ковровой дорожке);
// Анфиса-проводница — в локомотиве (выводится из letterRole + roleZoneLimit).
const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['conductor'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'diana', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['conductor'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['passenger'] },
];

const solution: Record<PersonId, CellId> = {
  anfisa: cellId(0, 0),
  boris: cellId(1, 1),
  guriy: cellId(2, 5),
  zhdan: cellId(3, 7),
  efim: cellId(4, 2),
  veronika: cellId(5, 4),
  khariton: cellId(6, 3),
  diana: cellId(7, 6),
};

const clues: Clue[] = [
  // — Правила ночного поезда —
  { id: 't-letter-roles', type: 'letterRole', letterClass: 'vowel', roleId: 'conductor', text: 'Все, чьё имя начиналось на гласную букву, были проводниками; остальные — пассажирами.' },
  {
    id: 't-passengers-not-loco',
    type: 'roleZoneLimit',
    roleId: 'passenger',
    roomIds: ['loco'],
    maxCount: 0,
    text: 'Пассажиры не находились в локомотиве.',
  },
  // — Локомотив: Анфиса-проводница (позиция выводится из правил ролей: в локомотиве мог
  // находиться только проводник, а Ефим заперт на полке спального вагона) —
  {
    id: 't-anfisa-north-efim',
    type: 'relativePosition',
    subject: { type: 'person', id: 'anfisa' },
    otherPersonId: 'efim',
    axis: 'row',
    direction: 'before',
    offset: 4,
    text: 'Анфиса находилась ровно на четыре ряда севернее Ефима.',
  },
  // — Спальный вагон: убийца на полке у столика —
  { id: 't-efim-berth', type: 'occupiesItem', subject: { type: 'person', id: 'efim' }, itemTypeId: 'berth', text: 'Ефим лежал на полке.' },
  { id: 't-efim-table', type: 'adjacency', subject: { type: 'person', id: 'efim' }, itemTypeId: 'table', text: 'Ефим находился рядом со столиком.' },
  // — Багажный вагон —
  { id: 't-boris-suitcase', type: 'adjacency', subject: { type: 'person', id: 'boris' }, itemTypeId: 'suitcase', text: 'Борис находился рядом с чемоданом.' },
  {
    id: 't-boris-south-anfisa',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'anfisa',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Борис находился ровно на один ряд южнее Анфисы.',
  },
  // — Вагон-ресторан —
  { id: 't-veronika-chair', type: 'occupiesItem', subject: { type: 'person', id: 'veronika' }, itemTypeId: 'chair', text: 'Вероника сидела на стуле.' },
  // — Плацкартный вагон —
  { id: 't-guriy-bench', type: 'occupiesItem', subject: { type: 'person', id: 'guriy' }, itemTypeId: 'bench', text: 'Гурий сидел на нижней полке.' },
  { id: 't-diana-corner', type: 'corner', subject: { type: 'person', id: 'diana' }, text: 'Дина находилась в углу своей зоны.' },
  { id: 't-diana-guriy', type: 'sameRoomAs', subject: { type: 'person', id: 'diana' }, otherPersonId: 'guriy', text: 'Дина находилась в том же вагоне, что и Гурий.' },
  // — Служебный вагон —
  { id: 't-zhdan-clock', type: 'adjacency', subject: { type: 'person', id: 'zhdan' }, itemTypeId: 'clock', text: 'Ждан находился рядом с часами.' },
];

export const trainLevel: Level = {
  meta: { id: 'train-01', title: 'Последний рейс', theme: 'train', difficulty: 7, maxFullyPinnedPeople: 0 },
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
