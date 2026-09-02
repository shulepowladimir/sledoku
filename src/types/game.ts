import type { CellId, LevelId, PersonId } from './level';

export type CrossOrigin = 'manual' | 'auto';

export interface CellMarks {
  pencilMarks: Set<PersonId>;
  manualCross: boolean;
  autoCrossSources: Set<PersonId>; // personIds whose CURRENT placement caused an auto-cross here
}

export interface TimerState {
  startedAt: number | null; // epoch ms of first interaction; null if not started
  elapsedMs: number; // accumulated time
  running: boolean;
  finishedAt: number | null; // epoch ms when solved; null until success
}

export type PersonCheckStatus = 'correct' | 'incorrect' | 'unplaced';

export interface CheckResult {
  checkedAt: number;
  perPerson: Record<PersonId, PersonCheckStatus>;
  allCorrect: boolean;
}

export interface PlayerState {
  placements: Partial<Record<PersonId, CellId>>; // one destination per person; absent = unplaced
  cellMarks: Partial<Record<CellId, CellMarks>>;
  timer: TimerState;
  lastResult: CheckResult | null;
}

export interface GameState {
  levelId: LevelId;
  player: PlayerState;
  bestTimeMs: number | null;
}

export function emptyCellMarks(): CellMarks {
  return { pencilMarks: new Set(), manualCross: false, autoCrossSources: new Set() };
}

export function emptyTimer(): TimerState {
  return { startedAt: null, elapsedMs: 0, running: false, finishedAt: null };
}

export function runningTimer(startedAt: number): TimerState {
  return { startedAt, elapsedMs: 0, running: true, finishedAt: null };
}

export function emptyPlayerState(): PlayerState {
  return { placements: {}, cellMarks: {}, timer: emptyTimer(), lastResult: null };
}
