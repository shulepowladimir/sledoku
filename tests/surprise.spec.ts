import { expect, test } from '@playwright/test';
import { gameLevels, levels } from '../levels';
import { surpriseLevel } from '../levels/57-surprise';

test('Дело №57 stays registered for verification but is hidden from players', async ({ page }) => {
  expect(levels).toContain(surpriseLevel);
  expect(gameLevels).not.toContain(surpriseLevel);

  await page.goto('/');
  await expect(page.getByTestId(`level-card-${surpriseLevel.meta.id}`)).toHaveCount(0);
});
