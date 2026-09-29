import { expect, test } from '@playwright/test';
import { trailerParkLevel } from '../levels/56-trailerpark';

const victim = trailerParkLevel.people.find((person) => person.isVictim)!;

test('Трейлер и развязка keeps the victim line personal and shows only the two authored common clues', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId(`level-card-${trailerParkLevel.meta.id}`).click();

  const rosterPeople = page.locator('[data-testid^="roster-person-"]');
  await expect(rosterPeople).toHaveCount(trailerParkLevel.people.length);
  const displayedPeople = await rosterPeople.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-testid')!.replace('roster-person-', '')),
  );
  expect(displayedPeople).toEqual(trailerParkLevel.people.map((person) => person.id));

  const victimButton = page.getByTestId(`roster-person-${victim.id}`);
  const victimEntry = page.locator('.roster-entry').filter({ has: victimButton });
  await victimButton.click();
  await expect(victimEntry).toContainText('Жертва находилась наедине с убийцей');

  const zoyaButton = page.getByTestId('roster-person-zoya');
  await zoyaButton.click();
  const zoyaEntry = page.locator('.roster-entry').filter({ has: zoyaButton });
  await expect(zoyaEntry.locator('.roster-mobile__clues')).not.toContainText(/кактус/i);
  await expect(zoyaEntry.locator('.roster-mobile__clues')).toContainText('Зоя находилась ровно на три ряда севернее Клима.');

  const denisButton = page.getByTestId('roster-person-denis');
  await denisButton.click();
  const denisEntry = page.locator('.roster-entry').filter({ has: denisButton });
  await expect(denisEntry.locator('.roster-mobile__clues')).toContainText('Денис находился в общем дворе.');
  await expect(denisEntry.locator('.roster-mobile__clues')).not.toContainText(/барбекю/i);

  const esenyaButton = page.getByTestId('roster-person-esenya');
  await esenyaButton.click();
  const esenyaEntry = page.locator('.roster-entry').filter({ has: esenyaButton });
  await expect(esenyaEntry.locator('.roster-mobile__clues')).not.toContainText(/барбекю/i);

  const general = page.getByTestId('roster-general');
  await expect(general.locator('.roster-mobile__general-count')).toHaveText('2');
  await general.getByRole('button').click();
  await expect(general).toContainText('Все, чьи имена начинались на гласную, находились в одной зоне.');
  await expect(general).toContainText('У каждого барбекю рядом находился хотя бы один человек.');
  await expect(general).not.toContainText(/жертв|убийц/i);
});

test('Трейлер и развязка allows placement on tents but not on the wagon wheel', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${trailerParkLevel.meta.id}`).click();

  const outline = page.getByTestId('item-outline');
  await page.getByTestId('cell-4-8').hover();
  await expect(outline).toHaveClass(/item-outline--occupiable/);
  await page.getByTestId('cell-1-8').hover();
  await expect(outline).toHaveClass(/item-outline--decorative/);
});

test('Трейлер и развязка anchors the north, old, far-lot, and common-yard labels at their bottom edges', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${trailerParkLevel.meta.id}`).click();

  for (const roomId of ['northRow', 'oldRow', 'farLot', 'commonYard']) {
    const room = trailerParkLevel.rooms.find((candidate) => candidate.id === roomId)!;
    const bottomRow = Math.max(...trailerParkLevel.cells.filter((cell) => cell.roomId === roomId).map((cell) => cell.row));
    const labelTop = await page.locator('.room-label').filter({ hasText: room.name }).evaluate((element) => (element as HTMLElement).style.top);
    expect(labelTop).toBe(`${(bottomRow + 1) * 64}px`);
  }
});
