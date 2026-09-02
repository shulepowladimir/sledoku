import { useGameStore } from '../../state/gameStore';

export function UndoButton() {
  const undo = useGameStore((s) => s.undo);
  const canUndo = useGameStore((s) => s.undoStack.length > 0);

  return (
    <button type="button" className="undo-button" data-testid="undo-button" disabled={!canUndo} onClick={undo}>
      Отменить
    </button>
  );
}
