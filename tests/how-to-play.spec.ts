import { test, expect } from '@playwright/test';

test('help keeps the menu summary concise and explains zone boundaries in-game', async ({ page }) => {
  await page.goto('/');
  const popover = page.locator('.how-to-play__popover');

  await page.getByTestId('hud-howto').hover();
  await expect(popover).toContainText('Следоку — это судоку в детективной обёртке.');
  await expect(popover).not.toContainText('Наведите курсор на предмет');

  await page.getByTestId('level-card-apartment-01').click();
  await page.getByTestId('hud-howto').hover();
  await expect(popover).toContainText('Наведите курсор на предмет');
  await expect(popover).toContainText(
    'Граница зон А и Б — это клетки на краях обеих зон, которые соприкасаются общей гранью.',
  );
});
