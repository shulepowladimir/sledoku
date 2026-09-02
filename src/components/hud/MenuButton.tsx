import { useGameStore } from '../../state/gameStore';

export function MenuButton() {
  const goToMenu = useGameStore((s) => s.goToMenu);

  return (
    <button type="button" className="menu-button" data-testid="menu-button" onClick={goToMenu}>
      Уровни
    </button>
  );
}
