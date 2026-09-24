import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resortLevel } from '../../levels/45-resort';
import { checkHiddenRoleEpistemics } from './epistemic';

const animatorCandidates = resortLevel.people.map((person) => person.id);

test('resort-01 hides one animator who is provably not the murderer', () => {
  const report = checkHiddenRoleEpistemics(resortLevel, 'animator', animatorCandidates);
  const alternatives = report.worlds.filter((world) => world.status !== 'NO_SOLUTION');

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 109);
  assert.deepEqual(
    alternatives.map((world) => `${world.roleHolderId}/${world.murdererId}:${world.status}`),
    [],
  );

  const animator = resortLevel.people.find((person) => person.roles?.includes('animator'));
  const murderer = resortLevel.people.find((person) => person.isMurderer);
  assert.ok(animator);
  assert.ok(murderer);
  assert.notEqual(animator.id, murderer.id);
});

test('resort-01 keeps common clues concise and uses distinct bungalow/terrace clues', () => {
  const commonClues = resortLevel.clues.filter((clue) => !('subject' in clue) || clue.subject.type === 'role');
  const bellaClue = resortLevel.clues.find((clue) => clue.id === 'rs-bella-bungalow');
  const demyanClue = resortLevel.clues.find((clue) => clue.id === 'rs-demyan-terrace');

  assert.equal(commonClues.length, 4);
  assert.equal(bellaClue?.type, 'roomMembership');
  assert.equal(demyanClue?.type, 'roomMembership');
  assert.equal(JSON.stringify(resortLevel.clues).includes('"hristina"'), false);
  assert.equal(resortLevel.items.some((item) => item.id === 'item-suitcase-bungalow'), true);
  assert.equal(resortLevel.cells.filter((cell) => cell.floorFeatureId === 'aquaWater').length, 4);

  const itemCells = resortLevel.items.flatMap((item) => item.cells);
  assert.equal(new Set(itemCells).size, itemCells.length);
});
