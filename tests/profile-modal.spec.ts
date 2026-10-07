import { test, expect, type Page } from '@playwright/test';

/**
 * Профильная модалка открывается только с сессией Supabase. Сеть в тестах не
 * трогаем: сидим сессию в localStorage (ключ sb-<project-ref>-auth-token,
 * expires_at в далёком будущем — клиент не пойдёт обновлять токень) и мокаем
 * REST-запросы profiles/results через page.route.
 */

const SUPABASE_ORIGIN = 'https://izzxqpumywcpmztajbrl.supabase.co';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '22222222-2222-2222-2222-222222222222';
const USERNAME = 'Детектив Тест';
const LEADERBOARD_RESULTS = [
  { level_id: 'dacha-01', user_id: USER_ID, elapsed_ms: 65_000 },
  { level_id: 'heavy-01', user_id: OTHER_USER_ID, elapsed_ms: 55_000 },
  { level_id: 'heavy-01', user_id: USER_ID, elapsed_ms: 62_000 },
  { level_id: 'heavy-01', user_id: OTHER_USER_ID, elapsed_ms: 70_000 },
];

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
      return route.fulfill({
        json: [
          { id: USER_ID, username: USERNAME },
          { id: OTHER_USER_ID, username: 'Другой игрок' },
        ],
      });
    }
    if (table === 'results') {
      const levelId = url.searchParams.get('level_id')?.replace('eq.', '');
      const rows = levelId
        ? LEADERBOARD_RESULTS.filter((row) => row.level_id === levelId)
        : LEADERBOARD_RESULTS;
      return route.fulfill({ json: [...rows].sort((a, b) => a.elapsed_ms - b.elapsed_ms) });
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
    await page.getByTestId('profile-leaderboard-size-6').click();
    await expect(page.locator('.profile-leaderboard__item').first()).toHaveCSS(
      'background-color',
      'rgba(243, 242, 246, 0.06)',
    );
    await expect(page.locator('.profile-leaderboard__row-title').first()).toHaveCSS('color', 'rgb(243, 242, 246)');
    await expect(page.locator('.profile-leaderboard__row-time--mine').first()).toHaveCSS('color', 'rgb(114, 214, 154)');
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

  test('leaderboard groups levels by size, shows tags, and highlights the current player', async ({ page }) => {
    await signInAsTestUser(page);
    await page.goto('/');
    await page.locator('.auth-panel__username').click();
    await page.getByRole('button', { name: 'Таблица лидеров' }).click();

    const size6 = page.getByTestId('profile-leaderboard-size-6');
    await expect(size6).toContainText('6×6');
    await expect(size6).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('profile-leaderboard-level-dacha-01')).toHaveCount(0);
    await size6.click();

    const dachaRow = page.getByTestId('profile-leaderboard-level-dacha-01');
    await expect(dachaRow).toBeVisible();
    await expect(dachaRow.locator('.profile-leaderboard__row-time')).toHaveClass(/--mine/);
    await expect(dachaRow.locator('.profile-leaderboard__row-time')).toHaveCSS('color', 'rgb(56, 107, 87)');

    await page.getByTestId('profile-leaderboard-size-custom').click();
    await expect(page.getByTestId('profile-leaderboard-level-cruiseliner-01')).toBeVisible();
    await expect(page.getByTestId('profile-leaderboard-level-parking-01')).toBeVisible();

    await page.getByTestId('profile-leaderboard-size-12').click();
    const heavyRow = page.getByTestId('profile-leaderboard-level-heavy-01');
    await expect(heavyRow.getByText('Сложно')).toBeVisible();
    await expect(heavyRow.locator('.profile-leaderboard__row-time')).not.toHaveClass(/--mine/);
    await expect(heavyRow.locator('.profile-leaderboard__row-time')).toHaveCSS('color', 'rgb(138, 47, 40)');
    await expect(page.getByTestId('profile-leaderboard-level-golfclub-01').getByText('Эксперт')).toBeVisible();

    await heavyRow.click();
    const top5 = heavyRow.locator('..').locator('.profile-leaderboard__top5');
    await expect(top5.getByText(USERNAME)).toBeVisible();
    await expect(top5.locator('li').filter({ hasText: USERNAME }).locator('.profile-leaderboard__top5-time'))
      .toHaveClass(/--mine/);
    await expect(top5.getByText('Другой игрок').first()).toBeVisible();
    await expect(top5.locator('li').filter({ hasText: 'Другой игрок' }).first().locator('.profile-leaderboard__top5-time'))
      .not.toHaveClass(/--mine/);
  });

  test('leaderboard keeps the main menu order across size groups', async ({ page }) => {
    await signInAsTestUser(page);
    await page.goto('/');

    await expect(page.getByTestId('level-card-apartment-01')).toBeVisible();
    const menuOrder = await page.locator('.level-menu__grid > li:not(.level-card--tutorial)').evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-testid')!.replace('level-card-', '')),
    );
    await page.locator('.auth-panel__username').click();
    await page.getByRole('button', { name: 'Таблица лидеров' }).click();

    const sizeGroups = page.locator('.profile-leaderboard__size-toggle');
    await expect(sizeGroups.first()).toBeVisible();
    const leaderboardOrder: string[] = [];
    for (let i = 0; i < await sizeGroups.count(); i += 1) {
      await sizeGroups.nth(i).click();
      const groupLevelIds = await page.locator('.profile-leaderboard__list .profile-leaderboard__row').evaluateAll((rows) =>
        rows.map((row) => row.getAttribute('data-testid')!.replace('profile-leaderboard-level-', '')),
      );
      leaderboardOrder.push(...groupLevelIds);
    }

    expect(leaderboardOrder).toEqual(menuOrder);
  });
});
