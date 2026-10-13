import assert from 'node:assert/strict';
import { test } from 'node:test';
import { itemIconTransform, resolveItemIcon } from '../../src/engine/itemVisual';

test('an item can override its type icon without changing its shared item type', () => {
  assert.equal(resolveItemIcon({ icon: 'car' }, { iconVariant: 'raceCar' }), 'raceCar');
  assert.equal(resolveItemIcon({ icon: 'tree' }, {}), 'tree');
});

test('horizontal item mirroring composes with the existing otherworld rotation', () => {
  assert.equal(itemIconTransform({ flipHorizontal: true }), 'scaleX(-1)');
  assert.equal(itemIconTransform({ rotate180: true }), 'rotate(180deg)');
  assert.equal(
    itemIconTransform({ flipHorizontal: true, rotate180: true }),
    'rotate(180deg) scaleX(-1)',
  );
  assert.equal(itemIconTransform({}), undefined);
});

test('per-item quarter-turn rotation composes with the existing icon transforms', () => {
  assert.equal(itemIconTransform({ rotation: 90 }), 'rotate(90deg)');
  assert.equal(itemIconTransform({ rotation: 270, rotate180: true, flipHorizontal: true }), 'rotate(180deg) rotate(270deg) scaleX(-1)');
});
