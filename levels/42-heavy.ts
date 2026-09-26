import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 12;

// «Тяжкое дело»: гиблый окраинный квартал — пустыня с трейлером, куриная
// закусочная (с парковкой и дорожным знаком), адвокатская контора, прачечная,
// автомойка, лаборатория и дом. Твист без скрытых ролей и без общих клю:
// только личные клю + инвариант «наедине» выводят пару Айлер+Хэнк;
// жертва — в гараже, у машины.
const rooms: Room[] = [
  { id: 'desert', name: 'Пустыня', floorTexture: 'sand' },
  { id: 'diner', name: 'Куриная закусочная', floorTexture: 'marble' },
  { id: 'law', name: 'Адвокатская контора', floorTexture: 'linoleum' },
  { id: 'laundry', name: 'Прачечная', floorTexture: 'checker' },
  { id: 'carwash', name: 'Автомойка', floorTexture: 'cobble' },
  { id: 'lab', name: 'Лаборатория', floorTexture: 'rubber' },
  { id: 'home', name: 'Дом', floorTexture: 'carpet' },
];

const itemTypes: ItemType[] = [
  // Уровневые
  { id: 'trailer', label: 'Трейлер', kind: 'occupiable', icon: 'trailer' },
  { id: 'reactorVat', label: 'Приборы', kind: 'decorative', icon: 'reactorVat' },
  { id: 'testTubeRack', label: 'Стеллаж с пробирками', kind: 'decorative', icon: 'testTubeRack' },
  ItemLibrary.booth(),
  // Библиотечные
  ItemLibrary.car(),
  ItemLibrary.stove(),
  ItemLibrary.burner(),
  ItemLibrary.kassa(),
  ItemLibrary.camera(),
  ItemLibrary.trafficSign(),
  ItemLibrary.sofa(),
  ItemLibrary.chair(),
  ItemLibrary.table(),
  ItemLibrary.globe(),
  ItemLibrary.washer(),
  ItemLibrary.journal('Журнал заказов'),
  ItemLibrary.locker(),
  ItemLibrary.toolbox(),
  ItemLibrary.fridge(),
  ItemLibrary.bed(),
  ItemLibrary.beachChair('Складной стул'),
  ItemLibrary.cactus(),
  ItemLibrary.barrel(),
  ItemLibrary.rock(),
  ItemLibrary.campfire(),
  ItemLibrary.pants(),
];

const items: Item[] = [
  // — Пустыня: трейлер, костёр, штаны, складные стулья, кактусы, бочки, камни —
  { id: 'item-trailer', typeId: 'trailer', cells: [cellId(7, 2), cellId(7, 3)] },
  { id: 'item-campfire', typeId: 'campfire', cells: [cellId(6, 2)] },
  { id: 'item-pants', typeId: 'pants', cells: [cellId(7, 1)] },
  { id: 'item-beach-chair-1', typeId: 'beachChair', cells: [cellId(4, 2)] },
  { id: 'item-beach-chair-2', typeId: 'beachChair', cells: [cellId(6, 3)] },
  { id: 'item-cactus-1', typeId: 'cactus', cells: [cellId(0, 0)] },
  { id: 'item-cactus-2', typeId: 'cactus', cells: [cellId(2, 1)] },
  { id: 'item-cactus-3', typeId: 'cactus', cells: [cellId(3, 2)] },
  { id: 'item-barrel-1', typeId: 'barrel', cells: [cellId(1, 2)] },
  { id: 'item-barrel-2', typeId: 'barrel', cells: [cellId(3, 0)] },
  { id: 'item-rock-1', typeId: 'rock', cells: [cellId(0, 2)] },
  { id: 'item-rock-2', typeId: 'rock', cells: [cellId(2, 2)] },
  { id: 'item-rock-3', typeId: 'rock', cells: [cellId(4, 3)] },
  // — Куриная закусочная: кабинки, кухня, касса, камера, машина на парковке —
  { id: 'item-booth-1', typeId: 'booth', cells: [cellId(2, 3), cellId(3, 3)] },
  { id: 'item-booth-2', typeId: 'booth', cells: [cellId(3, 4), cellId(3, 5)] },
  { id: 'item-booth-3', typeId: 'booth', cells: [cellId(4, 4), cellId(4, 5)] },
  { id: 'item-stove-1', typeId: 'stove', cells: [cellId(0, 3)] },
  { id: 'item-stove-2', typeId: 'stove', cells: [cellId(0, 5)] },
  { id: 'item-burner-1', typeId: 'burner', cells: [cellId(1, 3)] },
  { id: 'item-burner-2', typeId: 'burner', cells: [cellId(2, 4)] },
  { id: 'item-kassa-d', typeId: 'kassa', cells: [cellId(3, 6)] },
  { id: 'item-camera', typeId: 'camera', cells: [cellId(1, 5)] },
  { id: 'item-car-parking', typeId: 'car', cells: [cellId(5, 5), cellId(5, 6)] },
  // — Адвокатская контора: диваны, кресла, столы, глобус —
  { id: 'item-sofa-1', typeId: 'sofa', cells: [cellId(0, 8)] },
  { id: 'item-sofa-2', typeId: 'sofa', cells: [cellId(2, 6)] },
  { id: 'item-sofa-3', typeId: 'sofa', cells: [cellId(2, 8)] },
  { id: 'item-chair-l1', typeId: 'chair', cells: [cellId(0, 10)] },
  { id: 'item-chair-l2', typeId: 'chair', cells: [cellId(2, 7)] },
  { id: 'item-table-l1', typeId: 'table', cells: [cellId(1, 6), cellId(1, 7)] },
  { id: 'item-table-l2', typeId: 'table', cells: [cellId(1, 9), cellId(1, 10)] },
  { id: 'item-globe', typeId: 'globe', cells: [cellId(0, 11)] },
  // — Прачечная: два ряда стиральных машин —
  { id: 'item-washer-1', typeId: 'washer', cells: [cellId(3, 7)] },
  { id: 'item-washer-2', typeId: 'washer', cells: [cellId(3, 8)] },
  { id: 'item-washer-3', typeId: 'washer', cells: [cellId(3, 9)] },
  { id: 'item-washer-4', typeId: 'washer', cells: [cellId(4, 7)] },
  { id: 'item-washer-5', typeId: 'washer', cells: [cellId(4, 8)] },
  { id: 'item-washer-6', typeId: 'washer', cells: [cellId(4, 9)] },
  // — Автомойка: две машины в боксах, журнал, касса —
  { id: 'item-car-w1', typeId: 'car', cells: [cellId(6, 4), cellId(6, 5)] },
  { id: 'item-car-w2', typeId: 'car', cells: [cellId(7, 4), cellId(7, 5)] },
  { id: 'item-journal', typeId: 'journal', cells: [cellId(8, 3)] },
  { id: 'item-kassa-w', typeId: 'kassa', cells: [cellId(8, 5)] },
  // — Лаборатория: чаны, шкафчики, стеллажи, ящик —
  { id: 'item-vat-1', typeId: 'reactorVat', cells: [cellId(8, 8), cellId(9, 8)] },
  { id: 'item-vat-2', typeId: 'reactorVat', cells: [cellId(10, 6), cellId(11, 6)] },
  { id: 'item-trafficsign', typeId: 'trafficSign', cells: [cellId(6, 6)] },
  { id: 'item-locker-2', typeId: 'locker', cells: [cellId(11, 7)] },
  { id: 'item-rack-1', typeId: 'testTubeRack', cells: [cellId(6, 8)] },
  { id: 'item-rack-2', typeId: 'testTubeRack', cells: [cellId(7, 6)] },
  { id: 'item-rack-3', typeId: 'testTubeRack', cells: [cellId(9, 10)] },
  { id: 'item-toolbox-l', typeId: 'toolbox', cells: [cellId(8, 6)] },
  // — Дом: жилая мебель на ковре, гараж с машиной и ящиком —
  { id: 'item-fridge', typeId: 'fridge', cells: [cellId(8, 0)] },
  { id: 'item-chair-h', typeId: 'chair', cells: [cellId(8, 1)] },
  { id: 'item-table-h', typeId: 'table', cells: [cellId(8, 2)] },
  { id: 'item-bed', typeId: 'bed', cells: [cellId(11, 0)] },
  { id: 'item-car-g', typeId: 'car', cells: [cellId(10, 4), cellId(10, 5)] },
  { id: 'item-toolbox-g', typeId: 'toolbox', cells: [cellId(11, 3)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

const floorFeatures: FloorFeature[] = [
  { id: 'garage', label: 'Гараж', textureKey: 'concrete' },
  { id: 'hatch', label: 'Люк', textureKey: 'metal' },
  { id: 'lab-stairs', label: 'Лестница', textureKey: 'stairs' },
  { id: 'office-rug', label: 'Ковёр', textureKey: 'rug' },
  { id: 'parking', label: 'Парковка', textureKey: 'asphalt' },
];

const FEATURE_CELLS: Array<[number, number, string]> = [
  // Гараж (дом)
  [9, 3, 'garage'], [9, 4, 'garage'], [9, 5, 'garage'],
  [10, 3, 'garage'], [10, 4, 'garage'], [10, 5, 'garage'],
  [11, 3, 'garage'], [11, 4, 'garage'], [11, 5, 'garage'],
  // Люки (лаборатория)
  [9, 6, 'hatch'], [11, 8, 'hatch'], [10, 10, 'hatch'], [7, 11, 'hatch'],
  // Лестница (лаборатория)
  [6, 7, 'lab-stairs'], [7, 7, 'lab-stairs'], [8, 7, 'lab-stairs'], [9, 7, 'lab-stairs'],
  // Ковёр (адвокатская контора)
  [1, 7, 'office-rug'], [1, 8, 'office-rug'], [1, 9, 'office-rug'], [1, 10, 'office-rug'],
  // Парковка (закусочная)
  [5, 4, 'parking'], [5, 5, 'parking'], [5, 6, 'parking'], [6, 6, 'parking'],
];

// п=пустыня, к=закусочная, б=адвокатская, с=прачечная, а=автомойка, л=лаборатория, д=дом.
const ROOM_ROWS = [
  'пппкккбббббб',
  'пппкккбббббб',
  'пппкккбббббб',
  'пппккккссссс',
  'ппппкккссссс',
  'ппппкккссссс',
  'ппппаакллссс',
  'ппппаалллллл',
  'дддааалллллл',
  'ддддддлллллл',
  'ддддддлллллл',
  'ддддддлллллл',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      п: 'desert',
      к: 'diner',
      б: 'law',
      с: 'laundry',
      а: 'carwash',
      л: 'lab',
      д: 'home',
    } as Record<string, string>
  )[ch]!;
}

const featureByCell = new Map(FEATURE_CELLS.map(([r, c, f]) => [cellId(r, c), f] as const));

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  const featureId = featureByCell.get(cell.id);
  return featureId ? { ...cell, floorFeatureId: featureId } : cell;
});

const people: Person[] = [
  { id: 'ailar', name: 'Айлер', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: true },
  { id: 'bottiker', name: 'Боттикер', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'volter', name: 'Волтер', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'gustavo', name: 'Густаво', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'jimmy', name: 'Джимми', initialLetter: 'Д', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'erman', name: 'Ерман', initialLetter: 'Е', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'jessie', name: 'Жесси', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'zigler', name: 'Зиглер', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ida', name: 'Ида', initialLetter: 'И', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'kim', name: 'Ким', initialLetter: 'К', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'lalo', name: 'Лало', initialLetter: 'Л', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'hank', name: 'Хэнк', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Полная перестановка 12×12. В доме — ровно двое: Айлер (убийца, 9,2) и
// Хэнк (жертва, 10,3, на бетоне гаража у машины). Автомойка пуста.
const solution: Record<PersonId, CellId> = {
  jimmy: cellId(0, 6),
  gustavo: cellId(1, 4),
  kim: cellId(2, 11),
  lalo: cellId(3, 5),
  jessie: cellId(4, 1),
  volter: cellId(5, 0),
  ida: cellId(6, 9),
  erman: cellId(7, 7),
  zigler: cellId(8, 10),
  ailar: cellId(9, 2),
  hank: cellId(10, 3),
  bottiker: cellId(11, 8),
};

const clues: Clue[] = [
  // — Личные —
  {
    id: 'hv4',
    type: 'parity',
    subject: { type: 'person', id: 'ailar' },
    axis: 'col',
    parity: 'odd',
    text: 'Айлер находилась в нечётном столбце.',
  },
  {
    id: 'hv5',
    type: 'parity',
    subject: { type: 'person', id: 'ailar' },
    axis: 'row',
    parity: 'even',
    text: 'Айлер находилась в чётном ряду.',
  },
  {
    id: 'hv6',
    type: 'floorFeature',
    subject: { type: 'person', id: 'bottiker' },
    featureId: 'hatch',
    text: 'Боттикер стоял на люке.',
  },
  {
    id: 'hv7',
    type: 'relativePosition',
    subject: { type: 'person', id: 'bottiker' },
    otherPersonId: 'erman',
    axis: 'col',
    direction: 'after',
    text: 'Боттикер находился восточнее Ермана.',
  },
  {
    id: 'hv28',
    type: 'position',
    subject: { type: 'person', id: 'volter' },
    axis: 'row',
    value: 5,
    text: 'Волтер находился в 6-м ряду.',
  },
  {
    id: 'hv36',
    type: 'relativePosition',
    subject: { type: 'person', id: 'volter' },
    otherPersonId: 'ailar',
    axis: 'col',
    direction: 'before',
    text: 'Волтер находился западнее Айлер.',
  },
  {
    id: 'hv11',
    type: 'floorTexture',
    subject: { type: 'person', id: 'gustavo' },
    textureKey: 'marble',
    text: 'Густаво находился на мраморном полу закусочной.',
  },
  {
    id: 'hv29',
    type: 'parity',
    subject: { type: 'person', id: 'gustavo' },
    axis: 'row',
    parity: 'even',
    text: 'Густаво находился в чётном ряду.',
  },
  {
    id: 'hv13',
    type: 'wallSide',
    subject: { type: 'person', id: 'jimmy' },
    wallDirection: 'north',
    text: 'Джимми находился у северной стены.',
  },
  {
    id: 'hv38',
    type: 'roomMembership',
    subject: { type: 'person', id: 'jimmy' },
    roomId: 'law',
    text: 'Джимми находился в конторе.',
  },
  {
    id: 'hv14',
    type: 'floorFeature',
    subject: { type: 'person', id: 'erman' },
    featureId: 'lab-stairs',
    text: 'Ерман находился на лестнице.',
  },
  {
    id: 'hv16',
    type: 'adjacency',
    subject: { type: 'person', id: 'jessie' },
    itemTypeId: 'beachChair',
    text: 'Жесси находился рядом со складным стулом.',
  },
  {
    id: 'hv18',
    type: 'adjacency',
    subject: { type: 'person', id: 'zigler' },
    itemTypeId: 'testTubeRack',
    text: 'Зиглер находился рядом со стеллажом с пробирками.',
  },
  {
    id: 'hv31',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zigler' },
    otherPersonId: 'bottiker',
    axis: 'col',
    direction: 'after',
    text: 'Зиглер находился восточнее Боттикера.',
  },
  {
    id: 'hv21',
    type: 'wallSide',
    subject: { type: 'person', id: 'ida' },
    wallDirection: 'south',
    text: 'Ида находилась у южной стены.',
  },
  {
    id: 'hv40',
    type: 'roomMembership',
    subject: { type: 'person', id: 'ida' },
    roomId: 'laundry',
    text: 'Ида находилась в прачечной.',
  },
  {
    id: 'hv33',
    type: 'parity',
    subject: { type: 'person', id: 'ida' },
    axis: 'row',
    parity: 'odd',
    text: 'Ида находилась в нечётном ряду.',
  },
  {
    id: 'hv23',
    type: 'wallSide',
    subject: { type: 'person', id: 'kim' },
    wallDirection: 'east',
    text: 'Ким находилась у восточной стены.',
  },
  {
    id: 'hv39',
    type: 'roomMembership',
    subject: { type: 'person', id: 'kim' },
    roomId: 'law',
    text: 'Ким находилась в конторе.',
  },
  {
    id: 'hv24',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'lalo' },
    itemTypeId: 'booth',
    text: 'Лало сидел в кабинке.',
  },
  {
    id: 'hv25',
    type: 'relativePosition',
    subject: { type: 'person', id: 'lalo' },
    otherPersonId: 'gustavo',
    axis: 'col',
    direction: 'after',
    text: 'Лало находился восточнее Густаво.',
  },
];

const level: Level = {
  meta: {
    id: 'heavy-01',
    title: 'Тяжкое дело',
    theme: 'heavy',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    menuTag: 'hard',
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

export const heavyCaseLevel: Level = level;
