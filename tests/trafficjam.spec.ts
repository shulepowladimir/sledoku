import { expect, test } from '@playwright/test';
import { trafficJamLevel } from '../levels/69-trafficjam';

test('Пробка 10 баллов shows the approved map, traffic, and common vowel clue', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('level-card-trafficjam-01')).toContainText('Пробка 10 баллов');
  await page.getByTestId('level-card-trafficjam-01').click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(100);
  await expect(page.locator('.roster-panel__title')).toHaveText('Пробка 10 баллов');
  await expect(page.getByTestId('roster-general')).toContainText(
    'Все, чьи имена начинались на гласную букву, находились в машинах.',
  );
  await expect(page.getByTestId('roster-general').locator('.clue-item')).toHaveCount(1);
  await expect(page.locator('.board .item-icon')).toHaveCount(31);
  await expect(page.getByTestId('cell-3-6')).toHaveAttribute('title', 'Дорожный ремонт');
  await expect(page.getByTestId('cell-0-0')).toHaveAttribute('title', 'Дерево');
  await expect(page.getByTestId('cell-0-6')).toHaveAttribute('title', 'Дерево');
  await expect(page.getByTestId('cell-4-3')).toHaveAttribute('title', 'Трактор');
  await expect(page.getByTestId('cell-4-4')).toHaveAttribute('title', 'Трактор');
});

test('solving trafficjam-01 reveals the approved story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${trafficJamLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(trafficJamLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText('Пробка из-за ремонта шоссе в правом направлении встала намертво');
  await expect(storyDialog).toContainText('Жанна на мотоцикле выходила на обгон машины Ивана');
  await expect(storyDialog).toContainText('камень на голову Харитона.');
  await expect(storyDialog).toContainText('Кирилл оказался убийцей Харитона.');
});
