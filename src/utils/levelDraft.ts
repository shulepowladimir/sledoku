import { buildLevelIndex, isLegalTarget } from '../engine/board';
import { elapsedMsNow, isSolved } from '../engine/selectors';
import type { CheckResult, PlayerState } from '../types/game';
import type { CellId, Level, PersonId } from '../types/level';

export interface SerializedCellMarks {
  pencilMarks: string[];
  manualCross: boolean;
  autoCrossSources: string[];
}

export interface LevelDraft {
  version: 1;
  levelId: string;
  savedAt: number;
  completed?: true;
  player: {
    placements: Record<string, string>;
    cellMarks: Record<string, SerializedCellMarks>;
    elapsedMs: number;
    lastResult: CheckResult | null;
  };
}

export interface DeletedLevelDraft {
  version: 1;
  levelId: string;
  savedAt: number;
  deleted: true;
}

export type LevelDraftRecord = LevelDraft | DeletedLevelDraft;
export type LevelDraftMap = Record<string, LevelDraftRecord>;

export function tombstoneLevelDraft(levelId: string, savedAt: number): DeletedLevelDraft {
  return { version: 1, levelId, savedAt, deleted: true };
}

export function isActiveLevelDraft(draft: LevelDraftRecord | undefined): draft is LevelDraft {
  return draft != null && !('deleted' in draft);
}

export function isInProgressLevelDraft(draft: LevelDraftRecord | undefined): draft is LevelDraft {
  return isActiveLevelDraft(draft) && draft.completed !== true;
}

export function serializeLevelDraft(levelId: string, player: PlayerState, now: number): LevelDraft {
  const completed = isSolved(player);
  const cellMarks = Object.fromEntries(
    Object.entries(player.cellMarks).flatMap(([cellId, marks]) => {
      if (!marks) return [];
      return [[cellId, {
        pencilMarks: [...marks.pencilMarks].sort(),
        manualCross: marks.manualCross,
        autoCrossSources: [...marks.autoCrossSources].sort(),
      } satisfies SerializedCellMarks]];
    }),
  );

  return {
    version: 1,
    levelId,
    savedAt: now,
    ...(completed ? { completed: true as const } : {}),
    player: {
      placements: Object.fromEntries(
        Object.entries(player.placements).filter(([, cellId]) => typeof cellId === 'string'),
      ) as Record<string, string>,
      cellMarks,
      elapsedMs: Math.max(0, elapsedMsNow(player, now)),
      lastResult: player.lastResult,
    },
  };
}

export function restoreLevelDraft(draft: unknown, level: Level, now: number): PlayerState | null {
  if (!isRecord(draft) || draft.version !== 1 || draft.levelId !== level.meta.id || !isFiniteNumber(draft.savedAt)) {
    return null;
  }
  if (draft.completed != null && draft.completed !== true) return null;
  if (!isRecord(draft.player) || !isFiniteNumber(draft.player.elapsedMs) || draft.player.elapsedMs < 0) return null;
  if (!isRecord(draft.player.placements) || !isRecord(draft.player.cellMarks)) return null;

  const people = new Set(level.people.map((person) => person.id));
  const index = buildLevelIndex(level);
  const placements: Partial<Record<PersonId, CellId>> = {};
  const occupied = new Set<string>();
  for (const [personId, cellId] of Object.entries(draft.player.placements)) {
    if (!people.has(personId) || typeof cellId !== 'string' || !isLegalTarget(index, level, cellId as CellId) || occupied.has(cellId)) {
      return null;
    }
    placements[personId as PersonId] = cellId as CellId;
    occupied.add(cellId);
  }

  const cellIds = new Set(level.cells.map((cell) => cell.id));
  const cellMarks: PlayerState['cellMarks'] = {};
  for (const [cellId, value] of Object.entries(draft.player.cellMarks)) {
    if (!cellIds.has(cellId as CellId) || !isRecord(value) || !Array.isArray(value.pencilMarks) || !Array.isArray(value.autoCrossSources)) {
      return null;
    }
    if (typeof value.manualCross !== 'boolean') return null;
    if (![...value.pencilMarks, ...value.autoCrossSources].every((personId) => typeof personId === 'string' && people.has(personId))) {
      return null;
    }
    cellMarks[cellId as CellId] = {
      pencilMarks: new Set(value.pencilMarks as PersonId[]),
      manualCross: value.manualCross,
      autoCrossSources: new Set(value.autoCrossSources as PersonId[]),
    };
  }

  const lastResult = parseCheckResult(draft.player.lastResult, people);
  if (lastResult === undefined) return null;
  const completed = draft.completed === true;
  if (completed && (!lastResult?.allCorrect || !level.people.every((person) => placements[person.id] === level.solution[person.id]))) {
    return null;
  }

  return {
    placements,
    cellMarks,
    timer: completed
      ? { startedAt: null, elapsedMs: draft.player.elapsedMs, running: false, finishedAt: now }
      : { startedAt: now, elapsedMs: draft.player.elapsedMs, running: true, finishedAt: null },
    lastResult,
  };
}

export function mergeLevelDraftMaps(...maps: LevelDraftMap[]): LevelDraftMap {
  const merged: LevelDraftMap = {};
  for (const map of maps) {
    for (const [levelId, draft] of Object.entries(map)) {
      const existing = merged[levelId];
      if (!existing || draft.savedAt >= existing.savedAt) merged[levelId] = draft;
    }
  }
  return merged;
}

function parseCheckResult(value: unknown, people: Set<string>): CheckResult | null | undefined {
  if (value == null) return null;
  if (!isRecord(value) || !isFiniteNumber(value.checkedAt) || typeof value.allCorrect !== 'boolean' || !isRecord(value.perPerson)) {
    return undefined;
  }
  for (const [personId, status] of Object.entries(value.perPerson)) {
    if (!people.has(personId) || !['correct', 'incorrect', 'unplaced'].includes(String(status))) return undefined;
  }
  return value as unknown as CheckResult;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
