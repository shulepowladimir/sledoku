import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';
import { bowlingLevel } from '../levels/37-bowling';

// Обводка предмета при наведении (десктоп) / нажатии (мобайл):
// красная пунктирная = decorative («ставить нельзя»), зелёная сплошная =
// occupiable («можно»). Apartment-01: плита (0,0) decorative 1кл,
// диван (1,3) occupiable 1кл. Bowling-01: кегли (0,0)+(0,1) decorative 2кл.

test.describe('item outline on hover (desktop)', () => {
  test('decorative 2-cell item: red dashed outline spanning both cells', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`level-card-${bowlingLevel.meta.id}`).click();

    // Кегли занимают (0,0)+(0,1): горизонтальный 2кл — бокс шире клетки в 2 раза.
    await page.getByTestId('cell-0-0').hover();
    const outline = page.getByTestId('item-outline');
    await expect(outline).toBeVisible();
    await expect(outline).toHaveClass(/item-outline--decorative/);

    const box = await outline.boundingBox();
    const cell = await page.getByTestId('cell-0-0').boundingBox();
    expect(box).not.toBeNull();
    expect(cell).not.toBeNull();
    expect(box!.width).toBeGreaterThan(cell!.width * 1.5);
    expect(box!.height).toBeLessThan(cell!.height * 1.5);
  });

  test('occupiable item: green solid outline', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

    await page.getByTestId('cell-1-3').hover();
    const outline = page.getByTestId('item-outline');
    await expect(outline).toBeVisible();
    await expect(outline).toHaveClass(/item-outline--occupiable/);
    await expect(outline).not.toHaveClass(/item-outline--decorative/);
  });

  test('outline disappears when the cursor leaves the item cell', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

    await page.getByTestId('cell-1-3').hover();
    await expect(page.getByTestId('item-outline')).toBeVisible();
    await page.getByTestId('cell-2-4').hover(); // пустая клетка без предмета
    await expect(page.getByTestId('item-outline')).toHaveCount(0);
  });
});
