import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

// Ночной зоопарк, вид сверху. Шесть вольеров вокруг центральной аллеи-коридора;
// мостики соединяют аллею с севером, кассы и сувенирная лавка — на юго-западе и юго-востоке.
const rooms: Room[] = [
  { id: 'lions', name: 'Вольер львов', floorTexture: 'sand' },
  { id: 'giraffes', name: 'Вольер жирафов', floorTexture: 'grass' },
  { id: 'monkeys', name: 'Вольер обезьян', floorTexture: 'grass' },
  { id: 'hippos', name: 'Вольер бегемотов', floorTexture: 'dirt' },
  { id: 'zebras', name: 'Вольер зебр', floorTexture: 'dirt' },
  { id: 'penguins', name: 'Вольер пингвинов', floorTexture: 'snow' },
  { id: 'alley', name: 'Аллея', floorTexture: 'cobble' },
  { id: 'bridges', name: 'Мостики', floorTexture: 'wood' },
  { id: 'tickets', name: 'Кассы', floorTexture: 'tile' },
  { id: 'souvenir', name: 'Сувенирная лавка', floorTexture: 'wood' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'lionPond', label: 'Пруд', textureKey: 'water' },
  { id: 'hippoPool', label: 'Бассейн бегемотов', textureKey: 'water' },
  { id: 'iceFloor', label: 'Лёд', textureKey: 'ice' },
  { id: 'iceHole', label: 'Прорубь', textureKey: 'water' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.lion(),
  ItemLibrary.lion(),
  ItemLibrary.lion(),
  ItemLibrary.giraffe(),
  ItemLibrary.giraffe(),
  ItemLibrary.monkey(),
  ItemLibrary.monkey(),
  ItemLibrary.hippo(),
  ItemLibrary.hippo(),
  ItemLibrary.zebra(),
  ItemLibrary.zebra(),
  ItemLibrary.penguin(),
  ItemLibrary.penguin(),
  ItemLibrary.rock('Скала'),
  { id: 'medicineCabinet', label: 'Шкаф с лекарствами', kind: 'decorative', icon: 'medicineCabinet' },
  ItemLibrary.jacuzzi('Джакузи бегемотов'),
  ItemLibrary.treadmill('Беговая дорожка'),
  { id: 'swing', label: 'Качели обезьян', kind: 'occupiable', icon: 'swing' },
  { id: 'souvenirRack', label: 'Стойка с сувенирами', kind: 'decorative', icon: 'souvenirRack' },
  ItemLibrary.bench('Скамья'),
  ItemLibrary.bench('Скамья'),
  ItemLibrary.bench('Скамья'),
  ItemLibrary.lamppost('Фонарь аллеи'),
  ItemLibrary.lamppost('Фонарь аллеи'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.tree('Дерево'),
  ItemLibrary.tree('Дерево'),
  ItemLibrary.tree('Дерево'),
  ItemLibrary.plant('Клумба'),
  ItemLibrary.plant('Клумба'),
  ItemLibrary.plant('Клумба'),
  { id: 'kassa', label: 'Касса', kind: 'decorative', icon: 'kassa' },
];

const items: Item[] = [
  // Вольер львов (Л, rows 0-2 west): львы ×3 (2-кл. гориз.), скала
  { id: 'item-lion-1', typeId: 'lion', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-lion-2', typeId: 'lion', cells: [cellId(1, 0), cellId(1, 1)] },
  { id: 'item-rock-l', typeId: 'rock', cells: [cellId(2, 0)] },
  // Вольер жирафов (Ж, east rows 0-4): жирафы ×2 (2-кл. вертик.), шкаф
  { id: 'item-giraffe-1', typeId: 'giraffe', cells: [cellId(0, 9), cellId(1, 9)] },
  { id: 'item-giraffe-2', typeId: 'giraffe', cells: [cellId(2, 10), cellId(3, 10)] },
  { id: 'item-medicine-g', typeId: 'medicineCabinet', cells: [cellId(1, 8)] },
  // Вольер зебр (З, rows 2-4): зебры ×2, дорожка
  { id: 'item-zebra-1', typeId: 'zebra', cells: [cellId(3, 5)] },
  { id: 'item-zebra-2', typeId: 'zebra', cells: [cellId(4, 6)] },
  { id: 'item-treadmill-z', typeId: 'treadmill', cells: [cellId(3, 6)] },
  // Вольер обезьян (О, west rows 3-7): обезьяны ×2, качели
  { id: 'item-monkey-1', typeId: 'monkey', cells: [cellId(4, 0)] },
  { id: 'item-monkey-2', typeId: 'monkey', cells: [cellId(5, 0)] },
  { id: 'item-swing-m', typeId: 'swing', cells: [cellId(6, 1)] },
  // Вольер пингвинов (П, rows 6-7): пингвины ×2
  { id: 'item-penguin-1', typeId: 'penguin', cells: [cellId(6, 4)] },
  { id: 'item-penguin-2', typeId: 'penguin', cells: [cellId(7, 5)] },
  // Вольер бегемотов (Б, rows 8-10): бегемоты ×2 (2-кл. гориз.), джакузи
  { id: 'item-hippo-1', typeId: 'hippo', cells: [cellId(9, 0), cellId(9, 1)] },
  { id: 'item-hippo-2', typeId: 'hippo', cells: [cellId(10, 0), cellId(10, 1)] },
  { id: 'item-jacuzzi-b', typeId: 'jacuzzi', cells: [cellId(8, 0)] },
  // Мостики (М): фонарь, урна, клумба
  { id: 'item-lamp-m', typeId: 'lamppost', cells: [cellId(5, 4)] },
  { id: 'item-trash-m', typeId: 'trashcan', cells: [cellId(2, 3)] },
  { id: 'item-plant-m', typeId: 'plant', cells: [cellId(2, 4)] },
  // Аллея (А): скамьи ×3, фонари ×2, урны ×2, деревья ×2, клумба
  { id: 'item-bench-a1', typeId: 'bench', cells: [cellId(3, 1)] },
  { id: 'item-bench-a2', typeId: 'bench', cells: [cellId(4, 7)] },
  { id: 'item-bench-a3', typeId: 'bench', cells: [cellId(5, 5)] },
  { id: 'item-lamp-a1', typeId: 'lamppost', cells: [cellId(0, 7)] },
  { id: 'item-lamp-a2', typeId: 'lamppost', cells: [cellId(8, 7)] },
  { id: 'item-trash-a1', typeId: 'trashcan', cells: [cellId(1, 6)] },
  { id: 'item-trash-a2', typeId: 'trashcan', cells: [cellId(10, 4)] },
  { id: 'item-tree-a1', typeId: 'tree', cells: [cellId(0, 6)] },
  { id: 'item-tree-a2', typeId: 'tree', cells: [cellId(5, 8)] },
  { id: 'item-tree-a3', typeId: 'tree', cells: [cellId(6, 10)] },
  { id: 'item-plant-a', typeId: 'plant', cells: [cellId(9, 6)] },
  // Кассы (К): кассы ×2
  { id: 'item-kassa-k1', typeId: 'kassa', cells: [cellId(10, 5)] },
  { id: 'item-kassa-k2', typeId: 'kassa', cells: [cellId(9, 7)] },
  // Сувенирная лавка (С): стойки ×2, клумба
  { id: 'item-souvenir-s1', typeId: 'souvenirRack', cells: [cellId(5, 10)] },
  { id: 'item-souvenir-s2', typeId: 'souvenirRack', cells: [cellId(8, 9)] },
  { id: 'item-plant-s', typeId: 'plant', cells: [cellId(7, 9)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Л = львы, Ж = жирафы, О = обезьяны, Б = бегемоты, З = зебры, П = пингвины,
// А = аллея, М = мостики, К = кассы, С = сувенирная лавка.
// Мостики протянуты через вольер зебр (вертикальная колона 4) — зебры прижаты к востоку.
const ROOM_ROWS = [
  'ЛЛЛЛЛЛААЖЖЖ',
  'ЛЛЛЛММААЖЖЖ',
  'ЛЛЛММЗААЖЖЖ',
  'ОАААМЗЗАЖЖЖ',
  'ООААМЗЗАЖЖЖ',
  'ОООАМММАААС',
  'ОООАППППААС',
  'ОАААППППАСС',
  'БББААААААСС',
  'ББББАААККСС',
  'ББББАКККССС',
];

const ROOM_BY_LETTER: Record<string, string> = {
  Л: 'lions',
  Ж: 'giraffes',
  О: 'monkeys',
  Б: 'hippos',
  З: 'zebras',
  П: 'penguins',
  А: 'alley',
  М: 'bridges',
  К: 'tickets',
  С: 'souvenir',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Пруд львов, бассейн бегемотов, ледяной пол и прорубь пингвинов — фичи пола.
const LION_POND_CELLS = new Set<CellId>([cellId(2, 1), cellId(2, 2)]);
const HIPPO_POOL_CELLS = new Set<CellId>([cellId(8, 1), cellId(8, 2), cellId(9, 2)]);
const ICE_CELLS = new Set<CellId>([cellId(7, 4), cellId(7, 6), cellId(7, 7)]);
const ICE_HOLE_CELLS = new Set<CellId>([cellId(6, 5)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (LION_POND_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'lionPond' };
  if (HIPPO_POOL_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'hippoPool' };
  if (ICE_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'iceFloor' };
  if (ICE_HOLE_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'iceHole' };
  return cell;
});

// Ночная смена зоопарка. Работники — согласные (Богдан/Всеслав/Гурий/Демид/Ждан/Захар/Ксения +
// жертва Харитина), посетители — гласные (Анна/Есения/Инна). Гурий-убийца застал смотрительницу
// Харитину в вольере львов; жертва не упоминается ни в одной клю.
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'bogdan', name: 'Богдан', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'vseslav', name: 'Всеслав', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'guriy', name: 'Гурий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true, roles: ['zookeeper'] },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'ksenia', name: 'Ксения', initialLetter: 'К', gender: 'female', color: '#c98f38', isVictim: false, isMurderer: false, roles: ['zookeeper'] },
  { id: 'kharitina', name: 'Харитина', initialLetter: 'Х', gender: 'female', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['zookeeper'] },
];

const solution: Record<PersonId, CellId> = {
  zhdan: cellId(0, 8),
  guriy: cellId(1, 3),
  kharitina: cellId(2, 1),
  anna: cellId(3, 7),
  zakhar: cellId(4, 5),
  esenia: cellId(5, 9),
  bogdan: cellId(6, 0),
  demid: cellId(7, 4),
  inna: cellId(8, 10),
  vseslav: cellId(9, 2),
  ksenia: cellId(10, 6),
};

const clues: Clue[] = [
  // — Правила ночного зоопарка —
  { id: 'zoo-keepers-letters', type: 'letterRole', letterClass: 'consonant', roleId: 'zookeeper', text: 'Все, чьё имя начиналось на согласную букву, были работниками зоопарка.' },
  {
    id: 'zoo-visitors-no-enclosures',
    type: 'roleZoneLimit',
    roleId: 'visitor',
    roomIds: ['lions', 'giraffes', 'monkeys', 'hippos', 'zebras', 'penguins'],
    maxCount: 0,
    text: 'Посетители не допускались в вольеры.',
  },
  {
    id: 'zoo-every-enclosure-attended',
    type: 'roleZoneMin',
    roleId: 'zookeeper',
    roomIds: ['lions', 'giraffes', 'monkeys', 'hippos', 'zebras', 'penguins'],
    minCount: 1,
    text: 'Ни один вольер не остался без работника.',
  },
  // — Посетители (домен — всё поле, вольеры отсекает правило; якорь — мультизонный предмет) —
  { id: 'zoo-anna-parity', type: 'parity', subject: { type: 'person', id: 'anna' }, axis: 'col', parity: 'even', text: 'Анна находилась в столбце с чётным номером.' },
  { id: 'zoo-anna-bench', type: 'adjacency', subject: { type: 'person', id: 'anna' }, itemTypeId: 'bench', text: 'Анна находилась рядом со скамьёй.' },
  { id: 'zoo-esenia-parity', type: 'parity', subject: { type: 'person', id: 'esenia' }, axis: 'row', parity: 'even', text: 'Есения находилась в ряду с чётным номером.' },
  { id: 'zoo-esenia-tree', type: 'adjacency', subject: { type: 'person', id: 'esenia' }, itemTypeId: 'tree', text: 'Есения находилась рядом с деревом.' },
  { id: 'zoo-inna-souvenir', type: 'adjacency', subject: { type: 'person', id: 'inna' }, itemTypeId: 'souvenirRack', text: 'Инна находилась рядом со стойкой с сувенирами.' },
  // — Работники вольеров (животные — мультизонные? нет: каждый вид в одном вольере; вместо этого —
  // пруд/фонари/качели в нескольких зонах + реляционные цепочки) —
  { id: 'zoo-zhdan-north-wall', type: 'wallSide', subject: { type: 'person', id: 'zhdan' }, wallDirection: 'north', text: 'Ждан находился у северной стены своей зоны.' },
  {
    id: 'zoo-zhdan-north-anna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhdan' },
    otherPersonId: 'anna',
    axis: 'row',
    direction: 'before',
    offset: 3,
    text: 'Ждан находился ровно на три ряда севернее Анны.',
  },
  { id: 'zoo-zakhar-south-wall', type: 'wallSide', subject: { type: 'person', id: 'zakhar' }, wallDirection: 'south', text: 'Захар находился у южной стены своей зоны.' },
  { id: 'zoo-bogdan-west-wall', type: 'wallSide', subject: { type: 'person', id: 'bogdan' }, wallDirection: 'west', text: 'Богдан находился у западной стены своей зоны.' },
  { id: 'zoo-demid-ice', type: 'floorFeature', subject: { type: 'person', id: 'demid' }, featureId: 'iceFloor', text: 'Демид находился на льду.' },
  { id: 'zoo-vseslav-pool', type: 'floorFeature', subject: { type: 'person', id: 'vseslav' }, featureId: 'hippoPool', text: 'Всеслав находился в бассейне бегемотов.' },
  { id: 'zoo-vseslav-west-bogdan', type: 'relativePosition', subject: { type: 'person', id: 'vseslav' }, otherPersonId: 'bogdan', axis: 'col', direction: 'after', offset: 2, text: 'Всеслав находился ровно на два столбца восточнее Богдана.' },
  // — Кассы: Ксения —
  { id: 'zoo-ksenia-kassa', type: 'adjacency', subject: { type: 'person', id: 'ksenia' }, itemTypeId: 'kassa', text: 'Ксения находилась рядом с кассой.' },
  // — Вольер львов: убийца (жертва не упоминается) —
  { id: 'zoo-guriy-south-zhdan', type: 'relativePosition', subject: { type: 'person', id: 'guriy' }, otherPersonId: 'zhdan', axis: 'row', direction: 'after', offset: 1, text: 'Гурий находился ровно на один ряд южнее Ждана.' },
  { id: 'zoo-guriy-parity', type: 'parity', subject: { type: 'person', id: 'guriy' }, axis: 'col', parity: 'even', text: 'Гурий находился в столбце с чётным номером.' },
];

export const zooLevel: Level = {
  meta: { id: 'zoo-01', title: 'Клетка хищника', theme: 'zoo', difficulty: 8, maxFullyPinnedPeople: 0 },
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
