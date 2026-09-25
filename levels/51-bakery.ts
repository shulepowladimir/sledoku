import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

const rooms: Room[] = [
  { id: 'bakery', name: 'Пекарня', floorTexture: 'bakeryTile' },
  { id: 'service', name: 'Служебная зона', floorTexture: 'concrete' },
  { id: 'cashier', name: 'Касса', floorTexture: 'tile' },
  { id: 'hall', name: 'Гостевой зал', floorTexture: 'wood' },
  { id: 'entrance', name: 'Вход', floorTexture: 'linoleum' },
];

const floorFeatures: FloorFeature[] = [{ id: 'entry-rug', label: 'Ковёр у входа', textureKey: 'rug' }];
const ENTRY_RUG_CELLS = new Set([cellId(6, 0), cellId(6, 1)]);

const itemTypes: ItemType[] = [
  { id: 'breadDisplay', label: 'Витрина с хлебом', kind: 'decorative', icon: 'breadDisplay' },
  { id: 'pastryDisplay', label: 'Кондитерская витрина', kind: 'decorative', icon: 'pastryDisplay' },
  { id: 'convectionOven', label: 'Конвекционная печь', kind: 'decorative', icon: 'convectionOven' },
  { id: 'croissant', label: 'Круассан', kind: 'decorative', icon: 'croissant' },
  { id: 'coffeeMachine', label: 'Кофемашина', kind: 'decorative', icon: 'coffeeMachine' },
  ItemLibrary.workbench('Рабочий стол пекаря'),
  ItemLibrary.fridge(),
  ItemLibrary.fireExtinguisher(),
  ItemLibrary.locker(),
  ItemLibrary.ladder(),
  ItemLibrary.kassa(),
  ItemLibrary.pieDisplay(),
  ItemLibrary.chair(),
  ItemLibrary.table(),
  ItemLibrary.cup(),
];

const items: Item[] = [
  { id: 'bakery-workbench', typeId: 'workbench', cells: [cellId(3, 0)] },
  { id: 'bakery-oven', typeId: 'convectionOven', cells: [cellId(0, 1), cellId(0, 2)] },

  { id: 'service-fridge', typeId: 'fridge', cells: [cellId(0, 3)] },
  { id: 'service-extinguisher', typeId: 'fireExtinguisher', cells: [cellId(0, 4)] },
  { id: 'service-locker', typeId: 'locker', cells: [cellId(1, 3)] },
  { id: 'service-ladder', typeId: 'ladder', cells: [cellId(2, 3)] },

  { id: 'cash-register', typeId: 'kassa', cells: [cellId(2, 5)] },
  { id: 'cash-pie-display', typeId: 'pieDisplay', cells: [cellId(4, 0)] },
  { id: 'cash-bread-display', typeId: 'breadDisplay', cells: [cellId(4, 1)] },
  { id: 'cash-coffee-machine', typeId: 'coffeeMachine', cells: [cellId(4, 3), cellId(4, 4)] },

  { id: 'hall-chair-1', typeId: 'chair', cells: [cellId(1, 6)] },
  { id: 'hall-chair-2', typeId: 'chair', cells: [cellId(6, 3)] },
  { id: 'hall-table-1', typeId: 'table', cells: [cellId(5, 4)] },
  { id: 'hall-table-2', typeId: 'table', cells: [cellId(5, 5)] },
  { id: 'hall-cup-1', typeId: 'cup', cells: [cellId(6, 5)] },
  { id: 'hall-cup-2', typeId: 'cup', cells: [cellId(6, 6)] },
  { id: 'hall-croissant', typeId: 'croissant', cells: [cellId(4, 6)] },

  { id: 'entrance-pastry-display', typeId: 'pastryDisplay', cells: [cellId(5, 0), cellId(5, 1)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

// П — пекарня, С — служебная зона, К — касса, З — гостевой зал, В — вход.
const ROOM_ROWS = [
  'bbbsssh',
  'bbbsskh',
  'bbsskkh',
  'bbkskhh',
  'kkkkkhh',
  'eeeehhh',
  'eeehhhh',
];

const ROOM_BY_LETTER: Record<string, string> = {
  b: 'bakery',
  s: 'service',
  k: 'cashier',
  h: 'hall',
  e: 'entrance',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) =>
  ENTRY_RUG_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'entry-rug' } : cell,
);

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'gennady', name: 'Геннадий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: true, roles: ['staff'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false, roles: ['guest'] },
];

// Жертва и убийца находятся в гостевом зале; посетители занимают только открытые зоны.
const solution: Record<PersonId, CellId> = {
  aglaya: cellId(0, 0),
  esenya: cellId(1, 6),
  boris: cellId(2, 4),
  vasilisa: cellId(3, 2),
  khariton: cellId(4, 5),
  gennady: cellId(5, 3),
  denis: cellId(6, 1),
};

const clues: Clue[] = [
  {
    id: 'bakery-vowel-staff',
    type: 'letterRole',
    letterClass: 'vowel',
    roleId: 'staff',
    text: 'Все, чьё имя начинается на гласную букву, были сотрудниками пекарни; остальные были гостями.',
  },
  {
    id: 'bakery-guests-areas',
    type: 'roleZoneLimit',
    roleId: 'guest',
    roomIds: ['bakery', 'service'],
    maxCount: 0,
    text: 'Гостям были закрыты пекарня и служебная зона.',
  },
  {
    id: 'bakery-aglaya-room',
    type: 'roomMembership',
    subject: { type: 'person', id: 'aglaya' },
    roomId: 'bakery',
    text: 'Аглая находилась в пекарне.',
  },
  {
    id: 'bakery-boris-corner',
    type: 'corner',
    subject: { type: 'person', id: 'boris' },
    text: 'Борис находился в углу своей зоны.',
  },
  {
    id: 'bakery-vasilisa-north-gennady',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vasilisa' },
    otherPersonId: 'gennady',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Василиса находилась ровно на два ряда севернее Геннадия.',
  },
  {
    id: 'bakery-vasilisa-two-zones-bakery',
    groupId: 'bakery-vasilisa-two-zones',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'vasilisa' },
    roomId: 'cashier',
    otherRoomId: 'bakery',
    text: 'Василиса соседствовала с двумя другими зонами.',
  },
  {
    id: 'bakery-vasilisa-two-zones-service',
    groupId: 'bakery-vasilisa-two-zones',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'vasilisa' },
    roomId: 'cashier',
    otherRoomId: 'service',
    text: 'Василиса соседствовала с двумя другими зонами.',
  },
  {
    id: 'bakery-gennady-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'gennady' },
    wallDirection: 'east',
    text: 'Геннадий находился у восточной стены своей зоны.',
  },
  {
    id: 'bakery-denis-rug',
    type: 'floorFeature',
    subject: { type: 'person', id: 'denis' },
    featureId: 'entry-rug',
    text: 'Денис находился на ковре у входа.',
  },
  {
    id: 'bakery-esenya-chair',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'esenya' },
    itemTypeId: 'chair',
    text: 'Есения сидела на стуле.',
  },
];

export const bakeryLevel: Level = {
  meta: {
    id: 'bakery-01',
    title: 'Жаркий замес',
    theme: 'bakery',
    difficulty: 6,
    maxFullyPinnedPeople: 0,
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
