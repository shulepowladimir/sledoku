import { useGameStore } from '../../state/gameStore';
import { isSolved } from '../../engine/selectors';

export function ResetButtons() {
  const clearBoard = useGameStore((s) => s.clearBoard);
  const restart = useGameStore((s) => s.restart);
  const solved = useGameStore((s) => isSolved(s.player));

  return (
    <div className="reset-buttons">
      <button type="button" className="reset-buttons__btn" data-testid="hud-clear" disabled={solved} onClick={clearBoard}>
        Очистить
      </button>
      <button type="button" className="reset-buttons__btn" data-testid="hud-restart" onClick={restart}>
        Начать заново
      </button>
    </div>
  );
}
