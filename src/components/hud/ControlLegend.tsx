import type { InteractionMode } from '../../state/gameStore';
import { useGameStore } from '../../state/gameStore';

const LEGEND: Record<InteractionMode, string> = {
  person: 'Один клик — поставить/снять метку, двойной клик — поставить/снять человека.',
  cross: 'Клик по клетке — поставить/снять крестик.',
  erase: 'Клик по клетке — полностью очистить её (человека, метки и крестик).',
};

export function ControlLegend() {
  const mode = useGameStore((s) => s.mode);
  const selectedPersonId = useGameStore((s) => s.selectedPersonId);

  const text =
    mode === 'person' && !selectedPersonId
      ? 'Сначала выберите человека в списке справа.'
      : LEGEND[mode];

  return <p className="control-legend">{text}</p>;
}
