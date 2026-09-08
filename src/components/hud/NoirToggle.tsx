import { useNoirStore } from '../../state/noirStore';

/** Тумблер нуар-режима: общий для главного меню (шапка) и экрана уровня (hud-bar). */
export function NoirToggle() {
  const noir = useNoirStore((s) => s.noir);
  const toggle = useNoirStore((s) => s.toggle);

  return (
    <button
      type="button"
      className={`noir-toggle${noir ? ' noir-toggle--active' : ''}`}
      aria-pressed={noir}
      data-testid="noir-toggle"
      title="Чёрно-белый режим детектива"
      onClick={toggle}
    >
      {noir ? 'Цветной режим' : 'Нуар-режим'}
    </button>
  );
}
