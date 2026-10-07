import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import { egyptLevel } from '../../levels/11-egypt';
import { restaurantLevel } from '../../levels/54-restaurant';
import { checkLevelAcceptance } from './acceptance';

test('new levels must meet the occupancy density target and avoid fully pinned people', () => {
  assert.deepEqual(checkLevelAcceptance(restaurantLevel, 0), []);
  assert.match(checkLevelAcceptance(restaurantLevel, 1).join('\n'), /fully pinned|запинено/i);

  const sparseLevel = {
    ...restaurantLevel,
    items: [],
    cells: restaurantLevel.cells.map((cell) => ({ ...cell, floorFeatureId: undefined })),
  };
  assert.match(checkLevelAcceptance(sparseLevel, 0).join('\n'), /density|плотность/i);

  const grandfatheredSparseLevel = {
    ...sparseLevel,
    meta: { ...sparseLevel.meta, id: 'egypt-01' },
  };
  assert.deepEqual(checkLevelAcceptance(grandfatheredSparseLevel, 0), []);

  const approvedWeddingException = {
    ...sparseLevel,
    meta: { ...sparseLevel.meta, id: 'wedding-01' },
  };
  assert.deepEqual(checkLevelAcceptance(approvedWeddingException, 0), []);
});

test('the approved apartment level retains its nonzero fully-pinned-person exception', () => {
  assert.deepEqual(checkLevelAcceptance(apartmentLevel, 1), []);
});

test('new levels may show at most four common clue groups, counting grouped clues once', () => {
  const firstCommonClue = restaurantLevel.clues.find((clue) =>
    !('subject' in clue) || clue.subject.type === 'role',
  )!;
  const aboveLimit = {
    ...restaurantLevel,
    meta: { ...restaurantLevel.meta, id: 'common-clue-limit-test' },
    clues: [
      ...restaurantLevel.clues,
      { ...firstCommonClue, id: 'extra-common-clue', text: 'Дополнительное общее правило.' },
    ],
  };
  assert.match(checkLevelAcceptance(aboveLimit, 0).join('\n'), /общих групп подсказок: 5.*4/i);

  const groupedAtLimit = {
    ...restaurantLevel,
    meta: { ...restaurantLevel.meta, id: 'grouped-common-clue-limit-test' },
    clues: [
      ...restaurantLevel.clues.map((clue) => clue.id === firstCommonClue.id
        ? { ...clue, groupId: 'one-displayed-group' }
        : clue),
      {
        ...firstCommonClue,
        id: 'grouped-common-clue',
        groupId: 'one-displayed-group',
        text: 'Дополнительная строка той же общей группы.',
      },
    ],
  };
  assert.deepEqual(checkLevelAcceptance(groupedAtLimit, 0), []);

  assert.deepEqual(checkLevelAcceptance(egyptLevel, 0), []);
});
