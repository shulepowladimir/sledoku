import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 6;

const rooms: Room[] = [
  { id: 'mainHall', name: 'Главный зал', floorTexture: 'marble' },
  { id: 'sculptureGallery', name: 'Галерея скульптур', floorTexture: 'tile' },
  { id: 'giftShop', name: 'Сувенирный киоск', floorTexture: 'carpet' },
  { id: 'serviceRoom', name: 'Служебное помещение', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [];

const itemTypes: ItemType[] = [
  { id: 'paintingStand', label: 'Стенд с картиной', kind: 'decorative', icon: 'paintingStand' },
  { id: 'sculpture', label: 'Скульптура на постаменте', kind: 'decorative', icon: 'sculpture' },
  ItemLibrary.sofa('Диванчик для посетителей'),
  ItemLibrary.souvenirRack('Стеллаж с сувенирами'),
  ItemLibrary.ladder(),
  ItemLibrary.chair('Стул смотрителя'),
  ItemLibrary.globe(),
  ItemLibrary.plant(),
  ItemLibrary.portrait(),
  ItemLibrary.box(),
  ItemLibrary.workbench(),
  ItemLibrary.trashcan(),
];

const items: Item[] = [
  { id: 'item-painting-1', typeId: 'paintingStand', cells: [cellId(0, 2)] },
  { id: 'item-painting-2', typeId: 'paintingStand', cells: [cellId(2, 2)] },
  { id: 'item-sculpture', typeId: 'sculpture', cells: [cellId(1, 4), cellId(1, 5)] },
  { id: 'item-sofa', typeId: 'sofa', cells: [cellId(3, 3)] },
  { id: 'item-souvenir-rack', typeId: 'souvenirRack', cells: [cellId(5, 3)] },
  { id: 'item-ladder', typeId: 'ladder', cells: [cellId(4, 1)] },
  { id: 'item-chair', typeId: 'chair', cells: [cellId(5, 0)] },
  { id: 'item-globe', typeId: 'globe', cells: [cellId(1, 0)] },
  { id: 'item-plant', typeId: 'plant', cells: [cellId(0, 4)] },
  { id: 'item-portrait', typeId: 'portrait', cells: [cellId(1, 2)] },
  { id: 'item-box-k1', typeId: 'box', cells: [cellId(4, 4)] },
  { id: 'item-box-k2', typeId: 'box', cells: [cellId(4, 5)] },
  { id: 'item-workbench', typeId: 'workbench', cells: [cellId(3, 0)] },
  { id: 'item-trashcan', typeId: 'trashcan', cells: [cellId(5, 1)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four jagged zones, deliberately reshaped from the apartment's layout: main hall (H),
// sculpture gallery (S), gift kiosk (K), service room (F).
const ROOM_ROWS = ['HHHHHS', 'HHHSSS', 'FHHSSS', 'FFHSSK', 'FFFKKK', 'FFKKKK'];
const ROOM_BY_LETTER: Record<string, string> = {
  H: 'mainHall',
  S: 'sculptureGallery',
  K: 'giftShop',
  F: 'serviceRoom',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
);

const people: Person[] = [
  { id: 'arkady', name: 'Аркадий', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'beatrisa', name: 'Беатриса', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vsevolod', name: 'Всеволод', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true },
  { id: 'hristina', name: 'Христина', initialLetter: 'Х', gender: 'female', color: '#2bc4c4', isVictim: true, isMurderer: false },
];

const solution: Record<PersonId, CellId> = {
  galina: cellId(0, 0),
  arkady: cellId(1, 1),
  vsevolod: cellId(2, 5),
  beatrisa: cellId(3, 4),
  hristina: cellId(4, 3),
  demyan: cellId(5, 2),
};

const clues: Clue[] = [
  {
    id: 'm1',
    type: 'roomMembership',
    subject: { type: 'person', id: 'galina' },
    roomId: 'mainHall',
    text: 'Галина находилась в главном зале.',
  },
  {
    id: 'm2',
    type: 'position',
    subject: { type: 'person', id: 'arkady' },
    axis: 'row',
    value: 1,
    text: 'Аркадий находился во 2-м ряду.',
  },
  {
    id: 'm2b',
    type: 'relativePosition',
    subject: { type: 'person', id: 'arkady' },
    otherPersonId: 'demyan',
    axis: 'col',
    direction: 'before',
    offset: 1,
    text: 'Аркадий находился ровно на один столбец западнее Демьяна.',
  },
  {
    id: 'm3',
    type: 'adjacency',
    subject: { type: 'person', id: 'vsevolod' },
    itemTypeId: 'sculpture',
    text: 'Всеволод находился рядом со скульптурой.',
  },
  {
    id: 'm4',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'beatrisa' },
    otherPersonId: 'vsevolod',
    text: 'Беатриса находилась в одной зоне с Всеволодом.',
  },
  {
    id: 'm5',
    type: 'adjacency',
    subject: { type: 'person', id: 'demyan' },
    itemTypeId: 'souvenirRack',
    text: 'Демьян находился рядом со стеллажом с сувенирами.',
  },
  {
    id: 'm7',
    type: 'roomParity',
    parity: 'even',
    text: 'Во всех зонах музея оказалось чётное число людей.',
  },
];

export const museumLevel: Level = {
  meta: { id: 'museum-01', title: 'Ночное дежурство в музее', theme: 'museum', difficulty: 3, maxFullyPinnedPeople: 0 },
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
