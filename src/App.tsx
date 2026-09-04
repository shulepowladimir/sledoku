import { useGameStore } from './state/gameStore';
import { GameScreen } from './components/game/GameScreen';
import { LevelMenu } from './components/menu/LevelMenu';
import { AssetGallery } from './components/dev/AssetGallery';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import './styles/app.css';

// Dev-only asset gallery, enabled with /?gallery (see docs/assets.md).
const isAssetGallery =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gallery');

function App() {
  const screen = useGameStore((s) => s.screen);
  if (isAssetGallery) return <AssetGallery />;
  return (
    <>
      {screen === 'menu' ? <LevelMenu /> : <GameScreen />}
      <TutorialOverlay />
    </>
  );
}

export default App;
