import type { Level, PersonId, RoomId } from '../../src/types/level';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { computeUnaryDomain } from './solve';

export interface PersonQuality {
  personId: PersonId;
  name: string;
  soloDomainSize: number;
  fullyPinned: boolean;
}

export interface ClueTypeStats {
  type: string;
  count: number;
  percent: number;
}

export interface RoomStats {
  roomId: RoomId;
  name: string;
  cellCount: number;
  occupantCount: number;
}

export interface PuzzleQualityReport {
  perPerson: PersonQuality[];
  fullyPinnedCount: number;
  budget: number;
  clueTypeStats: ClueTypeStats[];
  roomStats: RoomStats[];
  violations: string[];
}

const MAX_CLUE_TYPE_SHARE = 0.2;
const MAX_ITEM_RELATED_CLUE_TYPE_SHARE = 0.3;
/** Personal clue types whose informational value comes from the level's item layout — get a looser cap
 * to encourage authors to lean on the item library instead of defaulting to positional/parity padding. */
const ITEM_RELATED_CLUE_TYPES = new Set([
  'adjacency',
  'floorFeature',
  'floorTexture',
  'sameRoomAsItem',
  'occupiesItem',
  'relativeToItemOccupant',
]);

function maxShareFor(type: string): number {
  return ITEM_RELATED_CLUE_TYPES.has(type) ? MAX_ITEM_RELATED_CLUE_TYPE_SHARE : MAX_CLUE_TYPE_SHARE;
}

/**
 * A person is "fully pinned" when their own unary clues (position/roomMembership/adjacency/corner/...)
 * narrow them down to at most one cell without any help from AllDifferent or other people's clues —
 * i.e. the clue reads like a direct coordinate instruction rather than a "наводящая" (leading) clue.
 */
export function checkPuzzleQuality(level: Level): PuzzleQualityReport {
  const index = buildLevelIndex(level);
  const legalCells = level.cells.filter((c) => isLegalTarget(index, level, c.id));
  const budget = level.meta.maxFullyPinnedPeople;

  const perPerson: PersonQuality[] = level.people
    .filter((p) => !p.isVictim)
    .map((person) => {
      const soloDomainSize = computeUnaryDomain(level, index, legalCells, person.id).length;
      return { personId: person.id, name: person.name, soloDomainSize, fullyPinned: soloDomainSize <= 1 };
    });

  const fullyPinnedCount = perPerson.filter((p) => p.fullyPinned).length;
  const violations: string[] = [];
  if (fullyPinnedCount > budget) {
    const names = perPerson
      .filter((p) => p.fullyPinned)
      .map((p) => p.name)
      .join(', ');
    violations.push(
      `Слишком много людей полностью определены собственными подсказками без пересечения/исключения: ${fullyPinnedCount} (бюджет level.meta.maxFullyPinnedPeople = ${budget}). Это: ${names}.`,
    );
  }

  const total = level.clues.length;
  const countsByType = new Map<string, number>();
  for (const clue of level.clues) {
    countsByType.set(clue.type, (countsByType.get(clue.type) ?? 0) + 1);
  }
  const clueTypeStats: ClueTypeStats[] = [...countsByType.entries()]
    .map(([type, count]) => ({ type, count, percent: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);

  if (!level.meta.clueBalanceExempt) {
    for (const stat of clueTypeStats) {
      const maxShare = maxShareFor(stat.type);
      if (stat.count / total > maxShare) {
        violations.push(
          `Тип подсказки "${stat.type}" занимает ${stat.percent.toFixed(1)}% всех подсказок уровня (${stat.count} из ${total}) — выше предела ${(maxShare * 100).toFixed(0)}%.`,
        );
      }
    }
  }

  const cellCounts = new Map<RoomId, number>();
  for (const cell of level.cells) cellCounts.set(cell.roomId, (cellCounts.get(cell.roomId) ?? 0) + 1);
  const occupantCounts = new Map<RoomId, number>();
  for (const person of level.people) {
    const cell = index.cellsById.get(level.solution[person.id]);
    if (cell) occupantCounts.set(cell.roomId, (occupantCounts.get(cell.roomId) ?? 0) + 1);
  }
  const roomStats: RoomStats[] = level.rooms.map((room) => ({
    roomId: room.id,
    name: room.name,
    cellCount: cellCounts.get(room.id) ?? 0,
    occupantCount: occupantCounts.get(room.id) ?? 0,
  }));

  return { perPerson, fullyPinnedCount, budget, clueTypeStats, roomStats, violations };
}
