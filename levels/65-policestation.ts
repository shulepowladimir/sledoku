import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

const rooms: Room[] = [
  { id: 'reception', name: 'Приёмная', floorTexture: 'tile' },
  { id: 'corridor', name: 'Коридор', floorTexture: 'concrete' },
  { id: 'chiefOffice', name: 'Кабинет шефа', floorTexture: 'wood' },
  { id: 'investigators', name: 'Кабинет следователей', floorTexture: 'concrete' },
  { id: 'interrogation', name: 'Допросная', floorTexture: 'metal' },
  { id: 'archive', name: 'Архив улик', floorTexture: 'marble' },
  { id: 'holding', name: 'Камеры задержания', floorTexture: 'metal' },
  { id: 'briefing', name: 'Комната брифинга', floorTexture: 'wood' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.policeBadge(),
  ItemLibrary.handcuffs(),
  ItemLibrary.evidenceBag(),
  ItemLibrary.camera(),
  ItemLibrary.computer(),
  ItemLibrary.portableRadio(),
  ItemLibrary.keyBox(),
  ItemLibrary.clueBoard(),
  ItemLibrary.table(),
  ItemLibrary.chair(),
  ItemLibrary.bench(),
  ItemLibrary.safe(),
  ItemLibrary.portrait(),
  ItemLibrary.trashcan(),
  ItemLibrary.watercooler(),
  ItemLibrary.fireExtinguisher(),
  ItemLibrary.locker(),
  ItemLibrary.box(),
  ItemLibrary.bookshelf(),
  ItemLibrary.bed(),
  ItemLibrary.toilet(),
];

const items: Item[] = [
  { id: 'reception-desk', typeId: 'table', cells: [cellId(0, 0)] },
  { id: 'reception-chair', typeId: 'chair', cells: [cellId(0, 2)] },
  { id: 'chief-badge', typeId: 'policeBadge', cells: [cellId(0, 1)] },
  { id: 'corridor-camera-north', typeId: 'camera', cells: [cellId(0, 3)] },
  { id: 'corridor-computer', typeId: 'computer', cells: [cellId(1, 5)] },
  { id: 'corridor-table', typeId: 'table', cells: [cellId(2, 3)] },
  { id: 'corridor-board', typeId: 'clueBoard', cells: [cellId(2, 4)] },
  { id: 'corridor-extinguisher', typeId: 'fireExtinguisher', cells: [cellId(3, 3)] },
  { id: 'corridor-evidence', typeId: 'evidenceBag', cells: [cellId(3, 4)] },
  { id: 'corridor-chair', typeId: 'chair', cells: [cellId(4, 3)] },
  { id: 'chief-desk', typeId: 'table', cells: [cellId(0, 7)] },
  { id: 'chief-safe', typeId: 'safe', cells: [cellId(0, 6)] },
  { id: 'investigator-computer-west', typeId: 'computer', cells: [cellId(2, 0)] },
  { id: 'investigator-board', typeId: 'clueBoard', cells: [cellId(3, 0)] },
  { id: 'investigator-desk', typeId: 'table', cells: [cellId(3, 2)] },
  { id: 'investigator-camera', typeId: 'camera', cells: [cellId(4, 0)] },
  { id: 'investigator-computer-east', typeId: 'computer', cells: [cellId(1, 8)] },
  { id: 'interrogation-camera', typeId: 'camera', cells: [cellId(2, 7)] },
  { id: 'interrogation-table', typeId: 'table', cells: [cellId(3, 7)] },
  { id: 'interrogation-camera-east', typeId: 'camera', cells: [cellId(3, 8)] },
  { id: 'interrogation-cuffs', typeId: 'handcuffs', cells: [cellId(4, 6)] },
  { id: 'interrogation-chair', typeId: 'chair', cells: [cellId(4, 8)] },
  { id: 'archive-evidence', typeId: 'evidenceBag', cells: [cellId(5, 1)] },
  { id: 'archive-safe', typeId: 'safe', cells: [cellId(6, 2)] },
  { id: 'archive-locker', typeId: 'locker', cells: [cellId(6, 3)] },
  { id: 'archive-box', typeId: 'box', cells: [cellId(7, 4)] },
  { id: 'archive-bookshelf', typeId: 'bookshelf', cells: [cellId(8, 5)] },
  { id: 'briefing-board', typeId: 'clueBoard', cells: [cellId(6, 1)] },
  { id: 'briefing-table', typeId: 'table', cells: [cellId(7, 0)] },
  { id: 'briefing-computer', typeId: 'computer', cells: [cellId(8, 0)] },
  { id: 'briefing-evidence', typeId: 'evidenceBag', cells: [cellId(7, 1)] },
  { id: 'briefing-chair-south', typeId: 'chair', cells: [cellId(8, 2)] },
  { id: 'holding-toilet-north', typeId: 'toilet', cells: [cellId(5, 8)] },
  { id: 'holding-bed-west', typeId: 'bed', cells: [cellId(6, 7)] },
  { id: 'holding-bed-east', typeId: 'bed', cells: [cellId(7, 8)] },
  { id: 'holding-table', typeId: 'table', cells: [cellId(8, 6)] },
  { id: 'holding-toilet-south', typeId: 'toilet', cells: [cellId(8, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

// R = reception, C = corridor, O = chief's office, I = investigators,
// Q = interrogation, A = evidence archive, H = holding cells, B = briefing.
const ROOM_ROWS = [
  'RRRCCCOOO',
  'RRRCCCCOO',
  'IICCCCCQQ',
  'IIICCCQQQ',
  'IIICCCQQQ',
  'AAACCCQQH',
  'BBAAACCHH',
  'BBBAACCHH',
  'BBBBAAHHH',
];

const ROOM_BY_LETTER: Record<string, string> = {
  R: 'reception',
  C: 'corridor',
  O: 'chiefOffice',
  I: 'investigators',
  Q: 'interrogation',
  A: 'archive',
  H: 'holding',
  B: 'briefing',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: true, roles: ['officer'] },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['officer', 'chief'] },
  { id: 'vlada', name: 'Влада', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['officer'] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['officer'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['visitor', 'criminal'] },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#45a5a7', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#d07150', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#be6278', isVictim: true, isMurderer: false, roles: ['visitor'] },
];

const solution: Record<PersonId, CellId> = {
  anfisa: cellId(3, 6),
  borislav: cellId(0, 8),
  vlada: cellId(2, 5),
  guriy: cellId(4, 1),
  darya: cellId(7, 2),
  egor: cellId(1, 0),
  zhanna: cellId(8, 3),
  zoya: cellId(6, 4),
  khariton: cellId(5, 7),
};

const clues: Clue[] = [
  {
    id: 'ps-officers-by-letter',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Г',
    roleId: 'officer',
    text: 'Все с Анфисы по Гурия были полицейскими, остальные — посетителями.',
  },
  {
    id: 'ps-chief-count',
    type: 'roleSingleton',
    roleId: 'chief',
    withinRoleId: 'officer',
    groupId: 'ps-role-counts',
    text: 'Среди полицейских был шеф полиции, а среди посетителей — преступник. Они могли быть или не быть убийцами.',
  },
  {
    id: 'ps-criminal-count',
    type: 'roleSingleton',
    roleId: 'criminal',
    withinRoleId: 'visitor',
    groupId: 'ps-role-counts',
    text: 'Среди полицейских был шеф полиции, а среди посетителей — преступник. Они могли быть или не быть убийцами.',
  },
  {
    id: 'ps-chief-office',
    type: 'roomMembership',
    subject: { type: 'role', role: 'chief' },
    roomId: 'chiefOffice',
    groupId: 'ps-role-locations',
    text: 'Шеф находился в своём кабинете, а преступник был рядом с пакетом улик.',
  },
  {
    id: 'ps-criminal-evidence',
    type: 'adjacency',
    subject: { type: 'role', role: 'criminal' },
    itemTypeId: 'evidenceBag',
    groupId: 'ps-role-locations',
    text: 'Шеф находился в своём кабинете, а преступник был рядом с пакетом улик.',
  },
  { id: 'ps-anfisa-table', type: 'adjacency', subject: { type: 'person', id: 'anfisa' }, itemTypeId: 'table', text: 'Анфиса находилась рядом со столом.' },
  { id: 'ps-anfisa-north-wall', type: 'wallSide', subject: { type: 'person', id: 'anfisa' }, wallDirection: 'north', text: 'Анфиса находилась у северной стены своей зоны.' },
  { id: 'ps-anfisa-south-of-borislav', type: 'relativePosition', subject: { type: 'person', id: 'anfisa' }, otherPersonId: 'borislav', axis: 'row', direction: 'after', text: 'Анфиса находилась южнее Борислава.' },
  { id: 'ps-borislav-corner', type: 'corner', subject: { type: 'person', id: 'borislav' }, text: 'Борислав находился в углу своей зоны.' },
  { id: 'ps-borislav-safe', type: 'sameRoomAsItem', subject: { type: 'person', id: 'borislav' }, itemTypeId: 'safe', text: 'Борислав находился в одной зоне с сейфом.' },
  { id: 'ps-vlada-computer', type: 'adjacency', subject: { type: 'person', id: 'vlada' }, itemTypeId: 'computer', text: 'Влада находилась рядом с компьютером.' },
  { id: 'ps-vlada-west-of-anfisa', type: 'relativePosition', subject: { type: 'person', id: 'vlada' }, otherPersonId: 'anfisa', axis: 'col', direction: 'before', text: 'Влада находилась западнее Анфисы.' },
  { id: 'ps-guriy-board-room', type: 'sameRoomAsItem', subject: { type: 'person', id: 'guriy' }, itemTypeId: 'clueBoard', text: 'Гурий находился в одной зоне с доской для записей.' },
  { id: 'ps-guriy-south-wall', type: 'wallSide', subject: { type: 'person', id: 'guriy' }, wallDirection: 'south', text: 'Гурий находился у южной стены своей зоны.' },
  { id: 'ps-darya-briefing', type: 'roomMembership', subject: { type: 'person', id: 'darya' }, roomId: 'briefing', text: 'Дарья находилась в комнате брифинга.' },
  { id: 'ps-darya-west-of-zoya', type: 'relativePosition', subject: { type: 'person', id: 'darya' }, otherPersonId: 'zoya', axis: 'col', direction: 'before', offset: 2, text: 'Дарья находилась ровно на два столбца западнее Зои.' },
  { id: 'ps-egor-reception', type: 'roomMembership', subject: { type: 'person', id: 'egor' }, roomId: 'reception', text: 'Егор находился в приёмной.' },
  { id: 'ps-egor-corner', type: 'corner', subject: { type: 'person', id: 'egor' }, text: 'Егор находился в углу своей зоны.' },
  { id: 'ps-zhanna-south-wall', type: 'wallSide', subject: { type: 'person', id: 'zhanna' }, wallDirection: 'south', text: 'Жанна находилась у южной стены своей зоны.' },
  { id: 'ps-zhanna-south-of-criminal', type: 'relativePosition', subject: { type: 'person', id: 'zhanna' }, otherRole: 'criminal', axis: 'row', direction: 'after', text: 'Жанна находилась южнее преступника.' },
  { id: 'ps-zhanna-not-computer', type: 'adjacency', subject: { type: 'person', id: 'zhanna' }, itemTypeId: 'computer', negated: true, text: 'Жанна находилась не рядом с компьютером.' },
  { id: 'ps-zoya-safe-room', type: 'sameRoomAsItem', subject: { type: 'person', id: 'zoya' }, itemTypeId: 'safe', text: 'Зоя находилась в одной зоне с сейфом.' },
  { id: 'ps-zoya-east-wall', type: 'wallSide', subject: { type: 'person', id: 'zoya' }, wallDirection: 'east', text: 'Зоя находилась у восточной стены своей зоны.' },
];

export const policeStationLevel: Level = {
  meta: { id: 'policestation-01', title: 'Участок 99', theme: 'policeStation', difficulty: 8, maxFullyPinnedPeople: 0 },
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
