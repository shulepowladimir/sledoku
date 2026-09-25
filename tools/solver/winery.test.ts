import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLevelIndex } from '../../src/engine/board';
import type { ItemId } from '../../src/types/level';
import { gameLevels } from '../../levels';
import { solveLevel } from './solve';

const level = gameLevels.find((candidate) => candidate.meta.id === 'winery-01');

test('winery is an 11x11 classic murder case with outdoor vines and indoor winery rooms', () => {
  assert.ok(level, 'winery-01 must be registered');
  assert.equal(level.meta.title, 'Капли красного');
  assert.equal(level.size, 11);
  assert.equal(level.cells.length, 121);
  assert.equal(level.people.length, 11);
  assert.ok(level.rooms.some((room) => room.id === 'vineyard'));
  assert.ok(level.rooms.some((room) => room.id === 'courtyard'));
  assert.ok(level.rooms.some((room) => room.id === 'cellar'));
  assert.equal(level.rooms.find((room) => room.id === 'office')?.name, 'Офис');
  assert.equal(level.rooms.find((room) => room.id === 'bottling')?.name, 'Цех розлива');
  assert.ok(level.people.every((person) => !person.roles?.length));

  const commonClueCount = level.clues.filter((clue) => !('subject' in clue)).length;
  assert.ok(commonClueCount <= 3, `expected at most 3 common clues, got ${commonClueCount}`);
  assert.equal(level.meta.clueBalanceExempt, undefined);
  for (const person of level.people.filter((candidate) => !candidate.isVictim)) {
    assert.ok(
      level.clues.some((clue) => clue.subject?.type === 'person' && clue.subject.id === person.id),
      `${person.name} should have a personal clue`,
    );
  }
  const victim = level.people.find((person) => person.isVictim)!;
  assert.ok(!level.clues.some((clue) => clue.subject?.type === 'person' && clue.subject.id === victim.id));
});

test('winery introduces connected grapevine tiles and its planned winery props', () => {
  assert.ok(level, 'winery-01 must be registered');
  const itemTypes = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  for (const itemTypeId of ['grapeVine', 'winePress', 'wineRack', 'grapeCrate', 'wineGlass']) {
    assert.ok(itemTypes.has(itemTypeId), `missing winery item type ${itemTypeId}`);
    assert.ok(level.items.some((item) => item.typeId === itemTypeId), `no ${itemTypeId} placement`);
  }

  const cellsByItem = new Map<ItemId, string[]>();
  for (const cell of level.cells) {
    if (cell.itemId) cellsByItem.set(cell.itemId, [...(cellsByItem.get(cell.itemId) ?? []), cell.id]);
  }
  const vineyards = level.items.filter((item) => item.typeId === 'grapeVine');
  assert.ok(vineyards.some((item) => item.cells.length >= 4), 'vine rows should use multi-cell tiles');
  for (const vine of vineyards) {
    const cells = new Set(cellsByItem.get(vine.id) ?? []);
    const reached = new Set<string>();
    const pending = [vine.cells[0]];
    while (pending.length > 0) {
      const cellId = pending.pop()!;
      if (reached.has(cellId)) continue;
      reached.add(cellId);
      const [row, col] = cellId.split('-').map(Number);
      for (const neighbor of [`${row - 1}-${col}`, `${row + 1}-${col}`, `${row}-${col - 1}`, `${row}-${col + 1}`]) {
        if (cells.has(neighbor) && !reached.has(neighbor)) pending.push(neighbor);
      }
    }
    assert.equal(reached.size, vine.cells.length, `${vine.id} must be a connected tile polyomino`);
  }
  for (let i = 0; i < vineyards.length; i++) {
    for (let j = i + 1; j < vineyards.length; j++) {
      assert.ok(
        !vineyards[i].cells.some((left) => vineyards[j].cells.some((right) => {
          const [leftRow, leftCol] = left.split('-').map(Number);
          const [rightRow, rightCol] = right.split('-').map(Number);
          return Math.abs(leftRow - rightRow) + Math.abs(leftCol - rightCol) === 1;
        })),
        `${vineyards[i].id} and ${vineyards[j].id} should not touch by an edge`,
      );
    }
  }

  const occupiedItemCells = level.items.reduce((total, item) => total + item.cells.length, 0);
  const featureCells = level.cells.filter((cell) => cell.floorFeatureId).length;
  assert.ok((occupiedItemCells + featureCells) / level.cells.length >= 0.4, 'item and floor-feature density must be at least 40%');
});

test('winery keeps the requested density while connecting all walkable cells', () => {
  assert.ok(level, 'winery-01 must be registered');
  const openCells = level.cells.filter((cell) => !cell.itemId);
  const reached = new Set<string>();
  const pending = [openCells[0].id];
  const openIds = new Set(openCells.map((cell) => cell.id));

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (reached.has(current)) continue;
    reached.add(current);
    const [row, col] = current.split('-').map(Number);
    for (const neighbor of [`${row - 1}-${col}`, `${row + 1}-${col}`, `${row}-${col - 1}`, `${row}-${col + 1}`]) {
      if (openIds.has(neighbor) && !reached.has(neighbor)) pending.push(neighbor);
    }
  }

  assert.equal(reached.size, openCells.length, 'all unoccupied cells should remain walkably connected');
  for (const [roomId, minimum] of [
    ['vineyard', 8],
    ['fermentation', 16],
    ['cellar', 4],
    ['bottling', 10],
    ['tasting', 4],
  ] as const) {
    const available = openCells.filter((cell) => cell.roomId === roomId).length;
    assert.ok(available >= minimum, `${roomId} should have at least ${minimum} open cells, got ${available}`);
  }

  const wineBoxType = level.itemTypes.find((itemType) => itemType.id === 'box');
  assert.equal(wineBoxType?.label, 'Ящик вина');
  assert.ok(
    level.items.filter((item) => item.cells.some((id) => level.cells.find((cell) => cell.id === id)?.roomId === 'fermentation')).length >= 4,
    'fermentation should contain its racks, wine box, and glass',
  );
  for (const roomId of ['fermentation', 'bottling']) {
    assert.ok(
      level.items.some((item) => item.typeId === 'box' && item.cells.some((id) => level.cells.find((cell) => cell.id === id)?.roomId === roomId)),
      `${roomId} should contain a wine box`,
    );
  }
});

test('Klim’s room clue names the press instead of the floor texture', () => {
  assert.ok(level, 'winery-01 must be registered');
  const klimClues = level.clues.filter((clue) => clue.subject?.type === 'person' && clue.subject.id === 'klim');
  assert.ok(klimClues.some((clue) => clue.type === 'roomMembership' && clue.roomId === 'press'));
  assert.ok(!klimClues.some((clue) => clue.type === 'floorTexture'));
});

test('winery has one authored solution with the victim and murderer alone in their room', () => {
  assert.ok(level, 'winery-01 must be registered');
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const index = buildLevelIndex(level);
  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  const victimRoom = index.cellsById.get(level.solution[victim.id])!.roomId;
  assert.equal(index.cellsById.get(level.solution[murderer.id])!.roomId, victimRoom);
  assert.equal(
    level.people.filter((person) => index.cellsById.get(level.solution[person.id])!.roomId === victimRoom).length,
    2,
  );
});

test('winery uniquely identifies Zhdan as the murderer across all candidates', () => {
  assert.ok(level, 'winery-01 must be registered');
  assert.ok(
    level.clues.some(
      (clue) =>
        clue.type === 'zoneBoundary' &&
        clue.subject.type === 'person' &&
        clue.subject.id === 'denis' &&
        clue.roomId === 'courtyard' &&
        clue.otherRoomId === 'press',
    ),
    'Denis should be constrained by a real courtyard/press boundary clue',
  );
  for (const candidate of level.people.filter((person) => !person.isVictim)) {
    const world = {
      ...level,
      people: level.people.map((person) => ({ ...person, isMurderer: person.id === candidate.id })),
    };
    const expected = candidate.isMurderer ? 'PROVEN_UNIQUE' : 'NO_SOLUTION';
    assert.equal(solveLevel(world).status, expected, `${candidate.name} must not remain a possible murderer`);
  }
});
