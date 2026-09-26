import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { levels } from '../levels';
import { useGameStore } from './state/gameStore';
import { useTutorialStore } from './state/tutorialStore';
import { useAuthStore } from './state/authStore';
import { useLevelDraftStore } from './state/levelDraftStore';
import { useProgressStore } from './state/progressStore';
import { LevelMenu } from './components/menu/LevelMenu';
import { TutorialOverlayAfterMount } from './components/tutorial/TutorialOverlayAfterMount';
import './styles/app.css';

const GameView = lazy(() => import('./components/game/GameView').then((module) => ({ default: module.GameView })));
const AssetGallery = import.meta.env.DEV
  ? lazy(() => import('./components/dev/AssetGallery').then((module) => ({ default: module.AssetGallery })))
  : null;

// Dev-only asset gallery, enabled with /?gallery (see docs/assets.md).
const isAssetGallery = import.meta.env.DEV &&
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gallery');

function App() {
  const screen = useGameStore((s) => s.screen);
  const tutorialActive = useTutorialStore((s) => s.active);
  const authReady = useAuthStore((s) => s.status === 'ready');
  const draftsReady = useLevelDraftStore((s) => s.ready);
  const progressReady = useProgressStore((s) => s.ready);
  const [routeReady, setRouteReady] = useState(false);
  const bootstrapped = useRef(false);
  const applyingHistory = useRef(false);

  useEffect(() => {
    if (isAssetGallery || !authReady || !draftsReady || !progressReady || bootstrapped.current) return;
    bootstrapped.current = true;
    applyLocationRoute();
    setRouteReady(true);
  }, [authReady, draftsReady, progressReady]);

  useEffect(() => {
    if (isAssetGallery) return;

    const unsubscribe = useGameStore.subscribe((state, previous) => {
      if (!bootstrapped.current || applyingHistory.current) return;
      if (state.screen === previous.screen && state.level.meta.id === previous.level.meta.id) return;
      const nextUrl = urlForRoute(state.screen === 'game' ? state.level.meta.id : null);
      if (currentRelativeUrl() !== nextUrl) window.history.pushState({ sledoku: true }, '', nextUrl);
    });

    const handlePopState = () => {
      applyingHistory.current = true;
      applyLocationRoute();
      applyingHistory.current = false;
    };
    const handlePageHide = () => useGameStore.getState().pauseForPageExit();
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) useGameStore.getState().resumeAfterPageReturn();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') useGameStore.getState().checkpointDraft();
    };
    const checkpoint = window.setInterval(() => useGameStore.getState().checkpointDraft(), 5_000);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      unsubscribe();
      clearInterval(checkpoint);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (isAssetGallery && AssetGallery) {
    return (
      <Suspense fallback={<div className="app-loading" role="status">Загружаем галерею…</div>}>
        <AssetGallery />
      </Suspense>
    );
  }
  if (!routeReady || !draftsReady || !progressReady) {
    return <div className="app-loading" role="status">Загружаем расследование…</div>;
  }
  return (
    <>
      {screen === 'menu' ? (
        <>
          <LevelMenu />
          {tutorialActive && <TutorialOverlayAfterMount />}
        </>
      ) : (
        <Suspense fallback={<div className="app-loading" role="status">Загружаем расследование…</div>}>
          <GameView />
        </Suspense>
      )}
    </>
  );
}

function applyLocationRoute() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('level')) {
    useGameStore.getState().goToMenu();
    return;
  }

  const levelId = url.searchParams.get('level');
  const level = levels.find((candidate) => candidate.meta.id === levelId);
  if (level) {
    useGameStore.getState().selectLevel(level);
    return;
  }

  url.searchParams.delete('level');
  window.history.replaceState({ sledoku: true }, '', relativeUrl(url));
  useGameStore.getState().goToMenu();
}

function urlForRoute(levelId: string | null): string {
  const url = new URL(window.location.href);
  if (levelId) url.searchParams.set('level', levelId);
  else url.searchParams.delete('level');
  return relativeUrl(url);
}

function currentRelativeUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function relativeUrl(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export default App;
