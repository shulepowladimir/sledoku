import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

test('menu -> full playthrough of apartment-01 -> victory -> back to menu', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(apartmentLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).click();
  }

  await page.getByTestId('check-button').click();

  const banner = page.getByTestId('victory-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Дело раскрыто!');
  const murderer = apartmentLevel.people.find((p) => p.isMurderer);
  await expect(banner).toContainText(`Убийцей оказался ${murderer?.name}.`);

  await page.getByTestId('menu-button').click();

  const card = page.getByTestId(`level-card-${apartmentLevel.meta.id}`);
  await expect(card).toContainText('Раскрыто');
});
