import type { Clue } from '../src/types/clue';
import type { CellId, EdgeItem, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 11;

// The user's 11×11 plan. P is the connected upper blue starting pen; the four numbered
// rooms are the four tracks. Colours in the reference are replaced by in-game textures.
const ROOM_ROWS = [
  'KKKKKKKKKKK',
  'KPPPKKKKKKK',
  'TPPPPPKKVVV',
  'TT12PPPVVVV',
  'TT123PPVVVV',
  'TT12334VVJJ',
  'TT122344JJJ',
  'TT1123344JJ',
  'TTT122334JJ',
  'TTT1122344J',
  'TTTT1123344',
];

const rooms: Room[] = [
  { id: 'stable', name: 'Конюшня', floorTexture: 'wood' },
  { id: 'startPen', name: 'Стартовый загон', floorTexture: 'cobble' },
  { id: 'stands', name: 'Трибуны', floorTexture: 'rubber' },
  { id: 'track1', name: 'Дорожка 1', floorTexture: 'dirt' },
  { id: 'track2', name: 'Дорожка 2', floorTexture: 'sand' },
  { id: 'track3', name: 'Дорожка 3', floorTexture: 'dirt', labelOffsetCells: { col: 0.75 } },
  { id: 'track4', name: 'Дорожка 4', floorTexture: 'sand' },
  { id: 'vet', name: 'Ветеринарный пункт', floorTexture: 'tile' },
  { id: 'judges', name: 'Судейская', floorTexture: 'marble' },
];

const roomGroups = [
  { id: 'raceTracks', name: 'Беговые дорожки', roomIds: ['track1', 'track2', 'track3', 'track4'] },
];

const ROOM_BY_CODE: Record<string, string> = {
  K: 'stable',
  P: 'startPen',
  T: 'stands',
  '1': 'track1',
  '2': 'track2',
  '3': 'track3',
  '4': 'track4',
  V: 'vet',
  J: 'judges',
};
function roomForCell(row: number, col: number): string {
  return ROOM_BY_CODE[ROOM_ROWS[row][col]];
}

const itemTypes: ItemType[] = [
  ItemLibrary.horse(),
  ItemLibrary.chair(),
  ItemLibrary.seat(),
  ItemLibrary.hitchingPost(),
  ItemLibrary.haystack(),
  ItemLibrary.trough(),
  ItemLibrary.hurdle(),
  ItemLibrary.examTable(),
  ItemLibrary.medicineCabinet(),
  ItemLibrary.table(),
  ItemLibrary.camera(),
  ItemLibrary.startingGate(),
];

const items: Item[] = [
  // Six horses: one each on tracks 1, 2 and 4; one in the starting pen; two in the stable.
  { id: 'horse-stable-victim', typeId: 'horse', cells: [cellId(0, 6)] },
  { id: 'horse-stable-empty', typeId: 'horse', cells: [cellId(1, 10)] },
  { id: 'horse-track-1', typeId: 'horse', cells: [cellId(3, 2)] },
  { id: 'horse-start-pen', typeId: 'horse', cells: [cellId(4, 5)] },
  { id: 'horse-track-2', typeId: 'horse', cells: [cellId(6, 4)] },
  { id: 'horse-track-4', typeId: 'horse', cells: [cellId(7, 7)] },

  // Familiar stable, stand, veterinary and judge-room props.
  { id: 'hitching-post', typeId: 'hitchingPost', cells: [cellId(0, 1)] },
  { id: 'haystack-stable', typeId: 'haystack', cells: [cellId(0, 3)] },
  { id: 'trough-stable', typeId: 'trough', cells: [cellId(1, 4)] },
  { id: 'seat-stands-1', typeId: 'seat', cells: [cellId(8, 0)] },
  { id: 'seat-stands-2', typeId: 'seat', cells: [cellId(10, 1)] },
  { id: 'hurdle-track-1-2', typeId: 'hurdle', cells: [cellId(7, 3)] },
  { id: 'hurdle-track-2-2', typeId: 'hurdle', cells: [cellId(7, 4)] },
  { id: 'hurdle-track-3', typeId: 'hurdle', cells: [cellId(5, 5)] },
  { id: 'hurdle-track-3-2', typeId: 'hurdle', cells: [cellId(7, 6)] },
  { id: 'hurdle-track-4', typeId: 'hurdle', cells: [cellId(8, 8)] },
  { id: 'hurdle-track-1-extra', typeId: 'hurdle', cells: [cellId(6, 2)] },
  { id: 'hurdle-track-1-extra-2', typeId: 'hurdle', cells: [cellId(9, 3)] },
  { id: 'hurdle-track-2-extra-1', typeId: 'hurdle', cells: [cellId(8, 4)] },
  { id: 'hurdle-track-2-extra-2', typeId: 'hurdle', cells: [cellId(9, 5)] },
  { id: 'hurdle-track-3-extra', typeId: 'hurdle', cells: [cellId(6, 5)] },
  { id: 'hurdle-track-4-extra-1', typeId: 'hurdle', cells: [cellId(7, 8)] },
  { id: 'hurdle-track-4-extra-2', typeId: 'hurdle', cells: [cellId(9, 8)] },
  { id: 'hurdle-track-1-extra-3', typeId: 'hurdle', cells: [cellId(4, 2)] },
  { id: 'hurdle-track-4-extra-3', typeId: 'hurdle', cells: [cellId(10, 10)] },
  { id: 'haystack-stable-2', typeId: 'haystack', cells: [cellId(1, 6)] },
  { id: 'haystack-stable-3', typeId: 'haystack', cells: [cellId(0, 10)] },
  { id: 'trough-stable-2', typeId: 'trough', cells: [cellId(0, 5)] },
  { id: 'trough-stable-3', typeId: 'trough', cells: [cellId(1, 9)] },
  { id: 'exam-table-vet', typeId: 'examTable', cells: [cellId(2, 9)] },
  { id: 'exam-table-vet-2', typeId: 'examTable', cells: [cellId(4, 10)] },
  { id: 'medicine-cabinet-vet', typeId: 'medicineCabinet', cells: [cellId(3, 10)] },
  { id: 'medicine-cabinet-vet-2', typeId: 'medicineCabinet', cells: [cellId(4, 8)] },
  { id: 'judges-table', typeId: 'table', cells: [cellId(7, 10)] },
  { id: 'judges-camera', typeId: 'camera', cells: [cellId(5, 10)] },

  ...[
    cellId(2, 0),
    cellId(4, 0),
    cellId(6, 1),
    cellId(8, 1),
    cellId(9, 2),
    cellId(10, 3),
    cellId(7, 0),
  ].map((id, index): Item => ({ id: `seat-stands-${index + 3}`, typeId: 'seat', cells: [id] })),

  ...[
    cellId(6, 8),
    cellId(8, 10),
  ].map((id, index): Item => ({ id: `chair-judges-${index + 1}`, typeId: 'chair', cells: [id] })),

  { id: 'hitching-post-stable-2', typeId: 'hitchingPost', cells: [cellId(0, 8)] },
  { id: 'hitching-post-stable-3', typeId: 'hitchingPost', cells: [cellId(1, 0)] },
  { id: 'hitching-post-stable-4', typeId: 'hitchingPost', cells: [cellId(2, 7)] },
  { id: 'hitching-post-stable-5', typeId: 'hitchingPost', cells: [cellId(1, 5)] },
  { id: 'hitching-post-stable-6', typeId: 'hitchingPost', cells: [cellId(1, 7)] },
];

const edgeItems: EdgeItem[] = [
  // Gates are mounted on cell boundaries, so neither side becomes a blocked cell.
  { id: 'gate-west', typeId: 'startingGate', cellA: cellId(2, 2), cellB: cellId(3, 2) },
  { id: 'gate-east', typeId: 'startingGate', cellA: cellId(2, 3), cellB: cellId(3, 3) },
  { id: 'gate-start', typeId: 'startingGate', cellA: cellId(3, 4), cellB: cellId(4, 4) },
  { id: 'gate-track-four', typeId: 'startingGate', cellA: cellId(4, 6), cellB: cellId(5, 6) },
];

const itemIdByCell = new Map<CellId, string>();
for (const item of items) {
  for (const itemCell of item.cells) {
    if (itemIdByCell.has(itemCell)) throw new Error(`Overlapping Hippodrome items at ${itemCell}.`);
    itemIdByCell.set(itemCell, item.id);
  }
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'vasilisa', name: 'Василиса', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'irina', name: 'Ирина', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#c9536b', isVictim: true, isMurderer: false },
];

// Each person occupies a distinct row and column. Ирина's corrected position is row 6, column 10.
const solution: Record<PersonId, CellId> = {
  andrey: cellId(7, 7),
  boris: cellId(2, 3),
  vasilisa: cellId(6, 4),
  grigory: cellId(1, 8),
  dina: cellId(8, 0),
  esenia: cellId(10, 1),
  zhanna: cellId(3, 2),
  zahar: cellId(4, 5),
  irina: cellId(5, 9),
  kirill: cellId(9, 10),
  khariton: cellId(0, 6),
};

const clues: Clue[] = [
  {
    id: 'h-common-horse-vacancy',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'horse',
    vacancies: 1,
    text: 'Ровно одна лошадь осталась без наездника.',
  },
  {
    id: 'h-andrey-race-tracks',
    type: 'roomGroupMembership',
    subject: { type: 'person', id: 'andrey' },
    roomGroupId: 'raceTracks',
    text: 'Андрей находился на одной из беговых дорожек.',
  },
  {
    id: 'h-boris-gate',
    type: 'atEdgeItem',
    subject: { type: 'person', id: 'boris' },
    edgeItemTypeId: 'startingGate',
    text: 'Борис находился у одних из стартовых ворот.',
  },
  {
    id: 'h-vasilisa-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'vasilisa' },
    axis: 'row',
    parity: 'odd',
    text: 'Василиса находилась в нечётном ряду.',
  },
  {
    id: 'h-vasilisa-south-zahar',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vasilisa' },
    otherPersonId: 'zahar',
    axis: 'row',
    direction: 'after',
    text: 'Василиса находилась южнее Захара.',
  },
  {
    id: 'h-grigory-stable',
    type: 'roomMembership',
    subject: { type: 'person', id: 'grigory' },
    roomId: 'stable',
    text: 'Григорий находился в конюшне.',
  },
  {
    id: 'h-grigory-hitching-post',
    type: 'adjacency',
    subject: { type: 'person', id: 'grigory' },
    itemTypeId: 'hitchingPost',
    text: 'Григорий находился рядом с коновязью.',
  },
  {
    id: 'h-grigory-column-parity',
    type: 'parity',
    subject: { type: 'person', id: 'grigory' },
    axis: 'col',
    parity: 'odd',
    text: 'Григорий находился в нечётном столбце.',
  },
  {
    id: 'h-dina-stands',
    type: 'roomMembership',
    subject: { type: 'person', id: 'dina' },
    roomId: 'stands',
    text: 'Дина находилась на трибунах.',
  },
  {
    id: 'h-dina-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'dina' },
    wallDirection: 'west',
    text: 'Дина стояла у западной стены своей зоны.',
  },
  {
    id: 'h-dina-south-irina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dina' },
    otherPersonId: 'irina',
    axis: 'row',
    direction: 'after',
    minOffset: 2,
    text: 'Дина находилась не менее чем на два ряда южнее Ирины.',
  },
  {
    id: 'h-esenia-shares-woman',
    type: 'sharedRoomGender',
    subject: { type: 'person', id: 'esenia' },
    otherGender: 'female',
    text: 'В зоне с Есенией была минимум ещё одна женщина.',
  },
  {
    id: 'h-esenia-south-dina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenia' },
    otherPersonId: 'dina',
    axis: 'row',
    direction: 'after',
    text: 'Есения находилась южнее Дины.',
  },
  {
    id: 'h-esenia-no-horse-row',
    type: 'itemAbsentInLine',
    subject: { type: 'person', id: 'esenia' },
    itemTypeId: 'horse',
    axis: 'row',
    text: 'В ряду с Есенией не было лошадей.',
  },
  {
    id: 'h-zhanna-row',
    type: 'position',
    subject: { type: 'person', id: 'zhanna' },
    axis: 'row',
    value: 3,
    text: 'Жанна находилась в четвёртом ряду.',
  },
  {
    id: 'h-zahar-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'zahar' },
    axis: 'row',
    parity: 'odd',
    text: 'Захар находился в нечётном ряду.',
  },
  {
    id: 'h-zahar-south-zhanna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zahar' },
    otherPersonId: 'zhanna',
    axis: 'row',
    direction: 'after',
    text: 'Захар находился южнее Жанны.',
  },
  {
    id: 'h-irina-corner',
    type: 'corner',
    subject: { type: 'person', id: 'irina' },
    text: 'Ирина находилась в углу своей зоны.',
  },
  {
    id: 'h-irina-west-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'irina' },
    wallDirection: 'west',
    text: 'Ирина находилась у западной стены своей зоны.',
  },
  {
    id: 'h-kirill-judges',
    type: 'roomMembership',
    subject: { type: 'person', id: 'kirill' },
    roomId: 'judges',
    text: 'Кирилл находился в судейской.',
  },
  {
    id: 'h-kirill-row-parity',
    type: 'parity',
    subject: { type: 'person', id: 'kirill' },
    axis: 'row',
    parity: 'even',
    text: 'Кирилл находился в чётном ряду.',
  },
  {
    id: 'h-kirill-shares-vowel',
    type: 'sharedRoomLetterGroup',
    subject: { type: 'person', id: 'kirill' },
    letterClass: 'vowel',
    text: 'В зоне с Кириллом у кого-то было имя на гласную.',
  },
];

export const hippodromeLevel: Level = {
  meta: {
    id: 'hippodrome-01',
    title: 'Подкова удачи',
    theme: 'hippodrome',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    menuTag: 'expert',
    generalNotes: [
      'Если персонаж находился у ворот, то он мог быть в клетке над воротами или в клетке под воротами, в том числе в разных зонах',
    ],
  },
  size,
  rooms,
  roomGroups,
  itemTypes,
  items,
  edgeItems,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};
