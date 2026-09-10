import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 12;

// Бродячий цирк на окраине. Север — зверинец во всю ширину; центр — шатёр-манеж
// (песок), слева лужайка с аттракционами, справа гримёрка; юг — зрительские ряды,
// вход с кассами и столовая шапито. Роль-слой: гласные — артисты, зрители — по билетам.
const rooms: Room[] = [
  { id: 'wagons', name: 'Вагончики артистов', floorTexture: 'linoleum' },
  { id: 'backstage', name: 'За кулисами', floorTexture: 'wood' },
  { id: 'menagerie', name: 'Зверинец', floorTexture: 'dirt' },
  { id: 'arena', name: 'Арена', floorTexture: 'sand' },
  { id: 'fair', name: 'Лужайка с аттракционами', floorTexture: 'grass' },
  { id: 'makeup', name: 'Гримёрка', floorTexture: 'carpet' },
  { id: 'stands', name: 'Зрительские ряды', floorTexture: 'rubber' },
  { id: 'entrance', name: 'Вход', floorTexture: 'cobble' },
  { id: 'dining', name: 'Столовая шапито', floorTexture: 'tile' },
];

const floorFeatures: FloorFeature[] = [
  { id: 'sawdust', label: 'Опилки', textureKey: 'cliff' },
  { id: 'runner', label: 'Ковровая дорожка', textureKey: 'rug' },
];
const SAWDUST_CELLS = new Set([
  cellId(4, 3), cellId(4, 4), cellId(5, 4), cellId(5, 5),
  cellId(6, 3), cellId(6, 4), cellId(6, 5), cellId(6, 6),
]);
const RUNNER_CELLS = new Set([cellId(9, 6), cellId(10, 5)]);

const itemTypes: ItemType[] = [
  ItemLibrary.wagon(),
  ItemLibrary.box(),
  ItemLibrary.barrel(),
  ItemLibrary.clueBoard(),
  ItemLibrary.cage(),
  ItemLibrary.lion(),
  ItemLibrary.giraffe(),
  ItemLibrary.hippo(),
  ItemLibrary.zebra(),
  ItemLibrary.monkey(),
  ItemLibrary.trough(),
  ItemLibrary.ball(),
  ItemLibrary.carousel(),
  ItemLibrary.shootingGallery(),
  ItemLibrary.popcornStand(),
  ItemLibrary.tree(),
  ItemLibrary.makeupMirror(),
  ItemLibrary.hoop(),
  ItemLibrary.seat(),
  ItemLibrary.table(),
  ItemLibrary.bench(),
  ItemLibrary.kassa(),
  ItemLibrary.turnstile(),
  ItemLibrary.lamppost(),
  ItemLibrary.trashcan(),
];

const items: Item[] = [
  // Вагончики артистов
  { id: 'item-wagon-1', typeId: 'wagon', cells: [cellId(0, 0)] },
  { id: 'item-wagon-2', typeId: 'wagon', cells: [cellId(0, 2)] },
  { id: 'item-wagon-3', typeId: 'wagon', cells: [cellId(1, 3)] },
  { id: 'item-wagon-4', typeId: 'wagon', cells: [cellId(2, 0)] },
  { id: 'item-box-w', typeId: 'box', cells: [cellId(1, 0)] },
  // За кулисами
  { id: 'item-box-b1', typeId: 'box', cells: [cellId(0, 5)] },
  { id: 'item-box-b2', typeId: 'box', cells: [cellId(1, 6)] },
  { id: 'item-barrel-b', typeId: 'barrel', cells: [cellId(0, 7)] },
  { id: 'item-clueboard', typeId: 'clueBoard', cells: [cellId(3, 4)] },
  // Зверинец
  { id: 'item-cage-1', typeId: 'cage', cells: [cellId(0, 8)] },
  { id: 'item-cage-2', typeId: 'cage', cells: [cellId(1, 9)] },
  { id: 'item-cage-3', typeId: 'cage', cells: [cellId(1, 11)] },
  { id: 'item-cage-4', typeId: 'cage', cells: [cellId(3, 7)] },
  { id: 'item-cage-5', typeId: 'cage', cells: [cellId(3, 9)] },
  { id: 'item-cage-6', typeId: 'cage', cells: [cellId(5, 11)] },
  { id: 'item-lion', typeId: 'lion', cells: [cellId(4, 11)] },
  { id: 'item-giraffe', typeId: 'giraffe', cells: [cellId(0, 11)] },
  { id: 'item-hippo', typeId: 'hippo', cells: [cellId(2, 9)] },
  { id: 'item-zebra', typeId: 'zebra', cells: [cellId(2, 10)] },
  { id: 'item-monkey', typeId: 'monkey', cells: [cellId(2, 11)] },
  { id: 'item-trough-1', typeId: 'trough', cells: [cellId(5, 9)] },
  { id: 'item-trough-2', typeId: 'trough', cells: [cellId(6, 10)] },
  // Арена
  { id: 'item-ball-1', typeId: 'ball', cells: [cellId(4, 5)] },
  { id: 'item-ball-2', typeId: 'ball', cells: [cellId(5, 6)] },
  { id: 'item-ball-3', typeId: 'ball', cells: [cellId(7, 4)] },
  // Лужайка
  { id: 'item-carousel', typeId: 'carousel', cells: [cellId(5, 1)] },
  { id: 'item-shooting-gallery', typeId: 'shootingGallery', cells: [cellId(3, 1)] },
  { id: 'item-popcorn-1', typeId: 'popcornStand', cells: [cellId(7, 1)] },
  { id: 'item-tree-1', typeId: 'tree', cells: [cellId(3, 2)] },
  { id: 'item-tree-2', typeId: 'tree', cells: [cellId(7, 0)] },
  { id: 'item-tree-3', typeId: 'tree', cells: [cellId(4, 2)] },
  { id: 'item-tree-4', typeId: 'tree', cells: [cellId(7, 2)] },
  // Гримёрка
  { id: 'item-mirror', typeId: 'makeupMirror', cells: [cellId(7, 8)] },
  { id: 'item-hoop', typeId: 'hoop', cells: [cellId(7, 6)] },
  // Зрительские ряды
  { id: 'item-seat-1', typeId: 'seat', cells: [cellId(10, 2)] },
  { id: 'item-seat-2', typeId: 'seat', cells: [cellId(8, 0)] },
  { id: 'item-seat-3', typeId: 'seat', cells: [cellId(9, 3)] },
  // Столовая
  { id: 'item-table-1', typeId: 'table', cells: [cellId(11, 10)] },
  { id: 'item-table-2', typeId: 'table', cells: [cellId(9, 9)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(9, 10)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(9, 11)] },
  { id: 'item-bench-3', typeId: 'bench', cells: [cellId(11, 11)] },
  { id: 'item-bench-4', typeId: 'bench', cells: [cellId(10, 10)] },
  // Вход
  { id: 'item-kassa-1', typeId: 'kassa', cells: [cellId(10, 6)] },
  { id: 'item-kassa-2', typeId: 'kassa', cells: [cellId(10, 8)] },
  { id: 'item-turnstile-1', typeId: 'turnstile', cells: [cellId(9, 7)] },
  { id: 'item-turnstile-2', typeId: 'turnstile', cells: [cellId(10, 7)] },
  { id: 'item-lamp-e', typeId: 'lamppost', cells: [cellId(11, 6)] },
  { id: 'item-trashcan-e', typeId: 'trashcan', cells: [cellId(11, 8)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// W = вагончики, B = за кулисами, M = зверинец, A = арена, F = лужайка,
// U = гримёрка, S = зрительские ряды, E = вход, D = столовая.
const ROOM_ROWS = [
  'WWWWBBBBMMMM',
  'WWWWBBBBMMMM',
  'WWWBBBBBMMMM',
  'FFFBBBBMMMMM',
  'FFFAAAAAMMMM',
  'FFFAAAAAMMMM',
  'FFFAAAAAMMMM',
  'FFFAAAUUUMMM',
  'SSSSSSUUUDDD',
  'SSSSSSEEEDDD',
  'SSSSSEEEEDDD',
  'SSSSSEEEEDDD',
];

const ROOM_BY_LETTER: Record<string, string> = {
  W: 'wagons',
  B: 'backstage',
  M: 'menagerie',
  A: 'arena',
  F: 'fair',
  U: 'makeup',
  S: 'stands',
  E: 'entrance',
  D: 'dining',
};

function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col))).map((cell) => {
  if (SAWDUST_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'sawdust' };
  if (RUNNER_CELLS.has(cell.id)) return { ...cell, floorFeatureId: 'runner' };
  return cell;
});

// Роли: буквы К–Х (Кирилл, Людмила, Харитон) — зрители; остальные — артисты цирка.
// Скрытый клоун — Ждан (убийца, артист).
const people: Person[] = [
  { id: 'anna', name: 'Анна', initialLetter: 'А', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'vadim', name: 'Вадим', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#2bc4c4', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#9b7ce0', isVictim: false, isMurderer: true, roles: ['clown', 'performer'] },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'igor', name: 'Игорь', initialLetter: 'И', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false, roles: ['performer'] },
  { id: 'kirill', name: 'Кирилл', initialLetter: 'К', gender: 'male', color: '#c98f38', isVictim: false, isMurderer: false, roles: ['spectator'] },
  { id: 'liudmila', name: 'Людмила', initialLetter: 'Л', gender: 'female', color: '#b06ab3', isVictim: false, isMurderer: false, roles: ['spectator'] },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8f7ca8', isVictim: true, isMurderer: false, roles: ['spectator'] },
];

// Судоку-инвариант: все ряды/столбцы различны. Клоун Ждан и зритель Харитон — вдвоём
// в гримёрке; зрители Кирилл и Людмила — на трибунах и в столовой (вне запретных зон).
const solution: Record<PersonId, CellId> = {
  anna: cellId(0, 9),
  vadim: cellId(1, 4),
  igor: cellId(2, 1),
  zoya: cellId(3, 5),
  boris: cellId(4, 10),
  glafira: cellId(5, 0),
  esenia: cellId(6, 3),
  zhdan: cellId(7, 7),
  khariton: cellId(8, 8),
  demid: cellId(9, 6),
  kirill: cellId(10, 2),
  liudmila: cellId(11, 11),
};

const clues: Clue[] = [
  // — Правила бродячего цирка —
  { id: 'cr-letters', type: 'letterRangeRole', fromLetter: 'К', toLetter: 'Х', roleId: 'spectator', text: 'Все, чьё имя начиналось с буквы от К до Х, были зрителями; остальные — артистами цирка.' },
  {
    id: 'cr-spectators-no-backstage',
    type: 'roleZoneLimit',
    roleId: 'spectator',
    roomIds: ['backstage', 'menagerie'],
    maxCount: 0,
    text: 'Зрителей не пускали ни за кулисы, ни в зверинец.',
  },
  { id: 'cr-one-clown', type: 'roleSingleton', roleId: 'clown', text: 'Среди артистов цирка был ровно один клоун.' },
  // — Зверинец —
  { id: 'cr-anna-cage', type: 'adjacency', subject: { type: 'person', id: 'anna' }, itemTypeId: 'cage', text: 'Анна находилась рядом с клеткой.' },
  { id: 'cr-anna-row', type: 'parity', subject: { type: 'person', id: 'anna' }, axis: 'row', parity: 'odd', text: 'Анна находилась в ряду с нечётным номером.' },
  { id: 'cr-boris-lion', type: 'adjacency', subject: { type: 'person', id: 'boris' }, itemTypeId: 'lion', text: 'Борис находился рядом со львом.' },
  // — За кулисами —
  { id: 'cr-vadim-col', type: 'position', subject: { type: 'person', id: 'vadim' }, axis: 'col', value: 4, text: 'Вадим находился в 5-м столбце.' },
  { id: 'cr-zoya-south', type: 'wallSide', subject: { type: 'person', id: 'zoya' }, wallDirection: 'south', text: 'Зоя находилась у южной стены своей зоны.' },
  { id: 'cr-zoya-row', type: 'position', subject: { type: 'person', id: 'zoya' }, axis: 'row', value: 3, text: 'Зоя находилась в 4-м ряду.' },
  // — Арена и лужайка —
  { id: 'cr-esenia-sawdust', type: 'floorFeature', subject: { type: 'person', id: 'esenia' }, featureId: 'sawdust', text: 'Есения находилась на опилках.' },
  { id: 'cr-esenia-west', type: 'wallSide', subject: { type: 'person', id: 'esenia' }, wallDirection: 'west', text: 'Есения находилась у западной стены своей зоны.' },
  { id: 'cr-glafira-col', type: 'position', subject: { type: 'person', id: 'glafira' }, axis: 'col', value: 0, text: 'Глафира находилась в 1-м столбце.' },
  // — Гримёрка: скрытый клоун —
  { id: 'cr-clown-hoop', type: 'adjacency', subject: { type: 'role', role: 'clown' }, itemTypeId: 'hoop', text: 'Клоун находился рядом с обручем.' },
  { id: 'cr-zhdan-not-lion', type: 'adjacency', subject: { type: 'person', id: 'zhdan' }, itemTypeId: 'lion', negated: true, text: 'Ждан не находился рядом со львом.' },
  // — Вагончики, вход, трибуны, столовая —
  { id: 'cr-igor-wagon', type: 'adjacency', subject: { type: 'person', id: 'igor' }, itemTypeId: 'wagon', text: 'Игорь находился рядом с вагончиком.' },
  { id: 'cr-demid-runner', type: 'floorFeature', subject: { type: 'person', id: 'demid' }, featureId: 'runner', text: 'Демид находился на ковровой дорожке.' },
  { id: 'cr-kirill-seat', type: 'occupiesItem', subject: { type: 'person', id: 'kirill' }, itemTypeId: 'seat', text: 'Кирилл находился на сиденье трибуны.' },
  { id: 'cr-liudmila-bench', type: 'occupiesItem', subject: { type: 'person', id: 'liudmila' }, itemTypeId: 'bench', text: 'Людмила находилась на скамейке.' },
];

export const circusLevel: Level = {
  meta: { id: 'circus-01', title: 'Шоу не по плану', theme: 'circus', difficulty: 9, maxFullyPinnedPeople: 0 },
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
