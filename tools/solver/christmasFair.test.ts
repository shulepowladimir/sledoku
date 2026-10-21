import assert from 'node:assert/strict';
import { test } from 'node:test';
import { christmasFairLevel } from '../../levels/71-christmas-fair';
import { buildLevelIndex } from '../../src/engine/board';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { cellId } from '../../src/types/level';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

test('christmas-fair-01 meets the map, clue, and acceptance contract', () => {
  assert.equal(christmasFairLevel.meta.title, 'Переполох с подарками');
  assert.equal(christmasFairLevel.meta.theme, 'christmasFair');
  assert.equal(christmasFairLevel.size, 12);
  assert.equal(christmasFairLevel.cells.length, 144);
  assert.equal(christmasFairLevel.people.length, 12);

  const visiblePersonalClues = christmasFairLevel.clues.filter((clue) =>
    'subject' in clue && clue.subject.type === 'person',
  );
  const victim = christmasFairLevel.people.find((person) => person.isVictim)!;
  assert.equal(victim.id, 'khariton');
  assert.equal(visiblePersonalClues.some((clue) => clue.subject.id === victim.id), false);
  for (const person of christmasFairLevel.people.filter((entry) => !entry.isVictim)) {
    const count = visiblePersonalClues.filter((clue) => clue.subject.id === person.id).length;
    assert.ok(count >= 1 && count <= 3, `${person.name} has ${count} personal clues`);
  }
  assert.equal(generalCluesForDisplay(christmasFairLevel.clues).length, 0);

  assert.deepEqual(lintLevel(christmasFairLevel), []);
  const quality = checkPuzzleQuality(christmasFairLevel);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(christmasFairLevel, quality.fullyPinnedCount), []);

  const index = buildLevelIndex(christmasFairLevel);
  const murderScene = index.cellsById.get(christmasFairLevel.solution[victim.id])!.roomId;
  const murderer = christmasFairLevel.people.find((person) => person.isMurderer)!;
  assert.equal(murderer.id, 'zhanna');
  assert.equal(index.cellsById.get(christmasFairLevel.solution[murderer.id])!.roomId, murderScene);
  assert.equal(christmasFairLevel.people.filter((person) =>
    index.cellsById.get(christmasFairLevel.solution[person.id])!.roomId === murderScene,
  ).length, 2);
});

test('christmas-fair-01 applies the requested clue edits', () => {
  const clues = new Map(christmasFairLevel.clues.map((clue) => [clue.id, clue]));
  assert.equal(
    clues.get('cf-esenia-shared-vowel')?.text,
    'В зоне с Есенией был ещё хотя бы один человек на гласную букву.',
  );
  const aglayaViktor = clues.get('cf-aglaya-north-of-viktor');
  assert.equal(aglayaViktor?.type, 'relativePosition');
  assert.equal(aglayaViktor?.text, 'Аглая находилась севернее Виктора.');
  if (aglayaViktor?.type === 'relativePosition') assert.equal(aglayaViktor.minOffset, undefined);

  for (const removedId of [
    'cf-aglaya-odd-row',
    'cf-viktor-same-room-stand',
    'cf-zahar-odd-row',
    'cf-dmitry-south-of-galina',
    'cf-liudmila-sweets-row',
    'cf-liudmila-west-of-zahar',
    'cf-every-room-occupied',
    'cf-three-sleighs-empty',
  ]) {
    assert.equal(clues.has(removedId), false, `${removedId} should be removed`);
  }

  const liudmila = clues.get('cf-liudmila-no-sleigh-column');
  assert.equal(liudmila?.type, 'itemAbsentInLine');
  if (liudmila?.type === 'itemAbsentInLine') {
    assert.equal(liudmila.subject.id, 'liudmila');
    assert.equal(liudmila.itemTypeId, 'sleigh');
    assert.equal(liudmila.axis, 'col');
    assert.equal(liudmila.text, 'В столбце Людмилы не было саней.');
  }
});

test('christmas-fair-01 places garlands in the requested cells', () => {
  const garlands = christmasFairLevel.items
    .filter((item) => item.typeId === 'garland')
    .map((item) => [item.id, item.cells] as const);

  assert.deepEqual(garlands, [
    ['garland-plaza-ride', [cellId(5, 7), cellId(6, 7)]],
    ['garland-sweets-row', [cellId(2, 10), cellId(2, 11)]],
    ['garland-souvenir-north', [cellId(0, 10), cellId(0, 11)]],
    ['garland-single-1', [cellId(11, 1)]],
    ['garland-single-2', [cellId(0, 0)]],
    ['garland-single-3', [cellId(10, 0)]],
    ['garland-single-4', [cellId(7, 5)]],
  ]);

  const garlandType = christmasFairLevel.itemTypes.find((itemType) => itemType.id === 'garland');
  assert.equal(garlandType?.render, 'tile');
  assert.equal(garlandType?.tileEdgeDepth, false);
  assert.equal(christmasFairLevel.items.some((item) => item.typeId === 'shootingGallery'), false);
  assert.equal(christmasFairLevel.items.some((item) =>
    item.typeId === 'tree' && item.cells.includes(cellId(0, 0))), false);
  assert.equal(christmasFairLevel.items.some((item) =>
    item.typeId === 'trashcan' && item.cells.includes(cellId(11, 1))), false);
});

test('christmas-fair-01 has one placement solution and only Zhanna can be the murderer', () => {
  assert.equal(solveLevel(christmasFairLevel).status, 'PROVEN_UNIQUE');

  const report = checkMurdererEpistemics(christmasFairLevel);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 10);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
