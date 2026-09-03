import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

const rooms: Room[] = [
  { id: 'corridor', name: 'Коридор', floorTexture: 'sand' },
  { id: 'hall', name: 'Гипостильный зал', floorTexture: 'stone' },
  { id: 'treasury', name: 'Сокровищница', floorTexture: 'marble' },
  { id: 'burialChamber', name: 'Погребальная камера', floorTexture: 'dirt' },
];

const floorFeatures: FloorFeature[] = [{ id: 'funerary-mat', label: 'Погребальный ковёр', textureKey: 'rug' }];
const MAT_CELLS = new Set([cellId(7, 3), cellId(7, 4)]);

const itemTypes: ItemType[] = [
  { id: 'sarcophagus', label: 'Саркофаг', kind: 'decorative', icon: 'sarcophagus' },
  { id: 'canopicJar', label: 'Канопа', kind: 'decorative', icon: 'canopicJar' },
  { id: 'torch', label: 'Факел', kind: 'decorative', icon: 'torch' },
  { id: 'goldStatue', label: 'Золотая статуя', kind: 'decorative', icon: 'goldStatue' },
  { id: 'stela', label: 'Стела', kind: 'decorative', icon: 'stela' },
  ItemLibrary.chair('Трон'),
  ItemLibrary.bench('Каменная скамья'),
  ItemLibrary.stool('Табурет писца'),
  ItemLibrary.box('Деревянный сундук'),
  ItemLibrary.rack('Стойка для свитков'),
  ItemLibrary.ladder('Приставная лестница'),
  { id: 'safe', label: 'Сундук с сокровищами', kind: 'decorative', icon: 'artifactChest' },
];

const items: Item[] = [
  // Corridor
  { id: 'item-torch-1', typeId: 'torch', cells: [cellId(0, 1)] },
  { id: 'item-torch-2', typeId: 'torch', cells: [cellId(3, 0)] },
  // Hall
  { id: 'item-gold-statue-1', typeId: 'goldStatue', cells: [cellId(0, 3)] },
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(0, 4)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(1, 3)] },
  { id: 'item-stool-1', typeId: 'stool', cells: [cellId(2, 3)] },
  { id: 'item-rack-1', typeId: 'rack', cells: [cellId(3, 3), cellId(3, 4)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(4, 2)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(5, 2)] },
  { id: 'item-gold-statue-2', typeId: 'goldStatue', cells: [cellId(5, 6)] },
  { id: 'item-ladder-1', typeId: 'ladder', cells: [cellId(6, 6)] },
  { id: 'item-stela-1', typeId: 'stela', cells: [cellId(6, 8)] },
  { id: 'item-torch-3', typeId: 'torch', cells: [cellId(7, 7)] },
  // Treasury
  { id: 'item-safe-1', typeId: 'safe', cells: [cellId(0, 7)] },
  { id: 'item-safe-2', typeId: 'safe', cells: [cellId(1, 7)] },
  { id: 'item-canopic-jar-1', typeId: 'canopicJar', cells: [cellId(2, 6)] },
  { id: 'item-canopic-jar-2', typeId: 'canopicJar', cells: [cellId(3, 7)] },
  { id: 'item-gold-statue-3', typeId: 'goldStatue', cells: [cellId(4, 6)] },
  // Burial chamber
  { id: 'item-torch-4', typeId: 'torch', cells: [cellId(7, 2)] },
  { id: 'item-canopic-jar-3', typeId: 'canopicJar', cells: [cellId(8, 2)] },
  { id: 'item-sarcophagus', typeId: 'sarcophagus', cells: [cellId(8, 3), cellId(8, 4)] },
  { id: 'item-canopic-jar-4', typeId: 'canopicJar', cells: [cellId(8, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four zones on a 9x9 board: a tapering entrance corridor (K) hugs the left edge, the hypostyle
// hall (Z) is the large diagonal blob filling the middle, the treasury (S) is a bulging side room
// carved from the upper-right, and the burial chamber (U) is a wide wedge across the bottom.
const ROOM_ROWS = [
  'KKZZZZSSS',
  'KKZZZZSSS',
  'KKZZZSSSS',
  'KZZZZSSSS',
  'KZZZZZSSS',
  'ZZZZZZZZS',
  'UUUUZZZZZ',
  'UUUUUUUZZ',
  'UUUUUUUUU',
];
const ROOM_BY_LETTER: Record<string, string> = {
  K: 'corridor',
  Z: 'hall',
  S: 'treasury',
  U: 'burialChamber',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (MAT_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'funerary-mat' } : cell));

// Тайна пирамиды. Экспедиция: археологи (А–В), стража (Г–Е), носильщики (Ж–Х).
// Стражник Даниил сопровождал носильщицу Хионию в погребальной камере; жертва не упомянута в личных клю.
const people: Person[] = [
  { id: 'alexey', name: 'Алексей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['archaeologist'] },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['archaeologist'] },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['archaeologist'] },
  { id: 'gelena', name: 'Гелена', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['guard'] },
  { id: 'daniil', name: 'Даниил', initialLetter: 'Д', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true, roles: ['guard'] },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['guard'] },
  { id: 'zhozefina', name: 'Жозефина', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['porter'] },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#e0a94a', isVictim: false, isMurderer: false, roles: ['porter'] },
  { id: 'hionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#7cc9e8', isVictim: true, isMurderer: false, roles: ['porter'] },
];

// Row → column permutation generated by `npm run scaffold-level -- levels/11-egypt.ts
// corridor:2,hall:3,burialChamber:2,treasury:2` — burialChamber holds exactly the victim and the murderer.
const solution: Record<PersonId, CellId> = {
  alexey: cellId(0, 2),
  bella: cellId(1, 0),
  viktor: cellId(2, 1),
  gelena: cellId(3, 6),
  egor: cellId(4, 7),
  zhozefina: cellId(5, 3),
  zahar: cellId(6, 4),
  daniil: cellId(7, 5),
  hionia: cellId(8, 8),
};

const clues: Clue[] = [
  // — Правила экспедиции —
  {
    id: 'e-r1',
    type: 'letterRangeRole',
    fromLetter: 'Г',
    toLetter: 'Е',
    roleId: 'guard',
    text: 'Все, чьё имя начиналось на букву от Г до Е, были стражниками экспедиции.',
  },
  {
    id: 'e-r2',
    type: 'letterRangeRole',
    fromLetter: 'Ж',
    toLetter: 'Х',
    roleId: 'porter',
    text: 'Все, чьё имя начиналось на букву от Ж до Х, были носильщиками.',
  },
  {
    id: 'e-r3',
    type: 'roleZoneLimit',
    roleId: 'guard',
    roomIds: ['corridor', 'hall'],
    maxCount: 0,
    text: 'Стражники не покидали внутренних покоев — сокровищницы и погребальной камеры.',
  },
  {
    id: 'e-r4',
    type: 'roleZoneLimit',
    roleId: 'porter',
    roomIds: ['treasury'],
    maxCount: 0,
    text: 'Носильщики не допускались в сокровищницу.',
  },
  {
    id: 'e-r5',
    type: 'roleGuard',
    roomIds: ['burialChamber'],
    guardedRoleId: 'porter',
    guardianRoleId: 'guard',
    text: 'Ни один носильщик не спускался в погребальную камеру без сопровождения стражника.',
  },
  { id: 'e1', type: 'corner', subject: { type: 'person', id: 'alexey' }, text: 'Алексей находился в углу своей зоны.' },
  { id: 'e3', type: 'wallSide', subject: { type: 'person', id: 'viktor' }, wallDirection: 'east', text: 'Виктор находился у восточной стены своей зоны.' },
  { id: 'e4', type: 'adjacency', subject: { type: 'person', id: 'gelena' }, itemTypeId: 'canopicJar', text: 'Гелена находилась рядом с канопой.' },
  { id: 'e5', type: 'adjacency', subject: { type: 'person', id: 'egor' }, itemTypeId: 'goldStatue', text: 'Егор находился рядом с золотой статуей.' },
  { id: 'e8', type: 'adjacency', subject: { type: 'person', id: 'daniil' }, itemTypeId: 'canopicJar', text: 'Даниил находился рядом с канопой.' },
  {
    id: 'e9',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bella' },
    otherPersonId: 'viktor',
    axis: 'row',
    direction: 'before',
    offset: 1,
    text: 'Белла находилась ровно на один ряд севернее Виктора.',
  },
  { id: 'e23', type: 'sameRoomAs', subject: { type: 'person', id: 'bella' }, otherPersonId: 'viktor', text: 'Белла находилась в той же зоне, что и Виктор.' },
  {
    id: 'e11',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhozefina' },
    otherPersonId: 'alexey',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Жозефина находилась ровно на один столбец восточнее Алексея.',
  },
  {
    id: 'e12',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zahar' },
    otherPersonId: 'zhozefina',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Захар находился ровно на один столбец восточнее Жозефины.',
  },
  { id: 'e22', type: 'wallSide', subject: { type: 'person', id: 'zahar' }, wallDirection: 'south', text: 'Захар находился у южной стены своей зоны.' },
  { id: 'e13', type: 'roomPopulation', roomId: 'hall', comparison: 'most', text: 'Гипостильный зал — самая населённая зона уровня.' },
  { id: 'e14', type: 'roomOccupancy', text: 'Ни одна зона не осталась пустой.' },
  { id: 'e16', type: 'wallSide', subject: { type: 'person', id: 'alexey' }, wallDirection: 'north', text: 'Алексей находился у северной стены своей зоны.' },
  { id: 'e17', type: 'parity', subject: { type: 'person', id: 'gelena' }, axis: 'row', parity: 'even', text: 'Гелена находилась в ряду с чётным номером.' },
  { id: 'e21', type: 'position', subject: { type: 'person', id: 'gelena' }, axis: 'col', value: 6, text: 'Гелена находилась в 7-м столбце.' },
];

export const egyptLevel: Level = {
  meta: { id: 'egypt-01', title: 'Тайна пирамиды', theme: 'egypt', difficulty: 10, maxFullyPinnedPeople: 0 },
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
