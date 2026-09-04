import type { InteractionMode } from '../../state/gameStore';
import { useGameStore } from '../../state/gameStore';

type ToggleableMode = Exclude<InteractionMode, 'person'>;

const MODE_LABEL: Record<ToggleableMode, string> = {
  cross: 'Крестик',
  erase: 'Стереть',
};

const MODES: ToggleableMode[] = ['cross', 'erase'];

export function ModeToggle() {
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);

  return (
    <div className="mode-toggle">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          className={`mode-toggle__btn${mode === m ? ' mode-toggle__btn--active' : ''}`}
          data-testid={`hud-mode-${m}`}
          onClick={() => setMode(m)}
        >
          {MODE_LABEL[m]}
        </button>
      ))}
    </div>
  );
}
