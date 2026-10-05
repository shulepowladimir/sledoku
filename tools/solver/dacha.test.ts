import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameLevels } from '../../levels';
import { dachaLevel } from '../../levels/62-dacha';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { cellId, parseCellId, type PersonId } from '../../src/types/level';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue, solveLevel } from './solve';

test('Шесть соток preserves the approved 6x6 map, room textures, and cast positions', () => {
  assert.equal(dachaLevel.meta.id, 'dacha-01');
  assert.equal(dachaLevel.meta.title, 'Шесть соток');
  assert.equal(dachaLevel.meta.theme, 'dacha');
  assert.equal(dachaLevel.size, 6);
  assert.ok(gameLevels.some((level) => level === dachaLevel), 'the level must be registered');

  const roomById = new Map(dachaLevel.rooms.map((room) => [room.id, room]));
  assert.deepEqual(
    [...roomById.values()].map(({ id, name, floorTexture }) => ({ id, name, floorTexture })),
    [
      { id: 'plot', name: 'Участок', floorTexture: 'grass' },
      { id: 'house', name: 'Домик', floorTexture: 'wood' },
      { id: 'greenhouse', name: 'Теплица', floorTexture: 'marble' },
      { id: 'toilet', name: 'Туалет', floorTexture: 'stairs' },
    ],
  );

  const roomCodes: Record<string, string> = {
    plot: 'P',
    house: 'H',
    greenhouse: 'G',
    toilet: 'T',
  };
  const rows = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => roomCodes[dachaLevel.cells.find((cell) => cell.id === cellId(row, col))!.roomId]).join(''),
  );
  assert.deepEqual(rows, ['PPHHHH', 'PPHHHH', 'PPHHHH', 'GPPPPP', 'GGGPTT', 'GPPPTT']);

  const solution = {
    aglaya: cellId(1, 1),
    boris: cellId(2, 3),
    vladimir: cellId(3, 2),
    demid: cellId(4, 0),
    galina: cellId(5, 4),
    harita: cellId(0, 5),
  };
  assert.deepEqual(dachaLevel.solution, solution);
  assert.equal(dachaLevel.cells.length, 36);
  const coordinates = Object.values(dachaLevel.solution).map(parseCellId);
  assert.deepEqual(coordinates.map(({ row }) => row).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(coordinates.map(({ col }) => col).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
});

test('garden beds are decorative polyominoes and the pits use a separate dirt floor feature', () => {
  const gardenBed = dachaLevel.itemTypes.find((itemType) => itemType.id === 'gardenBed');
  assert.ok(gardenBed);
  assert.equal(gardenBed.kind, 'decorative');
  assert.equal(gardenBed.render, 'tile');
  assert.equal(gardenBed.tileEdgeDepth, false);

  const beds = dachaLevel.items.filter((item) => item.typeId === 'gardenBed');
  assert.ok(beds.length >= 2);
  assert.ok(beds.every((bed) => bed.cells.length > 1));

  assert.deepEqual(dachaLevel.floorFeatures, [{ id: 'pit', label: 'Яма', textureKey: 'dirt' }]);
  assert.ok(dachaLevel.cells.filter((cell) => cell.floorFeatureId === 'pit').length >= 2);

  const outhouse = dachaLevel.itemTypes.find((itemType) => itemType.id === 'outhouseToilet');
  assert.ok(outhouse);
  assert.equal(outhouse.kind, 'occupiable');

  const houseCells = new Set(dachaLevel.cells.filter((cell) => cell.roomId === 'house').map((cell) => cell.id));
  for (const itemTypeId of ['chair', 'sofa']) {
    const itemType = dachaLevel.itemTypes.find((candidate) => candidate.id === itemTypeId);
    const matchingItems = dachaLevel.items.filter((candidate) => candidate.typeId === itemTypeId);
    const [item] = matchingItems;
    assert.equal(itemType?.kind, 'occupiable');
    assert.equal(matchingItems.length, 1);
    assert.equal(item?.cells.length, 1);
    assert.ok(item && houseCells.has(item.cells[0]), `${itemTypeId} must be in the house`);
    assert.ok(item && !Object.values(dachaLevel.solution).includes(item.cells[0]), `${itemTypeId} must not cover an authored placement`);
  }
});

test('all authored clues are personal and no person receives more than three', () => {
  assert.ok(dachaLevel.clues.every((clue) => 'subject' in clue && clue.subject.type === 'person'));
  const clueCounts = new Map<string, number>();
  for (const clue of dachaLevel.clues) {
    if ('subject' in clue && clue.subject.type === 'person') {
      clueCounts.set(clue.subject.id, (clueCounts.get(clue.subject.id) ?? 0) + 1);
    }
  }
  assert.ok(dachaLevel.people.filter((person) => !person.isVictim).every((person) => clueCounts.has(person.id)));
  assert.ok([...clueCounts.values()].every((count) => count <= 3));
});

test('Аглая and Владимир remain ambiguous until clues about the rest of the cast are used', () => {
  const index = buildLevelIndex(dachaLevel);
  const legalCells = dachaLevel.cells.filter((cell) => isLegalTarget(index, dachaLevel, cell.id));
  const pairClues = dachaLevel.clues.filter(
    (clue) =>
      'subject' in clue &&
      clue.subject.type === 'person' &&
      ['aglaya', 'vladimir'].includes(clue.subject.id),
  );
  let compatiblePairs = 0;

  for (const aglayaCell of legalCells) {
    for (const vladimirCell of legalCells) {
      if (
        aglayaCell.row === vladimirCell.row ||
        aglayaCell.col === vladimirCell.col ||
        aglayaCell.id === vladimirCell.id
      ) {
        continue;
      }
      const placements = new Map<PersonId, (typeof aglayaCell.id)>([
        ['aglaya', aglayaCell.id],
        ['vladimir', vladimirCell.id],
      ]);
      const getCell = (personId: PersonId) => placements.get(personId);
      if (pairClues.every((clue) => evalClue(clue, getCell, dachaLevel, index, true) === true)) {
        compatiblePairs++;
      }
    }
  }

  assert.ok(
    compatiblePairs >= 5,
    `Their own clues and the row/column rule should leave at least five pairs; found ${compatiblePairs}.`,
  );
});

test('the reduced personal clue set uses the explicit balance exemption', () => {
  assert.equal(dachaLevel.clues.length, 7);
  assert.equal(dachaLevel.meta.clueBalanceExempt, true);
  assert.ok(dachaLevel.clues.every((clue) => 'subject' in clue && clue.subject.type === 'person'));
});

test('the Аглая—Владимир relation is needed to exclude alternate murderer worlds', () => {
  const withoutRelation = {
    ...dachaLevel,
    clues: dachaLevel.clues.filter((clue) => clue.id !== 'dacha-aglaya-north-vladimir'),
  };
  const authoredWorld = checkMurdererEpistemics(dachaLevel);
  const alternativeWorldsWithoutRelation = checkMurdererEpistemics(withoutRelation).worlds.filter(
    (world) => world.murdererId !== 'boris',
  );

  assert.equal(authoredWorld.baseline, 'PROVEN_UNIQUE');
  assert.ok(authoredWorld.worlds.filter((world) => world.murdererId !== 'boris').every((world) => world.status === 'NO_SOLUTION'));
  assert.ok(alternativeWorldsWithoutRelation.some((world) => world.status !== 'NO_SOLUTION'));
});

test('Борис is the only person with жертва Харита and the victim has no authored clues', () => {
  const victim = dachaLevel.people.find((person) => person.isVictim);
  const murderer = dachaLevel.people.find((person) => person.isMurderer);
  assert.equal(victim?.id, 'harita');
  assert.equal(victim?.initialLetter, 'Х');
  assert.equal(murderer?.id, 'boris');
  assert.equal(murderer?.initialLetter, 'Б');

  const cellsById = new Map(dachaLevel.cells.map((cell) => [cell.id, cell]));
  assert.equal(cellsById.get(dachaLevel.solution.harita)?.roomId, 'house');
  assert.equal(cellsById.get(dachaLevel.solution.boris)?.roomId, 'house');
  assert.equal(
    dachaLevel.people.filter((person) => cellsById.get(dachaLevel.solution[person.id])?.roomId === 'house').length,
    2,
  );
  assert.ok(dachaLevel.clues.every((clue) => !JSON.stringify(clue).includes('harita')));
});

test('Шесть соток passes quality, density, unique-placement, and murderer-epistemic gates', () => {
  assert.deepEqual(lintLevel(dachaLevel), []);

  const quality = checkPuzzleQuality(dachaLevel);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.ok(quality.perPerson.every((person) => person.soloDomainSize >= 3));
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(dachaLevel, quality.fullyPinnedCount), []);
  assert.equal(dachaLevel.meta.maxFullyPinnedPeople, 0);
  assert.ok(
    (dachaLevel.items.reduce((count, item) => count + item.cells.length, 0)
      + dachaLevel.cells.filter((cell) => cell.floorFeatureId).length) / dachaLevel.cells.length >= 0.4,
  );

  assert.equal(solveLevel(dachaLevel).status, 'PROVEN_UNIQUE');
  const murdererReport = checkMurdererEpistemics(dachaLevel);
  assert.equal(murdererReport.baseline, 'PROVEN_UNIQUE');
  assert.ok(murdererReport.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
