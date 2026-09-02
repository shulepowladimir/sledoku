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
import { recordBestTime } from '../utils/bestTime';
import { useAuthStore } from './authStore';
import { pushResult } from '../utils/cloudSync';

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
  undo: () => void;
}

const level = apartmentLevel;
const index = buildLevelIndex(level);

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
    if (isSolved(next) && !isSolved(player)) {
      const elapsed = elapsedMsNow(next, now);
      isNewRecord = recordBestTime(level.meta.id, elapsed);
      const session = useAuthStore.getState().session;
      if (isNewRecord && session) {
        void pushResult(session.user.id, level.meta.id, elapsed);
      }
    }
    set({ player: next, isNewRecord });
  },

  selectLevel: (level) => {
    set({
      screen: 'game',
      level,
      index: buildLevelIndex(level),
      player: { ...emptyPlayerState(), timer: runningTimer(Date.now()) },
      undoStack: [],
      selectedPersonId: null,
      isNewRecord: false,
    });
  },

  goToMenu: () => set({ screen: 'menu' }),

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
