import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;
const cols = 11;

const rooms: Room[] = [
  { id: 'air', name: 'Воздух', floorTexture: 'sky' },
  { id: 'cabin1', name: 'Кабина №1', floorTexture: 'cobble' },
  { id: 'cabin2', name: 'Кабина №2', floorTexture: 'cobble' },
  { id: 'cabin3', name: 'Кабина №3', floorTexture: 'cobble' },
  { id: 'cabin4', name: 'Кабина №4', floorTexture: 'cobble' },
  { id: 'stationWest', name: 'Станция 2500', floorTexture: 'metal' },
  { id: 'stationCenter', name: 'Станция 3000', floorTexture: 'metal' },
  { id: 'stationEast', name: 'Станция 3500', floorTexture: 'metal' },
  { id: 'mountain', name: 'Склон', floorTexture: 'stone' },
];

const ROOM_ROWS = [
  'AAAACCCA44E',
  'AAAAAC3344E',
  'WWA22C33AAE',
  'W1122CAAAAE',
  'W11AACAAAAE',
  'WAAAACAAAAE',
  'WAAAACALLLL',
  'WAALLCLLLLL',
  'WLLLLCLLLLL',
  'WLLLLCLLLLL',
];

const SURFACE_ROWS = [
  '...........',
  '...........',
  '...........',
  '...........',
  '...........',
  '...........',
  '.......tnnn',
  '...tt.ttnnn',
  '.ggtt.ttnnn',
  '.gggg.tnnnn',
];

const ROOM_BY_SYMBOL: Record<string, string> = {
  A: 'air',
  '1': 'cabin1',
  '2': 'cabin2',
  '3': 'cabin3',
  '4': 'cabin4',
  W: 'stationWest',
  C: 'stationCenter',
  E: 'stationEast',
  L: 'mountain',
};

const floorFeatures: FloorFeature[] = [
  { id: 'grass-slope', label: 'Травянистый склон', textureKey: 'grass' },
  { id: 'rocky-trail', label: 'Каменистая тропа', textureKey: 'cliff' },
  { id: 'snowfield', label: 'Снежный склон', textureKey: 'snow' },
  { id: 'station-stairs', label: 'Лестница к платформе', textureKey: 'stairs' },
];

const itemTypes: ItemType[] = [
  { id: 'gondola', label: 'Кабина канатной дороги', kind: 'occupiable', icon: 'gondola' },
  { id: 'cable', label: 'Трос канатной дороги', kind: 'decorative', icon: 'cable', render: 'tile', tileEdgeDepth: false },
  { id: 'cableSupport', label: 'Опора канатной дороги', kind: 'decorative', icon: 'cableSupport' },
  { id: 'stationSign', label: 'Станционный павильон', kind: 'decorative', icon: 'station' },
  ItemLibrary.seat('Скамья ожидания'),
  ItemLibrary.suitcase('Чемодан'),
  ItemLibrary.lamp('Фонарь станции'),
  ItemLibrary.ladder('Лестница на склон'),
];

const items: Item[] = [
  { id: 'cable-westbound', typeId: 'cable', cells: [cellId(0, 0), cellId(0, 1), cellId(0, 2), cellId(0, 3)] },
  { id: 'cable-eastbound', typeId: 'cable', cells: [cellId(3, 6), cellId(3, 7), cellId(3, 8), cellId(3, 9)] },
  { id: 'support-center', typeId: 'cableSupport', cells: [cellId(3, 5)] },
  { id: 'support-east', typeId: 'cableSupport', cells: [cellId(3, 10)] },
  { id: 'support-slope', typeId: 'cableSupport', cells: [cellId(8, 6)] },
  { id: 'station-west-sign', typeId: 'stationSign', cells: [cellId(3, 0)] },
  { id: 'station-center-sign', typeId: 'stationSign', cells: [cellId(0, 4)] },
  { id: 'station-east-sign', typeId: 'stationSign', cells: [cellId(0, 10)] },

  { id: 'gondola-1', typeId: 'gondola', cells: [cellId(3, 1), cellId(3, 2), cellId(4, 1), cellId(4, 2)] },
  { id: 'gondola-2', typeId: 'gondola', cells: [cellId(2, 3), cellId(2, 4), cellId(3, 3), cellId(3, 4)] },
  { id: 'gondola-3', typeId: 'gondola', cells: [cellId(1, 6), cellId(1, 7), cellId(2, 6), cellId(2, 7)] },
  { id: 'gondola-4', typeId: 'gondola', cells: [cellId(0, 8), cellId(0, 9), cellId(1, 8), cellId(1, 9)] },

  { id: 'waiting-seat-west', typeId: 'seat', cells: [cellId(5, 0)] },
  { id: 'waiting-seat-center', typeId: 'seat', cells: [cellId(6, 0)] },
  { id: 'suitcase-slope', typeId: 'suitcase', cells: [cellId(8, 1)] },
  { id: 'lamp-slope', typeId: 'lamp', cells: [cellId(9, 1)] },
  { id: 'ladder-trail', typeId: 'ladder', cells: [cellId(8, 5)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

function roomForCell(row: number, col: number): string {
  return ROOM_BY_SYMBOL[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)), cols).map((cell) => {
  const surface = SURFACE_ROWS[cell.row][cell.col];
  if (surface === 'g') return { ...cell, floorFeatureId: 'grass-slope' };
  if (surface === 't') return { ...cell, floorFeatureId: 'rocky-trail' };
  if (surface === 'n') return { ...cell, floorFeatureId: 'snowfield' };
  const stationStairsStartRow =
    cell.roomId === 'stationWest' ? 6 :
    cell.roomId === 'stationCenter' ? 4 :
    cell.roomId === 'stationEast' ? 3 :
    undefined;
  if (stationStairsStartRow != null && cell.row >= stationStairsStartRow) {
    return { ...cell, floorFeatureId: 'station-stairs' };
  }
  return cell;
});

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'grigoriy', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'irina', name: 'Ирина', initialLetter: 'И', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(5, 10),
  boris: cellId(0, 9),
  vera: cellId(6, 7),
  grigoriy: cellId(3, 4),
  darya: cellId(8, 3),
  efim: cellId(2, 1),
  zhanna: cellId(9, 6),
  zoya: cellId(4, 2),
  irina: cellId(7, 0),
  khariton: cellId(1, 8),
};

const clues: Clue[] = [
  {
    id: 'cablecar-one-empty-station',
    type: 'zoneExactlyOneEmpty',
    roomIds: ['stationWest', 'stationCenter', 'stationEast'],
    text: 'Ровно одна из трёх станций осталась пустой.',
  },
  {
    id: 'cablecar-empty-air',
    type: 'zoneExactCount',
    roomId: 'air',
    count: 0,
    text: 'В воздухе никого не было.',
  },
  {
    id: 'cablecar-vowels-at-stations',
    type: 'letterGroupInRooms',
    letterClass: 'vowel',
    roomIds: ['stationWest', 'stationCenter', 'stationEast'],
    text: 'Все, чьи имена начинаются на гласную, находились на станциях.',
  },
  {
    id: 'cablecar-two-in-cabin-four',
    type: 'zoneExactCount',
    roomId: 'cabin4',
    count: 2,
    text: 'В четвёртой кабине ехали ровно два человека.',
  },
  {
    id: 'cablecar-anna-east-station',
    type: 'roomMembership',
    subject: { type: 'person', id: 'anna' },
    roomId: 'stationEast',
    text: 'Анна ждала на станции 3500.',
  },
  {
    id: 'cablecar-boris-cabin-four',
    type: 'wallSide',
    subject: { type: 'person', id: 'boris' },
    wallDirection: 'east',
    text: 'Борис стоял у восточной стены своей зоны.',
  },
  {
    id: 'cablecar-boris-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'row',
    parity: 'odd',
    text: 'Борис находился в ряду с нечётным номером.',
  },
  {
    id: 'cablecar-vera-on-trail',
    type: 'floorFeature',
    subject: { type: 'person', id: 'vera' },
    featureId: 'rocky-trail',
    text: 'Вера шла по каменистой тропе.',
  },
  {
    id: 'cablecar-vera-east-of-zhanna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vera' },
    otherPersonId: 'zhanna',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Вера находилась на один столбец восточнее Жанны.',
  },
  {
    id: 'cablecar-grigoriy-cabin-two',
    type: 'roomMembership',
    subject: { type: 'person', id: 'grigoriy' },
    roomId: 'cabin2',
    text: 'Григорий ехал во второй кабине.',
  },
  {
    id: 'cablecar-darya-trail',
    type: 'floorFeature',
    subject: { type: 'person', id: 'darya' },
    featureId: 'rocky-trail',
    text: 'Дарья шла по каменистой тропе.',
  },
  {
    id: 'cablecar-darya-south-of-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'vera',
    axis: 'row',
    direction: 'after',
    text: 'Дарья находилась южнее Веры.',
  },
  {
    id: 'cablecar-darya-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'darya' },
    axis: 'col',
    parity: 'even',
    text: 'Дарья находилась в столбце с чётным номером.',
  },
  {
    id: 'cablecar-efim-west-station',
    type: 'floorTexture',
    subject: { type: 'person', id: 'efim' },
    textureKey: 'metal',
    text: 'Ефим стоял на металлической платформе.',
  },
  {
    id: 'cablecar-zhanna-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'south',
    text: 'Жанна стояла у южного края карты.',
  },
  {
    id: 'cablecar-zhanna-not-at-station',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'stationSign',
    negated: true,
    text: 'Жанна не была на станции.',
  },
  {
    id: 'cablecar-zoya-cabin-one',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'cabin1',
    text: 'Зоя ехала в первой кабине.',
  },
  {
    id: 'cablecar-irina-west-station',
    type: 'wallSide',
    subject: { type: 'person', id: 'irina' },
    wallDirection: 'west',
    text: 'Ирина стояла у западной стены своей зоны.',
  },
  {
    id: 'cablecar-irina-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'irina' },
    axis: 'row',
    parity: 'even',
    text: 'Ирина находилась в ряду с чётным номером.',
  },
];

const level: Level = {
  meta: {
    id: 'cablecar-01',
    title: 'Над пропастью',
    theme: 'cablecar',
    difficulty: 8,
    menuTag: 'hard',
    maxFullyPinnedPeople: 0,
    rosterColumnCounts: [4, 3, 3],
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

export const cablecarLevel = level;
