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

export function getAllBestTimes(): BestTimes {
  return readAll();
}

/** Сливает два набора результатов, оставляя для каждого уровня меньшее время. */
export function mergeBestTimes(a: BestTimes, b: BestTimes): BestTimes {
  const merged: BestTimes = { ...a };
  for (const [levelId, ms] of Object.entries(b)) {
    if (merged[levelId] == null || ms < merged[levelId]) merged[levelId] = ms;
  }
  if (Object.keys(merged).length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
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
