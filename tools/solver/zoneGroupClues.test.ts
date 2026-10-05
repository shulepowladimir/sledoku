import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import type { Clue } from '../../src/types/clue';
import { buildLevelIndex } from '../../src/engine/board';
import type { Level, Room } from '../../src/types/level';
import { cellId } from '../../src/types/level';
import { evalClue } from './solve';
import { lintLevel } from './lint';

const roomIds = ['station-west', 'station-center', 'station-east'];
const rooms: Room[] = [
  ...roomIds.map((id) => ({ id, name: id, floorTexture: 'metal' })),
  { id: 'elsewhere', name: 'Elsewhere', floorTexture: 'stone' },
];

const level: Level = {
  ...apartmentLevel,
  rooms,
  cells: apartmentLevel.cells.map((cell) => ({
    ...cell,
    roomId: cell.col < 2 ? roomIds[0] : cell.col < 4 ? roomIds[1] : cell.col === 4 ? roomIds[2] : 'elsewhere',
  })),
  people: apartmentLevel.people.map((person, index) => ({
    ...person,
    initialLetter: ['А', 'Е', 'И', 'Б', 'В', 'Г'][index],
  })),
  clues: [],
};

const exactlyOneEmpty = (ids = roomIds) => ({
  id: 'test-zone-exactly-one-empty',
  type: 'zoneExactlyOneEmpty',
  roomIds: ids,
  text: 'Ровно одна станция была пустой.',
}) as unknown as Clue;

const letterGroupInRooms = (ids = roomIds) => ({
  id: 'test-letter-group-in-rooms',
  type: 'letterGroupInRooms',
  letterClass: 'vowel',
  roomIds: ids,
  text: 'Все люди с гласной в начале имени находились на станциях.',
}) as unknown as Clue;

const letterGroupSameWorld = () => ({
  id: 'test-letter-group-same-world',
  type: 'letterGroupSameWorld',
  letterClass: 'vowel',
  text: 'Все персонажи с гласной буквой в начале имени находились в одном мире.',
}) as unknown as Clue;

const otherworldRooms = [
  { id: 'ordinary-west', name: 'Ordinary West', floorTexture: 'metal', worldId: 'ordinary', familyId: 'west' },
  { id: 'ordinary-east', name: 'Ordinary East', floorTexture: 'metal', worldId: 'ordinary', familyId: 'east' },
  { id: 'otherworld-east', name: 'Otherworld East', floorTexture: 'stone', worldId: 'otherworld', familyId: 'east' },
] as unknown as Room[];

function worldLevel(rooms = otherworldRooms): Level {
  return {
    ...level,
    rooms,
    cells: level.cells.map((cell) => ({
      ...cell,
      roomId: cell.col < 2 ? 'ordinary-west' : cell.col < 4 ? 'ordinary-east' : 'otherworld-east',
    })),
  };
}

function placements(entries: [string, number, number][]): (personId: string) => ReturnType<typeof cellId> | undefined {
  const cells = new Map(entries.map(([personId, row, col]) => [personId, cellId(row, col)]));
  return (personId) => cells.get(personId);
}

test('zoneExactlyOneEmpty accepts exactly one empty listed room and ignores other rooms', () => {
  const index = buildLevelIndex(level);
  const getCell = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 5],
    ['galina', 3, 5],
    ['denis', 4, 5],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(exactlyOneEmpty(), getCell, level, index, true), true);
});

test('zoneExactlyOneEmpty rejects no empty rooms and multiple empty rooms', () => {
  const index = buildLevelIndex(level);
  const noEmptyRoom = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 4],
    ['galina', 3, 5],
    ['denis', 4, 5],
    ['hristina', 5, 5],
  ]);
  const multipleEmptyRooms = placements([
    ['andrei', 0, 0],
    ['boris', 1, 5],
    ['vladimir', 2, 5],
    ['galina', 3, 5],
    ['denis', 4, 5],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(exactlyOneEmpty(), noEmptyRoom, level, index, true), false);
  assert.equal(evalClue(exactlyOneEmpty(), multipleEmptyRooms, level, index, true), false);
});

test('zoneExactlyOneEmpty prunes only impossible partial assignments', () => {
  const index = buildLevelIndex(level);
  const clue = exactlyOneEmpty();

  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['boris', 1, 2], ['vladimir', 2, 4]]), level, index, false),
    false,
    'once every listed room is occupied, none can become empty again',
  );
  assert.equal(
    evalClue(clue, placements([['andrei', 0, 5], ['boris', 1, 5], ['vladimir', 2, 5], ['galina', 3, 5], ['denis', 4, 5]]), level, index, false),
    false,
    'one unplaced person cannot fill two currently empty stations',
  );
  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['boris', 1, 5], ['vladimir', 2, 5], ['galina', 3, 5]]), level, index, false),
    undefined,
    'the remaining two people can still fill one of the two empty stations',
  );
});

test('letterGroupInRooms allows the letter group to span listed rooms but rejects outsiders', () => {
  const index = buildLevelIndex(level);
  const inStations = placements([
    ['andrei', 0, 0],
    ['boris', 1, 2],
    ['vladimir', 2, 2],
    ['galina', 3, 5],
    ['denis', 4, 5],
    ['hristina', 5, 5],
  ]);
  const oneVowelOutside = placements([
    ['andrei', 0, 0],
    ['boris', 1, 5],
    ['vladimir', 2, 2],
    ['galina', 3, 5],
    ['denis', 4, 5],
    ['hristina', 5, 5],
  ]);

  assert.equal(evalClue(letterGroupInRooms(), inStations, level, index, true), true);
  assert.equal(
    evalClue(letterGroupInRooms(['station-west']), oneVowelOutside, level, index, true),
    false,
  );
});

test('letterGroupInRooms rejects a placed group member outside the allowed rooms before completion', () => {
  const index = buildLevelIndex(level);
  const clue = letterGroupInRooms(['station-west']);

  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['galina', 1, 5]]), level, index, false),
    undefined,
    'unplaced vowel-name people may still be assigned to an allowed station',
  );
  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['vladimir', 1, 5]]), level, index, false),
    false,
    'a placed vowel-name person outside the allowed rooms cannot be moved later',
  );
});

test('letterGroupSameWorld accepts members in different rooms of one world', () => {
  const scopedLevel = worldLevel();
  const result = evalClue(
    letterGroupSameWorld(),
    placements([['andrei', 0, 0], ['boris', 1, 2], ['vladimir', 2, 3]]),
    scopedLevel,
    buildLevelIndex(scopedLevel),
    true,
  );

  assert.equal(result, true);
});

test('letterGroupSameWorld rejects a split group eagerly and at completion', () => {
  const scopedLevel = worldLevel();
  const clue = letterGroupSameWorld();
  const index = buildLevelIndex(scopedLevel);

  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['vladimir', 1, 4]]), scopedLevel, index, false),
    false,
    'already placed members in different worlds cannot be repaired by remaining placements',
  );
  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0], ['boris', 1, 2], ['vladimir', 2, 4]]), scopedLevel, index, true),
    false,
  );
  assert.equal(
    evalClue(clue, placements([['andrei', 0, 0]]), scopedLevel, index, false),
    undefined,
    'unplaced group members can still join the same world',
  );
});

test('letterGroupSameWorld lint requires at least one member of the selected letter class', () => {
  const noVowel = worldLevel();
  noVowel.people = noVowel.people.map((person) => ({ ...person, initialLetter: 'Б' }));

  assert.ok(
    lintLevel({ ...noVowel, clues: [letterGroupSameWorld()] })
      .some((violation) => violation.includes('letterGroupSameWorld')),
  );
});

test('zoneNeighborOf crosses paired-world seams while zoneBoundary and adjacentZonesPair do not', () => {
  const scopedLevel = worldLevel();
  const index = buildLevelIndex(scopedLevel);
  const boundary = {
    id: 'test-world-boundary',
    type: 'zoneBoundary',
    subject: { type: 'person', id: 'andrei' },
    roomId: 'ordinary-east',
    otherRoomId: 'otherworld-east',
    text: 'Галина стояла на границе зон.',
  } as unknown as Clue;
  const neighbor = {
    id: 'test-world-neighbor',
    type: 'zoneNeighborOf',
    subject: { type: 'person', id: 'andrei' },
    roomId: 'otherworld-east',
    text: 'Галина находилась в соседней зоне.',
  } as unknown as Clue;
  const pair = {
    id: 'test-world-adjacent-pair',
    type: 'adjacentZonesPair',
    subject: { type: 'person', id: 'andrei' },
    otherPersonId: 'boris',
    text: 'Галина и Борис находились в соседних зонах.',
  } as unknown as Clue;
  const acrossWorlds = placements([['andrei', 0, 3], ['boris', 1, 4]]);

  assert.equal(evalClue(boundary, acrossWorlds, scopedLevel, index, true), false);
  assert.equal(evalClue(neighbor, acrossWorlds, scopedLevel, index, true), true);
  assert.equal(evalClue(pair, acrossWorlds, scopedLevel, index, true), false);
});

test('rooms without world metadata retain legacy same-world adjacency', () => {
  const legacyRooms = otherworldRooms.map(({ id, name, floorTexture }) => ({ id, name, floorTexture }));
  const legacyLevel = worldLevel(legacyRooms);
  const clue = {
    id: 'test-legacy-zone-neighbor',
    type: 'zoneNeighborOf',
    subject: { type: 'person', id: 'andrei' },
    roomId: 'otherworld-east',
    text: 'Галина находилась в соседней зоне.',
  } as unknown as Clue;

  assert.equal(
    evalClue(clue, placements([['andrei', 0, 3]]), legacyLevel, buildLevelIndex(legacyLevel), true),
    true,
  );
});

test('zone-group clues lint non-empty, unique, known room ids', () => {
  const valid = [exactlyOneEmpty(), letterGroupInRooms()];

  for (const clue of valid) {
    assert.ok(!lintLevel({ ...level, clues: [clue] }).some((violation) => violation.includes(clue.type)));
    assert.ok(lintLevel({ ...level, clues: [{ ...clue, roomIds: [] }] }).some((violation) => violation.includes(clue.type)));
    assert.ok(lintLevel({ ...level, clues: [{ ...clue, roomIds: [roomIds[0], roomIds[0]] }] }).some((violation) => violation.includes(clue.type)));
    assert.ok(lintLevel({ ...level, clues: [{ ...clue, roomIds: ['missing-room'] }] }).some((violation) => violation.includes(clue.type)));
  }
});

test('level lint rejects cells assigned to undeclared rooms', () => {
  const malformed = {
    ...level,
    cells: level.cells.map((cell, index) => index === 0 ? { ...cell, roomId: 'missing-room' } : cell),
  };

  assert.ok(lintLevel(malformed).some((violation) => violation.includes('missing-room')));
});
