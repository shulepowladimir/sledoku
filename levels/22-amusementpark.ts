import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 9;

// Парк аттракционов, вид сверху. Углы — аттракционы (колесо обозрения СЗ, горки СВ, карусель
// ЮЗ, тир ЮВ), центр — кафе, западная полоса — кассы, юг — сквер с фонтаном.
const rooms: Room[] = [
  { id: 'ferris', name: 'Колесо обозрения', floorTexture: 'concrete' },
  { id: 'slides', name: 'Горки', floorTexture: 'rubber' },
  { id: 'carousel', name: 'Карусель', floorTexture: 'wood' },
  { id: 'gallery', name: 'Тир', floorTexture: 'wood' },
  { id: 'cafe', name: 'Кафе', floorTexture: 'tile' },
  { id: 'tickets', name: 'Кассы', floorTexture: 'cobble' },
  { id: 'grove', name: 'Сквер', floorTexture: 'grass' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'circus-rug', label: 'Билетная разметка', textureKey: 'rug' },
  { id: 'fountain', label: 'Фонтан', textureKey: 'water' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.ferrisWheel(),
  ItemLibrary.carousel(),
  ItemLibrary.slide('Горки'),
  ItemLibrary.shootingGallery(),
  ItemLibrary.popcornStand('Стойка с попкорном'),
  ItemLibrary.popcornStand('Стойка с попкорном'),
  ItemLibrary.kiosk('Билетная касса'),
  ItemLibrary.kiosk('Билетная касса'),
  ItemLibrary.bench('Скамейка'),
  ItemLibrary.bench('Скамейка'),
  ItemLibrary.lamppost('Фонарь парка'),
  ItemLibrary.lamppost('Фонарь парка'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.plant('Клумба'),
  ItemLibrary.plant('Клумба'),
  ItemLibrary.table('Столик кафе'),
  ItemLibrary.table('Столик кафе'),
  ItemLibrary.chair('Стул кафе'),
  ItemLibrary.chair('Стул кафе'),
  ItemLibrary.chair('Стул кафе'),
];

const items: Item[] = [
  // Колесо обозрения (СЗ, rows 0-2 cols 0-4 + row 3 cols 2-4): колесо 2×2, скамья, фонарь, урна
  { id: 'item-wheel', typeId: 'ferrisWheel', cells: [cellId(0, 1), cellId(1, 1)] },
  { id: 'item-bench-w', typeId: 'bench', cells: [cellId(2, 0)] },
  { id: 'item-lamp-w', typeId: 'lamppost', cells: [cellId(0, 0)] },
  { id: 'item-trash-w', typeId: 'trashcan', cells: [cellId(3, 4)] },
  // Горки (СВ, rows 0-3 cols 5-8 + (4,8)): горки 2-кл., попкорн, скамья, урна
  { id: 'item-slide', typeId: 'slide', cells: [cellId(0, 7), cellId(1, 7)] },
  { id: 'item-popcorn-s', typeId: 'popcornStand', cells: [cellId(0, 5)] },
  { id: 'item-bench-s', typeId: 'bench', cells: [cellId(2, 6)] },
  { id: 'item-trash-s', typeId: 'trashcan', cells: [cellId(1, 8)] },
  // Карусель (ЮЗ, 4 клетки — самая маленькая зона парка): карусель 2-кл., скамья
  { id: 'item-carousel', typeId: 'carousel', cells: [cellId(6, 0), cellId(7, 0)] },
  { id: 'item-bench-c', typeId: 'bench', cells: [cellId(6, 1)] },
  { id: 'item-plant-c', typeId: 'plant', cells: [cellId(8, 1)] }, // клумба в сквере (у карусели)
  // Тир (ЮВ, rows 7-8 cols 6-8 + (5,7),(5,8),(6,7),(6,8)): тир 2-кл., попкорн, фонарь
  { id: 'item-gallery', typeId: 'shootingGallery', cells: [cellId(8, 7), cellId(8, 8)] },
  { id: 'item-popcorn-g', typeId: 'popcornStand', cells: [cellId(7, 6)] },
  { id: 'item-lamp-g', typeId: 'lamppost', cells: [cellId(7, 8)] },
  // Кафе (центр-восток, rows 4-6 cols 2-7): столики ×2, стулья ×3, попкорн? нет — клумба
  { id: 'item-table-f1', typeId: 'table', cells: [cellId(4, 4), cellId(4, 5)] },
  { id: 'item-table-f2', typeId: 'table', cells: [cellId(5, 3), cellId(5, 4)] },
  { id: 'item-chair-f1', typeId: 'chair', cells: [cellId(4, 6)] },
  { id: 'item-chair-f2', typeId: 'chair', cells: [cellId(5, 5)] },
  { id: 'item-chair-f3', typeId: 'chair', cells: [cellId(6, 6)] },
  { id: 'item-plant-f', typeId: 'plant', cells: [cellId(6, 6)] },
  // Кассы (западная полоса, rows 3-5 cols 0-1): кассы ×2
  { id: 'item-kiosk-k1', typeId: 'kiosk', cells: [cellId(3, 0)] },
  { id: 'item-kiosk-k2', typeId: 'kiosk', cells: [cellId(5, 1)] },
  // Сквер (юг, rows 6-8 cols 2-5): фонтан (floorFeature), клумба, урна, фонарь
  { id: 'item-plant-q', typeId: 'plant', cells: [cellId(8, 2)] },
  { id: 'item-trash-q', typeId: 'trashcan', cells: [cellId(6, 4)] },
  { id: 'item-lamp-q', typeId: 'lamppost', cells: [cellId(6, 2)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// W = колесо, S = горки, C = карусель, G = тир, F = кафе, K = кассы, Q = сквер.
// Карусель сознательно обрезана до 4 клеток (уникальный минимум для подсказки roomSize),
// сквер при этом «подтекает» под каруселью на юго-западе.
const ROOM_ROWS = [
  'WWWWWSSSS',
  'WWWWWSSSS',
  'WWWWWSSSS',
  'KKWWWSSSS',
  'KKFFFFFFS',
  'KKFFFFFGG',
  'CCQQQFFGG',
  'CQQQQQGGG',
  'CQQQQQGGG',
];

const ROOM_BY_LETTER: Record<string, string> = {
  W: 'ferris',
  S: 'slides',
  C: 'carousel',
  G: 'gallery',
  F: 'cafe',
  K: 'tickets',
  Q: 'grove',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Билетная разметка — площадка перед колесом; фонтан — центр сквера.
const CIRCUS_RUG_CELLS = new Set<CellId>([cellId(1, 2), cellId(1, 3)]);
const FOUNTAIN_CELLS = new Set<CellId>([cellId(7, 4), cellId(8, 4)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (CIRCUS_RUG_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'circus-rug' };
  if (FOUNTAIN_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'fountain' };
  return cell;
});

// Дедукция (без прямых привязок «работник↔зона» и БЕЗ упоминаний жертвы в чьих-либо клю):
// letterRangeRole даёт состав работников Д,Е,Ж,З,Х; roleZoneMin требует работника на каждом
// аттракционе, roomOccupancy — занятость касс и сквера. Жертва Х не упоминается ни в одной
// подсказке — её зону даёт инвариант «наедине с убийцей», а клетку — единственный свободный
// ряд/столбец после расстановки остальных. Г: коврик + 4 ряда севернее Анны (зона W, ряд 1).
// Работники различаются перекрёстными предметами (урны в 3 зонах, попкорн в 2, фонари в 3):
// Д(0,8, урна+север горок), Е(6,0, самая маленькая зона), Ж(8,6, попкорн тира), З(3,1, касса).
// Посетители: А(5,5, стул)+Б(4,7) — кафе; В(7,2) — сквер у фонаря, 3 столбца западнее Анны.
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: [] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: [] },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: [] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true, roles: [] },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'esfir', name: 'Есфирь', initialLetter: 'Е', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'zinaida', name: 'Зинаида', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['worker'] },
  { id: 'kharitina', name: 'Харитина', initialLetter: 'Х', gender: 'female', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['worker'] },
];

const solution: Record<PersonId, CellId> = {
  demyan: cellId(0, 8),
  grigory: cellId(1, 3),
  kharitina: cellId(2, 4),
  zinaida: cellId(3, 1),
  boris: cellId(4, 7),
  anna: cellId(5, 5),
  esfir: cellId(6, 0),
  vadim: cellId(7, 2),
  zhanna: cellId(8, 6),
};

const clues: Clue[] = [
  // — Общие правила парка: кто работник, и никто не ушёл раньше закрытия —
  { id: 'ap-range-roles', type: 'letterRangeRole', fromLetter: 'Д', toLetter: 'Х', roleId: 'worker', text: 'Все с Демьяна по Харитину были работниками парка; остальные — посетителями.' },
  {
    id: 'ap-rides-attended',
    type: 'roleZoneMin',
    roleId: 'worker',
    roomIds: ['ferris', 'slides', 'carousel', 'gallery'],
    minCount: 1,
    text: 'Ни один аттракцион не остался без работника.',
  },
  { id: 'ap-occupancy', type: 'roomOccupancy', text: 'В каждой зоне парка в последний день находился хотя бы один человек.' },
  { id: 'ap-chair-gender', type: 'itemTypeGender', itemTypeId: 'chair', gender: 'female', text: 'Мужчины не садились на стулья кафе.' },
  // — Колесо обозрения: убийца (жертва не упоминается ни в чьих-либо личных клю) —
  { id: 'ap-grigory-rug', type: 'floorFeature', subject: { type: 'person', id: 'grigory' }, featureId: 'circus-rug', text: 'Григорий находился на билетной разметке.' },
  // — Кафе: посетители Анна и Борис —
  { id: 'ap-anna-chair', type: 'occupiesItem', subject: { type: 'person', id: 'anna' }, itemTypeId: 'chair', text: 'Анна сидела на стуле кафе.' },
  { id: 'ap-boris-room-anna', type: 'sameRoomAs', subject: { type: 'person', id: 'boris' }, otherPersonId: 'anna', text: 'Борис находился в той же зоне, что и Анна.' },
  { id: 'ap-boris-parity', type: 'parity', subject: { type: 'person', id: 'boris' }, axis: 'row', parity: 'odd', text: 'Борис находился в ряду с нечётным номером.' },
  // — Сквер: посетитель Вадим —
  { id: 'ap-vadim-lamp', type: 'adjacency', subject: { type: 'person', id: 'vadim' }, itemTypeId: 'lamppost', text: 'Вадим находился рядом с фонарём парка.' },
  {
    id: 'ap-vadim-west-anna',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vadim' },
    otherPersonId: 'anna',
    axis: 'col',
    direction: 'before',
    offset: 3,
    text: 'Вадим находился ровно на три столбца западнее Анны.',
  },
  // — Работники: зоны выводятся из правил, клетки — из конфликтов рядов/столбцов —
  { id: 'ap-demyan-trash', type: 'adjacency', subject: { type: 'person', id: 'demyan' }, itemTypeId: 'trashcan', text: 'Демьян находился рядом с урной.' },
  { id: 'ap-demyan-north', type: 'wallSide', subject: { type: 'person', id: 'demyan' }, wallDirection: 'north', text: 'Демьян находился у северного края своей зоны.' },
  { id: 'ap-zhanna-popcorn', type: 'adjacency', subject: { type: 'person', id: 'zhanna' }, itemTypeId: 'popcornStand', text: 'Жанна находилась рядом со стойкой с попкорном.' },
  { id: 'ap-zinaida-kiosk', type: 'adjacency', subject: { type: 'person', id: 'zinaida' }, itemTypeId: 'kiosk', text: 'Зинаида находилась рядом с билетной кассой.' },
  { id: 'ap-esfir-smallest', type: 'roomSize', subject: { type: 'person', id: 'esfir' }, comparison: 'smallest', text: 'Есфирь находилась в самой маленькой зоне парка.' },
  { id: 'ap-esfir-parity', type: 'parity', subject: { type: 'person', id: 'esfir' }, axis: 'row', parity: 'odd', text: 'Есфирь находилась в ряду с нечётным номером.' },
];

export const amusementParkLevel: Level = {
  meta: { id: 'amusementpark-01', title: 'Закрытие сезона', theme: 'amusementpark', difficulty: 7, maxFullyPinnedPeople: 0 },
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
