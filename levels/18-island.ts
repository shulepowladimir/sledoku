import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

const rooms: Room[] = [
  { id: 'beach', name: 'Пляж', floorTexture: 'sand' },
  { id: 'jungle', name: 'Джунгли', floorTexture: 'grass' },
  { id: 'lagoon', name: 'Лагуна', floorTexture: 'water' },
  { id: 'rocks', name: 'Скалы', floorTexture: 'cliff' },
];

const floorFeatures: FloorFeature[] = [{ id: 'tidepool', label: 'Приливная лужа', textureKey: 'water' }];

const itemTypes: ItemType[] = [
  ItemLibrary.palm(),
  ItemLibrary.rock(),
  ItemLibrary.coconut(),
  ItemLibrary.hammock(),
  ItemLibrary.hut(),
  ItemLibrary.bottle(),
  ItemLibrary.shell(),
  ItemLibrary.campfire(),
  ItemLibrary.chest('Сундук с сокровищами'),
];

const items: Item[] = [
  // Пляж: пальмы ×3, кокос, бутылка с письмом, ракушка
  { id: 'item-palm-b1', typeId: 'palm', cells: [cellId(0, 1)] },
  { id: 'item-palm-b2', typeId: 'palm', cells: [cellId(2, 1)] },
  { id: 'item-palm-b3', typeId: 'palm', cells: [cellId(4, 6)] },
  { id: 'item-coconut-b', typeId: 'coconut', cells: [cellId(6, 1)] },
  { id: 'item-bottle-b', typeId: 'bottle', cells: [cellId(0, 5)] },
  { id: 'item-shell-b1', typeId: 'shell', cells: [cellId(6, 4)] },
  // Джунгли: пальмы ×2, гамаки ×2, шалаш 2-кл., костёр, кокос
  { id: 'item-palm-j1', typeId: 'palm', cells: [cellId(1, 3)] },
  { id: 'item-palm-j2', typeId: 'palm', cells: [cellId(3, 1)] },
  { id: 'item-hammock-j1', typeId: 'hammock', cells: [cellId(1, 4)] },
  { id: 'item-hammock-j2', typeId: 'hammock', cells: [cellId(4, 3)] },
  { id: 'item-hut', typeId: 'hut', cells: [cellId(2, 4), cellId(2, 5)] },
  { id: 'item-campfire-j', typeId: 'campfire', cells: [cellId(2, 2)] },
  { id: 'item-coconut-j', typeId: 'coconut', cells: [cellId(4, 2)] },
  // Лагуна: ракушка
  { id: 'item-shell-l1', typeId: 'shell', cells: [cellId(2, 6)] },
  // Скалы: камни ×3, сундук с сокровищами
  { id: 'item-rock-r1', typeId: 'rock', cells: [cellId(5, 3)] },
  { id: 'item-rock-r2', typeId: 'rock', cells: [cellId(6, 5)] },
  { id: 'item-rock-r3', typeId: 'rock', cells: [cellId(5, 4)] },
  { id: 'item-chest-r', typeId: 'chest', cells: [cellId(6, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// B = beach ring, J = jungle (center-left), L = lagoon (right wedge), R = rocks (bottom notch).
const ROOM_ROWS = [
  'BBBBBBB',
  'BJJJJLB',
  'BJJJLLB',
  'BJJJLLB',
  'BJJJLLB',
  'BJJRRRB',
  'BBBRBBB',
];

const ROOM_BY_LETTER: Record<string, string> = {
  B: 'beach',
  J: 'jungle',
  L: 'lagoon',
  R: 'rocks',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Приливная лужа — на стыке пляжа и скал.
const TIDEPOOL_CELLS = new Set<CellId>([cellId(6, 2), cellId(6, 3)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (TIDEPOOL_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'tidepool' } : cell));

// Перестановка scaffold [6,1,0,4,5,2,3] (jungle:2, beach:2, lagoon:2, rocks:1): жертва Харита
// (1,1) и убийца Галина (5,2) — джунгли; Белла (0,6) и Владимир (2,0) — пляж;
// Демьян (3,4) и Есения (4,5) — лагуна; Андрей (6,3) — скалы, на приливной луже.
const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'kharita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#e0a94a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  andrey: cellId(6, 3),
  bella: cellId(0, 6),
  vladimir: cellId(2, 0),
  galina: cellId(5, 2),
  demyan: cellId(3, 4),
  esenia: cellId(4, 5),
  kharita: cellId(1, 1),
};

const clues: Clue[] = [
  // — Общие правила острова —
  { id: 'i-occupancy', type: 'roomOccupancy', text: 'Ни одна зона острова не осталась пустой.' },
  {
    id: 'i-population',
    type: 'roomPopulation',
    roomId: 'rocks',
    comparison: 'least',
    text: 'Скалы — самая безлюдная зона острова.',
  },
  // — Пляж —
  { id: 'i-bella-bottle', type: 'adjacency', subject: { type: 'person', id: 'bella' }, itemTypeId: 'bottle', text: 'Белла находилась рядом с бутылкой с письмом.' },
  {
    id: 'i-vladimir-parity',
    type: 'parity',
    subject: { type: 'person', id: 'vladimir' },
    axis: 'col',
    parity: 'odd',
    text: 'Владимир находился в столбце с нечётным номером.',
  },
  { id: 'i-vladimir-notcorner', type: 'corner', subject: { type: 'person', id: 'vladimir' }, negated: true, text: 'Владимир не находился в углу своей зоны.' },
  // — Джунгли: жертва и убийца —
  { id: 'i-galina-room', type: 'roomMembership', subject: { type: 'person', id: 'galina' }, roomId: 'jungle', text: 'Галина находилась в джунглях.' },
  {
    id: 'i-galina-west',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'esenia',
    axis: 'col',
    direction: 'before',
    offset: 3,
    text: 'Галина находилась ровно на три столбца западнее Есении.',
  },
  {
    id: 'i-galina-south-demyan',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'demyan',
    axis: 'row',
    direction: 'after',
    offset: 2,
    text: 'Галина находилась ровно на два ряда южнее Демьяна.',
  },
  // — Лагуна —
  { id: 'i-demyan-bungalow', type: 'adjacency', subject: { type: 'person', id: 'demyan' }, itemTypeId: 'hut', text: 'Демьян находился рядом с бунгало.' },
  { id: 'i-esenia-corner', type: 'corner', subject: { type: 'person', id: 'esenia' }, text: 'Есения находилась в углу своей зоны.' },
  { id: 'i-esenia-parity', type: 'parity', subject: { type: 'person', id: 'esenia' }, axis: 'col', parity: 'even', text: 'Есения находилась в столбце с чётным номером.' },
  {
    id: 'i-esenia-between',
    type: 'betweenness',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId1: 'demyan',
    otherPersonId2: 'galina',
    axis: 'row',
    text: 'По рядам Есения находилась между Демьяном и Галиной.',
  },
  // — Скалы —
  { id: 'i-andrey-tidepool', type: 'floorFeature', subject: { type: 'person', id: 'andrey' }, featureId: 'tidepool', text: 'Андрей находился в приливной луже.' },
];

export const islandLevel: Level = {
  meta: { id: 'island-01', title: 'Тайна необитаемого острова', theme: 'island', difficulty: 5, maxFullyPinnedPeople: 0 },
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
