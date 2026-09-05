import type { EditorRoom, EditorItem, EditorPerson } from './editorStore';

type WallDirection = 'north' | 'south' | 'east' | 'west';

export interface ClueFacts {
  roomIdOf(personId: string): string | null;
  rowColOf(personId: string): { row: number; col: number } | null;
  isCorner(personId: string): boolean;
  trueWallSides(personId: string): WallDirection[];
  adjacentItemTypeId(personId: string): string | null;
  sameRoomItemTypeId(personId: string): string | null;
  ownCellItemTypeId(personId: string): string | null;
  roomSizeComparison(personId: string): 'largest' | 'smallest' | null;
  otherOccupantGenders(personId: string): ('male' | 'female')[];
  roomCellCount(roomId: string): number;
  mostPopulatedRoomIds(): string[];
  leastPopulatedRoomIds(): string[];
  allSameRoom(personIds: string[]): boolean;
  allRoomsParity(): 'even' | 'odd' | null;
}

function parseCellId(cid: string): { row: number; col: number } {
  const [row, col] = cid.split('-').map(Number);
  return { row, col };
}

export function computeClueFacts(
  rooms: EditorRoom[],
  roomByCell: Record<string, string>,
  items: EditorItem[],
  people: EditorPerson[],
  solution: Record<string, string> | null,
): ClueFacts {
  const itemByCell = new Map<string, string>(items.map((it) => [it.cellId as string, it.typeId]));
  const roomCellCounts = new Map<string, number>();
  for (const roomId of Object.values(roomByCell)) {
    roomCellCounts.set(roomId, (roomCellCounts.get(roomId) ?? 0) + 1);
  }

  const roomOccupants = new Map<string, string[]>(); // roomId -> personIds
  if (solution) {
    for (const person of people) {
      const cell = solution[person.id];
      const roomId = cell ? roomByCell[cell] : undefined;
      if (roomId) {
        const list = roomOccupants.get(roomId) ?? [];
        list.push(person.id);
        roomOccupants.set(roomId, list);
      }
    }
  }

  const roomIdOf = (personId: string): string | null => {
    const cell = solution?.[personId];
    return cell ? (roomByCell[cell] ?? null) : null;
  };

  const rowColOf = (personId: string) => {
    const cell = solution?.[personId];
    return cell ? parseCellId(cell) : null;
  };

  const neighborRoom = (row: number, col: number): string | undefined => roomByCell[`${row}-${col}`];

  const boundary = (personId: string) => {
    const rc = rowColOf(personId);
    if (!rc) return null;
    const own = roomByCell[`${rc.row}-${rc.col}`];
    return {
      north: neighborRoom(rc.row - 1, rc.col) !== own,
      south: neighborRoom(rc.row + 1, rc.col) !== own,
      west: neighborRoom(rc.row, rc.col - 1) !== own,
      east: neighborRoom(rc.row, rc.col + 1) !== own,
    };
  };

  return {
    roomIdOf,
    rowColOf,
    isCorner(personId) {
      const b = boundary(personId);
      if (!b) return false;
      return (b.north && b.west) || (b.north && b.east) || (b.south && b.west) || (b.south && b.east);
    },
    trueWallSides(personId) {
      const b = boundary(personId);
      if (!b) return [];
      return (['north', 'south', 'east', 'west'] as WallDirection[]).filter((d) => b[d]);
    },
    adjacentItemTypeId(personId) {
      const rc = rowColOf(personId);
      if (!rc) return null;
      const neighbors = [
        `${rc.row - 1}-${rc.col}`,
        `${rc.row + 1}-${rc.col}`,
        `${rc.row}-${rc.col - 1}`,
        `${rc.row}-${rc.col + 1}`,
      ];
      for (const n of neighbors) {
        const typeId = itemByCell.get(n);
        if (typeId) return typeId;
      }
      return null;
    },
    sameRoomItemTypeId(personId) {
      const roomId = roomIdOf(personId);
      if (!roomId) return null;
      for (const [cell, roomOfCell] of Object.entries(roomByCell)) {
        if (roomOfCell === roomId) {
          const typeId = itemByCell.get(cell);
          if (typeId) return typeId;
        }
      }
      return null;
    },
    ownCellItemTypeId(personId) {
      const cell = solution?.[personId];
      return cell ? (itemByCell.get(cell) ?? null) : null;
    },
    roomSizeComparison(personId) {
      const roomId = roomIdOf(personId);
      if (!roomId || roomCellCounts.size === 0) return null;
      const counts = [...roomCellCounts.values()];
      const max = Math.max(...counts);
      const min = Math.min(...counts);
      const own = roomCellCounts.get(roomId) ?? 0;
      if (own === max && max !== min) return 'largest';
      if (own === min && max !== min) return 'smallest';
      return null;
    },
    otherOccupantGenders(personId) {
      const roomId = roomIdOf(personId);
      if (!roomId) return [];
      const others = (roomOccupants.get(roomId) ?? []).filter((id) => id !== personId);
      const genders = others
        .map((id) => people.find((p) => p.id === id)?.gender)
        .filter((g): g is 'male' | 'female' => !!g);
      return [...new Set(genders)];
    },
    roomCellCount(roomId) {
      return roomCellCounts.get(roomId) ?? 0;
    },
    mostPopulatedRoomIds() {
      const entries = rooms.map((r) => [r.id, roomOccupants.get(r.id)?.length ?? 0] as const);
      if (entries.length === 0) return [];
      const max = Math.max(...entries.map(([, n]) => n));
      return entries.filter(([, n]) => n === max).map(([id]) => id);
    },
    leastPopulatedRoomIds() {
      const entries = rooms.map((r) => [r.id, roomOccupants.get(r.id)?.length ?? 0] as const);
      if (entries.length === 0) return [];
      const min = Math.min(...entries.map(([, n]) => n));
      return entries.filter(([, n]) => n === min).map(([id]) => id);
    },
    allSameRoom(personIds) {
      if (personIds.length === 0) return false;
      const roomIds = personIds.map((id) => roomIdOf(id));
      if (roomIds.some((r) => r == null)) return false;
      return new Set(roomIds).size === 1;
    },
    allRoomsParity() {
      const counts = rooms.map((r) => roomOccupants.get(r.id)?.length ?? 0);
      if (counts.length === 0) return null;
      const allEven = counts.every((c) => c % 2 === 0);
      const allOdd = counts.every((c) => c % 2 === 1);
      if (allEven) return 'even';
      if (allOdd) return 'odd';
      return null;
    },
  };
}
