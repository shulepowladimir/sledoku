import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cemeteryLevel } from '../../levels/44-cemetery';
import { checkHiddenRoleEpistemics, createEpistemicWorld } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

test('cemetery-01 rules out the Galina/Hristina position swap', () => {
  assert.equal(solveLevel(cemeteryLevel).status, 'PROVEN_UNIQUE');

  const swappedRoleWorld = createEpistemicWorld(cemeteryLevel, 'watchman', 'hristina', 'galina');

  assert.equal(solveLevel(swappedRoleWorld).status, 'NO_SOLUTION');
});

test('cemetery-01 includes the static zone-neighbor clue in Zoya unary domain', () => {
  const zoya = checkPuzzleQuality(cemeteryLevel).perPerson.find((person) => person.personId === 'zoya');

  assert.ok(zoya);
  assert.equal(zoya.soloDomainSize, 22);
  assert.equal(zoya.fullyPinned, false);
});

test('cemetery-01 rejects every alternative watchman and murderer pairing', () => {
  const candidates = cemeteryLevel.people.map((person) => person.id);
  const report = checkHiddenRoleEpistemics(cemeteryLevel, 'watchman', candidates);

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.deepEqual(
    report.worlds.filter((world) => world.status !== 'NO_SOLUTION'),
    [],
  );
});
