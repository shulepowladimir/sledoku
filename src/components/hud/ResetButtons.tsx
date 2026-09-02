import { useGameStore } from '../../state/gameStore';

export function ResetButtons() {
  const clearBoard = useGameStore((s) => s.clearBoard);
  const restart = useGameStore((s) => s.restart);

  return (
    <div className="reset-buttons">
      <button type="button" className="reset-buttons__btn" onClick={clearBoard}>
        Очистить
      </button>
      <button type="button" className="reset-buttons__btn" onClick={restart}>
        Начать заново
      </button>
    </div>
  );
}
