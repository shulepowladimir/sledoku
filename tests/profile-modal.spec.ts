import { test, expect, type Page } from '@playwright/test';
import { apartmentLevel } from '../levels/01-apartment';

/**
 * Профильная модалка открывается только с сессией Supabase. Сеть в тестах не
 * трогаем: сидим сессию в localStorage (ключ sb-<project-ref>-auth-token,
 * expires_at в далёком будущем — клиент не пойдёт обновлять токень) и мокаем
 * REST-запросы profiles/results через page.route.
 */

const SUPABASE_ORIGIN = 'https://izzxqpumywcpmztajbrl.supabase.co';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const USERNAME = 'Детектив Тест';

async function signInAsTestUser(page: Page) {
  await page.addInitScript(
    ({ userId }) => {
      localStorage.setItem(
        'sb-izzxqpumywcpmztajbrl-auth-token',
        JSON.stringify({
          access_token: 'test-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: 9999999999,
          refresh_token: 'test-refresh-token',
          user: { id: userId, aud: 'authenticated', email: 'test@example.com' },
        }),
      );
    },
    { userId: USER_ID },
  );

  await page.route(`${SUPABASE_ORIGIN}/rest/v1/**`, async (route) => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    if (table === 'profiles') {
      // loadUsername: select=username&id=eq.… (maybeSingle → объект).
      if (url.searchParams.get('select') === 'username') {
        return route.fulfill({ json: { username: USERNAME } });
      }
      // Имена для лидерборда: select=id,username&id=in.(…)
      return route.fulfill({ json: [{ id: USER_ID, username: USERNAME }] });
    }
    if (table === 'results') {
      return route.fulfill({
        json: [{ level_id: apartmentLevel.meta.id, user_id: USER_ID, elapsed_ms: 65_000 }],
      });
    }
    return route.fulfill({ json: [] });
  });
}

test.describe('профильная модалка', () => {
  test('noir: dark modal with light text, inverted tabs, muted stat cards', async ({ page }) => {
    await signInAsTestUser(page);
    await page.goto('/');

    // Сессия поднялась: в хедере имя вместо «Войти».
    const usernameButton = page.locator('.auth-panel__username');
    await expect(usernameButton).toHaveText(USERNAME);

    // Нуар включаем ДО открытия модалки: оверлей модалки закрывает хедер.
    await page.getByTestId('noir-toggle').click();
    await page.mouse.move(0, 0); // убираем :hover — проверяем базовые цвета

    await usernameButton.click();
    const modal = page.locator('.profile-modal');
    await expect(modal).toBeVisible();

    // Тёмная модалка со светлым текстом — без оверрайда наследуется светлый
    // цвет body.noir и текст пропадает на светлом фоне (как было в legal-modal).
    await expect(modal).toHaveCSS('background-color', 'rgb(26, 26, 31)');
    await expect(modal).toHaveCSS('color', 'rgb(243, 242, 246)');
    await expect(page.locator('.profile-modal__close')).toHaveCSS('color', 'rgb(243, 242, 246)');

    // Активный таб инвертирован: светлый фон, тёмный текст.
    await expect(page.locator('.profile-modal__tab--active')).toHaveCSS('background-color', 'rgb(243, 242, 246)');
    await expect(page.locator('.profile-modal__tab--active')).toHaveCSS('color', 'rgb(26, 26, 31)');

    // Статистика: карточка-сводка тёмная полупрозрачная, подписи приглушённые.
    await expect(page.locator('.profile-stats__summary-item').first()).toHaveCSS(
      'background-color',
      'rgba(243, 242, 246, 0.06)',
    );
    await expect(page.locator('.profile-stats__summary-label').first()).toHaveCSS('color', 'rgb(181, 177, 170)');

    // Таблица лидеров: строки-аккордеоны тоже тёмные, имя игрока светлое.
    await page.getByRole('button', { name: 'Таблица лидеров' }).click();
    await expect(page.locator('.profile-leaderboard__item').first()).toHaveCSS(
      'background-color',
      'rgba(243, 242, 246, 0.06)',
    );
    await expect(page.locator('.profile-leaderboard__row-title').first()).toHaveCSS('color', 'rgb(243, 242, 246)');
    await expect(modal).toContainText(USERNAME);

    // Чистим за собой, чтобы не влиять на другие спеки (общий localStorage).
    await page.evaluate(() => localStorage.removeItem('sledoku:noir'));
  });

  test('light mode stays light: explicit base color decoupled from body theme', async ({ page }) => {
    await signInAsTestUser(page);
    await page.goto('/');

    const usernameButton = page.locator('.auth-panel__username');
    await expect(usernameButton).toHaveText(USERNAME);
    await usernameButton.click();

    // Цветной режим: модалка светлая с тёмным текстом (регрессия на явный color).
    const modal = page.locator('.profile-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveCSS('background-color', 'rgb(250, 248, 244)');
    await expect(modal).toHaveCSS('color', 'rgb(42, 42, 42)');
  });
});
