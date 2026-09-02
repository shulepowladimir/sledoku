import { useGameStore } from '../../state/gameStore';

export function CheckButton() {
  const check = useGameStore((s) => s.check);
  return (
    <button type="button" className="check-button" data-testid="check-button" onClick={check}>
      Проверить
    </button>
  );
}
