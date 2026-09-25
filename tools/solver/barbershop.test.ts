import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Clue } from '../../src/types/clue';
import type { PersonId } from '../../src/types/level';
import { buildLevelIndex } from '../../src/engine/board';
import { barbershopLevel } from '../../levels/48-barbershop';
import { checkHiddenRoleEpistemics } from './epistemic';
import { solveLevel } from './solve';

const seniorMasterCandidates = ['aglaya', 'esenya'] satisfies PersonId[];

test('barbershop uses the approved eight-person checkerboard map and the barber/visitor role split', () => {
  assert.equal(barbershopLevel.meta.id, 'barbershop-01');
  assert.equal(barbershopLevel.meta.title, 'Опасная бритва');
  assert.equal(barbershopLevel.size, 8);
  assert.equal(barbershopLevel.cells.length, 64);
  assert.equal(barbershopLevel.rooms.length, 6);
  assert.equal(barbershopLevel.tilePattern, 'checkerboard');

  const barbers = barbershopLevel.people.filter((person) => person.roles?.includes('barber'));
  assert.deepEqual(barbers.map((person) => person.id), ['aglaya', 'esenya']);
  assert.equal(barbershopLevel.people.filter((person) => person.isVictim).length, 1);
  assert.equal(barbershopLevel.people.filter((person) => person.isMurderer).length, 1);

  const index = buildLevelIndex(barbershopLevel);
  const victim = barbershopLevel.people.find((person) => person.isVictim)!;
  const murderer = barbershopLevel.people.find((person) => person.isMurderer)!;
  const victimRoom = index.cellsById.get(barbershopLevel.solution[victim.id])!.roomId;
  assert.equal(index.cellsById.get(barbershopLevel.solution[murderer.id])!.roomId, victimRoom);
  assert.equal(
    barbershopLevel.people.filter((person) => index.cellsById.get(barbershopLevel.solution[person.id])!.roomId === victimRoom).length,
    2,
  );
});

test('barbershop keeps five common clues and at most three personal clues per person', () => {
  const commonClues = barbershopLevel.clues.filter(
    (clue) => !('subject' in clue) || clue.subject.type === 'role',
  );
  assert.equal(commonClues.length, 5);

  for (const person of barbershopLevel.people.filter((person) => !person.isVictim)) {
    const personalCount = barbershopLevel.clues.filter(
      (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
    ).length;
    assert.ok(personalCount <= 3, `${person.name} has ${personalCount} personal clues`);
  }
});

test('barbershop combines the senior-master dark tile and identifies the second barber on a light tile', () => {
  const seniorClue = barbershopLevel.clues.find((clue) => clue.id === 'bs-senior-master-among-barbers');
  assert.equal(seniorClue?.type, 'roleSingleton');
  assert.equal(seniorClue?.text, 'Среди барберов был ровно один старший мастер, он стоял на тёмной клетке.');
  assert.equal(seniorClue?.type === 'roleSingleton' ? seniorClue.withinRoleId : undefined, 'barber');
  assert.equal((seniorClue as (Clue & { tileColor?: string }) | undefined)?.tileColor, 'dark');

  const secondBarberClue = barbershopLevel.clues.find((clue) => clue.id === 'bs-second-barber-light-tile');
  assert.equal(secondBarberClue?.type, 'checkerboardParity');
  assert.equal(secondBarberClue?.text, 'Второй барбер был на светлой клетке.');
  assert.deepEqual(secondBarberClue?.type === 'checkerboardParity' ? secondBarberClue.subject : undefined, {
    type: 'role',
    role: 'juniorBarber',
  });

  assert.ok(barbershopLevel.people.find((person) => person.id === 'esenya')?.roles?.includes('juniorBarber'));
  assert.ok(!barbershopLevel.clues.some((clue) => clue.id === 'bs-esenya-light-tile'));
});

test('barbershop enforces the senior-master tile condition carried by roleSingleton', () => {
  const seniorClue = barbershopLevel.clues.find((clue) => clue.id === 'bs-senior-master-among-barbers')!;
  const conflictsWithSeniorTile = {
    ...barbershopLevel,
    clues: [
      { ...seniorClue, tileColor: 'dark' } as Clue,
      {
        id: 'test-senior-light-tile',
        type: 'checkerboardParity',
        subject: { type: 'person', id: 'aglaya' },
        tileColor: 'light',
        text: 'Тестовый старший мастер стоял на светлой клетке.',
      } as Clue,
    ],
  };

  assert.equal(solveLevel(conflictsWithSeniorTile).status, 'NO_SOLUTION');
});

test('barbershop names the room explicitly instead of disguising room membership as floor texture', () => {
  const expectedRooms = [
    ['bs-boris-reception-room', 'boris', 'reception', 'Борис находился в зоне «Приёмная».'],
    ['bs-viktor-wash-room', 'viktor', 'wash', 'Виктор находился в зоне «Мойка».'],
    ['bs-demid-staff-room', 'demid', 'staff', 'Демид находился в комнате персонала.'],
  ] as const;

  for (const [id, personId, roomId, text] of expectedRooms) {
    const clue = barbershopLevel.clues.find((clue) => clue.id === id);
    assert.equal(clue?.type, 'roomMembership');
    if (clue?.type === 'roomMembership') {
      assert.equal(clue.subject.type, 'person');
      assert.equal(clue.subject.id, personId);
      assert.equal(clue.roomId, roomId);
      assert.equal(clue.text, text);
    }
  }
});

test('barbershop combines senior-master uniqueness with membership among barbers', () => {
  const seniorMasterMovedToVisitor = {
    ...barbershopLevel,
    people: barbershopLevel.people.map((person) => {
      const roles = (person.roles ?? []).filter((role) => role !== 'seniorMaster');
      if (person.id === 'boris') roles.push('seniorMaster');
      return { ...person, roles };
    }),
  };

  assert.equal(solveLevel(seniorMasterMovedToVisitor).status, 'NO_SOLUTION');
});

test('barbershop states zone-count parity with the two even zones first', () => {
  const clue = barbershopLevel.clues.find((clue) => clue.id === 'bs-zone-count-parity');
  assert.equal(
    clue?.text,
    'В кабинете окрашивания и комнате персонала было чётное число людей, в остальных зонах — нечётное.',
  );
});

test('barbershop has one valid solution', () => {
  assert.equal(solveLevel(barbershopLevel).status, 'PROVEN_UNIQUE');
});

test('barbershop deduces the senior master and murderer instead of exposing either directly', () => {
  const report = checkHiddenRoleEpistemics(barbershopLevel, 'seniorMaster', seniorMasterCandidates);
  const alternatives = report.worlds.filter((world) => world.status !== 'NO_SOLUTION');

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.deepEqual(alternatives, []);
});
