import type { FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

const rooms: Room[] = [
  { id: 'chefOffice', name: 'Кабинет шефа', floorTexture: 'wood' },
  { id: 'kitchen', name: 'Кухня', floorTexture: 'tile' },
  { id: 'courtyard', name: 'Задний двор', floorTexture: 'concrete' },
  { id: 'changing', name: 'Раздевалка', floorTexture: 'linoleum' },
  { id: 'dining', name: 'Большой зал', floorTexture: 'marble' },
  { id: 'entrance', name: 'Вход и гардероб', floorTexture: 'cobble' },
  { id: 'terrace', name: 'Терраса', floorTexture: 'carpet' },
  { id: 'bar', name: 'Бар', floorTexture: 'wood' },
  { id: 'vip', name: 'Вип-зал', floorTexture: 'carpet' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'office-rug', label: 'Ковёр в кабинете шефа', textureKey: 'rug' },
  { id: 'dining-rug', label: 'Ковёр в большом зале', textureKey: 'rug' },
  { id: 'entrance-rug', label: 'Ковёр в гардеробе', textureKey: 'rug' },
  { id: 'terrace-rug', label: 'Ковёр на террасе', textureKey: 'rug' },
  { id: 'courtyard-puddle', label: 'Лужа во дворе', textureKey: 'water' },
  { id: 'kitchen-hatch', label: 'Люк на кухне', textureKey: 'metal' },
];

const itemTypes: ItemType[] = [
  { id: 'fineDiningTable', label: 'Стол со скатертью', kind: 'decorative', icon: 'fineDiningTable' },
  { id: 'kitchenIsland', label: 'Кухонный остров', kind: 'decorative', icon: 'kitchenIsland' },
  { id: 'waiterTrolley', label: 'Тележка официанта', kind: 'decorative', icon: 'waiterTrolley' },
  { id: 'servingCloche', label: 'Блюдо под колпаком', kind: 'decorative', icon: 'servingCloche' },
  { id: 'flowerVase', label: 'Ваза с цветами', kind: 'decorative', icon: 'flowerVase' },
  { id: 'wineGlass', label: 'Бокал вина', kind: 'decorative', icon: 'wineGlass' },
  { id: 'wineRack', label: 'Стойка для вина', kind: 'decorative', icon: 'wineRack' },
  { id: 'bushHedge', label: 'Куст', kind: 'decorative', icon: 'bushHedge', render: 'tile' },
  { id: 'roseBush', label: 'Розовый куст', kind: 'decorative', icon: 'roseBush', render: 'tile' },
  ItemLibrary.workbench('Рабочий стол'),
  ItemLibrary.tv(),
  ItemLibrary.sofa(),
  ItemLibrary.portrait(),
  ItemLibrary.fridge(),
  ItemLibrary.stove(),
  ItemLibrary.fryingPan(),
  ItemLibrary.plate(),
  ItemLibrary.car(),
  ItemLibrary.motorcycle(),
  ItemLibrary.cat(),
  ItemLibrary.trough('Миска кота'),
  ItemLibrary.trashcan(),
  ItemLibrary.locker(),
  ItemLibrary.bench(),
  ItemLibrary.chair(),
  ItemLibrary.plant('Горшечное растение'),
  ItemLibrary.wardrobe('Шкаф с одеждой'),
  ItemLibrary.rack('Вешалка'),
  ItemLibrary.makeupMirror('Зеркало'),
  ItemLibrary.barCounter(),
];

function item(id: string, typeId: string, ...positions: [number, number][]): Item {
  return { id, typeId, cells: positions.map(([row, col]) => cellId(row, col)) };
}

const items: Item[] = [
  // Кабинет шефа.
  item('office-desk', 'workbench', [0, 0]),
  item('office-wine-glass', 'wineGlass', [1, 2]),
  item('office-tv', 'tv', [1, 0]),
  item('office-sofa', 'sofa', [1, 1]),
  item('office-portrait', 'portrait', [2, 0]),

  // Кухня.
  item('kitchen-fridge-1', 'fridge', [0, 3]),
  item('kitchen-fridge-2', 'fridge', [0, 4]),
  item('kitchen-stove-1', 'stove', [1, 3]),
  item('kitchen-frying-pan', 'fryingPan', [1, 4]),
  item('kitchen-plate-1', 'plate', [2, 2]),
  item('kitchen-plate-2', 'plate', [2, 3]),
  item('kitchen-stove-2', 'stove', [2, 4]),
  item('kitchen-trashcan', 'trashcan', [4, 2]),
  item('kitchen-island', 'kitchenIsland', [3, 3], [3, 4]),
  item('kitchen-waiter-trolley', 'waiterTrolley', [4, 0]),
  item('kitchen-serving-cloche', 'servingCloche', [4, 6]),

  // Задний двор: обе машины оставлены проходимыми для людей по правилам ItemLibrary.
  item('courtyard-car', 'car', [0, 5], [0, 6]),
  item('courtyard-motorcycle', 'motorcycle', [0, 8], [0, 9]),
  item('courtyard-cat', 'cat', [1, 7]),
  item('courtyard-cat-bowl', 'trough', [1, 8]),
  item('courtyard-trashcan', 'trashcan', [2, 5]),

  // Раздевалка.
  item('changing-locker-1', 'locker', [2, 7]),
  item('changing-locker-2', 'locker', [2, 8]),
  item('changing-bench-1', 'bench', [3, 5]),
  item('changing-bench-2', 'bench', [3, 6]),

  // Терраса.
  item('terrace-chair-1', 'chair', [5, 8]),
  item('terrace-chair-2', 'chair', [6, 8]),
  item('terrace-plant-1', 'plant', [7, 8]),
  item('terrace-plant-2', 'plant', [9, 9]),
  item('terrace-cat', 'cat', [8, 9]),
  item('terrace-bush-1', 'bushHedge', [5, 9]),
  item('terrace-bush-2', 'roseBush', [6, 9]),

  // Большой зал.
  item('dining-table-1', 'fineDiningTable', [5, 0]),
  item('dining-table-2', 'fineDiningTable', [6, 4]),
  item('dining-chair-1', 'chair', [5, 4]),
  item('dining-chair-2', 'chair', [6, 0]),
  item('dining-waiter-trolley', 'waiterTrolley', [5, 7]),
  item('dining-flower-vase', 'flowerVase', [6, 2]),
  item('dining-serving-cloche', 'servingCloche', [6, 5]),
  item('dining-plate', 'plate', [5, 6]),
  item('dining-wine-glass-1', 'wineGlass', [7, 4]),
  item('dining-wine-glass-2', 'wineGlass', [7, 6]),

  // Вип-зал.
  item('vip-table', 'fineDiningTable', [8, 3]),
  item('vip-flower-vase', 'flowerVase', [8, 4]),
  item('vip-wine-glass', 'wineGlass', [8, 5]),
  item('vip-chair', 'chair', [9, 5]),

  // Вход и гардероб.
  item('entrance-wardrobe', 'wardrobe', [7, 1]),
  item('entrance-coat-rack', 'rack', [7, 2]),
  item('entrance-flower-vase', 'flowerVase', [8, 0]),
  item('entrance-mirror', 'makeupMirror', [8, 1]),
  item('entrance-sofa', 'sofa', [9, 0]),

  // Бар.
  item('bar-counter', 'barCounter', [6, 7]),
  item('bar-wine-rack', 'wineRack', [9, 7]),
  item('bar-wine-glass', 'wineGlass', [9, 6]),
];

// Ш — кабинет шефа, К — кухня, Д — задний двор, Р — раздевалка, З — большой зал,
// Г — вход и гардероб, Т — терраса, Б — бар, В — вип-зал.
const ROOM_ROWS = [
  'ШШШККДДДДД',
  'ШШШККДДДДД',
  'ШШКККДДРРР',
  'КККККРРРРР',
  'КККККККРТТ',
  'ЗЗЗЗЗЗЗЗТТ',
  'ЗЗЗЗЗЗЗБТТ',
  'ГГГГЗЗЗБТТ',
  'ГГГВВВВББТ',
  'ГГГГВВБББТ',
];

const ROOM_BY_LETTER: Record<string, string> = {
  Ш: 'chefOffice',
  К: 'kitchen',
  Д: 'courtyard',
  Р: 'changing',
  З: 'dining',
  Г: 'entrance',
  Т: 'terrace',
  Б: 'bar',
  В: 'vip',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const itemIdByCell = new Map(items.flatMap((placedItem) => placedItem.cells.map((id) => [id, placedItem.id] as const)));
const floorFeatureByCell = new Map<string, string>([
  [cellId(0, 1), 'office-rug'],
  [cellId(5, 1), 'dining-rug'],
  [cellId(5, 2), 'dining-rug'],
  [cellId(9, 2), 'entrance-rug'],
  [cellId(9, 3), 'entrance-rug'],
  [cellId(4, 8), 'terrace-rug'],
  [cellId(4, 9), 'terrace-rug'],
  [cellId(0, 7), 'courtyard-puddle'],
  [cellId(1, 5), 'courtyard-puddle'],
  [cellId(1, 6), 'courtyard-puddle'],
  [cellId(3, 2), 'kitchen-hatch'],
  [cellId(4, 2), 'kitchen-hatch'],
]);
const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)))
  .map((cell) => ({ ...cell, ...(floorFeatureByCell.has(cell.id) ? { floorFeatureId: floorFeatureByCell.get(cell.id) } : {}) }));

const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['staff', 'chef'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'galina', name: 'Галина', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'denis', name: 'Денис', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: true, roles: ['staff'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: false, roles: ['guest'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false, roles: ['guest', 'critic'] },
];

const solution: Record<PersonId, ReturnType<typeof cellId>> = {
  anna: cellId(0, 2),
  boris: cellId(3, 1),
  vera: cellId(2, 9),
  galina: cellId(1, 5),
  denis: cellId(5, 3),
  esenia: cellId(4, 8),
  zhanna: cellId(8, 7),
  zoya: cellId(7, 0),
  inna: cellId(9, 4),
  khariton: cellId(6, 6),
};

const clues: Clue[] = [
  {
    id: 'restaurant-staff-range',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Д',
    roleId: 'staff',
    text: 'Все, чьи имена начинались с букв от А до Д, работали в ресторане; остальные были гостями.',
  },
  {
    id: 'restaurant-chef-among-staff',
    type: 'roleSingleton',
    roleId: 'chef',
    withinRoleId: 'staff',
    groupId: 'restaurant-hidden-role-counts',
    text: 'Среди сотрудников ресторана был шеф-повар, а среди гостей — критик.',
  },
  {
    id: 'restaurant-critic-among-guests',
    type: 'roleSingleton',
    roleId: 'critic',
    withinRoleId: 'guest',
    groupId: 'restaurant-hidden-role-counts',
    text: 'Среди сотрудников ресторана был шеф-повар, а среди гостей — критик.',
  },
  {
    id: 'restaurant-chef-office',
    type: 'roomMembership',
    subject: { type: 'role', role: 'chef' },
    roomId: 'chefOffice',
    text: 'Шеф-повар находился в своём кабинете.',
  },
  {
    id: 'restaurant-critic-with-staff',
    type: 'roleGuard',
    roomIds: rooms.map((room) => room.id),
    guardedRoleId: 'critic',
    guardianRoleId: 'staff',
    text: 'Критик находился в одной зоне с сотрудником ресторана.',
  },
  {
    id: 'restaurant-anna-wine-glass',
    type: 'adjacency',
    subject: { type: 'person', id: 'anna' },
    itemTypeId: 'wineGlass',
    text: 'Анна находилась рядом с бокалом вина.',
  },
  {
    id: 'restaurant-boris-kitchen-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'boris' },
    roomId: 'kitchen',
    otherRoomId: 'chefOffice',
    text: 'Борис находился на границе кухни и кабинета шефа.',
  },
  {
    id: 'restaurant-boris-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'col',
    parity: 'even',
    text: 'Борис находился в столбце с чётным номером.',
  },
  {
    id: 'restaurant-vera-east-wall',
    type: 'wallSide',
    subject: { type: 'person', id: 'vera' },
    wallDirection: 'east',
    text: 'Вера находилась у восточной стены своей зоны.',
  },
  {
    id: 'restaurant-galina-puddle',
    type: 'floorFeature',
    subject: { type: 'person', id: 'galina' },
    featureId: 'courtyard-puddle',
    text: 'Галина стояла на луже во дворе.',
  },
  {
    id: 'restaurant-galina-even-column',
    type: 'parity',
    subject: { type: 'person', id: 'galina' },
    axis: 'col',
    parity: 'even',
    text: 'Галина находилась в столбце с чётным номером.',
  },
  {
    id: 'restaurant-denis-south-of-esenia',
    type: 'relativePosition',
    subject: { type: 'person', id: 'denis' },
    otherPersonId: 'esenia',
    axis: 'row',
    direction: 'after',
    text: 'Денис находился южнее Есении.',
  },
  {
    id: 'restaurant-denis-hall-kitchen-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'denis' },
    roomId: 'dining',
    otherRoomId: 'kitchen',
    text: 'Денис находился на границе большого зала и кухни.',
  },
  {
    id: 'restaurant-vera-one-row-south',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vera' },
    otherPersonId: 'galina',
    axis: 'row',
    direction: 'after',
    offset: 1,
    text: 'Вера находилась ровно на один ряд южнее Галины.',
  },
  {
    id: 'restaurant-esenia-rug',
    subject: { type: 'person', id: 'esenia' },
    type: 'floorTexture',
    textureKey: 'rug',
    text: 'Есения находилась на ковре.',
  },
  {
    id: 'restaurant-zhanna-wine-zone',
    type: 'sameRowOrColumnAsItem',
    subject: { type: 'person', id: 'zhanna' },
    itemTypeId: 'wineRack',
    text: 'Жанна находилась в одном ряду или столбце со стойкой для вина.',
  },
  {
    id: 'restaurant-zoya-entrance',
    type: 'roomMembership',
    subject: { type: 'person', id: 'zoya' },
    roomId: 'entrance',
    text: 'Зоя находилась на входе.',
  },
  {
    id: 'restaurant-zoya-odd-column',
    type: 'parity',
    subject: { type: 'person', id: 'zoya' },
    axis: 'col',
    parity: 'odd',
    text: 'Зоя находилась в столбце с нечётным номером.',
  },
  {
    id: 'restaurant-inna-smallest-room',
    type: 'roomSize',
    subject: { type: 'person', id: 'inna' },
    comparison: 'smallest',
    text: 'Инна находилась в самой маленькой зоне.',
  },
  {
    id: 'restaurant-inna-even-row',
    type: 'parity',
    subject: { type: 'person', id: 'inna' },
    axis: 'row',
    parity: 'even',
    text: 'Инна находилась в ряду с чётным номером.',
  },
];

export const restaurantLevel: Level = {
  meta: {
    id: 'restaurant-01',
    title: 'Острая критика',
    theme: 'restaurant',
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
