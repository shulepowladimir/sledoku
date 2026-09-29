import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'northRow', name: 'Северный ряд', floorTexture: 'grass', labelPosition: 'bottom', labelAlign: 'left' },
  { id: 'oldRow', name: 'Старый ряд', floorTexture: 'sand', labelPosition: 'bottom', labelAlign: 'right' },
  { id: 'westRow', name: 'Западный ряд', floorTexture: 'grass', labelPosition: 'bottom', labelAlign: 'left' },
  { id: 'farLot', name: 'Дальний участок', floorTexture: 'sand', labelPosition: 'bottom', labelAlign: 'right' },
  { id: 'loopRoad', name: 'Петля-проезд', floorTexture: 'dirt', labelPosition: 'bottom' },
  { id: 'commonYard', name: 'Общий двор', floorTexture: 'grass', labelPosition: 'bottom' },
  { id: 'laundry', name: 'Прачечная', floorTexture: 'dirt', labelPosition: 'bottom' },
  { id: 'scrub', name: 'Заросшая обочина', floorTexture: 'sand', labelPosition: 'bottom', labelAlign: 'right' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'dirt-track', label: 'Грязевая колея', textureKey: 'dirt' },
  { id: 'grass-runoff', label: 'Трава у двора', textureKey: 'grass' },
  { id: 'sand-drift', label: 'Песчаный нанос', textureKey: 'sand' },
];

const itemTypes: ItemType[] = [
  { id: 'trailer', label: 'Трейлер', kind: 'occupiable', icon: 'trailer' },
  { id: 'tent', label: 'Палатка', kind: 'occupiable', icon: 'tent' },
  { id: 'bushHedge', label: 'Кусты', kind: 'decorative', icon: 'bushHedge', render: 'tile' },
  { id: 'stump', label: 'Пень', kind: 'decorative', icon: 'stump' },
  { id: 'barbecue', label: 'Барбекю', kind: 'decorative', icon: 'barbecue' },
  { id: 'laundryLine', label: 'Бельё на верёвке', kind: 'decorative', icon: 'laundryLine' },
  { id: 'tumbleweed', label: 'Перекати-поле', kind: 'decorative', icon: 'tumbleweed' },
  ItemLibrary.washer(),
  ItemLibrary.motorcycle(),
  ItemLibrary.beachChair(),
  ItemLibrary.broadleafTree(),
  ItemLibrary.cat(),
  ItemLibrary.wagon(),
  { ...ItemLibrary.wheel('Колесо повозки'), kind: 'decorative' },
  ItemLibrary.basketball(),
  ItemLibrary.hoop(),
  ItemLibrary.sofa(),
  ItemLibrary.hammock(),
  ItemLibrary.rock(),
  ItemLibrary.cactus(),
];

const items: Item[] = [
  { id: 'trailer-north-1', typeId: 'trailer', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'trailer-north-2', typeId: 'trailer', cells: [cellId(2, 0), cellId(2, 1)] },
  { id: 'beach-chair-north', typeId: 'beachChair', cells: [cellId(1, 0)] },
  { id: 'cat-north', typeId: 'cat', cells: [cellId(1, 1)] },
  { id: 'bush-north', typeId: 'bushHedge', cells: [cellId(0, 2), cellId(1, 2), cellId(1, 3)] },
  { id: 'tree-north', typeId: 'broadleafTree', cells: [cellId(2, 2)] },

  { id: 'trailer-old-1', typeId: 'trailer', cells: [cellId(0, 8), cellId(0, 9)] },
  { id: 'trailer-old-2', typeId: 'trailer', cells: [cellId(2, 9), cellId(2, 10)] },
  { id: 'motorcycle-old', typeId: 'motorcycle', cells: [cellId(1, 6)] },
  { id: 'wagon-old', typeId: 'wagon', cells: [cellId(1, 7)] },
  { id: 'wheel-old', typeId: 'wheel', cells: [cellId(1, 8)] },

  { id: 'trailer-west-1', typeId: 'trailer', cells: [cellId(7, 0), cellId(7, 1)] },
  { id: 'trailer-west-2', typeId: 'trailer', cells: [cellId(10, 1), cellId(10, 2)] },
  { id: 'barbecue-west-north', typeId: 'barbecue', cells: [cellId(5, 0)] },
  { id: 'barbecue-west', typeId: 'barbecue', cells: [cellId(5, 1)] },
  { id: 'motorcycle-west', typeId: 'motorcycle', cells: [cellId(6, 1)] },
  { id: 'beach-chair-west', typeId: 'beachChair', cells: [cellId(6, 2)] },
  { id: 'hammock-west', typeId: 'hammock', cells: [cellId(7, 2)] },
  { id: 'cat-west', typeId: 'cat', cells: [cellId(8, 2)] },
  { id: 'tree-west', typeId: 'broadleafTree', cells: [cellId(9, 2)] },
  { id: 'bush-west', typeId: 'bushHedge', cells: [cellId(8, 0), cellId(8, 1), cellId(9, 0)] },

  { id: 'trailer-far-1', typeId: 'trailer', cells: [cellId(3, 8), cellId(3, 9)] },
  { id: 'trailer-far-2', typeId: 'trailer', cells: [cellId(6, 9), cellId(6, 10)] },
  { id: 'tent-far', typeId: 'tent', cells: [cellId(4, 8), cellId(4, 9)] },
  { id: 'cactus-far-1', typeId: 'cactus', cells: [cellId(5, 8)] },
  { id: 'cactus-far-2', typeId: 'cactus', cells: [cellId(5, 10)] },

  { id: 'rock-road', typeId: 'rock', cells: [cellId(3, 7)] },
  { id: 'stump-road', typeId: 'stump', cells: [cellId(7, 3)] },

  { id: 'barbecue-yard', typeId: 'barbecue', cells: [cellId(5, 5)] },
  { id: 'hoop-yard', typeId: 'hoop', cells: [cellId(5, 4)] },
  { id: 'basketball-yard', typeId: 'basketball', cells: [cellId(5, 6)] },
  { id: 'sofa-yard', typeId: 'sofa', cells: [cellId(4, 4)] },
  { id: 'beach-chair-yard-1', typeId: 'beachChair', cells: [cellId(4, 6)] },
  { id: 'beach-chair-yard-2', typeId: 'beachChair', cells: [cellId(6, 4)] },

  { id: 'laundry-line-1', typeId: 'laundryLine', cells: [cellId(8, 3), cellId(8, 4)] },
  { id: 'washer-laundry', typeId: 'washer', cells: [cellId(9, 3)] },
  { id: 'laundry-line-2', typeId: 'laundryLine', cells: [cellId(10, 5), cellId(10, 6)] },

  { id: 'tree-scrub', typeId: 'broadleafTree', cells: [cellId(7, 10)] },
  { id: 'rock-scrub', typeId: 'rock', cells: [cellId(7, 9)] },
  { id: 'tent-scrub', typeId: 'tent', cells: [cellId(8, 9), cellId(8, 10)] },
  { id: 'tumbleweed-scrub', typeId: 'tumbleweed', cells: [cellId(9, 10)] },
  { id: 'hammock-scrub', typeId: 'hammock', cells: [cellId(10, 8)] },
  { id: 'wagon-scrub', typeId: 'wagon', cells: [cellId(10, 9)] },
  { id: 'stump-scrub', typeId: 'stump', cells: [cellId(10, 10)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((id) => [id, item.id] as const)));

const ROOM_ROWS = [
  'AAAAARCCCCC',
  'AAAAARCCCCC',
  'AAAAARCCCCC',
  'BBBRRRRRDDD',
  'BBBRYYYRDDD',
  'BBBRYYYRDDD',
  'BBBRYYYRDDD',
  'BBBRRRRRSSS',
  'BBBLLLLLSSS',
  'BBBLLLLLSSS',
  'BBBLLLLLSSS',
];

const ROOM_BY_LETTER: Record<string, string> = {
  A: 'northRow',
  C: 'oldRow',
  B: 'westRow',
  D: 'farLot',
  R: 'loopRoad',
  Y: 'commonYard',
  L: 'laundry',
  S: 'scrub',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const DIRT_TRACK_CELLS = new Set([cellId(0, 3), cellId(0, 4), cellId(1, 4), cellId(2, 4)]);
const GRASS_RUNOFF_CELLS = new Set([cellId(4, 3), cellId(5, 3), cellId(6, 3)]);
const SAND_DRIFT_CELLS = new Set([
  cellId(4, 7),
  cellId(5, 7),
  cellId(6, 7),
  cellId(7, 7),
]);

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (DIRT_TRACK_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'dirt-track' };
  if (GRASS_RUNOFF_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'grass-runoff' };
  if (SAND_DRIFT_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'sand-drift' };
  return cell;
});

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: true },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'klim', name: 'Клим', initialLetter: 'К', gender: 'male', color: '#8f7ca8', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(3, 1),
  boris: cellId(0, 3),
  viktor: cellId(1, 10),
  galina: cellId(2, 6),
  denis: cellId(6, 5),
  esenya: cellId(4, 0),
  zhdan: cellId(8, 7),
  zoya: cellId(7, 8),
  inna: cellId(5, 2),
  klim: cellId(10, 4),
  khariton: cellId(9, 9),
};

const clues: Clue[] = [
  {
    id: 'tp-vowels-one-zone',
    type: 'letterGroupRoom',
    letterClass: 'vowel',
    text: 'Все, чьи имена начинались на гласную, находились в одной зоне.',
  },
  {
    id: 'tp-barbecues-have-neighbors',
    type: 'itemAdjacencyOccupancy',
    itemTypeId: 'barbecue',
    text: 'У каждого барбекю рядом находился хотя бы один человек.',
  },
  {
    id: 'tp-anna-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'anna' },
    wallDirection: 'north',
    text: 'Анна стояла у северной стены своей зоны.',
  },
  {
    id: 'tp-boris-dirt-track',
    type: 'floorFeature',
    subject: { type: 'person', id: 'boris' },
    featureId: 'dirt-track',
    text: 'Борис стоял на грязевой колее.',
  },
  {
    id: 'tp-boris-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'boris' },
    wallDirection: 'north',
    text: 'Борис стоял у северной стены своей зоны.',
  },
  {
    id: 'tp-viktor-old-row',
    type: 'roomMembership',
    subject: { type: 'person', id: 'viktor' },
    roomId: 'oldRow',
    text: 'Виктор находился в Старом ряду.',
  },
  {
    id: 'tp-viktor-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'viktor' },
    wallDirection: 'east',
    text: 'Виктор стоял у восточной стены своей зоны.',
  },
  {
    id: 'tp-galina-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'galina' },
    wallDirection: 'south',
    text: 'Галина стояла у южной стены своей зоны.',
  },
  {
    id: 'tp-galina-west-of-viktor',
    type: 'relativePosition',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'viktor',
    axis: 'col',
    direction: 'before',
    offset: 4,
    text: 'Галина находилась ровно на четыре столбца западнее Виктора.',
  },
  {
    id: 'tp-denis-yard',
    type: 'roomMembership',
    subject: { type: 'person', id: 'denis' },
    roomId: 'commonYard',
    text: 'Денис находился в общем дворе.',
  },
  {
    id: 'tp-esenya-trailer-line',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'esenya' },
    itemTypeId: 'trailer',
    text: 'Есения находилась в одном ряду или столбце с трейлером.',
  },
  {
    id: 'tp-esenya-one-row-south-of-anna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'esenya' },
    otherPersonId: 'anna',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Есения находилась ровно на один ряд южнее Анны.',
  },
  {
    id: 'tp-inna-boundary-west-row-road',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'inna' },
    roomId: 'westRow',
    otherRoomId: 'loopRoad',
    text: 'Инна находилась на границе Западного ряда и проезда.',
  },
  {
    id: 'tp-zhdan-laundry-line',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zhdan' },
    itemTypeId: 'laundryLine',
    text: 'Ждан находился в зоне, где сушили бельё.',
  },
  {
    id: 'tp-zoya-tumbleweed',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zoya' },
    itemTypeId: 'tumbleweed',
    text: 'Зоя находилась в одной зоне с перекати-полем.',
  },
  {
    id: 'tp-zoya-three-rows-north-of-klim',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'klim',
    axis: 'row',
    direction: 'before',
    offset: 3,
    text: 'Зоя находилась ровно на три ряда севернее Клима.',
  },
  {
    id: 'tp-klim-washer-zone',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'klim' },
    itemTypeId: 'washer',
    text: 'Клим находился в зоне со стиральной машиной.',
  },
  {
    id: 'tp-zhdan-east-of-klim',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'klim',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Ждан находился ровно на три столбца восточнее Клима.',
  },
  {
    id: 'tp-zhdan-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'zhdan' },
    axis: 'row',
    parity: 'odd',
    text: 'Ждан находился в нечётном ряду.',
  },
  {
    id: 'tp-klim-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'klim' },
    axis: 'row',
    parity: 'odd',
    text: 'Клим находился в нечётном ряду.',
  },
];

export const trailerParkLevel: Level = {
  meta: {
    id: 'trailerpark-01',
    title: 'Трейлер и развязка',
    theme: 'trailerpark',
    difficulty: 8,
    maxFullyPinnedPeople: 0,
  },
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
