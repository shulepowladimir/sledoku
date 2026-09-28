import { useGameStore } from '../../state/gameStore';
import { isSolved, elapsedMsNow } from '../../engine/selectors';
import { formatElapsed } from '../../utils/time';

export function VictoryBanner() {
  const player = useGameStore((s) => s.player);
  const goToMenu = useGameStore((s) => s.goToMenu);
  const isNewRecord = useGameStore((s) => s.isNewRecord);
  const level = useGameStore((s) => s.level);
  const isTutorial = level.meta.isTutorial;
  const murderer = level.people.find((p) => p.isMurderer);
  const murdererName = murderer?.name;
  const hiddenVictim = level.meta.victimIdentityHidden
    ? level.people.find((person) => person.isVictim)
    : undefined;
  if (!isSolved(player) || isTutorial) return null;

  return (
    <div className="victory-banner" data-testid="victory-banner">
      <span>
        Дело раскрыто!
        {hiddenVictim && ` Критик и жертва — ${hiddenVictim.name}.`}{' '}
        {murdererName && ` Убийцей ${murderer?.gender === 'female' ? 'оказалась' : 'оказался'} ${murdererName}.`}{' '}
        Время: {formatElapsed(elapsedMsNow(player, Date.now()))}
      </span>
      {isNewRecord && <span className="victory-banner__record">Новый рекорд!</span>}
      <button type="button" className="victory-banner__menu-btn" onClick={goToMenu}>
        К уровням
      </button>
    </div>
  );
}
