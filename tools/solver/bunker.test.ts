import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bunkerLevel } from '../../levels/67-bunker';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { checkMurdererEpistemics } from './epistemic';
import { solveLevel } from './solve';

test('110 метров под землёй has one empty floor and preserves the authored room assignment', () => {
  const occupiedRows = new Set<number>();
  const occupiedCols = new Set<number>();
  const roomsById = new Map(bunkerLevel.rooms.map((room) => [room.id, room]));

  for (const [personId, position] of Object.entries(bunkerLevel.solution)) {
    const [row, col] = position.split('-').map(Number);
    assert.ok(!occupiedRows.has(row), `${personId} shares row ${row}`);
    assert.ok(!occupiedCols.has(col), `${personId} shares column ${col}`);
    occupiedRows.add(row);
    occupiedCols.add(col);
  }

  assert.equal(occupiedRows.size, 10);
  assert.deepEqual(
    Array.from({ length: bunkerLevel.size }, (_, row) => row).filter((row) => !occupiedRows.has(row)),
    [1],
  );

  const murderer = bunkerLevel.people.find((person) => person.isMurderer)!;
  const victim = bunkerLevel.people.find((person) => person.isVictim)!;
  const roomForPerson = (personId: string) => {
    const [row, col] = bunkerLevel.solution[personId].split('-').map(Number);
    const cell = bunkerLevel.cells.find((candidate) => candidate.row === row && candidate.col === col)!;
    return cell.roomId;
  };

  assert.equal(roomForPerson(murderer.id), 'energy');
  assert.equal(roomForPerson(victim.id), 'energy');
  assert.equal(
    bunkerLevel.people.filter((person) => roomForPerson(person.id) === 'energy').length,
    2,
  );
  assert.ok(roomsById.has('energy'));
});

test('110 метров под землёй displays the energy and exit counts as one common clue', () => {
  const occupancyCounts = bunkerLevel.clues.filter((clue) => clue.type === 'zoneExactCount');
  const displayedRoomCountClues = generalCluesForDisplay(bunkerLevel.clues)
    .filter((clue) => clue.groupId === 'bunker-room-counts');

  assert.deepEqual(occupancyCounts.map((clue) => clue.roomId), ['energy', 'exit']);
  assert.equal(occupancyCounts[0].groupId, occupancyCounts[1].groupId);
  assert.equal(displayedRoomCountClues.length, 1);
  assert.equal(displayedRoomCountClues[0].text, 'В энергоблоке и шлюзе выхода было ровно по два человека.');
});

test('110 метров под землёй leaves Ada room implicit and broadens Vera to the medical room', () => {
  const adaAirlockClue = bunkerLevel.clues.find((clue) => clue.id === 'bunker-ada-at-airlock');
  const adaWallClue = bunkerLevel.clues.find((clue) => clue.id === 'bunker-ada-east-wall');
  const veraClue = bunkerLevel.clues.find((clue) => clue.id === 'bunker-vera-by-cabinet');

  assert.equal(adaAirlockClue, undefined);
  assert.ok(adaWallClue);
  assert.equal(adaWallClue.text, 'Ада стояла у восточной стены своей зоны.');
  assert.ok(veraClue);
  assert.equal(veraClue.type, 'sameRoomAsItem');
  if (veraClue.type === 'sameRoomAsItem') assert.equal(veraClue.itemTypeId, 'medicineCabinet');
  assert.equal(veraClue.text, 'Вера находилась в одной комнате с медицинским шкафом.');
});

test('110 метров под землёй replaces Ilya’s two location clues with one toolbox-adjacency clue', () => {
  const ilyaClues = bunkerLevel.clues.filter((clue) => clue.id.startsWith('bunker-ilya-'));
  assert.equal(ilyaClues.length, 1);
  const [clue] = ilyaClues;
  assert.ok(clue);
  assert.equal(clue.type, 'adjacency');
  if (clue.type === 'adjacency') {
    assert.equal(clue.subject.type, 'person');
    assert.equal(clue.subject.id, 'ilya');
    assert.equal(clue.itemTypeId, 'toolbox');
  }
  assert.equal(clue.text, 'Находился рядом с ящиком инструментов.');
});

test('110 метров под землёй needs the empty-floor clue for a unique placement', () => {
  const withoutEmptyFloorClue = {
    ...bunkerLevel,
    clues: bunkerLevel.clues.filter((clue) => clue.id !== 'bunker-empty-floor-choice'),
  };

  assert.equal(solveLevel(bunkerLevel).status, 'PROVEN_UNIQUE');
  assert.equal(solveLevel(withoutEmptyFloorClue).status, 'MULTIPLE');
});

test('110 метров под землёй does not directly order Zoya and Zhanna by row', () => {
  assert.ok(!bunkerLevel.clues.some(
    (clue) => clue.type === 'relativePosition'
      && clue.subject.type === 'person'
      && clue.subject.id === 'zoya'
      && clue.otherPersonId === 'zhanna'
      && clue.axis === 'row'
      && clue.direction === 'after',
  ));
});

test('110 метров под землёй distinguishes consoles from computers and clarifies tile occupancy', () => {
  const itemTypeById = new Map(bunkerLevel.itemTypes.map((itemType) => [itemType.id, itemType]));
  const consoleType = itemTypeById.get('console');
  const computerType = itemTypeById.get('computer');
  const glebClue = bunkerLevel.clues.find((clue) => clue.id === 'bunker-gleb-at-console');

  assert.equal(consoleType?.label, 'Пульт жизнеобеспечения');
  assert.equal(consoleType?.icon, 'directorConsole');
  assert.equal(consoleType?.kind, 'occupiable');
  assert.equal(computerType?.label, 'Компьютер');
  assert.equal(computerType?.icon, 'computer');
  assert.equal(bunkerLevel.items.filter((item) => item.typeId === 'console').length, 2);
  assert.ok(glebClue);
  assert.equal(glebClue.type, 'occupiesItem');
  if (glebClue.type === 'occupiesItem') assert.equal(glebClue.itemTypeId, 'console');
  assert.equal(glebClue.text, 'Глеб находился на клетке одного из пультов жизнеобеспечения.');
});

test('110 метров под землёй proves the murderer without fixing the answer in advance', () => {
  const report = checkMurdererEpistemics(bunkerLevel);

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.length > 0);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('110 метров под землёй has a unique placement solution', () => {
  assert.equal(solveLevel(bunkerLevel).status, 'PROVEN_UNIQUE');
});
