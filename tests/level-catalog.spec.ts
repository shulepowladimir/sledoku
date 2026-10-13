import { test, expect } from '@playwright/test';
import { gameLevels, levels } from '../levels';

test('the player-facing catalog includes airplane and excludes the tutorial', () => {
  expect(gameLevels).toHaveLength(69);
  expect(gameLevels.some((level) => level.meta.id === 'jazzclub-01')).toBe(true);
  expect(gameLevels.some((level) => level.meta.id === 'bunker-01')).toBe(true);
  expect(gameLevels.some((level) => level.meta.id === 'trafficjam-01')).toBe(true);
  expect(gameLevels.some((level) => level.meta.id === 'airplane-01')).toBe(true);
  expect(gameLevels.some((level) => level.meta.isTutorial)).toBe(false);
  expect(levels).toHaveLength(70);
  expect(levels.filter((level) => level.meta.isTutorial)).toHaveLength(1);
  expect(levels.some((level) => level.meta.hiddenFromMenu)).toBe(false);
});
