import { test, expect } from '@playwright/test';
import { restaurantLevel } from '../levels/54-restaurant';

const victim = restaurantLevel.people.find((person) => person.isVictim)!;
const visibleGeneralCount = new Set(
  restaurantLevel.clues
    .filter((clue) => !('subject' in clue) || clue.subject.type === 'role')
    .map((clue) => clue.groupId ?? clue.id),
).size;

test('Острая критика shows the public victim in roster order and exposes only the four agreed common clues', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${restaurantLevel.meta.id}`).click();

  const entry = page.locator('.roster-entry').filter({ has: page.getByTestId(`roster-person-${victim.id}`) });
  await expect(page.locator('[data-testid^="roster-person-"]')).toHaveCount(restaurantLevel.people.length);
  const displayedPeople = await page.locator('[data-testid^="roster-person-"]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-testid')!.replace('roster-person-', '')),
  );
  expect(displayedPeople).toEqual(restaurantLevel.people.map((person) => person.id));
  await expect(entry).toContainText('Харитон');
  await expect(entry).toContainText('Жертва находилась наедине с убийцей');

  const general = page.getByTestId('roster-general');
  await expect(general).toContainText('Все, чьи имена начинались с букв от А до Д, работали в ресторане; остальные были гостями.');
  await expect(general).toContainText('Среди сотрудников ресторана был шеф-повар, а среди гостей — критик.');
  await expect(general).toContainText('Шеф-повар находился в своём кабинете.');
  await expect(general).toContainText('Критик находился в одной зоне с сотрудником ресторана.');
  await expect(general).not.toContainText(/Анна|Харитон|жертв|убийц/i);
  await expect(page.getByTestId('victory-banner')).toHaveCount(0);
});

test('Острая критика identifies Denis as the murderer after the authored solution is entered', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${restaurantLevel.meta.id}`).click();

  for (const [personId, cellId] of Object.entries(restaurantLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${cellId}`).dblclick();
  }

  await page.getByTestId('check-button').click();
  await expect(page.getByTestId('victory-banner')).toContainText('Убийцей оказался Денис.');
  await expect(page.getByTestId('victory-banner')).not.toContainText('Критик и жертва');
});

test('Острая критика keeps the public victim clue visible on mobile without duplicating it in common clues', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId(`level-card-${restaurantLevel.meta.id}`).click();

  const victimButton = page.getByTestId(`roster-person-${victim.id}`);
  await victimButton.click();
  const entry = page.locator('.roster-entry').filter({ has: victimButton });
  await expect(entry.locator('.roster-mobile__clues')).toContainText('Жертва находилась наедине с убийцей');

  const general = page.getByTestId('roster-general');
  await expect(general.locator('.roster-mobile__general-count')).toHaveText(String(visibleGeneralCount));
  await general.getByRole('button').click();
  await expect(general).not.toContainText('Жертва находилась наедине с убийцей');
});
