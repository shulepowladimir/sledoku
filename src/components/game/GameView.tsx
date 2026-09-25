import { GameScreen } from './GameScreen';
import { TutorialOverlayAfterMount } from '../tutorial/TutorialOverlayAfterMount';

export function GameView() {
  return (
    <>
      <GameScreen />
      <TutorialOverlayAfterMount />
    </>
  );
}
