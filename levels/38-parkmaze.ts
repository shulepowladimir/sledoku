import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 12;

// «Запутанный след»: ночной парк-лабиринт. Вся земля — dirt, стены лабиринта —
// ломаные кусты-полиомино (render: 'tile', срастаются в непрерывную изгородь).
// Четыре квадранта 6×6; решение — идеальная перестановка 12×12.
const rooms: Room[] = [
  // СЗ: единственная свободная клетка нижнего ряда (5,5) — у шва с СВ, поэтому
  // подпись прижата влево (labelAlign), к краю зоны.
  { id: 'nw', name: 'Северо-запад парка', floorTexture: 'dirt', labelAlign: 'left' },
  { id: 'ne', name: 'Северо-восток парка', floorTexture: 'dirt' },
  { id: 'sw', name: 'Юго-запад парка', floorTexture: 'dirt' },
  { id: 'se', name: 'Юго-восток парка', floorTexture: 'dirt' },
];

const itemTypes: ItemType[] = [
  // Куст изгороди — уровневый, full-bleed тайл (механика ломаных предметов)
  { id: 'bushHedge', label: 'Куст', kind: 'decorative', icon: 'bushHedge', render: 'tile' },
  { id: 'flowerbed', label: 'Клумба', kind: 'decorative', icon: 'flowerbed' },
  ItemLibrary.bench(),
  ItemLibrary.fountain(),
  ItemLibrary.lamppost(),
  ItemLibrary.tree(),
];

const items: Item[] = [
  // — Кусты-полиомино (11 связных компонент из грида) —
  { id: 'item-bush-1', typeId: 'bushHedge', cells: [cellId(0, 2), cellId(0, 3), cellId(0, 4), cellId(0, 5), cellId(0, 6), cellId(1, 2), cellId(1, 6)] },
  { id: 'item-bush-2', typeId: 'bushHedge', cells: [cellId(0, 8), cellId(0, 9), cellId(0, 10), cellId(0, 11), cellId(1, 8), cellId(2, 4), cellId(2, 8), cellId(3, 2), cellId(3, 3), cellId(3, 4), cellId(3, 5), cellId(3, 6), cellId(3, 7), cellId(3, 8)] },
  { id: 'item-bush-3', typeId: 'bushHedge', cells: [cellId(1, 0)] },
  { id: 'item-bush-4', typeId: 'bushHedge', cells: [cellId(2, 10), cellId(2, 11), cellId(3, 10)] },
  { id: 'item-bush-5', typeId: 'bushHedge', cells: [cellId(4, 0), cellId(5, 0), cellId(5, 1), cellId(5, 2), cellId(5, 3)] },
  { id: 'item-bush-6', typeId: 'bushHedge', cells: [cellId(5, 7), cellId(6, 5), cellId(6, 6), cellId(6, 7), cellId(7, 2), cellId(7, 3), cellId(7, 5), cellId(8, 2), cellId(8, 3), cellId(8, 4), cellId(8, 5), cellId(9, 5), cellId(10, 5), cellId(10, 6), cellId(10, 7), cellId(10, 8), cellId(11, 8), cellId(11, 9)] },
  { id: 'item-bush-7', typeId: 'bushHedge', cells: [cellId(5, 9), cellId(5, 10), cellId(5, 11), cellId(6, 11), cellId(7, 11)] },
  { id: 'item-bush-8', typeId: 'bushHedge', cells: [cellId(7, 0), cellId(8, 0), cellId(9, 0)] },
  { id: 'item-bush-9', typeId: 'bushHedge', cells: [cellId(7, 9), cellId(8, 9)] },
  { id: 'item-bush-10', typeId: 'bushHedge', cells: [cellId(9, 10), cellId(9, 11), cellId(10, 11), cellId(11, 11)] },
  { id: 'item-bush-11', typeId: 'bushHedge', cells: [cellId(10, 2), cellId(10, 3), cellId(11, 2), cellId(11, 3)] },
  // — Фонтаны —
  { id: 'item-fountain-1', typeId: 'fountain', cells: [cellId(2, 0)] },
  { id: 'item-fountain-2', typeId: 'fountain', cells: [cellId(5, 6)] },
  { id: 'item-fountain-3', typeId: 'fountain', cells: [cellId(11, 0)] },
  // — Клумбы —
  { id: 'item-flowerbed-1', typeId: 'flowerbed', cells: [cellId(1, 10)] },
  { id: 'item-flowerbed-2', typeId: 'flowerbed', cells: [cellId(5, 4)] },
  { id: 'item-flowerbed-3', typeId: 'flowerbed', cells: [cellId(9, 8)] },
  // — Скамейки —
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(0, 1)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(0, 7)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(2, 5)] },
  { id: 'item-bench-4', typeId: 'bench', cells: [cellId(4, 6)] },
  { id: 'item-bench-5', typeId: 'bench', cells: [cellId(4, 10)] },
  { id: 'item-bench-6', typeId: 'bench', cells: [cellId(9, 6)] },
  { id: 'item-bench-7', typeId: 'bench', cells: [cellId(11, 1)] },
  { id: 'item-bench-8', typeId: 'bench', cells: [cellId(11, 5)] },
  // — Фонари —
  { id: 'item-lamp-1', typeId: 'lamppost', cells: [cellId(2, 7)] },
  { id: 'item-lamp-2', typeId: 'lamppost', cells: [cellId(6, 1)] },
  { id: 'item-lamp-3', typeId: 'lamppost', cells: [cellId(7, 8)] },
  { id: 'item-lamp-4', typeId: 'lamppost', cells: [cellId(9, 4)] },
  // — Деревья —
  { id: 'item-tree-1', typeId: 'tree', cells: [cellId(4, 1)] },
  { id: 'item-tree-2', typeId: 'tree', cells: [cellId(4, 7)] },
  { id: 'item-tree-3', typeId: 'tree', cells: [cellId(6, 4)] },
  { id: 'item-tree-4', typeId: 'tree', cells: [cellId(10, 10)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Квадранты 6×6: nw | ne / sw | se
function roomForCell(row: number, col: number): string {
  if (row < 6) return col < 6 ? 'nw' : 'ne';
  return col < 6 ? 'sw' : 'se';
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: true },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ksenia', name: 'Ксения', initialLetter: 'К', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'leonid', name: 'Леонид', initialLetter: 'Л', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'kharita', name: 'Харита', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Идеальная перестановка 12×12 (все ряды и столбцы различны). Аркадий (убийца)
// и Харита (жертва) вдвоём в северо-западном квадранте; зоны 2/4/4/2 — чётные.
const solution: Record<PersonId, CellId> = {
  arkady: cellId(1, 1),
  bella: cellId(7, 4),
  veronika: cellId(9, 2),
  grigory: cellId(2, 9),
  darya: cellId(10, 0),
  efim: cellId(8, 6),
  zhanna: cellId(0, 7),
  zakhar: cellId(5, 8),
  igor: cellId(6, 10),
  ksenia: cellId(11, 5),
  leonid: cellId(3, 11),
  kharita: cellId(4, 3),
};

const clues: Clue[] = [
  // — Общие правила парка —
  {
    id: 'pm1',
    type: 'roomParity',
    parity: 'even',
    text: 'Во всех частях парка было чётное число людей.',
  },
  {
    id: 'pm2',
    type: 'itemTypeGender',
    itemTypeId: 'bench',
    gender: 'female',
    text: 'На скамейках парка в тот вечер сидели только женщины.',
  },
  // — Личные: привязки —
  {
    id: 'pm3',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'bench',
    text: 'Жанна сидела на скамейке.',
  },
  {
    id: 'pm4',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'ksenia' },
    itemTypeId: 'bench',
    text: 'Ксения сидела на скамейке.',
  },
  {
    id: 'pm5',
    type: 'adjacency',
    subject: { type: 'person', id: 'bella' },
    itemTypeId: 'tree',
    text: 'Белла находилась рядом с деревом.',
  },
  {
    id: 'pm6',
    type: 'adjacency',
    subject: { type: 'person', id: 'darya' },
    itemTypeId: 'fountain',
    text: 'Дарья находилась рядом с фонтаном.',
  },
  {
    id: 'pm7',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'efim' },
    itemTypeId: 'fountain',
    negated: true,
    text: 'Ефим не находился в части парка с фонтаном.',
  },
  {
    id: 'pm8',
    type: 'roomMembership',
    subject: { type: 'person', id: 'veronika' },
    roomId: 'sw',
    text: 'Вероника была в юго-западной части парка.',
  },
  {
    id: 'pm9',
    type: 'roomMembership',
    subject: { type: 'person', id: 'igor' },
    roomId: 'se',
    text: 'Игорь был в юго-восточной части парка.',
  },
  // — Личные: различители —
  {
    id: 'pm11',
    type: 'parity',
    subject: { type: 'person', id: 'grigory' },
    axis: 'row',
    parity: 'odd',
    text: 'Григорий находился в нечётном ряду.',
  },
  {
    id: 'pm12',
    type: 'parity',
    subject: { type: 'person', id: 'zakhar' },
    axis: 'row',
    parity: 'even',
    text: 'Захар находился в чётном ряду.',
  },
  {
    id: 'pm14',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'igor' },
    otherGender: 'male',
    text: 'В зоне с Игорем был мужчина.',
  },
  {
    id: 'pm15',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'zhanna' },
    otherGender: 'male',
    text: 'В зоне с Жанной был мужчина.',
  },
  {
    id: 'pm16',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'bella' },
    otherGender: 'male',
    negated: true,
    text: 'Белла не делила часть парка с мужчиной.',
  },
  {
    id: 'pm19',
    type: 'relativePosition',
    subject: { type: 'person', id: 'leonid' },
    otherPersonId: 'igor',
    axis: 'col',
    direction: 'after',
    text: 'Леонид находился восточнее Игоря.',
  },
  {
    id: 'pm22',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'north',
    text: 'Жанна была у северного края своей части парка.',
  },
  {
    id: 'pm23',
    type: 'position',
    subject: { type: 'person', id: 'arkady' },
    axis: 'col',
    value: 1,
    text: 'Аркадий находился во втором столбце.',
  },
  {
    id: 'pm25',
    type: 'relativePosition',
    subject: { type: 'person', id: 'grigory' },
    otherPersonId: 'zakhar',
    axis: 'col',
    direction: 'after',
    text: 'Григорий находился восточнее Захара.',
  },
  {
    id: 'pm27',
    type: 'position',
    subject: { type: 'person', id: 'veronika' },
    axis: 'col',
    value: 2,
    text: 'Вероника находилась в третьем столбце.',
  },
  {
    id: 'pm28',
    type: 'wallSide',
    subject: { type: 'person', id: 'igor' },
    wallDirection: 'north',
    text: 'Игорь был у северного края своей части парка.',
  },
  {
    id: 'pm29',
    type: 'relativePosition',
    subject: { type: 'person', id: 'grigory' },
    otherPersonId: 'leonid',
    axis: 'row',
    direction: 'before',
    text: 'Григорий находился севернее Леонида.',
  },
  {
    id: 'pm30',
    type: 'relativePosition',
    subject: { type: 'person', id: 'arkady' },
    otherPersonId: 'grigory',
    axis: 'row',
    direction: 'before',
    text: 'Аркадий находился севернее Григория.',
  },
];

const level: Level = {
  meta: {
    id: 'parkmaze-01',
    title: 'Запутанный след',
    theme: 'parkmaze',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};

export const parkMazeLevel: Level = level;
