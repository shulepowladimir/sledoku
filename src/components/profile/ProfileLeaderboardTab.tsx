import { useEffect, useState } from 'react';
import { levels } from '../../../levels';
import { fetchGlobalBestPerLevel, fetchLevelLeaderboard, type LeaderboardRow } from '../../utils/cloudSync';
import { formatElapsed } from '../../utils/time';

const sortedLevels = [...levels].sort((a, b) => a.size - b.size);

export function ProfileLeaderboardTab() {
  const [bestByLevel, setBestByLevel] = useState<Record<string, LeaderboardRow> | null>(null);
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

  return (
    <div className="profile-leaderboard">
      {bestByLevel == null && <p className="profile-leaderboard__loading">Загрузка...</p>}
      {bestByLevel != null && (
        <ul className="profile-leaderboard__list">
          {sortedLevels.map((level) => {
            const best = bestByLevel[level.meta.id];
            const isExpanded = expandedLevelId === level.meta.id;
            return (
              <li key={level.meta.id} className="profile-leaderboard__item">
                <button
                  type="button"
                  className="profile-leaderboard__row"
                  onClick={() => toggleLevel(level.meta.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="profile-leaderboard__row-title">{level.meta.title}</span>
                  <span className="profile-leaderboard__row-size">
                    {level.size}×{level.size}
                  </span>
                  <span className="profile-leaderboard__row-time">
                    {best ? formatElapsed(best.elapsedMs) : '—'}
                  </span>
                  <span className={`profile-leaderboard__chevron${isExpanded ? ' profile-leaderboard__chevron--open' : ''}`}>
                    ⌄
                  </span>
                </button>
                {isExpanded && (
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
                            <span className="profile-leaderboard__top5-time">{formatElapsed(row.elapsedMs)}</span>
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
    </div>
  );
}
