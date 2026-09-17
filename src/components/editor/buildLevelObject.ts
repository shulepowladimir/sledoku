import type { Level, ItemType } from '../../types/level';
import type { Clue as ClueT, Subject } from '../../types/clue';
import { cellId } from '../../types/level';
import { ItemLibrary } from '../../../levels/itemLibrary';
import { buildCells } from '../../../levels/helpers';
import { buildSlugMap } from './slugify';
import type { EditorSnapshot } from './editorStore';
import type { EditorClue } from './editorClueTypes';

export interface BuildLevelResult {
  level: Level;
  personSlugById: Map<string, string>;
  roomSlugById: Map<string, string>;
}

export interface BuildLevelError {
  error: string;
}

function subjectFor(personSlugById: Map<string, string>, editorPersonId: string): Subject {
  return { type: 'person', id: personSlugById.get(editorPersonId) ?? editorPersonId };
}

function toRuntimeClue(c: EditorClue, personSlugById: Map<string, string>, roomSlugById: Map<string, string>): ClueT {
  const d = c.data;
  const base = { id: c.id, text: c.text };
  switch (d.type) {
    case 'position':
      return { ...base, type: 'position', subject: subjectFor(personSlugById, d.subjectId), axis: d.axis, value: d.value };
    case 'roomMembership':
      return {
        ...base,
        type: 'roomMembership',
        subject: subjectFor(personSlugById, d.subjectId),
        roomId: roomSlugById.get(d.roomId) ?? d.roomId,
        negated: d.negated,
      };
    case 'adjacency':
      return { ...base, type: 'adjacency', subject: subjectFor(personSlugById, d.subjectId), itemTypeId: d.itemTypeId, negated: d.negated };
    case 'sharedRoomGender':
      return {
        ...base,
        type: 'sharedRoomGender',
        subject: subjectFor(personSlugById, d.subjectId),
        otherGender: d.otherGender,
        negated: d.negated,
      };
    case 'itemTypeGender':
      return { ...base, type: 'itemTypeGender', itemTypeId: d.itemTypeId, gender: d.gender };
    case 'relativePosition':
      return {
        ...base,
        type: 'relativePosition',
        subject: subjectFor(personSlugById, d.subjectId),
        otherPersonId: personSlugById.get(d.otherPersonId) ?? d.otherPersonId,
        axis: d.axis,
        direction: d.direction,
        offset: d.offset,
      };
    case 'corner':
      return { ...base, type: 'corner', subject: subjectFor(personSlugById, d.subjectId), negated: d.negated };
    case 'sameRoomAs':
      return {
        ...base,
        type: 'sameRoomAs',
        subject: subjectFor(personSlugById, d.subjectId),
        otherPersonId: personSlugById.get(d.otherPersonId) ?? d.otherPersonId,
        negated: d.negated,
      };
    case 'aloneInRoom':
      return { ...base, type: 'aloneInRoom', subject: subjectFor(personSlugById, d.subjectId) };
    case 'sameRoomAsItem':
      return { ...base, type: 'sameRoomAsItem', subject: subjectFor(personSlugById, d.subjectId), itemTypeId: d.itemTypeId, negated: d.negated };
    case 'occupiesItem':
      return { ...base, type: 'occupiesItem', subject: subjectFor(personSlugById, d.subjectId), itemTypeId: d.itemTypeId, negated: d.negated };
    case 'wallSide':
      return {
        ...base,
        type: 'wallSide',
        subject: subjectFor(personSlugById, d.subjectId),
        wallDirection: d.wallDirection,
        negated: d.negated,
      };
    case 'roomSize':
      return { ...base, type: 'roomSize', subject: subjectFor(personSlugById, d.subjectId), comparison: d.comparison };
    case 'parity':
      return { ...base, type: 'parity', subject: subjectFor(personSlugById, d.subjectId), axis: d.axis, parity: d.parity };
    case 'betweenness':
      return {
        ...base,
        type: 'betweenness',
        subject: subjectFor(personSlugById, d.subjectId),
        otherPersonId1: personSlugById.get(d.otherPersonId1) ?? d.otherPersonId1,
        otherPersonId2: personSlugById.get(d.otherPersonId2) ?? d.otherPersonId2,
        axis: d.axis,
      };
    case 'roomOccupancy':
      return { ...base, type: 'roomOccupancy' };
    case 'roomParity':
      return { ...base, type: 'roomParity', parity: d.parity };
    case 'roomPopulation':
      return { ...base, type: 'roomPopulation', roomId: roomSlugById.get(d.roomId) ?? d.roomId, comparison: d.comparison };
    case 'letterGroupRoom':
      return { ...base, type: 'letterGroupRoom', letterClass: d.letterClass };
  }
}

export function buildLevelObject(snapshot: EditorSnapshot): BuildLevelResult | BuildLevelError {
  const { size, rooms, roomByCell, items, people, solution, victimId, murdererId, clues, meta } = snapshot;

  if (rooms.length === 0) return { error: 'Добавь хотя бы одну комнату' };
  if (people.length !== size) return { error: `Нужно ровно ${size} персонажей (сейчас ${people.length})` };
  if (!solution) return { error: 'Сначала подбери решение на шаге «Решение»' };
  if (!victimId || !murdererId) return { error: 'Выбери, кто жертва, а кто убийца, на шаге «Решение»' };

  const roomSlugById = buildSlugMap(rooms);
  const personSlugById = buildSlugMap(people);
  const roomIds = new Set(rooms.map((r) => r.id));

  const ROOM_BY_CELL: Record<string, string> = {};
  for (const [cid, roomId] of Object.entries(roomByCell)) {
    if (roomIds.has(roomId)) ROOM_BY_CELL[cid] = roomSlugById.get(roomId)!;
  }
  const roomForCell = (row: number, col: number): string | null => ROOM_BY_CELL[`${row}-${col}`] ?? null;

  const usedItemTypeIds = [...new Set(items.map((i) => i.typeId))];
  const itemTypes: ItemType[] = usedItemTypeIds.map((key) => (ItemLibrary as Record<string, () => ItemType>)[key]());

  const runtimeItems: Level['items'] = items.map((it) => ({ id: it.id, typeId: it.typeId, cells: [it.cellId] }));
  const itemIdByCell = new Map(runtimeItems.flatMap((item) => item.cells.map((cid) => [cid, item.id] as const)));
  const cells = buildCells(size, roomForCell, (row, col) => itemIdByCell.get(cellId(row, col)));

  const runtimeRooms: Level['rooms'] = rooms.map((r) => ({
    id: roomSlugById.get(r.id)!,
    name: r.name,
    floorTexture: r.floorTexture,
  }));

  const runtimePeople: Level['people'] = people.map((p) => ({
    id: personSlugById.get(p.id)!,
    name: p.name,
    initialLetter: p.initialLetter,
    gender: p.gender,
    color: p.color,
    isVictim: p.id === victimId,
    isMurderer: p.id === murdererId,
  }));

  const runtimeSolution: Level['solution'] = {};
  for (const p of people) runtimeSolution[personSlugById.get(p.id)!] = solution[p.id];

  const runtimeClues: ClueT[] = clues.map((c) => toRuntimeClue(c, personSlugById, roomSlugById));

  const level: Level = {
    meta: {
      id: 'preview',
      title: meta.title || 'Предпросмотр',
      theme: meta.theme,
      difficulty: meta.difficulty as Level['meta']['difficulty'],
      maxFullyPinnedPeople: 1,
    },
    size,
    rooms: runtimeRooms,
    itemTypes,
    items: runtimeItems,
    floorFeatures: [],
    cells,
    people: runtimePeople,
    solution: runtimeSolution,
    clues: runtimeClues,
  };

  return { level, personSlugById, roomSlugById };
}
