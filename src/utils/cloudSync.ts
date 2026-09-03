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
