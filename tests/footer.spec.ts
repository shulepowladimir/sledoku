import { test, expect } from '@playwright/test';
import { gameLevels } from '../levels';
import { tutorialLevel } from '../levels/00-tutorial';
import { apartmentLevel } from '../levels/01-apartment';
import { PRIVACY_POLICY_TITLE, TERMS_OF_USE_TITLE } from '../src/components/menu/legalTexts';

const REVISION_TEXT = 'Редакция от 9 сентября 2026 г. Связь: Telegram @shulepowladimir.';

/** Русская плюрализация — то же правило, что в SiteFooter («дело/дела/дел»). */
function casesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'дело';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дела';
  return 'дел';
}

test.describe('подвал сайта', () => {
  test('menu footer shows case count, telegram link and copyright', async ({ page }) => {
    await page.goto('/');

    const footer = page.getByTestId('site-footer');
    await expect(footer).toBeVisible();
    expect(gameLevels).not.toContain(tutorialLevel);
    const archiveCount = gameLevels.length + 1;
    await expect(footer).toContainText(`В архиве ${archiveCount} ${casesWord(archiveCount)}`);
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Воля Шулепов`);

    const telegram = page.getByTestId('footer-telegram');
    await expect(telegram).toHaveText('Написать автору в Telegram');
    await expect(telegram).toHaveAttribute('href', 'https://t.me/shulepowladimir');
    await expect(telegram).toHaveAttribute('target', '_blank');
    await expect(telegram).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('footer is absent on the game screen and returns with the menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('site-footer')).toBeVisible();

    await page.getByTestId(`level-card-${apartmentLevel.meta.id}`).click();
    await expect(page.getByTestId('site-footer')).toHaveCount(0);

    await page.getByTestId('menu-button').click();
    await expect(page.getByTestId('site-footer')).toBeVisible();
  });

  test('documents button opens the modal on the privacy tab; tabs switch; close by button and overlay', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('footer-documents').click();
    const modal = page.getByTestId('legal-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(PRIVACY_POLICY_TITLE);
    // Уникальный маркер контента политики, не совпадающий с заголовком таба.
    await expect(modal).toContainText('Какие данные обрабатываются');

    // Переключение на соглашение.
    await page.getByTestId('legal-tab-terms').click();
    await expect(modal).toContainText(TERMS_OF_USE_TITLE);
    await expect(modal).toContainText('Отказ от гарантий');
    await expect(modal).not.toContainText('Какие данные обрабатываются');

    // Подпись редакции: общая для обоих документов, под тонкой линией, мельче текста.
    const revision = page.locator('.legal-modal__revision');
    for (const tab of ['legal-tab-privacy', 'legal-tab-terms'] as const) {
      await page.getByTestId(tab).click();
      await expect(revision).toHaveText(REVISION_TEXT);
      await expect(revision).toHaveCSS('font-size', '12px');
      await expect(revision).toHaveCSS('border-top-width', '1px');
    }

    // Закрытие крестиком.
    await page.getByTestId('legal-modal-close').click();
    await expect(modal).toHaveCount(0);

    // Закрытие кликом по затемнению.
    await page.getByTestId('footer-documents').click();
    await page.locator('.legal-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId('legal-modal')).toHaveCount(0);
  });

  test('noir: footer mutes to light grays, links keep the burgundy accent color', async ({ page }) => {
    await page.goto('/');

    // Цветной режим: приглушённые тексты тёмные, ссылка бордовая.
    await expect(page.locator('.site-footer__copyright')).toHaveCSS('color', 'rgb(107, 103, 96)');
    await expect(page.getByTestId('footer-telegram')).toHaveCSS('color', 'rgb(138, 47, 40)');

    await page.getByTestId('noir-toggle').click();
    await page.mouse.move(0, 0); // убираем :hover — проверяем базовые цвета

    await expect(page.locator('.site-footer__copyright')).toHaveCSS('color', 'rgb(181, 177, 170)');
    await expect(page.locator('.site-footer__tagline')).toHaveCSS('color', 'rgb(181, 177, 170)');
    // Ссылка остаётся бордовой по computed style — нуар-оверлей приглушает отрисовку.
    await expect(page.getByTestId('footer-telegram')).toHaveCSS('color', 'rgb(138, 47, 40)');

    // Чистим за собой, чтобы не влиять на другие спеки (общий localStorage).
    await page.evaluate(() => localStorage.removeItem('sledoku:noir'));
  });

  test('noir: legal modal is dark with light text (readable on black)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('noir-toggle').click();
    await page.getByTestId('footer-documents').click();

    // Тёмная модалка со светлым текстом — без оверрайда наследуется светлый
    // цвет body.noir и текст пропадает на светлом фоне.
    const modal = page.getByTestId('legal-modal');
    await expect(modal).toHaveCSS('background-color', 'rgb(26, 26, 31)');
    await expect(modal).toHaveCSS('color', 'rgb(243, 242, 246)');
    await expect(modal).toContainText('Какие данные обрабатываются');

    // Активный таб инвертирован: светлый фон, тёмный текст.
    await expect(page.getByTestId('legal-tab-privacy')).toHaveCSS('background-color', 'rgb(243, 242, 246)');
    await expect(page.getByTestId('legal-tab-privacy')).toHaveCSS('color', 'rgb(26, 26, 31)');

    // Подпись редакции — приглушённая, с светлой линией.
    await expect(page.locator('.legal-modal__revision')).toHaveCSS('color', 'rgb(181, 177, 170)');
    await expect(page.locator('.legal-modal__revision')).toHaveCSS('border-top-color', 'rgba(243, 242, 246, 0.15)');

    // Чистим за собой, чтобы не влиять на другие спеки (общий localStorage).
    await page.evaluate(() => localStorage.removeItem('sledoku:noir'));
  });

  // Мобильная компоновка (узкий вьюпорт в chromium-проекте; mobile-проект гоняет только mobile.spec.ts).
  test.describe('мобильная компоновка', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('footer stacks into a centered column, links wrap', async ({ page }) => {
      await page.goto('/');

      const footer = page.getByTestId('site-footer');
      await expect(footer).toBeVisible();
      await expect(footer).toHaveCSS('flex-direction', 'column');
      await expect(page.locator('.site-footer__links')).toHaveCSS('justify-content', 'center');
      await expect(page.getByTestId('footer-telegram')).toBeVisible();
      await expect(page.getByTestId('footer-documents')).toBeVisible();

      // Модалка правовых текстов открывается и в ширину экрана.
      await page.getByTestId('footer-documents').click();
      const modal = page.getByTestId('legal-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(PRIVACY_POLICY_TITLE);
    });
  });
});
