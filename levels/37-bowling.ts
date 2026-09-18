import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11; // рядов
const cols = 10; // столбцов

// «Это страйк, Чувак»: ночной кегельбан. Пять дорожек уходят на север к пин-деку
// (кегли в первом ряду), юг — зона игроков, прокат обуви и бар. Решение живёт
// в квадрате 10×10: один ряд остаётся пустым (ряд бара) — загадка дизъюнкции
// «ряд с кеглями или ряд со стойкой» (в ряду кеглей стоит Ирвин).
const rooms: Room[] = [
  { id: 'lane1', name: 'Дорожка 1', floorTexture: 'wood' },
  { id: 'lane2', name: 'Дорожка 2', floorTexture: 'stairs' },
  { id: 'lane3', name: 'Дорожка 3', floorTexture: 'wood' },
  { id: 'lane4', name: 'Дорожка 4', floorTexture: 'stairs' },
  { id: 'lane5', name: 'Дорожка 5', floorTexture: 'wood' },
  { id: 'playerZone', name: 'Зона игроков', floorTexture: 'checker' },
  { id: 'shoeRental', name: 'Прокат обуви', floorTexture: 'carpet' },
  { id: 'bar', name: 'Бар', floorTexture: 'rug' },
];

const itemTypes: ItemType[] = [
  // Уровневые (не в библиотеке — только этот кегельбан)
  { id: 'ballReturn', label: 'Возвратник шаров', kind: 'decorative', icon: 'ballReturn' },
  { id: 'pins', label: 'Кегли', kind: 'decorative', icon: 'pins' },
  { id: 'bowlingBall', label: 'Шар для боулинга', kind: 'decorative', icon: 'bowlingBall' },
  { id: 'departureBoard', label: 'Табло результатов', kind: 'decorative', icon: 'departureBoard' },
  // Библиотечные (booth/rack переименованы под тему)
  ItemLibrary.barStool(),
  ItemLibrary.barCounter(),
  ItemLibrary.chair(),
  ItemLibrary.sofa(),
  ItemLibrary.booth('Столик игроков'),
  ItemLibrary.rack('Стеллаж с обувью'),
];

const items: Item[] = [
  // Кегли на пин-деке (дорожки 1, 3, 4 — 2-клеточные)
  { id: 'item-pins-1', typeId: 'pins', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-pins-2', typeId: 'pins', cells: [cellId(0, 4), cellId(0, 5)] },
  { id: 'item-pins-3', typeId: 'pins', cells: [cellId(0, 6), cellId(0, 7)] },
  // Шары на дорожках
  { id: 'item-ball-1', typeId: 'bowlingBall', cells: [cellId(3, 1)] },
  { id: 'item-ball-2', typeId: 'bowlingBall', cells: [cellId(0, 3)] },
  { id: 'item-ball-3', typeId: 'bowlingBall', cells: [cellId(3, 4)] },
  { id: 'item-ball-4', typeId: 'bowlingBall', cells: [cellId(4, 7)] },
  { id: 'item-ball-5', typeId: 'bowlingBall', cells: [cellId(1, 8)] },
  // Возвратники вдоль зоны игроков
  { id: 'item-return-1', typeId: 'ballReturn', cells: [cellId(8, 0)] },
  { id: 'item-return-2', typeId: 'ballReturn', cells: [cellId(7, 3)] },
  { id: 'item-return-3', typeId: 'ballReturn', cells: [cellId(8, 4)] },
  { id: 'item-return-4', typeId: 'ballReturn', cells: [cellId(7, 7)] },
  { id: 'item-return-5', typeId: 'ballReturn', cells: [cellId(8, 8)] },
  // Табло результатов над дорожками
  { id: 'item-board-1', typeId: 'departureBoard', cells: [cellId(7, 1)] },
  { id: 'item-board-2', typeId: 'departureBoard', cells: [cellId(7, 5)] },
  { id: 'item-board-3', typeId: 'departureBoard', cells: [cellId(7, 9)] },
  // Зона игроков: столики
  { id: 'item-booth-1', typeId: 'booth', cells: [cellId(8, 1)] },
  { id: 'item-booth-2', typeId: 'booth', cells: [cellId(9, 3)] },
  { id: 'item-booth-3', typeId: 'booth', cells: [cellId(9, 5)] },
  { id: 'item-booth-4', typeId: 'booth', cells: [cellId(8, 6)] },
  { id: 'item-booth-5', typeId: 'booth', cells: [cellId(8, 9)] },
  // Бар: табуреты и стойка
  { id: 'item-stool-1', typeId: 'barStool', cells: [cellId(9, 0)] },
  { id: 'item-stool-2', typeId: 'barStool', cells: [cellId(9, 1)] },
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(10, 0), cellId(10, 1)] },
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(9, 2)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(10, 3)] },
  // Диваны (зона отдыха у бара/проката)
  { id: 'item-sofa-1', typeId: 'sofa', cells: [cellId(9, 7), cellId(9, 8)] },
  { id: 'item-sofa-2', typeId: 'sofa', cells: [cellId(10, 6), cellId(10, 7)] },
  // Прокат: стеллажи с обувью
  { id: 'item-rack-1', typeId: 'rack', cells: [cellId(10, 5)] },
  { id: 'item-rack-2', typeId: 'rack', cells: [cellId(10, 9)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// О=дорожка 1, Д=дорожка 2, Т=дорожка 3, Ч=дорожка 4, П=дорожка 5,
// И=зона игроков, Б=бар, Г=прокат обуви.
const ROOM_ROWS = [
  'ооддттччпп',
  'ооддттччпп',
  'ооддттччпп',
  'ооддттччпп',
  'ооддттччпп',
  'ооддттччпп',
  'ооддттччпп',
  'ииииииииии',
  'ииииииииии',
  'бббииигггг',
  'бббббггггг',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      о: 'lane1',
      д: 'lane2',
      т: 'lane3',
      ч: 'lane4',
      п: 'lane5',
      и: 'playerZone',
      г: 'shoeRental',
      б: 'bar',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols);

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'brandt', name: 'Брандт', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'volter', name: 'Волтер', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'garry', name: 'Гэрри', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'jeffrey', name: 'Джеффри', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'elena', name: 'Елена', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'juli', name: 'Жюли', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zane', name: 'Зейн', initialLetter: 'З', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'irvin', name: 'Ирвин', initialLetter: 'И', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'hesus', name: 'Хесус', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

// Перестановка 10×10 внутри 11×10: ряды 0–9 и столбцы 0–9 различны, ряд 10 (бар) пуст.
// Волтер (убийца, 2,2) и Хесус (жертва, 5,3) — вдвоём на второй дорожке;
// Ирвин (0,9) — в ряду кеглей, но на пустой дорожке 5; Елена — за столиком,
// Зейн — на диване у проката.
const solution: Record<PersonId, CellId> = {
  anna: cellId(1, 0),
  brandt: cellId(6, 7),
  volter: cellId(2, 2),
  garry: cellId(3, 5),
  jeffrey: cellId(4, 6),
  elena: cellId(8, 1),
  juli: cellId(7, 4),
  zane: cellId(9, 8),
  irvin: cellId(0, 9),
  hesus: cellId(5, 3),
};

const clues: Clue[] = [
  // — Общие правила кегельбана —
  {
    id: 'b1',
    type: 'itemRowEmptyDisjunction',
    itemTypeIds: ['pins', 'barCounter'],
    text: 'Никого не было в одном ряду — с кеглями или с барной стойкой.',
  },
  {
    id: 'b2',
    type: 'zoneCountParity',
    zones: [
      { roomId: 'lane1', parity: 'odd' },
      { roomId: 'lane2', parity: 'even' },
      { roomId: 'lane3', parity: 'odd' },
      { roomId: 'lane4', parity: 'even' },
      { roomId: 'lane5', parity: 'odd' },
    ],
    text: 'На чётных дорожках было чётное число людей, на нечётных — нечётное.',
  },
  // — Личные: привязки —
  {
    id: 'b3',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'elena' },
    itemTypeId: 'booth',
    text: 'Елена сидела за столиком игроков.',
  },
  {
    id: 'b4',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'zane' },
    itemTypeId: 'sofa',
    text: 'Зейн сидел на диване.',
  },
  {
    id: 'b5',
    type: 'corner',
    subject: { type: 'person', id: 'irvin' },
    text: 'Ирвин находился в углу своей зоны.',
  },
  {
    id: 'b6',
    type: 'corner',
    subject: { type: 'person', id: 'brandt' },
    text: 'Брандт находился в углу своей зоны.',
  },
  {
    id: 'b7',
    type: 'parity',
    subject: { type: 'person', id: 'juli' },
    axis: 'row',
    parity: 'even',
    text: 'Жюли находилась в чётном ряду.',
  },
  {
    id: 'b8',
    type: 'adjacency',
    subject: { type: 'person', id: 'jeffrey' },
    itemTypeId: 'bowlingBall',
    text: 'Джеффри находился рядом с шаром для боулинга.',
  },
  {
    id: 'b9',
    type: 'adjacency',
    subject: { type: 'person', id: 'anna' },
    itemTypeId: 'pins',
    text: 'Анна находилась рядом с кеглями.',
  },
  {
    id: 'b10',
    type: 'floorTexture',
    subject: { type: 'person', id: 'garry' },
    textureKey: 'wood',
    text: 'Гэрри играл на деревянной дорожке.',
  },
  // — Личные: различители —
  {
    id: 'b11',
    type: 'parity',
    subject: { type: 'person', id: 'jeffrey' },
    axis: 'row',
    parity: 'odd',
    text: 'Джеффри находился в нечётном ряду.',
  },
  {
    id: 'b12',
    type: 'wallSide',
    subject: { type: 'person', id: 'volter' },
    wallDirection: 'west',
    text: 'Волтер стоял у западной стены своей дорожки.',
  },
  {
    id: 'b13',
    type: 'relativePosition',
    subject: { type: 'person', id: 'garry' },
    otherPersonId: 'jeffrey',
    axis: 'row',
    direction: 'before',
    text: 'Гэрри находился севернее Джеффри.',
  },
  {
    id: 'b14',
    type: 'relativePosition',
    subject: { type: 'person', id: 'volter' },
    otherPersonId: 'garry',
    axis: 'row',
    direction: 'before',
    text: 'Волтер находился севернее Гэрри.',
  },
  {
    id: 'b15',
    type: 'wallSide',
    subject: { type: 'person', id: 'anna' },
    wallDirection: 'west',
    text: 'Анна стояла у западной стены своей дорожки.',
  },
  {
    id: 'b16',
    type: 'zoneGenderSeparation',
    text: 'Женщины и мужчины не находились в одной зоне.',
  },
  {
    id: 'b17',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'brandt' },
    itemTypeId: 'pins',
    text: 'Брандт находился в одной зоне с кеглями.',
  },
];

const level: Level = {
  meta: {
    id: 'bowling-01',
    title: 'Это страйк, Чувак',
    theme: 'bowling',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
  },
  size,
  cols,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};

export const bowlingLevel: Level = level;
