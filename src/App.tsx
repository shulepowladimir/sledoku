import { useGameStore } from './state/gameStore';
import { GameScreen } from './components/game/GameScreen';
import { LevelMenu } from './components/menu/LevelMenu';
import { AssetGallery } from './components/dev/AssetGallery';
import './styles/app.css';

// Dev-only asset gallery, enabled with /?gallery (see docs/assets.md).
const isAssetGallery =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gallery');

function App() {
  const screen = useGameStore((s) => s.screen);
  if (isAssetGallery) return <AssetGallery />;
  return screen === 'menu' ? <LevelMenu /> : <GameScreen />;
}

export default App;
