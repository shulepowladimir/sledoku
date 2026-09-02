import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 10;

const rooms: Room[] = [
  { id: 'electronics', name: 'Магазин электроники', floorTexture: 'tile' },
  { id: 'atrium', name: 'Атриум', floorTexture: 'marble' },
  { id: 'clothing', name: 'Бутик одежды', floorTexture: 'wood' },
  { id: 'cinema', name: 'Кинозал', floorTexture: 'carpet' },
];

const floorFeatures: FloorFeature[] = [{ id: 'mall-fountain', label: 'Фонтанный бассейн', textureKey: 'water' }];
const FOUNTAIN_CELLS = new Set([cellId(5, 3), cellId(5, 4), cellId(6, 3), cellId(6, 4)]);

const itemTypes: ItemType[] = [
  ItemLibrary.computer(),
  ItemLibrary.kassa(),
  { id: 'mannequin', label: 'Манекен', kind: 'decorative', icon: 'mannequin' },
  ItemLibrary.bench(),
  ItemLibrary.kiosk(),
  ItemLibrary.lamppost(),
  ItemLibrary.plant(),
  ItemLibrary.trashcan(),
  ItemLibrary.rack(),
  ItemLibrary.box(),
  ItemLibrary.chair(),
];

const items: Item[] = [
  // Electronics
  { id: 'item-computer-1', typeId: 'computer', cells: [cellId(0, 1)] },
  { id: 'item-computer-2', typeId: 'computer', cells: [cellId(0, 3)] },
  { id: 'item-computer-3', typeId: 'computer', cells: [cellId(3, 0)] },
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(5, 0)] },
  { id: 'item-box-1', typeId: 'box', cells: [cellId(2, 0)] },
  { id: 'item-box-2', typeId: 'box', cells: [cellId(2, 1)] },
  { id: 'item-plant-1', typeId: 'plant', cells: [cellId(1, 0)] },
  { id: 'item-plant-2', typeId: 'plant', cells: [cellId(4, 1)] },
  { id: 'item-computer-4', typeId: 'computer', cells: [cellId(1, 1)] },
  { id: 'item-box-4', typeId: 'box', cells: [cellId(4, 0)] },
  // Atrium
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(2, 5)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(4, 4)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(0, 6)] },
  { id: 'item-kiosk', typeId: 'kiosk', cells: [cellId(1, 5)] },
  { id: 'item-lamppost-1', typeId: 'lamppost', cells: [cellId(0, 4)] },
  { id: 'item-lamppost-2', typeId: 'lamppost', cells: [cellId(8, 4)] },
  { id: 'item-plant-3', typeId: 'plant', cells: [cellId(0, 8)] },
  { id: 'item-plant-4', typeId: 'plant', cells: [cellId(6, 1)] },
  { id: 'item-trashcan-1', typeId: 'trashcan', cells: [cellId(1, 7)] },
  { id: 'item-trashcan-2', typeId: 'trashcan', cells: [cellId(7, 4)] },
  { id: 'item-plant-6', typeId: 'plant', cells: [cellId(2, 4)] },
  { id: 'item-lamppost-3', typeId: 'lamppost', cells: [cellId(6, 2)] },
  { id: 'item-plant-7', typeId: 'plant', cells: [cellId(8, 5)] },
  // Clothing
  { id: 'item-rack', typeId: 'rack', cells: [cellId(0, 9), cellId(1, 9)] },
  { id: 'item-mannequin-1', typeId: 'mannequin', cells: [cellId(3, 8)] },
  { id: 'item-mannequin-2', typeId: 'mannequin', cells: [cellId(7, 7)] },
  { id: 'item-mannequin-3', typeId: 'mannequin', cells: [cellId(9, 8)] },
  { id: 'item-mannequin-4', typeId: 'mannequin', cells: [cellId(6, 7)] },
  { id: 'item-plant-5', typeId: 'plant', cells: [cellId(2, 8)] },
  { id: 'item-trashcan-3', typeId: 'trashcan', cells: [cellId(8, 7)] },
  { id: 'item-box-3', typeId: 'box', cells: [cellId(6, 6)] },
  // Cinema
  { id: 'item-chair-1', typeId: 'chair', cells: [cellId(7, 0)] },
  { id: 'item-chair-2', typeId: 'chair', cells: [cellId(7, 1)] },
  { id: 'item-chair-3', typeId: 'chair', cells: [cellId(9, 1)] },
  { id: 'item-trashcan-4', typeId: 'trashcan', cells: [cellId(9, 5)] },
  { id: 'item-kassa-2', typeId: 'kassa', cells: [cellId(8, 2)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Four zones on a 10x10 board: electronics (E) top-left wedge, cinema (K) bottom-left wedge,
// clothing (C) the diagonal band wrapping the right/bottom edge, atrium (A) the large open
// band between them all — a mall walkway connecting every shop.
const ROOM_ROWS = [
  'EEEEAAAAAC',
  'EEEEAAAACC',
  'EEEAAAAACC',
  'EEEAAAACCC',
  'EEAAAAACCC',
  'EAAAAACCCC',
  'AAAAACCCCC',
  'KKAAACCCCC',
  'KKKKAACCCC',
  'KKKKKKCCCC',
];
const ROOM_BY_LETTER: Record<string, string> = { E: 'electronics', A: 'atrium', C: 'clothing', K: 'cinema' };

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (FOUNTAIN_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'mall-fountain' } : cell));

// Ночное закрытие ТЦ. Посетители — гласные (Аристарх/Елисей/Игорь), сотрудники — согласные
// (Бронислава/Влада/Григорий/Дина/Жозефина/Захар + жертва Хиония). Убийца Захар застал
// посетительницу Хионию в кинозале; жертва не упоминается ни в одной личной клю.
const people: Person[] = [
  { id: 'aristarh', name: 'Аристарх', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'bronislava', name: 'Бронислава', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'vlada', name: 'Влада', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'dina', name: 'Дина', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'elisey', name: 'Елисей', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'zhozefina', name: 'Жозефина', initialLetter: 'Ж', gender: 'female', color: '#8a5a3a', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'zahar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: true, roles: ['staff'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#e0a94a', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'hionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#7cc9e8', isVictim: true, isMurderer: false, roles: ['staff'] },
];

const solution: Record<PersonId, CellId> = {
  grigory: cellId(0, 0),
  dina: cellId(1, 2),
  aristarh: cellId(2, 5),
  vlada: cellId(3, 6),
  elisey: cellId(4, 7),
  bronislava: cellId(5, 8),
  zhozefina: cellId(6, 9),
  igor: cellId(7, 3),
  zahar: cellId(8, 1),
  hionia: cellId(9, 4),
};

const clues: Clue[] = [
  // — Правила ночного закрытия ТЦ —
  {
    id: 'm22',
    type: 'letterRole',
    letterClass: 'vowel',
    roleId: 'visitor',
    text: 'Все, чьё имя начиналось на гласную букву, были посетителями торгового центра.',
  },
  {
    id: 'm23',
    type: 'roleZoneLimit',
    roleId: 'visitor',
    roomIds: ['electronics', 'cinema'],
    maxCount: 0,
    text: 'Посетители не допускались в магазин электроники и кинозал.',
  },
  {
    id: 'm24',
    type: 'roleZoneMin',
    roleId: 'staff',
    roomIds: ['electronics', 'clothing', 'cinema'],
    minCount: 1,
    text: 'Ни один магазин не остался без сотрудника.',
  },
  {
    id: 'm2',
    type: 'corner',
    subject: { type: 'person', id: 'grigory' },
    text: 'Григорий находился в углу своей зоны.',
  },
  {
    id: 'm4',
    type: 'relativePosition',
    subject: { type: 'person', id: 'dina' },
    otherPersonId: 'grigory',
    axis: 'col',
    direction: 'after',
    offset: 2,
    text: 'Дина находилась ровно на два столбца восточнее Григория.',
  },
  {
    id: 'm5',
    type: 'adjacency',
    subject: { type: 'person', id: 'aristarh' },
    itemTypeId: 'kiosk',
    text: 'Аристарх находился рядом с киоском.',
  },
  {
    id: 'm6',
    type: 'parity',
    subject: { type: 'person', id: 'aristarh' },
    axis: 'col',
    parity: 'even',
    text: 'Аристарх находился в столбце с чётным номером.',
  },
  {
    id: 'm21',
    type: 'relativePosition',
    subject: { type: 'person', id: 'aristarh' },
    otherPersonId: 'grigory',
    axis: 'row',
    direction: 'after',
    text: 'Аристарх находился южнее Григория.',
  },
  {
    id: 'm7',
    type: 'wallSide',
    subject: { type: 'person', id: 'vlada' },
    wallDirection: 'east',
    text: 'Влада находилась у восточной стены своей зоны.',
  },
  {
    id: 'm8',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vlada' },
    otherPersonId: 'aristarh',
    axis: 'col',
    direction: 'after',
    offset: 1,
    text: 'Влада находилась ровно на один столбец восточнее Аристарха.',
  },
  {
    id: 'm9',
    type: 'wallSide',
    subject: { type: 'person', id: 'igor' },
    wallDirection: 'south',
    text: 'Игорь находился у южной стены своей зоны.',
  },
  {
    id: 'm10',
    type: 'adjacency',
    subject: { type: 'person', id: 'igor' },
    itemTypeId: 'trashcan',
    text: 'Игорь находился рядом с урной.',
  },
  {
    id: 'm11',
    type: 'wallSide',
    subject: { type: 'person', id: 'elisey' },
    wallDirection: 'west',
    text: 'Елисей находился у западной стены своей зоны.',
  },
  {
    id: 'm13',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bronislava' },
    otherPersonId: 'elisey',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Бронислава находилась ровно на один ряд южнее Елисея.',
  },
  {
    id: 'm14',
    type: 'parity',
    subject: { type: 'person', id: 'bronislava' },
    axis: 'col',
    parity: 'odd',
    text: 'Бронислава находилась в столбце с нечётным номером.',
  },
  {
    id: 'm15',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhozefina' },
    wallDirection: 'east',
    text: 'Жозефина находилась у восточной стены своей зоны.',
  },
  {
    id: 'm16',
    type: 'parity',
    subject: { type: 'person', id: 'zhozefina' },
    axis: 'row',
    parity: 'odd',
    text: 'Жозефина находилась в ряду с нечётным номером.',
  },
  {
    id: 'm17',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'zhozefina' },
    otherPersonId: 'bronislava',
    text: 'Жозефина находилась в одной зоне с Брониславой.',
  },
  {
    id: 'm18',
    type: 'adjacency',
    subject: { type: 'person', id: 'zahar' },
    itemTypeId: 'chair',
    text: 'Захар находился рядом со стулом.',
  },
  {
    id: 'm19',
    type: 'parity',
    subject: { type: 'person', id: 'zahar' },
    axis: 'row',
    parity: 'odd',
    text: 'Захар находился в ряду с нечётным номером.',
  },
  {
    id: 'm20',
    type: 'itemTypeGender',
    itemTypeId: 'bench',
    gender: 'male',
    text: 'Женщины не садились на скамейки в атриуме.',
  },
];

export const mallLevel: Level = {
  meta: { id: 'mall-01', title: 'Закрытие торгового центра', theme: 'mall', difficulty: 8, maxFullyPinnedPeople: 0 },
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
