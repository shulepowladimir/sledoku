import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 8;

// «Лёгкий пар»: районная баня на восемь человек. Твист без скрытых ролей:
// обманка «в парилке ровно двое + банщик парился» ведёт игрока к ложному
// выводу об убийстве в парилке; разгром — «в парилке только мужчины»
// (жертва Хиония — женщина) + инвариант «наедине» выдавливает пару в
// женскую раздевалку, где «только женщины» ⇒ убийца — женщина.
const rooms: Room[] = [
  { id: 'entry', name: 'Вход и коридор', floorTexture: 'concrete' },
  { id: 'lounge', name: 'Предбанник', floorTexture: 'tile' },
  { id: 'maleRoom', name: 'Мужская раздевалка', floorTexture: 'carpet' },
  { id: 'femaleRoom', name: 'Женская раздевалка', floorTexture: 'carpet' },
  { id: 'steam', name: 'Парилка', floorTexture: 'wood' },
  { id: 'plunge', name: 'Бассейн', floorTexture: 'stone' },
];

const itemTypes: ItemType[] = [
  // Уровневые (баня)
  { id: 'saunaStove', label: 'Каменка', kind: 'decorative', icon: 'saunaStove' },
  ItemLibrary.washTub(),
  ItemLibrary.towel(),
  ItemLibrary.venik(),
  ItemLibrary.bench('Скамьи'),
  // Библиотечные
  ItemLibrary.jacuzzi('Купель'),
  ItemLibrary.locker(),
  ItemLibrary.slippers(),
  ItemLibrary.kettle(),
  ItemLibrary.table(),
  ItemLibrary.cup(),
  ItemLibrary.clock(),
  ItemLibrary.sofa(),
  ItemLibrary.kassa('Стойка администратора'),
  ItemLibrary.trashcan(),
  ItemLibrary.stool(),
];

const items: Item[] = [
  // — Вход: стойка, табурет, урна —
  { id: 'item-kassa', typeId: 'kassa', cells: [cellId(1, 0)] },
  { id: 'item-stool-e', typeId: 'stool', cells: [cellId(0, 2)] },
  { id: 'item-trashcan-e', typeId: 'trashcan', cells: [cellId(2, 0)] },
  // — Предбанник: диван, чайник, стол, чашки, часы —
  { id: 'item-sofa', typeId: 'sofa', cells: [cellId(1, 6)] },
  { id: 'item-sofa-2', typeId: 'sofa', cells: [cellId(2, 5)] },
  { id: 'item-table-l', typeId: 'table', cells: [cellId(2, 4)] },
  { id: 'item-kettle', typeId: 'kettle', cells: [cellId(0, 6)] },
  { id: 'item-cup-1', typeId: 'cup', cells: [cellId(1, 7)] },
  { id: 'item-cup-2', typeId: 'cup', cells: [cellId(0, 7)] },
  { id: 'item-clock', typeId: 'clock', cells: [cellId(1, 4)] },
  // — Мужская раздевалка: шкафчики, полотенце, тапки —
  { id: 'item-locker-m1', typeId: 'locker', cells: [cellId(4, 0)] },
  { id: 'item-locker-m2', typeId: 'locker', cells: [cellId(5, 1)] },
  { id: 'item-towel-m', typeId: 'towel', cells: [cellId(3, 1)] },
  { id: 'item-slippers-m', typeId: 'slippers', cells: [cellId(5, 2)] },
  // — Женская раздевалка: шкафчики, полотенца, тапки —
  { id: 'item-locker-f1', typeId: 'locker', cells: [cellId(3, 3)] },
  { id: 'item-locker-f2', typeId: 'locker', cells: [cellId(5, 4)] },
  { id: 'item-towel-f', typeId: 'towel', cells: [cellId(5, 5)] },
  { id: 'item-towel-f2', typeId: 'towel', cells: [cellId(4, 5)] },
  { id: 'item-slippers-f', typeId: 'slippers', cells: [cellId(4, 3)] },
  // — Парилка: каменка, два яруса полков, веники —
  { id: 'item-stove', typeId: 'saunaStove', cells: [cellId(6, 0)] },
  { id: 'item-bench-1', typeId: 'bench', cells: [cellId(6, 4), cellId(6, 5)] },
  { id: 'item-bench-2', typeId: 'bench', cells: [cellId(7, 4), cellId(7, 5)] },
  { id: 'item-venik-1', typeId: 'venik', cells: [cellId(7, 0)] },
  { id: 'item-venik-2', typeId: 'venik', cells: [cellId(7, 3)] },
  // — Бассейн: две купели, тазы, веник —
  { id: 'item-jacuzzi', typeId: 'jacuzzi', cells: [cellId(2, 7)] },
  { id: 'item-jacuzzi-2', typeId: 'jacuzzi', cells: [cellId(7, 6)] },
  { id: 'item-tub-1', typeId: 'washTub', cells: [cellId(5, 6)] },
  { id: 'item-tub-2', typeId: 'washTub', cells: [cellId(7, 7)] },
  { id: 'item-venik-3', typeId: 'venik', cells: [cellId(4, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// в=вход, б=предбанник, м=мужская, ж=женская, п=парилка, к=бассейн.
const ROOM_ROWS = [
  'ввввбббб',
  'ввввбббб',
  'ввввббкк',
  'мммжжжкк',
  'мммжжжкк',
  'мммжжжкк',
  'ппппппкк',
  'ппппппкк',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      в: 'entry',
      б: 'lounge',
      м: 'maleRoom',
      ж: 'femaleRoom',
      п: 'steam',
      к: 'plunge',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'aglaya', name: 'Аглая', initialLetter: 'А', gender: 'female', color: '#c9536b', isVictim: false, isMurderer: true },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false },
  { id: 'viktor', name: 'Виктор', initialLetter: 'В', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: false },
  { id: 'glafira', name: 'Глафира', initialLetter: 'Г', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false },
  { id: 'demid', name: 'Демид', initialLetter: 'Д', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false },
  { id: 'esenya', name: 'Есения', initialLetter: 'Е', gender: 'female', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'zhdan', name: 'Ждан', initialLetter: 'Ж', gender: 'male', color: '#b06ab3', isVictim: false, isMurderer: false },
  { id: 'hionia', name: 'Хиония', initialLetter: 'Х', gender: 'female', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Полная перестановка 8×8. В женской раздевалке — Аглая (убийца, 5,3) и
// Хиония (жертва, 4,4); в парилке — банщик Борис (6,1) и Ждан (7,2).
const solution: Record<PersonId, CellId> = {
  viktor: cellId(0, 5),
  esenya: cellId(1, 6),
  glafira: cellId(2, 7),
  demid: cellId(3, 0),
  hionia: cellId(4, 4),
  aglaya: cellId(5, 3),
  boris: cellId(6, 1),
  zhdan: cellId(7, 2),
};

const clues: Clue[] = [
  // — Общие правила бани —
  {
    id: 'bn2',
    type: 'zoneGenderExclusive',
    roomId: 'maleRoom',
    gender: 'male',
    groupId: 'male-zones',
    text: 'В парилке и мужской раздевалке находились только мужчины.',
  },
  {
    id: 'bn3',
    type: 'zoneGenderExclusive',
    roomId: 'steam',
    gender: 'male',
    groupId: 'male-zones',
    text: 'В парилке парились только мужчины.',
  },
  {
    id: 'bn4',
    type: 'zoneExactCount',
    roomId: 'steam',
    count: 2,
    text: 'В парилке находились ровно двое.',
  },
  // — Личные —
  {
    id: 'bn9',
    type: 'parity',
    subject: { type: 'person', id: 'aglaya' },
    axis: 'col',
    parity: 'even',
    text: 'Аглая находилась в чётном столбце.',
  },
  {
    id: 'bn10',
    type: 'parity',
    subject: { type: 'person', id: 'boris' },
    axis: 'col',
    parity: 'even',
    text: 'Борис находился в чётном столбце.',
  },
  {
    id: 'bn11',
    type: 'roomMembership',
    subject: { type: 'person', id: 'viktor' },
    roomId: 'lounge',
    text: 'Виктор отдыхал в предбаннике.',
  },
  {
    id: 'bn12',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'glafira' },
    itemTypeId: 'jacuzzi',
    text: 'Глафира находилась в купели.',
  },
  {
    id: 'bn13',
    type: 'adjacency',
    subject: { type: 'person', id: 'demid' },
    itemTypeId: 'locker',
    text: 'Демид находился у шкафчика.',
  },
  {
    id: 'bn14',
    type: 'occupiesItem',
    subject: { type: 'person', id: 'esenya' },
    itemTypeId: 'sofa',
    text: 'Есения находилась на диване.',
  },
  {
    id: 'bn15',
    type: 'wallSide',
    subject: { type: 'person', id: 'zhdan' },
    wallDirection: 'south',
    text: 'Ждан находился у южной стены.',
  },
];

const level: Level = {
  meta: {
    id: 'bania-01',
    title: 'Лёгкий пар',
    theme: 'bania',
    difficulty: 7,
    maxFullyPinnedPeople: 0,
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues,
};

export const baniaLevel: Level = level;