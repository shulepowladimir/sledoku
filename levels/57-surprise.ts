import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

const rooms: Room[] = [
  { id: 'lockLab', name: 'Лабораторный отсек', floorTexture: 'metal', labelPosition: 'top', labelAlign: 'left' },
  { id: 'glassObservatory', name: 'Смотровой купол', floorTexture: 'tile', labelPosition: 'top', labelAlign: 'right' },
  { id: 'engineBay', name: 'Машинный отсек', floorTexture: 'stone', labelAlign: 'left' },
  { id: 'livingPod', name: 'Жилой модуль', floorTexture: 'wood', labelAlign: 'right' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'service-grating', label: 'Решётчатый настил', textureKey: 'metal' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.camera(),
  ItemLibrary.computer('Пульт связи'),
  ItemLibrary.table('Рабочий стол'),
  ItemLibrary.toolbox(),
  ItemLibrary.fireExtinguisher(),
  ItemLibrary.lamp('Сигнальная лампа'),
  ItemLibrary.ladder(),
  ItemLibrary.chair('Кресло оператора'),
  ItemLibrary.box('Контейнер'),
  ItemLibrary.clock('Таймер'),
];

const items: Item[] = [
  { id: 'camera-lock', typeId: 'camera', cells: [cellId(0, 0)] },
  { id: 'console-lock', typeId: 'computer', cells: [cellId(0, 2)] },
  { id: 'table-glass', typeId: 'table', cells: [cellId(1, 8)] },
  { id: 'toolbox-glass', typeId: 'toolbox', cells: [cellId(1, 7)] },
  { id: 'lamp-lock', typeId: 'lamp', cells: [cellId(2, 0)] },
  { id: 'box-lock', typeId: 'box', cells: [cellId(2, 4)] },
  { id: 'extinguisher-glass', typeId: 'fireExtinguisher', cells: [cellId(3, 1)] },
  { id: 'chair-glass', typeId: 'chair', cells: [cellId(3, 5)] },
  { id: 'ladder-lab', typeId: 'ladder', cells: [cellId(4, 0)] },
  { id: 'camera-engine', typeId: 'camera', cells: [cellId(4, 8)] },
  { id: 'lamp-engine', typeId: 'lamp', cells: [cellId(5, 1)] },
  { id: 'clock-engine', typeId: 'clock', cells: [cellId(5, 7)] },
  { id: 'console-engine', typeId: 'computer', cells: [cellId(6, 8)] },
  { id: 'toolbox-engine', typeId: 'toolbox', cells: [cellId(6, 4)] },
  { id: 'extinguisher-pod', typeId: 'fireExtinguisher', cells: [cellId(7, 2)] },
  { id: 'chair-pod', typeId: 'chair', cells: [cellId(7, 6)] },
  { id: 'table-pod', typeId: 'table', cells: [cellId(8, 1)] },
  { id: 'box-pod', typeId: 'box', cells: [cellId(9, 0)] },
];

const ROOM_ROWS = [
  'AAAAABBBBB',
  'AAAAABBBBB',
  'AAAAABBBBB',
  'AAAAABBBBB',
  'AAAAABBBBB',
  'CCCCCDDDDD',
  'CCCCCDDDDD',
  'CCCCCDDDDD',
  'CCCCCDDDDD',
  'CCCCCDDDDD',
];

const ROOM_BY_LETTER: Record<string, string> = {
  A: 'lockLab',
  B: 'glassObservatory',
  C: 'engineBay',
  D: 'livingPod',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const SERVICE_GRATING_CELLS = new Set([
  cellId(0, 1), cellId(0, 5), cellId(0, 8), cellId(1, 4), cellId(1, 6), cellId(1, 9),
  cellId(2, 1), cellId(2, 5), cellId(2, 7), cellId(3, 4), cellId(3, 6), cellId(4, 2),
  cellId(4, 7), cellId(5, 2), cellId(5, 8), cellId(6, 1), cellId(6, 6), cellId(7, 3),
  cellId(7, 9), cellId(8, 0), cellId(8, 6), cellId(9, 2),
]);

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  SERVICE_GRATING_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'service-grating' } : cell,
);

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: true },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(0, 6),
  boris: cellId(1, 1),
  viktor: cellId(3, 8),
  galina: cellId(6, 3),
  denis: cellId(4, 9),
  esenya: cellId(5, 5),
  zhdan: cellId(7, 0),
  zoya: cellId(8, 4),
  inna: cellId(9, 7),
  khariton: cellId(2, 2),
};

const clues: Clue[] = [
  {
    id: 's57-room-occupancy',
    type: 'roomOccupancy',
    text: 'Во всех отсеках находился хотя бы один человек.',
  },
  {
    id: 's57-lock-lab-count',
    type: 'zoneExactCount',
    roomId: 'lockLab',
    count: 2,
    text: 'В лабораторном отсеке находились ровно два человека.',
  },
  {
    id: 's57-anna-observatory',
    type: 'roomMembership',
    subject: { type: 'person', id: 'anna' },
    roomId: 'glassObservatory',
    text: 'Анна находилась в смотровом куполе.',
  },
  {
    id: 's57-anna-first-row',
    type: 'position',
    subject: { type: 'person', id: 'anna' },
    axis: 'row',
    value: 0,
    text: 'Анна стояла в первом ряду.',
  },
  {
    id: 's57-anna-camera-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'anna' },
    itemTypeId: 'camera',
    text: 'Анна находилась в одной зоне с камерой наблюдения.',
  },
  {
    id: 's57-boris-lock-lab',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'lockLab',
    text: 'Борис находился в лабораторном отсеке.',
  },
  {
    id: 's57-boris-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'col',
    parity: 'even',
    text: 'Борис стоял во втором, четвёртом, шестом, восьмом или десятом столбце.',
  },
  {
    id: 's57-boris-south-of-anna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'anna',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Борис находился ровно на один ряд южнее Анны.',
  },
  {
    id: 's57-viktor-fourth-row',
    type: 'position',
    subject: { type: 'person', id: 'viktor' },
    axis: 'row',
    value: 3,
    text: 'Виктор стоял в четвёртом ряду.',
  },
  {
    id: 's57-viktor-camera-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'viktor' },
    itemTypeId: 'camera',
    text: 'Виктор находился в одной зоне с камерой наблюдения.',
  },
  {
    id: 's57-viktor-east-of-inna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'viktor' },
    otherPersonId: 'inna',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Виктор находился ровно на один столбец восточнее Инны.',
  },
  {
    id: 's57-denis-east-of-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'denis' },
    otherPersonId: 'viktor',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Денис находился ровно на один столбец восточнее Виктора.',
  },
  {
    id: 's57-viktor-between-anna-galina',
    type: 'betweenness',
    subject: { type: 'person', id: 'viktor' },
    otherPersonId1: 'anna',
    otherPersonId2: 'galina',
    axis: 'row',
    text: 'По рядам Виктор находился между Анной и Галиной.',
  },
  {
    id: 's57-viktor-same-zone-anna',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'viktor' },
    otherPersonId: 'anna',
    text: 'Анна и Виктор находились в одном отсеке.',
  },
  {
    id: 's57-galina-seventh-row',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    value: 6,
    text: 'Галина стояла в седьмом ряду.',
  },
  {
    id: 's57-galina-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    parity: 'odd',
    text: 'Галина находилась в нечётном ряду.',
  },
  {
    id: 's57-galina-stone-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'galina' },
    textureKey: 'stone',
    text: 'Галина стояла на каменном полу.',
  },
  {
    id: 's57-galina-same-zone-zhdan',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'zhdan',
    text: 'Галина и Ждан находились в одном отсеке.',
  },
  {
    id: 's57-denis-observatory',
    type: 'roomMembership',
    subject: { type: 'person', id: 'denis' },
    roomId: 'glassObservatory',
    text: 'Денис находился в смотровом куполе.',
  },
  {
    id: 's57-denis-tile-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'denis' },
    textureKey: 'tile',
    text: 'Денис стоял на плиточном полу.',
  },
  {
    id: 's57-denis-table-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'denis' },
    itemTypeId: 'table',
    text: 'Денис находился в одной зоне с рабочим столом.',
  },
  {
    id: 's57-denis-between-viktor-esenya',
    type: 'betweenness',
    subject: { type: 'person', id: 'denis' },
    otherPersonId1: 'viktor',
    otherPersonId2: 'esenya',
    axis: 'row',
    text: 'По рядам Денис находился между Виктором и Есенией.',
  },
  {
    id: 's57-esenya-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'esenya' },
    axis: 'col',
    parity: 'even',
    text: 'Есения находилась в чётном столбце.',
  },
  {
    id: 's57-esenya-east-of-galina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId: 'galina',
    axis: 'col',
    direction: 'after',
    offset: 2,
    text: 'Есения находилась ровно на два столбца восточнее Галины.',
  },
  {
    id: 's57-esenya-north-of-zhdan',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId: 'zhdan',
    axis: 'row',
    direction: 'before',
    text: 'Есения находилась севернее Ждана.',
  },
  {
    id: 's57-esenya-console-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'esenya' },
    itemTypeId: 'computer',
    text: 'Есения находилась в одной зоне с пультом связи.',
  },
  {
    id: 's57-zhdan-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'west',
    text: 'Ждан стоял у западной стены своего отсека.',
  },
  {
    id: 's57-zoya-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zoya' },
    wallDirection: 'east',
    text: 'Зоя стояла у восточной стены своего отсека.',
  },
  {
    id: 's57-zoya-toolbox-room',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'toolbox',
    text: 'Зоя находилась в одной зоне с ящиком для инструментов.',
  },
  {
    id: 's57-zoya-between-boris-denis',
    type: 'betweenness',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId1: 'boris',
    otherPersonId2: 'denis',
    axis: 'col',
    text: 'По столбцам Зоя находилась между Борисом и Денисом.',
  },
  {
    id: 's57-zhdan-north-of-zoya',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'zoya',
    axis: 'row',
    direction: 'before',
    text: 'Ждан находился севернее Зои.',
  },
  {
    id: 's57-inna-living-pod',
    type: 'roomMembership',
    subject: { type: 'person', id: 'inna' },
    roomId: 'livingPod',
    text: 'Инна находилась в жилом модуле.',
  },
  {
    id: 's57-inna-tenth-row',
    type: 'position',
    subject: { type: 'person', id: 'inna' },
    axis: 'row',
    value: 9,
    text: 'Инна стояла в десятом ряду.',
  },
  {
    id: 's57-inna-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'inna' },
    axis: 'row',
    parity: 'even',
    text: 'Инна находилась в чётном ряду.',
  },
];

export const surpriseLevel: Level = {
  meta: {
    id: 'case-57',
    title: 'Дело №57',
    theme: 'case57',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    hiddenFromMenu: true,
  },
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
