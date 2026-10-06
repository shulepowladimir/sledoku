import type { Level } from '../types/level';
import { boardSortKey } from './boardSize';

function menuTagSortKey(level: Level): number {
  if (level.meta.menuTag === 'hard') return 1;
  if (level.meta.menuTag === 'expert') return 2;
  return 0;
}

export function sortLevelsByMenuOrder(levels: readonly Level[]): Level[] {
  return [...levels].sort((a, b) =>
    boardSortKey(a) - boardSortKey(b) || menuTagSortKey(a) - menuTagSortKey(b),
  );
}
