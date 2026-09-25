import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cellId, parseCellId } from '../../src/types/level';
import { levels } from '../../levels';
import { buildLevelIndex } from '../../src/engine/board';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

function getGreenhouseLevel() {
  const level = levels.find((candidate) => candidate.meta.id === 'greenhouse-01');
  assert.ok(level, 'greenhouse-01 must be registered');
  return level;
}

test('greenhouse keeps the approved 9x9 six-zone blockout and cast', () => {
  const level = getGreenhouseLevel();
  assert.equal(level.meta.title, 'Опавшие лепестки');
  assert.equal(level.size, 9);
  assert.equal(level.cells.length, 81);
  assert.equal(level.people.length, 9);
  assert.deepEqual(level.rooms.map((room) => room.name), [
    'Тропики',
    'Сухоцветы',
    'Дендрарий',
    'Розарий',
    'Водная оранжерея',
    'Служебная зона',
  ]);
  assert.equal(level.rooms.length, 6);
  assert.ok(level.people.every((person) => !person.roles?.length));

  const expectedRows = [
    'TTTTTDDDD',
    'TTTTTDDDD',
    'TTTTTDDDD',
    'TTTAAADDD',
    'TTTAAADDD',
    'TTTAAADDD',
    'RRRRAWWWW',
    'RRRRAWWWW',
    'RRSSSSSSW',
  ];
  const roomByName = new Map(level.rooms.map((room) => [room.name, room.id]));
  const roomByLetter = new Map([
    ['T', roomByName.get('Тропики')!],
    ['D', roomByName.get('Сухоцветы')!],
    ['A', roomByName.get('Дендрарий')!],
    ['R', roomByName.get('Розарий')!],
    ['W', roomByName.get('Водная оранжерея')!],
    ['S', roomByName.get('Служебная зона')!],
  ]);
  for (let row = 0; row < level.size; row++) {
    for (let col = 0; col < level.size; col++) {
      const cell = level.cells.find((candidate) => candidate.id === cellId(row, col));
      assert.equal(cell?.roomId, roomByLetter.get(expectedRows[row][col]), `room at ${row},${col}`);
    }
  }
});

test('greenhouse applies the every-flowerbed-needs-a-same-zone-neighbor clue', () => {
  const level = getGreenhouseLevel();
  const bedType = level.itemTypes.find((type) => type.id === 'flowerbed');
  const flowerbeds = level.items.filter((item) => item.typeId === 'flowerbed');
  assert.equal(bedType?.kind, 'decorative');
  assert.equal(flowerbeds.length, 8);

  const solutionCells = new Set(Object.values(level.solution));
  assert.ok(flowerbeds.every((bed) => bed.cells.every((id) => !solutionCells.has(id))));

  const index = buildLevelIndex(level);
  for (const bed of flowerbeds) {
    const bedCell = index.cellsById.get(bed.cells[0])!;
    const hasSameZoneNeighbor = level.people.some((person) => {
      const personCell = index.cellsById.get(level.solution[person.id])!;
      return personCell.roomId === bedCell.roomId &&
        Math.abs(personCell.row - bedCell.row) + Math.abs(personCell.col - bedCell.col) === 1;
    });
    assert.ok(hasSameZoneNeighbor, `flowerbed ${bed.id} needs a same-zone neighbor`);
  }

  assert.ok(level.clues.some((clue) =>
    clue.type === 'itemAdjacencyOccupancy' && clue.itemTypeId === 'flowerbed' &&
    clue.text === 'У каждой клумбы находился хотя бы один человек в соседней клетке той же зоны.',
  ));
});

test('greenhouse decor follows each room theme and reaches the required density', () => {
  const level = getGreenhouseLevel();
  const roomId = (name: string) => level.rooms.find((room) => room.name === name)!.id;
  const itemsIn = (name: string) => level.items.filter((item) =>
    level.cells.find((cell) => cell.id === item.cells[0])?.roomId === roomId(name),
  );
  const typeCount = (items: typeof level.items, typeId: string) =>
    items.filter((item) => item.typeId === typeId).length;

  assert.equal(level.meta.theme, 'greenhouse');
  assert.ok(!level.itemTypes.some((type) => type.id === 'tree'));
  assert.ok(typeCount(itemsIn('Тропики'), 'palm') >= 3);
  assert.ok(typeCount(itemsIn('Тропики'), 'cactus') >= 2);
  assert.ok(typeCount(itemsIn('Дендрарий'), 'broadleafTree') >= 2);
  assert.ok(itemsIn('Сухоцветы').every((item) => ['flowerbed', 'plant'].includes(item.typeId)));
  assert.ok(typeCount(itemsIn('Сухоцветы'), 'flowerbed') >= 2);
  assert.ok(typeCount(itemsIn('Сухоцветы'), 'plant') >= 2);
  assert.ok(typeCount(itemsIn('Розарий'), 'roseBush') >= 1);
  assert.ok(itemsIn('Розарий').filter((item) => item.typeId === 'roseBush').every((item) =>
    item.cells.every((id) => level.cells.find((cell) => cell.id === id)?.roomId === roomId('Розарий')),
  ));

  const featureCells = level.cells.filter((cell) => cell.floorFeatureId).length;
  const coveredCells = level.items.reduce((sum, item) => sum + item.cells.length, featureCells);
  assert.ok(coveredCells >= 33, `expected at least 33 covered cells, got ${coveredCells}`);

  assert.ok(!level.clues.some((clue) => clue.type === 'zoneCountParity' || clue.type === 'roomParity'));
  assert.ok(level.clues.some((clue) =>
    clue.type === 'floorFeature' && clue.featureId === 'pond' &&
    clue.subject.type === 'person' && clue.subject.id === 'zhdan',
  ));
});

test('greenhouse hedge and rose-bush polyominoes are connected tile-rendered items', () => {
  const level = getGreenhouseLevel();
  const tileTypes = new Set(['bushHedge', 'roseBush']);
  const multiCellItems = level.items.filter((item) => tileTypes.has(item.typeId) && item.cells.length > 1);
  assert.ok(multiCellItems.some((item) => item.typeId === 'bushHedge'));
  assert.ok(multiCellItems.some((item) => item.typeId === 'roseBush'));

  for (const typeId of tileTypes) {
    assert.equal(level.itemTypes.find((type) => type.id === typeId)?.render, 'tile');
  }

  for (const item of multiCellItems) {
    const remaining = new Set(item.cells.slice(1));
    const reached = new Set([item.cells[0]]);
    const queue = [item.cells[0]];
    while (queue.length) {
      const current = parseCellId(queue.pop()!);
      for (const candidate of [...remaining]) {
        const next = parseCellId(candidate);
        if (Math.abs(current.row - next.row) + Math.abs(current.col - next.col) === 1) {
          remaining.delete(candidate);
          reached.add(candidate);
          queue.push(candidate);
        }
      }
    }
    assert.equal(reached.size, item.cells.length, `${item.id} must be one connected polyomino`);
  }
});

test('greenhouse places only the victim and murderer in the rose garden', () => {
  const level = getGreenhouseLevel();
  const index = buildLevelIndex(level);
  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  const roseGardenId = level.rooms.find((room) => room.name === 'Розарий')!.id;

  assert.equal(victim.name, 'Харита');
  assert.equal(murderer.name, 'Зоя');
  assert.equal(index.cellsById.get(level.solution[victim.id])!.roomId, roseGardenId);
  assert.equal(index.cellsById.get(level.solution[murderer.id])!.roomId, roseGardenId);
  assert.equal(
    level.people.filter((person) => index.cellsById.get(level.solution[person.id])!.roomId === roseGardenId).length,
    2,
  );
  assert.ok(level.clues.some((clue) => clue.type === 'zoneExactCount' && clue.roomId === roseGardenId && clue.count === 2));
  assert.ok(!level.clues.some((clue) =>
    ('subject' in clue && clue.subject.type === 'person' && clue.subject.id === victim.id) ||
    ('otherPersonId' in clue && clue.otherPersonId === victim.id) ||
    ('otherPersonId1' in clue && clue.otherPersonId1 === victim.id) ||
    ('otherPersonId2' in clue && clue.otherPersonId2 === victim.id),
  ));
});

test('greenhouse clue counts stay balanced and nobody is fully pinned by personal clues', () => {
  const level = getGreenhouseLevel();
  assert.equal(level.clues.length, 16);

  const clueTypeCounts = new Map<string, number>();
  const personalClueCounts = new Map<string, number>();
  for (const clue of level.clues) {
    clueTypeCounts.set(clue.type, (clueTypeCounts.get(clue.type) ?? 0) + 1);
    if ('subject' in clue && clue.subject.type === 'person') {
      personalClueCounts.set(clue.subject.id, (personalClueCounts.get(clue.subject.id) ?? 0) + 1);
    }
  }
  assert.ok([...clueTypeCounts.values()].every((count) => count / level.clues.length <= 0.2));
  assert.ok(level.people.filter((person) => !person.isVictim).every((person) => personalClueCounts.has(person.id)));
  assert.ok([...personalClueCounts.values()].every((count) => count <= 3));

  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
});

test('greenhouse authored solution is unique with no clue-balance exemption', () => {
  const level = getGreenhouseLevel();
  const positions = Object.values(level.solution).map(parseCellId);
  assert.equal(new Set(positions.map(({ row }) => row)).size, 9);
  assert.equal(new Set(positions.map(({ col }) => col)).size, 9);
  assert.equal(level.meta.clueBalanceExempt, undefined);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
});
