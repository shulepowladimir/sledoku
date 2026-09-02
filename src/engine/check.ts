import type { Level, PersonId } from '../types/level';
import type { PlayerState, CheckResult, PersonCheckStatus } from '../types/game';

export function checkSubmit(state: PlayerState, level: Level, now: number): PlayerState {
  const perPerson: Record<PersonId, PersonCheckStatus> = {};
  let allCorrect = true;

  for (const person of level.people) {
    const placed = state.placements[person.id];
    let status: PersonCheckStatus;
    if (!placed) {
      status = 'unplaced';
      allCorrect = false;
    } else if (placed === level.solution[person.id]) {
      status = 'correct';
    } else {
      status = 'incorrect';
      allCorrect = false;
    }
    perPerson[person.id] = status;
  }

  const result: CheckResult = { checkedAt: now, perPerson, allCorrect };

  const alreadyFinished = state.timer.finishedAt != null;
  const timer =
    allCorrect && !alreadyFinished
      ? { ...state.timer, running: false, finishedAt: now }
      : state.timer;

  return { ...state, lastResult: result, timer };
}
