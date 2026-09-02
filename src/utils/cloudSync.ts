import { supabase } from '../lib/supabase';
import { getAllBestTimes, mergeBestTimes } from './bestTime';

/**
 * Вызывается один раз при входе в аккаунт.
 * Сливает локальные результаты (localStorage) с результатами из облака:
 * для каждого уровня остаётся меньшее время, итог сохраняется и локально, и в базе.
 */
export async function syncOnLogin(userId: string): Promise<void> {
  const local = getAllBestTimes();

  const { data, error } = await supabase.from('results').select('level_id, elapsed_ms').eq('user_id', userId);
  if (error) {
    console.error('Не удалось загрузить результаты из облака:', error.message);
    return;
  }

  const cloud: Record<string, number> = {};
  for (const row of data ?? []) cloud[row.level_id] = row.elapsed_ms;

  const merged = mergeBestTimes(local, cloud);

  const rowsToUpload = Object.entries(merged)
    .filter(([levelId, ms]) => cloud[levelId] !== ms)
    .map(([levelId, ms]) => ({ user_id: userId, level_id: levelId, elapsed_ms: ms }));

  if (rowsToUpload.length > 0) {
    const { error: upsertError } = await supabase.from('results').upsert(rowsToUpload);
    if (upsertError) console.error('Не удалось выгрузить результаты в облако:', upsertError.message);
  }
}

/**
 * Вызывается при каждом новом рекорде во время игры (если пользователь авторизован).
 */
export async function pushResult(userId: string, levelId: string, elapsedMs: number): Promise<void> {
  const { error } = await supabase.from('results').upsert({ user_id: userId, level_id: levelId, elapsed_ms: elapsedMs });
  if (error) console.error('Не удалось сохранить результат в облако:', error.message);
}

export interface LeaderboardRow {
  username: string;
  elapsedMs: number;
}

/**
 * Топ игроков по конкретному уровню, отсортированный по времени прохождения.
 */
export async function fetchLevelLeaderboard(levelId: string, limit = 10): Promise<LeaderboardRow[]> {
  const { data: results, error } = await supabase
    .from('results')
    .select('user_id, elapsed_ms')
    .eq('level_id', levelId)
    .order('elapsed_ms', { ascending: true })
    .limit(limit);

  if (error || !results || results.length === 0) return [];

  const userIds = results.map((r) => r.user_id);
  const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  return results.map((r) => ({
    username: nameById.get(r.user_id) ?? 'Игрок',
    elapsedMs: r.elapsed_ms,
  }));
}
