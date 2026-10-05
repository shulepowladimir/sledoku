import { test, expect } from '@playwright/test';
import { strangeCaseLevel } from '../levels/63-strange-case';

test('strange case shows its world-reading note with the general clues', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('size-filter-12').click();
  await page.getByTestId(`level-card-${strangeCaseLevel.meta.id}`).click();

  const general = page.getByTestId('roster-general');
  await expect(general.getByText(
    'Все персонажи на гласную букву находились в одном мире — обычном или потустороннем.',
    { exact: true },
  )).toBeVisible();
  await expect(general.getByText(
    'Обозначения зон в подсказках могут быть как из обычного мира, так и из потустороннего.',
    { exact: true },
  )).toBeVisible();
});

test('solving strange case reveals the approved completion story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${strangeCaseLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(strangeCaseLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'В маленьком городке на 12-й улице открылся проход в потусторонний мир, и привычная реальность жителей перевернулась с ног на голову. Например, Алексей, Евгений и Карина вместе ехали на машине, как вдруг Карина осталась одна, а парни — в такой же машине, но в другой реальности. В этом мире всё было похоже на обычный, но какие-то предметы переместились в пространстве, какие-то вовсе исчезли. Пока Жанна на чердаке пыталась подключиться к радиосвязи, Зина в доме искала инструменты потяжелее — на всякий случай. Компанию пяти друзей, которые катались и играли у большого дерева, тоже закинуло в неожиданные места — как на дерево, так и в параллельную реальность. Во всей этой суете никто не заметил, что пропала Хелен: на чердаке своего дома, но в потустороннем мире, её поймал Виктор, обитатель этой обратной реальности.',
  );
  await expect(storyDialog).toContainText('Виктор оказался убийцей Хелен.');
});
