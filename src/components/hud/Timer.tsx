import { useEffect, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { elapsedMsNow } from '../../engine/selectors';
import { formatElapsed } from '../../utils/time';

export function Timer() {
  const player = useGameStore((s) => s.player);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!player.timer.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [player.timer.running]);

  return <div className="timer">{formatElapsed(elapsedMsNow(player, Date.now()))}</div>;
}
