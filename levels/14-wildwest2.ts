import type { CellId, FloorFeature, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

export const size = 11;

const rooms: Room[] = [
  { id: 'saloon', name: 'Салун', floorTexture: 'wood' },
  { id: 'bank', name: 'Банк', floorTexture: 'stone' },
  { id: 'street', name: 'Главная улица', floorTexture: 'dirt' },
  { id: 'office', name: 'Офис шерифа', floorTexture: 'wood' },
  { id: 'stable', name: 'Конюшня', floorTexture: 'sand' },
];

const floorFeatures: FloorFeature[] = [{ id: 'boardwalk', label: 'Дощатый тротуар', textureKey: 'wood' }];

const itemTypes: ItemType[] = [
  { id: 'barCounter', label: 'Барная стойка', kind: 'decorative', icon: 'barCounter' },
  ItemLibrary.piano(),
  ItemLibrary.billiardTable(),
  ItemLibrary.barStool(),
  ItemLibrary.hitchingPost(),
  { id: 'haystack', label: 'Стог сена', kind: 'decorative', icon: 'haystack' },
  { id: 'horse', label: 'Лошадь', kind: 'occupiable', icon: 'horse' },
  { id: 'cactus', label: 'Кактус', kind: 'decorative', icon: 'cactus' },
  { id: 'wagon', label: 'Повозка', kind: 'decorative', icon: 'wagon' },
  { id: 'trough', label: 'Корыто с водой', kind: 'decorative', icon: 'trough' },
  ItemLibrary.barrel(),
  ItemLibrary.safe('Банковский сейф'),
  ItemLibrary.lamppost(),
  ItemLibrary.trashcan(),
  ItemLibrary.box(),
  ItemLibrary.plant(),
  ItemLibrary.chair(),
  ItemLibrary.workbench('Стол шерифа'),
  ItemLibrary.portrait('Портрет шерифа'),
  ItemLibrary.ladder(),
];

const items: Item[] = [
  // Saloon
  { id: 'item-bar-counter', typeId: 'barCounter', cells: [cellId(0, 0), cellId(0, 1)] },
  { id: 'item-piano', typeId: 'piano', cells: [cellId(1, 4)] },
  { id: 'item-billiard', typeId: 'billiardTable', cells: [cellId(2, 4), cellId(2, 5)] },
  { id: 'item-stool-1', typeId: 'barStool', cells: [cellId(1, 1)] },
  { id: 'item-stool-2', typeId: 'barStool', cells: [cellId(3, 1)] },
  { id: 'item-barrel-saloon', typeId: 'barrel', cells: [cellId(4, 0)] },
  { id: 'item-box-saloon', typeId: 'box', cells: [cellId(0, 6)] },
  // Bank
  { id: 'item-safe', typeId: 'safe', cells: [cellId(2, 10)] },
  { id: 'item-chair-bank', typeId: 'chair', cells: [cellId(1, 10)] },
  { id: 'item-portrait-bank', typeId: 'portrait', cells: [cellId(0, 8)] },
  { id: 'item-box-bank', typeId: 'box', cells: [cellId(3, 9)] },
  // Street
  { id: 'item-wagon', typeId: 'wagon', cells: [cellId(5, 0), cellId(5, 1)] },
  { id: 'item-cactus-1', typeId: 'cactus', cells: [cellId(4, 4)] },
  { id: 'item-cactus-2', typeId: 'cactus', cells: [cellId(6, 2)] },
  { id: 'item-cactus-3', typeId: 'cactus', cells: [cellId(5, 8)] },
  { id: 'item-trough-street', typeId: 'trough', cells: [cellId(6, 4)] },
  { id: 'item-lamp-1', typeId: 'lamppost', cells: [cellId(4, 8)] },
  { id: 'item-lamp-2', typeId: 'lamppost', cells: [cellId(6, 0)] },
  { id: 'item-barrel-street', typeId: 'barrel', cells: [cellId(5, 2)] },
  { id: 'item-trashcan-street', typeId: 'trashcan', cells: [cellId(6, 8)] },
  { id: 'item-hitching', typeId: 'hitchingPost', cells: [cellId(4, 9)] },
  { id: 'item-horse-street-1', typeId: 'horse', cells: [cellId(4, 10)] },
  { id: 'item-horse-street-2', typeId: 'horse', cells: [cellId(5, 4)] },
  // Sheriff's office
  { id: 'item-desk', typeId: 'workbench', cells: [cellId(8, 1)] },
  { id: 'item-chair-office-1', typeId: 'chair', cells: [cellId(8, 2)] },
  { id: 'item-chair-office-2', typeId: 'chair', cells: [cellId(10, 0)] },
  { id: 'item-portrait-office', typeId: 'portrait', cells: [cellId(7, 0)] },
  { id: 'item-ladder-office', typeId: 'ladder', cells: [cellId(10, 3)] },
  { id: 'item-plant-office', typeId: 'plant', cells: [cellId(9, 0)] },
  { id: 'item-box-office', typeId: 'box', cells: [cellId(8, 4)] },
  // Stable
  { id: 'item-hay-1', typeId: 'haystack', cells: [cellId(7, 9)] },
  { id: 'item-hay-2', typeId: 'haystack', cells: [cellId(8, 8)] },
  { id: 'item-horse-stable-1', typeId: 'horse', cells: [cellId(9, 8)] },
  { id: 'item-horse-stable-2', typeId: 'horse', cells: [cellId(10, 5)] },
  { id: 'item-trough-stable', typeId: 'trough', cells: [cellId(9, 10)] },
  { id: 'item-barrel-stable', typeId: 'barrel', cells: [cellId(10, 10)] },
  { id: 'item-box-stable', typeId: 'box', cells: [cellId(8, 7)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// Five zones on an 11x11 board — a frontier town cut by the main street: saloon (S) top-left with a
// street-side notch, bank (B) top-right staircasing down, the main street (T) a wide bent band
// through the middle rows, sheriff's office (O) bottom-left with a corridor notch, stable (K)
// bottom-right staircasing up. All five are bent/non-rectangular single connected regions.
const ROOM_ROWS = [
  'SSSSSSSBBBB',
  'SSSSSSSBBBB',
  'SSSSSSBBBBB',
  'SSSSSTTTBBB',
  'SSTTTTTTTTT',
  'TTTTTTTTTTT',
  'TTTTTTTTTKK',
  'OOOOOTTTKKK',
  'OOOOOOTKKKK',
  'OOOOOKKKKKK',
  'OOOOOKKKKKK',
].map((row) => row.slice(0, 11));

const ROOM_BY_LETTER: Record<string, string> = {
  S: 'saloon',
  B: 'bank',
  T: 'street',
  O: 'office',
  K: 'stable',
};

export function roomForCell(row: number, col: number): string {
  return ROOM_BY_LETTER[ROOM_ROWS[row][col]];
}

const BOARDWALK_CELLS = new Set<CellId>([cellId(4, 2), cellId(4, 3)]);

const cells = buildCells(
  size,
  roomForCell,
  (row, col) => itemIdByCell.get(cellId(row, col)),
).map((cell) => (BOARDWALK_CELLS.has(cell.id) ? { ...cell, floorFeatureId: 'boardwalk' } : cell));

const people: Person[] = [
  { id: 'artem', name: 'Артём', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'bella', name: 'Белла', initialLetter: 'Б', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'vladimir', name: 'Владимир', initialLetter: 'В', gender: 'male', color: '#e0824a', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'demyan', name: 'Демьян', initialLetter: 'Д', gender: 'male', color: '#c9536b', isVictim: false, isMurderer: true },
  { id: 'esenia', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zoya', name: 'Зоя', initialLetter: 'З', gender: 'female', color: '#7cc9e8', isVictim: false, isMurderer: false },
  { id: 'ilya', name: 'Илья', initialLetter: 'И', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['sheriff'] },
  { id: 'ksenia', name: 'Ксения', initialLetter: 'К', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'hariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#b06ab3', isVictim: true, isMurderer: false },
];

// `npm run scaffold-level -- levels/14-wildwest2.ts saloon:2,street:3,office:2,stable:2,bank:2`
// → row→col [9, 7, 3, 1, 10, 4, 6, 2, 0, 8, 5]. Saloon (rows 2,3) hosts the victim (Харитон) and
// the murderer (Демьян). The sheriff (Илья) rides a horse in the stable (9,8); three other riders
// (Зоя 10,5 / Артём 4,10 / Есения 5,4) sit on the other three horses so "шериф на лошади" alone
// never pins the sheriff's identity.
const solution: Record<PersonId, CellId> = {
  zhdan: cellId(0, 9),
  ksenia: cellId(1, 7),
  hariton: cellId(2, 3),
  demyan: cellId(3, 1),
  artem: cellId(4, 10),
  esenia: cellId(5, 4),
  glafira: cellId(6, 6),
  bella: cellId(7, 2),
  vladimir: cellId(8, 0),
  ilya: cellId(9, 8),
  zoya: cellId(10, 5),
};

const clues: Clue[] = [
  // — Механика скрытого шерифа (общие) —
  { id: 'w2-sheriff-single', type: 'roleSingleton', roleId: 'sheriff', text: 'Среди действующих лиц городка был ровно один шериф.' },
  {
    id: 'w2-sheriff-horse',
    type: 'occupiesItem',
    subject: { type: 'role', role: 'sheriff' },
    itemTypeId: 'horse',
    text: 'Шериф находился верхом на лошади.',
  },
  // — Общие правила городка —
  { id: 'w2-occupancy', type: 'roomOccupancy', text: 'Ни одна зона городка не осталась пустой.' },
  { id: 'w2-street-population', type: 'roomPopulation', roomId: 'street', comparison: 'most', text: 'На главной улице находилось больше людей, чем в любой другой зоне.' },
  // — Конюшня: шериф и Зоя —
  {
    id: 'w2-zoya-sheriff-zone',
    type: 'sameRoomAsRole',
    subject: { type: 'person', id: 'zoya' },
    roleId: 'sheriff',
    text: 'Зоя находилась в той же зоне, что и шериф.',
  },
  { id: 'w2-ilya-room', type: 'roomMembership', subject: { type: 'person', id: 'ilya' }, roomId: 'stable', text: 'Илья находился в конюшне.' },
  // — Улица —
  { id: 'w2-esenia-not-sheriff', type: 'role', subject: { type: 'person', id: 'esenia' }, roleId: 'sheriff', negated: true, text: 'Есения не была шерифом.' },
  { id: 'w2-esenia-cactus', type: 'adjacency', subject: { type: 'person', id: 'esenia' }, itemTypeId: 'cactus', text: 'Есения находилась рядом с кактусом.' },
  { id: 'w2-artem-corner', type: 'corner', subject: { type: 'person', id: 'artem' }, text: 'Артём находился в углу своей зоны.' },
  { id: 'w2-glafira-roomsize', type: 'roomSize', subject: { type: 'person', id: 'glafira' }, comparison: 'largest', text: 'Глафира находилась в самой большой зоне городка.' },
  // — Офис шерифа —
  { id: 'w2-bella-room', type: 'roomMembership', subject: { type: 'person', id: 'bella' }, roomId: 'office', text: 'Белла находилась в офисе шерифа.' },
  { id: 'w2-bella-parity', type: 'parity', subject: { type: 'person', id: 'bella' }, axis: 'row', parity: 'even', text: 'Белла находилась в ряду с чётным номером.' },
  { id: 'w2-bella-chair', type: 'adjacency', subject: { type: 'person', id: 'bella' }, itemTypeId: 'chair', text: 'Белла находилась рядом со стулом.' },
  { id: 'w2-vladimir-wall', type: 'wallSide', subject: { type: 'person', id: 'vladimir' }, wallDirection: 'west', text: 'Владимир находился у западной стены своей зоны.' },
  { id: 'w2-vladimir-same', type: 'sameRoomAs', subject: { type: 'person', id: 'vladimir' }, otherPersonId: 'bella', text: 'Владимир находился в той же зоне, что и Белла.' },
  // — Банк —
  { id: 'w2-zhdan-portrait', type: 'adjacency', subject: { type: 'person', id: 'zhdan' }, itemTypeId: 'portrait', text: 'Ждан находился рядом с портретом шерифа.' },
  { id: 'w2-ksenia-south', type: 'relativePosition', subject: { type: 'person', id: 'ksenia' }, otherPersonId: 'zhdan', axis: 'row', direction: 'after', text: 'Ксения находилась южнее Ждана.' },
  { id: 'w2-ksenia-west', type: 'relativePosition', subject: { type: 'person', id: 'ksenia' }, otherPersonId: 'zhdan', axis: 'col', direction: 'before', text: 'Ксения находилась западнее Ждана.' },
  { id: 'w2-ksenia-wall', type: 'wallSide', subject: { type: 'person', id: 'ksenia' }, wallDirection: 'west', text: 'Ксения находилась у западной стены своей зоны.' },
  // — Салун —
  { id: 'w2-demyan-stool', type: 'occupiesItem', subject: { type: 'person', id: 'demyan' }, itemTypeId: 'barStool', text: 'Демьян сидел на барном табурете.' },
  // — Улица: всадники и пешеходы —
  { id: 'w2-esenia-parity', type: 'parity', subject: { type: 'person', id: 'esenia' }, axis: 'row', parity: 'even', text: 'Есения находилась в ряду с чётным номером.' },
  { id: 'w2-glafira-south', type: 'relativePosition', subject: { type: 'person', id: 'glafira' }, otherPersonId: 'esenia', axis: 'row', direction: 'after', text: 'Глафира находилась южнее Есении.' },
  { id: 'w2-glafira-parity', type: 'parity', subject: { type: 'person', id: 'glafira' }, axis: 'col', parity: 'odd', text: 'Глафира находилась в столбце с нечётным номером.' },
  { id: 'w2-artem-parity', type: 'parity', subject: { type: 'person', id: 'artem' }, axis: 'row', parity: 'odd', text: 'Артём находился в ряду с нечётным номером.' },
  { id: 'w2-zoya-south', type: 'relativePosition', subject: { type: 'person', id: 'zoya' }, otherPersonId: 'ilya', axis: 'row', direction: 'after', text: 'Зоя находилась южнее Ильи.' },
  { id: 'w2-zoya-corner', type: 'corner', subject: { type: 'person', id: 'zoya' }, text: 'Зоя находилась в углу своей зоны.' },
];

export const wildwest2Level: Level = {
  meta: { id: 'wildwest-02', title: 'Тень шерифа', theme: 'wildwest2', difficulty: 9, maxFullyPinnedPeople: 0 },
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
