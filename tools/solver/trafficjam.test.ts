import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { trafficJamLevel } from '../../levels/69-trafficjam';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue, solveLevel } from './solve';

test('trafficjam-01 is titled and rated as approved', () => {
  assert.equal(trafficJamLevel.meta.title, 'Пробка 10 баллов');
  assert.equal(trafficJamLevel.meta.difficulty, 10);
});

test('trafficjam-01 preserves its 10x10 map, cast placements, and traffic item footprints', () => {
  const level = trafficJamLevel;
  assert.equal(level.size, 10);
  assert.equal(level.cells.length, 100);
  const roomCode: Record<string, string> = {
    'upper-shoulder': '1',
    'exit-ramp': 'С',
    'northbound-lanes': 'П',
    divider: 'Р',
    'southbound-lanes': 'Л',
    'lower-shoulder': '2',
  };
  assert.deepEqual(Array.from({ length: 10 }, (_, row) => level.cells
    .filter((cell) => cell.row === row)
    .sort((a, b) => a.col - b.col)
    .map((cell) => roomCode[cell.roomId])
    .join('')), [
    '111111111С',
    '11111111СС',
    'ППППППППСС',
    'ППППППППСС',
    'РРРРРРРРРР',
    'РРРРРРРРРР',
    'ЛЛЛЛЛЛЛЛЛЛ',
    'ЛЛЛЛЛЛЛЛЛЛ',
    '2222222222',
    '2222222222',
  ]);
  assert.deepEqual(level.solution, {
    anna: cellId(1, 9),
    boris: cellId(0, 4),
    vera: cellId(3, 6),
    galina: cellId(4, 1),
    dmitry: cellId(5, 8),
    egor: cellId(2, 0),
    zhanna: cellId(7, 3),
    ivan: cellId(6, 2),
    kirill: cellId(9, 7),
    khariton: cellId(8, 5),
  });

  for (const personId of ['anna', 'egor', 'ivan']) {
    const cell = level.cells.find((entry) => entry.id === level.solution[personId]);
    assert.ok(cell?.itemId, `${personId} is on an occupiable vehicle`);
    const item = level.items.find((entry) => entry.id === cell.itemId);
    assert.equal(item?.typeId, 'car');
    assert.equal(level.itemTypes.find((entry) => entry.id === item.typeId)?.kind, 'occupiable');
  }
  const zhannaCell = level.cells.find((entry) => entry.id === level.solution.zhanna);
  assert.equal(zhannaCell?.itemId, 'south-motorcycle');
  assert.equal(level.itemTypes.find((entry) => entry.id === 'motorcycle')?.kind, 'occupiable');

  const treeType = level.itemTypes.find((type) => type.id === 'tree');
  assert.equal(treeType?.label, 'Дерево');
  assert.ok(!level.itemTypes.some((type) => type.id === 'broadleafTree'));
  assert.deepEqual(
    level.items.filter((item) => item.typeId === 'tree').map((item) => item.iconVariant).sort(),
    [undefined, undefined, 'broadleafTree', 'broadleafTree'].sort(),
  );
  const tractor = level.itemTypes.find((type) => type.id === 'tractor');
  assert.equal(tractor?.kind, 'occupiable');
  const index = buildLevelIndex(level);
  assert.ok(isLegalTarget(index, level, cellId(4, 3)));
  assert.ok(isLegalTarget(index, level, cellId(4, 4)));

  const expectedVehicles: Record<string, string[]> = {
    'north-car-1': [cellId(2, 0), cellId(2, 1)],
    'north-motorcycle-1': [cellId(2, 2), cellId(2, 3)],
    'north-car-2': [cellId(2, 4), cellId(2, 5)],
    'north-car-3': [cellId(2, 6), cellId(2, 7)],
    'ramp-motorcycle': [cellId(2, 8), cellId(2, 9)],
    'ramp-car': [cellId(1, 8), cellId(1, 9)],
    'repair-car-1': [cellId(3, 0), cellId(3, 1)],
    'repair-car-2': [cellId(3, 2), cellId(3, 3)],
    'south-car-1': [cellId(7, 0), cellId(7, 1)],
    'south-car-2': [cellId(6, 2), cellId(6, 3)],
    'south-car-3': [cellId(6, 7), cellId(6, 8)],
    'south-car-4': [cellId(7, 8), cellId(7, 9)],
    'south-motorcycle': [cellId(7, 3), cellId(7, 4)],
  };
  for (const [itemId, expectedCells] of Object.entries(expectedVehicles)) {
    assert.deepEqual(level.items.find((item) => item.id === itemId)?.cells, expectedCells);
  }
  assert.equal(level.items.length, 31);
  assert.equal(level.items.reduce((sum, item) => sum + item.cells.length, 0), 45);
  assert.equal(level.cells.filter((cell) => cell.floorFeatureId === 'roadwork-zone').length, 5);
});

test('trafficjam-01 shows the approved vowel-in-cars line as one common clue', () => {
  const sharedClue = trafficJamLevel.clues.find((clue) => clue.id === 'trafficjam-vowels-in-cars');
  assert.equal(sharedClue?.type, 'letterGroupOccupiesItem');
  assert.equal(sharedClue?.text, 'Все, чьи имена начинались на гласную букву, находились в машинах.');
  assert.ok(!('subject' in (sharedClue ?? {})));
  assert.ok(generalCluesForDisplay(trafficJamLevel.clues).some((clue) => clue.id === sharedClue?.id));
  assert.equal(generalCluesForDisplay(trafficJamLevel.clues).length, 1);
  assert.ok(!trafficJamLevel.clues.some((clue) => clue.id === 'trafficjam-zone-count-parity'));
});

test('trafficjam-01 keeps Anna, Vera, and Boris open after only their personal and common clues', () => {
  const index = buildLevelIndex(trafficJamLevel);
  const domainSize = (personId: string) => {
    const clues = trafficJamLevel.clues.filter((clue) =>
      !('subject' in clue)
      || (clue.subject.type === 'person' && clue.subject.id === personId),
    );
    return trafficJamLevel.cells.filter((cell) =>
      isLegalTarget(index, trafficJamLevel, cell.id)
      && clues.every((clue) => evalClue(
        clue,
        (id) => id === personId ? cell.id : undefined,
        trafficJamLevel,
        index,
        false,
      ) !== false),
    ).length;
  };

  assert.ok(domainSize('anna') >= 4, `Anna has only ${domainSize('anna')} candidates`);
  assert.ok(domainSize('vera') >= 2, `Vera has only ${domainSize('vera')} candidates`);
  assert.ok(domainSize('boris') >= 3, `Boris has only ${domainSize('boris')} candidates`);
});

test('trafficjam-01 leaves Boris multiple candidates after Anna and Vera are placed', () => {
  const index = buildLevelIndex(trafficJamLevel);
  const assigned = new Map<string, string>([
    ['anna', trafficJamLevel.solution.anna],
    ['vera', trafficJamLevel.solution.vera],
  ]);
  const annasCell = index.cellsById.get(trafficJamLevel.solution.anna)!;
  const verasCell = index.cellsById.get(trafficJamLevel.solution.vera)!;
  const candidates = trafficJamLevel.cells.filter((cell) => {
    if (!isLegalTarget(index, trafficJamLevel, cell.id)) return false;
    if (cell.row === annasCell.row || cell.col === annasCell.col) return false;
    if (cell.row === verasCell.row || cell.col === verasCell.col) return false;
    const withBoris = new Map(assigned).set('boris', cell.id);
    return trafficJamLevel.clues.every((clue) =>
      evalClue(clue, (id) => withBoris.get(id), trafficJamLevel, index, false) !== false,
    );
  });
  assert.ok(candidates.length >= 2, `Boris has only ${candidates.length} candidates after Anna and Vera`);
});

test('trafficjam-01 does not pin the remaining cast after the vowel-car deductions', () => {
  const index = buildLevelIndex(trafficJamLevel);
  const placedIds = ['anna', 'vera', 'boris', 'egor'];
  const placed = new Map(placedIds.map((id) => [id, trafficJamLevel.solution[id]]));
  const remaining = trafficJamLevel.people.filter((person) => !placed.has(person.id));

  for (const person of remaining) {
    const candidates = trafficJamLevel.cells.filter((cell) => {
      if (!isLegalTarget(index, trafficJamLevel, cell.id)) return false;
      if ([...placed.values()].some((id) => {
        const other = index.cellsById.get(id)!;
        return other.row === cell.row || other.col === cell.col;
      })) return false;
      const assignment = new Map(placed).set(person.id, cell.id);
      return trafficJamLevel.clues.every((clue) =>
        evalClue(clue, (id) => assignment.get(id), trafficJamLevel, index, false) !== false,
      );
    });
    assert.ok(candidates.length >= 2, `${person.name} is pinned after the vowel-car deductions`);
  }
});

test('trafficjam-01 uses the requested clue wording and omits the superseded clues', () => {
  const egorCarCount = trafficJamLevel.clues.find((clue) => clue.id === 'trafficjam-egor-south-of-car-occupant');
  assert.equal(egorCarCount?.type, 'relativeToItemOccupant');
  assert.equal(egorCarCount?.text, 'Егор был южнее ровно одного человека в машине.');
  assert.ok(egorCarCount && 'exactlyOne' in egorCarCount && egorCarCount.exactlyOne);

  const egorWestOfVera = trafficJamLevel.clues.find((clue) => clue.id === 'trafficjam-egor-six-columns-west-of-vera');
  assert.equal(egorWestOfVera?.text, 'Егор был на шесть столбцов западнее Веры.');

  const dmitryNinthColumn = trafficJamLevel.clues.find((clue) => clue.id === 'trafficjam-dmitry-ninth-column');
  assert.equal(dmitryNinthColumn?.type, 'position');
  assert.equal(dmitryNinthColumn?.text, 'Дмитрий находился в девятом столбце.');

  const removedClueIds = [
    'trafficjam-anna-same-zone-as-motorcycle',
    'trafficjam-ivan-west-of-car-occupant',
    'trafficjam-kirill-last-row',
    'trafficjam-anna-row',
    'trafficjam-vera-same-zone-as-egor',
    'trafficjam-dmitry-south-of-car-occupant',
    'trafficjam-zone-count-parity',
  ];
  assert.ok(removedClueIds.every((id) => !trafficJamLevel.clues.some((clue) => clue.id === id)));
});

test('relativeToItemOccupant with exactlyOne enforces exact cardinality', () => {
  const clue = trafficJamLevel.clues.find((candidate) => candidate.id === 'trafficjam-egor-south-of-car-occupant');
  assert.ok(clue);
  const index = buildLevelIndex(trafficJamLevel);
  const authored = new Map(Object.entries(trafficJamLevel.solution));
  assert.equal(evalClue(clue, (id) => authored.get(id), trafficJamLevel, index, true), true);

  const twoCarsNorthOfEgor = new Map(authored);
  twoCarsNorthOfEgor.set('ivan', cellId(1, 8));
  assert.equal(evalClue(clue, (id) => twoCarsNorthOfEgor.get(id), trafficJamLevel, index, true), false);

  const partial = new Map([
    ['egor', trafficJamLevel.solution.egor],
    ['anna', trafficJamLevel.solution.anna],
  ]);
  assert.equal(evalClue(clue, (id) => partial.get(id), trafficJamLevel, index, false), undefined);
});

test('trafficjam-01 passes map, clue-quality, and unique-solution gates', () => {
  const level = trafficJamLevel;
  assert.deepEqual(lintLevel(level), []);
  const personalClueCounts = new Map(level.people.map((person) => [person.id, 0]));
  for (const clue of level.clues) {
    if ('subject' in clue && clue.subject.type === 'person') {
      personalClueCounts.set(clue.subject.id, (personalClueCounts.get(clue.subject.id) ?? 0) + 1);
    }
  }
  assert.ok([...personalClueCounts.values()].every((count) => count <= 3));
  assert.ok(generalCluesForDisplay(level.clues).length <= 4);

  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  assert.deepEqual(solveLevel(level), { status: 'PROVEN_UNIQUE' });
});

test('trafficjam-01 lets players deduce Kirill as the murderer', () => {
  const report = checkMurdererEpistemics(trafficJamLevel);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 8);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
