import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';
import type { Clue } from '../../src/types/clue';
import { cellId } from '../../src/types/level';
import { apartmentLevel } from '../../levels/01-apartment';
import { buildLevelIndex } from '../../src/engine/board';
import { evalClue } from './solve';

function levelWithDarkSquares() {
  return {
    ...apartmentLevel,
    floorFeatures: [{ id: 'dark-square', label: 'Тёмная клетка', textureKey: 'asphalt' }],
    cells: apartmentLevel.cells.map((cell) => ({
      ...cell,
      floorFeatureId: (cell.row + cell.col) % 2 === 0 ? 'dark-square' : undefined,
    })),
  };
}

test('a general floor-feature cohort clue checks every named person, including the victim', () => {
  const level = levelWithDarkSquares();
  const victim = level.people.find((person) => person.isVictim)!;
  const [darkPerson, lightPerson] = level.people.filter((person) => !person.isVictim);
  const clue = {
    id: 'test-floor-feature-cohorts',
    type: 'floorFeatureCohorts',
    groups: [
      { personIds: [darkPerson.id], featureId: 'dark-square' },
      { personIds: [lightPerson.id, victim.id], featureId: 'dark-square', negated: true },
    ],
    text: 'Одни стояли на тёмных клетках, другие — на светлых.',
  } as unknown as Clue;
  const getCell = (personId: string) => new Map([
    [darkPerson.id, cellId(0, 0)],
    [lightPerson.id, cellId(0, 1)],
    [victim.id, cellId(1, 0)],
  ]).get(personId);
  const index = buildLevelIndex(level);

  assert.equal(evalClue(clue, getCell, level, index, true), true);
  assert.deepEqual(generalCluesForDisplay([clue]), [clue]);

  const victimOnDark = (personId: string) => personId === victim.id ? cellId(0, 0) : getCell(personId);
  assert.equal(evalClue(clue, victimOnDark, level, index, true), false);
  assert.equal(evalClue(clue, (personId) => personId === lightPerson.id ? undefined : getCell(personId), level, index, false), undefined);
});
