import type { Clue } from '../src/types/clue';
import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;
const GRID = [
  '111111111С',
  '11111111СС',
  'ППППППППСС',
  'ППППППППСС',
  'РРРРРРРРРР',
  'РРРРРРРРРР',
  'ЛЛЛЛЛЛЛЛЛЛ',
  'ЛЛЛЛЛЛЛЛЛЛ',
  '2222222222',
  '2222222222',
];

const roomByCode: Record<string, Room> = {
  '1': { id: 'upper-shoulder', name: 'Верхняя обочина', floorTexture: 'grass' },
  С: { id: 'exit-ramp', name: 'Съезд', floorTexture: 'asphalt' },
  П: { id: 'northbound-lanes', name: 'Поток направо', floorTexture: 'asphalt' },
  Р: { id: 'divider', name: 'Разделитель', floorTexture: 'concrete' },
  Л: { id: 'southbound-lanes', name: 'Поток налево', floorTexture: 'asphalt' },
  '2': { id: 'lower-shoulder', name: 'Нижняя обочина', floorTexture: 'grass' },
};

const rooms = Object.values(roomByCode);

function roomForCell(row: number, col: number): string {
  return roomByCode[GRID[row][col]].id;
}

const itemTypes: ItemType[] = [
  ItemLibrary.car(),
  ItemLibrary.motorcycle(),
  ItemLibrary.tree('Дерево'),
  ItemLibrary.townhouse(),
  ItemLibrary.stump(),
  ItemLibrary.bench(),
  ItemLibrary.trashcan(),
  ItemLibrary.rock(),
  ItemLibrary.trafficCone(),
  ItemLibrary.tractor('Трактор', { kind: 'occupiable' }),
  ItemLibrary.roadBarrier(),
  ItemLibrary.toolbox(),
  ItemLibrary.tireStack(),
  ItemLibrary.trafficSign(),
];

type Placement = {
  id: string;
  typeId: string;
  row: number;
  col: number;
  span?: number;
  iconVariant?: string;
  flipHorizontal?: boolean;
};

// Coordinates are 0-based here; this preserves the approved 1-based preview layout.
const itemPlacements: Placement[] = [
  // Northbound traffic and exit ramp.
  { id: 'north-car-1', typeId: 'car', row: 2, col: 0, span: 2, flipHorizontal: true },
  { id: 'north-motorcycle-1', typeId: 'motorcycle', row: 2, col: 2, span: 2, flipHorizontal: true },
  { id: 'north-car-2', typeId: 'car', row: 2, col: 4, span: 2, iconVariant: 'raceCar', flipHorizontal: true },
  { id: 'north-car-3', typeId: 'car', row: 2, col: 6, span: 2, iconVariant: 'golfCart', flipHorizontal: true },
  { id: 'ramp-motorcycle', typeId: 'motorcycle', row: 2, col: 8, span: 2, flipHorizontal: true },
  { id: 'ramp-car', typeId: 'car', row: 1, col: 8, span: 2, flipHorizontal: true },
  { id: 'repair-car-1', typeId: 'car', row: 3, col: 0, span: 2, iconVariant: 'raceCar', flipHorizontal: true },
  { id: 'repair-car-2', typeId: 'car', row: 3, col: 2, span: 2, iconVariant: 'golfCart', flipHorizontal: true },
  // Southbound traffic.
  { id: 'south-car-1', typeId: 'car', row: 7, col: 0, span: 2 },
  { id: 'south-car-2', typeId: 'car', row: 6, col: 2, span: 2, iconVariant: 'raceCar' },
  { id: 'south-car-3', typeId: 'car', row: 6, col: 7, span: 2, iconVariant: 'golfCart' },
  { id: 'south-car-4', typeId: 'car', row: 7, col: 8, span: 2 },
  { id: 'south-motorcycle', typeId: 'motorcycle', row: 7, col: 3, span: 2 },
  // Approved roadside dressing.
  { id: 'upper-spruce', typeId: 'tree', row: 0, col: 0 },
  { id: 'upper-townhouse', typeId: 'townhouse', row: 0, col: 3 },
  { id: 'upper-oak', typeId: 'tree', row: 0, col: 6, iconVariant: 'broadleafTree' },
  { id: 'upper-stump', typeId: 'stump', row: 1, col: 1 },
  { id: 'upper-bench', typeId: 'bench', row: 1, col: 4 },
  { id: 'upper-trashcan', typeId: 'trashcan', row: 1, col: 6 },
  { id: 'lower-townhouse', typeId: 'townhouse', row: 8, col: 1 },
  { id: 'lower-spruce', typeId: 'tree', row: 8, col: 4 },
  { id: 'lower-oak', typeId: 'tree', row: 8, col: 7, iconVariant: 'broadleafTree' },
  { id: 'lower-bench', typeId: 'bench', row: 9, col: 2 },
  { id: 'lower-rock', typeId: 'rock', row: 9, col: 6 },
  // Approved roadwork and divider props.
  { id: 'repair-cones-1', typeId: 'trafficCone', row: 3, col: 4 },
  { id: 'repair-cones-2', typeId: 'trafficCone', row: 3, col: 8 },
  { id: 'roadside-tractor', typeId: 'tractor', row: 4, col: 3, span: 2 },
  { id: 'divider-barrier', typeId: 'roadBarrier', row: 5, col: 2 },
  { id: 'roadwork-toolbox', typeId: 'toolbox', row: 4, col: 7 },
  { id: 'divider-tires', typeId: 'tireStack', row: 5, col: 7 },
  { id: 'divider-sign', typeId: 'trafficSign', row: 5, col: 4 },
];

const items: Item[] = itemPlacements.map(({ id, typeId, row, col, span = 1, iconVariant, flipHorizontal }) => ({
  id,
  typeId,
  cells: Array.from({ length: span }, (_, offset) => cellId(row, col + offset)),
  ...(iconVariant ? { iconVariant } : {}),
  ...(flipHorizontal ? { flipHorizontal } : {}),
}));

const itemIdByCell = new Map<CellId, string>();
for (const item of items) {
  for (const id of item.cells) {
    if (itemIdByCell.has(id)) throw new Error(`Overlapping level items at ${id}.`);
    itemIdByCell.set(id, item.id);
  }
}

const repairFeatureId = 'roadwork-zone';
const cells = buildCells(size, roomForCell, (_row, _col) => undefined).map((cell) => ({
  ...cell,
  ...(itemIdByCell.has(cell.id) ? { itemId: itemIdByCell.get(cell.id) } : {}),
  ...(cell.row === 3 && cell.col >= 4 && cell.col <= 8 ? { floorFeatureId: repairFeatureId } : {}),
}));

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'ivan', name: 'Иван', initialLetter: 'И', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#5db578', isVictim: false, isMurderer: true },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(1, 9),
  boris: cellId(0, 4),
  vera: cellId(3, 6),
  galina: cellId(4, 1),
  dmitry: cellId(5, 8),
  egor: cellId(2, 0),
  zhanna: cellId(7, 3),
  ivan: cellId(6, 2),
  kirill: cellId(9, 7),
  khariton: cellId(8, 5),
};

const clues: Clue[] = [
  {
    id: 'trafficjam-vowels-in-cars',
    type: 'letterGroupOccupiesItem',
    letterClass: 'vowel',
    itemTypeId: 'car',
    text: 'Все, чьи имена начинались на гласную букву, находились в машинах.',
  },
  {
    id: 'trafficjam-anna-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'anna' },
    axis: 'col',
    parity: 'even',
    text: 'Анна находилась в столбце с чётным номером.',
  },
  {
    id: 'trafficjam-boris-upper-shoulder',
    type: 'roomMembership',
    subject: { type: 'person', id: 'boris' },
    roomId: 'upper-shoulder',
    text: 'Борис находился на верхней обочине.',
  },
  {
    id: 'trafficjam-boris-east-of-galina',
    type: 'relativePosition',
    subject: { type: 'person', id: 'boris' },
    otherPersonId: 'galina',
    axis: 'col',
    direction: 'after',
    offset: 3,
    text: 'Борис находился на три столбца восточнее Галины.',
  },
  {
    id: 'trafficjam-vera-roadwork',
    type: 'floorFeature',
    subject: { type: 'person', id: 'vera' },
    featureId: repairFeatureId,
    text: 'Вера стояла на участке дорожного ремонта.',
  },
  {
    id: 'trafficjam-galina-odd-row',
    type: 'parity',
    subject: { type: 'person', id: 'galina' },
    axis: 'row',
    parity: 'odd',
    text: 'Галина находилась в ряду с нечётным номером.',
  },
  {
    id: 'trafficjam-galina-same-zone-as-dmitry',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'galina' },
    otherPersonId: 'dmitry',
    text: 'Галина находилась в одной зоне с Дмитрием.',
  },
  {
    id: 'trafficjam-galina-column',
    type: 'position',
    subject: { type: 'person', id: 'galina' },
    axis: 'col',
    value: 1,
    text: 'Галина находилась во втором столбце.',
  },
  {
    id: 'trafficjam-dmitry-divider-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'dmitry' },
    roomId: 'divider',
    otherRoomId: 'southbound-lanes',
    text: 'Дмитрий стоял у границы разделителя и потока налево.',
  },
  {
    id: 'trafficjam-dmitry-ninth-column',
    type: 'position',
    subject: { type: 'person', id: 'dmitry' },
    axis: 'col',
    value: 8,
    text: 'Дмитрий находился в девятом столбце.',
  },
  {
    id: 'trafficjam-egor-south-of-car-occupant',
    type: 'relativeToItemOccupant',
    subject: { type: 'person', id: 'egor' },
    itemTypeId: 'car',
    axis: 'row',
    direction: 'after',
    exactlyOne: true,
    text: 'Егор был южнее ровно одного человека в машине.',
  },
  {
    id: 'trafficjam-egor-six-columns-west-of-vera',
    type: 'relativePosition',
    subject: { type: 'person', id: 'egor' },
    otherPersonId: 'vera',
    axis: 'col',
    direction: 'before',
    offset: 6,
    text: 'Егор был на шесть столбцов западнее Веры.',
  },
  {
    id: 'trafficjam-zhanna-same-zone-as-car',
    type: 'sameRoomAsItem',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'car',
    text: 'Жанна находилась в одной зоне с машиной.',
  },
  {
    id: 'trafficjam-zhanna-south-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhanna' },
    wallDirection: 'south',
    text: 'Жанна стояла у южной стены своей зоны.',
  },
  {
    id: 'trafficjam-zhanna-one-column-east-of-ivan',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'ivan',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Жанна находилась на один столбец восточнее Ивана.',
  },
  {
    id: 'trafficjam-ivan-north-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'ivan' },
    wallDirection: 'north',
    text: 'Иван стоял у северной стены своей зоны.',
  },
  {
    id: 'trafficjam-kirill-adjacent-to-rock',
    type: 'adjacency',
    subject: { type: 'person', id: 'kirill' },
    itemTypeId: 'rock',
    text: 'Кирилл находился рядом с камнем.',
  },
];

const level: Level = {
  meta: {
    id: 'trafficjam-01',
    title: 'Пробка 10 баллов',
    theme: 'trafficJam',
    difficulty: 10,
    maxFullyPinnedPeople: 0,
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [{ id: repairFeatureId, label: 'Дорожный ремонт', textureKey: 'dirt' }],
  cells,
  people,
  solution,
  clues,
};

export const trafficJamLevel = level;
