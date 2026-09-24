import assert from 'node:assert/strict';
import { test } from 'node:test';
import { roomForCell, tvStudioLevel } from '../../levels/46-tvstudio';
import { checkHiddenRoleEpistemics } from './epistemic';

test('tvstudio-01 uniquely identifies the hidden host as the murderer', () => {
  const report = checkHiddenRoleEpistemics(
    tvStudioLevel,
    'host',
    tvStudioLevel.people.filter((person) => !person.isVictim).map((person) => person.id),
  );
  const alternatives = report.worlds.filter((world) => world.status !== 'NO_SOLUTION');
  const host = tvStudioLevel.people.find((person) => person.roles?.includes('host'));
  const murderer = tvStudioLevel.people.find((person) => person.isMurderer);

  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.deepEqual(alternatives, []);
  assert.ok(host);
  assert.ok(murderer);
  assert.equal(host.id, murderer.id);
});

test('tvstudio-01 is a 9x9 level with a 9-person cast and a valid authored placement', () => {
  assert.equal(tvStudioLevel.size, 9);
  assert.equal(tvStudioLevel.people.length, 9);
  assert.equal(tvStudioLevel.cells.length, 81);
  assert.equal(new Set(Object.values(tvStudioLevel.solution)).size, 9);
  assert.ok(Object.values(tvStudioLevel.solution).every((id) => tvStudioLevel.cells.some((cell) => cell.id === id)));
  assert.equal(
    tvStudioLevel.clues.some((clue) => 'subject' in clue && clue.subject.type === 'person' &&
      tvStudioLevel.people.find((person) => person.id === clue.subject.id)?.isVictim),
    false,
  );

  const itemCells = tvStudioLevel.items.flatMap((item) => item.cells);
  assert.equal(new Set(itemCells).size, itemCells.length);
});

test('tvstudio-01 follows the late-night show design brief', () => {
  assert.equal(tvStudioLevel.meta.title, 'Очень позднее шоу');
  assert.equal(tvStudioLevel.clues.length, 13);
  assert.equal(tvStudioLevel.meta.clueBalanceExempt, true);
  for (const clueId of [
    'tv-bella-audience',
    'tv-bella-not-with-host',
    'tv-stage-pair',
    'tv-artem-north-of-esenia',
  ]) {
    assert.equal(tvStudioLevel.clues.some((clue) => clue.id === clueId), false, `${clueId} should be removed`);
  }

  const clueCounts = new Map<string, number>();
  for (const clue of tvStudioLevel.clues) clueCounts.set(clue.type, (clueCounts.get(clue.type) ?? 0) + 1);
  assert.equal(clueCounts.get('adjacency'), 4);
  for (const [type, count] of clueCounts) {
    assert.ok(count / tvStudioLevel.clues.length <= (type === 'adjacency' ? 0.31 : 0.2), `${type} exceeds its accepted share`);
  }

  assert.equal(tvStudioLevel.rooms.length, 7);
  assert.deepEqual(
    tvStudioLevel.rooms.map((room) => room.name),
    ['Редакторская', 'Эфирная студия', 'Закулисье', 'Зрительский зал', 'Музыкальная сцена', 'Аппаратная', 'Монтажная'],
  );
  assert.equal(tvStudioLevel.rooms.find((room) => room.id === 'musicStage')?.labelAlign, 'right');

  const generalClues = tvStudioLevel.clues.filter(
    (clue) => !('subject' in clue) || clue.subject.type !== 'person',
  );
  assert.ok(generalClues.length <= 5, `expected at most 5 general clues, got ${generalClues.length}`);

  const personalCluesByPerson = new Map<string, number>();
  for (const clue of tvStudioLevel.clues) {
    if ('subject' in clue && clue.subject.type === 'person') {
      personalCluesByPerson.set(clue.subject.id, (personalCluesByPerson.get(clue.subject.id) ?? 0) + 1);
    }
  }
  assert.ok(
    Math.max(...personalCluesByPerson.values()) <= 3,
    `expected at most 3 personal clues per person, got ${Math.max(...personalCluesByPerson.values())}`,
  );

  const parityClueCount = tvStudioLevel.clues.filter((clue) => clue.type === 'parity').length;
  assert.ok(parityClueCount <= 2, `expected at most 2 parity clues, got ${parityClueCount}`);

  const coveredCells = new Set([
    ...tvStudioLevel.items.flatMap((item) => item.cells),
    ...tvStudioLevel.cells.filter((cell) => cell.floorFeatureId).map((cell) => cell.id),
  ]);
  assert.ok(coveredCells.size >= Math.ceil(tvStudioLevel.size ** 2 * 0.4));
  assert.ok(coveredCells.size <= Math.floor(tvStudioLevel.size ** 2 * 0.5));

  const usedItemTypes = new Set(tvStudioLevel.items.map((item) => item.typeId));
  for (const typeId of ['directorConsole', 'studioSoftbox', 'newsDesk', 'sofa', 'movieCamera', 'camera', 'tv', 'computer', 'spotlight', 'micStand', 'seat', 'speaker', 'guitar', 'piano', 'bookshelf', 'clueBoard']) {
    assert.ok(usedItemTypes.has(typeId), `expected the agreed item type ${typeId}`);
  }

  const expectedGrid = [
    'editorial,editorial,editorial,studio,studio,studio,studio,studio,backstage',
    'editorial,editorial,editorial,studio,studio,studio,studio,studio,backstage',
    'editorial,editorial,audience,studio,studio,studio,studio,studio,backstage',
    'editorial,audience,audience,audience,audience,studio,studio,backstage,backstage',
    'editing,audience,audience,audience,audience,musicStage,musicStage,backstage,backstage',
    'editing,editing,audience,musicStage,musicStage,musicStage,musicStage,backstage,backstage',
    'editing,editing,audience,musicStage,musicStage,musicStage,musicStage,backstage,backstage',
    'editing,editing,editing,editing,control,control,control,backstage,backstage',
    'editing,editing,editing,control,control,control,control,backstage,backstage',
  ];
  for (let row = 0; row < tvStudioLevel.size; row++) {
    assert.equal(
      Array.from({ length: tvStudioLevel.size }, (_, col) => roomForCell(row, col)).join(','),
      expectedGrid[row],
      `unexpected room layout on row ${row + 1}`,
    );
  }

  const roomByCell = new Map(tvStudioLevel.cells.map((cell) => [cell.id, cell.roomId]));
  const table = tvStudioLevel.items.filter((item) => item.typeId === 'newsDesk');
  assert.equal(table.length, 1, 'the host desk belongs only on the эфирная сцена');
  assert.ok(table[0].cells.every((id) => roomByCell.get(id) === 'studio'));
  const deskCell = table[0].cells[0].split('-').map(Number);
  const sofas = tvStudioLevel.items.filter((item) => item.typeId === 'sofa');
  assert.ok(sofas.length >= 1 && sofas.length <= 2);
  for (const sofa of sofas) {
    assert.ok(sofa.cells.every((id) => roomByCell.get(id) === 'studio'));
    assert.ok(sofa.cells.some((id) => {
      const [row, col] = id.split('-').map(Number);
      return Math.abs(row - deskCell[0]) + Math.abs(col - deskCell[1]) === 1;
    }), `sofa ${sofa.id} must be next to the host desk`);
  }

  const seats = tvStudioLevel.items.filter((item) => item.typeId === 'seat');
  assert.ok(seats.length > 0);
  assert.ok(seats.every((item) => item.cells.every((id) => roomByCell.get(id) === 'audience')));

  const musicItemTypes = new Set(['guitar', 'piano', 'micStand', 'speaker']);
  assert.ok(tvStudioLevel.items.filter((item) => musicItemTypes.has(item.typeId)).length >= 5);
  assert.ok(tvStudioLevel.items
    .filter((item) => musicItemTypes.has(item.typeId))
    .every((item) => item.cells.every((id) => roomByCell.get(id) === 'musicStage')));

  const hostCarpetCells = tvStudioLevel.cells.filter((cell) => cell.floorFeatureId === 'host-mark');
  assert.equal(hostCarpetCells.length, 2);
  assert.deepEqual(new Set(hostCarpetCells.map((cell) => cell.roomId)), new Set(['studio', 'backstage']));

  const personIds = new Set(tvStudioLevel.people.map((person) => person.id));
  for (const clue of tvStudioLevel.clues) {
    const referencedPeople = [
      ...('subject' in clue && clue.subject.type === 'person' ? [clue.subject.id] : []),
      ...('otherPersonId' in clue ? [clue.otherPersonId] : []),
      ...('otherPersonId1' in clue ? [clue.otherPersonId1] : []),
      ...('otherPersonId2' in clue ? [clue.otherPersonId2] : []),
    ];
    for (const personId of referencedPeople) {
      assert.ok(personIds.has(personId), `clue ${clue.id} references missing person ${personId}`);
    }
  }

  for (const clue of tvStudioLevel.clues.filter((candidate) => candidate.type === 'floorTexture')) {
    const zoneCount = new Set(
      tvStudioLevel.rooms.filter((room) => room.floorTexture === clue.textureKey).map((room) => room.id),
    ).size;
    const featureUsesTexture = tvStudioLevel.cells.some((cell) => {
      const feature = tvStudioLevel.floorFeatures.find((candidate) => candidate.id === cell.floorFeatureId);
      return feature?.textureKey === clue.textureKey;
    });
    assert.ok(zoneCount > 1 || featureUsesTexture, `texture clue ${clue.id} must distinguish more than one zone`);
  }

  const cellsByRoom = new Map(tvStudioLevel.rooms.map((room) => [room.id, [] as typeof tvStudioLevel.cells]));
  for (const cell of tvStudioLevel.cells) cellsByRoom.get(cell.roomId)?.push(cell);
  let rectangularRooms = 0;
  let brokenRooms = 0;
  for (const cells of cellsByRoom.values()) {
    const rows = cells.map((cell) => cell.row);
    const cols = cells.map((cell) => cell.col);
    const boxArea = (Math.max(...rows) - Math.min(...rows) + 1) * (Math.max(...cols) - Math.min(...cols) + 1);
    if (boxArea === cells.length) rectangularRooms++;
    else brokenRooms++;
  }
  assert.equal(rectangularRooms, 0, 'the proposed grid uses irregular outlines for every zone');
  assert.ok(brokenRooms >= 4, `expected at least 4 broken room shapes, got ${brokenRooms}`);

  for (let index = 0; index < tvStudioLevel.size; index++) {
    const rowRooms = new Set(tvStudioLevel.cells.filter((cell) => cell.row === index).map((cell) => cell.roomId));
    const colRooms = new Set(tvStudioLevel.cells.filter((cell) => cell.col === index).map((cell) => cell.roomId));
    assert.ok(rowRooms.size > 1, `row ${index + 1} must cross room boundaries`);
    if (index === tvStudioLevel.size - 1) {
      assert.deepEqual(colRooms, new Set(['backstage']), 'the outermost column is the backstage corridor');
    } else {
      assert.ok(colRooms.size > 1, `column ${index + 1} must cross room boundaries`);
    }
  }
});
