import { test, expect } from '@playwright/test';
import { gameLevels, levels } from '../levels';

test('the player-facing catalog contains exactly 65 levels without hidden entries or the tutorial', () => {
  expect(gameLevels).toHaveLength(65);
  expect(gameLevels.some((level) => level.meta.id === 'jazzclub-01')).toBe(true);
  expect(gameLevels.some((level) => level.meta.isTutorial)).toBe(false);
  expect(levels).toHaveLength(66);
  expect(levels.filter((level) => level.meta.isTutorial)).toHaveLength(1);
  expect(levels.some((level) => level.meta.hiddenFromMenu)).toBe(false);
});
