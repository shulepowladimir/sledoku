import assert from 'node:assert/strict';
import { test } from 'node:test';
import { golfClubLevel } from '../../levels/52-golfclub';
import { buildLevelIndex } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { evalClue, solveLevel } from './solve';

test('relativeToItemOccupant waits for other possible occupants in a partial assignment', () => {
  const clue = golfClubLevel.clues.find((candidate) => candidate.id === 'golf-zhanna-east-of-cart-player');
  assert.ok(clue);

  const index = buildLevelIndex(golfClubLevel);
  const partialAssignment = new Map([
    ['zhanna', cellId(10, 6)],
    ['dmitry', cellId(4, 9)],
  ]);
  const getCell = (personId: string) => partialAssignment.get(personId);

  assert.equal(evalClue(clue, getCell, golfClubLevel, index, false), undefined);
  assert.equal(
    evalClue(
      clue,
      (personId) => personId === 'artem' ? cellId(0, 5) : getCell(personId),
      golfClubLevel,
      index,
      true,
    ),
    true,
  );
});

test('golf club rejects the screenshot alternative while preserving a unique solution', () => {
  const screenshotAssignment = new Map([
    ['artem', cellId(0, 5)],
    ['beata', cellId(1, 7)],
    ['vadim', cellId(2, 0)],
    ['gelena', cellId(9, 11)],
    ['dmitry', cellId(4, 9)],
    ['egor', cellId(3, 3)],
    ['zhanna', cellId(10, 6)],
    ['harita', cellId(5, 2)],
    ['klim', cellId(6, 1)],
    ['zahar', cellId(8, 8)],
    ['ida', cellId(7, 4)],
    ['lidiya', cellId(11, 10)],
  ]);
  const index = buildLevelIndex(golfClubLevel);
  const getCell = (personId: string) => screenshotAssignment.get(personId);
  const violatedClues = golfClubLevel.clues
    .filter((clue) => evalClue(clue, getCell, golfClubLevel, index, true) === false)
    .map((clue) => clue.id);

  assert.deepEqual(violatedClues, ['golf-ida-east-of-artem']);
  assert.equal(solveLevel(golfClubLevel).status, 'PROVEN_UNIQUE');
});

test('golf club leaves no alternative murderer when placements remain free', () => {
  assert.equal(solveLevel(golfClubLevel).status, 'PROVEN_UNIQUE');

  for (const candidate of golfClubLevel.people.filter((person) => !person.isVictim)) {
    const world = {
      ...golfClubLevel,
      people: golfClubLevel.people.map((person) => ({
        ...person,
        isMurderer: person.id === candidate.id,
      })),
    };
    const result = solveLevel(world);

    assert.equal(result.status, candidate.isMurderer ? 'PROVEN_UNIQUE' : 'NO_SOLUTION',
      `${candidate.name} must not remain a possible murderer; solver returned ${JSON.stringify(result)}`);
  }
});
