import { expect, test } from '@playwright/test';
import { jazzClubLevel } from '../levels/66-jazzclub';

test('Клуб «7 нот» shows its five-zone board and approved common clues', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId(`level-card-${jazzClubLevel.meta.id}`);

  await expect(card).toContainText('Клуб «7 нот»');
  await card.click();

  await expect(page.locator('.board .grid-cell')).toHaveCount(49);
  const general = page.getByTestId('roster-general');
  await expect(general).toContainText(
    'Все, чьё имя начиналось на гласную букву, были музыкантами; остальные — посетителями и сотрудниками клуба.',
  );
  await expect(general).toContainText('Музыканты выступали только на сцене.');
  await expect(general).not.toContainText('Харитон');
});

test('Клуб «7 нот» reveals the approved story and murderer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId(`level-card-${jazzClubLevel.meta.id}`).click();

  for (const [personId, targetCell] of Object.entries(jazzClubLevel.solution)) {
    await page.getByTestId(`roster-person-${personId}`).click();
    await page.getByTestId(`cell-${targetCell}`).dblclick();
  }
  await page.getByTestId('check-button').click();

  const storyDialog = page.getByTestId('completion-story-dialog');
  await expect(storyDialog).toBeVisible();
  await expect(storyDialog).toContainText(
    'В клубе «7 нот» артисты готовились к исполнению своего джазового сета: Анфиса этим вечером выступит на саксофоне, Есения – на барабанах, часть артистов ещё собирались за кулисами. Гости занимали места в зале, кто-то ещё только подходил, а некоторые отправились в сигарную комнату. Там Виктор устроился в кресле, Харитон сел на диван напротив, а рядом тлела забытая сигара. Ансамбль начал яркую и громкую импровизацию, за звуками которой уже не было слышно происходящего в сигарной. Под соло саксофонистки из сигарной вышел только Виктор.',
  );
  await expect(storyDialog).toContainText('Виктор оказался убийцей Харитона.');
});
