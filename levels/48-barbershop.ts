import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 8;

const rooms: Room[] = [
  { id: 'reception', name: 'Приёмная', floorTexture: 'marble' },
  { id: 'salon', name: 'Зал стрижки', floorTexture: 'stone' },
  { id: 'wash', name: 'Мойка', floorTexture: 'tile' },
  { id: 'color', name: 'Кабинет окрашивания', floorTexture: 'linoleum' },
  { id: 'staff', name: 'Комната персонала', floorTexture: 'wood' },
  { id: 'display', name: 'Витрина', floorTexture: 'carpet' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.barberChair(),
  ItemLibrary.hairDryer(),
  ItemLibrary.productShelf(),
  ItemLibrary.makeupMirror(),
  ItemLibrary.kassa('Стойка администратора'),
  ItemLibrary.sofa(),
  ItemLibrary.plant(),
  ItemLibrary.cat(),
  ItemLibrary.cup(),
  ItemLibrary.bathtub('Мойка для волос'),
  ItemLibrary.towel(),
  ItemLibrary.slippers(),
  ItemLibrary.chair(),
  ItemLibrary.table(),
  ItemLibrary.stool(),
  ItemLibrary.clock(),
];

const items: Item[] = [
  { id: 'reception-kassa', typeId: 'kassa', cells: [cellId(0, 0)] },
  { id: 'reception-sofa', typeId: 'sofa', cells: [cellId(0, 2)] },
  { id: 'reception-plant', typeId: 'plant', cells: [cellId(1, 1)] },
  { id: 'reception-cat', typeId: 'cat', cells: [cellId(2, 0)] },
  { id: 'reception-cup', typeId: 'cup', cells: [cellId(2, 1)] },

  { id: 'salon-chair-1', typeId: 'barberChair', cells: [cellId(0, 3)] },
  { id: 'salon-chair-2', typeId: 'barberChair', cells: [cellId(1, 3)] },
  { id: 'salon-chair-3', typeId: 'barberChair', cells: [cellId(2, 4)] },
  { id: 'salon-mirror-1', typeId: 'makeupMirror', cells: [cellId(1, 4)] },
  { id: 'salon-mirror-2', typeId: 'makeupMirror', cells: [cellId(3, 3)] },
  { id: 'salon-dryer-1', typeId: 'hairDryer', cells: [cellId(2, 5)] },
  { id: 'salon-mirror-3', typeId: 'makeupMirror', cells: [cellId(2, 6)] },

  { id: 'wash-bathtub', typeId: 'bathtub', cells: [cellId(0, 7)] },
  { id: 'wash-clock', typeId: 'clock', cells: [cellId(1, 7)] },
  { id: 'wash-towel', typeId: 'towel', cells: [cellId(3, 6)] },
  { id: 'wash-slippers', typeId: 'slippers', cells: [cellId(4, 7)] },

  { id: 'color-shelf-1', typeId: 'productShelf', cells: [cellId(3, 1)] },
  { id: 'color-shelf-2', typeId: 'productShelf', cells: [cellId(4, 0)] },
  { id: 'color-dryer', typeId: 'hairDryer', cells: [cellId(5, 0)] },
  { id: 'color-plant', typeId: 'plant', cells: [cellId(6, 1)] },

  { id: 'staff-sofa', typeId: 'sofa', cells: [cellId(5, 3)] },
  { id: 'staff-table', typeId: 'table', cells: [cellId(5, 4)] },
  { id: 'staff-plant', typeId: 'plant', cells: [cellId(6, 2)] },
  { id: 'staff-cup', typeId: 'cup', cells: [cellId(6, 4)] },
  { id: 'staff-stool', typeId: 'stool', cells: [cellId(7, 3)] },
  { id: 'staff-clock', typeId: 'clock', cells: [cellId(7, 4)] },

  { id: 'display-shelf-1', typeId: 'productShelf', cells: [cellId(5, 7)] },
  { id: 'display-chair', typeId: 'chair', cells: [cellId(6, 6)] },
  { id: 'display-plant', typeId: 'plant', cells: [cellId(6, 7)] },
  { id: 'display-shelf-2', typeId: 'productShelf', cells: [cellId(7, 7)] },
];

// R — приёмная, C — стрижка, W — мойка, D — окрашивание, S — персонал, P — витрина.
const ROOM_ROWS = [
  'RRRCCWWW',
  'RRRCCWWW',
  'RRRCCCCW',
  'DDCCCCWW',
  'DDCCCCWW',
  'DDDSSSPP',
  'DDSSSSPP',
  'DDSSSSPP',
];

const ROOM_BY_LETTER: Record<string, string> = {
  R: 'reception',
  C: 'salon',
  W: 'wash',
  D: 'color',
  S: 'staff',
  P: 'display',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: true, roles: ['barber', 'seniorMaster'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['barber', 'juniorBarber'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'hionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  aglaya: cellId(3, 0),
  boris: cellId(1, 2),
  viktor: cellId(2, 7),
  glafira: cellId(5, 5),
  demid: cellId(6, 3),
  esenya: cellId(0, 4),
  zhdan: cellId(7, 6),
  hionia: cellId(4, 1),
};

const clues: Clue[] = [
  {
    id: 'bs-letter-roles',
    type: 'letterRole',
    letterClass: 'vowel',
    roleId: 'barber',
    text: 'Все, чьи имена начинались с гласной, были барберами; остальные пришли как посетители.',
  },
  {
    id: 'bs-senior-master-among-barbers',
    type: 'roleSingleton',
    roleId: 'seniorMaster',
    withinRoleId: 'barber',
    tileColor: 'dark',
    text: 'Среди барберов был ровно один старший мастер, он стоял на тёмной клетке.',
  },
  {
    id: 'bs-second-barber-light-tile',
    type: 'checkerboardParity',
    subject: { type: 'role', role: 'juniorBarber' },
    tileColor: 'light',
    text: 'Второй барбер был на светлой клетке.',
  },
  {
    id: 'bs-all-zones-occupied',
    type: 'roomOccupancy',
    text: 'Во всех шести зонах находился хотя бы один человек.',
  },
  {
    id: 'bs-zone-count-parity',
    type: 'zoneCountParity',
    zones: [
      { roomId: 'color', parity: 'even' },
      { roomId: 'staff', parity: 'even' },
      { roomId: 'reception', parity: 'odd' },
      { roomId: 'salon', parity: 'odd' },
      { roomId: 'wash', parity: 'odd' },
      { roomId: 'display', parity: 'odd' },
    ],
    text: 'В кабинете окрашивания и комнате персонала было чётное число людей, в остальных зонах — нечётное.',
  },
  {
    id: 'bs-aglaya-product-shelf',
    type: 'adjacency',
    subject: { type: 'person', id: 'aglaya' },
    itemTypeId: 'productShelf',
    text: 'Аглая находилась рядом со стойкой с косметикой.',
  },
  {
    id: 'bs-aglaya-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'aglaya' },
    axis: 'row',
    parity: 'even',
    text: 'Аглая находилась в ряду с чётным номером.',
  },
  {
    id: 'bs-boris-reception-room',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'reception',
    text: 'Борис находился в зоне «Приёмная».',
  },
  {
    id: 'bs-viktor-wash-room',
    type: 'roomMembership',
    subject: { type: 'person', id: 'viktor' },
    roomId: 'wash',
    text: 'Виктор находился в зоне «Мойка».',
  },
  {
    id: 'bs-glafira-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'glafira' },
    axis: 'row',
    parity: 'even',
    text: 'Глафира находилась в ряду с чётным номером.',
  },
  {
    id: 'bs-glafira-north-of-demid',
    type: 'relativePosition',
    subject: { type: 'person', id: 'glafira' },
    otherPersonId: 'demid',
    axis: 'row',
    direction: 'before',
    text: 'Глафира находилась севернее Демида.',
  },
  {
    id: 'bs-glafira-east-of-demid',
    type: 'relativePosition',
    subject: { type: 'person', id: 'glafira' },
    otherPersonId: 'demid',
    axis: 'col',
    direction: 'after',
    text: 'Глафира находилась восточнее Демида.',
  },
  {
    id: 'bs-demid-staff-room',
    type: 'roomMembership',
    subject: { type: 'person', id: 'demid' },
    roomId: 'staff',
    text: 'Демид находился в комнате персонала.',
  },
  {
    id: 'bs-esenya-mirror',
    type: 'adjacency',
    subject: { type: 'person', id: 'esenya' },
    itemTypeId: 'makeupMirror',
    text: 'Есения находилась рядом с зеркалом.',
  },
  {
    id: 'bs-esenya-north-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId: 'viktor',
    axis: 'row',
    direction: 'before',
    text: 'Есения находилась севернее Виктора.',
  },
  {
    id: 'bs-zhdan-smallest-zone',
    type: 'roomSize',
    subject: { type: 'person', id: 'zhdan' },
    comparison: 'smallest',
    text: 'Ждан находился в самой маленькой зоне.',
  },
  {
    id: 'bs-zhdan-dark-tile',
    type: 'checkerboardParity',
    subject: { type: 'person', id: 'zhdan' },
    tileColor: 'dark',
    text: 'Ждан стоял на тёмной плитке.',
  },
];

export const barbershopLevel: Level = {
  meta: {
    id: 'barbershop-01',
    title: 'Три седых',
    theme: 'barbershop',
    difficulty: 8,
    maxFullyPinnedPeople: 0,
  },
  size,
  tilePattern: 'checkerboard',
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};
