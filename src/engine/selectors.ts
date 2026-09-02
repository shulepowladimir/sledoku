import type { CellId, PersonId } from '../types/level';
import type { CellMarks, PlayerState, PersonCheckStatus } from '../types/game';
import { emptyCellMarks } from '../types/game';

export function occupantOf(state: PlayerState, cellId: CellId): PersonId | undefined {
  for (const [personId, cell] of Object.entries(state.placements)) {
    if (cell === cellId) return personId;
  }
  return undefined;
}

export function marksOf(state: PlayerState, cellId: CellId): CellMarks {
  return state.cellMarks[cellId] ?? emptyCellMarks();
}

export type CrossKind = 'none' | 'manual' | 'auto' | 'both';

export function crossKind(state: PlayerState, cellId: CellId): CrossKind {
  const marks = marksOf(state, cellId);
  const hasManual = marks.manualCross;
  const hasAuto = marks.autoCrossSources.size > 0;
  if (hasManual && hasAuto) return 'both';
  if (hasManual) return 'manual';
  if (hasAuto) return 'auto';
  return 'none';
}

export function isCrossed(state: PlayerState, cellId: CellId): boolean {
  return crossKind(state, cellId) !== 'none';
}

export function personStatus(state: PlayerState, personId: PersonId): PersonCheckStatus {
  if (state.lastResult) return state.lastResult.perPerson[personId];
  return 'unplaced';
}

export function elapsedMsNow(state: PlayerState, now: number): number {
  const { timer } = state;
  if (timer.startedAt == null) return timer.elapsedMs;
  const runningUntil = timer.finishedAt ?? now;
  return timer.elapsedMs + (runningUntil - timer.startedAt);
}

export function isSolved(state: PlayerState): boolean {
  return state.timer.finishedAt != null;
}
