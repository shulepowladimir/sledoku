import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 7;

const rooms: Room[] = [
  { id: 'stage', name: 'Сцена', floorTexture: 'stairs' },
  { id: 'hall', name: 'Зал', floorTexture: 'marble' },
  { id: 'entrance', name: 'Вход и гардероб', floorTexture: 'rug' },
  { id: 'bar', name: 'Бар', floorTexture: 'wood' },
  { id: 'smokingRoom', name: 'Сигарная', floorTexture: 'carpet' },
];

const ROOM_ROWS = [
  'SSSSSSH',
  'SSSSSHH',
  'HSSSHHH',
  'HHHHHHI',
  'BHGHHII',
  'BBGGGII',
  'BBBBGII',
];

const ROOM_BY_SYMBOL: Record<string, string> = {
  S: 'stage',
  H: 'hall',
  I: 'entrance',
  B: 'bar',
  G: 'smokingRoom',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_SYMBOL[ROOM_ROWS[row][col]];
}

const itemTypes: ItemType[] = [
  ItemLibrary.piano('Пианино', { kind: 'occupiable' }),
  ItemLibrary.guitar(),
  ItemLibrary.micStand(),
  ItemLibrary.spotlight(),
  ItemLibrary.stool(),
  ItemLibrary.drumKit(),
  ItemLibrary.saxophone('Саксофон', { kind: 'occupiable' }),
  ItemLibrary.fineDiningTable(),
  ItemLibrary.jukebox(),
  ItemLibrary.floorLamp(),
  ItemLibrary.wardrobe(),
  ItemLibrary.bench(),
  ItemLibrary.barCounter(),
  ItemLibrary.barStool(),
  ItemLibrary.armchair(),
  ItemLibrary.sofa(),
  ItemLibrary.cigar(),
  ItemLibrary.chair(),
  ItemLibrary.neonSign(),
];

const items: Item[] = [
  { id: 'club-piano', typeId: 'piano', cells: [cellId(0, 0), cellId(1, 0)] },
  { id: 'club-guitar', typeId: 'guitar', cells: [cellId(0, 2)] },
  { id: 'club-drum-kit', typeId: 'drumKit', cells: [cellId(0, 1), cellId(1, 1)] },
  { id: 'club-saxophone', typeId: 'saxophone', cells: [cellId(0, 3)] },
  { id: 'club-spotlight', typeId: 'spotlight', cells: [cellId(1, 2)] },
  { id: 'club-mic-stand', typeId: 'micStand', cells: [cellId(1, 3)] },
  { id: 'club-stage-stool', typeId: 'stool', cells: [cellId(2, 2)] },
  { id: 'club-dining-table-1', typeId: 'fineDiningTable', cells: [cellId(0, 6)] },
  { id: 'club-dining-table-2', typeId: 'fineDiningTable', cells: [cellId(2, 5)] },
  { id: 'club-dining-table-3', typeId: 'fineDiningTable', cells: [cellId(4, 4)] },
  { id: 'club-dining-chair-1', typeId: 'chair', cells: [cellId(1, 5)] },
  { id: 'club-dining-chair-2', typeId: 'chair', cells: [cellId(2, 0)] },
  { id: 'club-dining-chair-3', typeId: 'chair', cells: [cellId(3, 2)] },
  { id: 'club-jukebox', typeId: 'jukebox', cells: [cellId(3, 1)] },
  { id: 'club-hall-floor-lamp', typeId: 'floorLamp', cells: [cellId(2, 4)] },
  { id: 'club-smoking-floor-lamp', typeId: 'floorLamp', cells: [cellId(5, 4)] },
  { id: 'club-wardrobe', typeId: 'wardrobe', cells: [cellId(3, 6)] },
  { id: 'club-entrance-neon-sign', typeId: 'neonSign', cells: [cellId(4, 5)] },
  { id: 'club-entrance-bench', typeId: 'bench', cells: [cellId(4, 6)] },
  { id: 'club-bar-counter', typeId: 'barCounter', cells: [cellId(4, 0), cellId(5, 0)] },
  { id: 'club-bar-stool-1', typeId: 'barStool', cells: [cellId(5, 1)] },
  { id: 'club-bar-stool-2', typeId: 'barStool', cells: [cellId(6, 1)] },
  { id: 'club-smoking-armchair', typeId: 'armchair', cells: [cellId(4, 2)] },
  { id: 'club-smoking-sofa', typeId: 'sofa', cells: [cellId(5, 2), cellId(5, 3)] },
  { id: 'club-cigar', typeId: 'cigar', cells: [cellId(6, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'anfisa', name: 'Анфиса', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['musician'] },
  { id: 'borislav', name: 'Борислав', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#8f7ca8', isVictim: false, isMurderer: false, roles: ['musician'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#ef805f', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anfisa: cellId(0, 4),
  esenia: cellId(2, 1),
  borislav: cellId(3, 0),
  guriy: cellId(1, 5),
  viktor: cellId(4, 2),
  khariton: cellId(5, 3),
  darya: cellId(6, 6),
};

const clues: Clue[] = [
  {
    id: 'jc-vowels-are-musicians',
    type: 'letterRole',
    letterClass: 'vowel',
    roleId: 'musician',
    text: 'Все, чьё имя начиналось на гласную букву, были музыкантами; остальные — посетителями и сотрудниками клуба.',
  },
  {
    id: 'jc-musicians-on-stage',
    type: 'roleZoneLimit',
    roleId: 'musician',
    roomIds: ['hall', 'entrance', 'bar', 'smokingRoom'],
    maxCount: 0,
    text: 'Музыканты выступали только на сцене.',
  },
  {
    id: 'jc-anfisa-jukebox-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'anfisa' },
    itemTypeId: 'floorLamp',
    text: 'Анфиса находилась в одном ряду или столбце с торшером.',
  },
  {
    id: 'jc-anfisa-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'anfisa' },
    axis: 'row',
    parity: 'odd',
    text: 'Анфиса находилась в нечётном ряду.',
  },
  {
    id: 'jc-esenia-floor-lamp-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'floorLamp',
    text: 'Есения находилась в одном ряду или столбце с торшером.',
  },
  {
    id: 'jc-esenia-south-of-guriy',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'guriy',
    axis: 'row',
    direction: 'after',
    text: 'Есения находилась южнее Гурия.',
  },
  {
    id: 'jc-guriy-hall',
    type: 'roomMembership',
    subject: { type: 'person', id: 'guriy' },
    roomId: 'hall',
    text: 'Гурий находился в зале.',
  },
  {
    id: 'jc-borislav-odd-column',
    type: 'parity',
    subject: { type: 'person', id: 'borislav' },
    axis: 'col',
    parity: 'odd',
    text: 'Борислав находился в столбце с нечётным номером.',
  },
  {
    id: 'jc-guriy-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'guriy' },
    axis: 'row',
    parity: 'even',
    text: 'Гурий находился в чётном ряду.',
  },
  {
    id: 'jc-darya-entrance',
    type: 'roomMembership',
    subject: { type: 'person', id: 'darya' },
    roomId: 'entrance',
    text: 'Дарья находилась на входе.',
  },
  {
    id: 'jc-darya-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'darya' },
    wallDirection: 'east',
    text: 'Дарья находилась у восточной стены своей зоны.',
  },
  {
    id: 'jc-viktor-south-of-borislav',
    type: 'relativePosition',
    subject: { type: 'person', id: 'viktor' },
    otherPersonId: 'borislav',
    axis: 'row',
    direction: 'after',
    text: 'Виктор находился южнее Борислава.',
  },
  {
    id: 'jc-viktor-smoking-room',
    type: 'roomMembership',
    subject: { type: 'person', id: 'viktor' },
    roomId: 'smokingRoom',
    text: 'Виктор находился в сигарной.',
  },
  {
    id: 'jc-viktor-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'viktor' },
    wallDirection: 'west',
    text: 'Виктор находился у западной стены своей зоны.',
  },
];

export const jazzClubLevel: Level = {
  meta: {
    id: 'jazzclub-01',
    title: 'Клуб «7 нот»',
    theme: 'jazzclub',
    difficulty: 4,
    maxFullyPinnedPeople: 0,
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
