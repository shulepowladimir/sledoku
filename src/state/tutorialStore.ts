import { create } from 'zustand';
import type { PersonId } from '../types/level';
import type { TutorialStep } from '../types/tutorial';
import { useGameStore } from './gameStore';
import type { PlayerState } from '../types/game';

interface TutorialStore {
  active: boolean;
  steps: TutorialStep[];
  stepIndex: number;
  /** undoStack length captured when the current step began — the 'undo' advance waits for it to shrink. */
  undoBaseline: number;
  /** Mirrors the persisted tutorial-done flag so UI can react to completion without remounting. */
  tutorialDone: boolean;
  /** Started automatically when the tutorial level is selected. */
  start: (steps: TutorialStep[]) => void;
  next: () => void;
  /** Steps back one step (never below 0). */
  prev: () => void;
  /** Completes the scenario: marks the tutorial done in localStorage and deactivates. */
  finish: () => void;
  /** Silently deactivates without marking done (leaving to a regular level / menu). */
  stop: () => void;
}

const TUTORIAL_DONE_KEY = 'sledoku:tutorial-done';

export function readTutorialDone(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_DONE_KEY, '1');
  } catch {
    // localStorage unavailable — the badge just won't persist
  }
}

interface GameSnapshot {
  selectedPersonId: PersonId | null;
  mode: 'person' | 'cross' | 'erase';
  undoStackLength: number;
  screen: 'menu' | 'game';
}

function isConditionMet(step: TutorialStep, player: PlayerState, game: GameSnapshot, undoBaseline: number): boolean {
  const adv = step.advance;
  switch (adv.kind) {
    case 'next':
      return false; // never auto-advances — waiting for the "Далее" button
    case 'place':
      return player.placements[adv.personId] === adv.cellId;
    case 'remove':
      return player.placements[adv.personId] == null;
    case 'pencil':
      return adv.cellIds.every((cid) => player.cellMarks[cid]?.pencilMarks.has(adv.personId) === true);
    case 'unpencil':
      return adv.cellIds.every((cid) => player.cellMarks[cid]?.pencilMarks.has(adv.personId) !== true);
    case 'cross':
      return adv.cellIds.every((cid) => player.cellMarks[cid]?.manualCross === true);
    case 'selectPerson':
      return game.selectedPersonId === adv.personId;
    case 'mode':
      return game.mode === adv.mode;
    case 'undoCount':
      return game.undoStackLength >= adv.count;
    case 'undo':
      return game.undoStackLength < undoBaseline;
    case 'boardEmpty':
      return Object.keys(player.placements).length === 0 && Object.keys(player.cellMarks).length === 0;
    case 'placements':
      return adv.personIds.every((pid) => player.placements[pid] != null);
    case 'solved':
      return player.lastResult?.allCorrect === true && player.timer.finishedAt != null;
    case 'menu':
      return game.screen === 'menu';
  }
}

/** Whether the given step's action condition is ALREADY satisfied against the current game
 *  state. Used by the tooltip: after stepping back onto an already-completed action step it
 *  shows a "Далее" button instead of demanding the action be repeated. */
export function isStepConditionSatisfied(step: TutorialStep): boolean {
  if (step.advance.kind === 'next') return false;
  const game = useGameStore.getState();
  return isConditionMet(
    step,
    game.player,
    {
      selectedPersonId: game.selectedPersonId,
      mode: game.mode,
      undoStackLength: game.undoStack.length,
      screen: game.screen,
    },
    useTutorialStore.getState().undoBaseline,
  );
}

function snapshotGame(): GameSnapshot {
  const game = useGameStore.getState();
  return {
    selectedPersonId: game.selectedPersonId,
    mode: game.mode,
    undoStackLength: game.undoStack.length,
    screen: game.screen,
  };
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  active: false,
  steps: [],
  stepIndex: 0,
  undoBaseline: 0,
  tutorialDone: readTutorialDone(),

  start: (steps) => set({ active: true, steps, stepIndex: 0, undoBaseline: snapshotGame().undoStackLength }),

  next: () => {
    const { stepIndex, steps } = get();
    if (stepIndex + 1 >= steps.length) {
      get().finish();
      return;
    }
    set({ stepIndex: stepIndex + 1, undoBaseline: snapshotGame().undoStackLength });
  },

  prev: () => {
    const { stepIndex } = get();
    if (stepIndex === 0) return;
    set({ stepIndex: stepIndex - 1, undoBaseline: snapshotGame().undoStackLength });
  },

  finish: () => {
    writeTutorialDone();
    set({ active: false, steps: [], stepIndex: 0, tutorialDone: true });
  },

  stop: () => set({ active: false, steps: [], stepIndex: 0 }),
}));

/** Controller: reacts to gameStore changes and auto-advances the current step
 *  when its condition is met. Mounted once from TutorialOverlay. */
export function watchTutorial(): () => void {
  const check = () => {
    const { active, steps, stepIndex, undoBaseline } = useTutorialStore.getState();
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) return;
    const game = useGameStore.getState();
    // Leaving to the menu drops the scenario — except when the step itself waits for the menu
    // (the go-menu → bridge hand-off finishes the tutorial inside the menu screen).
    if (game.screen === 'menu' && step.advance.kind !== 'menu') {
      useTutorialStore.getState().stop();
      return;
    }
    if (
      isConditionMet(
        step,
        game.player,
        {
          selectedPersonId: game.selectedPersonId,
          mode: game.mode,
          undoStackLength: game.undoStack.length,
          screen: game.screen,
        },
        undoBaseline,
      )
    ) {
      useTutorialStore.getState().next();
    }
  };
  return useGameStore.subscribe(check);
}
