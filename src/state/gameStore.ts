import { create } from 'zustand';
import type { CellId, Level, PersonId } from '../types/level';
import type { PlayerState } from '../types/game';
import { emptyPlayerState, runningTimer } from '../types/game';
import type { LevelIndex } from '../engine/board';
import { buildLevelIndex, isLegalTarget } from '../engine/board';
import { placePerson, removePerson } from '../engine/placement';
import { toggleMark, toggleManualCross, clearCell } from '../engine/marks';
import { checkSubmit } from '../engine/check';
import { occupantOf, isSolved, elapsedMsNow } from '../engine/selectors';
import { apartmentLevel } from '../../levels/01-apartment';
import { buildTutorialSteps } from '../../levels/00-tutorial.steps';
import { useProgressStore } from './progressStore';
import { useTutorialStore } from './tutorialStore';
import { useLevelDraftStore } from './levelDraftStore';
import { isActiveLevelDraft, restoreLevelDraft, serializeLevelDraft } from '../utils/levelDraft';

export type InteractionMode = 'person' | 'cross' | 'erase';
export type Screen = 'menu' | 'game';

interface GameStore {
  screen: Screen;
  level: Level;
  index: LevelIndex;
  player: PlayerState;
  undoStack: PlayerState[];
  selectedPersonId: PersonId | null;
  mode: InteractionMode;
  isNewRecord: boolean;
  selectPerson: (id: PersonId) => void;
  setMode: (mode: InteractionMode) => void;
  handleLeftClick: (cellId: CellId) => void;
  handleRightClick: (cellId: CellId) => void;
  clearBoard: () => void;
  restart: () => void;
  check: () => void;
  selectLevel: (level: Level) => void;
  goToMenu: () => void;
  pauseForPageExit: () => void;
  resumeAfterPageReturn: () => void;
  checkpointDraft: () => void;
  undo: () => void;
}

const level = apartmentLevel;
const index = buildLevelIndex(level);

function pausedPlayer(player: PlayerState, now: number): PlayerState {
  return {
    ...player,
    timer: {
      ...player.timer,
      startedAt: null,
      elapsedMs: elapsedMsNow(player, now),
      running: false,
    },
  };
}

function saveDraft(level: Level, player: PlayerState, now: number, immediate = false) {
  const drafts = useLevelDraftStore.getState();
  if (level.meta.isTutorial) return;
  if (isSolved(player)) drafts.clearDraft(level.meta.id, now, immediate);
  else drafts.saveDraft(serializeLevelDraft(level.meta.id, player, now), immediate);
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu',
  level,
  index,
  player: emptyPlayerState(),
  undoStack: [],
  selectedPersonId: null,
  mode: 'person',
  isNewRecord: false,

  selectPerson: (id) =>
    set((s) => ({
      selectedPersonId: s.selectedPersonId === id ? null : id,
      mode: 'person',
    })),

  setMode: (mode) => set({ mode, selectedPersonId: null }),

  handleLeftClick: (cellId) => {
    const { mode, selectedPersonId, player, level, index } = get();
    if (!isLegalTarget(index, level, cellId)) return;
    const now = Date.now();
    if (mode === 'cross') {
      const next = toggleManualCross(player, cellId, now);
      if (next === player) return;
      set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
      return;
    }
    if (mode === 'erase') {
      const next = clearCell(player, index, cellId, now);
      if (next === player) return;
      set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
      return;
    }
    if (!selectedPersonId) return;
    const next =
      occupantOf(player, cellId) === selectedPersonId
        ? removePerson(player, index, selectedPersonId, now)
        : placePerson(player, level, index, selectedPersonId, cellId, now);
    if (next === player) return;
    set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
  },

  handleRightClick: (cellId) => {
    const { mode, selectedPersonId, player, level, index } = get();
    if (!isLegalTarget(index, level, cellId)) return;
    const now = Date.now();
    if (mode === 'cross') {
      const next = toggleManualCross(player, cellId, now);
      if (next === player) return;
      set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
      return;
    }
    if (mode === 'erase') {
      const next = clearCell(player, index, cellId, now);
      if (next === player) return;
      set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
      return;
    }
    if (!selectedPersonId) return;
    const next = toggleMark(player, cellId, selectedPersonId, now);
    if (next === player) return;
    set((s) => ({ player: next, undoStack: [...s.undoStack, player] }));
  },

  clearBoard: () => {
    if (!window.confirm('Очистить всю доску? Время не сбросится.')) return;
    set((s) => ({ player: { ...emptyPlayerState(), timer: s.player.timer }, undoStack: [] }));
  },

  restart: () => {
    if (!window.confirm('Начать уровень заново? Прогресс и время будут сброшены.')) return;
    set({ player: { ...emptyPlayerState(), timer: runningTimer(Date.now()) }, undoStack: [], isNewRecord: false });
  },

  check: () => {
    const { player, level } = get();
    const now = Date.now();
    const next = checkSubmit(player, level, now);
    let isNewRecord = false;
    if (isSolved(next) && !isSolved(player) && !level.meta.isTutorial) {
      const elapsed = elapsedMsNow(next, now);
      isNewRecord = useProgressStore.getState().recordResult(level.meta.id, elapsed);
    }
    set({ player: next, isNewRecord });
  },

  selectLevel: (level) => {
    const current = get();
    const now = Date.now();
    if (current.screen === 'game') {
      saveDraft(current.level, pausedPlayer(current.player, now), now, true);
    }
    const saved = useLevelDraftStore.getState().drafts[level.meta.id];
    const restored = isActiveLevelDraft(saved) ? restoreLevelDraft(saved, level, now) : null;
    if (saved && isActiveLevelDraft(saved) && !restored) {
      useLevelDraftStore.getState().clearDraft(level.meta.id, now, true);
    }
    set({
      screen: 'game',
      level,
      index: buildLevelIndex(level),
      player: restored ?? { ...emptyPlayerState(), timer: runningTimer(now) },
      undoStack: [],
      selectedPersonId: null,
      isNewRecord: false,
    });
    const { start, stop } = useTutorialStore.getState();
    if (level.meta.isTutorial) start(buildTutorialSteps());
    else stop();
  },

  goToMenu: () => {
    const state = get();
    if (state.screen !== 'game') return;
    const now = Date.now();
    const player = pausedPlayer(state.player, now);
    saveDraft(state.level, player, now, true);
    set({ screen: 'menu', player, undoStack: [], selectedPersonId: null });
  },

  pauseForPageExit: () => {
    const state = get();
    if (state.screen !== 'game' || !state.player.timer.running) return;
    const now = Date.now();
    const player = pausedPlayer(state.player, now);
    saveDraft(state.level, player, now, true);
    set({ player });
  },

  resumeAfterPageReturn: () => {
    const state = get();
    if (state.screen !== 'game' || state.player.timer.running || isSolved(state.player)) return;
    const now = Date.now();
    set({ player: { ...state.player, timer: { ...state.player.timer, startedAt: now, running: true } } });
  },

  checkpointDraft: () => {
    const state = get();
    if (state.screen === 'game') saveDraft(state.level, state.player, Date.now());
  },

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return {};
      const stack = s.undoStack.slice(0, -1);
      const previous = s.undoStack[s.undoStack.length - 1];
      const now = Date.now();
      const timer = {
        startedAt: now,
        elapsedMs: elapsedMsNow(s.player, now),
        running: true,
        finishedAt: null,
      };
      return { player: { ...previous, timer }, undoStack: stack };
    }),
}));

useGameStore.subscribe((state, previous) => {
  if (state.screen === 'game' && state.player !== previous.player) {
    saveDraft(state.level, state.player, Date.now());
  }
});
