import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cellId, type PersonId } from '../../src/types/level';
import { fightClubLevel } from '../../levels/40-fightclub';
import { bakeryLevel } from '../../levels/51-bakery';
import { trailerParkLevel } from '../../levels/56-trailerpark';
import { wildwest2Level } from '../../levels/14-wildwest2';
import {
  checkMurdererEpistemics,
  checkHiddenRoleEpistemics,
  checkHiddenVictimEpistemics,
  createEpistemicWorld,
  createHiddenVictimWorld,
  createMurdererWorld,
} from './epistemic';
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

test('hidden-victim world changes only the selected victim and murderer', () => {
  const world = createHiddenVictimWorld(bakeryLevel, 'boris', 'vasilisa');
  const boris = world.people.find((person) => person.id === 'boris')!;
  const khariton = world.people.find((person) => person.id === 'khariton')!;
  const vasilisa = world.people.find((person) => person.id === 'vasilisa')!;

  assert.equal(boris.isVictim, true);
  assert.equal(khariton.isVictim, false);
  assert.equal(vasilisa.isMurderer, true);
  assert.equal(world.people.find((person) => person.id === 'esenya')?.isMurderer, false);
  assert.equal(world.clues, bakeryLevel.clues);
  assert.equal(world.solution, bakeryLevel.solution);
});

test('hidden-victim epistemics enumerates candidate victim and murderer pairs', () => {
  const level = {
    ...bakeryLevel,
    meta: { ...bakeryLevel.meta, victimIdentityHidden: true },
  };
  const candidates = level.people.map((person) => person.id);
  const report = checkHiddenVictimEpistemics(level, candidates);

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 41);
  assert.deepEqual(
    report.worlds
      .filter((world) => world.status !== 'NO_SOLUTION')
      .map((world) => `${world.victimId}/${world.murdererId}:${world.status}`)
      .sort(),
    [
      'boris/vasilisa:PROVEN_UNIQUE',
      'denis/gennady:PROVEN_UNIQUE',
      'esenya/khariton:PROVEN_UNIQUE',
      'gennady/denis:PROVEN_UNIQUE',
      'vasilisa/boris:PROVEN_UNIQUE',
    ],
  );
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

test('murderer epistemics checks every suspect after redundant clue removal', () => {
  assert.ok(!trailerParkLevel.clues.some((clue) =>
    clue.id === 'tp-zoya-cactus-line' || clue.id === 'tp-esenya-near-barbecue'));

  const world = createMurdererWorld(trailerParkLevel, 'viktor');
  assert.equal(world.people.find((person) => person.id === 'viktor')?.isMurderer, true);
  assert.equal(world.people.find((person) => person.id === 'zoya')?.isMurderer, false);
  assert.equal(world.clues, trailerParkLevel.clues);
  assert.equal(world.solution, trailerParkLevel.solution);

  const currentReport = checkMurdererEpistemics(trailerParkLevel);
  assert.equal(currentReport.baseline, 'PROVEN_UNIQUE');
  assert.equal(currentReport.worlds.length, 9);
  assert.ok(currentReport.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('wildwest-02 replaces the street urn with two tumbleweeds and stays uniquely solvable', () => {
  const itemAt = (row: number, col: number) => wildwest2Level.items.find((item) => item.cells.includes(cellId(row, col)));

  assert.equal(itemAt(6, 8)?.typeId, 'tumbleweed');
  assert.equal(itemAt(6, 3)?.typeId, 'tumbleweed');
  assert.equal(wildwest2Level.items.filter((item) => item.typeId === 'tumbleweed').length, 2);
  assert.ok(!wildwest2Level.items.some((item) => item.typeId === 'trashcan'));
  assert.ok(!wildwest2Level.itemTypes.some((itemType) => itemType.id === 'trashcan'));
  assert.equal(solveLevel(wildwest2Level).status, 'PROVEN_UNIQUE');
});
