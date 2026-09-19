import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10; // рядов
const cols = 11; // столбцов — вытянутая карта 10×11; решение живёт в квадрате 10×10,
// один крайний столбец пуст (какой именно — загадка общей подсказки про стволы).

// «Шахта»: заброшенная серебряная шахта. Два вертикальных ствола по краям с
// рельсовыми путями, между ними — глухая горная порода и четыре выработки
// (штрека). Гурий и Харитон столкнулись в восточном стволе — игрок должен
// сам понять, какой из стволов пуст.
const rooms: Room[] = [
  { id: 'westShaft', name: 'Западный ствол', floorTexture: 'metal' },
  { id: 'eastShaft', name: 'Восточный ствол', floorTexture: 'metal' },
  { id: 'rock', name: 'Горная порода', floorTexture: 'cliff' },
  { id: 'galleryNW', name: 'Северо-западный штрек', floorTexture: 'marble' },
  { id: 'galleryW', name: 'Западный штрек', floorTexture: 'sand' },
  { id: 'galleryE', name: 'Восточный штрек', floorTexture: 'marble' },
  { id: 'galleryS', name: 'Южный штрек', floorTexture: 'sand' },
];

// Рельсовые пути в стволах (по вертикальной оси каждого ствола).
const floorFeatures: FloorFeature[] = [
  { id: 'rails-west', label: 'Рельсовый путь', textureKey: 'rails' },
  { id: 'rails-east', label: 'Рельсовый путь', textureKey: 'rails' },
];
const RAILS_WEST = new Set(Array.from({ length: 10 }, (_, r) => cellId(r, 0)));
const RAILS_EAST = new Set(Array.from({ length: 10 }, (_, r) => cellId(r, 10)));

const itemTypes: ItemType[] = [
  // Уровневые (шахтные — только этот уровень)
  { id: 'pickaxe', label: 'Кирка', kind: 'decorative', icon: 'pickaxe' },
  { id: 'minecart', label: 'Вагонетка', kind: 'occupiable', icon: 'minecart' },
  { id: 'jackhammer', label: 'Отбойный молоток', kind: 'decorative', icon: 'jackhammer' },
  // Библиотечные (переименованы под шахту)
  ItemLibrary.barrel('Бочка с водой'),
  ItemLibrary.lamp('Шахтный фонарь'),
  ItemLibrary.toolbox('Ящик с инструментами'),
];

const items: Item[] = [
  // — Вагонетки на рельсовых путях (2-клеточные вертикальные) —
  { id: 'item-cart-g', typeId: 'minecart', cells: [cellId(0, 10), cellId(1, 10)] }, // под Гурием
  { id: 'item-cart-e1', typeId: 'minecart', cells: [cellId(2, 10), cellId(3, 10)] },
  { id: 'item-cart-e2', typeId: 'minecart', cells: [cellId(6, 10), cellId(7, 10)] },
  { id: 'item-cart-w1', typeId: 'minecart', cells: [cellId(2, 0), cellId(3, 0)] },
  { id: 'item-cart-w2', typeId: 'minecart', cells: [cellId(6, 0), cellId(7, 0)] },
  // — Кирки —
  { id: 'item-pick-1', typeId: 'pickaxe', cells: [cellId(2, 3)] },
  { id: 'item-pick-2', typeId: 'pickaxe', cells: [cellId(4, 9)] },
  { id: 'item-pick-3', typeId: 'pickaxe', cells: [cellId(8, 2)] },
  // — Отбойные молотки —
  { id: 'item-jack-1', typeId: 'jackhammer', cells: [cellId(1, 6)] },
  { id: 'item-jack-2', typeId: 'jackhammer', cells: [cellId(6, 4)] },
  { id: 'item-jack-3', typeId: 'jackhammer', cells: [cellId(9, 3)] },
  // — Бочки с водой —
  { id: 'item-barrel-1', typeId: 'barrel', cells: [cellId(0, 9)] },
  { id: 'item-barrel-2', typeId: 'barrel', cells: [cellId(2, 5)] },
  { id: 'item-barrel-3', typeId: 'barrel', cells: [cellId(6, 8)] },
  { id: 'item-barrel-4', typeId: 'barrel', cells: [cellId(9, 8)] },
  // — Шахтные фонари —
  { id: 'item-lamp-1', typeId: 'lamp', cells: [cellId(2, 6)] },
  { id: 'item-lamp-2', typeId: 'lamp', cells: [cellId(3, 1)] },
  { id: 'item-lamp-3', typeId: 'lamp', cells: [cellId(5, 8)] },
  { id: 'item-lamp-4', typeId: 'lamp', cells: [cellId(8, 3)] },
  // — Ящики с инструментами —
  { id: 'item-toolbox-1', typeId: 'toolbox', cells: [cellId(3, 3)] },
  { id: 'item-toolbox-2', typeId: 'toolbox', cells: [cellId(5, 4)] },
  { id: 'item-toolbox-3', typeId: 'toolbox', cells: [cellId(8, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// з=западный ствол, в=восточный ствол, г=порода, о/д/т/ч=штреки.
const ROOM_ROWS = [
  'ззооггггддв',
  'зггогддддвв',
  'зддддддгггв',
  'зддддгггггв',
  'зздгггггттв',
  'зггттггттвв',
  'зччгтттттгв',
  'ззчгггггггв',
  'згчччччччгв',
  'зггччччччвв',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      з: 'westShaft',
      в: 'eastShaft',
      г: 'rock',
      о: 'galleryNW',
      д: 'galleryW',
      т: 'galleryE',
      ч: 'galleryS',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols).map((cell) => {
  if (RAILS_WEST.has(cell.id)) return { ...cell, floorFeatureId: 'rails-west' };
  if (RAILS_EAST.has(cell.id)) return { ...cell, floorFeatureId: 'rails-east' };
  return cell;
});

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'elisey', name: 'Елисей', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'irina', name: 'Ирина', initialLetter: 'И', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Перестановка 10×10 внутри 10×11: столбцы 1–10 различны, столбец 0 (западный
// ствол) пуст — выводится дизъюнкцией стволов. Гурий (убийца, 1,10) ехал в
// вагонетке восточного ствола; Харитон (жертва, 5,9) был с ним.
const solution: Record<PersonId, CellId> = {
  andrey: cellId(6, 7),
  boris: cellId(0, 3),
  veronika: cellId(4, 8),
  guriy: cellId(1, 10),
  darya: cellId(9, 6),
  elisey: cellId(8, 5),
  zhanna: cellId(2, 1),
  zakhar: cellId(7, 2),
  irina: cellId(3, 4),
  khariton: cellId(5, 9),
};

const clues: Clue[] = [
  // — Общие правила шахты —
  {
    id: 'm1',
    type: 'zoneOccupancy',
    roomIds: ['galleryNW', 'galleryW', 'galleryE', 'galleryS'],
    text: 'Ни одна выработка не осталась пустой.',
  },
  {
    id: 'm2',
    type: 'zoneEmptyDisjunction',
    roomIds: ['westShaft', 'eastShaft'],
    text: 'Один из двух стволов был пустым.',
  },
  {
    id: 'm3',
    type: 'zoneEmptyDisjunction',
    roomIds: ['rock'],
    text: 'Никто не находился на горной породе.',
  },
  // — Личные: привязки —
  {
    id: 'm6',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'guriy' },
    itemTypeId: 'minecart',
    text: 'Гурий ехал в вагонетке.',
  },
  {
    id: 'm7',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'lamp',
    text: 'Жанна стояла около шахтного фонаря.',
  },
  {
    id: 'm8',
    type: 'adjacency',
    subject: { type: 'person', id: 'andrey' },
    itemTypeId: 'barrel',
    text: 'Андрей находился рядом с бочкой.',
  },
  {
    id: 'm9',
    type: 'adjacency',
    subject: { type: 'person', id: 'zakhar' },
    itemTypeId: 'pickaxe',
    text: 'Захар стоял рядом с киркой.',
  },
  {
    id: 'm10',
    type: 'adjacency',
    subject: { type: 'person', id: 'darya' },
    itemTypeId: 'toolbox',
    text: 'Дарья находилась рядом с ящиком с инструментами.',
  },
  // — Личные: различители —
  {
    id: 'm11',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'galleryNW',
    text: 'Борис работал в северо-западном штреке.',
  },
  {
    id: 'm12',
    type: 'wallSide',
    subject: { type: 'person', id: 'elisey' },
    wallDirection: 'north',
    text: 'Елисей стоял у северной стены выработки.',
  },
  {
    id: 'm13',
    type: 'parity',
    subject: { type: 'person', id: 'irina' },
    axis: 'row',
    parity: 'even',
    text: 'Ирина находилась в чётном ряду.',
  },
  {
    id: 'm18',
    type: 'adjacency',
    subject: { type: 'person', id: 'veronika' },
    itemTypeId: 'lamp',
    text: 'Вероника стояла около шахтного фонаря.',
  },
  {
    id: 'm19',
    type: 'floorTexture',
    subject: { type: 'person', id: 'zhanna' },
    textureKey: 'sand',
    text: 'Жанна работала в песчаном забое.',
  },
  {
    id: 'm20',
    type: 'parity',
    subject: { type: 'person', id: 'darya' },
    axis: 'col',
    parity: 'odd',
    text: 'Дарья находилась в нечётном столбце.',
  },
  {
    id: 'm22',
    type: 'position',
    subject: { type: 'person', id: 'zakhar' },
    axis: 'col',
    value: 2,
    text: 'Захар находился в третьем столбце.',
  },
  {
    id: 'm21',
    type: 'adjacency',
    subject: { type: 'person', id: 'irina' },
    itemTypeId: 'toolbox',
    text: 'Ирина стояла рядом с ящиком с инструментами.',
  },
  {
    id: 'm23',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'irina',
    axis: 'row',
    direction: 'after',
    text: 'Дарья находилась южнее Ирины.',
  },
  {
    id: 'm26',
    type: 'parity',
    subject: { type: 'person', id: 'guriy' },
    axis: 'row',
    parity: 'even',
    text: 'Гурий находился в чётном ряду.',
  },
  {
    id: 'm27',
    type: 'relativePosition',
    subject: { type: 'person', id: 'guriy' },
    otherPersonId: 'irina',
    axis: 'row',
    direction: 'before',
    text: 'Гурий находился севернее Ирины.',
  },
];

const level: Level = {
  meta: {
    id: 'mine-01',
    title: 'Завал в шахте',
    theme: 'mine',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    rosterColumnCounts: [4, 3, 3],
    // Осознанный принятый долг (решение пользователя на QA): adjacency 6/19 = 31.6%
    // при капе 30% — тема шахты держится на предметных привязках, лишнюю
    // adjacency (Ирина-ящик) убирать нельзя: она эпистемически обязательна
    // (без неё живы 4 мира-убийцы), а замена на parity даёт случайный full-pin.
    clueBalanceExempt: true,
  },
  size,
  cols,
  rooms,
  itemTypes,
  items,
  floorFeatures,
  cells,
  people,
  solution,
  clues,
};

export const mineLevel: Level = level;
