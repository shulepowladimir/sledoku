import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

const rooms: Room[] = [
  { id: 'editorial', name: 'Редакторская', floorTexture: 'linoleum' },
  { id: 'studio', name: 'Эфирная студия', floorTexture: 'wood' },
  { id: 'backstage', name: 'Закулисье', floorTexture: 'concrete' },
  { id: 'audience', name: 'Зрительский зал', floorTexture: 'carpet' },
  { id: 'musicStage', name: 'Музыкальная сцена', floorTexture: 'wood', labelAlign: 'right' },
  { id: 'control', name: 'Аппаратная', floorTexture: 'metal' },
  { id: 'editing', name: 'Монтажная', floorTexture: 'checker' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.directorConsole(),
  ItemLibrary.studioSoftbox(),
  ItemLibrary.newsDesk(),
  ItemLibrary.sofa('Диван'),
  ItemLibrary.movieCamera(),
  ItemLibrary.camera(),
  ItemLibrary.tv('Монитор эфира'),
  ItemLibrary.computer(),
  ItemLibrary.spotlight(),
  ItemLibrary.micStand(),
  ItemLibrary.seat('Зрительское кресло'),
  ItemLibrary.speaker(),
  ItemLibrary.guitar(),
  ItemLibrary.piano(),
  ItemLibrary.box('Коробка с реквизитом'),
  ItemLibrary.rack('Стойка с костюмами'),
  ItemLibrary.bookshelf('Полка со сценариями'),
  ItemLibrary.clueBoard('Редакторская доска'),
];

const items: Item[] = [
  { id: 'studio-host-desk', typeId: 'newsDesk', cells: [cellId(0, 5)] },
  { id: 'studio-sofa-1', typeId: 'sofa', cells: [cellId(0, 4)] },
  { id: 'studio-sofa-2', typeId: 'sofa', cells: [cellId(1, 5)] },
  { id: 'studio-spotlight', typeId: 'spotlight', cells: [cellId(1, 3)] },
  { id: 'studio-softbox', typeId: 'studioSoftbox', cells: [cellId(2, 7)] },
  { id: 'studio-monitor', typeId: 'tv', cells: [cellId(2, 6)] },

  { id: 'control-console', typeId: 'directorConsole', cells: [cellId(7, 4)] },
  { id: 'control-camera', typeId: 'camera', cells: [cellId(8, 3)] },
  { id: 'control-monitor', typeId: 'tv', cells: [cellId(8, 6)] },

  { id: 'editing-computer-1', typeId: 'computer', cells: [cellId(7, 0)] },
  { id: 'editing-computer-2', typeId: 'computer', cells: [cellId(7, 1)] },
  { id: 'editing-computer-3', typeId: 'computer', cells: [cellId(7, 2)] },
  { id: 'editing-computer-4', typeId: 'computer', cells: [cellId(8, 0)] },
  { id: 'editing-camera', typeId: 'movieCamera', cells: [cellId(8, 1)] },
  { id: 'editing-monitor', typeId: 'tv', cells: [cellId(7, 3)] },

  { id: 'audience-seat-1', typeId: 'seat', cells: [cellId(3, 2)] },
  { id: 'audience-seat-2', typeId: 'seat', cells: [cellId(3, 4)] },
  { id: 'audience-seat-3', typeId: 'seat', cells: [cellId(4, 1)] },
  { id: 'audience-seat-4', typeId: 'seat', cells: [cellId(5, 2)] },
  { id: 'audience-seat-5', typeId: 'seat', cells: [cellId(6, 2)] },

  { id: 'backstage-monitor', typeId: 'tv', cells: [cellId(2, 8)] },
  { id: 'backstage-costume-rack', typeId: 'rack', cells: [cellId(3, 7)] },
  { id: 'backstage-props', typeId: 'box', cells: [cellId(4, 7)] },
  { id: 'backstage-scripts', typeId: 'bookshelf', cells: [cellId(5, 8)] },

  { id: 'editorial-computer', typeId: 'computer', cells: [cellId(0, 0)] },
  { id: 'editorial-scripts', typeId: 'bookshelf', cells: [cellId(1, 1)] },
  { id: 'editorial-board', typeId: 'clueBoard', cells: [cellId(2, 1)] },

  { id: 'music-guitar', typeId: 'guitar', cells: [cellId(4, 5)] },
  { id: 'music-spotlight', typeId: 'spotlight', cells: [cellId(4, 6)] },
  { id: 'music-piano', typeId: 'piano', cells: [cellId(6, 5)] },
  { id: 'music-speaker-1', typeId: 'speaker', cells: [cellId(5, 4)] },
  { id: 'music-microphone', typeId: 'micStand', cells: [cellId(5, 6)] },
  { id: 'music-speaker-2', typeId: 'speaker', cells: [cellId(6, 6)] },
];

const floorFeatures: FloorFeature[] = [
  { id: 'host-mark', label: 'Ковёр ведущего', textureKey: 'rug' },
];

const ROOM_ROWS = [
  'RRREEEEEK',
  'RRREEEEEK',
  'RRZEEEEEK',
  'RZZZZEEKK',
  'MZZZZSSKK',
  'MMZSSSSKK',
  'MMZSSSSKK',
  'MMMMAAAKK',
  'MMMAAAAKK',
];

const roomIdsByLetter: Record<string, string> = {
  R: 'editorial',
  E: 'studio',
  K: 'backstage',
  Z: 'audience',
  S: 'musicStage',
  A: 'control',
  M: 'editing',
};

export function roomForCell(row: number, col: number): string {
  return roomIdsByLetter[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => ({
  ...cell,
  ...(cell.row === 0 && (cell.col === 7 || cell.col === 8) ? { floorFeatureId: 'host-mark' } : {}),
}));

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'daniil', name: 'Даниил', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['host'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhosefina', name: 'Жозефина', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'hristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  daniil: cellId(0, 6),
  hristofor: cellId(1, 7),
  vladimir: cellId(2, 0),
  zakhar: cellId(3, 8),
  bella: cellId(4, 1),
  galina: cellId(5, 3),
  zhosefina: cellId(6, 4),
  artem: cellId(7, 5),
  esenia: cellId(8, 2),
};

const clues: Clue[] = [
  {
    id: 'tv-host-singleton',
    type: 'roleSingleton',
    roleId: 'host',
    text: 'У шоу был единственный ведущий.',
  },
  {
    id: 'tv-host-desk',
    type: 'adjacency',
    subject: { type: 'role', role: 'host' },
    itemTypeId: 'newsDesk',
    text: 'Ведущий находился рядом со своим столом.',
  },
  {
    id: 'tv-all-rooms-occupied',
    type: 'roomOccupancy',
    text: 'Во всех семи зонах телецентра кто-то находился.',
  },
  {
    id: 'tv-daniil-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'daniil' },
    wallDirection: 'north',
    text: 'Даниил находился у северного края своей зоны.',
  },
  {
    id: 'tv-artem-control',
    type: 'roomMembership',
    subject: { type: 'person', id: 'artem' },
    roomId: 'control',
    text: 'Артём находился в аппаратной.',
  },
  {
    id: 'tv-esenia-editing-computer',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'computer',
    text: 'Есения находилась в зоне с монтажными компьютерами.',
  },
  {
    id: 'tv-vladimir-board',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'vladimir' },
    itemTypeId: 'clueBoard',
    text: 'Владимир находился в зоне с редакторской доской.',
  },
  {
    id: 'tv-zakhar-monitor',
    type: 'adjacency',
    subject: { type: 'person', id: 'zakhar' },
    itemTypeId: 'tv',
    text: 'Захар находился рядом с монитором.',
  },
  {
    id: 'tv-zakhar-south-of-vladimir',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zakhar' },
    otherPersonId: 'vladimir',
    axis: 'row',
    direction: 'after',
    text: 'Захар находился южнее Владимира.',
  },
  {
    id: 'tv-bella-seat',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'bella' },
    itemTypeId: 'seat',
    text: 'Белла сидела в зрительском кресле.',
  },
  {
    id: 'tv-galina-speaker',
    type: 'adjacency',
    subject: { type: 'person', id: 'galina' },
    itemTypeId: 'speaker',
    text: 'Галина находилась рядом с колонкой.',
  },
  {
    id: 'tv-galina-west-of-zhosefina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'zhosefina',
    axis: 'col',
    direction: 'before',
    text: 'Галина находилась западнее Жозефины.',
  },
  {
    id: 'tv-zhosefina-piano',
    type: 'adjacency',
    subject: { type: 'person', id: 'zhosefina' },
    itemTypeId: 'piano',
    text: 'Жозефина находилась рядом с пианино.',
  },
];

export const tvStudioLevel: Level = {
  // User-approved: the requested clue removals leave adjacency at 4/13 (30.8%).
  meta: { id: 'tvstudio-01', title: 'Очень позднее шоу', theme: 'tvStudio', difficulty: 10, maxFullyPinnedPeople: 0, clueBalanceExempt: true },
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
