import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 10;

// Ночной аэропорт, вид сверху. Север — городской терминал (ангар-клин на западе, регистрация),
// центр — «шлюз» досмотра (S), за ним стерильная зона (гейты, перрон), юг — полосная
// геометрия взлётной полосы и багажного отделения под ней.
const rooms: Room[] = [
  { id: 'checkin', name: 'Регистрация', floorTexture: 'linoleum' },
  { id: 'hangar', name: 'Ангар', floorTexture: 'metal' },
  { id: 'hall', name: 'Зал ожидания', floorTexture: 'tile' },
  { id: 'screening', name: 'Досмотр', floorTexture: 'concrete' },
  { id: 'gates', name: 'Гейты', floorTexture: 'carpet' },
  { id: 'apron', name: 'Перрон', floorTexture: 'asphalt' },
  { id: 'baggage', name: 'Багажное отделение', floorTexture: 'wood' },
  { id: 'runway', name: 'Взлётная полоса', floorTexture: 'asphalt' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'belt', label: 'Багажная лента', textureKey: 'metal' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.plane(),
  ItemLibrary.windsock(),
  ItemLibrary.baggageCart(),
  ItemLibrary.suitcase('Чемодан'),
  ItemLibrary.suitcase('Чемодан'),
  ItemLibrary.suitcase('Чемодан'),
  { id: 'departureBoard', label: 'Табло вылета', kind: 'decorative', icon: 'departureBoard' },
  { id: 'turnstile', label: 'Рамка досмотра', kind: 'decorative', icon: 'turnstile' },
  ItemLibrary.kassa('Стойка регистрации'),
  ItemLibrary.bench('Скамья зала'),
  ItemLibrary.bench('Скамья зала'),
  ItemLibrary.bench('Скамья зала'),
  ItemLibrary.chair('Кресло'),
  ItemLibrary.chair('Кресло'),
  ItemLibrary.chair('Кресло'),
  ItemLibrary.box('Авиаконтейнер'),
  ItemLibrary.box('Авиаконтейнер'),
  ItemLibrary.toolbox('Ящик с инструментом'),
  ItemLibrary.ladder('Стремянка механика'),
  ItemLibrary.lamppost('Прожектор мачты'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.trashcan('Урна'),
  ItemLibrary.plant('Фикус в кадке'),
  ItemLibrary.clock('Настенные часы'),
];

const items: Item[] = [
  // Регистрация (C, восточный клин): стойки ×2, табло, чемодан, фикус
  { id: 'item-kiosk-c1', typeId: 'kassa', cells: [cellId(0, 7)] },
  { id: 'item-kiosk-c2', typeId: 'kassa', cells: [cellId(1, 8)] },
  { id: 'item-board-c', typeId: 'departureBoard', cells: [cellId(2, 7)] },
  { id: 'item-suitcase-c', typeId: 'suitcase', cells: [cellId(1, 6)] },
  { id: 'item-plant-c', typeId: 'plant', cells: [cellId(0, 9)] },
  // Ангар (H, западный клин): самолёт на ТО, стремянка, инструмент, контейнер
  { id: 'item-plane-h', typeId: 'plane', cells: [cellId(1, 0), cellId(1, 1)] },
  { id: 'item-ladder-h', typeId: 'ladder', cells: [cellId(2, 5)] },
  { id: 'item-toolbox-h', typeId: 'toolbox', cells: [cellId(0, 1)] },
  { id: 'item-box-h', typeId: 'box', cells: [cellId(2, 1)] },
  // Зал ожидания (W): скамьи ×2, часы, урна, фикус, чемодан
  { id: 'item-bench-w1', typeId: 'bench', cells: [cellId(4, 0)] },
  { id: 'item-bench-w2', typeId: 'bench', cells: [cellId(6, 1)] },
  { id: 'item-clock-w', typeId: 'clock', cells: [cellId(5, 2)] },
  { id: 'item-trash-w', typeId: 'trashcan', cells: [cellId(3, 1)] },
{ id: 'item-plant-w', typeId: 'plant', cells: [cellId(7, 0)] },
  { id: 'item-plant-w2', typeId: 'plant', cells: [cellId(3, 0)] },
  { id: 'item-bench-w3', typeId: 'bench', cells: [cellId(5, 3)] },
  { id: 'item-plant-g2', typeId: 'plant', cells: [cellId(5, 6)] },
  { id: 'item-trash-g', typeId: 'trashcan', cells: [cellId(4, 9)] },
  { id: 'item-suitcase-w', typeId: 'suitcase', cells: [cellId(4, 1)] },
  // Досмотр (S): рамка, урна
  { id: 'item-turnstile-s', typeId: 'turnstile', cells: [cellId(4, 4)] },
  { id: 'item-trash-s', typeId: 'trashcan', cells: [cellId(6, 4)] },
  // Гейты (G): кресла ×3, табло, чемодан, фикус
  { id: 'item-chair-g1', typeId: 'chair', cells: [cellId(4, 6)] },
  { id: 'item-chair-g2', typeId: 'chair', cells: [cellId(4, 8)] },
  { id: 'item-chair-g3', typeId: 'chair', cells: [cellId(6, 8)] },
  { id: 'item-board-g', typeId: 'departureBoard', cells: [cellId(3, 8)] },
  { id: 'item-suitcase-g', typeId: 'suitcase', cells: [cellId(5, 8)] },
  { id: 'item-plant-g', typeId: 'plant', cells: [cellId(3, 7)] },
  // Перрон (P, 4 клетки): самолёт 2-кл., прожектор
  { id: 'item-plane-p1', typeId: 'plane', cells: [cellId(6, 6), cellId(6, 7)] },
  { id: 'item-windsock-p', typeId: 'windsock', cells: [cellId(7, 7)] },
  // Багажное (B, юго-восток + уступ в рядах 6-7): лента (floorFeature), тележки ×2, контейнер, чемодан, колдунчик
  { id: 'item-cart-b1', typeId: 'baggageCart', cells: [cellId(8, 1)] },
  { id: 'item-cart-b2', typeId: 'baggageCart', cells: [cellId(9, 2)] },
  { id: 'item-box-b', typeId: 'box', cells: [cellId(8, 4)] },
  { id: 'item-suitcase-b', typeId: 'suitcase', cells: [cellId(9, 0)] },
  { id: 'item-windsock-b', typeId: 'windsock', cells: [cellId(7, 8)] },
  // ВПП (A): прожектор, колдунчик
  { id: 'item-lamp-a', typeId: 'lamppost', cells: [cellId(9, 6)] },
  { id: 'item-windsock-a', typeId: 'windsock', cells: [cellId(8, 8)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// C = регистрация, H = ангар, W = зал, S = досмотр, G = гейты, P = перрон, B = багажное, A = ВПП.
const ROOM_ROWS = [
  'HHHHHCCCCC',
  'HHHHHHCCCC',
  'HHHHHHHCCC',
  'WWWWSSGGGG',
  'WWWWSSGGGG',
  'WWWWSSGGGG',
  'WWWWSSPPBB',
  'WWWWSSPPBB',
  'BBBBBAAAAA',
  'BBBBBAAAAA',
];

const ROOM_BY_LETTER: Record<string, string> = {
  C: 'checkin',
  H: 'hangar',
  W: 'hall',
  S: 'screening',
  G: 'gates',
  P: 'apron',
  B: 'baggage',
  A: 'runway',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Багажная лента — кольцо в багажном отделении.
const BELT_CELLS = new Set<CellId>([cellId(8, 2), cellId(8, 3), cellId(9, 3), cellId(9, 4)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (BELT_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'belt' } : cell));

// Ночная смена. Экипаж — гласные (Анна/Ефим/Инна; Инна — скрытый пилот), механики — Вадим/Григорий/
// Дмитрий (Григорий — убийца: застал грузчика Харитона в багажном), пассажиры — Борис/Жанна/Зоя.
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['mechanic'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: true, roles: ['mechanic'] },
  { id: 'dmitry', name: 'Дмитрий', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['mechanic'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['passenger'] },
  { id: 'inna', name: 'Инна', initialLetter: 'И', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['crew', 'pilot'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false, roles: ['loader'] },
];

const solution: Record<PersonId, CellId> = {
  dmitry: cellId(0, 0),
  anna: cellId(1, 7),
  efim: cellId(2, 3),
  boris: cellId(3, 4),
  zoya: cellId(4, 8),
  zhanna: cellId(5, 1),
  grigory: cellId(6, 9),
  inna: cellId(7, 6),
  khariton: cellId(8, 2),
  vadim: cellId(9, 5),
};

const clues: Clue[] = [
  // — Правила ночного аэропорта —
  { id: 'ap-crew-letters', type: 'letterRole', letterClass: 'vowel', roleId: 'crew', text: 'Все, чьё имя начиналось на гласную букву, были членами экипажа.' },
  { id: 'ap-mechanic-range', type: 'letterRangeRole', fromLetter: 'В', toLetter: 'Д', roleId: 'mechanic', text: 'Все с Вадима по Дмитрия были авиамеханиками.' },
  {
    id: 'ap-passengers-zone',
    type: 'roleZoneLimit',
    roleId: 'passenger',
    roomIds: ['hangar', 'apron', 'runway', 'baggage'],
    maxCount: 0,
    text: 'Пассажиры не допускались в ангар, на перрон, на взлётную полосу и в багажное отделение.',
  },
  // — Скрытый пилот (дедукция личности: А заперта кассой, Е — Дмитрием, И — у самолёта) —
{ id: 'ap-pilot-single', type: 'roleSingleton', roleId: 'pilot', text: 'Среди членов экипажа был ровно один пилот.' },
  { id: 'ap-loader-single', type: 'roleSingleton', roleId: 'loader', text: 'В ночную смену работал ровно один грузчик.' },
  { id: 'ap-pilot-plane', type: 'adjacency', subject: { type: 'role', role: 'pilot' }, itemTypeId: 'plane', text: 'Пилот находился рядом с самолётом.' },
  // — Пассажиры (явные роли: правило зон работает на них, домены включают запрещённые зоны) —
  { id: 'ap-boris-role', type: 'role', subject: { type: 'person', id: 'boris' }, roleId: 'passenger', text: 'Борис был пассажиром.' },
  { id: 'ap-zhanna-role', type: 'role', subject: { type: 'person', id: 'zhanna' }, roleId: 'passenger', text: 'Жанна была пассажиркой.' },
  { id: 'ap-zoya-role', type: 'role', subject: { type: 'person', id: 'zoya' }, roleId: 'passenger', text: 'Зоя была пассажиркой.' },
  // — Регистрация: Анна —
  { id: 'ap-anna-kassa', type: 'adjacency', subject: { type: 'person', id: 'anna' }, itemTypeId: 'kassa', text: 'Анна находилась рядом со стойкой регистрации.' },
  { id: 'ap-anna-east-boris', type: 'relativePosition', subject: { type: 'person', id: 'anna' }, otherPersonId: 'boris', axis: 'col', direction: 'after', offset: 3, text: 'Анна находилась ровно на три столбца восточнее Бориса.' },
  // — Досмотр: Борис (домен — чётные ряды, разрешённые зоны отсекает правило пассажиров) —
  { id: 'ap-boris-parity', type: 'parity', subject: { type: 'person', id: 'boris' }, axis: 'row', parity: 'even', text: 'Борис находился в ряду с чётным номером.' },
  // — Зал ожидания: Жанна (чемоданы в 4 зонах — запрещённые отсекает правило) —
  { id: 'ap-zhanna-suitcase', type: 'adjacency', subject: { type: 'person', id: 'zhanna' }, itemTypeId: 'suitcase', text: 'Жанна находилась рядом с чемоданом.' },
  // — Гейты: Зоя —
  { id: 'ap-zoya-chair', type: 'occupiesItem', subject: { type: 'person', id: 'zoya' }, itemTypeId: 'chair', text: 'Зоя сидела в кресле.' },
  // — Ангар: механики Дмитрий и Ефим —
  { id: 'ap-dmitry-toolbox', type: 'adjacency', subject: { type: 'person', id: 'dmitry' }, itemTypeId: 'toolbox', text: 'Дмитрий находился рядом с ящиком с инструментом.' },
  { id: 'ap-efim-north-dmitry', type: 'relativePosition', subject: { type: 'person', id: 'efim' }, otherPersonId: 'dmitry', axis: 'row', direction: 'after', offset: 2, text: 'Ефим находился ровно на два ряда южнее Дмитрия.' },
  { id: 'ap-efim-east-dmitry', type: 'relativePosition', subject: { type: 'person', id: 'efim' }, otherPersonId: 'dmitry', axis: 'col', direction: 'after', offset: 3, text: 'Ефим находился ровно на три столбца восточнее Дмитрия.' },
  // — Взлётная полоса: Вадим —
  { id: 'ap-vadim-lamp', type: 'adjacency', subject: { type: 'person', id: 'vadim' }, itemTypeId: 'lamppost', text: 'Вадим находился рядом с прожектором мачты.' },
  // — Перрон: Инна (пилот — личность выводится: А у кассы, Е при Дмитрии) —
  { id: 'ap-inna-windsock', type: 'adjacency', subject: { type: 'person', id: 'inna' }, itemTypeId: 'windsock', text: 'Инна находилась рядом с ветровым конусом.' },
  // — Багажное: Григорий (жертва не упоминается ни в одной клю) —
  { id: 'ap-grigory-baggage', type: 'roomMembership', subject: { type: 'person', id: 'grigory' }, roomId: 'baggage', text: 'Григорий находился в багажном отделении.' },
  { id: 'ap-grigory-parity', type: 'parity', subject: { type: 'person', id: 'grigory' }, axis: 'col', parity: 'even', text: 'Григорий находился в столбце с чётным номером.' },
];

export const airportLevel: Level = {
  meta: { id: 'airport-01', title: 'Задержка рейса', theme: 'airport', difficulty: 8, maxFullyPinnedPeople: 0 },
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
