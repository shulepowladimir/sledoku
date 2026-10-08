import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11;
const cols = 10;

const rooms: Room[] = [
  { id: 'exit', name: 'Шлюз выхода', floorTexture: 'metal' },
  { id: 'stairwell', name: 'Лестница', floorTexture: 'stairs' },
  { id: 'canteen', name: 'Общая столовая', floorTexture: 'linoleum' },
  { id: 'control', name: 'Отдел управления', floorTexture: 'concrete' },
  { id: 'residential', name: 'Жилой отсек', floorTexture: 'wood' },
  { id: 'medical', name: 'Медблок', floorTexture: 'tile' },
  { id: 'greenhouse', name: 'Оранжерея', floorTexture: 'dirt' },
  { id: 'technical', name: 'Технический отдел', floorTexture: 'workshopFloor' },
  { id: 'energy', name: 'Энергоблок', floorTexture: 'metal' },
];

const ROOM_ROWS = [
  'ВВЛЛСССССС',
  'ВВВЛЛССССС',
  'УУВВЛЛСССС',
  'УУУУУЛЛМММ',
  'УУУУУУЛЛММ',
  'ЖЖЖЖЖЛЛМММ',
  'ЖЖЖЖЛЛОООО',
  'ЖЖЖЛЛООООО',
  'ТТЛЛЭЭЭЭЭЭ',
  'ТТТЛЛЭЭЭЭЭ',
  'ТТТТЛЛЭЭЭЭ',
];

const ROOM_BY_SYMBOL: Record<string, string> = {
  В: 'exit',
  Л: 'stairwell',
  С: 'canteen',
  У: 'control',
  Ж: 'residential',
  М: 'medical',
  О: 'greenhouse',
  Т: 'technical',
  Э: 'energy',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_SYMBOL[ROOM_ROWS[row][col]];
}

const itemTypes: ItemType[] = [
  ItemLibrary.airlock(),
  ItemLibrary.locker(),
  ItemLibrary.camera(),
  ItemLibrary.table('Обеденный стол'),
  ItemLibrary.chair('Стул столовой'),
  ItemLibrary.fridge(),
  ItemLibrary.watercooler(),
  ItemLibrary.console('Пульт жизнеобеспечения', { icon: 'directorConsole' }),
  ItemLibrary.computer(),
  ItemLibrary.radioStation(),
  ItemLibrary.bed('Койка'),
  ItemLibrary.bench('Скамья жилого отсека'),
  ItemLibrary.examTable(),
  ItemLibrary.medicineCabinet(),
  ItemLibrary.gardenBed('Грядка', {
    render: 'tile',
    tileEdgeColors: { fill: '#8F5A3A', shadow: '#5A3B2B', outline: '#3A2A20' },
  }),
  ItemLibrary.plant(),
  ItemLibrary.workbench(),
  ItemLibrary.toolbox(),
  ItemLibrary.box('Ящик с запчастями'),
  ItemLibrary.fireExtinguisher(),
  ItemLibrary.reactorVat('Реакторный блок'),
  ItemLibrary.cable('Кабель жизнеобеспечения'),
];

const items: Item[] = [
  { id: 'bunker-exit-airlock', typeId: 'airlock', cells: [cellId(0, 0)] },
  { id: 'bunker-exit-locker', typeId: 'locker', cells: [cellId(1, 1)] },
  { id: 'bunker-exit-camera', typeId: 'camera', cells: [cellId(2, 3)] },

  { id: 'bunker-canteen-table-1', typeId: 'table', cells: [cellId(0, 4), cellId(0, 5)] },
  { id: 'bunker-canteen-table-2', typeId: 'table', cells: [cellId(2, 6), cellId(2, 7)] },
  { id: 'bunker-canteen-chair-1', typeId: 'chair', cells: [cellId(0, 7)] },
  { id: 'bunker-canteen-chair-2', typeId: 'chair', cells: [cellId(1, 6)] },
  { id: 'bunker-canteen-fridge', typeId: 'fridge', cells: [cellId(1, 8)] },
  { id: 'bunker-canteen-watercooler', typeId: 'watercooler', cells: [cellId(2, 9)] },

  { id: 'bunker-control-console', typeId: 'console', cells: [cellId(3, 0)] },
  { id: 'bunker-control-computer', typeId: 'computer', cells: [cellId(4, 1)] },
  { id: 'bunker-control-radio', typeId: 'radioStation', cells: [cellId(4, 2)] },
  { id: 'bunker-control-camera', typeId: 'camera', cells: [cellId(4, 3)] },

  { id: 'bunker-residential-bed-1', typeId: 'bed', cells: [cellId(5, 0), cellId(5, 1)] },
  { id: 'bunker-residential-bed-2', typeId: 'bed', cells: [cellId(6, 0), cellId(6, 1)] },
  { id: 'bunker-residential-bed-egor', typeId: 'bed', cells: [cellId(5, 3)] },
  { id: 'bunker-residential-locker', typeId: 'locker', cells: [cellId(6, 2)] },
  { id: 'bunker-residential-bench', typeId: 'bench', cells: [cellId(7, 0), cellId(7, 1)] },

  { id: 'bunker-medical-cabinet', typeId: 'medicineCabinet', cells: [cellId(3, 8)] },
  { id: 'bunker-medical-table', typeId: 'examTable', cells: [cellId(4, 8), cellId(4, 9)] },
  { id: 'bunker-medical-bed', typeId: 'bed', cells: [cellId(5, 8), cellId(5, 9)] },

  {
    id: 'bunker-greenhouse-beds',
    typeId: 'gardenBed',
    cells: [cellId(6, 6), cellId(6, 7), cellId(7, 6), cellId(7, 7)],
  },
  { id: 'bunker-greenhouse-plant-1', typeId: 'plant', cells: [cellId(6, 8)] },
  { id: 'bunker-greenhouse-plant-2', typeId: 'plant', cells: [cellId(7, 8)] },

  { id: 'bunker-workbench', typeId: 'workbench', cells: [cellId(8, 0), cellId(8, 1)] },
  { id: 'bunker-toolbox', typeId: 'toolbox', cells: [cellId(9, 1)] },
  { id: 'bunker-spare-parts', typeId: 'box', cells: [cellId(9, 2)] },
  { id: 'bunker-technical-extinguisher', typeId: 'fireExtinguisher', cells: [cellId(10, 2)] },

  { id: 'bunker-reactor', typeId: 'reactorVat', cells: [cellId(8, 8), cellId(8, 9)] },
  { id: 'bunker-energy-console', typeId: 'console', cells: [cellId(8, 6)] },
  {
    id: 'bunker-life-support-cable',
    typeId: 'cable',
    cells: [cellId(9, 6), cellId(9, 7), cellId(10, 7), cellId(10, 8)],
  },
  { id: 'bunker-energy-camera', typeId: 'camera', cells: [cellId(9, 8)] },
  { id: 'bunker-energy-extinguisher', typeId: 'fireExtinguisher', cells: [cellId(10, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols);

const people: Person[] = [
  { id: 'ada', name: 'Ада', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'gleb', name: 'Глеб', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'ilya', name: 'Илья', initialLetter: 'И', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'hariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

// One person occupies each of ten distinct rows and columns; row 2 (level −20 m) is empty.
// Gleb and Hariton are the only people in the energy block.
const solution: Record<PersonId, CellId> = {
  ada: cellId(0, 1),
  boris: cellId(2, 2),
  vera: cellId(3, 7),
  dina: cellId(4, 8),
  egor: cellId(5, 3),
  zhanna: cellId(6, 4),
  zoya: cellId(7, 5),
  gleb: cellId(8, 6),
  ilya: cellId(9, 0),
  hariton: cellId(10, 9),
};

const clues: Clue[] = [
  {
    id: 'bunker-empty-floor-choice',
    type: 'rowExactlyOneEmpty',
    rows: [1, 3, 7],
    text: 'Пустым остался ровно один из этажей −20, −40 и −80 м.',
  },
  {
    id: 'bunker-energy-occupants',
    type: 'zoneExactCount',
    roomId: 'energy',
    count: 2,
    text: 'В энергоблоке и шлюзе выхода было ровно по два человека.',
    groupId: 'bunker-room-counts',
  },
  {
    id: 'bunker-exit-occupants',
    type: 'zoneExactCount',
    roomId: 'exit',
    count: 2,
    text: 'В энергоблоке и шлюзе выхода было ровно по два человека.',
    groupId: 'bunker-room-counts',
  },
  {
    id: 'bunker-ada-above-boris',
    type: 'relativePosition',
    subject: { type: 'person', id: 'ada' },
    otherPersonId: 'boris',
    axis: 'row',
    direction: 'before',
    text: 'Ада находилась выше Бориса.',
  },
  {
    id: 'bunker-ada-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'ada' },
    wallDirection: 'east',
    text: 'Ада стояла у восточной стены своей зоны.',
  },
  {
    id: 'bunker-boris-at-airlock',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'exit',
    text: 'Борис находился в шлюзе выхода.',
  },
  {
    id: 'bunker-vera-by-cabinet',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'vera' },
    itemTypeId: 'medicineCabinet',
    text: 'Вера находилась в одной комнате с медицинским шкафом.',
  },
  {
    id: 'bunker-dina-odd-floor',
    type: 'parity',
    subject: { type: 'person', id: 'dina' },
    axis: 'row',
    parity: 'odd',
    text: 'Дина находилась на этаже с нечётным номером.',
  },
  {
    id: 'bunker-dina-in-medical',
    type: 'roomMembership',
    subject: { type: 'person', id: 'dina' },
    roomId: 'medical',
    text: 'Дина находилась в медблоке.',
  },
  {
    id: 'bunker-egor-in-bed',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'egor' },
    itemTypeId: 'bed',
    text: 'Егор находился на койке.',
  },
  {
    id: 'bunker-zhanna-corner',
    type: 'corner',
    subject: { type: 'person', id: 'zhanna' },
    text: 'Жанна стояла в углу своей зоны.',
  },
  {
    id: 'bunker-zhanna-below-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'vera',
    axis: 'row',
    direction: 'after',
    text: 'Жанна находилась ниже Веры.',
  },
  {
    id: 'bunker-zoya-in-greenhouse',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'greenhouse',
    text: 'Зоя находилась в оранжерее.',
  },
  {
    id: 'bunker-gleb-at-console',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'gleb' },
    itemTypeId: 'console',
    text: 'Глеб находился на клетке одного из пультов жизнеобеспечения.',
  },
  {
    id: 'bunker-ilya-by-toolbox',
    type: 'adjacency',
    subject: { type: 'person', id: 'ilya' },
    itemTypeId: 'toolbox',
    text: 'Находился рядом с ящиком инструментов.',
  },
];

const level: Level = {
  meta: {
    id: 'bunker-01',
    title: '110 метров под землёй',
    theme: 'bunker',
    difficulty: 7,
    menuTag: 'expert',
    maxFullyPinnedPeople: 0,
    generalNotes: ['Этажи на схеме идут сверху вниз: от −10 до −110 м с шагом 10 м.'],
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

export const bunkerLevel = level;
