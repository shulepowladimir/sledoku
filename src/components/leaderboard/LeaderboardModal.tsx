import { useEffect, useState } from 'react';
import { fetchLevelLeaderboard, type LeaderboardRow } from '../../utils/cloudSync';
import { formatElapsed } from '../../utils/time';

interface Props {
  levelId: string;
  levelTitle: string;
  onClose: () => void;
}

export function LeaderboardModal({ levelId, levelTitle, onClose }: Props) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLevelLeaderboard(levelId).then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-modal__header">
          <h2>Таблица лидеров</h2>
          <button type="button" className="leaderboard-modal__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <p className="leaderboard-modal__subtitle">{levelTitle}</p>
        {rows == null && <p className="leaderboard-modal__empty">Загрузка...</p>}
        {rows != null && rows.length === 0 && (
          <p className="leaderboard-modal__empty">Пока никто не прошёл это дело. Стань первым!</p>
        )}
        {rows != null && rows.length > 0 && (
          <ol className="leaderboard-list">
            {rows.map((row, i) => (
              <li key={i} className="leaderboard-list__item">
                <span className="leaderboard-list__rank">{i + 1}</span>
                <span className="leaderboard-list__name">{row.username}</span>
                <span className="leaderboard-list__time">{formatElapsed(row.elapsedMs)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
