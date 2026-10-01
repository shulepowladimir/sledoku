import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { isSolved, elapsedMsNow } from '../../engine/selectors';
import { formatElapsed } from '../../utils/time';
import { completionStories } from '../../content/completionStories';
import { CompletionStoryDialog } from './CompletionStoryDialog';

export function VictoryBanner() {
  const player = useGameStore((s) => s.player);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const isNewRecord = useGameStore((s) => s.isNewRecord);
  const level = useGameStore((s) => s.level);
  const isTutorial = level.meta.isTutorial;
  const solved = isSolved(player);
  const story = completionStories[level.meta.id];
  const [storyOpen, setStoryOpen] = useState(false);
  const wasSolved = useRef(solved);
  const murderer = level.people.find((p) => p.isMurderer);
  const murdererName = murderer?.name;
  const hiddenVictim = level.meta.victimIdentityHidden
    ? level.people.find((person) => person.isVictim)
    : undefined;
  const victim = level.people.find((person) => person.isVictim);
  const storyEnding = story && murderer && victim
    ? `${murderer.name} ${murderer.gender === 'female' ? 'оказалась' : 'оказался'} убийцей ${story.victimGenitive}.`
    : undefined;

  useEffect(() => {
    const justSolved = !wasSolved.current && solved;
    wasSolved.current = solved;
    if (justSolved && storyEnding && !isTutorial) setStoryOpen(true);
  }, [isTutorial, solved, storyEnding]);

  if (!solved || isTutorial) return null;

  return (
    <>
      <div className="victory-banner" data-testid="victory-banner">
        <span>
          Дело раскрыто!
          {hiddenVictim && ` Критик и жертва — ${hiddenVictim.name}.`}{' '}
          {murdererName && ` Убийцей ${murderer?.gender === 'female' ? 'оказалась' : 'оказался'} ${murdererName}.`}{' '}
          Время: {formatElapsed(elapsedMsNow(player, Date.now()))}
        </span>
        {isNewRecord && <span className="victory-banner__record">Новый рекорд!</span>}
        {story && storyEnding && (
          <button
            type="button"
            className="victory-banner__story-btn"
            data-testid="victory-story-button"
            onClick={() => setStoryOpen(true)}
          >
            Читать историю
          </button>
        )}
        <button type="button" className="victory-banner__menu-btn" onClick={goToMenu}>
          К уровням
        </button>
      </div>
      {storyOpen && story && storyEnding && (
        <CompletionStoryDialog
          ending={storyEnding}
          levelTitle={level.meta.title}
          story={story}
          onClose={() => setStoryOpen(false)}
          onMenu={goToMenu}
        />
      )}
    </>
  );
}
