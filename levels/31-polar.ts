import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;

// Полярная станция в полярную ночь. Сверху — станция-модуль (радиорубка,
// каюты, кают-компания, склад), снизу — снежное поле с иглу и снегоходом
// и ледяное поле с торосами, прорубью, белым медведем и пингвинами.
const rooms: Room[] = [
  { id: 'radio', name: 'Радиорубка', floorTexture: 'linoleum' },
  { id: 'bunk', name: 'Каюты', floorTexture: 'carpet' },
  { id: 'mess', name: 'Кают-компания', floorTexture: 'wood' },
  { id: 'storage', name: 'Склад', floorTexture: 'metal' },
  { id: 'snow', name: 'Снежное поле', floorTexture: 'snow' },
  { id: 'ice', name: 'Ледяное поле', floorTexture: 'ice' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'polynya', label: 'Прорубь', textureKey: 'water' },
];
const POLYNYA_CELLS = new Set([cellId(6, 8), cellId(6, 9)]);

const itemTypes: ItemType[] = [
  ItemLibrary.radioStation(),
  ItemLibrary.chair('Стул радиста'),
  ItemLibrary.journal('Бортовой журнал'),
  ItemLibrary.bed(),
  ItemLibrary.wardrobe(),
  ItemLibrary.lamp('Лампа каюты'),
  ItemLibrary.stove('Печь'),
  ItemLibrary.samovar(),
  ItemLibrary.table(),
  ItemLibrary.cup(),
  ItemLibrary.box('Ящик с припасами'),
  ItemLibrary.barrel('Бочка солярки'),
  ItemLibrary.toolbox(),
  ItemLibrary.fridge('Морозильник'),
  ItemLibrary.windsock(),
  ItemLibrary.igloo(),
  ItemLibrary.snowmobile(),
  ItemLibrary.polarBear(),
  ItemLibrary.penguin(),
  ItemLibrary.rock('Торос'),
];

const items: Item[] = [
  // Радиорубка
  { id: 'item-radio', typeId: 'radioStation', cells: [cellId(1, 1)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(0, 3)] },
  { id: 'item-journal', typeId: 'journal', cells: [cellId(2, 3)] },
  // Каюты
  { id: 'item-wardrobe', typeId: 'wardrobe', cells: [cellId(0, 5)] },
  { id: 'item-bed-1', typeId: 'bed', cells: [cellId(1, 6)] },
  { id: 'item-bed-2', typeId: 'bed', cells: [cellId(1, 8)] },
  { id: 'item-lamp', typeId: 'lamp', cells: [cellId(2, 9)] },
  // Кают-компания
  { id: 'item-stove', typeId: 'stove', cells: [cellId(3, 0)] },
  { id: 'item-samovar', typeId: 'samovar', cells: [cellId(3, 2)] },
  { id: 'item-table', typeId: 'table', cells: [cellId(4, 1)] },
  { id: 'item-cup', typeId: 'cup', cells: [cellId(3, 4)] },
  // Склад
  { id: 'item-box-1', typeId: 'box', cells: [cellId(3, 5)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(3, 7)] },
  { id: 'item-fridge', typeId: 'fridge', cells: [cellId(4, 5)] },
  { id: 'item-barrel', typeId: 'barrel', cells: [cellId(4, 7)] },
  { id: 'item-toolbox', typeId: 'toolbox', cells: [cellId(3, 9)] },
  // Снежное поле
  { id: 'item-windsock', typeId: 'windsock', cells: [cellId(5, 3)] },
  { id: 'item-igloo', typeId: 'igloo', cells: [cellId(8, 0)] },
  { id: 'item-snowmobile', typeId: 'snowmobile', cells: [cellId(7, 2), cellId(7, 3)] },
  { id: 'item-snowmobile-2', typeId: 'snowmobile', cells: [cellId(9, 2), cellId(9, 3)] },
  // Ледяное поле
  { id: 'item-bear', typeId: 'polarBear', cells: [cellId(5, 9)] },
  { id: 'item-penguin-1', typeId: 'penguin', cells: [cellId(5, 6)] },
  { id: 'item-penguin-2', typeId: 'penguin', cells: [cellId(6, 7)] },
  { id: 'item-rock-1', typeId: 'rock', cells: [cellId(5, 7)] },
  { id: 'item-rock-2', typeId: 'rock', cells: [cellId(8, 8)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// R = радиорубка, B = каюты, M = кают-компания, S = склад, N = снежное поле, I = ледяное поле.
const ROOM_ROWS = [
  'RRRRRBBBBB',
  'RRRBBBBBBB',
  'RRRRRBBBBB',
  'MMMMMSSSSS',
  'MMMSSSSSSS',
  'NNNNNIIIII',
  'NNNIIIIIII',
  'NNNNNIIIII',
  'NIIIIIIIII',
  'NNNNIIIIII',
];

const ROOM_BY_LETTER: Record<string, string> = {
  R: 'radio',
  B: 'bunk',
  M: 'mess',
  S: 'storage',
  N: 'snow',
  I: 'ice',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (POLYNYA_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'polynya' };
  return cell;
});

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['science'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['science'] },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['science'] },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: true, roles: ['science'] },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['worker', 'radioOperator'] },
  { id: 'khionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false },
];

// Судоку-инвариант: все ряды и столбцы различны (полная пермутация).
// Жертва Хиония и убийца Галина — вдвоём в каютах; Игорь — скрытый радист
// (roleSingleton + роль-субъект у радиостанции), Анна-зоолог — на проруби,
// Захар — скрытый сиделец снегохода (прямого пина нет — золотой паттерн),
// Ефим — южнее сидельца.
const solution: Record<PersonId, CellId> = {
  galina: cellId(0, 7),
  khionia: cellId(1, 5),
  igor: cellId(2, 1),
  zhanna: cellId(3, 3),
  dmitry: cellId(4, 8),
  vadim: cellId(5, 4),
  anna: cellId(6, 9),
  zakhar: cellId(7, 2),
  efim: cellId(8, 6),
  boris: cellId(9, 0),
};

const clues: Clue[] = [
  // — Роль-слой (явный, load-bearing) —
  {
    id: 'c1',
    type: 'letterRangeRole',
    fromLetter: 'Д',
    toLetter: 'И',
    roleId: 'worker',
    text: 'Все, чьё имя начиналось с буквы от Д до И, были рабочими станции; остальные — научными сотрудниками.',
  },
  {
    id: 'c2',
    type: 'roleZoneLimit',
    roleId: 'science',
    roomIds: ['storage'],
    maxCount: 0,
    text: 'Научные сотрудники не спускались на склад.',
  },
  // — Роль-слой: скрытый радист (Игорь выводится через роль, не прямой клю) —
  { id: 'c6', type: 'roleSingleton', roleId: 'radioOperator', text: 'Среди рабочих станции был ровно один радист.' },
  {
    id: 'c7',
    type: 'adjacency',
    subject: { type: 'role', role: 'radioOperator' },
    itemTypeId: 'radioStation',
    text: 'Радист находился рядом с радиостанцией.',
  },
  // — Общие правила станции —
  { id: 'c3', type: 'roomOccupancy', text: 'Ни одна зона станции не осталась пустой.' },
  // — Галина (убийца) —
  {
    id: 'c4',
    type: 'wallSide',
    subject: { type: 'person', id: 'galina' },
    wallDirection: 'north',
    text: 'Галина находилась у северной стены своей зоны.',
  },
  {
    id: 'c5',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'snowmobile',
    axis: 'col',
    direction: 'after',
    text: 'Галина находилась восточнее человека, сидевшего на снегоходе.',
  },
  // — Игорь (радист) —
  {
    id: 'c7b',
    type: 'parity',
    subject: { type: 'person', id: 'igor' },
    axis: 'row',
    parity: 'odd',
    text: 'Игорь находился в ряду с нечётным номером.',
  },
  // — Жанна —
  {
    id: 'c9',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'samovar',
    text: 'Жанна находилась рядом с самоваром.',
  },
  // — Дмитрий —
  {
    id: 'c10',
    type: 'adjacency',
    subject: { type: 'person', id: 'dmitry' },
    itemTypeId: 'barrel',
    text: 'Дмитрий находился рядом с бочкой солярки.',
  },
  {
    id: 'c11',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dmitry' },
    otherPersonId: 'galina',
    axis: 'col',
    direction: 'after',
    text: 'Дмитрий находился восточнее Галины.',
  },
  // — Вадим (метеоролог) —
  {
    id: 'c12',
    type: 'adjacency',
    subject: { type: 'person', id: 'vadim' },
    itemTypeId: 'windsock',
    text: 'Вадим находился рядом с ветровым конусом.',
  },
  // — Анна (зоолог) —
  {
    id: 'c14',
    type: 'floorFeature',
    subject: { type: 'person', id: 'anna' },
    featureId: 'polynya',
    text: 'Анна находилась на проруби.',
  },
  // — Захар —
  // — Захар (скрытый сиделец снегохода: прямого пина нет) —
  {
    id: 'c16',
    type: 'wallSide',
    subject: { type: 'person', id: 'zakhar' },
    wallDirection: 'south',
    text: 'Захар находился у южной стены своей зоны.',
  },
  // — Ефим —
  {
    id: 'c17',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'efim' },
    itemTypeId: 'snowmobile',
    axis: 'row',
    direction: 'after',
    text: 'Ефим находился южнее человека, сидевшего на снегоходе.',
  },
  {
    id: 'c18',
    type: 'parity',
    subject: { type: 'person', id: 'efim' },
    axis: 'col',
    parity: 'odd',
    text: 'Ефим находился в столбце с нечётным номером.',
  },
  // — Борис —
  {
    id: 'c19',
    type: 'corner',
    subject: { type: 'person', id: 'boris' },
    text: 'Борис находился в углу своей зоны.',
  },
  {
    id: 'c20',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'boris' },
    itemTypeId: 'igloo',
    text: 'Борис находился в одной зоне с иглу.',
  },
  {
    id: 'c20b',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'vadim',
    axis: 'col',
    direction: 'before',
    text: 'Борис находился западнее Вадима.',
  },
];

export const polarLevel: Level = {
  meta: { id: 'polar-01', title: 'Полярная ночь', theme: 'polar', difficulty: 8, maxFullyPinnedPeople: 0 },
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
