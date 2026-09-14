import { useMemo, useState } from 'react';
import { gameLevels } from '../../../levels';
import { useProgressStore } from '../../state/progressStore';
import { formatElapsed } from '../../utils/time';

interface CategoryStat {
  size: number;
  /** «10×10» для квадратных категорий; если внутри есть нестандартные карты — «10×10 / 10×11». */
  sizeLabel: string;
  solvedCount: number;
  totalCount: number;
  bestMs: number | null;
  bestLevelTitle: string | null;
  averageMs: number | null;
}

export function ProfileStats() {
  const bestTimes = useProgressStore((s) => s.bestTimes);
  const [mode, setMode] = useState<'best' | 'average'>('best');

  const solvedLevels = gameLevels.filter((l) => bestTimes[l.meta.id] != null);
  const totalCount = gameLevels.length;
  const solvedCount = solvedLevels.length;
  const overallAverageMs =
    solvedCount > 0 ? solvedLevels.reduce((sum, l) => sum + bestTimes[l.meta.id], 0) / solvedCount : null;

  const categories = useMemo<CategoryStat[]>(() => {
    const sizes = [...new Set(gameLevels.map((l) => l.size))].sort((a, b) => a - b);
    return sizes.map((size) => {
      const levelsInCategory = gameLevels.filter((l) => l.size === size);
      const solvedInCategory = levelsInCategory.filter((l) => bestTimes[l.meta.id] != null);

      let bestMs: number | null = null;
      let bestLevelTitle: string | null = null;
      for (const level of solvedInCategory) {
        const ms = bestTimes[level.meta.id];
        if (bestMs == null || ms < bestMs) {
          bestMs = ms;
          bestLevelTitle = level.meta.title;
        }
      }

      const averageMs =
        solvedInCategory.length > 0
          ? solvedInCategory.reduce((sum, l) => sum + bestTimes[l.meta.id], 0) / solvedInCategory.length
          : null;

      return {
        size,
        sizeLabel: [...new Set(levelsInCategory.map((l) => `${l.size}×${l.cols ?? l.size}`))].join(' / '),
        solvedCount: solvedInCategory.length,
        totalCount: levelsInCategory.length,
        bestMs,
        bestLevelTitle,
        averageMs,
      };
    });
  }, [bestTimes]);

  return (
    <div className="profile-stats">
      <div className="profile-stats__summary">
        <div className="profile-stats__summary-item">
          <span className="profile-stats__summary-value">
            {solvedCount}/{totalCount}
          </span>
          <span className="profile-stats__summary-label">дел раскрыто</span>
        </div>
        <div className="profile-stats__summary-item">
          <span className="profile-stats__summary-value">
            {overallAverageMs != null ? formatElapsed(overallAverageMs) : '—'}
          </span>
          <span className="profile-stats__summary-label">среднее время</span>
        </div>
      </div>

      <div className="profile-stats__toggle" role="group" aria-label="Режим отображения по категориям">
        <button
          type="button"
          className={`profile-stats__toggle-btn${mode === 'best' ? ' profile-stats__toggle-btn--active' : ''}`}
          onClick={() => setMode('best')}
        >
          Лучшее
        </button>
        <button
          type="button"
          className={`profile-stats__toggle-btn${mode === 'average' ? ' profile-stats__toggle-btn--active' : ''}`}
          onClick={() => setMode('average')}
        >
          Среднее
        </button>
      </div>

      <table className="profile-stats__table">
        <thead>
          <tr>
            <th>Размер</th>
            <th>Пройдено</th>
            <th>{mode === 'best' ? 'Лучшее время' : 'Среднее время'}</th>
            {mode === 'best' && <th>Дело</th>}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.size}>
              <td>
                {cat.sizeLabel}
              </td>
              <td>
                {cat.solvedCount}/{cat.totalCount}
              </td>
              <td>
                {mode === 'best'
                  ? cat.bestMs != null
                    ? formatElapsed(cat.bestMs)
                    : '—'
                  : cat.averageMs != null
                    ? formatElapsed(cat.averageMs)
                    : '—'}
              </td>
              {mode === 'best' && <td className="profile-stats__level-name">{cat.bestLevelTitle ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
