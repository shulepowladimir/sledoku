import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const GUEST_STORAGE_KEY = 'sledoku:guest-best-times';

type BestTimes = Record<string, number>;

function readGuest(): BestTimes {
  try {
    return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeGuest(times: BestTimes) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(times));
}

interface ProgressStore {
  bestTimes: BestTimes;
  /** null, пока не понятно, гость это или аккаунт (сразу после загрузки страницы) */
  userId: string | null;
  ready: boolean;

  /** Вызывается, когда становится ясно, что пользователь НЕ авторизован */
  hydrateGuest: () => void;
  /** Вызывается сразу после входа/восстановления сессии конкретного аккаунта */
  hydrateAccount: (userId: string) => Promise<void>;
  /** Новый результат на текущем уровне. Пишет либо в localStorage (гость), либо в облако (аккаунт). */
  recordResult: (levelId: string, elapsedMs: number) => boolean;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  bestTimes: readGuest(),
  userId: null,
  ready: false,

  hydrateGuest: () => {
    set({ bestTimes: readGuest(), userId: null, ready: true });
  },

  hydrateAccount: async (userId: string) => {
    // При первом входе с этого браузера переносим гостевой прогресс в аккаунт
    // (если по какому-то уровню локальный результат лучше облачного).
    const guest = readGuest();
    const { data, error } = await supabase.from('results').select('level_id, elapsed_ms').eq('user_id', userId);
    if (error) {
      console.error('Не удалось загрузить результаты аккаунта:', error.message);
      set({ bestTimes: {}, userId, ready: true });
      return;
    }

    const cloud: BestTimes = {};
    for (const row of data ?? []) cloud[row.level_id] = row.elapsed_ms;

    const rowsToUpload = Object.entries(guest)
      .filter(([levelId, ms]) => cloud[levelId] == null || ms < cloud[levelId])
      .map(([levelId, ms]) => ({ user_id: userId, level_id: levelId, elapsed_ms: ms }));

    if (rowsToUpload.length > 0) {
      const { error: upsertError } = await supabase.from('results').upsert(rowsToUpload);
      if (upsertError) {
        console.error('Не удалось перенести гостевой прогресс в аккаунт:', upsertError.message);
      } else {
        for (const row of rowsToUpload) cloud[row.level_id] = row.elapsed_ms;
      }
    }

    set({ bestTimes: cloud, userId, ready: true });
  },

  recordResult: (levelId, elapsedMs) => {
    const { bestTimes, userId } = get();
    const prev = bestTimes[levelId];
    const isNewRecord = prev == null || elapsedMs < prev;
    if (!isNewRecord) return false;

    const updated = { ...bestTimes, [levelId]: elapsedMs };
    set({ bestTimes: updated });

    if (userId) {
      void supabase
        .from('results')
        .upsert({ user_id: userId, level_id: levelId, elapsed_ms: elapsedMs })
        .then(({ error }) => {
          if (error) console.error('Не удалось сохранить результат в облако:', error.message);
        });
    } else {
      writeGuest(updated);
    }
    return true;
  },
}));
