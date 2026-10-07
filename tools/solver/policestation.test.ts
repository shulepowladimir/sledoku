import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameLevels } from '../../levels';
import { cellId, type Level, type PersonId } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { computeUnaryDomain, solveLevel } from './solve';

const roomRows = [
  'RRRCCCOOO',
  'RRRCCCCOO',
  'IICCCCCQQ',
  'IIICCCQQQ',
  'IIICCCQQQ',
  'AAACCCQQH',
  'BBAAACCHH',
  'BBBAACCHH',
  'BBBBAAHHH',
];

const expectedSolution: Record<PersonId, string> = {
  anfisa: cellId(3, 6),
  borislav: cellId(0, 8),
  vlada: cellId(2, 5),
  guriy: cellId(4, 1),
  darya: cellId(7, 2),
  egor: cellId(1, 0),
  zhanna: cellId(8, 3),
  zoya: cellId(6, 4),
  khariton: cellId(5, 7),
};

function policeStationLevel(): Level {
  const level = gameLevels.find((candidate) => candidate.meta.id === 'policestation-01');
  assert.ok(level, 'expected policestation-01 in the player-facing level catalog');
  return level;
}

function roomAt(level: Level, id: string): string {
  return level.cells.find((cell) => cell.id === id)!.roomId;
}

function isRoomConnected(level: Level, roomId: string): boolean {
  const cells = level.cells.filter((cell) => cell.roomId === roomId);
  const visited = new Set([cells[0]?.id]);
  const queue = [cells[0]].filter((cell) => cell != null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of cells) {
      const distance = Math.abs(neighbor.row - current.row) + Math.abs(neighbor.col - current.col);
      if (distance !== 1 || visited.has(neighbor.id)) continue;
      visited.add(neighbor.id);
      queue.push(neighbor);
    }
  }

  return visited.size === cells.length;
}

function jointRoleWorld(level: Level, chiefId: PersonId, criminalId: PersonId, murdererId: PersonId): Level {
  return {
    ...level,
    people: level.people.map((person) => {
      const roles = (person.roles ?? []).filter((role) => role !== 'chief' && role !== 'criminal');
      if (person.id === chiefId) roles.push('chief');
      if (person.id === criminalId) roles.push('criminal');
      return { ...person, roles, isMurderer: person.id === murdererId };
    }),
  };
}

test('Police Station is registered as a player-facing level', () => {
  const level = policeStationLevel();

  assert.equal(level.meta.title, 'Участок 99');
  assert.equal(level.size, 9);
  assert.equal(level.people.length, 9);
  assert.equal(level.rooms.length, 8);
  assert.deepEqual(level.solution, expectedSolution);

  const roomSymbols = {
    reception: 'R',
    corridor: 'C',
    chiefOffice: 'O',
    investigators: 'I',
    interrogation: 'Q',
    archive: 'A',
    holding: 'H',
    briefing: 'B',
  };
  const actualRows = Array.from({ length: level.size }, (_, row) =>
    Array.from({ length: level.size }, (_, col) => {
      const roomId = roomAt(level, cellId(row, col));
      return roomSymbols[roomId as keyof typeof roomSymbols];
    }).join(''),
  );

  assert.deepEqual(actualRows, roomRows);
  assert.ok(level.rooms.every((room) => isRoomConnected(level, room.id)));
  assert.deepEqual(level.people.map((person) => person.initialLetter), ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'Х']);

  const solutionRows = Object.values(level.solution).map((id) => id.split('-')[0]);
  const solutionCols = Object.values(level.solution).map((id) => id.split('-')[1]);
  assert.equal(new Set(solutionRows).size, level.size);
  assert.equal(new Set(solutionCols).size, level.size);
});

test('the authored hidden roles and crime scene follow the approved brief', () => {
  const level = policeStationLevel();
  const peopleById = new Map(level.people.map((person) => [person.id, person]));
  const officers = level.people.filter((person) => person.roles?.includes('officer'));
  const visitors = level.people.filter((person) => person.roles?.includes('visitor'));
  const victim = peopleById.get('khariton')!;
  const murderer = peopleById.get('anfisa')!;
  const chiefRule = level.clues.find((clue) => clue.id === 'ps-chief-office');
  const criminalRule = level.clues.find((clue) => clue.id === 'ps-criminal-evidence');
  const zhannaRule = level.clues.find((clue) => clue.id === 'ps-zhanna-south-of-criminal');
  const zhannaVariationRule = level.clues.find((clue) => clue.id === 'ps-zhanna-not-computer');
  const displayedGeneralClues = generalCluesForDisplay(level.clues);

  assert.deepEqual(officers.map((person) => person.id), ['anfisa', 'borislav', 'vlada', 'guriy']);
  assert.deepEqual(visitors.map((person) => person.id), ['darya', 'egor', 'zhanna', 'zoya', 'khariton']);
  assert.deepEqual(level.people.filter((person) => person.roles?.includes('chief')).map((person) => person.id), ['borislav']);
  assert.deepEqual(level.people.filter((person) => person.roles?.includes('criminal')).map((person) => person.id), ['darya']);
  assert.equal(murderer.isMurderer, true);
  assert.equal(victim.isVictim, true);
  assert.notEqual(murderer.id, 'darya', 'the authored criminal is not the murderer');
  assert.equal(roomAt(level, level.solution.borislav), 'chiefOffice');
  assert.equal(roomAt(level, level.solution.anfisa), 'interrogation');
  assert.equal(roomAt(level, level.solution.khariton), 'interrogation');
  assert.equal(level.people.filter((person) => roomAt(level, level.solution[person.id]) === 'interrogation').length, 2);

  assert.ok(chiefRule?.type === 'roomMembership');
  assert.deepEqual(chiefRule.subject, { type: 'role', role: 'chief' });
  assert.equal(chiefRule.roomId, 'chiefOffice');
  assert.ok(criminalRule?.type === 'adjacency');
  assert.deepEqual(criminalRule.subject, { type: 'role', role: 'criminal' });
  assert.equal(criminalRule.itemTypeId, 'evidenceBag');
  assert.equal(displayedGeneralClues.length, 3);
  assert.deepEqual(displayedGeneralClues.map((clue) => clue.text), [
    'Все с Анфисы по Гурия были полицейскими, остальные — посетителями.',
    'Среди полицейских был шеф полиции, а среди посетителей — преступник. Они могли быть или не быть убийцами.',
    'Шеф находился в своём кабинете, а преступник был рядом с пакетом улик.',
  ]);
  assert.ok(!level.clues.some((clue) => clue.id === 'ps-officer-areas' || clue.id === 'ps-visitors-out-of-offices'));
  assert.ok(zhannaRule?.type === 'relativePosition');
  assert.deepEqual(zhannaRule.subject, { type: 'person', id: 'zhanna' });
  assert.equal(zhannaRule.otherRole, 'criminal');
  assert.equal(zhannaRule.axis, 'row');
  assert.equal(zhannaRule.direction, 'after');
  assert.equal(zhannaRule.text, 'Жанна находилась южнее преступника.');
  assert.ok(zhannaVariationRule?.type === 'adjacency');
  assert.equal(zhannaVariationRule.itemTypeId, 'computer');
  assert.equal(zhannaVariationRule.negated, true);
  assert.ok(!level.clues.some((clue) => clue.id === 'ps-darya-evidence' || clue.id === 'ps-zhanna-corridor-evidence'));
  assert.ok(displayedGeneralClues.every((clue) => !clue.text.includes(victim.name)));
  assert.ok(level.clues.every((clue) =>
    !('subject' in clue) || clue.subject.type !== 'person' || clue.subject.id !== victim.id,
  ));

  const index = buildLevelIndex(level);
  const legalCells = level.cells.filter((cell) => isLegalTarget(index, level, cell.id));
  const officersWithChiefOfficeCandidates = officers.filter((person) =>
    computeUnaryDomain(level, index, legalCells, person.id).some((cellId) => roomAt(level, cellId) === 'chiefOffice'),
  );
  assert.ok(officersWithChiefOfficeCandidates.length >= 2, 'the chief-room clue must distinguish among multiple eligible officers');

  const personalClueCounts = level.people.map((person) => level.clues.filter((clue) =>
    'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
  ).length);
  assert.ok(personalClueCounts.every((count) => count <= 3));
});

test('the authored police-station solution passes all level acceptance budgets', () => {
  const level = policeStationLevel();
  const quality = checkPuzzleQuality(level);
  const occupiedCells = level.items.reduce((count, item) => count + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length;

  assert.equal(level.meta.maxFullyPinnedPeople, 0);
  assert.ok(occupiedCells / level.cells.length >= 0.4);
  assert.deepEqual(lintLevel(level), []);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
});

test('only the authored joint chief, criminal, and murderer world is player-plausible', () => {
  const level = policeStationLevel();
  const chiefCandidates = level.people.filter((person) => person.roles?.includes('officer'));
  const criminalCandidates = level.people.filter((person) => person.roles?.includes('visitor'));
  const murdererCandidates = level.people.filter((person) => !person.isVictim);
  const authoredChief = level.people.find((person) => person.roles?.includes('chief'))!.id;
  const authoredCriminal = level.people.find((person) => person.roles?.includes('criminal'))!.id;
  const authoredMurderer = level.people.find((person) => person.isMurderer)!.id;
  const alternativeWorlds = chiefCandidates.flatMap((chief) => criminalCandidates.flatMap((criminal) =>
    murdererCandidates.flatMap((murderer) => {
      if (chief.id === authoredChief && criminal.id === authoredCriminal && murderer.id === authoredMurderer) return [];
      return [{ chief: chief.id, criminal: criminal.id, murderer: murderer.id }];
    }),
  ));
  const invalidWorlds = alternativeWorlds.map((world) => ({
    ...world,
    status: solveLevel(jointRoleWorld(level, world.chief, world.criminal, world.murderer)).status,
  })).filter((world) => world.status !== 'NO_SOLUTION');

  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
  assert.equal(alternativeWorlds.length, 159);
  assert.deepEqual(invalidWorlds, []);

  for (const removedClueId of ['ps-chief-office', 'ps-criminal-evidence']) {
    const withoutSpatialClue: Level = {
      ...level,
      clues: level.clues.filter((clue) => clue.id !== removedClueId),
    };
    assert.ok(alternativeWorlds.some((world) =>
      solveLevel(jointRoleWorld(withoutSpatialClue, world.chief, world.criminal, world.murderer)).status !== 'NO_SOLUTION',
    ), `${removedClueId} must eliminate alternative role worlds`);
  }
});

test('only the authored murderer is consistent when all hidden roles are held at the solution', () => {
  const report = checkMurdererEpistemics(policeStationLevel());

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, policeStationLevel().people.length - 2);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
