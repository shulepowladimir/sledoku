import assert from 'node:assert/strict';
import { test } from 'node:test';
import { airplaneLevel } from '../../levels/70-9000m';
import { cellId } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import { buildLevelIndex } from '../../src/engine/board';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

test('airplane-01 preserves the approved cabin map and cast solution', () => {
  assert.equal(airplaneLevel.meta.title, '9000м над землёй');
  assert.equal(airplaneLevel.meta.theme, 'airplane');
  assert.equal(airplaneLevel.size, 9);
  assert.equal(airplaneLevel.cells.length, 81);
  assert.deepEqual(Array.from({ length: 9 }, (_, row) => airplaneLevel.cells
    .filter((cell) => cell.row === row)
    .sort((a, b) => a.col - b.col)
    .map((cell) => airplaneLevel.rooms.find((room) => room.id === cell.roomId)!.id)
    .join(',')), [
    'west-economy,west-economy,west-economy,west-business,west-business,sky,sky,sky,sky',
    'west-economy,west-economy,west-economy,west-business,west-business,west-business,cockpit,sky,sky',
    'west-economy,west-economy,west-economy,west-business,west-business,west-business,cockpit,cockpit,sky',
    'aisle,west-economy,west-economy,west-business,west-business,aisle,cockpit,cockpit,cockpit',
    'aisle,aisle,aisle,aisle,aisle,aisle,cockpit,cockpit,cockpit',
    'aisle,east-economy,east-economy,east-business,east-business,aisle,cockpit,cockpit,cockpit',
    'east-economy,east-economy,east-economy,east-business,east-business,east-business,cockpit,cockpit,sky',
    'east-economy,east-economy,east-economy,east-business,east-business,east-business,cockpit,sky,sky',
    'east-economy,east-economy,east-economy,east-business,east-business,sky,sky,sky,sky',
  ]);
  assert.deepEqual(airplaneLevel.solution, {
    dmitry: cellId(0, 1),
    egor: cellId(1, 4),
    khariton: cellId(2, 2),
    anna: cellId(3, 5),
    boris: cellId(4, 8),
    vera: cellId(5, 7),
    zhanna: cellId(6, 0),
    galina: cellId(7, 6),
    zoya: cellId(8, 3),
  });

  const seatItems = airplaneLevel.items.filter((item) => item.typeId === 'airplaneSeat');
  assert.equal(seatItems.length, 34);
  assert.ok(seatItems.every((item) => item.rotation === 270), 'all cabin seats face west away from the cockpit');
  assert.equal(seatItems.filter((item) => item.iconVariant === 'airplaneSeatBusiness').length, 16);
  assert.equal(seatItems.filter((item) => item.iconVariant == null).length, 18);

  const itemLabels = new Map(airplaneLevel.itemTypes.map((itemType) => [itemType.id, itemType.label]));
  assert.equal(itemLabels.get('radioStation'), 'Станция связи');
  assert.equal(itemLabels.get('portableRadio'), 'Рация');
  assert.equal(itemLabels.get('directorConsole'), 'Пульт управления');
  assert.equal(itemLabels.get('waiterTrolley'), 'Тележка стюардессы');

  const index = buildLevelIndex(airplaneLevel);
  const victim = airplaneLevel.people.find((person) => person.isVictim)!;
  const murderer = airplaneLevel.people.find((person) => person.isMurderer)!;
  const victimRoom = index.cellsById.get(airplaneLevel.solution[victim.id])!.roomId;
  assert.equal(murderer.id, 'dmitry');
  assert.equal(index.cellsById.get(airplaneLevel.solution[murderer.id])!.roomId, victimRoom);
  assert.equal(airplaneLevel.people.filter((person) => index.cellsById.get(airplaneLevel.solution[person.id])!.roomId === victimRoom).length, 2);
});

test('airplane-01 has exactly three shared clues and stays inside acceptance budgets', () => {
  assert.deepEqual(generalCluesForDisplay(airplaneLevel.clues).map((clue) => clue.text), [
    'Все с А по Г были членами экипажа, остальные — пассажирами.',
    'Члены экипажа находились в кабине пилотов и в проходе, пассажиры — на своих местах.',
    'В небе никто не находился.',
  ]);

  const visiblePersonalClues = airplaneLevel.clues.filter((clue) =>
    'subject' in clue && clue.subject.type === 'person',
  );
  assert.equal(visiblePersonalClues.some((clue) => clue.subject.id === 'khariton'), false);
  for (const person of airplaneLevel.people.filter((entry) => !entry.isVictim)) {
    const count = visiblePersonalClues.filter((clue) => clue.subject.id === person.id).length;
    assert.ok(count >= 1 && count <= 3, `${person.name} has ${count} personal clues`);
  }

  assert.deepEqual(lintLevel(airplaneLevel), []);
  const quality = checkPuzzleQuality(airplaneLevel);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(airplaneLevel, quality.fullyPinnedCount), []);
});

test('airplane-01 applies the requested personal clue wording and removals', () => {
  const clueById = new Map(airplaneLevel.clues.map((clue) => [clue.id, clue]));
  assert.equal(clueById.get('flight-anna-aisle-cockpit-boundary')?.text, 'Анна находилась на границе прохода и кабины пилотов.');

  const borisClue = clueById.get('flight-boris-row');
  assert.equal(borisClue?.type, 'sameRowOrColumnAsItem');
  if (borisClue?.type === 'sameRowOrColumnAsItem') {
    assert.equal(borisClue.itemTypeId, 'radioStation');
    assert.equal(borisClue.text, 'Находился в одном ряду или столбце со станцией связи');
  }

  const zoyaWindowClue = clueById.get('flight-zoya-window-adjacency');
  assert.equal(zoyaWindowClue?.type, 'adjacency');
  if (zoyaWindowClue?.type === 'adjacency') {
    assert.equal(zoyaWindowClue.itemTypeId, 'airlock');
    assert.equal(zoyaWindowClue.text, 'Зоя сидела рядом с иллюминатором.');
  }

  for (const removedId of [
    'flight-vera-cockpit',
    'flight-dmitry-carpet',
    'flight-egor-rug',
    'flight-zoya-east-business',
    'flight-zoya-south-of-zhanna',
  ]) {
    assert.equal(clueById.has(removedId), false, `${removedId} should be removed`);
  }
});

test('airplane-01 has one placement solution and only Dmitry can be the murderer', () => {
  assert.equal(solveLevel(airplaneLevel).status, 'PROVEN_UNIQUE');

  const report = checkMurdererEpistemics(airplaneLevel);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.equal(report.worlds.length, 7);
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
