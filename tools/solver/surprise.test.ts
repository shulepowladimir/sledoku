import assert from 'node:assert/strict';
import { test } from 'node:test';
import { levels } from '../../levels';
import { checkMurdererEpistemics } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

const level = levels.find((candidate) => candidate.meta.id === 'case-57');

test('case 57 has a spoiler-neutral menu card and a setting unique to this level', () => {
  assert.ok(level, 'case-57 must be registered');
  assert.equal(level.meta.title, 'Дело №57');
  assert.equal(level.meta.theme, 'case57');
  assert.ok(
    levels.filter((candidate) => candidate.meta.id !== level.meta.id)
      .every((candidate) => candidate.meta.theme !== level.meta.theme),
    'case-57 must introduce a setting not used by any existing level',
  );
  assert.equal(level.clues.filter((clue) => !('subject' in clue)).length, 2);
  assert.ok(level.clues.every((clue) => !('subject' in clue) || clue.subject.type !== 'person' || clue.subject.id !== 'khariton'));
});

test('case 57 has a fair, uniquely deducible solution without fully pinned people', () => {
  assert.ok(level, 'case-57 must be registered');
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const quality = checkPuzzleQuality(level);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);

  const report = checkMurdererEpistemics(level);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('case 57 keeps the victim clue-free and the crime-room pair isolated', () => {
  assert.ok(level, 'case-57 must be registered');

  const victim = level.people.find((person) => person.isVictim);
  const murderer = level.people.find((person) => person.isMurderer);
  assert.ok(victim);
  assert.ok(murderer);
  assert.ok(level.clues.every((clue) => !('subject' in clue) || clue.subject.type !== 'person' || clue.subject.id !== victim.id));

  const roomByCell = new Map(level.cells.map((cell) => [cell.id, cell.roomId]));
  const victimRoom = roomByCell.get(level.solution[victim.id]);
  const roomOccupants = level.people.filter((person) => roomByCell.get(level.solution[person.id]) === victimRoom);
  assert.deepEqual(
    roomOccupants.map((person) => person.id).sort(),
    [victim.id, murderer.id].sort(),
  );
});
