import assert from 'node:assert/strict';
import { test } from 'node:test';
import { weddingLevel } from '../../levels/59-wedding';
import { buildLevelIndex } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { checkLevelAcceptance } from './acceptance';
import { checkPuzzleQuality } from './puzzleQuality';
import { computeUnaryDomain, solveLevel } from './solve';

const expectedMap = [
  'ZZAAAAAABB',
  'ZZAAAAAABB',
  'ZZAAAAAABB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZGGDDGGBB',
  'ZZZGGGGBBB',
  'ZZZEEEEBBB',
  'ZZZEEEEBBB',
];
const roomCode = new Map([
  ['west', 'Z'], ['altar', 'A'], ['east', 'B'],
  ['guests', 'G'], ['aisle', 'D'], ['entrance', 'E'],
]);

const roleCandidates = (gender: 'male' | 'female') =>
  weddingLevel.people.filter((person) => person.gender === gender).map((person) => person.id);

function roleWorld(brideId: string, groomId: string, murdererId: string) {
  return {
    ...weddingLevel,
    people: weddingLevel.people.map((person) => ({
      ...person,
      roles: [
        ...(person.roles ?? []).filter((role) => role !== 'bride' && role !== 'groom'),
        ...(person.id === brideId ? ['bride'] : []),
        ...(person.id === groomId ? ['groom'] : []),
      ],
      isMurderer: person.id === murdererId,
    })),
  };
}

test('wedding uses the approved 10x10 plan, cast, and point-symmetric couple', () => {
  assert.equal(weddingLevel.meta.id, 'wedding-01');
  assert.equal(weddingLevel.meta.title, 'Горько!');
  assert.equal(weddingLevel.size, 10);
  assert.equal(weddingLevel.cells.length, 100);
  assert.deepEqual(Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 10 }, (_, col) => weddingLevel.cells.find((cell) => cell.id === cellId(row, col))!.roomId)
      .map((roomId) => roomCode.get(roomId) ?? '?')
      .join(''),
  ), expectedMap);
  assert.equal(weddingLevel.people.length, 10);
  assert.equal(weddingLevel.people.filter((person) => person.gender === 'female').length, 5);
  assert.equal(weddingLevel.people.filter((person) => person.gender === 'male').length, 5);
  assert.equal(weddingLevel.rooms.find((room) => room.id === 'altar')?.floorTexture, 'marble');
  assert.equal(weddingLevel.rooms.find((room) => room.id === 'guests')?.floorTexture, 'wood');
  assert.equal(weddingLevel.rooms.find((room) => room.id === 'aisle')?.floorTexture, 'carpet');
  const rug = weddingLevel.floorFeatures?.find((feature) => feature.id === 'ceremony-rug');
  assert.equal(rug?.textureKey, 'carpet');
  for (let row = 2; row <= 7; row += 1) {
    for (const col of [4, 5]) {
      const cell = weddingLevel.cells.find((candidate) => candidate.id === cellId(row, col))!;
      const room = weddingLevel.rooms.find((candidate) => candidate.id === cell.roomId)!;
      const texture = cell.floorFeatureId
        ? weddingLevel.floorFeatures?.find((feature) => feature.id === cell.floorFeatureId)?.textureKey
        : room.floorTexture;
      assert.equal(texture, 'carpet', `the carpet path should be continuous at ${cell.id}`);
    }
  }

  const bride = weddingLevel.people.find((person) => person.roles?.includes('bride'))!;
  const groom = weddingLevel.people.find((person) => person.roles?.includes('groom'))!;
  const brideCell = weddingLevel.cells.find((cell) => cell.id === weddingLevel.solution[bride.id])!;
  const groomCell = weddingLevel.cells.find((cell) => cell.id === weddingLevel.solution[groom.id])!;
  const arch = weddingLevel.items.find((item) => item.id === 'flower-arch')!;
  const archCells = arch.cells.map((id) => weddingLevel.cells.find((cell) => cell.id === id)!);
  assert.equal(brideCell.row + groomCell.row, archCells[0].row + archCells[1].row);
  assert.equal(brideCell.col + groomCell.col, archCells[0].col + archCells[1].col);
  assert.equal(weddingLevel.people.find((person) => person.isVictim)?.initialLetter, 'Х');
});

test('wedding contains the approved item placements and exactly two occupied chairs', () => {
  const itemCells = (typeId: string) => weddingLevel.items
    .filter((item) => item.typeId === typeId)
    .flatMap((item) => item.cells)
    .sort();

  assert.deepEqual(itemCells('speaker'), [cellId(3, 3), cellId(3, 6)].sort());
  assert.deepEqual(itemCells('tree'), [cellId(1, 0), cellId(2, 9), cellId(4, 8), cellId(8, 1)].sort());
  assert.deepEqual(itemCells('broadleafTree'), [cellId(3, 1), cellId(6, 9)].sort());
  assert.deepEqual(itemCells('roseBush'), [cellId(1, 2), cellId(1, 7), cellId(6, 3), cellId(9, 8)].sort());
  assert.deepEqual(itemCells('bushHedge'), [cellId(3, 0), cellId(4, 0), cellId(8, 7), cellId(9, 7)].sort());
  assert.deepEqual(itemCells('chair'), [
    cellId(4, 2), cellId(4, 3), cellId(4, 6), cellId(4, 7),
    cellId(5, 2), cellId(5, 3), cellId(5, 6), cellId(5, 7),
    cellId(6, 2), cellId(6, 7),
  ].sort());
  const chairClue = weddingLevel.clues.find((clue) => clue.type === 'itemTypeFullyOccupied');
  assert.equal(chairClue?.vacancies, 8);
  assert.equal(chairClue?.text, 'Занятыми были ровно 2 стула.');
});

test('wedding applies the requested clue wording and omits the bride\'s ceremony room', () => {
  const cluesById = new Map(weddingLevel.clues.map((clue) => [clue.id, clue]));
  assert.equal(cluesById.has('wedding-vladimir-hedge-room'), false);
  assert.equal(cluesById.has('wedding-demyan-south-wall'), false);
  assert.equal(cluesById.has('wedding-boris-north-demyan'), false);
  assert.equal(cluesById.has('wedding-zoya-altar'), false);
  assert.equal(cluesById.get('wedding-demyan-entrance')?.text, 'Демьян находился на входе.');
  assert.equal(cluesById.get('wedding-igor-guests')?.text, 'Игорь находился в гостевой зоне.');
  assert.equal(cluesById.get('wedding-zoya-north-wall')?.text, 'Зоя находилась у северной стены.');
});

test('Галина is adjacent to both a fir and a vase with the intended three candidates', () => {
  const index = buildLevelIndex(weddingLevel);
  const domain = computeUnaryDomain(weddingLevel, index, weddingLevel.cells, 'galina');
  assert.deepEqual(new Set(domain), new Set([cellId(1, 9), cellId(8, 0), cellId(9, 1)]));
  assert.equal(weddingLevel.solution.galina, cellId(1, 9));
});

test('wedding explicitly accepts the approved 39% item/floor-feature density', () => {
  const occupiedCells = weddingLevel.items.reduce((count, item) => count + item.cells.length, 0)
    + weddingLevel.cells.filter((cell) => cell.floorFeatureId).length;
  assert.equal(occupiedCells, 39);
  assert.deepEqual(checkLevelAcceptance(weddingLevel, checkPuzzleQuality(weddingLevel).fullyPinnedCount), []);
});

test('symmetricPosition is load-bearing for the wedding-role deduction', () => {
  const withoutSymmetry = {
    ...weddingLevel,
    clues: weddingLevel.clues.filter((clue) => clue.type !== 'symmetricPosition'),
  };
  assert.notEqual(solveLevel(withoutSymmetry).status, 'PROVEN_UNIQUE');
});

test('the authored bride, groom, and murderer are the only jointly plausible hidden-role world', () => {
  const report = solveLevel(weddingLevel);
  assert.equal(report.status, 'PROVEN_UNIQUE');

  const brideCandidates = roleCandidates('female');
  const groomCandidates = roleCandidates('male');
  const murdererCandidates = weddingLevel.people.filter((person) => !person.isVictim).map((person) => person.id);
  assert.equal(brideCandidates.length, 5);
  assert.equal(groomCandidates.length, 5);
  assert.equal(murdererCandidates.length, 9);

  for (const brideId of brideCandidates) {
    for (const groomId of groomCandidates) {
      for (const murdererId of murdererCandidates) {
        const authored = brideId === 'zoya' && groomId === 'khariton' && murdererId === 'zoya';
        const result = solveLevel(roleWorld(brideId, groomId, murdererId));
        assert.equal(result.status, authored ? 'PROVEN_UNIQUE' : 'NO_SOLUTION', `${brideId}/${groomId}/${murdererId}`);
      }
    }
  }
});
