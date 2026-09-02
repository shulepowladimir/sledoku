import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'registratura', name: 'Регистратура', floorTexture: 'marble' },
  { id: 'koridor', name: 'Коридор', floorTexture: 'linoleum' },
  { id: 'kabinet1', name: 'Кабинет №1', floorTexture: 'tile' },
  { id: 'kabinet2', name: 'Кабинет №2', floorTexture: 'tile' },
  { id: 'kabinet3', name: 'Кабинет №3', floorTexture: 'tile' },
  { id: 'kabinet4', name: 'Кабинет №4', floorTexture: 'tile' },
];

const floorFeatures: FloorFeature[] = [{ id: 'sterile-mat', label: 'Стерильный коврик', textureKey: 'water' }];
const STERILE_CELLS = new Set([cellId(0, 3), cellId(2, 5)]);

const itemTypes: ItemType[] = [
  { id: 'kassa', label: 'Стойка регистратуры', kind: 'decorative', icon: 'kassa' },
  { id: 'computer', label: 'Компьютер', kind: 'decorative', icon: 'computer' },
  { id: 'watercooler', label: 'Кулер с водой', kind: 'decorative', icon: 'watercooler' },
  { id: 'examTable', label: 'Смотровой стол', kind: 'occupiable', icon: 'examTable' },
  { id: 'medicineCabinet', label: 'Шкаф с лекарствами', kind: 'decorative', icon: 'medicineCabinet' },
  ItemLibrary.bench('Скамья для ожидания'),
  ItemLibrary.sofa('Диван для ожидания'),
  ItemLibrary.armchair('Кресло для посетителей'),
  ItemLibrary.chair('Стул врача'),
  ItemLibrary.plant(),
  ItemLibrary.bookshelf(),
  ItemLibrary.box(),
  ItemLibrary.rack('Стеллаж с картами пациентов'),
  ItemLibrary.trashcan(),
  ItemLibrary.stool(),
  ItemLibrary.portrait('Информационный плакат'),
  ItemLibrary.ladder('Стремянка уборщика'),
];

const items: Item[] = [
  // Registratura
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-computer', typeId: 'computer', cells: [cellId(1, 1)] },
  { id: 'item-watercooler', typeId: 'watercooler', cells: [cellId(2, 0)] },
  { id: 'item-bench-reg', typeId: 'bench', cells: [cellId(3, 1)] },
  { id: 'item-sofa-reg', typeId: 'sofa', cells: [cellId(4, 0)] },
  { id: 'item-plant-reg', typeId: 'plant', cells: [cellId(6, 0)] },
  { id: 'item-bookshelf-reg', typeId: 'bookshelf', cells: [cellId(6, 1)] },
  { id: 'item-box-reg', typeId: 'box', cells: [cellId(8, 0)] },
  { id: 'item-trashcan-reg', typeId: 'trashcan', cells: [cellId(9, 1)] },
  // Koridor
  { id: 'item-medcab-cor', typeId: 'medicineCabinet', cells: [cellId(0, 7)] },
  { id: 'item-rack-cor', typeId: 'rack', cells: [cellId(0, 8)] },
  { id: 'item-bench-cor', typeId: 'bench', cells: [cellId(1, 6)] },
  { id: 'item-plant-cor', typeId: 'plant', cells: [cellId(2, 6)] },
  { id: 'item-box-cor', typeId: 'box', cells: [cellId(5, 2)] },
  { id: 'item-trashcan-cor', typeId: 'trashcan', cells: [cellId(5, 4)] },
  { id: 'item-bookshelf-cor', typeId: 'bookshelf', cells: [cellId(5, 8)] },
  { id: 'item-portrait-cor', typeId: 'portrait', cells: [cellId(5, 10)] },
  { id: 'item-stool-cor', typeId: 'stool', cells: [cellId(6, 6)] },
  { id: 'item-ladder-cor', typeId: 'ladder', cells: [cellId(9, 5)] },
  // Kabinet1
  { id: 'item-examtable-k1', typeId: 'examTable', cells: [cellId(0, 2)] },
  { id: 'item-chair-k1', typeId: 'chair', cells: [cellId(0, 4)] },
  { id: 'item-bookshelf-k1', typeId: 'bookshelf', cells: [cellId(0, 5)] },
  { id: 'item-medcab-k1', typeId: 'medicineCabinet', cells: [cellId(1, 2)] },
  { id: 'item-plant-k1', typeId: 'plant', cells: [cellId(1, 4)] },
  { id: 'item-trashcan-k1', typeId: 'trashcan', cells: [cellId(2, 2)] },
  { id: 'item-box-k1', typeId: 'box', cells: [cellId(3, 5)] },
  { id: 'item-rack-k1', typeId: 'rack', cells: [cellId(4, 2)] },
  // Kabinet2
  { id: 'item-examtable-k2', typeId: 'examTable', cells: [cellId(6, 2)] },
  { id: 'item-medcab-k2', typeId: 'medicineCabinet', cells: [cellId(6, 5)] },
  { id: 'item-chair-k2', typeId: 'chair', cells: [cellId(7, 2)] },
  { id: 'item-box-k2', typeId: 'box', cells: [cellId(7, 5)] },
  { id: 'item-plant-k2', typeId: 'plant', cells: [cellId(8, 2)] },
  { id: 'item-trashcan-k2', typeId: 'trashcan', cells: [cellId(8, 5)] },
  { id: 'item-bookshelf-k2', typeId: 'bookshelf', cells: [cellId(10, 3)] },
  // Kabinet3
  { id: 'item-examtable-k3', typeId: 'examTable', cells: [cellId(6, 7)] },
  { id: 'item-medcab-k3', typeId: 'medicineCabinet', cells: [cellId(6, 9)] },
  { id: 'item-chair-k3', typeId: 'chair', cells: [cellId(7, 7)] },
  { id: 'item-bookshelf-k3', typeId: 'bookshelf', cells: [cellId(7, 10)] },
  { id: 'item-plant-k3', typeId: 'plant', cells: [cellId(8, 7)] },
  { id: 'item-box-k3', typeId: 'box', cells: [cellId(9, 8)] },
  { id: 'item-trashcan-k3', typeId: 'trashcan', cells: [cellId(9, 10)] },
  { id: 'item-armchair-k3', typeId: 'armchair', cells: [cellId(10, 10)] },
  // Kabinet4
  { id: 'item-examtable-k4', typeId: 'examTable', cells: [cellId(0, 9)] },
  { id: 'item-medcab-k4', typeId: 'medicineCabinet', cells: [cellId(0, 10)] },
  { id: 'item-chair-k4', typeId: 'chair', cells: [cellId(1, 7)] },
  { id: 'item-box-k4', typeId: 'box', cells: [cellId(2, 8)] },
  { id: 'item-plant-k4', typeId: 'plant', cells: [cellId(2, 10)] },
  { id: 'item-trashcan-k4', typeId: 'trashcan', cells: [cellId(3, 8)] },
  { id: 'item-bookshelf-k4', typeId: 'bookshelf', cells: [cellId(4, 9)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Six zones on an 11x11 board (deliberate exception to the usual 3-4, like 10-station's 5-zone
// precedent): registratura (R) is a rectangle running the full left edge (cols 0-1); koridor (C)
// is a cross-shaped spine (a vertical spine down col 6 plus a horizontal band across row 5) that
// threads past all four doctor's offices; kabinet1 (top-left) and kabinet3 (bottom-right) are
// plain rectangles; kabinet4 (top-right) and kabinet2 (bottom-left) each have a notch carved out
// of the edge touching the corridor spine, making them bent/non-rectangular while staying a
// single connected region. Column bands are deliberately staggered so that no two same-side
// offices needing 2 people each are confined to fewer than 4 shared columns (kabinet1+kabinet2
// share cols 2-5; kabinet3+kabinet4 share cols 7-10) — an earlier draft pinned both left offices
// to the exact same 3 columns, which made a valid row/col permutation for 4 people impossible.
const ROOM_ROWS = [
  'RR1111CCC44',
  'RR1111C4444',
  'RR1111C4444',
  'RR1111C4444',
  'RR1111C4444',
  'RRCCCCCCCCC',
  'RR2222C3333',
  'RR2222C3333',
  'RR2222C3333',
  'RR222CC3333',
  'RR222CC3333',
].map((row) => row.slice(0, 11));

const ROOM_BY_LETTER: Record<string, string> = {
  R: 'registratura',
  C: 'koridor',
  '1': 'kabinet1',
  '2': 'kabinet2',
  '3': 'kabinet3',
  '4': 'kabinet4',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (STERILE_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'sterile-mat' } : cell));

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['doctor'] },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'gennady', name: 'Геннадий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['doctor'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['doctor'] },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'irina', name: 'Ирина', initialLetter: 'И', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['doctor'] },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['patient'] },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['patient'] },
];

// `npm run scaffold-level -- levels/13-hospital.ts registratura:2,koridor:1,kabinet1:2,kabinet2:2,kabinet3:2,kabinet4:2`
// → row→col [3, 8, 5, 10, 6, 0, 4, 1, 9, 2, 7]. People assigned to rows/rooms per the roster plan;
// kabinet4 (rows 1,3) hosts the victim (Христина) and the murderer (Ирина), matching the hard
// invariant that the victim's room has exactly 2 occupants.
const solution: Record<PersonId, CellId> = {
  boris: cellId(0, 3),
  hristina: cellId(1, 8),
  darya: cellId(2, 5),
  irina: cellId(3, 10),
  egor: cellId(4, 6),
  aglaya: cellId(5, 0),
  gennady: cellId(6, 4),
  vasilisa: cellId(7, 1),
  zhanna: cellId(8, 9),
  zahar: cellId(9, 2),
  kirill: cellId(10, 7),
};

const clues: Clue[] = [
  // Doctors — explicit roles, three pinned to their office; Ирина deliberately left unpinned so
  // roleGuard (below) stays load-bearing instead of being trivially satisfied by roomMembership alone.
  { id: 'c-boris-role', type: 'role', subject: { type: 'person', id: 'boris' }, roleId: 'doctor', text: 'Борис работал врачом в этой больнице.' },
  { id: 'c-boris-floor', type: 'floorFeature', subject: { type: 'person', id: 'boris' }, featureId: 'sterile-mat', text: 'Борис находился на стерильном коврике.' },
  { id: 'c-gennady-role', type: 'role', subject: { type: 'person', id: 'gennady' }, roleId: 'doctor', text: 'Геннадий работал врачом в этой больнице.' },
  { id: 'c-gennady-wall', type: 'wallSide', subject: { type: 'person', id: 'gennady' }, wallDirection: 'north', text: 'Геннадий находился у северной стены своей зоны.' },
  { id: 'c-gennady-corner', type: 'corner', subject: { type: 'person', id: 'gennady' }, negated: true, text: 'Геннадий не находился в углу своей зоны.' },
  { id: 'c-zhanna-role', type: 'role', subject: { type: 'person', id: 'zhanna' }, roleId: 'doctor', text: 'Жанна работала врачом в этой больнице.' },
  { id: 'c-zhanna-room', type: 'roomMembership', subject: { type: 'person', id: 'zhanna' }, roomId: 'kabinet3', text: 'Жанна находилась в Кабинете №3.' },
  { id: 'c-zhanna-parity', type: 'parity', subject: { type: 'person', id: 'zhanna' }, axis: 'col', parity: 'even', text: 'Жанна находилась в столбце с чётным номером.' },
  { id: 'c-irina-role', type: 'role', subject: { type: 'person', id: 'irina' }, roleId: 'doctor', text: 'Ирина работала врачом в этой больнице.' },
  { id: 'c-irina-wall', type: 'wallSide', subject: { type: 'person', id: 'irina' }, wallDirection: 'east', text: 'Ирина находилась у восточной стены своей зоны.' },

  // General hospital rules.
  {
    id: 'c-role-guard',
    type: 'roleGuard',
    roomIds: ['kabinet1', 'kabinet2', 'kabinet3', 'kabinet4'],
    guardedRoleId: 'patient',
    guardianRoleId: 'doctor',
    text: 'Ни один пациент не оставался в кабинете врача один, без врача.',
  },
  { id: 'c-room-occupancy', type: 'roomOccupancy', text: 'Ни одна зона больницы не осталась пустой.' },

  // Patients paired with their office's doctor.
  { id: 'c-darya-same', type: 'sameRoomAs', subject: { type: 'person', id: 'darya' }, otherPersonId: 'boris', text: 'Дарья находилась в той же зоне, что и Борис.' },
  { id: 'c-darya-adj', type: 'adjacency', subject: { type: 'person', id: 'darya' }, itemTypeId: 'box', text: 'Дарья находилась рядом с коробкой.' },
  { id: 'c-darya-parity', type: 'parity', subject: { type: 'person', id: 'darya' }, axis: 'row', parity: 'odd', text: 'Дарья находилась в ряду с нечётным номером.' },
  { id: 'c-zahar-same', type: 'sameRoomAs', subject: { type: 'person', id: 'zahar' }, otherPersonId: 'gennady', text: 'Захар находился в той же зоне, что и Геннадий.' },
  { id: 'c-zahar-adj', type: 'adjacency', subject: { type: 'person', id: 'zahar' }, itemTypeId: 'plant', text: 'Захар находился рядом с растением.' },
  { id: 'c-zahar-parity', type: 'parity', subject: { type: 'person', id: 'zahar' }, axis: 'row', parity: 'even', text: 'Захар находился в ряду с чётным номером.' },
  { id: 'c-kirill-same', type: 'sameRoomAs', subject: { type: 'person', id: 'kirill' }, otherPersonId: 'zhanna', text: 'Кирилл находился в той же зоне, что и Жанна.' },
  { id: 'c-kirill-corner', type: 'corner', subject: { type: 'person', id: 'kirill' }, text: 'Кирилл находился в углу своей зоны.' },

  // Registratura pair.
  { id: 'c-aglaya-room', type: 'roomMembership', subject: { type: 'person', id: 'aglaya' }, roomId: 'registratura', text: 'Аглая находилась в Регистратуре.' },
  { id: 'c-aglaya-adj', type: 'adjacency', subject: { type: 'person', id: 'aglaya' }, itemTypeId: 'sofa', text: 'Аглая находилась рядом с диваном для ожидания.' },
  { id: 'c-aglaya-rel', type: 'relativePosition', subject: { type: 'person', id: 'aglaya' }, otherPersonId: 'boris', axis: 'row', direction: 'after', offset: 5, text: 'Аглая находилась на 5 рядов южнее Бориса.' },
  { id: 'c-vasilisa-same', type: 'sameRoomAs', subject: { type: 'person', id: 'vasilisa' }, otherPersonId: 'aglaya', text: 'Василиса находилась в той же зоне, что и Аглая.' },
  { id: 'c-vasilisa-adj', type: 'adjacency', subject: { type: 'person', id: 'vasilisa' }, itemTypeId: 'bookshelf', text: 'Василиса находилась рядом с книжной полкой.' },

  // Koridor's sole occupant.
  { id: 'c-egor-roomsize', type: 'roomSize', subject: { type: 'person', id: 'egor' }, comparison: 'largest', text: 'Егор находился в самой большой по площади зоне уровня.' },
  { id: 'c-egor-rel', type: 'relativePosition', subject: { type: 'person', id: 'egor' }, otherPersonId: 'zahar', axis: 'col', direction: 'after', text: 'Егор находился восточнее Захара.' },
  { id: 'c-egor-rel2', type: 'relativePosition', subject: { type: 'person', id: 'egor' }, otherPersonId: 'boris', axis: 'row', direction: 'after', offset: 4, text: 'Егор находился на 4 ряда южнее Бориса.' },
  { id: 'c-irina-rel', type: 'relativePosition', subject: { type: 'person', id: 'irina' }, otherPersonId: 'boris', axis: 'row', direction: 'after', offset: 3, text: 'Ирина находилась на 3 ряда южнее Бориса.' },
];

export const hospitalLevel: Level = {
  meta: { id: 'hospital-01', title: 'Ложный диагноз', theme: 'hospital', difficulty: 10, maxFullyPinnedPeople: 0 },
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
