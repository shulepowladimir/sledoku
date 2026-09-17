import { transliterate } from '../../lib/transliterate';
import { uniqueSlug, camelCase } from './slugify';
import type { EditorItem, EditorPerson, EditorRoom } from './editorStore';
import type { EditorClue } from './editorClueTypes';

interface ExportInput {
  size: number;
  rooms: EditorRoom[];
  roomByCell: Record<string, string>;
  items: EditorItem[];
  people: EditorPerson[];
  solution: Record<string, string> | null; // editor person id -> cellId
  victimId: string | null;
  murdererId: string | null;
  clues: EditorClue[];
  meta: { title: string; theme: string; difficulty: number };
}

export interface ExportResult {
  fileName: string;
  fileContent: string;
  exportName: string;
}

function subjectCode(personSlugById: Map<string, string>, editorPersonId: string): string {
  return `{ type: 'person', id: '${personSlugById.get(editorPersonId) ?? editorPersonId}' }`;
}

function clueToCode(c: EditorClue, personSlugById: Map<string, string>, roomSlugById: Map<string, string>): string {
  const d = c.data;
  const id = `id: '${c.id}'`;
  const text = `text: ${JSON.stringify(c.text)}`;
  switch (d.type) {
    case 'position':
      return `  { ${id}, type: 'position', subject: ${subjectCode(personSlugById, d.subjectId)}, axis: '${d.axis}', value: ${d.value}, ${text} },`;
    case 'roomMembership':
      return `  { ${id}, type: 'roomMembership', subject: ${subjectCode(personSlugById, d.subjectId)}, roomId: '${roomSlugById.get(d.roomId) ?? d.roomId}', negated: ${d.negated}, ${text} },`;
    case 'adjacency':
      return `  { ${id}, type: 'adjacency', subject: ${subjectCode(personSlugById, d.subjectId)}, itemTypeId: '${d.itemTypeId}', negated: ${d.negated}, ${text} },`;
    case 'sharedRoomGender':
      return `  { ${id}, type: 'sharedRoomGender', subject: ${subjectCode(personSlugById, d.subjectId)}, otherGender: '${d.otherGender}', negated: ${d.negated}, ${text} },`;
    case 'itemTypeGender':
      return `  { ${id}, type: 'itemTypeGender', itemTypeId: '${d.itemTypeId}', gender: '${d.gender}', ${text} },`;
    case 'relativePosition':
      return `  { ${id}, type: 'relativePosition', subject: ${subjectCode(personSlugById, d.subjectId)}, otherPersonId: '${personSlugById.get(d.otherPersonId) ?? d.otherPersonId}', axis: '${d.axis}', direction: '${d.direction}'${d.offset != null ? `, offset: ${d.offset}` : ''}, ${text} },`;
    case 'corner':
      return `  { ${id}, type: 'corner', subject: ${subjectCode(personSlugById, d.subjectId)}, negated: ${d.negated}, ${text} },`;
    case 'sameRoomAs':
      return `  { ${id}, type: 'sameRoomAs', subject: ${subjectCode(personSlugById, d.subjectId)}, otherPersonId: '${personSlugById.get(d.otherPersonId) ?? d.otherPersonId}', negated: ${d.negated}, ${text} },`;
    case 'aloneInRoom':
      return `  { ${id}, type: 'aloneInRoom', subject: ${subjectCode(personSlugById, d.subjectId)}, ${text} },`;
    case 'sameRoomAsItem':
      return `  { ${id}, type: 'sameRoomAsItem', subject: ${subjectCode(personSlugById, d.subjectId)}, itemTypeId: '${d.itemTypeId}', negated: ${d.negated}, ${text} },`;
    case 'occupiesItem':
      return `  { ${id}, type: 'occupiesItem', subject: ${subjectCode(personSlugById, d.subjectId)}, itemTypeId: '${d.itemTypeId}', negated: ${d.negated}, ${text} },`;
    case 'wallSide':
      return `  { ${id}, type: 'wallSide', subject: ${subjectCode(personSlugById, d.subjectId)}, wallDirection: '${d.wallDirection}', negated: ${d.negated}, ${text} },`;
    case 'roomSize':
      return `  { ${id}, type: 'roomSize', subject: ${subjectCode(personSlugById, d.subjectId)}, comparison: '${d.comparison}', ${text} },`;
    case 'parity':
      return `  { ${id}, type: 'parity', subject: ${subjectCode(personSlugById, d.subjectId)}, axis: '${d.axis}', parity: '${d.parity}', ${text} },`;
    case 'betweenness':
      return `  { ${id}, type: 'betweenness', subject: ${subjectCode(personSlugById, d.subjectId)}, otherPersonId1: '${personSlugById.get(d.otherPersonId1) ?? d.otherPersonId1}', otherPersonId2: '${personSlugById.get(d.otherPersonId2) ?? d.otherPersonId2}', axis: '${d.axis}', ${text} },`;
    case 'roomOccupancy':
      return `  { ${id}, type: 'roomOccupancy', ${text} },`;
    case 'roomParity':
      return `  { ${id}, type: 'roomParity', parity: '${d.parity}', ${text} },`;
    case 'roomPopulation':
      return `  { ${id}, type: 'roomPopulation', roomId: '${roomSlugById.get(d.roomId) ?? d.roomId}', comparison: '${d.comparison}', ${text} },`;
    case 'letterGroupRoom':
      return `  { ${id}, type: 'letterGroupRoom', letterClass: '${d.letterClass}', ${text} },`;
  }
}

export function exportLevel(input: ExportInput): ExportResult | { error: string } {
  const { size, rooms, roomByCell, items, people, solution, victimId, murdererId, clues, meta } = input;

  if (!meta.title.trim()) return { error: 'Укажи название уровня' };
  if (rooms.length === 0) return { error: 'Добавь хотя бы одну комнату' };
  if (people.length !== size) return { error: `Нужно ровно ${size} персонажей (сейчас ${people.length})` };
  if (!solution) return { error: 'Сначала подбери решение на шаге «Решение»' };
  if (!victimId || !murdererId) return { error: 'Выбери, кто жертва, а кто убийца, на шаге «Решение»' };

  const levelSlug = transliterate(meta.title) || 'level';
  const exportName = `${camelCase(levelSlug)}Level`;

  // editor room id ("room-3") -> финальный читаемый id ("kitchen")
  const takenRoomSlugs = new Set<string>();
  const roomSlugById = new Map<string, string>();
  for (const room of rooms) {
    const slug = uniqueSlug(transliterate(room.name), takenRoomSlugs);
    roomSlugById.set(room.id, slug);
  }

  // editor person id ("person-3") -> финальный читаемый id ("andrei")
  const takenSlugs = new Set<string>();
  const personSlugById = new Map<string, string>();
  for (const person of people) {
    const slug = uniqueSlug(transliterate(person.name), takenSlugs);
    personSlugById.set(person.id, slug);
  }

  const roomIds = new Set(rooms.map((r) => r.id));
  const usedItemTypeIds = [...new Set(items.map((i) => i.typeId))].sort();

  const roomsCode = rooms
    .map(
      (r) =>
        `  { id: '${roomSlugById.get(r.id)}', name: ${JSON.stringify(r.name)}, floorTexture: '${r.floorTexture}' },`,
    )
    .join('\n');

  const itemTypesCode = usedItemTypeIds.map((key) => `  ItemLibrary.${key}(),`).join('\n');

  const itemsCode = items
    .map((it) => `  { id: '${it.id}', typeId: '${it.typeId}', cells: [cellId(${it.cellId.replace('-', ', ')})] },`)
    .join('\n');

  const peopleCode = people
    .map((p) => {
      const slug = personSlugById.get(p.id)!;
      const isVictim = p.id === victimId;
      const isMurderer = p.id === murdererId;
      return `  { id: '${slug}', name: ${JSON.stringify(p.name)}, initialLetter: ${JSON.stringify(p.initialLetter)}, gender: '${p.gender}', color: '${p.color}', isVictim: ${isVictim}, isMurderer: ${isMurderer} },`;
    })
    .join('\n');

  const solutionCode = people
    .map((p) => {
      const slug = personSlugById.get(p.id)!;
      const cell = solution[p.id];
      return `  ${slug}: cellId(${cell.replace('-', ', ')}),`;
    })
    .join('\n');

  const cluesCode = clues.map((c) => clueToCode(c, personSlugById, roomSlugById)).join('\n');

  // roomForCell — строим по roomByCell (клетка -> id комнаты; отсутствующая клетка = вырезана)
  const roomForCellEntries = Object.entries(roomByCell)
    .filter(([, roomId]) => roomIds.has(roomId))
    .map(([cid, roomId]) => `  '${cid}': '${roomSlugById.get(roomId)}',`)
    .join('\n');

  const fileContent = `import type { Level, ItemType } from '../src/types/level';
import { cellId } from '../src/types/level';
import { ItemLibrary } from './itemLibrary';
import { buildCells } from './helpers';

// Сгенерировано конструктором уровней (Этап 2: с подсказками).
// Перед использованием проверь уровень командой:
//   npm run validate-level -- levels/<имя-файла>.ts

const size = ${size};

const ROOM_BY_CELL: Record<string, string> = {
${roomForCellEntries}
};

function roomForCell(row: number, col: number): string | null {
  return ROOM_BY_CELL[\`\${row}-\${col}\`] ?? null;
}

const rooms: Level['rooms'] = [
${roomsCode}
];

const itemTypes: ItemType[] = [
${itemTypesCode}
];

const items: Level['items'] = [
${itemsCode}
];

const itemIdByCell = new Map(items.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));

const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

const people: Level['people'] = [
${peopleCode}
];

const solution: Level['solution'] = {
${solutionCode}
};

const clues: Level['clues'] = [
${cluesCode}
];

export const ${exportName}: Level = {
  meta: {
    id: '${levelSlug}',
    title: ${JSON.stringify(meta.title)},
    theme: '${meta.theme}',
    difficulty: ${meta.difficulty} as Level['meta']['difficulty'],
    maxFullyPinnedPeople: 1, // поправь при необходимости после validate-level
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
`;

  return { fileName: `${levelSlug}.ts`, fileContent, exportName };
}
