import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 12;

// Ночная съёмочная площадка киностудии, вид сверху. Центральный звуковой павильон;
// вокруг — цеха (север), декорации (запад/юг), просмотровый зал (юго-восток), вход с красной дорожкой (восток).
const rooms: Room[] = [
  { id: 'storage', name: 'Склад реквизита', floorTexture: 'concrete' },
  { id: 'makeup', name: 'Гримёрка', floorTexture: 'tile' },
  { id: 'costume', name: 'Костюмерная', floorTexture: 'carpet' },
  { id: 'lighting', name: 'Осветительный цех', floorTexture: 'metal' },
  { id: 'soundstage', name: 'Основная декорация', floorTexture: 'wood' },
  { id: 'western', name: 'Декорация «Вестерн»', floorTexture: 'dirt' },
  { id: 'street', name: 'Декорация «Улица»', floorTexture: 'asphalt' },
  { id: 'canteen', name: 'Кафетерий', floorTexture: 'linoleum' },
  { id: 'screening', name: 'Просмотровый зал', floorTexture: 'rubber' },
  { id: 'entrance', name: 'Вход', floorTexture: 'marble' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'redCarpet', label: 'Красная дорожка', textureKey: 'rug' },
  { id: 'grassPatch', label: 'Декорация травы', textureKey: 'grass' },
];

const itemTypes: ItemType[] = [
  // Склад реквизита
  ItemLibrary.box('Ящик с реквизитом'),
  ItemLibrary.suitcase(),
  // Гримёрный павильон
  ItemLibrary.makeupMirror('Гримёрное зеркало'),
  ItemLibrary.makeupMirror('Гримёрное зеркало'),
  ItemLibrary.chair(),
  ItemLibrary.wardrobe(),
  ItemLibrary.plant(),
  ItemLibrary.box('Ящик с реквизитом'),
  // Костюмерная
  ItemLibrary.rack('Стойка с костюмами'),
  ItemLibrary.rack('Стойка с костюмами'),
  ItemLibrary.rack('Стойка с костюмами'),
  ItemLibrary.wardrobe(),
  ItemLibrary.table(),
  ItemLibrary.stool(),
  // Осветительный цех
  ItemLibrary.spotlight(),
  ItemLibrary.spotlight(),
  ItemLibrary.ladder(),
  ItemLibrary.toolbox(),
  // Звуковой павильон
  ItemLibrary.movieCamera('Кинокамера'),
  ItemLibrary.clapperboard(),
  ItemLibrary.spotlight(),
  ItemLibrary.spotlight(),
  ItemLibrary.armchair('Режиссёрское кресло'),
  ItemLibrary.armchair('Режиссёрское кресло'),
  ItemLibrary.ladder(),
  // Декорация «Вестерн»
  ItemLibrary.cactus(),
  ItemLibrary.cactus(),
  ItemLibrary.wagon(),
  ItemLibrary.hitchingPost(),
  ItemLibrary.barrel(),
  ItemLibrary.horse(),
  // Декорация «Улица»
  ItemLibrary.lamppost(),
  ItemLibrary.lamppost(),
  ItemLibrary.bench(),
  ItemLibrary.trashcan(),
  ItemLibrary.trashcan(),
  ItemLibrary.kiosk('Киоск с газетами'),
  ItemLibrary.plant('Клумба'),
  ItemLibrary.armchair('Режиссёрское кресло'),
  // Кафетерий
  ItemLibrary.table(),
  ItemLibrary.table(),
  ItemLibrary.stool(),
  ItemLibrary.stool(),
  ItemLibrary.watercooler(),
  ItemLibrary.fridge(),
  ItemLibrary.popcornStand(),
  // Просмотровый зал
  ItemLibrary.sofa(),
  ItemLibrary.tv(),
  ItemLibrary.armchair('Режиссёрское кресло'),
  // Вход
  ItemLibrary.palm(),
  ItemLibrary.palm(),
  ItemLibrary.plant(),
  ItemLibrary.portrait('Постер фильма'),
];

const items: Item[] = [
  // Склад реквизита (rows 0–1, cols 0–1): никто
  { id: 'item-box-s1', typeId: 'box', cells: [cellId(0, 0)] },
  { id: 'item-suitcase-s', typeId: 'suitcase', cells: [cellId(0, 1)] },
  // Гримёрный павильон (rows 0–2, cols 2–5): Анна (0,2)
  { id: 'item-mirror-m1', typeId: 'makeupMirror', cells: [cellId(0, 3)] },
  { id: 'item-mirror-m2', typeId: 'makeupMirror', cells: [cellId(1, 3)] },
  { id: 'item-chair-m', typeId: 'chair', cells: [cellId(1, 2)] },
  { id: 'item-wardrobe-m', typeId: 'wardrobe', cells: [cellId(2, 4), cellId(2, 5)] },
  { id: 'item-plant-m', typeId: 'plant', cells: [cellId(2, 2)] },
  { id: 'item-box-m', typeId: 'box', cells: [cellId(0, 5)] },
  // Костюмерная (rows 0–2 cols 6–9, row 3 cols 8–9, row 4 col 8): Есения (1,6)
  { id: 'item-rack-c1', typeId: 'rack', cells: [cellId(0, 6)] },
  { id: 'item-rack-c2', typeId: 'rack', cells: [cellId(0, 8)] },
  { id: 'item-rack-c3', typeId: 'rack', cells: [cellId(1, 7)] },
  { id: 'item-wardrobe-c', typeId: 'wardrobe', cells: [cellId(2, 6), cellId(2, 7)] },
  { id: 'item-table-c', typeId: 'table', cells: [cellId(1, 9)] },
  { id: 'item-stool-c', typeId: 'stool', cells: [cellId(2, 8)] },
  // Осветительный цех ((2,0)(2,1)(3,0)(3,1)(4,0)(5,0)(5,1)): Ждан (2,0)
  { id: 'item-spot-l1', typeId: 'spotlight', cells: [cellId(2, 1)] },
  { id: 'item-spot-l2', typeId: 'spotlight', cells: [cellId(3, 1)] },
  { id: 'item-ladder-l', typeId: 'ladder', cells: [cellId(4, 0)] },
  { id: 'item-toolbox-l', typeId: 'toolbox', cells: [cellId(5, 1)] },
  // Звуковой павильон (row 3 cols 2–7, row 4 cols 1–7, rows 5–6 cols 2–7): Демид (3,4), Глафира (5,5)
  { id: 'item-camera-p', typeId: 'movieCamera', cells: [cellId(3, 5)] },
  { id: 'item-clapper-p', typeId: 'clapperboard', cells: [cellId(3, 3)] },
  { id: 'item-spot-p1', typeId: 'spotlight', cells: [cellId(3, 2)] },
  { id: 'item-spot-p2', typeId: 'spotlight', cells: [cellId(4, 1)] },
  { id: 'item-dirchair-p1', typeId: 'armchair', cells: [cellId(4, 4)] },
  { id: 'item-dirchair-p2', typeId: 'armchair', cells: [cellId(4, 6)] },
  { id: 'item-ladder-p', typeId: 'ladder', cells: [cellId(6, 3)] },
  // Декорация «Вестерн» (row 6 cols 0–1, row 7 cols 0–3, rows 8–11 cols 0–3): Захар (9,1), Богдан (11,3)
  { id: 'item-cactus-w1', typeId: 'cactus', cells: [cellId(8, 0)] },
  { id: 'item-cactus-w2', typeId: 'cactus', cells: [cellId(11, 0)] },
  { id: 'item-wagon-w', typeId: 'wagon', cells: [cellId(7, 0), cellId(7, 1)] },
  { id: 'item-hitch-w', typeId: 'hitchingPost', cells: [cellId(8, 3)] },
  { id: 'item-barrel-w', typeId: 'barrel', cells: [cellId(9, 0)] },
  { id: 'item-horse-w', typeId: 'horse', cells: [cellId(11, 2), cellId(11, 3)] },
  // Декорация «Улица» (rows 7–10 cols 4–8, row 11 cols 4–9): Игорь (8,7), Всеволод (10,8)
  { id: 'item-lamp-u1', typeId: 'lamppost', cells: [cellId(7, 4)] },
  { id: 'item-lamp-u2', typeId: 'lamppost', cells: [cellId(8, 6)] },
  { id: 'item-bench-u', typeId: 'bench', cells: [cellId(8, 4)] },
  { id: 'item-trash-u1', typeId: 'trashcan', cells: [cellId(8, 5)] },
  { id: 'item-trash-u2', typeId: 'trashcan', cells: [cellId(10, 4)] },
  { id: 'item-kiosk-u', typeId: 'kiosk', cells: [cellId(11, 4)] },
  { id: 'item-plant-u', typeId: 'plant', cells: [cellId(7, 5)] },
  { id: 'item-dirchair-u', typeId: 'armchair', cells: [cellId(10, 7)] },
  // Кафетерий (rows 8–10 cols 9–11, row 11 cols 10–11): никто
  { id: 'item-table-f1', typeId: 'table', cells: [cellId(8, 9)] },
  { id: 'item-table-f2', typeId: 'table', cells: [cellId(9, 10)] },
  { id: 'item-stool-f1', typeId: 'stool', cells: [cellId(8, 10)] },
  { id: 'item-stool-f2', typeId: 'stool', cells: [cellId(10, 9)] },
  { id: 'item-cooler-f', typeId: 'watercooler', cells: [cellId(9, 11)] },
  { id: 'item-fridge-f', typeId: 'fridge', cells: [cellId(8, 11)] },
  { id: 'item-popcorn-f', typeId: 'popcornStand', cells: [cellId(11, 11)] },
  // Просмотровый зал ((4,9),(5,8..10),(6,8..11),(7,9..11)): Леонид (6,11), Хиония (7,9)
  { id: 'item-sofa-z', typeId: 'sofa', cells: [cellId(7, 10), cellId(7, 11)] },
  { id: 'item-tv-z', typeId: 'tv', cells: [cellId(4, 9)] },
  { id: 'item-dirchair-z', typeId: 'armchair', cells: [cellId(5, 10)] },
  // Вход (rows 0–2 cols 10–11, rows 3–4 cols 10–11, (5,11)): Кира (4,10)
  { id: 'item-palm-e1', typeId: 'palm', cells: [cellId(0, 10)] },
  { id: 'item-palm-e2', typeId: 'palm', cells: [cellId(0, 11)] },
  { id: 'item-plant-e', typeId: 'plant', cells: [cellId(1, 10)] },
  { id: 'item-poster-e', typeId: 'portrait', cells: [cellId(2, 10)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// С = склад, Г = гримёрный, К = костюмерная, О = осветительный, П = звуковой павильон,
// В = вестерн, У = улица, Ф = кафетерий, З = просмотровый зал, Е = вход.
const ROOM_ROWS = [
  'ССГГГГККККЕЕ',
  'ССГГГГККККЕЕ',
  'ООГГГГККККЕЕ',
  'ООППППППККЕЕ',
  'ОПППППППКЗЕЕ',
  'ООППППППЗЗЗЕ',
  'ВВППППППЗЗЗЗ',
  'ВВВВУУУУУЗЗЗ',
  'ВВВВУУУУУФФФ',
  'ВВВВУУУУУФФФ',
  'ВВВВУУУУУФФФ',
  'ВВВВУУУУУУФФ',
];

const ROOM_BY_LETTER: Record<string, string> = {
  С: 'storage',
  Г: 'makeup',
  К: 'costume',
  О: 'lighting',
  П: 'soundstage',
  В: 'western',
  У: 'street',
  Ф: 'canteen',
  З: 'screening',
  Е: 'entrance',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

// Красная дорожка у входа; декорация травы в павильоне (фичи пола, не блокируют).
const RED_CARPET_CELLS = new Set<CellId>([cellId(3, 10), cellId(3, 11), cellId(4, 10), cellId(4, 11)]);
const GRASS_CELLS = new Set<CellId>([cellId(5, 5), cellId(5, 6), cellId(6, 6)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => {
  if (RED_CARPET_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'redCarpet' };
  if (GRASS_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'grassPatch' };
  return cell;
});

// Ночная смена киностудии. Актёры — гласные (Анна/Есения/Игорь), съёмочная группа — согласные.
// Скрытый режиссёр — Всеволод (кандидаты для игрока: Захар, Кира, Всеволод).
// Оператор Леонид застал сценаристку Хионию в просмотровом зале; жертва не упоминается ни в одной клю.
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['actor'] },
  { id: 'bogdan', name: 'Богдан', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['props', 'crew'] },
  { id: 'vsevolod', name: 'Всеволод', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['director', 'crew'] },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['makeupArtist', 'crew'] },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['soundEngineer', 'crew'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['actor'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['gaffer', 'crew'] },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['actor'] },
  { id: 'kira', name: 'Кира', initialLetter: 'К', gender: 'female', color: '#c98f38', isVictim: false, isMurderer: false, roles: ['crew'] },
  { id: 'leonid', name: 'Леонид', initialLetter: 'Л', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: true, roles: ['cameraOperator', 'crew'] },
  { id: 'khionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['screenwriter', 'crew'] },
];

const solution: Record<PersonId, CellId> = {
  anna: cellId(0, 2),
  bogdan: cellId(11, 3),
  vsevolod: cellId(10, 8),
  glafira: cellId(5, 5),
  demid: cellId(3, 4),
  esenia: cellId(1, 6),
  zhdan: cellId(2, 0),
  zakhar: cellId(9, 1),
  igor: cellId(8, 7),
  kira: cellId(4, 10),
  leonid: cellId(6, 11),
  khionia: cellId(7, 9),
};

const clues: Clue[] = [
  // — Правила ночной смены —
  { id: 'hw-actors-letters', type: 'letterRole', letterClass: 'vowel', roleId: 'actor', text: 'Все, чьё имя начиналось на гласную букву, были актёрами, остальные — членами съёмочной группы.' },
  {
    id: 'hw-actors-no-tech',
    type: 'roleZoneLimit',
    roleId: 'actor',
    roomIds: ['lighting', 'storage', 'screening'],
    maxCount: 0,
    text: 'Актёров не пускали в осветительный цех, на склад реквизита и в просмотровый зал.',
  },
  {
    id: 'hw-sets-attended',
    type: 'roleZoneMin',
    roleId: 'crew',
    roomIds: ['soundstage', 'western', 'street'],
    minCount: 1,
    text: 'Ни одна декорация не осталась без члена съёмочной группы.',
  },
  { id: 'hw-one-director', type: 'roleSingleton', roleId: 'director', text: 'Среди членов съёмочной группы был ровно один режиссёр.' },
  { id: 'hw-director-chair', type: 'adjacency', subject: { type: 'role', role: 'director' }, itemTypeId: 'armchair', text: 'Режиссёр находился рядом с режиссёрским креслом.' },
  // — Актёры —
  { id: 'hw-anna-north-esenia', type: 'relativePosition', subject: { type: 'person', id: 'anna' }, otherPersonId: 'esenia', axis: 'row', direction: 'before', offset: 1, text: 'Анна находилась ровно на один ряд севернее Есении.' },
  { id: 'hw-anna-odd-col', type: 'parity', subject: { type: 'person', id: 'anna' }, axis: 'col', parity: 'odd', text: 'Анна находилась в столбце с нечётным номером.' },
  { id: 'hw-esenia-odd-col', type: 'parity', subject: { type: 'person', id: 'esenia' }, axis: 'col', parity: 'odd', text: 'Есения находилась в столбце с нечётным номером.' },
  { id: 'hw-esenia-west-igor', type: 'relativePosition', subject: { type: 'person', id: 'esenia' }, otherPersonId: 'igor', axis: 'col', direction: 'before', offset: 1, text: 'Есения находилась ровно на один столбец западнее Игоря.' },
  { id: 'hw-igor-director-room', type: 'sameRoomAsRole', subject: { type: 'person', id: 'igor' }, roleId: 'director', text: 'Игорь находился в одной зоне с режиссёром.' },
  { id: 'hw-zhdan-corner', type: 'corner', subject: { type: 'person', id: 'zhdan' }, text: 'Ждан находился в углу своей зоны.' },
  { id: 'hw-demid-clapper', type: 'adjacency', subject: { type: 'person', id: 'demid' }, itemTypeId: 'clapperboard', text: 'Демид находился рядом с хлопушкой.' },
  { id: 'hw-zhdan-demid-rows', type: 'relativePosition', subject: { type: 'person', id: 'demid' }, otherPersonId: 'zhdan', axis: 'row', direction: 'after', offset: 1, text: 'Демид находился ровно на один ряд южнее Ждана.' },
  { id: 'hw-glafira-grass', type: 'floorFeature', subject: { type: 'person', id: 'glafira' }, featureId: 'grassPatch', text: 'Глафира находилась на декорации травы.' },
  { id: 'hw-glafira-even-row', type: 'parity', subject: { type: 'person', id: 'glafira' }, axis: 'row', parity: 'even', text: 'Глафира находилась в ряду с чётным номером.' },
  { id: 'hw-kira-carpet', type: 'floorFeature', subject: { type: 'person', id: 'kira' }, featureId: 'redCarpet', text: 'Кира находилась на красной дорожке.' },
  { id: 'hw-kira-odd-col', type: 'parity', subject: { type: 'person', id: 'kira' }, axis: 'col', parity: 'odd', text: 'Кира находилась в столбце с нечётным номером.' },
  // — Декорации —
  { id: 'hw-zakhar-barrel', type: 'adjacency', subject: { type: 'person', id: 'zakhar' }, itemTypeId: 'barrel', text: 'Захар находился рядом с бочкой.' },
  { id: 'hw-bogdan-horse', type: 'occupiesItem', subject: { type: 'person', id: 'bogdan' }, itemTypeId: 'horse', text: 'Богдан находился верхом на лошади.' },
  { id: 'hw-vsevolod-east-wall', type: 'wallSide', subject: { type: 'person', id: 'vsevolod' }, wallDirection: 'east', text: 'Всеволод находился у восточной стены своей зоны.' },
  // — Просмотровый зал (убийца; жертва не упоминается) —
  { id: 'hw-leonid-east-wall', type: 'wallSide', subject: { type: 'person', id: 'leonid' }, wallDirection: 'east', text: 'Леонид находился у восточной стены своей зоны.' },
  { id: 'hw-leonid-south-kira', type: 'relativePosition', subject: { type: 'person', id: 'leonid' }, otherPersonId: 'kira', axis: 'row', direction: 'after', offset: 2, text: 'Леонид находился ровно на два ряда южнее Киры.' },
];

export const hollywoodLevel: Level = {
  meta: { id: 'hollywood-01', title: 'Последний дубль', theme: 'hollywood', difficulty: 9, maxFullyPinnedPeople: 0 },
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
