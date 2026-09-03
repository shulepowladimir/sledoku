import { supabase } from '../lib/supabase';

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

/**
 * Лучший результат по каждому уровню одним запросом: строки отсортированы по возрастанию
 * времени, первый встречанный уровень — его глобальный рекорд.
 */
export async function fetchGlobalBestPerLevel(): Promise<Record<string, LeaderboardRow>> {
  const { data: results, error } = await supabase
    .from('results')
    .select('level_id, user_id, elapsed_ms')
    .order('elapsed_ms', { ascending: true })
    .limit(1000);

  if (error || !results) return {};

  const bestByLevel = new Map<string, { userId: string; elapsedMs: number }>();
  for (const r of results) {
    if (!bestByLevel.has(r.level_id)) {
      bestByLevel.set(r.level_id, { userId: r.user_id, elapsedMs: r.elapsed_ms });
    }
  }

  const userIds = [...new Set([...bestByLevel.values()].map((b) => b.userId))];
  if (userIds.length === 0) return {};
  const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  const out: Record<string, LeaderboardRow> = {};
  for (const [levelId, best] of bestByLevel) {
    out[levelId] = {
      username: nameById.get(best.userId) ?? 'Игрок',
      elapsedMs: best.elapsedMs,
    };
  }
  return out;
}
