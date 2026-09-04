import { transliterate } from '../../lib/transliterate';
import type { EditorItem, EditorPerson, EditorRoom } from './editorStore';

interface ExportInput {
  size: number;
  rooms: EditorRoom[];
  roomByCell: Record<string, string>;
  items: EditorItem[];
  people: EditorPerson[];
  solution: Record<string, string> | null; // editor person id -> cellId
  victimId: string | null;
  murdererId: string | null;
  meta: { title: string; theme: string; difficulty: number };
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base || 'person';
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

function camelCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

export interface ExportResult {
  fileName: string;
  fileContent: string;
  exportName: string;
}

export function exportLevel(input: ExportInput): ExportResult | { error: string } {
  const { size, rooms, roomByCell, items, people, solution, victimId, murdererId, meta } = input;

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

  // roomForCell — строим по roomByCell (клетка -> id комнаты; отсутствующая клетка = вырезана)
  const roomForCellEntries = Object.entries(roomByCell)
    .filter(([, roomId]) => roomIds.has(roomId))
    .map(([cid, roomId]) => `  '${cid}': '${roomSlugById.get(roomId)}',`)
    .join('\n');

  const fileContent = `import type { Level, ItemType } from '../src/types/level';
import { cellId } from '../src/types/level';
import { ItemLibrary } from './itemLibrary';
import { buildCells } from './helpers';

// Сгенерировано конструктором уровней (Этап 1: без подсказок).
// СЛЕДУЮЩИЙ ШАГ: добавь подсказки в массив clues ниже (см. src/types/clue.ts на список типов),
// затем проверь уровень командой:
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

export const ${exportName}: Level = {
  meta: {
    id: '${levelSlug}',
    title: ${JSON.stringify(meta.title)},
    theme: '${meta.theme}',
    difficulty: ${meta.difficulty} as Level['meta']['difficulty'],
    maxFullyPinnedPeople: 1, // поправь после добавления подсказок и запуска validate-level
  },
  size,
  rooms,
  itemTypes,
  items,
  floorFeatures: [],
  cells,
  people,
  solution,
  clues: [], // TODO: добавь подсказки вручную
};
`;

  return { fileName: `${levelSlug}.ts`, fileContent, exportName };
}
