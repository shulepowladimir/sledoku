import { useEffect, useState } from 'react';
import { gameLevels } from '../../../levels';
import { useAuthStore } from '../../state/authStore';
import { fetchGlobalBestPerLevel, fetchLevelLeaderboard, type LeaderboardRow } from '../../utils/cloudSync';
import { formatElapsed } from '../../utils/time';
import { CUSTOM_BOARD_LABEL, isCustomBoard } from '../../utils/boardSize';
import { sortLevelsByMenuOrder } from '../../utils/levelOrder';

const sortedLevels = sortLevelsByMenuOrder(gameLevels);
const squareSizes = [...new Set(sortedLevels.filter((level) => !isCustomBoard(level)).map((level) => level.size))]
  .sort((a, b) => a - b);
const customLevels = sortedLevels.filter(isCustomBoard);
const customMinDim = customLevels.length
  ? Math.min(...customLevels.map((level) => Math.min(level.size, level.cols!)))
  : null;
const customInsertAt = customMinDim == null ? -1 : squareSizes.findIndex((size) => size > customMinDim);
const sizeOptions: Array<number | 'custom'> = customInsertAt === -1
  ? [...squareSizes, ...(customMinDim == null ? [] : ['custom' as const])]
  : [...squareSizes.slice(0, customInsertAt), 'custom', ...squareSizes.slice(customInsertAt)];
const sizeGroups = sizeOptions.map((size) => ({
  id: String(size),
  label: size === 'custom' ? CUSTOM_BOARD_LABEL : `${size}×${size}`,
  levels: sortedLevels.filter((level) => size === 'custom' ? isCustomBoard(level) : !isCustomBoard(level) && level.size === size),
}));

export function ProfileLeaderboardTab() {
  const currentUserId = useAuthStore((state) => state.session?.user.id ?? null);
  const [bestByLevel, setBestByLevel] = useState<Record<string, LeaderboardRow> | null>(null);
  const [expandedSizeId, setExpandedSizeId] = useState<string | null>(null);
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<LeaderboardRow[] | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);

  useEffect(() => {
    fetchGlobalBestPerLevel().then(setBestByLevel);
  }, []);

  const toggleLevel = async (levelId: string) => {
    if (expandedLevelId === levelId) {
      setExpandedLevelId(null);
      setExpandedRows(null);
      return;
    }
    setExpandedLevelId(levelId);
    setExpandedRows(null);
    setExpandedLoading(true);
    const rows = await fetchLevelLeaderboard(levelId, 5);
    setExpandedRows(rows);
    setExpandedLoading(false);
  };

  const toggleSize = (sizeId: string) => {
    setExpandedSizeId((current) => current === sizeId ? null : sizeId);
    setExpandedLevelId(null);
    setExpandedRows(null);
    setExpandedLoading(false);
  };

  return (
    <div className="profile-leaderboard">
      {bestByLevel == null && <p className="profile-leaderboard__loading">Загрузка...</p>}
      {bestByLevel != null && (
        <div className="profile-leaderboard__groups">
          {sizeGroups.map((group) => {
            const isSizeExpanded = expandedSizeId === group.id;
            return (
              <section key={group.id} className="profile-leaderboard__size-group">
                <button
                  type="button"
                  className="profile-leaderboard__size-toggle"
                  data-testid={`profile-leaderboard-size-${group.id}`}
                  onClick={() => toggleSize(group.id)}
                  aria-expanded={isSizeExpanded}
                >
                  <span>{group.label}</span>
                  <span className={`profile-leaderboard__chevron${isSizeExpanded ? ' profile-leaderboard__chevron--open' : ''}`} aria-hidden="true">⌄</span>
                </button>
                {isSizeExpanded && (
                  <ul className="profile-leaderboard__list">
                    {group.levels.map((level) => {
                      const best = bestByLevel[level.meta.id];
                      const isLevelExpanded = expandedLevelId === level.meta.id;
                      const bestIsMine = best?.userId === currentUserId;
                      const tagLabel = level.meta.menuTag === 'hard' ? 'Сложно' : level.meta.menuTag === 'expert' ? 'Эксперт' : null;
                      return (
                        <li key={level.meta.id} className="profile-leaderboard__item">
                          <button
                            type="button"
                            className="profile-leaderboard__row"
                            data-testid={`profile-leaderboard-level-${level.meta.id}`}
                            onClick={() => toggleLevel(level.meta.id)}
                            aria-expanded={isLevelExpanded}
                          >
                            <span className="profile-leaderboard__row-title">{level.meta.title}</span>
                            {tagLabel && (
                              <span className={`profile-leaderboard__tag profile-leaderboard__tag--${level.meta.menuTag}`}>
                                {tagLabel}
                              </span>
                            )}
                            <span className="profile-leaderboard__row-size">
                              {level.size}×{level.cols ?? level.size}
                            </span>
                            <span className={`profile-leaderboard__row-time${bestIsMine ? ' profile-leaderboard__row-time--mine' : ''}`}>
                              {best ? formatElapsed(best.elapsedMs) : '—'}
                            </span>
                            <span className={`profile-leaderboard__chevron${isLevelExpanded ? ' profile-leaderboard__chevron--open' : ''}`} aria-hidden="true">
                              ⌄
                            </span>
                          </button>
                          {isLevelExpanded && (
                            <div className="profile-leaderboard__expand">
                              {expandedLoading && <p className="profile-leaderboard__loading">Загрузка...</p>}
                              {!expandedLoading && expandedRows != null && expandedRows.length === 0 && (
                                <p className="profile-leaderboard__loading">Пока никто не прошёл это дело.</p>
                              )}
                              {!expandedLoading && expandedRows != null && expandedRows.length > 0 && (
                                <ol className="profile-leaderboard__top5">
                                  {expandedRows.map((row, i) => (
                                    <li key={i}>
                                      <span className="profile-leaderboard__top5-rank">{i + 1}</span>
                                      <span className="profile-leaderboard__top5-name">{row.username}</span>
                                      <span className={`profile-leaderboard__top5-time${row.userId === currentUserId ? ' profile-leaderboard__top5-time--mine' : ''}`}>
                                        {formatElapsed(row.elapsedMs)}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
