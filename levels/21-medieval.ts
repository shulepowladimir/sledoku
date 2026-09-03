import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 8;

// Феодальный замок, вид сверху. Север: часовня (запад), королевские покои (центр), казарма
// стражи (восток). Центр — тронный зал. Юго-восток — конюшня, юг — мощёный двор с колодцем.
const rooms: Room[] = [
  { id: 'chapel', name: 'Часовня', floorTexture: 'marble' },
  { id: 'quarters', name: 'Королевские покои', floorTexture: 'carpet' },
  { id: 'throne', name: 'Тронный зал', floorTexture: 'stone' },
  { id: 'barracks', name: 'Казарма стражи', floorTexture: 'wood' },
  { id: 'stable', name: 'Конюшня', floorTexture: 'dirt' },
  { id: 'yard', name: 'Двор', floorTexture: 'cobble' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'altar-rug', label: 'Ковёр перед алтарём', textureKey: 'rug' },
  { id: 'yard-puddle', label: 'Лужа', textureKey: 'dirt' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.horse(),
  ItemLibrary.throne(),
  ItemLibrary.candleStand(),
  ItemLibrary.chest('Сундук с данью'),
  { id: 'royalChest', label: 'Королевский сундук', kind: 'decorative', icon: 'artifactChest' },
  ItemLibrary.barrel('Бочка с вином'),
  ItemLibrary.table('Пиршественный стол'),
  ItemLibrary.bench('Скамья'),
  ItemLibrary.armorStand(),
  ItemLibrary.weaponRack(),
  // Два разных спальных места — раздельные typeId: label ищется по id через Map, дубль id
  // затирает первый label (лонже в тултипе показывалась бы «Койка стражника»).
  { id: 'royalBed', label: 'Королевское ложе', kind: 'occupiable', icon: 'bed' },
  ItemLibrary.bed('Койка стражника'),
  ItemLibrary.well(),
  ItemLibrary.haystack('Стог сена'),
  ItemLibrary.trough('Корыто с водой'),
];

const items: Item[] = [
  // Часовня (rows 0-2, west): подсвечник, сундук с данью
  { id: 'item-candles-ch', typeId: 'candleStand', cells: [cellId(0, 1)] },
  { id: 'item-chest-ch', typeId: 'chest', cells: [cellId(2, 0)] },
  // Королевские покои (north-center + west ledge): ложе, подсвечник, сундук, бочка
  { id: 'item-bed-q', typeId: 'royalBed', cells: [cellId(1, 4)] },
  { id: 'item-candles-q', typeId: 'candleStand', cells: [cellId(0, 3)] },
  { id: 'item-chest-q', typeId: 'royalChest', cells: [cellId(3, 1)] },
  { id: 'item-barrel-q', typeId: 'barrel', cells: [cellId(2, 3)] },
  // Тронный зал (center): трон на подиуме 2-кл., пиршественный стол 2-кл., скамья
  { id: 'item-throne', typeId: 'throne', cells: [cellId(4, 2), cellId(5, 2)] },
  { id: 'item-table-t', typeId: 'table', cells: [cellId(4, 3), cellId(4, 4)] },
  { id: 'item-bench-t', typeId: 'bench', cells: [cellId(4, 5)] },
  // Казарма стражи (north-east): стойка с оружием, доспех, койка, лошадь стражи
  { id: 'item-weapon-rack', typeId: 'weaponRack', cells: [cellId(0, 5)] },
  { id: 'item-armor-b', typeId: 'armorStand', cells: [cellId(1, 6)] },
  { id: 'item-bed-b', typeId: 'bed', cells: [cellId(2, 7)] },
  { id: 'item-horse-b', typeId: 'horse', cells: [cellId(0, 7)] },
  // Конюшня (south-east): лошади ×2, стог сена, корыто
  { id: 'item-horse-s1', typeId: 'horse', cells: [cellId(4, 6)] },
  { id: 'item-horse-s2', typeId: 'horse', cells: [cellId(5, 6)] },
  { id: 'item-hay', typeId: 'haystack', cells: [cellId(6, 6)] },
  { id: 'item-trough', typeId: 'trough', cells: [cellId(7, 6)] },
  // Двор (south): колодец, лошадь, скамья, бочка
  { id: 'item-well', typeId: 'well', cells: [cellId(6, 2)] },
  { id: 'item-horse-y', typeId: 'horse', cells: [cellId(6, 4)] },
  { id: 'item-bench-y', typeId: 'bench', cells: [cellId(7, 0)] },
  { id: 'item-barrel-y', typeId: 'barrel', cells: [cellId(7, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// C = часовня, Q = королевские покои, T = тронный зал, B = казарма стражи,
// S = конюшня, Y = двор.
const ROOM_ROWS = [
  'CCCQQBBB',
  'CCCQQBBB',
  'CCQQTTBB',
  'QQTTTTSS',
  'YYTTTTSS',
  'YYTTTTSS',
  'YYYYYYSS',
  'YYYYYYSS',
];

const ROOM_BY_LETTER: Record<string, string> = {
  C: 'chapel',
  Q: 'quarters',
  T: 'throne',
  B: 'barracks',
  S: 'stable',
  Y: 'yard',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Ковёр перед алтарём — центр часовни (2 клетки: у алтаря и при входе).
// Лужа во дворе у западной стены (2 клетки).
const ALTAR_RUG_CELLS = new Set<CellId>([cellId(1, 1), cellId(2, 1)]);
const YARD_PUDDLE_CELLS = new Set<CellId>([cellId(7, 0), cellId(7, 1)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
)
  .map((cell) => (ALTAR_RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'altar-rug' } : cell))
  .map((cell) => (YARD_PUDDLE_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'yard-puddle' } : cell));

// Расстановка (подобрана скриптом, AllDifferent по рядам/столбцам соблюдён):
// Андрей(0,4) покои — стражник при короле; Ждан(1,5) казарма — стражник; Вероника(2,1) часовня —
// на ковре; Гурий(3,0) покои — король у сундука; Елисей(4,6) конюшня — убийца верхом;
// Борис(5,2) тронный — на троне; Дина(6,3) двор — у колодца; Харитон(7,7) конюшня — жертва у корыта.
const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: false, roles: [] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: [] },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: [] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: [] },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: [] },
  { id: 'elisey', name: 'Елисей', initialLetter: 'Е', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: [] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: [] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false, roles: [] },
];

const solution: Record<PersonId, CellId> = {
  andrey: cellId(0, 4),
  zhdan: cellId(1, 5),
  veronika: cellId(2, 1),
  guriy: cellId(3, 0),
  elisey: cellId(4, 6),
  boris: cellId(5, 2),
  dina: cellId(6, 3),
  khariton: cellId(7, 7),
};

const clues: Clue[] = [
  // — Общие правила замка —
  { id: 'm-occupancy', type: 'roomOccupancy', text: 'Ни одна зона замка не осталась пустой.' },
  // — Убийца верхом (анонимная роль-клю; лошади в 3 зонах: конюшня ×2, двор, казарма) —
  {
    id: 'm-murderer-horse',
    type: 'occupiesItem',
    subject: { type: 'role', role: 'murderer' },
    itemTypeId: 'horse',
    text: 'Убийца находился верхом на лошади.',
  },
  // — Королевские покои —
  { id: 'm-guriy-room', type: 'roomMembership', subject: { type: 'person', id: 'guriy' }, roomId: 'quarters', text: 'Гурий находился в королевских покоях.' },
  { id: 'm-guriy-parity', type: 'parity', subject: { type: 'person', id: 'guriy' }, axis: 'row', parity: 'even', text: 'Гурий находился в ряду с чётным номером.' },
  { id: 'm-andrey-bed', type: 'adjacency', subject: { type: 'person', id: 'andrey' }, itemTypeId: 'royalBed', text: 'Андрей находился рядом с королевским ложем.' },
  // — Казарма —
  {
    id: 'm-zhdan-south-andrey',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'andrey',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Ждан находился ровно на один ряд южнее Андрея.',
  },
  // — Часовня —
  { id: 'm-veronika-rug', type: 'floorFeature', subject: { type: 'person', id: 'veronika' }, featureId: 'altar-rug', text: 'Вероника находилась на ковре перед алтарём.' },
  // — Тронный зал: трон 2-клеточный, «южнее Елисея» фиксирует клетку Бориса —
  { id: 'm-boris-throne', type: 'occupiesItem', subject: { type: 'person', id: 'boris' }, itemTypeId: 'throne', text: 'Борис сидел на троне.' },
  {
    id: 'm-boris-south-elisey',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'elisey',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Борис находился ровно на один ряд южнее Елисея.',
  },
  // — Двор —
  { id: 'm-dina-well', type: 'adjacency', subject: { type: 'person', id: 'dina' }, itemTypeId: 'well', text: 'Дина находилась рядом с колодцем.' },
  // — Конюшня: убийца верхом (жертва — «наедине с убийцей», личных клю у жертвы нет) —
  { id: 'm-elisey-parity', type: 'parity', subject: { type: 'person', id: 'elisey' }, axis: 'col', parity: 'odd', text: 'Елисей находился в столбце с нечётным номером.' },
];

export const medievalLevel: Level = {
  meta: { id: 'medieval-01', title: 'Заговор в замке', theme: 'medieval', difficulty: 6, maxFullyPinnedPeople: 0 },
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
