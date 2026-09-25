import { lazy, Suspense, useEffect, useState } from 'react';
import { useTutorialStore } from '../../state/tutorialStore';

const TutorialOverlay = lazy(() => import('./TutorialOverlay').then((module) => ({ default: module.TutorialOverlay })));

export function TutorialOverlayAfterMount() {
  const active = useTutorialStore((state) => state.active);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!active || !ready) return null;
  return (
    <Suspense fallback={null}>
      <TutorialOverlay />
    </Suspense>
  );
}
