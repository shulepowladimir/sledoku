import type { CellId, Item, ItemType, Level, Person, PersonId, Room } from '../src/types/level';
import type { Clue } from '../src/types/clue';
import { cellId } from '../src/types/level';
import { buildCells } from './helpers';
import { ItemLibrary } from './itemLibrary';

const size = 9;

// «Опасная реакция»: ночная химическая лаборатория. Обманка «не там»: клю
// «у реактора ровно двое» + «старший смены при запуске» создают ложный вывод,
// что убийство — у реактора. На деле старший (Вероника) и свидетель (Захар) —
// двое ЖИВЫХ у чана: убийца заперт в коридоре, и инвариант «жертва наедине
// с убийцей» выдавливает пару Харитон+Борис в коридор. Труп — у запасного
// выхода, а не у реактора.
const rooms: Room[] = [
  { id: 'lab', name: 'Лаборатория', floorTexture: 'tile' },
  { id: 'office', name: 'Офис', floorTexture: 'carpet' },
  { id: 'reactor', name: 'Реакторный зал', floorTexture: 'metal' },
  { id: 'washroom', name: 'Моечная', floorTexture: 'linoleum' },
  { id: 'storage', name: 'Склад реактивов', floorTexture: 'stone' },
  { id: 'rest', name: 'Комната отдыха', floorTexture: 'rubber' },
  { id: 'corridor', name: 'Коридор', floorTexture: 'concrete' },
];

const itemTypes: ItemType[] = [
  // Уровневые (лаборатория)
  { id: 'reactorVat', label: 'Реакторный чан', kind: 'decorative', icon: 'reactorVat' },
  { id: 'fireExtinguisher', label: 'Огнетушитель', kind: 'decorative', icon: 'fireExtinguisher' },
  { id: 'testTubeRack', label: 'Стеллаж с пробирками', kind: 'decorative', icon: 'testTubeRack' },
  // Библиотечные
  ItemLibrary.computer(),
  ItemLibrary.table(),
  ItemLibrary.clock(),
  ItemLibrary.portrait(),
  ItemLibrary.barrel('Бочка с реактивами'),
  ItemLibrary.watercooler(),
  ItemLibrary.cup(),
  ItemLibrary.trashcan(),
  ItemLibrary.box(),
];

const items: Item[] = [
  // — Реакторный зал: чан (2кл) ———
  { id: 'item-vat', typeId: 'reactorVat', cells: [cellId(4, 0), cellId(4, 1)] },
  // — Лаборатория ———
  { id: 'item-computer-1', typeId: 'computer', cells: [cellId(0, 0)] },
  { id: 'item-computer-2', typeId: 'computer', cells: [cellId(2, 0)] },
  { id: 'item-tubes', typeId: 'testTubeRack', cells: [cellId(1, 0)] },
  { id: 'item-box-lab', typeId: 'box', cells: [cellId(0, 5)] },
  // — Офис ———
  { id: 'item-table-o', typeId: 'table', cells: [cellId(2, 7)] },
  { id: 'item-clock', typeId: 'clock', cells: [cellId(0, 6)] },
  { id: 'item-portrait', typeId: 'portrait', cells: [cellId(1, 8)] },
  // — Моечная ———
  { id: 'item-fireext', typeId: 'fireExtinguisher', cells: [cellId(4, 4)] },
  // — Склад реактивов ———
  { id: 'item-barrel-1', typeId: 'barrel', cells: [cellId(3, 6)] },
  { id: 'item-barrel-2', typeId: 'barrel', cells: [cellId(4, 7)] },
  { id: 'item-barrel-3', typeId: 'barrel', cells: [cellId(3, 8)] },
  // — Комната отдыха ———
  { id: 'item-cooler', typeId: 'watercooler', cells: [cellId(6, 0)] },
  { id: 'item-cup-1', typeId: 'cup', cells: [cellId(7, 2)] },
  { id: 'item-cup-2', typeId: 'cup', cells: [cellId(8, 4)] },
  // — Коридор ———
  { id: 'item-trashcan', typeId: 'trashcan', cells: [cellId(8, 7)] },
  { id: 'item-box-cor', typeId: 'box', cells: [cellId(8, 6)] },
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

// l=лаборатория, o=офис, x=реакторный зал, w=моечная, s=склад, e=отдых, c=коридор.
const ROOM_ROWS = [
  'llllllooo',
  'llllllooo',
  'llllllooo',
  'xxxwwwsss',
  'xxxwwwsss',
  'xxxwwwsss',
  'eeeeecccc',
  'eeeeecccc',
  'eeeeecccc',
];

function roomForCell(row: number, col: number): string {
  const ch = ROOM_ROWS[row][col];
  return (
    {
      l: 'lab',
      o: 'office',
      x: 'reactor',
      w: 'washroom',
      s: 'storage',
      e: 'rest',
      c: 'corridor',
    } as Record<string, string>
  )[ch]!;
}

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Person[] = [
  { id: 'andrey', name: 'Андрей', initialLetter: 'А', gender: 'male', color: '#4d8dff', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'boris', name: 'Борис', initialLetter: 'Б', gender: 'male', color: '#3cbf7c', isVictim: false, isMurderer: true, roles: ['staff'] },
  { id: 'veronika', name: 'Вероника', initialLetter: 'В', gender: 'female', color: '#e0629b', isVictim: false, isMurderer: false, roles: ['staff', 'shiftLead'] },
  { id: 'grigory', name: 'Григорий', initialLetter: 'Г', gender: 'male', color: '#d9a441', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'darya', name: 'Дарья', initialLetter: 'Д', gender: 'female', color: '#e0824a', isVictim: false, isMurderer: false, roles: ['staff'] },
  { id: 'efim', name: 'Ефим', initialLetter: 'Е', gender: 'male', color: '#2bc4c4', isVictim: false, isMurderer: false },
  { id: 'zhanna', name: 'Жанна', initialLetter: 'Ж', gender: 'female', color: '#9b7ce0', isVictim: false, isMurderer: false },
  { id: 'zakhar', name: 'Захар', initialLetter: 'З', gender: 'male', color: '#5fa8d3', isVictim: false, isMurderer: false },
  { id: 'khariton', name: 'Харитон', initialLetter: 'Х', gender: 'male', color: '#8a5a3a', isVictim: true, isMurderer: false },
];

// Полная перестановка 9×9. У чана — Вероника (старший, 3,1) и Захар (свидетель,
// 4,2); Харитон (жертва, 6,6) и Борис (убийца, 7,5) — вдвоём в коридоре.
const solution: Record<PersonId, CellId> = {
  zhanna: cellId(0, 8),
  darya: cellId(1, 3),
  andrey: cellId(2, 4),
  veronika: cellId(3, 1),
  zakhar: cellId(4, 2),
  grigory: cellId(5, 7),
  khariton: cellId(6, 6),
  efim: cellId(7, 0),
  boris: cellId(8, 5),
};

const clues: Clue[] = [
  // — Общие правила лаборатории (ядро обманки «не там») —
  {
    id: 'cl1',
    type: 'zoneExactCount',
    roomId: 'reactor',
    count: 2,
    text: 'В реакторном зале находились ровно двое.',
  },
  {
    id: 'cl2',
    type: 'roomMembership',
    subject: { type: 'role', role: 'shiftLead' },
    roomId: 'reactor',
    text: 'Старший смены присутствовал при запуске реактора.',
  },
  {
    id: 'cl3',
    type: 'letterRangeRole',
    fromLetter: 'А',
    toLetter: 'Д',
    roleId: 'staff',
    text: 'Все, чьё имя начинается с букв от А до Д, — штатные сотрудники лаборатории. Остальные — практиканты.',
  },
  {
    id: 'cl4',
    type: 'role',
    subject: { type: 'role', role: 'shiftLead' },
    roleId: 'staff',
    text: 'Старший смены был штатным сотрудником.',
  },
  // — Личные —
  {
    id: 'cl5',
    type: 'floorTexture',
    subject: { type: 'person', id: 'zhanna' },
    textureKey: 'carpet',
    text: 'Жанна работала в офисе на ковровом покрытии.',
  },
  {
    id: 'cl22',
    type: 'parity',
    subject: { type: 'person', id: 'zhanna' },
    axis: 'row',
    parity: 'odd',
    text: 'Жанна находилась в нечётном ряду.',
  },
  {
    id: 'cl24',
    type: 'position',
    subject: { type: 'person', id: 'andrey' },
    axis: 'row',
    value: 2,
    text: 'Андрей находился в 3-м ряду.',
  },
  {
    id: 'cl7',
    type: 'relativePosition',
    subject: { type: 'person', id: 'darya' },
    otherPersonId: 'andrey',
    axis: 'row',
    direction: 'before',
    text: 'Дарья находилась севернее Андрея.',
  },
  {
    id: 'cl8',
    type: 'floorTexture',
    subject: { type: 'person', id: 'andrey' },
    textureKey: 'tile',
    text: 'Андрей стоял на кафельном полу.',
  },
  {
    id: 'cl19',
    type: 'relativePosition',
    subject: { type: 'person', id: 'andrey' },
    otherPersonId: 'darya',
    axis: 'col',
    direction: 'after',
    text: 'Андрей находился восточнее Дарьи.',
  },
  {
    id: 'cl20',
    type: 'relativePosition',
    subject: { type: 'person', id: 'zakhar' },
    otherPersonId: 'grigory',
    axis: 'row',
    direction: 'before',
    text: 'Захар находился севернее Григория.',
  },
  {
    id: 'cl11',
    type: 'roomMembership',
    subject: { type: 'person', id: 'grigory' },
    roomId: 'storage',
    text: 'Григорий разбирал запасы на складе.',
  },
  {
    id: 'cl13',
    type: 'roomMembership',
    subject: { type: 'person', id: 'efim' },
    roomId: 'rest',
    text: 'Ефим отдыхал в комнате отдыха.',
  },
  {
    id: 'cl14',
    type: 'floorTexture',
    subject: { type: 'person', id: 'boris' },
    textureKey: 'concrete',
    text: 'Борис находился на бетонном полу.',
  },
  {
    id: 'cl15',
    type: 'wallSide',
    subject: { type: 'person', id: 'boris' },
    wallDirection: 'south',
    text: 'Борис находился у южной стены.',
  },
  {
    id: 'cl17',
    type: 'parity',
    subject: { type: 'person', id: 'veronika' },
    axis: 'col',
    parity: 'even',
    text: 'Вероника находилась в чётном столбце.',
  },
  {
    id: 'cl21',
    type: 'parity',
    subject: { type: 'person', id: 'grigory' },
    axis: 'col',
    parity: 'even',
    text: 'Григорий находился в чётном столбце.',
  },
];

const level: Level = {
  meta: {
    id: 'chemlab-01',
    title: 'Опасная реакция',
    theme: 'chemlab',
    difficulty: 8,
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

export const chemLabLevel: Level = level;
