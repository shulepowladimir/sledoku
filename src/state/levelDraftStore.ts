import { create } from 'zustand';
import { levels } from '../../levels';
import { supabase } from '../lib/supabase';
import {
  isInProgressLevelDraft,
  mergeLevelDraftMaps,
  restoreLevelDraft,
  tombstoneLevelDraft,
  type LevelDraft,
  type LevelDraftMap,
  type LevelDraftRecord,
} from '../utils/levelDraft';

const GUEST_STORAGE_KEY = 'sledoku:guest-level-drafts:v1';
const ACCOUNT_STORAGE_PREFIX = 'sledoku:account-level-drafts:v1:';
const levelById = new Map(levels.map((level) => [level.meta.id, level]));
const syncTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface LevelDraftStore {
  drafts: LevelDraftMap;
  userId: string | null;
  ready: boolean;
  hydrateGuest: () => void;
  hydrateAccount: (userId: string) => Promise<void>;
  saveDraft: (draft: LevelDraft, immediate?: boolean) => void;
  clearDraft: (levelId: string, savedAt: number, immediate?: boolean) => void;
}

let hydrationGeneration = 0;

function accountStorageKey(userId: string): string {
  return `${ACCOUNT_STORAGE_PREFIX}${userId}`;
}

function readStorage(key: string): LevelDraftMap {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    if (!isRecord(raw)) return {};
    const valid: LevelDraftMap = {};
    for (const [levelId, value] of Object.entries(raw)) {
      const record = validateDraftRecord(value, levelId);
      if (record) valid[levelId] = record;
    }
    return valid;
  } catch {
    return {};
  }
}

function writeStorage(key: string, drafts: LevelDraftMap): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Не удалось сохранить черновики локально:', error);
    return false;
  }
}

function validateDraftRecord(value: unknown, levelId: string): LevelDraftRecord | null {
  if (!isRecord(value) || value.version !== 1 || value.levelId !== levelId || !isFiniteNumber(value.savedAt)) return null;
  if (value.deleted === true) return value as unknown as LevelDraftRecord;
  const level = levelById.get(levelId);
  return level && restoreLevelDraft(value, level, value.savedAt) ? value as unknown as LevelDraft : null;
}

function persistCurrent(drafts: LevelDraftMap, userId: string | null): boolean {
  return writeStorage(userId ? accountStorageKey(userId) : GUEST_STORAGE_KEY, drafts);
}

async function loadCloudDrafts(userId: string): Promise<{ drafts: LevelDraftMap; error: Error | null }> {
  const { data, error } = await supabase
    .from('level_drafts')
    .select('level_id, snapshot, saved_at')
    .eq('user_id', userId);
  if (error) return { drafts: {}, error };

  const drafts: LevelDraftMap = {};
  for (const row of data ?? []) {
    const savedAt = new Date(row.saved_at).getTime();
    const record = validateDraftRecord(row.snapshot, row.level_id);
    if (record && Number.isFinite(savedAt)) drafts[row.level_id] = { ...record, savedAt };
  }
  return { drafts, error: null };
}

async function saveCloudDraft(userId: string, record: LevelDraftRecord): Promise<LevelDraftRecord | null> {
  const { data, error } = await supabase.rpc('save_level_draft', {
    p_level_id: record.levelId,
    p_snapshot: record,
    p_saved_at: new Date(record.savedAt).toISOString(),
  });
  if (error) {
    console.error('Не удалось синхронизировать черновик уровня:', error.message);
    return null;
  }
  if (data !== false) return record;

  const { data: current, error: loadError } = await supabase
    .from('level_drafts')
    .select('snapshot, saved_at')
    .eq('user_id', userId)
    .eq('level_id', record.levelId)
    .maybeSingle();
  if (loadError || !current) return null;
  const winner = validateDraftRecord(current.snapshot, record.levelId);
  if (!winner) return null;
  const savedAt = new Date(current.saved_at).getTime();
  return Number.isFinite(savedAt) ? { ...winner, savedAt } : null;
}

function scheduleCloudSave(userId: string, record: LevelDraftRecord, immediate: boolean) {
  const key = `${userId}:${record.levelId}`;
  const existing = syncTimers.get(key);
  if (existing) clearTimeout(existing);
  const sync = () => {
    syncTimers.delete(key);
    if (useLevelDraftStore.getState().userId !== userId) return;
    void saveCloudDraft(userId, record).then((winner) => {
      if (!winner || useLevelDraftStore.getState().userId !== userId) return;
      const state = useLevelDraftStore.getState();
      const merged = mergeLevelDraftMaps(state.drafts, { [winner.levelId]: winner });
      useLevelDraftStore.setState({ drafts: merged });
      persistCurrent(merged, userId);
    });
  };
  if (immediate) sync();
  else syncTimers.set(key, setTimeout(sync, 300));
}

export const useLevelDraftStore = create<LevelDraftStore>((set, get) => ({
  drafts: {},
  userId: null,
  ready: false,

  hydrateGuest: () => {
    hydrationGeneration++;
    set({ drafts: readStorage(GUEST_STORAGE_KEY), userId: null, ready: true });
  },

  hydrateAccount: async (userId) => {
    const generation = ++hydrationGeneration;
    const previous = get();
    const continuingSameAccount = previous.userId === userId && previous.ready;
    set({ drafts: continuingSameAccount ? previous.drafts : {}, userId, ready: continuingSameAccount });
    const guest = readStorage(GUEST_STORAGE_KEY);
    const cached = readStorage(accountStorageKey(userId));
    const { drafts: cloud, error } = await loadCloudDrafts(userId);
    if (generation !== hydrationGeneration) return;

    if (error) {
      console.error('Не удалось загрузить черновики аккаунта:', error.message);
      const fallback = mergeLevelDraftMaps(cached, guest);
      set({ drafts: fallback, userId, ready: true });
      persistCurrent(fallback, userId);
      return;
    }

    const current = get();
    const live = current.userId === userId ? current.drafts : {};
    const merged = mergeLevelDraftMaps(cloud, cached, guest, live);
    set({ drafts: merged, userId, ready: true });
    persistCurrent(merged, userId);

    let syncFailed = false;
    for (const record of Object.values(merged)) {
      const cloudRecord = cloud[record.levelId];
      if (cloudRecord && cloudRecord.savedAt >= record.savedAt) continue;
      const winner = await saveCloudDraft(userId, record);
      if (!winner) {
        syncFailed = true;
        continue;
      }
      if (winner.savedAt > record.savedAt) {
        const latest = mergeLevelDraftMaps(useLevelDraftStore.getState().drafts, { [winner.levelId]: winner });
        useLevelDraftStore.setState({ drafts: latest });
        persistCurrent(latest, userId);
      }
    }
    if (!syncFailed) {
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        // The account copy is already durable; a stale guest cache is harmless and namespaced.
      }
    }
  },

  saveDraft: (draft, immediate = false) => {
    const state = get();
    const drafts = { ...state.drafts, [draft.levelId]: draft };
    set({ drafts });
    persistCurrent(drafts, state.userId);
    if (state.userId) scheduleCloudSave(state.userId, draft, immediate);
  },

  clearDraft: (levelId, savedAt, immediate = false) => {
    const state = get();
    const tombstone = tombstoneLevelDraft(levelId, savedAt);
    const drafts = { ...state.drafts, [levelId]: tombstone };
    set({ drafts });
    persistCurrent(drafts, state.userId);
    if (state.userId) scheduleCloudSave(state.userId, tombstone, immediate);
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const { userId, hydrateAccount } = useLevelDraftStore.getState();
    if (userId) void hydrateAccount(userId);
  });
}

export function hasInProgressDraft(draft: LevelDraftRecord | undefined): boolean {
  return isInProgressLevelDraft(draft);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
