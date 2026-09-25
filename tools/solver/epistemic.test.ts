import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PersonId } from '../../src/types/level';
import { fightClubLevel } from '../../levels/40-fightclub';
import { bakeryLevel } from '../../levels/51-bakery';
import { checkHiddenRoleEpistemics, createEpistemicWorld } from './epistemic';
import { solveLevel } from './solve';

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

test('bakery deduction rejects every alternative murderer, including Boris', () => {
  assert.equal(solveLevel(bakeryLevel).status, 'PROVEN_UNIQUE');

  const groupedBoundaryClues = bakeryLevel.clues.filter(
    (clue) => clue.groupId === 'bakery-vasilisa-two-zones',
  );
  assert.equal(groupedBoundaryClues.length, 2);
  assert.ok(groupedBoundaryClues.every(
    (clue) => clue.type === 'zoneBoundary' && clue.subject.type === 'person' && clue.subject.id === 'vasilisa',
  ));
  assert.deepEqual(
    groupedBoundaryClues.map((clue) => clue.type === 'zoneBoundary' ? [clue.roomId, clue.otherRoomId] : null),
    [['cashier', 'bakery'], ['cashier', 'service']],
  );
  assert.ok(groupedBoundaryClues.every((clue) =>
    clue.text === 'Василиса соседствовала с двумя другими зонами.',
  ));

  for (const candidate of bakeryLevel.people.filter((person) => !person.isVictim)) {
    const world = {
      ...bakeryLevel,
      people: bakeryLevel.people.map((person) => ({
        ...person,
        isMurderer: person.id === candidate.id,
      })),
    };

    const result = solveLevel(world);
    assert.equal(result.status, candidate.isMurderer ? 'PROVEN_UNIQUE' : 'NO_SOLUTION',
      `${candidate.name} must not remain a possible murderer; solver returned ${JSON.stringify(result)}`);
  }
});
