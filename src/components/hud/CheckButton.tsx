import { useGameStore } from '../../state/gameStore';
import { isSolved } from '../../engine/selectors';

export function CheckButton() {
  const check = useGameStore((s) => s.check);
  const level = useGameStore((s) => s.level);
  const placements = useGameStore((s) => s.player.placements);
  const solved = useGameStore((s) => isSolved(s.player));

  const allPlaced = level.people.every((person) => placements[person.id] != null);

  return (
    <button
      type="button"
      className="check-button"
      data-testid="check-button"
      onClick={check}
      disabled={!allPlaced || solved}
      title={allPlaced ? undefined : 'Сначала расставьте всех персонажей'}
    >
      Проверить
    </button>
  );
}
