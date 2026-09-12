import { test, expect, type Page } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

/** Компас: кнопка в hud-bar игрового экрана (в меню её нет), модалка с розой ветров,
 *  полными словами направлений, закрытие по крестику и оверлею, нуар-тема. */

async function openGame(page: Page) {
  await page.goto('/');
  await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
  await page.waitForSelector('.board');
}

test('кнопка компаса открывает модалку со всеми направлениями', async ({ page }) => {
  await openGame(page);

  await expect(page.getByTestId('hud-compass')).toBeVisible();
  await page.getByTestId('hud-compass').click();

  const modal = page.getByTestId('compass-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Север', { exact: true })).toBeVisible();
  await expect(modal.getByText('Юг', { exact: true })).toBeVisible();
  await expect(modal.getByText('Запад', { exact: true })).toBeVisible();
  await expect(modal.getByText('Восток', { exact: true })).toBeVisible();
  await expect(modal.locator('.compass-rose svg')).toBeVisible();

  await page.getByTestId('compass-close').click();
  await expect(modal).not.toBeVisible();
});

test('компас закрывается по клику в оверлей', async ({ page }) => {
  await openGame(page);

  await page.getByTestId('hud-compass').click();
  const modal = page.getByTestId('compass-modal');
  await expect(modal).toBeVisible();

  await page.locator('.compass-overlay').click({ position: { x: 8, y: 8 } });
  await expect(modal).not.toBeVisible();
});

test('в меню кнопки компаса нет — только в игровом экране', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.level-card');
  await expect(page.getByTestId('hud-compass')).toHaveCount(0);
});

test('нуар: тёмная карточка компаса', async ({ page }) => {
  await openGame(page);

  await page.getByTestId('noir-toggle').click();
  await page.getByTestId('hud-compass').click();

  const modal = page.getByTestId('compass-modal');
  await expect(modal).toBeVisible();
  const bg = await modal.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(26, 26, 31)');
});
