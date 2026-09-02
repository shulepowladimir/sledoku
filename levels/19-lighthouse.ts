import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

// Вертикальная башня-конус: Фонарная (верх, metal) → Жилая палуба (wood) → Основание с винтовой
// лестницей (stairs) у земли; верхнее кольцо — скалы (cliff), нижнее — мощёный двор с причалом (cobble).
const rooms: Room[] = [
  { id: 'lampRoom', name: 'Фонарная', floorTexture: 'metal' },
  { id: 'living', name: 'Жилая палуба', floorTexture: 'wood' },
  { id: 'base', name: 'Основание маяка', floorTexture: 'stairs' },
  { id: 'rocks', name: 'Скалы', floorTexture: 'cliff' },
  { id: 'yard', name: 'Двор с причалом', floorTexture: 'cobble' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'living-rug', label: 'Ковёр', textureKey: 'rug' },
  { id: 'path', label: 'Тропа к маяку', textureKey: 'dirt' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.lamp(),
  ItemLibrary.telescope('Вахтенная труба'),
  ItemLibrary.bed('Койка смотрителя'),
  ItemLibrary.journal('Вахтенный журнал'),
  ItemLibrary.clock(),
  ItemLibrary.armchair(),
  ItemLibrary.floorLamp('Торшер'),
  ItemLibrary.portrait(),
  ItemLibrary.ladder(),
  ItemLibrary.box(),
  ItemLibrary.barrel(),
  ItemLibrary.lamppost('Фонарь двора'),
  ItemLibrary.bench(),
  ItemLibrary.rock(),
  ItemLibrary.tree('Ель на скалах'),
  ItemLibrary.boat(),
];

const items: Item[] = [
  // Фонарная: лампа, вахтенная труба
  { id: 'item-lamp', typeId: 'lamp', cells: [cellId(0, 3)] },
  { id: 'item-telescope', typeId: 'telescope', cells: [cellId(1, 4)] },
  // Жилая палуба: койка, вахтенный журнал, часы, кресло, торшер, портрет
  { id: 'item-bed', typeId: 'bed', cells: [cellId(2, 3)] },
  { id: 'item-journal', typeId: 'journal', cells: [cellId(3, 3)] },
  { id: 'item-clock', typeId: 'clock', cells: [cellId(2, 2)] },
  { id: 'item-armchair', typeId: 'armchair', cells: [cellId(3, 2)] },
  { id: 'item-torsher', typeId: 'floorLamp', cells: [cellId(2, 4)] },
  { id: 'item-portrait', typeId: 'portrait', cells: [cellId(3, 1)] },
  // Основание: стремянка, коробка
  { id: 'item-ladder', typeId: 'ladder', cells: [cellId(4, 3)] },
  { id: 'item-box', typeId: 'box', cells: [cellId(5, 3)] },
  // Скалы: камни ×3, растение
  { id: 'item-rock-s1', typeId: 'rock', cells: [cellId(0, 0)] },
  { id: 'item-rock-s2', typeId: 'rock', cells: [cellId(2, 1)] },
  { id: 'item-rock-s3', typeId: 'rock', cells: [cellId(1, 6)] },
  { id: 'item-plant-s', typeId: 'tree', cells: [cellId(0, 6)] },
  // Двор с причалом: ял 2-кл., фонари ×2, скамья, бочка
  { id: 'item-boat', typeId: 'boat', cells: [cellId(6, 1), cellId(6, 2)] },
  { id: 'item-lamp-y1', typeId: 'lamppost', cells: [cellId(5, 0)] },
  { id: 'item-lamp-y2', typeId: 'lamppost', cells: [cellId(6, 5)] },
  { id: 'item-bench-y', typeId: 'bench', cells: [cellId(5, 5)] },
  { id: 'item-barrel-y', typeId: 'barrel', cells: [cellId(6, 0)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// L = lamp room (top), V = living deck, B = base with spiral stairs, R = rocks (upper ring),
// Y = cobbled yard with jetty (bottom).
const ROOM_ROWS = [
  'RRLLLRR',
  'RRLLLRR',
  'RRVVVRR',
  'RVVVVVR',
  'YBBBBBY',
  'YBBBBYY',
  'YYYYYYY',
];

const ROOM_BY_LETTER: Record<string, string> = {
  L: 'lampRoom',
  V: 'living',
  B: 'base',
  R: 'rocks',
  Y: 'yard',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Ковёр — центр жилой палубы; тропа — от причала к основанию.
const RUG_CELLS = new Set<CellId>([cellId(3, 3)]);
const PATH_CELLS = new Set<CellId>([cellId(5, 2), cellId(6, 4)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (RUG_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'living-rug' };
  if (PATH_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'path' };
  return cell;
});

// Перестановка scaffold [4,3,5,2,0,1,6] (lampRoom:2, rocks:1, living:1, base:1, yard:2):
// жертва Хиония (0,4) и убийца Демьян (1,3) — фонарная, у самой лампы; Глафира (2,5) — скалы;
// Владимир (3,2) — жилая палуба; Белла (4,0) — двор; Аркадий (5,1) — основание; Есения (6,6) — двор.
const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'khionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#e0a94a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  khionia: cellId(0, 4),
  demyan: cellId(1, 3),
  glafira: cellId(2, 5),
  vladimir: cellId(3, 2),
  bella: cellId(4, 0),
  arkady: cellId(5, 1),
  esenia: cellId(6, 6),
};

const clues: Clue[] = [
  // — Общие правила маяка —
  { id: 'lh-occupancy', type: 'roomOccupancy', text: 'Ни одна зона маяка не осталась пустой.' },
  {
    id: 'lh-glafira-roomsize',
    type: 'roomSize',
    subject: { type: 'person', id: 'glafira' },
    comparison: 'largest',
    text: 'Глафира находилась в самой большой зоне маяка.',
  },
  // — Фонарная: убийца —
  { id: 'lh-demyan-telescope', type: 'adjacency', subject: { type: 'person', id: 'demyan' }, itemTypeId: 'telescope', text: 'Демьян находился рядом с вахтенной трубой.' },
  {
    id: 'lh-demyan-east-bella',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demyan' },
    otherPersonId: 'bella',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Демьян находился ровно на три столбца восточнее Беллы.',
  },
  // — Жилая палуба —
  { id: 'lh-vladimir-clock', type: 'adjacency', subject: { type: 'person', id: 'vladimir' }, itemTypeId: 'clock', text: 'Владимир находился рядом с часами.' },
  // — Скалы —
  { id: 'lh-glafira-corner', type: 'corner', subject: { type: 'person', id: 'glafira' }, text: 'Глафира находилась в углу своей зоны.' },
  // — Основание —
  { id: 'lh-arkady-west', type: 'wallSide', subject: { type: 'person', id: 'arkady' }, wallDirection: 'west', text: 'Аркадий находился у западной стены своей зоны.' },
  { id: 'lh-arkady-parity', type: 'parity', subject: { type: 'person', id: 'arkady' }, axis: 'row', parity: 'even', text: 'Аркадий находился в ряду с чётным номером.' },
  // — Двор с причалом —
  { id: 'lh-bella-lamp', type: 'adjacency', subject: { type: 'person', id: 'bella' }, itemTypeId: 'lamppost', text: 'Белла находилась рядом с фонарём двора.' },
  { id: 'lh-esenia-corner', type: 'corner', subject: { type: 'person', id: 'esenia' }, text: 'Есения находилась в углу своей зоны.' },
  {
    id: 'lh-esenia-south',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'bella',
    axis: 'row',
    direction: 'after',
    offset: 2,
    text: 'Есения находилась ровно на два ряда южнее Беллы.',
  },
];

export const lighthouseLevel: Level = {
  meta: { id: 'lighthouse-01', title: 'Пропавший смотритель', theme: 'lighthouse', difficulty: 5, maxFullyPinnedPeople: 0 },
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
