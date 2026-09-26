import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

const rooms: Room[] = [
  { id: 'entrance', name: 'Вестибюль', floorTexture: 'marble' },
  { id: 'popCulture', name: 'Поп-культура и искусство', floorTexture: 'checker' },
  { id: 'readingHall', name: 'Большой читальный зал', floorTexture: 'wood' },
  { id: 'archive', name: 'Архив', floorTexture: 'stone' },
  { id: 'travel', name: 'Книги о путешествиях', floorTexture: 'carpet' },
  { id: 'detectives', name: 'Детективы', floorTexture: 'linoleum' },
  { id: 'readingRooms', name: 'Читальные кабинеты', floorTexture: 'tile' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.bookshelf(),
  ItemLibrary.ladder(),
  ItemLibrary.table('Читальный стол'),
  ItemLibrary.floorLamp('Настольная лампа'),
  ItemLibrary.armchair('Кресло читателя'),
];

const items: Item[] = [
  { id: 'entrance-shelf', typeId: 'bookshelf', cells: [cellId(0, 0)] },
  { id: 'entrance-table', typeId: 'table', cells: [cellId(1, 0)] },
  { id: 'entrance-chair', typeId: 'armchair', cells: [cellId(2, 1)] },

  { id: 'pop-shelf-1', typeId: 'bookshelf', cells: [cellId(0, 4)] },
  { id: 'pop-shelf-2', typeId: 'bookshelf', cells: [cellId(1, 6)] },
  { id: 'pop-lamp', typeId: 'floorLamp', cells: [cellId(0, 6)] },
  { id: 'pop-ladder', typeId: 'ladder', cells: [cellId(1, 4)] },
  { id: 'pop-table', typeId: 'table', cells: [cellId(2, 5)] },
  { id: 'pop-chair', typeId: 'armchair', cells: [cellId(2, 6)] },

  { id: 'hall-shelf-1', typeId: 'bookshelf', cells: [cellId(0, 7)] },
  { id: 'hall-shelf-2', typeId: 'bookshelf', cells: [cellId(1, 9)] },
  { id: 'hall-shelf-3', typeId: 'bookshelf', cells: [cellId(2, 8)] },
  { id: 'hall-lamp', typeId: 'floorLamp', cells: [cellId(2, 9)] },
  { id: 'hall-shelf-4', typeId: 'bookshelf', cells: [cellId(3, 7)] },
  { id: 'hall-chair', typeId: 'armchair', cells: [cellId(3, 8)] },
  { id: 'hall-shelf-5', typeId: 'bookshelf', cells: [cellId(4, 7)] },
  { id: 'hall-shelf-6', typeId: 'bookshelf', cells: [cellId(5, 8)] },
  { id: 'hall-table', typeId: 'table', cells: [cellId(6, 8)] },
  { id: 'hall-shelf-7', typeId: 'bookshelf', cells: [cellId(7, 8)] },
  { id: 'hall-ladder', typeId: 'ladder', cells: [cellId(8, 9)] },
  { id: 'hall-shelf-8', typeId: 'bookshelf', cells: [cellId(9, 9)] },

  { id: 'archive-shelf-1', typeId: 'bookshelf', cells: [cellId(2, 3)] },
  { id: 'archive-lamp', typeId: 'floorLamp', cells: [cellId(3, 1)] },
  { id: 'archive-table', typeId: 'table', cells: [cellId(3, 3)] },
  { id: 'archive-shelf-2', typeId: 'bookshelf', cells: [cellId(4, 1)] },
  { id: 'archive-ladder', typeId: 'ladder', cells: [cellId(5, 2)] },

  { id: 'travel-shelf-1', typeId: 'bookshelf', cells: [cellId(5, 0)] },
  { id: 'travel-table', typeId: 'table', cells: [cellId(6, 0)] },
  { id: 'travel-shelf-2', typeId: 'bookshelf', cells: [cellId(7, 0)] },
  { id: 'travel-shelf-3', typeId: 'bookshelf', cells: [cellId(8, 1)] },
  { id: 'travel-lamp', typeId: 'floorLamp', cells: [cellId(9, 0)] },

  { id: 'detective-shelf-1', typeId: 'bookshelf', cells: [cellId(4, 4)] },
  { id: 'detective-table', typeId: 'table', cells: [cellId(4, 6)] },
  { id: 'detective-shelf-2', typeId: 'bookshelf', cells: [cellId(5, 4)] },
  { id: 'detective-ladder', typeId: 'ladder', cells: [cellId(5, 6)] },
  { id: 'detective-chair', typeId: 'armchair', cells: [cellId(6, 5)] },

  { id: 'reading-shelf', typeId: 'bookshelf', cells: [cellId(7, 4)] },
  { id: 'reading-table-1', typeId: 'table', cells: [cellId(7, 6)] },
  { id: 'reading-chair-1', typeId: 'armchair', cells: [cellId(8, 3)] },
  { id: 'reading-lamp', typeId: 'floorLamp', cells: [cellId(8, 6)] },
  { id: 'reading-chair-2', typeId: 'armchair', cells: [cellId(9, 3)] },
  { id: 'reading-table-2', typeId: 'table', cells: [cellId(9, 5)] },
];

// The largest room is the reading hall (30 cells). Its two occupants are the victim and murderer.
const ROOM_ROWS = [
  'AAAABBBCCC',
  'AAAABBBCCC',
  'AADDBBBCCC',
  'ADDDDBCCCC',
  'EDDDFFFCCC',
  'EEDDFFFFCC',
  'EEEGGFFCCC',
  'EEEGGGGCCC',
  'EEEGGGGCCC',
  'EEEGGGGCCC',
];

const ROOM_BY_LETTER: Record<string, string> = {
  A: 'entrance',
  B: 'popCulture',
  C: 'readingHall',
  D: 'archive',
  E: 'travel',
  F: 'detectives',
  G: 'readingRooms',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: true },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(0, 9),
  khariton: cellId(1, 8),
  boris: cellId(2, 0),
  vadim: cellId(3, 5),
  grigory: cellId(4, 2),
  dmitry: cellId(5, 7),
  efim: cellId(6, 6),
  zhanna: cellId(7, 3),
  zoya: cellId(8, 4),
  inna: cellId(9, 1),
};

const clues: Clue[] = [
  {
    id: 'lib-all-zones-occupied',
    type: 'roomOccupancy',
    text: 'Во всех семи зонах библиотеки находился хотя бы один человек.',
  },
  {
    id: 'lib-zone-count-parity',
    type: 'zoneCountParity',
    zones: [
      { roomId: 'entrance', parity: 'odd' },
      { roomId: 'popCulture', parity: 'odd' },
      { roomId: 'readingHall', parity: 'even' },
      { roomId: 'archive', parity: 'odd' },
      { roomId: 'travel', parity: 'odd' },
      { roomId: 'detectives', parity: 'even' },
      { roomId: 'readingRooms', parity: 'even' },
    ],
    text: 'В большом читальном зале, отделе детективов и читальных кабинетах было чётное число людей, в остальных - нечётное.',
  },
  { id: 'lib-anna-north-vadim', type: 'relativePosition', subject: { type: 'person', id: 'anna' }, otherPersonId: 'vadim', axis: 'row', direction: 'before', offset: 3, text: 'Анна находилась ровно на три ряда севернее Вадима.' },
  { id: 'lib-boris-armchair', type: 'adjacency', subject: { type: 'person', id: 'boris' }, itemTypeId: 'armchair', text: 'Борис находился рядом с креслом для читателей.' },
  { id: 'lib-vadim-even-row', type: 'parity', subject: { type: 'person', id: 'vadim' }, axis: 'row', parity: 'even', text: 'Вадим находился в ряду с чётным номером.' },
  { id: 'lib-vadim-not-floor-lamp', type: 'adjacency', subject: { type: 'person', id: 'vadim' }, itemTypeId: 'floorLamp', negated: true, text: 'Вадим не находился рядом с настольной лампой.' },
  { id: 'lib-grigory-archive', type: 'roomMembership', subject: { type: 'person', id: 'grigory' }, roomId: 'archive', text: 'Григорий находился в архиве.' },
  { id: 'lib-grigory-odd-row', type: 'parity', subject: { type: 'person', id: 'grigory' }, axis: 'row', parity: 'odd', text: 'Григорий находился в ряду с нечётным номером.' },
  { id: 'lib-dmitry-ladder', type: 'adjacency', subject: { type: 'person', id: 'dmitry' }, itemTypeId: 'ladder', text: 'Дмитрий находился рядом со стремянкой.' },
  { id: 'lib-dmitry-with-efim', type: 'sameRoomAs', subject: { type: 'person', id: 'dmitry' }, otherPersonId: 'efim', text: 'Дмитрий находился в одной зоне с Ефимом.' },
  { id: 'lib-efim-armchair', type: 'adjacency', subject: { type: 'person', id: 'efim' }, itemTypeId: 'armchair', text: 'Ефим находился рядом с креслом для читателей.' },
  { id: 'lib-zhanna-north-inna', type: 'relativePosition', subject: { type: 'person', id: 'zhanna' }, otherPersonId: 'inna', axis: 'row', direction: 'before', text: 'Жанна находилась севернее Инны.' },
  { id: 'lib-zoya-armchair', type: 'adjacency', subject: { type: 'person', id: 'zoya' }, itemTypeId: 'armchair', text: 'Зоя находилась рядом с креслом для читателей.' },
  { id: 'lib-zoya-with-zhanna', type: 'sameRoomAs', subject: { type: 'person', id: 'zoya' }, otherPersonId: 'zhanna', text: 'Зоя находилась в одной зоне с Жанной.' },
  { id: 'lib-zoya-south-zhanna', type: 'relativePosition', subject: { type: 'person', id: 'zoya' }, otherPersonId: 'zhanna', axis: 'row', direction: 'after', text: 'Зоя находилась южнее Жанны.' },
  { id: 'lib-inna-south-wall', type: 'wallSide', subject: { type: 'person', id: 'inna' }, wallDirection: 'south', text: 'Инна находилась у южной стены своей зоны.' },
];

export const libraryLevel: Level = {
  meta: {
    id: 'library-01',
    title: 'Не суди по обложке',
    theme: 'library',
    difficulty: 10,
    maxFullyPinnedPeople: 0,
    menuTag: 'expert',
    // Пользователь одобрил 5/16 adjacency (31.25%) как исключение ради исключения альтернативных убийц.
    clueBalanceExempt: true,
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
