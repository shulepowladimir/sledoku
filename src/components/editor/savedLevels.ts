const STORAGE_KEY = 'sledoku-editor-drafts';

export interface SavedDraft {
  id: string;
  name: string;
  savedAt: number;
  state: unknown;
}

function readAll(): Record<string, SavedDraft> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(drafts: Record<string, SavedDraft>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function listDrafts(): SavedDraft[] {
  return Object.values(readAll()).sort((a, b) => b.savedAt - a.savedAt);
}

/** Сохраняет черновик. Если id уже существует — перезаписывает (обновление существующего уровня). */
export function saveDraft(id: string, name: string, state: unknown): void {
  const all = readAll();
  all[id] = { id, name, savedAt: Date.now(), state };
  writeAll(all);
}

export function loadDraft(id: string): SavedDraft | null {
  return readAll()[id] ?? null;
}

export function deleteDraft(id: string): void {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function newDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
