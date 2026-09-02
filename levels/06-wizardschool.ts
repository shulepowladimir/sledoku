import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 8;

const rooms: Room[] = [
  { id: 'potions', name: 'Зельеварня', floorTexture: 'stone' },
  { id: 'library', name: 'Библиотека', floorTexture: 'wood' },
  { id: 'common', name: 'Общая гостиная', floorTexture: 'carpet' },
  { id: 'yard', name: 'Двор для полётов', floorTexture: 'grass' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'magic-rug', label: 'Волшебный ковёр', textureKey: 'rug' },
  { id: 'launchpad', label: 'Площадка для взлёта', textureKey: 'dirt' },
];
const RUG_CELLS = new Set([cellId(7, 1), cellId(7, 2)]);
const LAUNCHPAD_CELLS = new Set([cellId(7, 4), cellId(6, 5)]);

const itemTypes: ItemType[] = [
  { id: 'cauldron', label: 'Котёл', kind: 'decorative', icon: 'cauldron' },
  ItemLibrary.workbench('Рабочий стол зельевара'),
  { id: 'spellbookStand', label: 'Стойка с заклинаниями', kind: 'decorative', icon: 'spellbookStand' },
  ItemLibrary.globe(),
  ItemLibrary.chest('Сундук с артефактами'),
  ItemLibrary.armchair(),
  ItemLibrary.portrait(),
  ItemLibrary.telescope(),
  { id: 'broomRack', label: 'Стойка мётел', kind: 'decorative', icon: 'broomRack' },
  ItemLibrary.bookshelf(),
  ItemLibrary.box(),
  ItemLibrary.plant(),
  ItemLibrary.bench(),
  ItemLibrary.trashcan(),
  ItemLibrary.lamppost(),
  ItemLibrary.barrel(),
  ItemLibrary.stool(),
  ItemLibrary.candleStand(),
];

const items: Item[] = [
  { id: 'item-cauldron', typeId: 'cauldron', cells: [cellId(0, 0)] },
  { id: 'item-workbench', typeId: 'workbench', cells: [cellId(2, 1)] },
  { id: 'item-spellbook-stand', typeId: 'spellbookStand', cells: [cellId(0, 5)] },
  { id: 'item-globe', typeId: 'globe', cells: [cellId(1, 6)] },
  { id: 'item-artifact-chest', typeId: 'chest', cells: [cellId(4, 1), cellId(4, 2)] },
  { id: 'item-armchair-1', typeId: 'armchair', cells: [cellId(6, 1)] },
  { id: 'item-armchair-2', typeId: 'armchair', cells: [cellId(7, 0)] },
  { id: 'item-portrait', typeId: 'portrait', cells: [cellId(5, 0)] },
  { id: 'item-telescope', typeId: 'telescope', cells: [cellId(7, 6)] },
  { id: 'item-broom-rack', typeId: 'broomRack', cells: [cellId(6, 6), cellId(6, 7)] },
  { id: 'item-bookshelf', typeId: 'bookshelf', cells: [cellId(0, 4)] },
  { id: 'item-box-l', typeId: 'box', cells: [cellId(1, 4)] },
  { id: 'item-plant-l', typeId: 'plant', cells: [cellId(3, 5)] },
  { id: 'item-bench-y', typeId: 'bench', cells: [cellId(5, 6)] },
  { id: 'item-trashcan-y', typeId: 'trashcan', cells: [cellId(6, 4)] },
  { id: 'item-lamppost-y', typeId: 'lamppost', cells: [cellId(5, 7)] },
  { id: 'item-barrel-y', typeId: 'barrel', cells: [cellId(7, 7)] },
  { id: 'item-stool-y', typeId: 'stool', cells: [cellId(7, 5)] },
  { id: 'item-candlestand-p', typeId: 'candleStand', cells: [cellId(2, 3)] },
  { id: 'item-box-y', typeId: 'box', cells: [cellId(4, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four zones on an 8x8 board arranged as a pinwheel: potions (P) top-left, library (L) top-right
// stretching down the middle, common room (C) growing wedge bottom-left, yard (Y) bottom-right.
const ROOM_ROWS = [
  'PPPPLLLL',
  'PPPPLLLL',
  'PPPPLLLL',
  'PPPCLLLL',
  'CCCCCLLY',
  'CCCCYYYY',
  'CCCYYYYY',
  'CCCYYYYY',
];
const ROOM_BY_LETTER: Record<string, string> = { P: 'potions', L: 'library', C: 'common', Y: 'yard' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (RUG_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'magic-rug' };
  if (LAUNCHPAD_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'launchpad' };
  return cell;
});

const people: Person[] = [
  { id: 'aglaya', name: 'Альби', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bogdan', name: 'Блейк', initialLetter: 'Б', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'veronika', name: 'Вольдемар', initialLetter: 'В', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'gennadiy', name: 'Гэри', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'diana', name: 'Дарко', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true },
  { id: 'egor', name: 'Ева', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жабридж', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'hristofor', name: 'Харит', initialLetter: 'Х', gender: 'male', color: '#e0a94a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  hristofor: cellId(0, 2),
  aglaya: cellId(1, 7),
  bogdan: cellId(2, 6),
  diana: cellId(3, 1),
  veronika: cellId(4, 4),
  gennadiy: cellId(5, 5),
  egor: cellId(6, 0),
  zhanna: cellId(7, 3),
};

const clues: Clue[] = [
  {
    id: 'z2',
    type: 'adjacency',
    subject: { type: 'person', id: 'aglaya' },
    itemTypeId: 'globe',
    text: 'Альби находился рядом с глобусом.',
  },
  {
    id: 'z3',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'bogdan' },
    otherPersonId: 'aglaya',
    text: 'Блейк находился в одной зоне с Альби.',
  },
  {
    id: 'z4',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bogdan' },
    otherPersonId: 'aglaya',
    axis: 'col',
    direction: 'before',
    text: 'Блейк находился западнее Альби.',
  },
  {
    id: 'z6',
    type: 'adjacency',
    subject: { type: 'person', id: 'diana' },
    itemTypeId: 'workbench',
    text: 'Дарко находился рядом с рабочим столом зельевара.',
  },
  {
    id: 'z7',
    type: 'roomMembership',
    subject: { type: 'person', id: 'veronika' },
    roomId: 'common',
    text: 'Вольдемар находился в общей гостиной.',
  },
  {
    id: 'z9',
    type: 'roomMembership',
    subject: { type: 'person', id: 'gennadiy' },
    roomId: 'yard',
    text: 'Гэри находился во дворе для полётов.',
  },
  {
    id: 'z12',
    type: 'adjacency',
    subject: { type: 'person', id: 'egor' },
    itemTypeId: 'portrait',
    text: 'Ева находилась рядом с портретом.',
  },
  {
    id: 'z13',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'gennadiy',
    text: 'Жабридж находилась в одной зоне с Гэри.',
  },
  {
    id: 'z15',
    type: 'relativePosition',
    subject: { type: 'person', id: 'aglaya' },
    otherPersonId: 'bogdan',
    axis: 'row',
    direction: 'before',
    text: 'Альби находился севернее Блейка.',
  },
  {
    id: 'z22',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'veronika',
    axis: 'col',
    direction: 'before',
    text: 'Жабридж находилась западнее Вольдемара.',
  },
  {
    id: 'z23',
    type: 'relativePosition',
    subject: { type: 'person', id: 'gennadiy' },
    otherPersonId: 'bogdan',
    axis: 'col',
    direction: 'before',
    text: 'Гэри находился западнее Блейка.',
  },
  {
    id: 'z24',
    type: 'corner',
    subject: { type: 'person', id: 'veronika' },
    text: 'Вольдемар находился в углу своей зоны.',
  },
  {
    id: 'z26',
    type: 'adjacency',
    subject: { type: 'person', id: 'egor' },
    itemTypeId: 'armchair',
    text: 'Ева находилась рядом с креслом.',
  },
  {
    id: 'z27',
    type: 'betweenness',
    subject: { type: 'person', id: 'egor' },
    otherPersonId1: 'veronika',
    otherPersonId2: 'zhanna',
    axis: 'row',
    text: 'По рядам Ева находилась между Вольдемаром и Жабридж.',
  },
  {
    id: 'z28',
    type: 'parity',
    subject: { type: 'person', id: 'bogdan' },
    axis: 'row',
    parity: 'odd',
    text: 'Блейк находился в ряду с нечётным номером.',
  },
  {
    id: 'z29',
    type: 'itemTypeGender',
    itemTypeId: 'armchair',
    gender: 'female',
    text: 'Мужчины не садились в кресла.',
  },
];

export const wizardSchoolLevel: Level = {
  meta: { id: 'wizardschool-01', title: 'Тайна школы волшебников', theme: 'wizardschool', difficulty: 6, maxFullyPinnedPeople: 0, clueBalanceExempt: true },
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
