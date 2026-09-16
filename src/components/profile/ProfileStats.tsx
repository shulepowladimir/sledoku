import { useMemo, useState } from 'react';
import { gameLevels } from '../../../levels';
import { useProgressStore } from '../../state/progressStore';
import { formatElapsed } from '../../utils/time';
import { isCustomBoard, CUSTOM_BOARD_LABEL } from '../../utils/boardSize';

interface CategoryStat {
  key: string;
  /** «10×10» для квадратных категорий; нестандартные карты — общая строка CUSTOM_BOARD_LABEL. */
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
    const build = (key: string, sizeLabel: string, levelsInCategory: typeof gameLevels): CategoryStat => {
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
        key,
        sizeLabel,
        solvedCount: solvedInCategory.length,
        totalCount: levelsInCategory.length,
        bestMs,
        bestLevelTitle,
        averageMs,
      };
    };

    // Квадратные категории по размеру; нестандартные доски (10×11, 11×10…) — одна общая
    // категория CUSTOM_BOARD_LABEL, вставленная перед первым размером больше их меньшего
    // измерения (сегодня: между 10×10 и 11×11).
    const squareLevels = gameLevels.filter((l) => !isCustomBoard(l));
    const customLevels = gameLevels.filter(isCustomBoard);
    const sizes = [...new Set(squareLevels.map((l) => l.size))].sort((a, b) => a - b);
    const result = sizes.map((size) => build(String(size), `${size}×${size}`, squareLevels.filter((l) => l.size === size)));
    if (customLevels.length) {
      const minDim = Math.min(...customLevels.map((l) => Math.min(l.size, l.cols!)));
      const insertAt = sizes.findIndex((s) => s > minDim);
      const customCategory = build('custom', CUSTOM_BOARD_LABEL, customLevels);
      if (insertAt === -1) result.push(customCategory);
      else result.splice(insertAt, 0, customCategory);
    }
    return result;
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
            <tr key={cat.key}>
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
