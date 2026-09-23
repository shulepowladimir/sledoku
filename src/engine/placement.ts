import type { Level, CellId, PersonId } from '../types/level';
import type { PlayerState } from '../types/game';
import { emptyCellMarks } from '../types/game';
import type { LevelIndex } from './board';
import { isLegalTarget, rowColPeers } from './board';

function cloneCellMarks(state: PlayerState): PlayerState['cellMarks'] {
  const next: PlayerState['cellMarks'] = {};
  for (const [id, marks] of Object.entries(state.cellMarks)) {
    if (!marks) continue;
    next[id as CellId] = {
      pencilMarks: new Set(marks.pencilMarks),
      manualCross: marks.manualCross,
      autoCrossSources: new Set(marks.autoCrossSources),
    };
  }
  return next;
}

function retractAutoCrosses(
  cellMarks: PlayerState['cellMarks'],
  index: LevelIndex,
  fromCellId: CellId,
  personId: PersonId,
): void {
  for (const peer of rowColPeers(index, fromCellId)) {
    const marks = cellMarks[peer];
    if (marks) marks.autoCrossSources.delete(personId);
  }
}

function applyAutoCrosses(
  cellMarks: PlayerState['cellMarks'],
  index: LevelIndex,
  atCellId: CellId,
  personId: PersonId,
): void {
  for (const peer of rowColPeers(index, atCellId)) {
    const marks = cellMarks[peer] ?? emptyCellMarks();
    marks.autoCrossSources.add(personId);
    marks.pencilMarks.clear();
    cellMarks[peer] = marks;
  }
}

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

export function placePerson(
  state: PlayerState,
  level: Level,
  index: LevelIndex,
  personId: PersonId,
  targetCellId: CellId,
  now: number,
): PlayerState {
  if (!isLegalTarget(index, level, targetCellId)) return state;
  if (state.placements[personId] === targetCellId) return state;

  const occupant = findOccupant(state.placements, targetCellId);
  if (occupant && occupant !== personId) return state;

  const placements = { ...state.placements };
  const cellMarks = cloneCellMarks(state);

  const previousCellId = placements[personId];
  if (previousCellId) {
    retractAutoCrosses(cellMarks, index, previousCellId, personId);
  }

  placements[personId] = targetCellId;
  applyAutoCrosses(cellMarks, index, targetCellId, personId);

  for (const marks of Object.values(cellMarks)) {
    marks?.pencilMarks.delete(personId);
  }

  // Клетка занята персонажем — остальные метки на ней пропадают (как при
  // ручном крестике: метки стираются, а не висят под фигуркой).
  const targetMarks = cellMarks[targetCellId];
  if (targetMarks && targetMarks.pencilMarks.size > 0) {
    cellMarks[targetCellId] = { ...targetMarks, pencilMarks: new Set<PersonId>() };
  }

  return { ...state, placements, cellMarks, timer: ensureTimerStarted(state, now) };
}

export function removePerson(
  state: PlayerState,
  index: LevelIndex,
  personId: PersonId,
  now: number,
): PlayerState {
  const cellId = state.placements[personId];
  if (!cellId) return state;

  const placements = { ...state.placements };
  delete placements[personId];
  const cellMarks = cloneCellMarks(state);
  retractAutoCrosses(cellMarks, index, cellId, personId);

  return { ...state, placements, cellMarks, timer: ensureTimerStarted(state, now) };
}
