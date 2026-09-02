import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

const rooms: Room[] = [
  { id: 'train', name: 'Вагон поезда', floorTexture: 'linoleum' },
  { id: 'platform', name: 'Перрон', floorTexture: 'stone' },
  { id: 'kassa', name: 'Касса', floorTexture: 'tile' },
  { id: 'waitingRoom', name: 'Зал ожидания', floorTexture: 'wood' },
  { id: 'cafe', name: 'Кафе', floorTexture: 'marble' },
];

const floorFeatures: FloorFeature[] = [{ id: 'station-rug', label: 'Ковровая дорожка', textureKey: 'rug' }];
const RUG_CELLS = new Set([cellId(4, 4), cellId(5, 4)]);

const itemTypes: ItemType[] = [
  { id: 'suitcase', label: 'Чемодан', kind: 'decorative', icon: 'suitcase' },
  { id: 'departureBoard', label: 'Табло отправления', kind: 'decorative', icon: 'departureBoard' },
  { id: 'turnstile', label: 'Турникет', kind: 'decorative', icon: 'turnstile' },
  { id: 'clock', label: 'Часы', kind: 'decorative', icon: 'clock' },
  ItemLibrary.bench(),
  ItemLibrary.rack('Багажная полка'),
  ItemLibrary.lamppost(),
  ItemLibrary.trashcan(),
  ItemLibrary.box(),
  ItemLibrary.chair(),
];

const items: Item[] = [
  // Train
  { id: 'item-suitcase-1', typeId: 'suitcase', cells: [cellId(0, 2)] },
  { id: 'item-suitcase-2', typeId: 'suitcase', cells: [cellId(0, 5)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(1, 0)] },
  { id: 'item-rack-1', typeId: 'rack', cells: [cellId(1, 1), cellId(1, 2)] },
  // Platform
  { id: 'item-lamppost-1', typeId: 'lamppost', cells: [cellId(2, 0)] },
  { id: 'item-clock-1', typeId: 'clock', cells: [cellId(2, 4)] },
  { id: 'item-trashcan-1', typeId: 'trashcan', cells: [cellId(2, 5)] },
  { id: 'item-turnstile', typeId: 'turnstile', cells: [cellId(3, 2)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(3, 0)] },
  // Kassa
  { id: 'item-clock-2', typeId: 'clock', cells: [cellId(5, 1)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(4, 0)] },
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(4, 2)] },
  // Waiting room
  { id: 'item-departure-board', typeId: 'departureBoard', cells: [cellId(4, 5), cellId(4, 6)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(3, 4)] },
  { id: 'item-trashcan-2', typeId: 'trashcan', cells: [cellId(4, 3)] },
  // Cafe
  { id: 'item-box-2', typeId: 'box', cells: [cellId(6, 0)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(6, 4)] },
  { id: 'item-trashcan-3', typeId: 'trashcan', cells: [cellId(6, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Five zones on a 7x7 board: train car (T, top 2 rows, rectangular) sits above the platform (P, an
// L-shape wrapping down the left side), which in turn borders the kassa booth (K, rectangular) and
// the waiting room (W, an L-shape); the cafe (C) fills the bottom band and the waiting room's corner.
const ROOM_ROWS = [
  'TTTTTTT',
  'TTTTTTT',
  'PPPPPPP',
  'PPPWWWW',
  'KKKWWWW',
  'KKKWWCC',
  'CCCCCCC',
];
const ROOM_BY_LETTER: Record<string, string> = {
  T: 'train',
  P: 'platform',
  K: 'kassa',
  W: 'waitingRoom',
  C: 'cafe',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'station-rug' } : cell));

const people: Person[] = [
  { id: 'arkadiy', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: true },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#7cc9e8', isVictim: true, isMurderer: false },
];

// Hand-derived row -> column permutation (AllDifferent on both axes); waitingRoom holds exactly
// the victim (hristina) and the murderer (demyan), every other room holds at least one person.
const solution: Record<PersonId, CellId> = {
  arkadiy: cellId(0, 0),
  esenia: cellId(1, 4),
  borislav: cellId(2, 2),
  hristina: cellId(3, 6),
  vasilisa: cellId(4, 1),
  demyan: cellId(5, 3),
  glafira: cellId(6, 5),
};

const clues: Clue[] = [
  {
    id: 's1',
    type: 'letterGroupRoom',
    letterClass: 'vowel',
    text: 'Люди с именами на гласную букву находились в одной и той же зоне.',
  },
  {
    id: 's2',
    type: 'roomOccupancy',
    text: 'Ни одна зона не осталась пустой.',
  },
  {
    id: 's3',
    type: 'roomMembership',
    subject: { type: 'person', id: 'arkadiy' },
    roomId: 'train',
    text: 'Аркадий находился в вагоне поезда.',
  },
  {
    id: 's4',
    type: 'corner',
    subject: { type: 'person', id: 'arkadiy' },
    text: 'Аркадий находился в углу своей зоны.',
  },
  {
    id: 's5',
    type: 'wallSide',
    subject: { type: 'person', id: 'esenia' },
    wallDirection: 'south',
    text: 'Есения находилась у южной стены своей зоны.',
  },
  {
    id: 's6',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'arkadiy',
    axis: 'col',
    direction: 'after',
    offset: 4,
    text: 'Есения находилась ровно на четыре столбца восточнее Аркадия.',
  },
  {
    id: 's7',
    type: 'adjacency',
    subject: { type: 'person', id: 'borislav' },
    itemTypeId: 'turnstile',
    text: 'Борислав находился рядом с турникетом.',
  },
  {
    id: 's8',
    type: 'adjacency',
    subject: { type: 'person', id: 'vasilisa' },
    itemTypeId: 'box',
    text: 'Василиса находилась рядом с коробкой.',
  },
  {
    id: 's9',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'vasilisa' },
    itemTypeId: 'clock',
    text: 'Василиса находилась в одной комнате с часами.',
  },
  {
    id: 's10',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demyan' },
    roomId: 'waitingRoom',
    text: 'Демьян находился в зале ожидания.',
  },
  {
    id: 's11',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demyan' },
    otherPersonId: 'vasilisa',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Демьян находился ровно на один ряд южнее Василисы.',
  },
  {
    id: 's12',
    type: 'adjacency',
    subject: { type: 'person', id: 'glafira' },
    itemTypeId: 'trashcan',
    text: 'Глафира находилась рядом с урной.',
  },
];

export const stationLevel: Level = {
  meta: { id: 'station-01', title: 'Пропажа на вокзале', theme: 'station', difficulty: 10, maxFullyPinnedPeople: 0 },
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
