import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

// Обводка предмета при нажатии (мобайл): палец на клетке — обводка есть,
// отпустил — короткая вспышка (~600мс) и снятие. Плита (0,0) decorative 2кл,
// диван (1,3) occupiable. Филепат матчится только проектом 'mobile' (см.
// playwright.config.ts) — проектных skip-хуков не нужно.

test.describe('item outline on touch (mobile)', () => {
  test('press and hold on a decorative item shows the outline while touching', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();

    const cell = page.getByTestId('cell-0-0');
    await cell.dispatchEvent('touchstart', { touches: [{ clientX: 50, clientY: 50, identifier: 0 }] });
    const outline = page.getByTestId('item-outline');
    await expect(outline).toBeVisible();
    await expect(outline).toHaveClass(/item-outline--decorative/);

    await cell.dispatchEvent('touchend');
    // После отпускания — вспышка: обводка живёт ~600мс, потом исчезает.
    await expect(outline).toBeVisible();
    await expect(outline).toHaveCount(0, { timeout: 2000 });
  });

  test('press on an occupiable item shows the green outline', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).tap();

    const cell = page.getByTestId('cell-1-3');
    await cell.dispatchEvent('touchstart', { touches: [{ clientX: 50, clientY: 50, identifier: 0 }] });
    const outline = page.getByTestId('item-outline');
    await expect(outline).toBeVisible();
    await expect(outline).toHaveClass(/item-outline--occupiable/);
    await cell.dispatchEvent('touchend');
    await expect(outline).toHaveCount(0, { timeout: 2000 });
  });
});
