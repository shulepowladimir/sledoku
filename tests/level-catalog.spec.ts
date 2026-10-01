import { test, expect } from '@playwright/test';
import { gameLevels, levels } from '../levels';

test('the player-facing catalog contains exactly 60 levels without hidden entries or the tutorial', () => {
  expect(gameLevels).toHaveLength(60);
  expect(gameLevels.some((level) => level.meta.isTutorial)).toBe(false);
  expect(levels).toHaveLength(61);
  expect(levels.filter((level) => level.meta.isTutorial)).toHaveLength(1);
  expect(levels.some((level) => level.meta.hiddenFromMenu)).toBe(false);
});
