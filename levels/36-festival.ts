import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 12; // 12×12 — квадратная доска

// «Песни и крик»: музыкальный фестиваль под открытым небом. Залив на западе,
// пляж вокруг него, парк в центре, три сцены (северная/центральная/южная),
// зона питания на востоке, зона развлечений и вход на юго-востоке.
// Особенность уровня: текстуры «перетекают» между зонами — песок парка
// (коса), сцены из металла в трёх разных зонах, залив внутри пляжа.
const rooms: Room[] = [
  { id: 'beach', name: 'Пляж', floorTexture: 'sand' },
  { id: 'park', name: 'Парк', floorTexture: 'grass' },
  { id: 'north', name: 'Северная сцена', floorTexture: 'grass', labelPosition: 'top' },
  { id: 'center', name: 'Центральная сцена', floorTexture: 'grass' },
  { id: 'south', name: 'Южная сцена', floorTexture: 'sand' },
  { id: 'food', name: 'Зона питания', floorTexture: 'stairs' },
  { id: 'fun', name: 'Зона развлечений', floorTexture: 'rubber' },
  { id: 'entrance', name: 'Вход', floorTexture: 'concrete' },
];

// Б=пляж, П=парк, С=северная сцена, Ц=центральная сцена, Ю=южная сцена,
// Е=зона питания, Р=зона развлечений, В=вход.
const ROOM_ROWS = [
  'ББББББББСССС',
  'ББББББББСССС',
  'БББББББПСССС',
  'ББББББППСССС',
  'ББББППППППСС',
  'ББББПЦЦЦППСС',
  'ББББПЦЦЦЕЕЕЕ',
  'ББББПЦЦЦЕЕЕЕ',
  'ЮЮЮЮПЦЦЦПЕЕЕ',
  'ЮЮЮЮППППППВВ',
  'ЮЮЮЮПРРРППВВ',
  'ЮЮЮЮРРРРРВВВ',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      Б: 'beach',
      П: 'park',
      С: 'north',
      Ц: 'center',
      Ю: 'south',
      Е: 'food',
      Р: 'fun',
      В: 'entrance',
    } as Record<string, string>
  )[ch]!;
}

// Грид текстур (только для фич): З=вода (Залив), С=металл (Сцена),
// П=песок в парке (Песчаная коса). Остальные клетки наследуют текстуру зоны.
const TEXTURE_ROWS = [
  'ЗЗЗЗЗЗЗПСССС',
  'ЗЗЗЗЗПППСССС',
  'ЗЗЗППППТТТТТ',
  'ЗЗППППТТТТТТ',
  'ЗЗППТТТТТТТТ',
  'ЗЗППТТТТТТТТ',
  'ППППТТССЕЕЕЕ',
  'ППППТТССЕЕЕЕ',
  'ППППТТТТТЕЕЕ',
  'ППППТТТТТТАА',
  'ССССТРРРТТАА',
  'ССССРРРРРААА',
];

function featureForCell(row: number, col: number): string | undefined {
  const tex = TEXTURE_ROWS[row][col];
  if (tex === 'З') return 'zaliv';
  if (tex === 'С') return 'stage';
  if (tex === 'П' && roomForCell(row, col) === 'park') return 'kosa';
  return undefined;
}

// Фичи пола: Залив (вода западного края пляжа), Сцена (металл — несвязные
// куски в трёх сценах: 8 север + 4 центр + 8 юг), Песчаная коса (песок,
// перетекающий из пляжа в парк у северной сцены).
const floorFeatures = [
  { id: 'zaliv', label: 'Залив', textureKey: 'water' },
  { id: 'stage', label: 'Сцена', textureKey: 'metal' },
  { id: 'kosa', label: 'Песчаная коса', textureKey: 'sand' },
];

const itemTypes: ItemType[] = [
  ItemLibrary.yacht(),
  ItemLibrary.lifeboat(),
  ItemLibrary.lifebuoy(),
  ItemLibrary.palm(),
  ItemLibrary.shell(),
  ItemLibrary.hammock(),
  ItemLibrary.trashcan(),
  ItemLibrary.spotlight(),
  ItemLibrary.guitar(),
  ItemLibrary.speaker(),
  ItemLibrary.micStand(),
  ItemLibrary.piano(),
  ItemLibrary.kiosk(),
  ItemLibrary.veggieCounter(),
  ItemLibrary.table(),
  ItemLibrary.popcornStand(),
  ItemLibrary.bench(),
  ItemLibrary.tree(),
  ItemLibrary.lamppost(),
  ItemLibrary.carousel(),
  ItemLibrary.ferrisWheel(),
  ItemLibrary.shootingGallery(),
  ItemLibrary.slotMachine(),
  ItemLibrary.turnstile(),
  ItemLibrary.neonSign(),
  ItemLibrary.kassa(),
];

const items: Item[] = [
  // Залив: яхта у северо-западного берега, две шлюпки, спаскруги под пловцами
  { id: 'item-yacht', typeId: 'yacht', cells: [cellId(3, 0), cellId(3, 1)] },
  { id: 'item-boat-1', typeId: 'lifeboat', cells: [cellId(5, 0)] },
  { id: 'item-boat-2', typeId: 'lifeboat', cells: [cellId(0, 2)] },
  { id: 'item-buoy-1', typeId: 'lifebuoy', cells: [cellId(0, 4)] }, // Жанна
  { id: 'item-buoy-2', typeId: 'lifebuoy', cells: [cellId(1, 0)] }, // Борис
  // Пляж: пальмы, ракушки, гамак, урна
  { id: 'item-palm-1', typeId: 'palm', cells: [cellId(0, 7)] },
  { id: 'item-palm-2', typeId: 'palm', cells: [cellId(2, 5)] },
  { id: 'item-shell-1', typeId: 'shell', cells: [cellId(1, 6)] },
  { id: 'item-shell-2', typeId: 'shell', cells: [cellId(4, 2)] },
  { id: 'item-hammock', typeId: 'hammock', cells: [cellId(6, 2)] },
  { id: 'item-trash-beach', typeId: 'trashcan', cells: [cellId(2, 3)] },
  // Северная сцена: прожектор, колонка и гитара на металле сцены
  { id: 'item-spot-north', typeId: 'spotlight', cells: [cellId(0, 8)] },
  { id: 'item-spk-north', typeId: 'speaker', cells: [cellId(1, 8)] },
  { id: 'item-guitar', typeId: 'guitar', cells: [cellId(1, 11)] },
  // Центральная сцена: стойка с микрофоном и пианино на металле
  { id: 'item-mic', typeId: 'micStand', cells: [cellId(6, 6)] },
  { id: 'item-piano', typeId: 'piano', cells: [cellId(7, 6), cellId(7, 7)] },
  // Южная сцена: прожектор и колонка на металле
  { id: 'item-spot-south', typeId: 'spotlight', cells: [cellId(11, 0)] },
  { id: 'item-spk-south', typeId: 'speaker', cells: [cellId(10, 3)] },
  // Зона питания: киоск, стол, овощной прилавок, урна
  { id: 'item-kiosk', typeId: 'kiosk', cells: [cellId(6, 9)] },
  { id: 'item-table-food', typeId: 'table', cells: [cellId(7, 8), cellId(7, 9)] },
  { id: 'item-veggie', typeId: 'veggieCounter', cells: [cellId(7, 11)] },
  { id: 'item-trash-food', typeId: 'trashcan', cells: [cellId(8, 11)] },
  // Зона развлечений: карусель (под Леонидом), колесо, тир, игровой автомат
  { id: 'item-carousel', typeId: 'carousel', cells: [cellId(11, 8)] }, // Леонид
  { id: 'item-ferris', typeId: 'ferrisWheel', cells: [cellId(11, 4)] },
  { id: 'item-gallery', typeId: 'shootingGallery', cells: [cellId(10, 5)] },
  { id: 'item-slot', typeId: 'slotMachine', cells: [cellId(10, 7)] },
  // Парк: попкорн в разных рядах и столбцах, скамейки, ели, урна, фонарь
  { id: 'item-popcorn-1', typeId: 'popcornStand', cells: [cellId(4, 4)] },
  { id: 'item-popcorn-2', typeId: 'popcornStand', cells: [cellId(9, 5)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(5, 8)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(8, 4)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(10, 9)] },
  { id: 'item-tree-1', typeId: 'tree', cells: [cellId(5, 4)] },
  { id: 'item-tree-2', typeId: 'tree', cells: [cellId(7, 4)] },
  { id: 'item-tree-3', typeId: 'tree', cells: [cellId(9, 9)] },
  { id: 'item-trash-park', typeId: 'trashcan', cells: [cellId(4, 5)] },
  { id: 'item-lamp-park', typeId: 'lamppost', cells: [cellId(4, 7)] },
  // Вход: турникеты, неоновая вывеска, касса
  { id: 'item-turnstile-1', typeId: 'turnstile', cells: [cellId(9, 10)] },
  { id: 'item-turnstile-2', typeId: 'turnstile', cells: [cellId(9, 11)] },
  { id: 'item-neon', typeId: 'neonSign', cells: [cellId(10, 10)] },
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(11, 11)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map(
  (cell) => {
    const featureId = featureForCell(cell.row, cell.col);
    return featureId ? { ...cell, floorFeatureId: featureId } : cell;
  },
);

// Состав 12 человек (6 м / 6 ж) + жертва Хлоя. Музыканты — гласные (Анна,
// Егор, Игорь), остальные посетители; Анна — хедлайнер и убийца.
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: true, roles: ['musician', 'headliner', 'visitor'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'vera', name: 'Вера', initialLetter: 'В', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'egor', name: 'Егор', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['musician', 'visitor'] },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['musician', 'visitor'] },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#c98f38', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'leonid', name: 'Леонид', initialLetter: 'Л', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false, roles: ['visitor'] },
  { id: 'khloya', name: 'Хлоя', initialLetter: 'Х', gender: 'female', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['visitor'] },
];

// Перестановка 12×12 (один человек на ряд и столбец). Анна-хедлайнер (5,6) и
// жертва Хлоя (7,5) — вдвоём на центральной сцене (обе на траве у металла);
// Егор (2,11) — трава северной сцены, Игорь (10,2) — металл южной сцены;
// Борис и Жанна — пловцы на кругах в заливе, Леонид — на карусели.
const solution: Record<PersonId, CellId> = {
  anna: cellId(5, 6),
  boris: cellId(1, 0),
  vera: cellId(6, 10),
  grigory: cellId(3, 3),
  darya: cellId(8, 1),
  egor: cellId(2, 11),
  zhanna: cellId(0, 4),
  zoya: cellId(4, 9),
  igor: cellId(10, 2),
  kirill: cellId(9, 7),
  leonid: cellId(11, 8),
  khloya: cellId(7, 5),
};

const clues: Clue[] = [
  // — Роль-слой фестиваля —
  {
    id: 'f1',
    type: 'letterRole',
    letterClass: 'vowel',
    roleId: 'musician',
    text: 'Все, чьё имя начинается на гласную, были музыкантами фестиваля; остальные — посетителями.',
  },
  {
    id: 'f2',
    type: 'roleZoneMin',
    roleId: 'musician',
    roomIds: ['north', 'center', 'south'],
    minCount: 1,
    text: 'Ни одна зона сцены не осталась без музыканта.',
  },
  {
    id: 'f3',
    type: 'roleSingleton',
    roleId: 'headliner',
    text: 'Среди музыкантов был ровно один хедлайнер.',
  },
  {
    id: 'f4',
    type: 'adjacency',
    subject: { type: 'role', role: 'headliner' },
    itemTypeId: 'micStand',
    text: 'Хедлайнер был рядом со стойкой микрофона.',
  },
  {
    id: 'f23',
    type: 'aloneInRoom',
    subject: { type: 'person', id: 'egor' },
    text: 'Егор был в своей зоне один.',
  },
  {
    id: 'f5',
    type: 'itemTypeFullyOccupied',
    itemTypeId: 'lifebuoy',
    text: 'Ни один спасательный круг не остался без пловца.',
  },
  // — Личные: фичевые и зонные (первый слой) —
  {
    id: 'f6',
    type: 'floorTexture',
    subject: { type: 'person', id: 'anna' },
    textureKey: 'grass',
    text: 'Анна стояла на траве.',
  },
  {
    id: 'f7',
    type: 'floorFeature',
    subject: { type: 'person', id: 'boris' },
    featureId: 'zaliv',
    text: 'Борис купался в заливе.',
  },
  {
    id: 'f8',
    type: 'adjacency',
    subject: { type: 'person', id: 'vera' },
    itemTypeId: 'kiosk',
    text: 'Вера была рядом с киоском.',
  },
  {
    id: 'f9',
    type: 'floorTexture',
    subject: { type: 'person', id: 'grigory' },
    textureKey: 'sand',
    text: 'Григорий был на песке.',
  },
  {
    id: 'f10',
    type: 'floorTexture',
    subject: { type: 'person', id: 'darya' },
    textureKey: 'sand',
    text: 'Дарья была на песке.',
  },
  {
    id: 'f11',
    type: 'floorTexture',
    subject: { type: 'person', id: 'egor' },
    textureKey: 'grass',
    text: 'Егор репетировал на траве.',
  },
  {
    id: 'f12',
    type: 'floorFeature',
    subject: { type: 'person', id: 'zhanna' },
    featureId: 'zaliv',
    text: 'Жанна купалась в заливе.',
  },
  {
    id: 'f13',
    type: 'floorTexture',
    subject: { type: 'person', id: 'zoya' },
    textureKey: 'grass',
    text: 'Зоя была на траве.',
  },
  {
    id: 'f14',
    type: 'floorTexture',
    subject: { type: 'person', id: 'igor' },
    textureKey: 'metal',
    text: 'Игорь был на сцене.',
  },
  {
    id: 'f15',
    type: 'sameRoomAs',
    subject: { type: 'person', id: 'kirill' },
    otherPersonId: 'zoya',
    text: 'Кирилл гулял в той же зоне, что и Зоя.',
  },
  {
    id: 'f16',
    type: 'roomMembership',
    subject: { type: 'person', id: 'leonid' },
    roomId: 'fun',
    text: 'Леонид был в зоне развлечений.',
  },
  // — Личные: различители (второй слой) —
  {
    id: 'f17',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zhanna' },
    otherPersonId: 'boris',
    axis: 'row',
    direction: 'before',
    offset: 1,
    text: 'Жанна была ровно на один ряд севернее Бориса.',
  },
  {
    id: 'f18',
    type: 'adjacency',
    subject: { type: 'person', id: 'grigory' },
    itemTypeId: 'trashcan',
    text: 'Григорий был рядом с урной.',
  },
  {
    id: 'f19',
    type: 'parity',
    subject: { type: 'person', id: 'darya' },
    axis: 'row',
    parity: 'odd',
    text: 'Дарья была в нечётном ряду.',
  },
  {
    id: 'f20',
    type: 'parity',
    subject: { type: 'person', id: 'igor' },
    axis: 'row',
    parity: 'odd',
    text: 'Игорь был в нечётном ряду.',
  },
  {
    id: 'f21',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zoya' },
    otherPersonId: 'kirill',
    axis: 'row',
    direction: 'before',
    text: 'Зоя была севернее Кирилла.',
  },
  {
    id: 'f22',
    type: 'relativePosition',
    subject: { type: 'person', id: 'vera' },
    otherPersonId: 'zoya',
    axis: 'col',
    direction: 'after',
    text: 'Вера была восточнее Зои.',
  },
  {
    id: 'f24',
    type: 'parity',
    subject: { type: 'person', id: 'kirill' },
    axis: 'col',
    parity: 'even',
    text: 'Кирилл был в чётном столбце.',
  },
  {
    id: 'f25',
    type: 'relativePosition',
    subject: { type: 'person', id: 'leonid' },
    otherPersonId: 'kirill',
    axis: 'col',
    direction: 'after',
    text: 'Леонид был восточнее Кирилла.',
  },
  {
    id: 'f26',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'igor',
    axis: 'col',
    direction: 'before',
    text: 'Дарья была западнее Игоря.',
  },
];

const level: Level = {
  meta: {
    id: 'festival-01',
    title: 'Песни и крик',
    theme: 'festival',
    difficulty: 9,
    maxFullyPinnedPeople: 0,
    rosterColumnCounts: [5, 4, 3],
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

export const festivalLevel: Level = level;
export { size, roomForCell };
