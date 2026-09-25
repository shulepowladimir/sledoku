import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apartmentLevel } from '../../levels/01-apartment';
import { fightClubLevel } from '../../levels/40-fightclub';
import type { Clue } from '../../src/types/clue';
import { buildLevelIndex } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { computeUnaryDomain, evalClue } from './solve';
import { lintLevel } from './lint';

test('checkerboardParity uses a light north-west tile and alternates by row and column', () => {
  const person = apartmentLevel.people.find((candidate) => !candidate.isVictim)!;
  const clue = {
    id: 'test-checkerboard',
    text: 'Стоял на светлой плитке.',
    type: 'checkerboardParity',
    subject: { type: 'person', id: person.id },
    tileColor: 'light',
  } as unknown as Clue;
  const level = { ...apartmentLevel, clues: [clue] };
  const domain = computeUnaryDomain(level, buildLevelIndex(level), level.cells, person.id);

  assert.ok(domain.includes(cellId(0, 0)));
  assert.ok(!domain.includes(cellId(0, 1)));
  assert.ok(domain.includes(cellId(1, 1)));
  assert.ok(!domain.includes(cellId(1, 2)));
});

test('checkerboardParity resolves hidden role subjects to their holder', () => {
  const level = fightClubLevel;
  const index = buildLevelIndex(level);
  const solutionCells = new Map(Object.entries(level.solution));
  const judge = level.people.find((person) => person.roles?.includes('judge'))!;
  const judgeCell = index.cellsById.get(level.solution[judge.id])!;
  const tileColor = (judgeCell.row + judgeCell.col) % 2 === 0 ? 'light' : 'dark';
  const clue = {
    id: 'test-role-checkerboard',
    text: 'Старший мастер стоял на нужной плитке.',
    type: 'checkerboardParity',
    subject: { type: 'role', role: 'judge' },
    tileColor,
  } as unknown as Clue;
  const getCell = (personId: string) => solutionCells.get(personId);

  assert.equal(evalClue(clue, getCell, level, index, true), true);
  assert.equal(
    evalClue({ ...clue, tileColor: tileColor === 'light' ? 'dark' : 'light' }, getCell, level, index, true),
    false,
  );
});

test('checkerboardParity clues require a visible checkerboard pattern on the level', () => {
  const clue = {
    id: 'test-checkerboard-lint',
    text: 'Стоял на светлой плитке.',
    type: 'checkerboardParity',
    subject: { type: 'person', id: apartmentLevel.people.find((person) => !person.isVictim)!.id },
    tileColor: 'light',
  } as unknown as Clue;
  const level = { ...apartmentLevel, clues: [...apartmentLevel.clues, clue] };

  assert.ok(lintLevel(level).some((violation) => violation.includes('checkerboard')));
  assert.ok(!lintLevel({ ...level, tilePattern: 'checkerboard' }).some((violation) => violation.includes('checkerboard')));
});
