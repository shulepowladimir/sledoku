import { test, expect } from '@playwright/test';
import { gameLevels, levels } from '../levels';

test('the player-facing catalog contains exactly 64 levels without hidden entries or the tutorial', () => {
  expect(gameLevels).toHaveLength(64);
  expect(gameLevels.some((level) => level.meta.isTutorial)).toBe(false);
  expect(levels).toHaveLength(65);
  expect(levels.filter((level) => level.meta.isTutorial)).toHaveLength(1);
  expect(levels.some((level) => level.meta.hiddenFromMenu)).toBe(false);
});
