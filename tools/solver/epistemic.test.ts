import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PersonId } from '../../src/types/level';
import { fightClubLevel } from '../../levels/40-fightclub';
import { checkHiddenRoleEpistemics, createEpistemicWorld } from './epistemic';

const judgeCandidates = [
  'andrey',
  'boris',
  'veronika',
  'grigory',
  'darya',
  'efim',
  'zhanna',
  'khariton',
] satisfies PersonId[];

test('epistemic world changes only the selected hidden role and murderer', () => {
  const world = createEpistemicWorld(fightClubLevel, 'judge', 'andrey', 'boris');
  const andrey = world.people.find((person) => person.id === 'andrey')!;
  const boris = world.people.find((person) => person.id === 'boris')!;
  const grigory = world.people.find((person) => person.id === 'grigory')!;

  assert.deepEqual(andrey.roles, ['veteran', 'judge']);
  assert.deepEqual(boris.roles, ['veteran']);
  assert.deepEqual(grigory.roles, ['veteran']);
  assert.equal(boris.isMurderer, true);
  assert.equal(grigory.isMurderer, false);
  assert.equal(world.clues, fightClubLevel.clues);
  assert.equal(world.solution, fightClubLevel.solution);
});

test('fight-club judge deduction rejects every alternative role/murderer world', () => {
  const report = checkHiddenRoleEpistemics(fightClubLevel, 'judge', judgeCandidates);
  const alternatives = report.worlds.filter((world) => world.status !== 'NO_SOLUTION');

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 55);
  assert.deepEqual(
    alternatives.map((world) => `${world.roleHolderId}/${world.murdererId}:${world.status}${world.reason ? ` (${world.reason})` : ''}`),
    [],
  );
});
