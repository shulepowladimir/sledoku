import { expect, test } from '@playwright/test';
import { cruiseLinerLevel } from '../levels/58-cruiseliner';

test('cruiseliner-01 renders the tennis net once across its two-cell span', async ({ page }) => {
  await page.goto(`/?level=${cruiseLinerLevel.meta.id}`);

  const net = page.getByTestId('item-overlay-tennis-net');
  await expect(net).toBeVisible();
  await expect(net).toHaveCSS('width', '64px');
  await expect(net).toHaveCSS('height', '128px');
  await expect(net.locator('.item-icon')).toHaveCSS('height', '115px');
  await expect(page.getByTestId('item-tiles-tennis-net')).toHaveCount(0);
});
