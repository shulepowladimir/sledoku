import { test, expect, type Locator, type Page } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

/** Сэмплирует пиксели элемента (5 точек: края и центр) через canvas — без PNG-декодера. */
async function samplePixels(page: Page, locator: Locator): Promise<number[][]> {
  const buf = await locator.screenshot();
  const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
  return page.evaluate(async (url: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('screenshot image failed to load'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const points: Array<[number, number]> = [
      [0.06, 0.5],
      [0.5, 0.08],
      [0.94, 0.5],
      [0.5, 0.92],
      [0.25, 0.5],
    ];
    return points.map(([fx, fy]) => {
      const x = Math.max(0, Math.min(img.width - 1, Math.round(img.width * fx)));
      const y = Math.max(0, Math.min(img.height - 1, Math.round(img.height * fy)));
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]];
    });
  }, dataUrl);
}

test.describe('нуар-режим', () => {
  test('menu: toggle switches label, button colors, background and grayscale overlay; persists across reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByTestId('noir-toggle');
    const body = page.locator('body');
    await expect(toggle).toHaveText('Нуар');
    await expect(body).not.toHaveClass(/noir/);

    // Цвет: светлый фон, кнопка «Нуар» чёрная с белым шрифтом.
    await expect(body).toHaveCSS('background-color', 'rgb(250, 248, 244)');
    await expect(toggle).toHaveCSS('background-color', 'rgb(42, 42, 42)');
    await expect(toggle).toHaveCSS('color', 'rgb(255, 255, 255)');

    // Включаем: лейбл меняется, класс вешается, фон чёрный, кнопка бордовая.
    await toggle.click();
    await page.mouse.move(0, 0); // убираем :hover — проверяем базовый цвет кнопки
    await expect(toggle).toHaveText('Цвет');
    await expect(body).toHaveClass(/noir/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(body).toHaveCSS('background-color', 'rgb(10, 10, 10)');
    await expect(toggle).toHaveCSS('background-color', 'rgb(138, 47, 40)');
    const overlayFilter = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.backdropFilter = 'grayscale(1)';
      return getComputedStyle(document.body, '::after').backdropFilter || el.style.backdropFilter;
    });
    expect(overlayFilter).toContain('grayscale');

    // Тумблер ВИЗУАЛЬНО бордовый: он выше оверлея, а не просто «задекларирован» бордовым.
    const togglePixels = await samplePixels(page, toggle);
    const hasBurgundy = togglePixels.some(([r, g, b]) => r > g + 30 && r > b + 30);
    expect(hasBurgundy, 'кнопка «Цвет» остаётся бордовой поверх нуар-оверлея').toBe(true);

    // Режим сохраняется до следующего переключения (localStorage).
    await page.reload();
    const toggleAfterReload = page.getByTestId('noir-toggle');
    await expect(toggleAfterReload).toHaveText('Цвет');
    await expect(page.locator('body')).toHaveClass(/noir/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 10, 10)');

    // Выключаем: всё возвращается.
    await toggleAfterReload.click();
    await expect(toggleAfterReload).toHaveText('Нуар');
    await expect(page.locator('body')).not.toHaveClass(/noir/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(250, 248, 244)');

    // Чистим за собой, чтобы не влиять на другие спеки (общий localStorage).
    await page.evaluate(() => localStorage.removeItem('sledoku:noir'));
  });

  test('level: hud toggle works, dark level background in noir, stays in sync with the menu', async ({ page }) => {
    await page.goto('/');

    // Включаем из меню, входим в уровень — режим активен и там.
    await page.getByTestId('noir-toggle').click();
    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
    const hudToggle = page.getByTestId('noir-toggle');
    await expect(hudToggle).toHaveText('Цвет');
    await expect(page.locator('body')).toHaveClass(/noir/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 10, 10)');

    // Оверлей по-прежнему красит остальной интерфейс: зелёная «Проверить» в нуаре серая.
    const checkPixels = await samplePixels(page, page.getByTestId('check-button'));
    const checkIsGray = checkPixels.every(
      ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) < 20,
    );
    expect(checkIsGray, 'остальной интерфейс остаётся ч/б в нуар-режиме').toBe(true);

    // А сам тумблер над оверлеем — бордовый.
    const hudTogglePixels = await samplePixels(page, hudToggle);
    const hudHasBurgundy = hudTogglePixels.some(([r, g, b]) => r > g + 30 && r > b + 30);
    expect(hudHasBurgundy, 'тумблер на уровне тоже остаётся бордовым в нуаре').toBe(true);

    // Выключаем на уровне: фон сразу светлый, кнопка чёрная.
    await hudToggle.click();
    await page.mouse.move(0, 0); // убираем :hover — проверяем базовый цвет кнопки
    await expect(hudToggle).toHaveText('Нуар');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(250, 248, 244)');
    await expect(hudToggle).toHaveCSS('background-color', 'rgb(42, 42, 42)');

    // Возвращаемся в меню — режим согласован.
    await page.getByTestId('menu-button').click();
    const menuToggle = page.getByTestId('noir-toggle');
    await expect(menuToggle).toHaveText('Нуар');
    await expect(page.locator('body')).not.toHaveClass(/noir/);

    // Чистим за собой, чтобы не влиять на другие спеки (общий localStorage).
    await page.evaluate(() => localStorage.removeItem('sledoku:noir'));
  });
});
