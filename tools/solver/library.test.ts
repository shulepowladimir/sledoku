import assert from 'node:assert/strict';
import { test } from 'node:test';
import { libraryLevel, roomForCell } from '../../levels/47-library';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

test('library-01 keeps the agreed seven-zone geometry and design limits', () => {
  assert.equal(libraryLevel.meta.title, 'Не суди по обложке');
  assert.equal(libraryLevel.size, 10);
  assert.equal(libraryLevel.people.length, 10);
  assert.equal(libraryLevel.rooms.length, 7);
  assert.deepEqual(
    libraryLevel.rooms.map((room) => room.name),
    [
      'Вестибюль',
      'Поп-культура и искусство',
      'Большой читальный зал',
      'Архив',
      'Книги о путешествиях',
      'Детективы',
      'Читальные кабинеты',
    ],
  );
  assert.equal(libraryLevel.cells.length, 100);
  assert.equal(libraryLevel.floorFeatures.length, 0);
  assert.ok(libraryLevel.people.every((person) => !person.roles?.length), 'the cast must have no added roles');
  assert.equal(libraryLevel.meta.clueBalanceExempt, true);
  const quality = checkPuzzleQuality(libraryLevel);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);

  const usedItemTypes = new Set(libraryLevel.items.map((item) => item.typeId));
  assert.deepEqual([...usedItemTypes].sort(), ['armchair', 'bookshelf', 'floorLamp', 'ladder', 'table']);
  const coveredCells = new Set(libraryLevel.items.flatMap((item) => item.cells));
  assert.ok(coveredCells.size >= 40 && coveredCells.size <= 50, `expected 40-50 covered cells, got ${coveredCells.size}`);

  const solutionPositions = Object.values(libraryLevel.solution).map((id) => id.split('-').map(Number));
  assert.equal(new Set(solutionPositions.map(([row]) => row)).size, 10, 'every person must occupy a distinct row');
  assert.equal(new Set(solutionPositions.map(([, col]) => col)).size, 10, 'every person must occupy a distinct column');

  const personalClueCounts = new Map<string, number>();
  for (const clue of libraryLevel.clues) {
    if ('subject' in clue && clue.subject.type === 'person') {
      personalClueCounts.set(clue.subject.id, (personalClueCounts.get(clue.subject.id) ?? 0) + 1);
    }
  }
  assert.ok(
    libraryLevel.people.filter((person) => !person.isVictim).every((person) => personalClueCounts.has(person.id)),
    'every living character should have a personal clue',
  );
  assert.ok(Math.max(...personalClueCounts.values()) <= 3, 'no character should have more than three personal clues');

  const adjacencyCount = libraryLevel.clues.filter((clue) => clue.type === 'adjacency').length;
  assert.equal(libraryLevel.clues.length, 16);
  assert.equal(adjacencyCount, 5);
  assert.ok(adjacencyCount / libraryLevel.clues.length >= 0.25, 'adjacency should be a major clue type');
  assert.equal(adjacencyCount / libraryLevel.clues.length, 0.3125);
  assert.ok(adjacencyCount / libraryLevel.clues.length <= 0.4, 'the user-approved exception allows up to 40% adjacency');
  assert.ok(libraryLevel.clues.every((clue) => !clue.type.toLowerCase().includes('role')));
  assert.ok(libraryLevel.clues.every((clue) => !('subject' in clue && clue.subject.type === 'role')));
  assert.equal(
    libraryLevel.clues.some((clue) => {
      const victimId = libraryLevel.people.find((person) => person.isVictim)?.id;
      return ('subject' in clue && clue.subject.type === 'person' && clue.subject.id === victimId) ||
        ('otherPersonId' in clue && clue.otherPersonId === victimId) ||
        ('otherPersonId1' in clue && clue.otherPersonId1 === victimId) ||
        ('otherPersonId2' in clue && clue.otherPersonId2 === victimId);
    }),
    false,
    'the victim must not be named in clues',
  );
});

test('library-01 places only the victim and murderer in the largest room', () => {
  const roomSizes = new Map(libraryLevel.rooms.map((room) => [room.id, 0]));
  for (const cell of libraryLevel.cells) roomSizes.set(cell.roomId, (roomSizes.get(cell.roomId) ?? 0) + 1);
  const largestRoomId = [...roomSizes].sort((a, b) => b[1] - a[1])[0][0];
  const occupants = libraryLevel.people.filter((person) => {
    const cellId = libraryLevel.solution[person.id];
    const cell = libraryLevel.cells.find((candidate) => candidate.id === cellId);
    return cell?.roomId === largestRoomId;
  });

  assert.equal(largestRoomId, 'readingHall');
  assert.equal(occupants.length, 2);
  assert.equal(occupants.filter((person) => person.isVictim).length, 1);
  assert.equal(occupants.filter((person) => person.isMurderer).length, 1);
});

test('library-01 has a unique solution that relies on the authored clues', () => {
  assert.equal(solveLevel(libraryLevel).status, 'PROVEN_UNIQUE');
});

test('library-01 rules out every alternate murderer candidate', () => {
  const alternateSuspects = libraryLevel.people.filter((person) => !person.isVictim && !person.isMurderer);

  for (const suspect of alternateSuspects) {
    const people = libraryLevel.people.map((person) => ({
      ...person,
      isMurderer: person.id === suspect.id,
    }));
    assert.equal(
      solveLevel({ ...libraryLevel, people }).status,
      'NO_SOLUTION',
      `${suspect.name} must not admit a placement consistent with the clues and victim rule`,
    );
  }
});

test('library-01 room map matches the approved layout', () => {
  const expectedGrid = [
    'entrance,entrance,entrance,entrance,popCulture,popCulture,popCulture,readingHall,readingHall,readingHall',
    'entrance,entrance,entrance,entrance,popCulture,popCulture,popCulture,readingHall,readingHall,readingHall',
    'entrance,entrance,archive,archive,popCulture,popCulture,popCulture,readingHall,readingHall,readingHall',
    'entrance,archive,archive,archive,archive,popCulture,readingHall,readingHall,readingHall,readingHall',
    'travel,archive,archive,archive,detectives,detectives,detectives,readingHall,readingHall,readingHall',
    'travel,travel,archive,archive,detectives,detectives,detectives,detectives,readingHall,readingHall',
    'travel,travel,travel,readingRooms,readingRooms,detectives,detectives,readingHall,readingHall,readingHall',
    'travel,travel,travel,readingRooms,readingRooms,readingRooms,readingRooms,readingHall,readingHall,readingHall',
    'travel,travel,travel,readingRooms,readingRooms,readingRooms,readingRooms,readingHall,readingHall,readingHall',
    'travel,travel,travel,readingRooms,readingRooms,readingRooms,readingRooms,readingHall,readingHall,readingHall',
  ];

  for (let row = 0; row < libraryLevel.size; row++) {
    assert.equal(
      Array.from({ length: libraryLevel.size }, (_, col) => roomForCell(row, col)).join(','),
      expectedGrid[row],
      `unexpected room layout on row ${row + 1}`,
    );
  }
});
