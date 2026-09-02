const STORAGE_KEY = 'sledoku:best-times';

type BestTimes = Record<string, number>;

function readAll(): BestTimes {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function getBestTime(levelId: string): number | null {
  return readAll()[levelId] ?? null;
}

export function recordBestTime(levelId: string, elapsedMs: number): boolean {
  const all = readAll();
  const prev = all[levelId];
  const isNewRecord = prev == null || elapsedMs < prev;
  if (isNewRecord) {
    all[levelId] = elapsedMs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return isNewRecord;
}
