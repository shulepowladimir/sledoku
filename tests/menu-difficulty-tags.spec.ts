import { test, expect } from '@playwright/test';
import { gameLevels } from '../levels';
import { boardSortKey, isCustomBoard } from '../src/utils/boardSize';

const tagGroups = [
  {
    id: 'expert',
    label: 'Эксперт',
    levelIds: ['golfclub-01', 'library-01', 'parking-01', 'egypt-01', 'stadium-01'],
  },
  {
    id: 'hard',
    label: 'Сложно',
    levelIds: ['parkmaze-01', 'heavy-01', 'wildwest-02', 'cablecar-01', 'wildwest-01', 'autoshop-01', 'space-01', 'cruiseliner-01', 'bowling-01', 'wedding-01', 'underwater-01', 'greenhouse-01', 'mall-01'],
  },
];

const tagOrder = { untagged: 0, hard: 1, expert: 2 } as const;

function expectedOrder(levels: typeof gameLevels) {
  return [...levels]
    .sort((a, b) => {
      const tagA = a.meta.menuTag ?? 'untagged';
      const tagB = b.meta.menuTag ?? 'untagged';
      return boardSortKey(a) - boardSortKey(b) || tagOrder[tagA] - tagOrder[tagB];
    })
    .map((level) => level.meta.id);
}

async function visibleLevelIds(page: import('@playwright/test').Page) {
  return page.locator('.level-menu__grid > li:not(.level-card--tutorial)').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-testid')!.replace('level-card-', '')),
  );
}

test('menu difficulty tags appear only on the requested levels', async ({ page }) => {
  await page.goto('/');

  const taggedIds = new Set(tagGroups.flatMap((group) => group.levelIds));
  for (const group of tagGroups) {
    for (const levelId of group.levelIds) {
      const card = page.getByTestId(`level-card-${levelId}`);
      const tag = card.getByTestId('level-difficulty-tag');
      await expect(tag).toHaveText(group.label);
      await expect(tag).toHaveClass(new RegExp(`level-card__difficulty-tag--${group.id}`));
    }
  }

  for (const level of gameLevels.filter((candidate) => !taggedIds.has(candidate.meta.id))) {
    await expect(page.getByTestId(`level-card-${level.meta.id}`).getByTestId('level-difficulty-tag')).toHaveCount(0);
  }

  await expect(page.getByTestId('level-card-golfclub-01')).toContainText('Замах и удар');
  await expect(page.getByTestId('level-card-autoshop-01')).toContainText('Заглохший двигатель');
});

test('expert tag is distinct from hard and existing menu tag colors, at the card top right', async ({ page }) => {
  await page.goto('/');

  const hardTag = page.getByTestId('level-card-heavy-01').getByTestId('level-difficulty-tag');
  const expertTag = page.getByTestId('level-card-golfclub-01').getByTestId('level-difficulty-tag');
  const hardStyle = await hardTag.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderTopColor, text: style.color };
  });
  const expertStyle = await expertTag.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderTopColor, text: style.color };
  });
  const existingTagColors = new Set([
    'rgb(138, 47, 40)', // solved / board-size tags
    'rgb(56, 107, 87)', // in-progress tag
    'rgb(40, 87, 68)', // in-progress text
    'rgb(138, 106, 31)', // tutorial tag
    'rgb(47, 125, 79)', // completed tutorial tag
  ]);

  expect(expertStyle.background).not.toBe(hardStyle.background);
  expect(expertStyle.border).not.toBe(hardStyle.border);
  expect(expertStyle.text).not.toBe(hardStyle.text);
  for (const color of [...Object.values(hardStyle), ...Object.values(expertStyle)]) {
    expect(existingTagColors.has(color)).toBe(false);
  }

  const cardBox = await page.getByTestId('level-card-golfclub-01').boundingBox();
  const tagBox = await expertTag.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(tagBox).not.toBeNull();
  expect(tagBox!.x + tagBox!.width).toBeGreaterThan(cardBox!.x + cardBox!.width - 24);
  expect(tagBox!.y).toBeLessThan(cardBox!.y + 24);
});

test('levels sort by board size, then tag group, preserving creation order within each group', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => visibleLevelIds(page)).toEqual(expectedOrder(gameLevels));

  const categories = [...new Set(gameLevels.map((level) => isCustomBoard(level) ? 'custom' : String(level.size)))];
  for (const category of categories) {
    await page.getByTestId(`size-filter-${category}`).click();
    const categoryLevels = gameLevels.filter((level) =>
      category === 'custom' ? isCustomBoard(level) : !isCustomBoard(level) && level.size === Number(category),
    );
    await expect.poll(() => visibleLevelIds(page)).toEqual(expectedOrder(categoryLevels));
  }
});
