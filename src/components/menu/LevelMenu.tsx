import { useState } from 'react';
import { gameLevels } from '../../../levels';
import { tutorialLevel } from '../../../levels/00-tutorial';
import { useGameStore } from '../../state/gameStore';
import { useProgressStore } from '../../state/progressStore';
import { useTutorialStore } from '../../state/tutorialStore';
import { formatElapsed } from '../../utils/time';
import { GameLogo } from './GameLogo';
import { HowToPlay } from './HowToPlay';
import { ThemeIcon } from './ThemeIcon';
import { AuthPanel } from '../auth/AuthPanel';
import { NoirToggle } from '../hud/NoirToggle';

// Ascending cell count first, then (ties) the `levels` array order — that array is already
// chronological (each new level is appended at the end), so a stable sort keeps it as the tie-break.
const sortedLevels = [...gameLevels].sort((a, b) => a.size - b.size);

const sizeOptions: Array<'all' | number> = ['all', ...new Set(sortedLevels.map((level) => level.size))];

export function LevelMenu() {
  const selectLevel = useGameStore((s) => s.selectLevel);
  const bestTimes = useProgressStore((s) => s.bestTimes);
  const tutorialDone = useTutorialStore((s) => s.tutorialDone);
  const [sizeFilter, setSizeFilter] = useState<'all' | number>('all');
  const [hideSolved, setHideSolved] = useState(false);

  // The tutorial card sits FIRST inside the level grid but outside the common categorization:
  // it ignores the size filter chips (never contributes a 5×5 chip) and the hide-solved toggle,
  // and is only rendered on the "Все" tab.
  const showTutorialCard = sizeFilter === 'all';

  const visibleLevels = sortedLevels.filter((level) => {
    if (sizeFilter !== 'all' && level.size !== sizeFilter) return false;
    if (hideSolved && bestTimes[level.meta.id] != null) return false;
    return true;
  });

  return (
    <div className="level-menu">
      <header className="site-header">
        <div className="site-header__brand">
          <GameLogo />
          <div className="site-header__text">
            <h1 className="site-header__title">Следоку</h1>
            <p className="site-header__subtitle">Выберите дело для расследования</p>
          </div>
        </div>
        <div className="site-header__actions">
          <AuthPanel />
          <NoirToggle />
          <HowToPlay />
        </div>
      </header>
      <div className="level-menu__filters" data-testid="level-filters">
        <div className="size-filter" role="group" aria-label="Фильтр по размеру поля">
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              className={`size-filter__btn${sizeFilter === size ? ' size-filter__btn--active' : ''}`}
              data-testid={`size-filter-${size}`}
              onClick={() => setSizeFilter(size)}
            >
              {size === 'all' ? 'Все' : `${size}×${size}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`hide-solved-toggle${hideSolved ? ' hide-solved-toggle--active' : ''}`}
          aria-pressed={hideSolved}
          data-testid="hide-solved-toggle"
          onClick={() => setHideSolved((v) => !v)}
        >
          {hideSolved ? 'Показать пройденные' : 'Скрыть пройденные'}
        </button>
      </div>
      <ul className="level-menu__grid">
        {showTutorialCard && (
          <li className="level-card level-card--tutorial" data-testid="level-card-tutorial-00">
            <button type="button" className="level-card__button" onClick={() => selectLevel(tutorialLevel)}>
              <ThemeIcon theme={tutorialLevel.meta.theme} />
              <span className="level-card__title">{tutorialLevel.meta.title}</span>
              <span className="level-card__tutorial-label">Обучение</span>
              {tutorialDone && <span className="level-card__tutorial-done">Пройдено</span>}
            </button>
          </li>
        )}
        {visibleLevels.map((level) => {
          const bestMs = bestTimes[level.meta.id] ?? null;
          return (
            <li key={level.meta.id} className="level-card" data-testid={`level-card-${level.meta.id}`}>
              <button type="button" className="level-card__button" onClick={() => selectLevel(level)}>
                <ThemeIcon theme={level.meta.theme} />
                <span className="level-card__title">{level.meta.title}</span>
                <span className="level-card__size">
                  {level.size}×{level.size}
                </span>
                {bestMs != null && (
                  <div className="level-card__solved">
                    <span className="level-card__solved-stamp">Раскрыто</span>
                    <span className="level-card__best-time">Лучшее время: {formatElapsed(bestMs)}</span>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {visibleLevels.length === 0 && (
        <p className="level-menu__empty" data-testid="level-menu-empty">
          Под выбранные фильтры уровней нет.
        </p>
      )}
    </div>
  );
}
