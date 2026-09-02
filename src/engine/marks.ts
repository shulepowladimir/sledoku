import type { CellId, PersonId } from '../types/level';
import type { PlayerState } from '../types/game';
import { emptyCellMarks } from '../types/game';
import type { LevelIndex } from './board';
import { removePerson } from './placement';

function findOccupant(placements: PlayerState['placements'], cellId: CellId): PersonId | undefined {
  for (const [personId, cell] of Object.entries(placements)) {
    if (cell === cellId) return personId;
  }
  return undefined;
}

function ensureTimerStarted(state: PlayerState, now: number): PlayerState['timer'] {
  const timer = state.timer;
  if (timer.startedAt != null || timer.finishedAt != null) return timer;
  return { ...timer, startedAt: now, running: true };
}

export function toggleMark(state: PlayerState, cellId: CellId, personId: PersonId, now: number): PlayerState {
  const existing = state.cellMarks[cellId];
  if (existing && (existing.manualCross || existing.autoCrossSources.size > 0)) return state;

  const marks = existing
    ? {
        pencilMarks: new Set(existing.pencilMarks),
        manualCross: existing.manualCross,
        autoCrossSources: new Set(existing.autoCrossSources),
      }
    : emptyCellMarks();

  if (marks.pencilMarks.has(personId)) {
    marks.pencilMarks.delete(personId);
  } else {
    marks.pencilMarks.add(personId);
  }

  return {
    ...state,
    cellMarks: { ...state.cellMarks, [cellId]: marks },
    timer: ensureTimerStarted(state, now),
  };
}

export function toggleManualCross(state: PlayerState, cellId: CellId, now: number): PlayerState {
  if (findOccupant(state.placements, cellId)) return state;

  const existing = state.cellMarks[cellId];
  const turningOn = !(existing?.manualCross ?? false);
  const marks = existing
    ? {
        pencilMarks: turningOn ? new Set<PersonId>() : new Set(existing.pencilMarks),
        manualCross: !existing.manualCross,
        autoCrossSources: new Set(existing.autoCrossSources),
      }
    : { ...emptyCellMarks(), manualCross: true };

  return {
    ...state,
    cellMarks: { ...state.cellMarks, [cellId]: marks },
    timer: ensureTimerStarted(state, now),
  };
}

export function clearCell(state: PlayerState, index: LevelIndex, cellId: CellId, now: number): PlayerState {
  const occupant = findOccupant(state.placements, cellId);
  const next = occupant ? removePerson(state, index, occupant, now) : state;

  const marks = next.cellMarks[cellId];
  if (!marks || (marks.pencilMarks.size === 0 && !marks.manualCross)) {
    return next;
  }

  const cellMarks = {
    ...next.cellMarks,
    [cellId]: { pencilMarks: new Set<PersonId>(), manualCross: false, autoCrossSources: new Set(marks.autoCrossSources) },
  };

  return { ...next, cellMarks, timer: ensureTimerStarted(next, now) };
}
