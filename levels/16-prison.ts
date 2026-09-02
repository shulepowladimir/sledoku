import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'cell1', name: 'Камера №1', floorTexture: 'tile' },
  { id: 'cell2', name: 'Камера №2', floorTexture: 'tile' },
  { id: 'cell3', name: 'Камера №3', floorTexture: 'tile' },
  { id: 'gym', name: 'Спортзал', floorTexture: 'rubber' },
  { id: 'yard', name: 'Внутренний двор', floorTexture: 'concrete' },
  { id: 'canteen', name: 'Столовая', floorTexture: 'linoleum' },
  { id: 'guard', name: 'Комната охраны', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [{ id: 'hatch', label: 'Люки водостока', textureKey: 'metal' }];

const itemTypes: ItemType[] = [
  ItemLibrary.bed('Койка'),
  ItemLibrary.toilet(),
  ItemLibrary.camera('Камера наблюдения'),
  ItemLibrary.lamppost('Фонарь двора'),
  ItemLibrary.bench('Скамейка двора'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.table('Обеденный стол'),
  ItemLibrary.chair('Стул столовой'),
  ItemLibrary.treadmill(),
  ItemLibrary.exerciseBike(),
  ItemLibrary.basketball(),
  ItemLibrary.toolbox(),
  ItemLibrary.safe('Сейф с оружием'),
  ItemLibrary.clock('Настенные часы'),
  ItemLibrary.box(),
];

const items: Item[] = [
  // Камера №1 (rows 0-2, cols 0-4 + notch row 3 cols 0-3): койки ×2, туалет, камера
  { id: 'item-bed-c1a', typeId: 'bed', cells: [cellId(1, 0), cellId(2, 0)] },
  { id: 'item-bed-c1b', typeId: 'bed', cells: [cellId(1, 2), cellId(2, 2)] },
  { id: 'item-toilet-c1', typeId: 'toilet', cells: [cellId(0, 3)] },
  { id: 'item-camera-c1', typeId: 'camera', cells: [cellId(0, 4)] },
  // Камера №2 (rows 4-7, cols 0-2 + notch row 8 cols 0-1): койки ×2, туалет
  { id: 'item-bed-c2a', typeId: 'bed', cells: [cellId(4, 0), cellId(5, 0)] },
  { id: 'item-bed-c2b', typeId: 'bed', cells: [cellId(4, 1), cellId(5, 1)] },
  { id: 'item-toilet-c2', typeId: 'toilet', cells: [cellId(7, 2)] },
  { id: 'item-camera-c2', typeId: 'camera', cells: [cellId(8, 0)] },
  // Камера №3 (rows 9-10, cols 0-4): койки ×2, туалет, камера
  { id: 'item-bed-c3a', typeId: 'bed', cells: [cellId(9, 0), cellId(10, 0)] },
  { id: 'item-bed-c3b', typeId: 'bed', cells: [cellId(9, 2), cellId(10, 2)] },
  { id: 'item-toilet-c3', typeId: 'toilet', cells: [cellId(10, 4)] },
  { id: 'item-camera-c3', typeId: 'camera', cells: [cellId(9, 4)] },
  // Спортзал (rows 0-2 cols 5-10, rows 3-4 cols 8-10): тренажёры, мяч, ящик инструментов
  { id: 'item-treadmill-g1', typeId: 'treadmill', cells: [cellId(0, 10)] },
  { id: 'item-treadmill-g2', typeId: 'treadmill', cells: [cellId(3, 9)] },
  { id: 'item-bike-g1', typeId: 'exerciseBike', cells: [cellId(0, 7)] },
  { id: 'item-bike-g2', typeId: 'exerciseBike', cells: [cellId(3, 8)] },
  { id: 'item-basketball', typeId: 'basketball', cells: [cellId(1, 6)] },
  { id: 'item-toolbox', typeId: 'toolbox', cells: [cellId(4, 10)] },
  // Внутренний двор (row 3 cols 4-6, rows 4-7 cols 3-7, row 8 cols 4-6): фонари, скамейки, урны, люк
  { id: 'item-lamp-y1', typeId: 'lamppost', cells: [cellId(3, 6)] },
  { id: 'item-lamp-y2', typeId: 'lamppost', cells: [cellId(6, 7)] },
  { id: 'item-lamp-y3', typeId: 'lamppost', cells: [cellId(6, 5)] },
  { id: 'item-bench-y1', typeId: 'bench', cells: [cellId(5, 3), cellId(6, 3)] },
  { id: 'item-bench-y2', typeId: 'bench', cells: [cellId(4, 6), cellId(4, 7)] },
  { id: 'item-bench-y3', typeId: 'bench', cells: [cellId(7, 4), cellId(7, 5)] },
  { id: 'item-trash-y1', typeId: 'trashcan', cells: [cellId(5, 5)] },
  { id: 'item-trash-y2', typeId: 'trashcan', cells: [cellId(7, 6)] },
  { id: 'item-clock-yard', typeId: 'clock', cells: [cellId(4, 4)] },
  // Столовая (rows 4-6 cols 8-10, row 7 cols 7-10, rows 8-10 cols 5-7): столы, стулья, урна
  { id: 'item-table-ca1', typeId: 'table', cells: [cellId(5, 8), cellId(5, 9)] },
  { id: 'item-table-ca2', typeId: 'table', cells: [cellId(4, 8), cellId(4, 9)] },
  { id: 'item-chair-ca1', typeId: 'chair', cells: [cellId(5, 10)] },
  { id: 'item-chair-ca2', typeId: 'chair', cells: [cellId(6, 8)] },
  { id: 'item-chair-ca3', typeId: 'chair', cells: [cellId(6, 10)] },
  { id: 'item-chair-ca4', typeId: 'chair', cells: [cellId(8, 7)] },
  { id: 'item-chair-ca5', typeId: 'chair', cells: [cellId(9, 6)] },
  { id: 'item-trash-ca', typeId: 'trashcan', cells: [cellId(8, 6)] },
  // Комната охраны (rows 8-10, cols 8-10): сейф с оружием, стул, часы
  { id: 'item-safe-guard', typeId: 'safe', cells: [cellId(9, 10)] },
  { id: 'item-chair-guard', typeId: 'chair', cells: [cellId(10, 8)] },
  { id: 'item-clock-guard', typeId: 'clock', cells: [cellId(9, 8)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// 1 = Камера №1 (top-left block + notch), 2 = Камера №2 (left band + notch), 3 = Камера №3
// (bottom-left block), Y = Внутренний двор (diagonal band), G = Спортзал (top-right),
// C = Столовая (bottom-right), O = Комната охраны (bottom-right corner).
const ROOM_ROWS = [
  '11111GGGGGG',
  '11111GGGGGG',
  '11111GGGGGG',
  '1111YYYGGGG',
  '222YYYYYCCC',
  '222YYYYYCCC',
  '222YYYYYCCC',
  '2222YYYCCCC',
  '33333CCCOOO',
  '33333CCCOOO',
  '33333CCCOOO',
];

const ROOM_BY_LETTER: Record<string, string> = {
  '1': 'cell1',
  '2': 'cell2',
  '3': 'cell3',
  Y: 'yard',
  G: 'gym',
  C: 'canteen',
  O: 'guard',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const HATCH_CELLS = new Set<CellId>([cellId(6, 4), cellId(5, 4), cellId(1, 3), cellId(7, 0), cellId(9, 1), cellId(6, 9)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (HATCH_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'hatch' } : cell));

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['guard'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'gena', name: 'Геннадий', initialLetter: 'Г', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['guard'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['prisoner'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['guard'] },
  { id: 'klavdia', name: 'Клавдия', initialLetter: 'К', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['prisoner'] },
  { id: 'khristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['prisoner'] },
];

// Layout by the user's spec (column,row pairs, 1-based) → (row,col) 0-based:
// (1,1)→(0,0) Борис, камера1; (2,5)→(4,1) Захар[убийца], камера2; (3,9)→(8,2) Геннадий, камера3;
// (4,7)→(6,3) Дарья, двор; (5,4)→(3,4) Андрей[охрана], двор; (6,2)→(1,5) Жанна, спортзал;
// (7,10)→(9,6) Клавдия, столовая; (8,3)→(2,7) Христофор[жертва], спортзал;
// (9,11)→(10,8) Ефим[охрана], комната охраны; (10,8)→(7,9) Василиса, столовая;
// (11,6)→(5,10) Инна[охрана], столовая. Vowel-named guards: Андрей/Ефим/Инна — matches letterRole.
const solution: Record<PersonId, CellId> = {
  boris: cellId(0, 0),
  vasilisa: cellId(7, 9),
  gena: cellId(8, 2),
  darya: cellId(6, 3),
  andrey: cellId(3, 4),
  zhanna: cellId(1, 5),
  khristofor: cellId(2, 7),
  efim: cellId(10, 8),
  inna: cellId(5, 10),
  klavdia: cellId(9, 6),
  zahar: cellId(4, 1),
};

const clues: Clue[] = [
  // — Общие правила тюрьмы —
  { id: 'p-letter-roles', type: 'letterRole', letterClass: 'vowel', roleId: 'guard', text: 'Все, чьё имя начиналось на гласную букву, были охранниками; остальные — заключёнными.' },
  {
    id: 'p-guards-not-cells',
    type: 'roleZoneLimit',
    roleId: 'guard',
    roomIds: ['cell1', 'cell2', 'cell3'],
    maxCount: 0,
    text: 'Охранники не находились в камерах.',
  },
  {
    id: 'p-prisoners-not-guardroom',
    type: 'roleZoneLimit',
    roleId: 'prisoner',
    roomIds: ['guard'],
    maxCount: 0,
    text: 'Заключённые не находились в комнате охраны.',
  },
  {
    id: 'p-one-per-cell',
    type: 'roleZoneLimit',
    roleId: 'prisoner',
    roomIds: ['cell1', 'cell2', 'cell3'],
    maxCount: 1,
    text: 'В каждой камере находился не более чем один заключённый.',
  },
  { id: 'p-occupancy', type: 'roomOccupancy', text: 'Ни одна зона тюрьмы не осталась пустой.' },
  // — Камера №1 —
  { id: 'p-boris-corner', type: 'corner', subject: { type: 'person', id: 'boris' }, text: 'Борис находился в углу своей зоны.' },
  // — Камера №2: убийца —
  { id: 'p-zahar-bed', type: 'occupiesItem', subject: { type: 'person', id: 'zahar' }, itemTypeId: 'bed', text: 'Захар лежал на койке.' },
  // — Камера №3 —
  { id: 'p-gena-room', type: 'roomMembership', subject: { type: 'person', id: 'gena' }, roomId: 'cell3', text: 'Геннадий находился в Камере №3.' },
  {
    id: 'p-gena-between',
    type: 'betweenness',
    subject: { type: 'person', id: 'gena' },
    otherPersonId1: 'zhanna',
    otherPersonId2: 'efim',
    axis: 'row',
    text: 'По рядам Геннадий находился между Жанной и Ефимом.',
  },
  // — Двор —
  { id: 'p-darya-bench', type: 'occupiesItem', subject: { type: 'person', id: 'darya' }, itemTypeId: 'bench', text: 'Дарья сидела на скамейке.' },
  { id: 'p-darya-parity', type: 'parity', subject: { type: 'person', id: 'darya' }, axis: 'row', parity: 'odd', text: 'Дарья находилась в ряду с нечётным номером.' },
  { id: 'p-andrey-clock', type: 'adjacency', subject: { type: 'person', id: 'andrey' }, itemTypeId: 'clock', text: 'Андрей находился рядом с часами.' },
  // — Спортзал —
  { id: 'p-zhanna-ball', type: 'adjacency', subject: { type: 'person', id: 'zhanna' }, itemTypeId: 'basketball', text: 'Жанна находилась рядом с баскетбольным мячом.' },
  {
    id: 'p-zhanna-east-zahar',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'zahar',
    axis: 'col',
    direction: 'after',
    offset: 4,
    text: 'Жанна находилась ровно на четыре столбца восточнее Захара.',
  },
  // — Столовая —
  { id: 'p-klavdia-chair', type: 'occupiesItem', subject: { type: 'person', id: 'klavdia' }, itemTypeId: 'chair', text: 'Клавдия сидела на стуле.' },
  { id: 'p-klavdia-parity', type: 'parity', subject: { type: 'person', id: 'klavdia' }, axis: 'col', parity: 'odd', text: 'Клавдия находилась в столбце с нечётным номером.' },
  { id: 'p-vasilisa-parity-col', type: 'parity', subject: { type: 'person', id: 'vasilisa' }, axis: 'col', parity: 'even', text: 'Василиса находилась в столбце с чётным номером.' },
  { id: 'p-vasilisa-notcorner', type: 'corner', subject: { type: 'person', id: 'vasilisa' }, negated: true, text: 'Василиса не находилась в углу своей зоны.' },
  {
    id: 'p-vasilisa-same',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'vasilisa' },
    otherPersonId: 'klavdia',
    text: 'Василиса находилась в той же зоне, что и Клавдия.',
  },
  { id: 'p-inna-chair', type: 'occupiesItem', subject: { type: 'person', id: 'inna' }, itemTypeId: 'chair', text: 'Инна сидела на стуле.' },
  {
    id: 'p-inna-south',
    type: 'relativePosition',
    subject: { type: 'person', id: 'inna' },
    otherPersonId: 'klavdia',
    axis: 'row',
    direction: 'before',
    text: 'Инна находилась севернее Клавдии.',
  },
  // — Комната охраны —
  { id: 'p-efim-wall', type: 'wallSide', subject: { type: 'person', id: 'efim' }, wallDirection: 'west', text: 'Ефим находился у западной стены своей зоны.' },
  { id: 'p-efim-parity', type: 'parity', subject: { type: 'person', id: 'efim' }, axis: 'row', parity: 'odd', text: 'Ефим находился в ряду с нечётным номером.' },
];

export const prisonLevel: Level = {
  meta: { id: 'prison-01', title: 'Пожизненный срок', theme: 'prison', difficulty: 9, maxFullyPinnedPeople: 0 },
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
