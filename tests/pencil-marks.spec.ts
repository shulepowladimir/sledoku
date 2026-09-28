import { test, expect } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

function toRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgb(${value >> 16}, ${(value >> 8) & 0xff}, ${value & 0xff})`;
}

test('pencil marks invert for the selected person and return to normal when deselected', async ({ page }) => {
  const [firstPerson, secondPerson] = apartmentLevel.people;
  const cell = apartmentLevel.cells.find((candidate) => !candidate.itemId)!;

  await page.goto(`/?level=${apartmentLevel.meta.id}`);
  await page.getByTestId(`roster-person-${firstPerson.id}`).click();
  await page.getByTestId(`cell-${cell.id}`).click();

  const firstMark = page.getByTestId(`cell-${cell.id}`).locator(`[data-person-id="${firstPerson.id}"]`);
  await expect(firstMark).toHaveClass(/pencil-chip--selected/);
  await expect(firstMark).toHaveCSS('background-color', toRgb(firstPerson.color));
  await expect(firstMark).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(firstMark).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');

  await page.getByTestId(`roster-person-${secondPerson.id}`).click();
  await expect(firstMark).not.toHaveClass(/pencil-chip--selected/);
  await expect(firstMark).toHaveCSS('background-color', 'rgb(250, 248, 244)');
  await page.getByTestId(`cell-${cell.id}`).click();

  const secondMark = page.getByTestId(`cell-${cell.id}`).locator(`[data-person-id="${secondPerson.id}"]`);
  await expect(secondMark).toHaveClass(/pencil-chip--selected/);
  await expect(page.getByTestId(`cell-${cell.id}`).locator('.pencil-chip--selected')).toHaveCount(1);

  await page.getByTestId(`roster-person-${secondPerson.id}`).click();
  await expect(page.getByTestId(`cell-${cell.id}`).locator('.pencil-chip--selected')).toHaveCount(0);
});
