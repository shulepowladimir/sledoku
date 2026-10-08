import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameLevels } from '../../levels';
import { cellId } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { checkMurdererEpistemics } from './epistemic';
import { checkLevelAcceptance } from './acceptance';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

const roomRows = [
  'SSSSSSH',
  'SSSSSHH',
  'HSSSHHH',
  'HHHHHHI',
  'BHGHHII',
  'BBGGGII',
  'BBBBGII',
];

const jazzClubLevel = () => {
  const level = gameLevels.find(({ meta }) => meta.id === 'jazzclub-01');
  assert.ok(level, 'jazzclub-01 should be registered in the player-facing catalog');
  return level;
};

const roomAt = (row: number, col: number) => jazzClubLevel().cells.find(
  (cell) => cell.id === cellId(row, col),
)?.roomId;

test('jazzclub-01 preserves the approved 7x7 five-zone layout and textures', () => {
  const level = jazzClubLevel();
  const roomSymbols = { stage: 'S', hall: 'H', entrance: 'I', smokingRoom: 'G', bar: 'B' };

  assert.equal(level.meta.title, 'Клуб «7 нот»');
  assert.equal(level.size, 7);
  assert.equal(level.cells.length, 49);
  assert.deepEqual(Array.from({ length: level.size }, (_, row) =>
    Array.from({ length: level.size }, (_, col) => roomSymbols[roomAt(row, col) as keyof typeof roomSymbols]).join(''),
  ), roomRows);
  assert.deepEqual(Object.fromEntries(level.rooms.map((room) => [
    room.id,
    level.cells.filter((cell) => cell.roomId === room.id).length,
  ])), { stage: 14, hall: 16, entrance: 7, bar: 7, smokingRoom: 5 });
  assert.deepEqual(Object.fromEntries(level.rooms.map((room) => [room.id, room.floorTexture])), {
    stage: 'stairs',
    hall: 'marble',
    entrance: 'rug',
    bar: 'wood',
    smokingRoom: 'carpet',
  });
});

test('jazz musicians are the vowel group and are limited to the stage', () => {
  const level = jazzClubLevel();
  const vowelPeople = level.people.filter((person) => 'АЕЁИОУЫЭЮЯ'.includes(person.initialLetter));
  const consonantPeople = level.people.filter((person) => !'АЕЁИОУЫЭЮЯ'.includes(person.initialLetter));
  const letterRole = level.clues.find((clue) => clue.type === 'letterRole');
  const stageLimit = level.clues.find((clue) => clue.type === 'roleZoneLimit');

  assert.deepEqual(level.people.map((person) => person.initialLetter), ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Х']);
  assert.equal(letterRole?.type, 'letterRole');
  if (letterRole?.type !== 'letterRole') assert.fail('expected the agreed vowel-to-musician clue');
  assert.equal(letterRole.letterClass, 'vowel');
  assert.equal(letterRole.roleId, 'musician');
  assert.equal(
    letterRole.text,
    'Все, чьё имя начиналось на гласную букву, были музыкантами; остальные — посетителями и сотрудниками клуба.',
  );
  assert.deepEqual(vowelPeople.map((person) => person.initialLetter), ['А', 'Е']);
  assert.ok(vowelPeople.every((person) => person.roles?.includes('musician')));
  assert.ok(consonantPeople.every((person) => !person.roles?.includes('musician')));
  assert.equal(stageLimit?.type, 'roleZoneLimit');
  if (stageLimit?.type !== 'roleZoneLimit') assert.fail('expected a stage-only musician rule');
  assert.equal(stageLimit.roleId, 'musician');
  assert.deepEqual([...stageLimit.roomIds].sort(), ['bar', 'entrance', 'hall', 'smokingRoom']);
  assert.equal(stageLimit.maxCount, 0);
  assert.deepEqual(level.clues.filter((clue) =>
    clue.type === 'sameRowOrColumnAsItem'
      && 'subject' in clue
      && clue.subject.type === 'person'
      && ['anfisa', 'esenia'].includes(clue.subject.id),
  ).map((clue) => clue.type === 'sameRowOrColumnAsItem' ? clue.itemTypeId : ''), ['floorLamp', 'floorLamp']);
  assert.ok(level.items.filter((item) => item.typeId === 'floorLamp').every((item) =>
    item.cells.every((id) => roomAt(
      Number(id.split('-')[0]),
      Number(id.split('-')[1]),
    ) !== 'stage'),
  ));
  assert.equal(level.clues.find((clue) => clue.id === 'jc-guriy-even-row')?.text, 'Гурий находился в чётном ряду.');
  assert.ok(vowelPeople.every((person) => roomAt(
    Number(level.solution[person.id].split('-')[0]),
    Number(level.solution[person.id].split('-')[1]),
  ) === 'stage'));
});

test('jazzclub-01 keeps the approved crime scene, props, and cast limits', () => {
  const level = jazzClubLevel();
  const victim = level.people.find((person) => person.isVictim);
  const murderer = level.people.find((person) => person.isMurderer);
  const victimRoom = victim && roomAt(
    Number(level.solution[victim.id].split('-')[0]),
    Number(level.solution[victim.id].split('-')[1]),
  );
  const peopleInCrimeScene = level.people.filter((person) => roomAt(
    Number(level.solution[person.id].split('-')[0]),
    Number(level.solution[person.id].split('-')[1]),
  ) === 'smokingRoom');

  assert.equal(victim?.initialLetter, 'Х');
  assert.ok(murderer);
  assert.equal(victimRoom, 'smokingRoom');
  assert.deepEqual(peopleInCrimeScene.map((person) => person.id).sort(), [victim?.id, murderer?.id].sort());
  assert.equal(level.itemTypes.find((type) => type.id === 'saxophone')?.kind, 'occupiable');
  assert.equal(level.itemTypes.find((type) => type.id === 'piano')?.kind, 'occupiable');
  assert.equal(level.itemTypes.find((type) => type.id === 'drumKit')?.kind, 'occupiable');
  assert.equal(level.itemTypes.find((type) => type.id === 'cigar')?.kind, 'decorative');
  const roomForItemCell = (id: string) => level.cells.find((cell) => cell.id === id)?.roomId;
  const diningTables = level.items.filter((item) => item.typeId === 'fineDiningTable');
  assert.ok(diningTables.length >= 3);
  assert.ok(diningTables.every((item) => item.cells.length === 1 && roomForItemCell(item.cells[0]) === 'hall'));
  const tablePositions = diningTables.map(({ cells: [id] }) => {
    return { row: Number(id.split('-')[0]), col: Number(id.split('-')[1]) };
  });
  assert.equal(new Set(tablePositions.map(({ row }) => row)).size, diningTables.length);
  assert.equal(new Set(tablePositions.map(({ col }) => col)).size, diningTables.length);
  const diningChairs = level.items.filter((item) => item.typeId === 'chair');
  assert.ok(diningChairs.length >= 3);
  assert.ok(diningChairs.every((item) => item.cells.length === 1 && roomForItemCell(item.cells[0]) === 'hall'));
  const lamps = level.items.filter((item) => item.typeId === 'floorLamp');
  assert.ok(lamps.length >= 2);
  assert.ok(lamps.some((item) => roomForItemCell(item.cells[0]) === 'hall'));
  assert.ok(lamps.some((item) => roomForItemCell(item.cells[0]) === 'smokingRoom'));
  assert.ok(level.items.some((item) => item.typeId === 'neonSign'
    && item.cells.every((id) => roomForItemCell(id) === 'entrance')));
  assert.ok(level.clues.every((clue) =>
    !('subject' in clue) || clue.subject.type !== 'person' || clue.subject.id !== victim?.id,
  ));
  assert.ok(level.clues.every((clue) => !clue.text.includes(victim?.name ?? '\u0000')));
  const viktorSmokingClues = level.clues.filter((clue) =>
    clue.type === 'roomMembership'
      && clue.subject.type === 'person'
      && clue.subject.id === 'viktor',
  );
  assert.equal(viktorSmokingClues.length, 1);
  assert.equal(viktorSmokingClues[0].type === 'roomMembership' ? viktorSmokingClues[0].roomId : '', 'smokingRoom');
  assert.ok(level.clues.some((clue) =>
    clue.type === 'wallSide'
      && clue.subject.type === 'person'
      && clue.subject.id === 'viktor'
      && clue.wallDirection === 'west',
  ));
  assert.ok(!level.clues.some((clue) => clue.id === 'jc-darya-east-of-esenia'));
  const guriyHallClue = level.clues.find((clue) => clue.id === 'jc-guriy-hall');
  assert.equal(guriyHallClue?.type, 'roomMembership');
  assert.equal(guriyHallClue?.type === 'roomMembership' ? guriyHallClue.roomId : '', 'hall');
  const daryaEntranceClue = level.clues.find((clue) => clue.id === 'jc-darya-entrance');
  assert.equal(daryaEntranceClue?.type, 'roomMembership');
  assert.equal(daryaEntranceClue?.type === 'roomMembership' ? daryaEntranceClue.roomId : '', 'entrance');
  assert.equal(daryaEntranceClue?.text, 'Дарья находилась на входе.');

  const personalCounts = new Map(level.people.filter((person) => !person.isVictim).map((person) => [
    person.id,
    level.clues.filter((clue) =>
      'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
    ).length,
  ]));
  assert.ok([...personalCounts.values()].every((count) => count >= 1 && count <= 3));
});

test('jazzclub-01 meets density, clue-balance, pin, and unique-solution gates', () => {
  const level = jazzClubLevel();
  const quality = checkPuzzleQuality(level);
  const displayGeneralClues = generalCluesForDisplay(level.clues);

  assert.equal(level.meta.maxFullyPinnedPeople, 0);
  assert.equal(level.meta.clueBalanceExempt, true);
  assert.equal(displayGeneralClues.length, 2);
  assert.deepEqual(lintLevel(level), []);
  assert.deepEqual(quality.violations, []);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  assert.ok((level.items.reduce((count, item) => count + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length) / level.cells.length >= 0.4);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
});

test('only the authored murderer is consistent with jazzclub-01 player-visible clues', () => {
  const report = checkMurdererEpistemics(jazzClubLevel());

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, jazzClubLevel().people.length - 2);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});

test('the musicians-only-on-stage rule is load-bearing', () => {
  const level = jazzClubLevel();
  const withoutStageRule = {
    ...level,
    clues: level.clues.filter((clue) => clue.id !== 'jc-musicians-on-stage'),
  };

  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
  assert.notEqual(solveLevel(withoutStageRule).status, 'PROVEN_UNIQUE');
});
