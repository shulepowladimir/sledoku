import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cablecarLevel } from '../../levels/53-cablecar';
import { checkPuzzleQuality } from './puzzleQuality';

test('cablecar-01: all 110 board cells belong to a declared room', () => {
  const roomIds = new Set(cablecarLevel.rooms.map((room) => room.id));

  assert.equal(cablecarLevel.cells.length, 110);
  for (const cell of cablecarLevel.cells) {
    assert.ok(roomIds.has(cell.roomId), `${cell.id} references unknown room ${cell.roomId}`);
  }
});

test('cablecar-01: authored solution preserves the station, air, vowel, and cabin rules', () => {
  const cellsById = new Map(cablecarLevel.cells.map((cell) => [cell.id, cell]));
  const solutionCells = Object.values(cablecarLevel.solution).map((id) => cellsById.get(id)!);
  const stationIds = new Set(['stationWest', 'stationCenter', 'stationEast']);
  const occupantsByRoom = new Map<string, number>();

  assert.equal(new Set(solutionCells.map((cell) => cell.row)).size, 10);
  assert.equal(new Set(solutionCells.map((cell) => cell.col)).size, 10);
  for (const cell of solutionCells) {
    occupantsByRoom.set(cell.roomId, (occupantsByRoom.get(cell.roomId) ?? 0) + 1);
  }
  assert.equal(occupantsByRoom.get('air') ?? 0, 0);
  assert.equal([...stationIds].filter((roomId) => (occupantsByRoom.get(roomId) ?? 0) === 0).length, 1);

  const vowelPeople = cablecarLevel.people.filter((person) => 'АЕЁИОУЫЭЮЯ'.includes(person.initialLetter));
  for (const person of vowelPeople) {
    assert.ok(stationIds.has(cellsById.get(cablecarLevel.solution[person.id])!.roomId), `${person.name} must be at a station`);
  }

  const murderer = cablecarLevel.people.find((person) => person.isMurderer)!;
  const victim = cablecarLevel.people.find((person) => person.isVictim)!;
  assert.equal(cellsById.get(cablecarLevel.solution[murderer.id])!.roomId, 'cabin4');
  assert.equal(cellsById.get(cablecarLevel.solution[victim.id])!.roomId, 'cabin4');
  assert.equal(occupantsByRoom.get('cabin4'), 2);

  for (const cell of solutionCells) {
    const item = cablecarLevel.items.find((candidate) => candidate.id === cell.itemId);
    const itemType = item && cablecarLevel.itemTypes.find((candidate) => candidate.id === item.typeId);
    assert.ok(!itemType || itemType.kind === 'occupiable', `${cell.id} is blocked by a decorative item`);
  }
});

test('cablecar-01: each gondola fills its whole square cabin, which has a cobble floor', () => {
  const cellsById = new Map(cablecarLevel.cells.map((cell) => [cell.id, cell]));
  const cabinRooms = cablecarLevel.rooms.filter((room) => room.id.startsWith('cabin'));
  const gondolas = cablecarLevel.items.filter((item) => item.typeId === 'gondola');

  assert.equal(gondolas.length, 4);
  for (const room of cabinRooms) {
    assert.equal(room.floorTexture, 'cobble');
    const roomCellIds = cablecarLevel.cells.filter((cell) => cell.roomId === room.id).map((cell) => cell.id).sort();
    const gondola = gondolas.find((item) => item.cells.every((id) => cellsById.get(id)?.roomId === room.id));

    assert.ok(gondola, `missing gondola for ${room.id}`);
    assert.equal(gondola.cells.length, 4);
    assert.deepEqual([...gondola.cells].sort(), roomCellIds);
    assert.equal(new Set(gondola.cells.map((id) => cellsById.get(id)!.row)).size, 2);
    assert.equal(new Set(gondola.cells.map((id) => cellsById.get(id)!.col)).size, 2);
  }
});

test('cablecar-01: all named stations have stairs; the clock is replaced by a second cable', () => {
  const stationNames = new Map([
    ['stationWest', 'Станция 2500'],
    ['stationCenter', 'Станция 3000'],
    ['stationEast', 'Станция 3500'],
  ]);

  for (const [roomId, name] of stationNames) {
    assert.equal(cablecarLevel.rooms.find((room) => room.id === roomId)?.name, name);
    assert.ok(cablecarLevel.cells.some((cell) => cell.roomId === roomId && cell.floorFeatureId === 'station-stairs'));
  }

  assert.equal(cablecarLevel.items.some((item) => item.typeId === 'clock'), false);
  const cables = cablecarLevel.items.filter((item) => item.typeId === 'cable');
  assert.equal(cables.length, 2);
  for (const cable of cables) {
    assert.ok(cable.cells.every((id) => cablecarLevel.cells.find((cell) => cell.id === id)?.roomId === 'air'));
  }

  assert.equal(cablecarLevel.rooms.find((room) => room.id === 'mountain')?.floorTexture, 'stone');
  assert.equal(cablecarLevel.floorFeatures.find((feature) => feature.id === 'rocky-trail')?.textureKey, 'cliff');
});

test('cablecar-01: stations 2500 and 3000 reach the bottom edge', () => {
  const bottomRow = cablecarLevel.size - 1;

  for (const roomId of ['stationWest', 'stationCenter']) {
    assert.ok(
      cablecarLevel.cells.some((cell) => cell.row === bottomRow && cell.roomId === roomId),
      `${roomId} must reach the bottom row`,
    );
    assert.ok(
      cablecarLevel.cells.some((cell) => cell.row === bottomRow && cell.roomId === roomId && cell.floorFeatureId === 'station-stairs'),
      `${roomId} must remain visually identifiable at the bottom edge`,
    );
  }
});

test('cablecar-01: Zhanna is excluded from every signposted station', () => {
  const clue = cablecarLevel.clues.find((candidate) => candidate.id === 'cablecar-zhanna-not-at-station');

  assert.ok(clue);
  if (clue.type !== 'sameRoomAsItem') assert.fail('expected a same-room-as-item clue');
  assert.equal(clue.itemTypeId, 'stationSign');
  assert.equal(clue.negated, true);
  assert.equal(clue.text, 'Жанна не была на станции.');

  const cellsById = new Map(cablecarLevel.cells.map((cell) => [cell.id, cell]));
  for (const roomId of ['stationWest', 'stationCenter', 'stationEast']) {
    assert.ok(cablecarLevel.items.some((item) =>
      item.typeId === 'stationSign' && item.cells.some((id) => cellsById.get(id)?.roomId === roomId),
    ), `${roomId} must have a sign anchoring the exclusion clue`);
  }
});

test('cablecar-01: Zhanna is not pinned by her own clues', () => {
  const zhanna = checkPuzzleQuality(cablecarLevel).perPerson.find((person) => person.personId === 'zhanna');

  assert.ok(zhanna);
  assert.ok(zhanna.soloDomainSize > 1);
  assert.equal(zhanna.fullyPinned, false);
});
