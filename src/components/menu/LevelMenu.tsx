import { useState } from 'react';
import { gameLevels } from '../../../levels';
import { tutorialLevel } from '../../../levels/00-tutorial';
import { useGameStore } from '../../state/gameStore';
import { useProgressStore } from '../../state/progressStore';
import { hasInProgressDraft, useLevelDraftStore } from '../../state/levelDraftStore';
import { useTutorialStore } from '../../state/tutorialStore';
import { formatElapsed } from '../../utils/time';
import { isCustomBoard, boardSortKey, CUSTOM_BOARD_LABEL } from '../../utils/boardSize';
import { GameLogo } from './GameLogo';
import { HowToPlay } from './HowToPlay';
import { ThemeIcon } from './ThemeIcon';
import { AuthPanel } from '../auth/AuthPanel';
import { NoirToggle } from '../hud/NoirToggle';
import { SiteFooter } from './SiteFooter';

// Ascending cell count first, then (ties) the `levels` array order — that array is already
// chronological (each new level is appended at the end), so a stable sort keeps it as the tie-break.
// Non-square boards (10×11, 11×10) sort between 10×10 and 11×11 via boardSortKey.
const sortedLevels = [...gameLevels].sort((a, b) => boardSortKey(a) - boardSortKey(b));

// Filter chips: square sizes plus a single shared chip for non-square boards, placed
// right before the first square size larger than the custom boards' smaller dimension
// (today: between 10×10 and 11×11).
const customMinDim = (() => {
  const custom = gameLevels.filter(isCustomBoard);
  return custom.length ? Math.min(...custom.map((l) => Math.min(l.size, l.cols!))) : null;
})();
const squareSizes = [...new Set(gameLevels.filter((l) => !isCustomBoard(l)).map((l) => l.size))].sort((a, b) => a - b);
const customInsertAt = customMinDim != null ? squareSizes.findIndex((s) => s > customMinDim) : -1;
const sizeOptions: Array<'all' | 'custom' | number> = [
  'all',
  ...(customInsertAt === -1
    ? [...squareSizes, ...(customMinDim != null ? (['custom'] as const) : [])]
    : [...squareSizes.slice(0, customInsertAt), 'custom' as const, ...squareSizes.slice(customInsertAt)]),
];

export function LevelMenu() {
  const selectLevel = useGameStore((s) => s.selectLevel);
  const bestTimes = useProgressStore((s) => s.bestTimes);
  const drafts = useLevelDraftStore((s) => s.drafts);
  const tutorialDone = useTutorialStore((s) => s.tutorialDone);
  const [sizeFilter, setSizeFilter] = useState<'all' | 'custom' | number>('all');
  const [hideSolved, setHideSolved] = useState(false);

  // The tutorial card sits FIRST inside the level grid but outside the common categorization:
  // it ignores the size filter chips (never contributes a 5×5 chip) and is only rendered on
  // the "Все" tab. The hide-solved toggle hides it too — but only once it's actually done.
  const showTutorialCard = sizeFilter === 'all' && (!hideSolved || !tutorialDone);

  const visibleLevels = sortedLevels.filter((level) => {
    if (sizeFilter === 'custom') {
      if (!isCustomBoard(level)) return false;
    } else if (sizeFilter !== 'all' && (isCustomBoard(level) || level.size !== sizeFilter)) {
      return false;
    }
    if (hideSolved && bestTimes[level.meta.id] != null && !hasInProgressDraft(drafts[level.meta.id])) return false;
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
              {size === 'all' ? 'Все' : size === 'custom' ? CUSTOM_BOARD_LABEL : `${size}×${size}`}
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
          const inProgress = hasInProgressDraft(drafts[level.meta.id]);
          return (
            <li key={level.meta.id} className="level-card" data-testid={`level-card-${level.meta.id}`}>
              <button type="button" className="level-card__button" onClick={() => selectLevel(level)}>
                <ThemeIcon theme={level.meta.theme} />
                <span className="level-card__title">{level.meta.title}</span>
                <span className="level-card__size">
                  {level.size}×{level.cols ?? level.size}
                </span>
                {bestMs != null && (
                  <div className="level-card__solved">
                    <span className="level-card__solved-stamp">Раскрыто</span>
                    <span className="level-card__best-time">Лучшее время: {formatElapsed(bestMs)}</span>
                    {inProgress && <span className="level-card__progress-stamp" data-testid={`level-in-progress-${level.meta.id}`}>В процессе расследования</span>}
                  </div>
                )}
                {bestMs == null && inProgress && (
                  <span className="level-card__progress-stamp" data-testid={`level-in-progress-${level.meta.id}`}>
                    В процессе расследования
                  </span>
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
      <SiteFooter />
    </div>
  );
}
