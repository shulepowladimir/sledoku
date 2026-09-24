import { test, expect } from '@playwright/test';
import { tvStudioLevel } from '../levels/46-tvstudio';

test('tvstudio-01 renders its cast, board, and custom item icons', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.getByTestId(`level-card-${tvStudioLevel.meta.id}`).click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(tvStudioLevel.size ** 2);
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(tvStudioLevel.people.length);
  const customItemTypes = new Set(['directorConsole', 'studioSoftbox', 'newsDesk']);
  for (const item of tvStudioLevel.items.filter((candidate) => customItemTypes.has(candidate.typeId))) {
    for (const cellId of item.cells) {
      await expect(page.getByTestId(`cell-${cellId}`).locator('svg.item-icon')).toHaveCount(1);
    }
  }

  expect(errors).toEqual([]);
});

test('tvstudio-01 full solution run reveals Daniil as the murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${tvStudioLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(tvStudioLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Даниил');
});
