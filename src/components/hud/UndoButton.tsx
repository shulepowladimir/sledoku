import { useGameStore } from '../../state/gameStore';
import { isSolved } from '../../engine/selectors';

export function UndoButton() {
  const undo = useGameStore((s) => s.undo);
  const canUndo = useGameStore((s) => s.undoStack.length > 0 && !isSolved(s.player));

  return (
    <button type="button" className="undo-button" data-testid="undo-button" disabled={!canUndo} onClick={undo}>
      Отменить
    </button>
  );
}
