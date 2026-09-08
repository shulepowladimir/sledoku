import { Board } from '../board/Board';
import { RosterPanel } from '../roster/RosterPanel';
import { Timer } from '../hud/Timer';
import { MenuButton } from '../hud/MenuButton';
import { ModeToggle } from '../hud/ModeToggle';
import { UndoButton } from '../hud/UndoButton';
import { ResetButtons } from '../hud/ResetButtons';
import { ControlLegend } from '../hud/ControlLegend';
import { CheckButton } from '../hud/CheckButton';
import { VictoryBanner } from '../hud/VictoryBanner';
import { HowToPlay } from '../menu/HowToPlay';
import { NoirToggle } from '../hud/NoirToggle';

export function GameScreen() {
  return (
    <div className="app-shell">
      <div className="hud-bar">
        <Timer />
        <MenuButton />
        <ModeToggle />
        <UndoButton />
        <ResetButtons />
        <CheckButton />
        <HowToPlay variant="game" />
        <NoirToggle />
      </div>
      <ControlLegend />
      <VictoryBanner />
      <div className="app-layout">
        <Board />
        <RosterPanel />
      </div>
    </div>
  );
}
