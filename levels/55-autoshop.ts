import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

const rooms: Room[] = [
  { id: 'reception', name: 'Приемная', floorTexture: 'tile' },
  { id: 'diagnostics', name: 'Диагностика', floorTexture: 'workshopFloor' },
  { id: 'tireService', name: 'Шиномонтаж', floorTexture: 'rubber' },
  { id: 'repair', name: 'Ремонтная', floorTexture: 'workshopFloor' },
  { id: 'parts', name: 'Склад запчастей', floorTexture: 'workshopFloor' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'rubber-runoff', label: 'Резиновая дорожка', textureKey: 'rubber' },
];
const RUBBER_RUNOFF_CELLS = new Set([cellId(3, 4), cellId(3, 5)]);

const itemTypes: ItemType[] = [
  ItemLibrary.car(),
  ItemLibrary.toolbox(),
  ItemLibrary.box('Коробка с запчастями'),
  ItemLibrary.tireStack(),
  ItemLibrary.carJack(),
];

const items: Item[] = [
  { id: 'car-reception', typeId: 'car', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'car-diagnostics', typeId: 'car', cells: [cellId(0, 3), cellId(0, 4)] },
  { id: 'car-parts', typeId: 'car', cells: [cellId(4, 0), cellId(4, 1)] },
  { id: 'car-repair', typeId: 'car', cells: [cellId(6, 4), cellId(6, 5)] },

  { id: 'toolbox-diagnostics', typeId: 'toolbox', cells: [cellId(2, 2)] },
  { id: 'toolbox-repair-1', typeId: 'toolbox', cells: [cellId(2, 6)] },
  { id: 'toolbox-repair-2', typeId: 'toolbox', cells: [cellId(4, 5)] },
  { id: 'toolbox-repair-3', typeId: 'toolbox', cells: [cellId(6, 6)] },

  { id: 'parts-box-1', typeId: 'box', cells: [cellId(3, 0)] },
  { id: 'parts-box-2', typeId: 'box', cells: [cellId(5, 2)] },
  { id: 'parts-box-3', typeId: 'box', cells: [cellId(6, 3)] },

  { id: 'jack-diagnostics', typeId: 'carJack', cells: [cellId(1, 3)] },
  { id: 'jack-repair-1', typeId: 'carJack', cells: [cellId(2, 5)] },
  { id: 'jack-repair-2', typeId: 'carJack', cells: [cellId(5, 6)] },
  { id: 'tire-stack', typeId: 'tireStack', cells: [cellId(4, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

// R = reception, D = diagnostics, T = tire service, W = repair, S = parts storage.
const ROOM_ROWS = [
  'RRRDDWW',
  'RRRDDWW',
  'RRDDDWW',
  'SSDTTWW',
  'SSSTTWW',
  'SSSSTWW',
  'SSSSWWW',
];
const ROOM_BY_LETTER: Record<string, string> = {
  R: 'reception',
  D: 'diagnostics',
  T: 'tireService',
  W: 'repair',
  S: 'parts',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  RUBBER_RUNOFF_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'rubber-runoff' } : cell,
);

const people: Person[] = [
  { id: 'arkadiy', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: true },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'khristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#7cc9e8', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  arkadiy: cellId(6, 0),
  borislav: cellId(3, 2),
  vasilisa: cellId(4, 3),
  glafira: cellId(5, 4),
  demyan: cellId(1, 6),
  esenya: cellId(2, 1),
  khristina: cellId(0, 5),
};

const clues: Clue[] = [
  {
    id: 'as-arkadiy-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'arkadiy' },
    wallDirection: 'south',
    text: 'Аркадий находился у южной стены своей зоны.',
  },
  {
    id: 'as-arkadiy-odd-column',
    type: 'parity',
    subject: { type: 'person', id: 'arkadiy' },
    axis: 'col',
    parity: 'odd',
    text: 'Аркадий находился в столбце с нечётным номером.',
  },
  {
    id: 'as-borislav-workshop-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'borislav' },
    textureKey: 'workshopFloor',
    text: 'Борислав находился на бетонном полу.',
  },
  {
    id: 'as-borislav-toolbox',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'borislav' },
    itemTypeId: 'toolbox',
    text: 'Борислав находился в одной зоне с ящиком с инструментами.',
  },
  {
    id: 'as-vasilisa-tires',
    type: 'adjacency',
    subject: { type: 'person', id: 'vasilisa' },
    itemTypeId: 'tireStack',
    text: 'Василиса находилась рядом со стопкой шин.',
  },
  {
    id: 'as-vasilisa-north-of-glafira',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vasilisa' },
    otherPersonId: 'glafira',
    axis: 'row',
    direction: 'before',
    text: 'Василиса находилась севернее Глафиры.',
  },
  {
    id: 'as-glafira-rubber-floor',
    type: 'floorTexture',
    subject: { type: 'person', id: 'glafira' },
    textureKey: 'rubber',
    text: 'Глафира находилась на резиновом покрытии.',
  },
  {
    id: 'as-glafira-corner',
    type: 'corner',
    subject: { type: 'person', id: 'glafira' },
    text: 'Глафира находилась в углу своей зоны.',
  },
  {
    id: 'as-demyan-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'demyan' },
    wallDirection: 'east',
    text: 'Демьян находился у восточной стены своей зоны.',
  },
  {
    id: 'as-demyan-toolbox',
    type: 'adjacency',
    subject: { type: 'person', id: 'demyan' },
    itemTypeId: 'toolbox',
    text: 'Демьян находился рядом с ящиком с инструментами.',
  },
  {
    id: 'as-demyan-two-rows-north-of-borislav',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demyan' },
    otherPersonId: 'borislav',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Демьян находился ровно на два ряда севернее Борислава.',
  },
  {
    id: 'as-esenya-reception',
    type: 'roomMembership',
    subject: { type: 'person', id: 'esenya' },
    roomId: 'reception',
    text: 'Есения находилась в приемной.',
  },
  {
    id: 'as-esenya-between-arkadiy-borislav',
    type: 'betweenness',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId1: 'arkadiy',
    otherPersonId2: 'borislav',
    axis: 'col',
    text: 'По столбцам Есения находилась между Аркадием и Бориславом.',
  },
  {
    id: 'as-esenya-alone',
    type: 'aloneInRoom',
    subject: { type: 'person', id: 'esenya' },
    text: 'Есения находилась одна в своей зоне.',
  },
];

export const autoshopLevel: Level = {
  meta: {
    id: 'autoshop-01',
    title: 'Заглохший двигатель',
    theme: 'autoshop',
    difficulty: 10,
    maxFullyPinnedPeople: 0,
    menuTag: 'hard',
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
