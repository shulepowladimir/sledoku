import assert from 'node:assert/strict';
import { test } from 'node:test';
import { strangeCaseLevel } from '../../levels/63-strange-case';
import { cellId, parseCellId, roomWorldId } from '../../src/types/level';
import { buildLevelIndex, cellBoundary } from '../../src/engine/board';
import { checkLevelAcceptance } from './acceptance';
import { checkMurdererEpistemics } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue, solveLevel } from './solve';

const solutionCell = (personId: string) => parseCellId(strangeCaseLevel.solution[personId]);

test('Странноватое дело preserves the map, row/column permutation, and paired-room layout', () => {
  const level = strangeCaseLevel;
  const roomById = new Map(level.rooms.map((room) => [room.id, room]));
  const families = new Map<string, typeof level.rooms>();
  const codeByRoom = new Map([
    ['attic/ordinary', 'A'],
    ['tree/ordinary', 'T'],
    ['cloud/ordinary', 'C'],
    ['house/ordinary', 'H'],
    ['machine/ordinary', 'M'],
    ['attic/otherworld', 'a'],
    ['house/otherworld', 'h'],
    ['tree/otherworld', 't'],
    ['machine/otherworld', 'm'],
    ['cloud/otherworld', 'c'],
  ]);

  assert.equal(level.size, 12);
  assert.equal(level.cells.length, 144);
  assert.equal(level.people.length, 12);
  assert.equal(new Set(level.people.map((person) => solutionCell(person.id).row)).size, 12);
  assert.equal(new Set(level.people.map((person) => solutionCell(person.id).col)).size, 12);
  assert.deepEqual(
    Array.from({ length: level.size }, (_, row) =>
      level.cells
        .filter((cell) => cell.row === row)
        .sort((a, b) => a.col - b.col)
        .map((cell) => {
          const room = roomById.get(cell.roomId)!;
          return codeByRoom.get(`${room.familyId}/${roomWorldId(room)}`);
        })
        .join(''),
    ),
    [
      'AAATTTTTTCCC',
      'AAATTTTTTCCC',
      'AAAATTTTCCCC',
      'HHHHHTTMMMCC',
      'HHHHHTTMMMMM',
      'HHHHHTTMMMMM',
      'hhhhhttmmmmm',
      'hhhhhttmmmmm',
      'hhhhhttmmmcc',
      'aaaattttcccc',
      'aaattttttccc',
      'aaattttttccc',
    ],
  );

  for (const room of level.rooms) {
    assert.ok(room.worldId);
    assert.ok(room.familyId);
    const family = families.get(room.familyId) ?? [];
    family.push(room);
    families.set(room.familyId, family);
  }
  for (const family of families.values()) {
    assert.equal(family.length, 2);
    assert.equal(new Set(family.map(roomWorldId)).size, 2);
  }

  assert.equal(roomById.get('machine')?.floorTexture, 'cobble');
  assert.equal(roomById.get('other-machine')?.floorTexture, 'cobble');
  assert.equal(roomById.get('other-attic')?.floorTexture, 'stairs');
  const otherworldRadio = level.items.find((item) => item.id === 'radio-station-other-tree');
  assert.equal(level.cells.find((cell) => cell.id === otherworldRadio?.cells[0])?.roomId, 'other-tree');
  assert.equal(roomById.get('machine')?.name, 'Машина');
  assert.equal(roomById.get('other-machine')?.name, 'Потусторонняя машина');
  assert.equal(roomById.get('machine')?.familyId, roomById.get('other-machine')?.familyId);
  const itemCellCountsByRoom = Object.fromEntries(level.rooms.map((room) => [
    room.id,
    level.items.flatMap((item) => item.cells)
      .filter((id) => level.cells.find((cell) => cell.id === id)?.roomId === room.id)
      .length,
  ]));
  assert.deepEqual(itemCellCountsByRoom, {
    attic: 4,
    tree: 7,
    cloud: 0,
    house: 9,
    machine: 4,
    'other-house': 8,
    'other-tree': 7,
    'other-machine': 3,
    'other-attic': 3,
    tuch: 0,
  });
  const roomIdsForItemType = (typeId: string) => new Set(
    level.items.filter((item) => item.typeId === typeId)
      .flatMap((item) => item.cells)
      .map((id) => level.cells.find((cell) => cell.id === id)?.roomId),
  );
  assert.deepEqual(roomIdsForItemType('toolbox'), new Set(['machine', 'other-machine', 'house']));
  assert.deepEqual(roomIdsForItemType('lamppost'), new Set(['tree', 'other-tree', 'machine']));
  assert.deepEqual(roomIdsForItemType('bicycle'), new Set(['tree', 'other-tree', 'machine']));
  assert.deepEqual(roomIdsForItemType('basketball'), new Set(['tree', 'other-machine']));
  assert.deepEqual(roomIdsForItemType('radioStation'), new Set(['attic', 'other-tree', 'other-machine']));
  assert.deepEqual(roomIdsForItemType('garland'), new Set(['tree', 'other-tree', 'house', 'other-house']));
  assert.deepEqual(level.items.find((item) => item.id === 'garland-tree')?.cells, [
    cellId(0, 5), cellId(0, 6), cellId(1, 5), cellId(1, 6),
  ]);
  assert.deepEqual(level.items.find((item) => item.id === 'garland-other-tree')?.cells, [
    cellId(9, 4), cellId(9, 5), cellId(10, 4), cellId(10, 5),
  ]);
  assert.deepEqual(level.items.find((item) => item.id === 'garland-house')?.cells, [
    cellId(4, 1), cellId(4, 2), cellId(5, 1), cellId(5, 2),
  ]);
  assert.deepEqual(level.items.find((item) => item.id === 'garland-other-house')?.cells, [
    cellId(7, 3), cellId(7, 4), cellId(8, 3), cellId(8, 4),
  ]);
  const garlandCells = new Set(level.items.filter((item) => item.typeId === 'garland').flatMap((item) => item.cells));
  const treeStems = [
    cellId(3, 5), cellId(3, 6), cellId(4, 5), cellId(4, 6), cellId(5, 5), cellId(5, 6),
    cellId(6, 5), cellId(6, 6), cellId(7, 5), cellId(7, 6), cellId(8, 5), cellId(8, 6),
  ];
  assert.ok(treeStems.every((id) => !garlandCells.has(id)), 'garlands must leave both tree trunks clear');
  assert.ok(!garlandCells.has(cellId(3, 6)), 'the ordinary-tree lamppost cell must stay clear');
  assert.ok(!garlandCells.has(cellId(8, 5)), 'the otherworld-tree lamppost cell must stay clear');
  const index = buildLevelIndex(level);
  assert.deepEqual(cellBoundary(index, cellId(9, 3)), { top: true, right: true, bottom: true, left: false });
  assert.deepEqual(cellBoundary(index, cellId(8, 9)), { top: false, right: true, bottom: true, left: false });
  assert.deepEqual(cellBoundary(index, cellId(11, 8)), { top: false, right: true, bottom: true, left: false });
  const itemCells = level.items.flatMap((item) => item.cells);
  assert.equal(new Set(itemCells).size, itemCells.length, 'items must not occupy the same cell');
  for (const roomId of ['cloud', 'tuch']) {
    const roomCellIds = new Set(level.cells.filter((cell) => cell.roomId === roomId).map((cell) => cell.id));
    assert.ok(level.cells.filter((cell) => roomCellIds.has(cell.id)).every((cell) => !cell.itemId));
    assert.ok(level.people.every((person) => !roomCellIds.has(level.solution[person.id])));
  }

  const luka = solutionCell('luka');
  const ida = solutionCell('ida');
  assert.deepEqual(ida, { row: 11 - luka.row, col: 11 - luka.col });
});

test('tree crown features are 16 cells per world and exact 180-degree mirrors', () => {
  const cells = strangeCaseLevel.cells.filter((cell) => cell.floorFeatureId === 'tree-crown');
  const roomById = new Map(strangeCaseLevel.rooms.map((room) => [room.id, room]));
  const ordinary = cells.filter((cell) => roomWorldId(roomById.get(cell.roomId)) === 'ordinary');
  const otherworld = new Set(cells.filter((cell) => roomWorldId(roomById.get(cell.roomId)) === 'otherworld').map((cell) => cell.id));

  assert.equal(ordinary.length, 16);
  assert.equal(otherworld.size, 16);
  for (const cell of ordinary) {
    assert.ok(otherworld.has(`${11 - cell.row}-${11 - cell.col}`));
  }
});

test('the vowel-world clue covers only А, Е, И and no numeric zone counts are authored', () => {
  const level = strangeCaseLevel;
  const sameWorldClues = level.clues.filter((clue) => clue.type === 'letterGroupSameWorld');
  const vowelInitials = level.people
    .filter((person) => 'АЕЁИОУЫЭЮЯ'.includes(person.initialLetter))
    .map((person) => person.initialLetter)
    .sort();

  assert.equal(sameWorldClues.length, 1);
  assert.equal(sameWorldClues[0]?.letterClass, 'vowel');
  assert.equal(sameWorldClues[0]?.text, 'Все персонажи на гласную букву находились в одном мире — обычном или потустороннем.');
  assert.deepEqual(vowelInitials, ['А', 'Е', 'И']);
  assert.equal(level.clues.some((clue) => clue.type === 'zoneExactCount'), false);
  assert.deepEqual(level.meta.generalNotes, [
    'Обозначения зон в подсказках могут быть как из обычного мира, так и из потустороннего.',
  ]);
});

test('removed location shortcuts stay absent and Karina is described as being in the ordinary machine', () => {
  const level = strangeCaseLevel;
  const removedIds = [
    'sc-alexey-cobble',
    'sc-bill-crown',
    'sc-galina-tree',
    'sc-jimmy-basketball-axis',
    'sc-evgeny-machine',
    'sc-zhanna-box-adjacent',
    'sc-karina-cobble',
    'sc-luka-cliff',
  ];
  assert.ok(removedIds.every((id) => !level.clues.some((clue) => clue.id === id)));

  const karinaClue = level.clues.find((clue) => clue.id === 'sc-karina-machine');
  assert.equal(karinaClue?.type, 'roomMembership');
  if (karinaClue?.type === 'roomMembership') assert.equal(karinaClue.roomId, 'machine');
  assert.equal(karinaClue?.text, 'Карина находилась в машине.');

  for (const [clueId, itemTypeId] of [
    ['sc-bill-bicycle-axis', 'bicycle'],
    ['sc-galina-basketball-axis', 'basketball'],
  ]) {
    const clue = level.clues.find((entry) => entry.id === clueId);
    assert.equal(clue?.type, 'sameRowOrColumnAsItem');
    if (clue?.type === 'sameRowOrColumnAsItem') assert.equal(clue.itemTypeId, itemTypeId);
  }

  const roomById = new Map(level.rooms.map((room) => [room.id, room]));
  for (const personId of ['viktor', 'evgeny']) {
    const personalClues = level.clues.filter((clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === personId);
    assert.ok(personalClues.every((clue) => !/потусторон/i.test(clue.text)));
    assert.ok(personalClues.every((clue) => clue.type !== 'roomMembership' || roomWorldId(roomById.get(clue.roomId)) !== 'otherworld'));
  }
});

test('Ida is described as being on a tree trunk and the level has the hard menu tag', () => {
  const idaClue = strangeCaseLevel.clues.find((clue) => clue.id === 'sc-ida-cliff');

  assert.equal(idaClue?.type, 'floorTexture');
  if (idaClue?.type === 'floorTexture') assert.equal(idaClue.textureKey, 'cliff');
  assert.equal(idaClue?.text, 'Ида находилась на стволе дерева.');
  assert.equal(strangeCaseLevel.meta.menuTag, 'hard');
});

test('room membership includes a paired room in the other world', () => {
  const person = strangeCaseLevel.people.find((entry) => entry.id === 'karina')!;
  const victim = strangeCaseLevel.people.find((entry) => entry.isVictim)!;
  const murderer = strangeCaseLevel.people.find((entry) => entry.isMurderer)!;
  const cells = [
    { id: cellId(0, 0), row: 0, col: 0, roomId: 'house' },
    { id: cellId(1, 1), row: 1, col: 1, roomId: 'house' },
    { id: cellId(2, 2), row: 2, col: 2, roomId: 'other-machine' },
  ];
  const level = {
    ...strangeCaseLevel,
    size: 3,
    cells,
    items: [],
    itemTypes: [],
    floorFeatures: [],
    people: [victim, murderer, person],
    solution: { [victim.id]: cells[0].id, [murderer.id]: cells[1].id, [person.id]: cells[2].id },
    clues: [
      {
        id: 'test-karina-machine',
        type: 'roomMembership' as const,
        subject: { type: 'person' as const, id: 'karina' },
        roomId: 'machine',
        text: 'Карина находилась в машине.',
      },
      ...[
        [victim, cells[0]],
        [murderer, cells[1]],
        [person, cells[2]],
      ].flatMap(([subject, cell]) => [
        {
          id: `test-${subject.id}-row`,
          type: 'position' as const,
          subject: { type: 'person' as const, id: subject.id },
          axis: 'row' as const,
          value: cell.row,
          text: `${subject.name} находился в заданном ряду.`,
        },
        {
          id: `test-${subject.id}-column`,
          type: 'position' as const,
          subject: { type: 'person' as const, id: subject.id },
          axis: 'col' as const,
          value: cell.col,
          text: `${subject.name} находился в заданной колонке.`,
        },
      ]),
    ],
  };

  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
});

test("Zhanna's tree-neighbor clue includes all rooms adjacent to either tree across worlds", () => {
  const clue = strangeCaseLevel.clues.find((entry) => entry.id === 'sc-zhanna-near-tree')!;
  const index = buildLevelIndex(strangeCaseLevel);
  const acceptedRooms = strangeCaseLevel.rooms.filter((room) => {
    const cell = strangeCaseLevel.cells.find((entry) => entry.roomId === room.id)!;
    return evalClue(clue, (personId) => personId === 'zhanna' ? cell.id : undefined, strangeCaseLevel, index, true) === true;
  });

  assert.deepEqual(
    acceptedRooms.map((room) => room.id).sort(),
    strangeCaseLevel.rooms.map((room) => room.id).sort(),
  );
});

test('Zhanna north of Viktor restores uniqueness with the approved relativePosition share', () => {
  const level = strangeCaseLevel;
  const clue = level.clues.find((entry) => entry.id === 'sc-zhanna-north-viktor');
  assert.equal(clue?.type, 'relativePosition');
  if (clue?.type === 'relativePosition') {
    assert.deepEqual(clue.subject, { type: 'person', id: 'zhanna' });
    assert.equal(clue.otherPersonId, 'viktor');
    assert.equal(clue.axis, 'row');
    assert.equal(clue.direction, 'before');
    assert.equal(clue.text, 'Жанна находилась севернее Виктора.');
  }
  assert.equal(level.clues.length, 21);
  assert.equal(level.meta.clueBalanceExempt, true);

  const quality = checkPuzzleQuality(level);
  const relativePositionStats = quality.clueTypeStats.find((stat) => stat.type === 'relativePosition');
  assert.equal(relativePositionStats?.count, 5);
  assert.equal(relativePositionStats?.percent, (5 / 21) * 100);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);
  assert.deepEqual(lintLevel(level), []);
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');
});

test('quality and murderer deduction pass despite multiple placements without a decoy role', () => {
  const level = strangeCaseLevel;
  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  const clueCounts = new Map<string, number>();

  for (const clue of level.clues) {
    if ('subject' in clue && clue.subject.type === 'person') {
      clueCounts.set(clue.subject.id, (clueCounts.get(clue.subject.id) ?? 0) + 1);
    }
  }

  assert.equal(victim.initialLetter, 'Х');
  assert.equal(victim.name, 'Хелен');
  assert.equal(murderer.initialLetter, 'В');
  assert.equal(murderer.name, 'Виктор');
  assert.equal(clueCounts.has(victim.id), false);
  assert.ok(level.people.filter((person) => !person.isVictim).every((person) => {
    const count = clueCounts.get(person.id) ?? 0;
    return count >= 1 && count <= 3;
  }));
  assert.ok(level.clues.every((clue) => !JSON.stringify(clue).includes(victim.id)));

  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);

  const report = checkMurdererEpistemics(level);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.filter((world) => world.murdererId !== murderer.id).every((world) => world.status === 'NO_SOLUTION'));
});
