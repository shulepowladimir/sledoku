import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

const rooms: Room[] = [
  { id: 'stands', name: 'Трибуна', floorTexture: 'concrete' },
  { id: 'track', name: 'Беговые дорожки', floorTexture: 'rubber' },
  { id: 'home', name: 'Домашняя половина', floorTexture: 'grass' },
  { id: 'away', name: 'Гостевая половина', floorTexture: 'grass' },
];

const floorFeatures: FloorFeature[] = [{ id: 'centerCircle', label: 'Центральный круг', textureKey: 'tile' }];

const itemTypes: ItemType[] = [
  { id: 'goal', label: 'Ворота', kind: 'occupiable', icon: 'goal' },
  { id: 'ball', label: 'Мяч', kind: 'decorative', icon: 'ball' },
  { id: 'seat', label: 'Сиденье трибуны', kind: 'occupiable', icon: 'seat' },
  { id: 'treadmill', label: 'Беговой тренажёр', kind: 'occupiable', icon: 'treadmill' },
  { id: 'exerciseBike', label: 'Велотренажёр', kind: 'occupiable', icon: 'exerciseBike' },
  { id: 'hurdle', label: 'Барьер', kind: 'decorative', icon: 'hurdle' },
  ItemLibrary.lamppost('Прожекторная мачта'),
];

const items: Item[] = [
  // Pitch: two 2-cell goals facing each other, the ball at kickoff inside the center circle.
  { id: 'item-goal-home', typeId: 'goal', cells: [cellId(2, 4), cellId(2, 5)] },
  { id: 'item-goal-away', typeId: 'goal', cells: [cellId(7, 4), cellId(7, 5)] },
  { id: 'item-ball', typeId: 'ball', cells: [cellId(5, 4)] },
  // Stands: 16 seats spread around the ring with gaps for aisles.
  { id: 'item-seat-1', typeId: 'seat', cells: [cellId(0, 2)] },
  { id: 'item-seat-2', typeId: 'seat', cells: [cellId(0, 4)] },
  { id: 'item-seat-3', typeId: 'seat', cells: [cellId(0, 6)] },
  { id: 'item-seat-4', typeId: 'seat', cells: [cellId(1, 0)] },
  { id: 'item-seat-5', typeId: 'seat', cells: [cellId(1, 8)] },
  { id: 'item-seat-6', typeId: 'seat', cells: [cellId(2, 9)] },
  { id: 'item-seat-7', typeId: 'seat', cells: [cellId(3, 0)] },
  { id: 'item-seat-8', typeId: 'seat', cells: [cellId(4, 9)] },
  { id: 'item-seat-9', typeId: 'seat', cells: [cellId(5, 0)] },
  { id: 'item-seat-10', typeId: 'seat', cells: [cellId(6, 9)] },
  { id: 'item-seat-11', typeId: 'seat', cells: [cellId(7, 0)] },
  { id: 'item-seat-12', typeId: 'seat', cells: [cellId(8, 1)] },
  { id: 'item-seat-13', typeId: 'seat', cells: [cellId(8, 8)] },
  { id: 'item-seat-14', typeId: 'seat', cells: [cellId(9, 2)] },
  { id: 'item-seat-15', typeId: 'seat', cells: [cellId(9, 5)] },
  { id: 'item-seat-16', typeId: 'seat', cells: [cellId(9, 7)] },
  // Track: exercise machines and floodlight masts along the oval.
  { id: 'item-treadmill-1', typeId: 'treadmill', cells: [cellId(1, 4)] },
  { id: 'item-treadmill-2', typeId: 'treadmill', cells: [cellId(5, 8)] },
  { id: 'item-bike-1', typeId: 'exerciseBike', cells: [cellId(3, 1)] },
  { id: 'item-bike-2', typeId: 'exerciseBike', cells: [cellId(6, 8)] },
  { id: 'item-hurdle-1', typeId: 'hurdle', cells: [cellId(2, 2)] },
  { id: 'item-hurdle-2', typeId: 'hurdle', cells: [cellId(7, 7)] },
  { id: 'item-lamp-1', typeId: 'lamppost', cells: [cellId(2, 7)] },
  { id: 'item-lamp-2', typeId: 'lamppost', cells: [cellId(7, 2)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// A rounded stadium map: the four corner cells are cut out (roomForCell returns null), so the
// board silhouette is an octagon resembling a circle. T = stands (outer ring), R = running
// track (inner ring), H = home half of the pitch (top), A = away half (bottom).
const ROOM_ROWS = [
  '.TTTTTTTT.',
  'TTRRRRRRTT',
  'TRRHHHHRRT',
  'TRHHHHHHRT',
  'TRHHHHHHRT',
  'TRAAAAAART',
  'TRAAAAAART',
  'TRRAAAARRT',
  'TTRRRRRRTT',
  '.TTTTTTTT.',
];

const ROOM_BY_LETTER: Record<string, string> = {
  T: 'stands',
  R: 'track',
  H: 'home',
  A: 'away',
};

export function roomForCell(row: number, col: number): string | null {
  const letter = ROOM_ROWS[row]?.[col];
  return letter === undefined ? null : (ROOM_BY_LETTER[letter] ?? null);
}

const CENTER_CIRCLE_CELLS = new Set<CellId>([cellId(4, 4), cellId(4, 5), cellId(5, 4), cellId(5, 5)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (CENTER_CIRCLE_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'centerCircle' } : cell));

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'khristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

// `npm run scaffold-level -- levels/15-stadium.ts stands:4,home:2,track:1,away:3`
// → row→col [1, 0, 6, 7, 8, 3, 2, 4, 9, 5]. Rows 0/9 and columns 0/9 can only be stands cells,
// so at least 4 people are forced onto the stands — hence the 4/2/1/3 split. Home half (rows
// 2-3) hosts the victim (Христофор) and the murderer (Григорий). Захар (7,4) stands right in
// the away goal; Белла (1,0) and Вероника (9,5) sit on stand seats.
const solution: Record<PersonId, CellId> = {
  arkady: cellId(0, 1),
  bella: cellId(1, 0),
  khristofor: cellId(2, 6),
  grigory: cellId(3, 7),
  darya: cellId(4, 8),
  efim: cellId(5, 3),
  zhanna: cellId(6, 2),
  zakhar: cellId(7, 4),
  inna: cellId(8, 9),
  veronika: cellId(9, 5),
};

const clues: Clue[] = [
  // — Общие правила стадиона —
  { id: 'st-occupancy', type: 'roomOccupancy', text: 'Ни одна зона стадиона не осталась пустой.' },
  {
    id: 'st-track-population',
    type: 'roomPopulation',
    roomId: 'track',
    comparison: 'least',
    text: 'На беговых дорожках находилось меньше людей, чем в любой другой зоне стадиона.',
  },
  { id: 'st-seat-gender', type: 'itemTypeGender', itemTypeId: 'seat', gender: 'female', text: 'Мужчины не садились на сиденья трибуны.' },
  // — Трибуна —
  {
    id: 'st-arkady-north',
    type: 'relativePosition',
    subject: { type: 'person', id: 'arkady' },
    otherPersonId: 'bella',
    axis: 'row',
    direction: 'before',
    text: 'Аркадий находился севернее Беллы.',
  },
  { id: 'st-bella-seat', type: 'occupiesItem', subject: { type: 'person', id: 'bella' }, itemTypeId: 'seat', text: 'Белла сидела на сиденье трибуны.' },
  { id: 'st-inna-corner', type: 'corner', subject: { type: 'person', id: 'inna' }, text: 'Инна находилась в углу своей зоны.' },
  {
    id: 'st-inna-south',
    type: 'relativePosition',
    subject: { type: 'person', id: 'inna' },
    otherPersonId: 'darya',
    axis: 'row',
    direction: 'after',
    text: 'Инна находилась южнее Дарьи.',
  },
  { id: 'st-veronika-seat', type: 'occupiesItem', subject: { type: 'person', id: 'veronika' }, itemTypeId: 'seat', text: 'Вероника сидела на сиденье трибуны.' },
  { id: 'st-veronika-parity', type: 'parity', subject: { type: 'person', id: 'veronika' }, axis: 'col', parity: 'even', text: 'Вероника находилась в столбце с чётным номером.' },
  // — Домашняя половина: убийца —
  { id: 'st-grigory-home', type: 'roomMembership', subject: { type: 'person', id: 'grigory' }, roomId: 'home', text: 'Григорий находился на домашней половине поля.' },
  {
    id: 'st-grigory-east',
    type: 'relativePosition',
    subject: { type: 'person', id: 'grigory' },
    otherPersonId: 'zhanna',
    axis: 'col',
    direction: 'after',
    offset: 5,
    text: 'Григорий находился ровно на пять столбцов восточнее Жанны.',
  },
  // — Беговые дорожки —
  { id: 'st-darya-treadmill', type: 'adjacency', subject: { type: 'person', id: 'darya' }, itemTypeId: 'treadmill', text: 'Дарья находилась рядом с беговым тренажёром.' },
  // — Гостевая половина —
  { id: 'st-efim-away', type: 'roomMembership', subject: { type: 'person', id: 'efim' }, roomId: 'away', text: 'Ефим находился на гостевой половине поля.' },
  { id: 'st-efim-ball', type: 'adjacency', subject: { type: 'person', id: 'efim' }, itemTypeId: 'ball', text: 'Ефим находился рядом с мячом.' },
  { id: 'st-zhanna-away', type: 'roomMembership', subject: { type: 'person', id: 'zhanna' }, roomId: 'away', text: 'Жанна находилась на гостевой половине поля.' },
  { id: 'st-zakhar-goal', type: 'occupiesItem', subject: { type: 'person', id: 'zakhar' }, itemTypeId: 'goal', text: 'Захар стоял в воротах.' },
  { id: 'st-zakhar-parity', type: 'parity', subject: { type: 'person', id: 'zakhar' }, axis: 'row', parity: 'even', text: 'Захар находился в ряду с чётным номером.' },
];

export const stadiumLevel: Level = {
  meta: { id: 'stadium-01', title: 'Финальный свисток', theme: 'stadium', difficulty: 8, maxFullyPinnedPeople: 0, menuTag: 'hard' },
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
