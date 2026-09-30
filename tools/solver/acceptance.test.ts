import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
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
