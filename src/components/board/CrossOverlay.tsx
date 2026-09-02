import type { CrossKind } from '../../engine/selectors';

interface CrossOverlayProps {
  kind: CrossKind;
}

export function CrossOverlay({ kind }: CrossOverlayProps) {
  if (kind === 'none') return null;
  return (
    <div className="cross-overlay">
      <span className="cross-mark" aria-hidden="true" />
    </div>
  );
}
