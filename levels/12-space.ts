import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 8;

const rooms: Room[] = [
  { id: 'bridge', name: 'Рубка управления', floorTexture: 'tile' },
  { id: 'greenhouse', name: 'Оранжерея', floorTexture: 'grass' },
  { id: 'quarters', name: 'Жилой отсек', floorTexture: 'metal' },
];

const floorFeatures: FloorFeature[] = [{ id: 'scorch-mark', label: 'Обгоревший участок палубы', textureKey: 'dirt' }];
const SCORCH_CELLS = new Set([cellId(1, 2), cellId(1, 3)]);

const itemTypes: ItemType[] = [
  { id: 'airlock', label: 'Шлюзовой люк', kind: 'decorative', icon: 'airlock' },
  { id: 'satelliteDish', label: 'Спутниковая тарелка', kind: 'decorative', icon: 'satelliteDish' },
  { id: 'cryopod', label: 'Криокапсула', kind: 'decorative', icon: 'cryopod' },
  { id: 'console', label: 'Пульт управления', kind: 'occupiable', icon: 'computer' },
  ItemLibrary.telescope(),
  ItemLibrary.chair(),
  ItemLibrary.workbench(),
  ItemLibrary.bench(),
  ItemLibrary.plant(),
  ItemLibrary.rack('Стеллаж с рассадой'),
  ItemLibrary.barrel('Бак с питательным раствором'),
  ItemLibrary.box('Грузовой контейнер'),
  ItemLibrary.armchair(),
  ItemLibrary.safe('Личный сейф'),
];

const items: Item[] = [
  // Bridge
  { id: 'item-airlock-1', typeId: 'airlock', cells: [cellId(0, 0)] },
  { id: 'item-satellite-dish', typeId: 'satelliteDish', cells: [cellId(0, 2)] },
  { id: 'item-telescope', typeId: 'telescope', cells: [cellId(2, 2)] },
  { id: 'item-console-1', typeId: 'console', cells: [cellId(1, 1)] },
  { id: 'item-console-2', typeId: 'console', cells: [cellId(2, 0)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(3, 0)] },
  // Greenhouse
  { id: 'item-plant-1', typeId: 'plant', cells: [cellId(1, 5)] },
  { id: 'item-plant-2', typeId: 'plant', cells: [cellId(1, 7)] },
  { id: 'item-plant-3', typeId: 'plant', cells: [cellId(4, 4)] },
  { id: 'item-workbench', typeId: 'workbench', cells: [cellId(3, 2)] },
  { id: 'item-bench', typeId: 'bench', cells: [cellId(5, 3)] },
  { id: 'item-rack', typeId: 'rack', cells: [cellId(2, 4)] },
  { id: 'item-barrel', typeId: 'barrel', cells: [cellId(6, 1)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(7, 0)] },
  // Quarters
  { id: 'item-cryopod', typeId: 'cryopod', cells: [cellId(6, 6), cellId(6, 7)] },
  { id: 'item-airlock-2', typeId: 'airlock', cells: [cellId(2, 7)] },
  { id: 'item-armchair', typeId: 'armchair', cells: [cellId(7, 2)] },
  { id: 'item-safe', typeId: 'safe', cells: [cellId(7, 7)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(5, 4)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Three zones on an 8x8 board: the bridge (B) is a tapering wedge in the top-left corner, the
// greenhouse (G) is the large diagonal band filling the middle, and the crew quarters (Q) is a
// wide wedge across the bottom-right corner.
const ROOM_ROWS = [
  'BBBBBGGG',
  'BBBBGGGG',
  'BBBGGGGQ',
  'BBGGGGQQ',
  'GGGGGQQQ',
  'GGGGQQQQ',
  'GGGQQQQQ',
  'GGQQQQQQ',
];
const ROOM_BY_LETTER: Record<string, string> = {
  B: 'bridge',
  G: 'greenhouse',
  Q: 'quarters',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (SCORCH_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'scorch-mark' } : cell));

// Тайна орбитальной станции. Экипаж — вахтенная смена (Ждан и жертва Христофор, буквы Ж..Х);
// остальные — пассажиры исследовательской экспедиции. Убийца Есения — пассажирка.
const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'bogdan', name: 'Богдан', initialLetter: 'Б', gender: 'male', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'vsevolod', name: 'Всеволод', initialLetter: 'В', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: true, roles: ['passenger'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'hristofor', name: 'Христофор', initialLetter: 'Х', gender: 'male', color: '#7cc9e8', isVictim: true, isMurderer: false, roles: ['crew'] },
];

// `npm run scaffold-level -- levels/12-space.ts bridge:3,greenhouse:3,quarters:2` → row→col
// [4, 2, 1, 5, 7, 3, 0, 6] (re-rolled until it also cleared every decorative item cell, since
// the tool only reasons about room geometry, not items — see notes.md §3.1).
const solution: Record<PersonId, CellId> = {
  zhdan: cellId(0, 4),
  vsevolod: cellId(1, 2),
  aglaya: cellId(2, 1),
  demid: cellId(3, 5),
  hristofor: cellId(4, 7),
  galina: cellId(5, 3),
  bogdan: cellId(6, 0),
  esenia: cellId(7, 6),
};

const clues: Clue[] = [
  // — Правила станции —
  {
    id: 'sp-r1',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Е',
    roleId: 'passenger',
    text: 'Все с Аглаи по Есению были пассажирами экспедиции, остальные — членами экипажа станции.',
  },
  {
    id: 'sp-r2',
    type: 'roleZoneMin',
    roleId: 'crew',
    roomIds: ['bridge'],
    minCount: 1,
    text: 'Рубка управления не оставалась без члена экипажа.',
  },
  { id: 'sp1', type: 'corner', subject: { type: 'person', id: 'zhdan' }, text: 'Ждан находился в углу своей зоны.' },
  {
    id: 'sp2',
    type: 'floorFeature',
    subject: { type: 'person', id: 'vsevolod' },
    featureId: 'scorch-mark',
    text: 'Всеволод находился на обгоревшем участке палубы.',
  },
  {
    id: 'sp3',
    type: 'adjacency',
    subject: { type: 'person', id: 'aglaya' },
    itemTypeId: 'console',
    text: 'Аглая находилась рядом с пультом управления.',
  },
  {
    id: 'sp4',
    type: 'corner',
    subject: { type: 'person', id: 'demid' },
    text: 'Демид находился в углу своей зоны.',
  },
  {
    id: 'sp5',
    type: 'wallSide',
    subject: { type: 'person', id: 'galina' },
    wallDirection: 'south',
    text: 'Галина находилась у южной стены своей зоны.',
  },
  {
    id: 'sp6',
    type: 'wallSide',
    subject: { type: 'person', id: 'bogdan' },
    wallDirection: 'west',
    text: 'Богдан находился у западной стены своей зоны.',
  },
  {
    id: 'sp7',
    type: 'parity',
    subject: { type: 'person', id: 'esenia' },
    axis: 'row',
    parity: 'even',
    text: 'Есения находилась в ряду с чётным номером.',
  },
  {
    id: 'sp11',
    type: 'relativePosition',
    subject: { type: 'person', id: 'demid' },
    otherPersonId: 'galina',
    axis: 'row',
    direction: 'before',
    offset: 2,
    text: 'Демид находился ровно на два ряда севернее Галины.',
  },
  {
    id: 'sp12',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'demid',
    text: 'Галина находилась в одной зоне с Демидом.',
  },
  {
    id: 'sp13',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'bogdan' },
    otherPersonId: 'demid',
    text: 'Богдан находился в одной зоне с Демидом.',
  },
];

export const spaceLevel: Level = {
  meta: { id: 'space-01', title: 'Тайна орбитальной станции', theme: 'space', difficulty: 10, maxFullyPinnedPeople: 0 },
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
