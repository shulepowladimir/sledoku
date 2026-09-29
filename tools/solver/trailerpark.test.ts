import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLevelIndex } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { gameLevels } from '../../levels';
import { checkMurdererEpistemics } from './epistemic';
import { diagnoseAgainstAuthoredSolution, evalClue, solveLevel } from './solve';

const level = gameLevels.find((candidate) => candidate.meta.id === 'trailerpark-01');

test('trailer park is an 11x11 classic case with Russian-alphabetical residents', () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  assert.equal(level.meta.title, 'Трейлер и развязка');
  assert.equal(level.size, 11);
  assert.equal(level.cells.length, 121);
  assert.equal(level.people.length, 11);
  assert.deepEqual(
    level.people.map((person) => person.initialLetter),
    ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Х'],
  );
  assert.equal(level.people.at(-1)?.isVictim, true, 'the alphabetically last resident is the victim');
  assert.ok(level.people.every((person) => !person.roles?.length), 'the level has no role twist');

  const commonClues = level.clues.filter((clue) => !('subject' in clue));
  assert.deepEqual(commonClues.map((clue) => clue.type).sort(), ['itemAdjacencyOccupancy', 'letterGroupRoom']);
  assert.ok(level.clues.every((clue) => clue.type !== 'role'), 'no authored clue reveals a role');
  assert.ok(!level.clues.some((clue) => clue.id === 'tp-zoya-cactus-line'));
  assert.ok(!level.clues.some((clue) => clue.id === 'tp-galina-trailer-line'));
  assert.ok(!level.clues.some((clue) => clue.id === 'tp-galina-same-room-viktor'));
  assert.ok(!level.clues.some((clue) => clue.id === 'tp-viktor-south-of-boris'));
  const zoyaSpacingClue = level.clues.find((clue) => clue.id === 'tp-zoya-three-rows-north-of-klim');
  assert.equal(zoyaSpacingClue?.type, 'relativePosition');
  if (zoyaSpacingClue?.type === 'relativePosition') {
    assert.equal(zoyaSpacingClue.subject.type, 'person');
    if (zoyaSpacingClue.subject.type === 'person') assert.equal(zoyaSpacingClue.subject.id, 'zoya');
    assert.equal(zoyaSpacingClue.otherPersonId, 'klim');
    assert.equal(zoyaSpacingClue.axis, 'row');
    assert.equal(zoyaSpacingClue.direction, 'before');
    assert.equal(zoyaSpacingClue.offset, 3);
  }
  const personalBarbecueClues = level.clues.filter(
    (clue) => 'subject' in clue && clue.type === 'adjacency' && clue.itemTypeId === 'barbecue',
  );
  assert.deepEqual(
    personalBarbecueClues.map((clue) => clue.subject.type === 'person' ? clue.subject.id : clue.subject.role),
    [],
  );

  const roomIds = new Set(level.cells.map((cell) => cell.roomId));
  assert.equal(roomIds.size, 8);
  for (const roomId of ['northRow', 'oldRow', 'farLot', 'commonYard']) {
    assert.equal(level.rooms.find((room) => room.id === roomId)?.labelPosition, 'bottom', `${roomId} label should be at the bottom`);
  }
  assert.equal(level.itemTypes.find((itemType) => itemType.id === 'tent')?.kind, 'occupiable');
  assert.equal(level.itemTypes.find((itemType) => itemType.id === 'wheel')?.kind, 'decorative');
  const countItems = (typeId: string) => level.items.filter((item) => item.typeId === typeId).length;
  for (const [typeId, count] of [
    ['trailer', 8],
    ['barbecue', 3],
    ['laundryLine', 2],
    ['motorcycle', 2],
    ['tent', 2],
    ['bushHedge', 2],
    ['beachChair', 4],
    ['hammock', 2],
    ['broadleafTree', 3],
    ['cat', 2],
    ['wagon', 2],
    ['wheel', 1],
    ['basketball', 1],
    ['hoop', 1],
    ['sofa', 1],
    ['washer', 1],
    ['rock', 2],
    ['stump', 2],
    ['cactus', 2],
    ['tumbleweed', 1],
  ] as const) {
    assert.equal(countItems(typeId), count, `expected ${count} ${typeId} items`);
  }
});

test('trailer park rejects the QA boards where Viktor is alone with Khariton', () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  const candidates = [
    {
      name: 'one',
      changes: { galina: cellId(7, 6), zoya: cellId(9, 8), khariton: cellId(2, 9) },
    },
    {
      name: 'three',
      changes: { galina: cellId(7, 6), viktor: cellId(2, 10), zoya: cellId(9, 8), khariton: cellId(1, 9) },
    },
  ];

  for (const candidate of candidates) {
    const candidateLevel = {
      ...level,
      people: level.people.map((person) => ({ ...person, isMurderer: person.id === 'viktor' })),
      solution: { ...level.solution, ...candidate.changes },
    };
    assert.notDeepEqual(
      diagnoseAgainstAuthoredSolution(candidateLevel, buildLevelIndex(candidateLevel)),
      [],
      `screenshot ${candidate.name} should violate at least one player-visible clue or rule`,
    );
  }
});

test("Galina's personal clues allow more than one cell", () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  const index = buildLevelIndex(level);
  const galinaClues = level.clues.filter(
    (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === 'galina',
  );
  const possibleGalinaCells = [level.solution.galina, cellId(7, 6)];

  for (const galinaCell of possibleGalinaCells) {
    const assignment = new Map([
      ['galina', galinaCell],
      ['viktor', level.solution.viktor],
    ]);
    const getCell = (personId: string) => assignment.get(personId);
    assert.ok(
      galinaClues.every((clue) => evalClue(clue, getCell, level, index, false) === true),
      `Galina's clues should allow ${galinaCell} with Viktor at ${level.solution.viktor}`,
    );
  }
});

test('trailer park has a unique row/column placement and keeps victim and murderer alone together', () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const index = buildLevelIndex(level);
  const rows = new Set<number>();
  const cols = new Set<number>();
  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  const victimCell = index.cellsById.get(level.solution[victim.id])!;
  const murdererCell = index.cellsById.get(level.solution[murderer.id])!;
  assert.notEqual(victimCell.id, murdererCell.id);
  assert.equal(murdererCell.roomId, victimCell.roomId);
  assert.equal(level.people.filter((person) => index.cellsById.get(level.solution[person.id])!.roomId === victimCell.roomId).length, 2);
  for (const person of level.people) {
    const cell = index.cellsById.get(level.solution[person.id])!;
    assert.ok(!rows.has(cell.row), `row ${cell.row} is occupied more than once`);
    assert.ok(!cols.has(cell.col), `column ${cell.col} is occupied more than once`);
    rows.add(cell.row);
    cols.add(cell.col);
  }
});

test('the shared barbecue clue is necessary and the murderer remains deducible', () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  const barbecues = level.items.filter((item) => item.typeId === 'barbecue');
  assert.equal(barbecues.length, 3);
  assert.ok(barbecues.some((item) => item.cells.includes(cellId(5, 0))));
  assert.equal(level.solution.anna, cellId(3, 1));
  assert.equal(level.solution.esenya, cellId(4, 0));

  const withoutSharedClue = {
    ...level,
    clues: level.clues.filter((clue) => clue.id !== 'tp-barbecues-have-neighbors'),
  };
  const resultWithoutSharedClue = solveLevel(withoutSharedClue);
  assert.equal(resultWithoutSharedClue.status, 'MULTIPLE');
  if (resultWithoutSharedClue.status === 'MULTIPLE') {
    assert.deepEqual(resultWithoutSharedClue.alternate, {
      ...level.solution,
      anna: cellId(3, 0),
      esenya: cellId(4, 1),
    });
  }

  const report = checkMurdererEpistemics(level);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('trailer park keeps all eight zones and walkable cells connected with the approved floor patches', () => {
  assert.ok(level, 'trailerpark-01 must be registered');
  const allCells = new Map(level.cells.map((cell) => [cell.id, cell]));
  const itemTypes = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  const itemById = new Map(level.items.map((item) => [item.id, item]));
  const neighbors = (id: string) => {
    const [row, col] = id.split('-').map(Number);
    return [`${row - 1}-${col}`, `${row + 1}-${col}`, `${row}-${col - 1}`, `${row}-${col + 1}`];
  };
  const isConnected = (ids: string[]) => {
    const allowed = new Set(ids);
    const reached = new Set<string>();
    const pending = ids.length > 0 ? [ids[0]] : [];
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (reached.has(current)) continue;
      reached.add(current);
      for (const next of neighbors(current)) {
        if (allowed.has(next) && !reached.has(next)) pending.push(next);
      }
    }
    return reached.size === ids.length;
  };

  for (const room of level.rooms) {
    const roomCells = level.cells.filter((cell) => cell.roomId === room.id).map((cell) => cell.id);
    assert.ok(isConnected(roomCells), `${room.id} must be a connected zone`);
  }

  const walkableCells = level.cells.filter((cell) => {
    if (!cell.itemId) return true;
    const item = itemById.get(cell.itemId)!;
    return itemTypes.get(item.typeId)?.kind === 'occupiable';
  });
  assert.ok(isConnected(walkableCells.map((cell) => cell.id)), 'all walkable cells should remain connected');

  const featureCounts = new Map<string, number>();
  for (const cell of level.cells) {
    if (cell.floorFeatureId) featureCounts.set(cell.floorFeatureId, (featureCounts.get(cell.floorFeatureId) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(featureCounts), { 'dirt-track': 4, 'grass-runoff': 3, 'sand-drift': 4 });
  assert.ok(
    level.cells.filter((cell) => cell.floorFeatureId === 'sand-drift').every((cell) => cell.roomId === 'loopRoad'),
    'sand drift should remain on the road, not in the scrub zone',
  );
  assert.equal(allCells.size, 121);
  const itemCellCount = level.items.reduce((total, item) => total + item.cells.length, 0);
  const featureCellCount = level.cells.filter((cell) => cell.floorFeatureId).length;
  assert.ok((itemCellCount + featureCellCount) / level.cells.length >= 0.4);
});
