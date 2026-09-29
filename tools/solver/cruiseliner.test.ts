import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { gameLevels } from '../../levels';
import { checkMurdererEpistemics } from './epistemic';
import { checkPuzzleQuality } from './puzzleQuality';
import { computeUnaryDomain, solveLevel, evalClue } from './solve';
import { checkLevelAcceptance } from './acceptance';

const level = gameLevels.find((candidate) => candidate.meta.id === 'cruiseliner-01');

const approvedLayout = [
  'MBBBBRROOOO',
  'MBBBBRRKOOO',
  'MBBBBBRKKOO',
  'MMBBBZRKKNO',
  'MMZZZZRKNNO',
  'MMZZZZRKNNO',
  'MMZZZZRRRNO',
  'MTTTTTKRROO',
  'MTTTTTKROOO',
  'MKKKKKKOOOO',
];

test('cruise liner has the approved 10x11 map, cast, and crew/passenger split', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  assert.equal(level.meta.title, 'Круиз в один конец');
  assert.equal(level.size, 10);
  assert.equal(level.cols, 11);
  assert.equal(level.cells.length, 110);
  assert.equal(level.rooms.length, 9);
  assert.deepEqual(
    level.people.map((person) => person.initialLetter),
    ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Х'],
  );

  const roomNameById = new Map(level.rooms.map((room) => [room.id, room.name]));
  const codeByName = new Map([
    ['Мостик', 'M'],
    ['Палуба с бассейном', 'B'],
    ['Ресторан', 'R'],
    ['Каюты', 'K'],
    ['Казино', 'Z'],
    ['Палуба на носу', 'N'],
    ['Теннисный корт', 'T'],
    ['Океан', 'O'],
  ]);
  const actualLayout = Array.from({ length: level.size }, (_, row) =>
    Array.from({ length: level.cols }, (_, col) => {
      const cell = level.cells.find((candidate) => candidate.row === row && candidate.col === col);
      assert.ok(cell, `missing cell at ${row},${col}`);
      const code = codeByName.get(roomNameById.get(cell.roomId)!);
      assert.ok(code, `unknown room ${cell.roomId}`);
      return code;
    }).join(''),
  );
  assert.deepEqual(actualLayout, approvedLayout);
  assert.equal(roomNameById.get('bridge'), 'Мостик');
  for (const room of level.rooms) {
    assert.equal(room.labelPosition ?? 'bottom', 'bottom', `${room.id} label should be at the bottom`);
  }

  const cabins = level.rooms.filter((room) => room.name === 'Каюты');
  assert.equal(cabins.length, 2, 'the two cabins share a visible name but remain separate rooms');
  assert.notEqual(cabins[0].id, cabins[1].id);

  const rolesByLetter = new Map(level.people.map((person) => [person.initialLetter, person.roles ?? []]));
  for (const letter of ['А', 'Б', 'В', 'Г', 'Д']) assert.ok(rolesByLetter.get(letter)?.includes('crew'));
  for (const letter of ['Е', 'Ж', 'З', 'И', 'Х']) assert.ok(rolesByLetter.get(letter)?.includes('passenger'));
  assert.equal(level.people.filter((person) => person.roles?.includes('crew')).length, 5);
  assert.equal(level.people.filter((person) => person.roles?.includes('passenger')).length, 5);
  assert.equal(level.people.find((person) => person.isVictim)?.initialLetter, 'Х');
});

test('cruise liner encodes the agreed shared rules and informative water texture', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  const disjunction = level.clues.find((clue) => clue.type === 'zoneEmptyDisjunction');
  assert.ok(disjunction);
  assert.deepEqual(new Set(disjunction.roomIds), new Set(['bridge', 'ocean']));
  assert.equal(disjunction.text, 'Или на мостике, или в океане никого не было.');

  const rangeRole = level.clues.find((clue) => clue.type === 'letterRangeRole');
  assert.ok(rangeRole);
  assert.equal(rangeRole.fromLetter, 'А');
  assert.equal(rangeRole.toLetter, 'Д');
  assert.equal(rangeRole.roleId, 'crew');

  const passengerBridgeLimit = level.clues.find(
    (clue) => clue.type === 'roleZoneLimit' && clue.roleId === 'passenger',
  );
  assert.ok(passengerBridgeLimit);
  assert.equal(passengerBridgeLimit.maxCount, 0);
  assert.deepEqual(passengerBridgeLimit.roomIds, ['bridge']);
  assert.equal(passengerBridgeLimit.text, 'Пассажиры не допускались на мостик.');

  assert.equal(level.rooms.find((room) => room.id === 'pool')?.floorTexture, 'tile');
  assert.equal(level.rooms.find((room) => room.id === 'ocean')?.floorTexture, 'water');
  assert.ok(level.floorFeatures.some((feature) => feature.id === 'pool-water' && feature.textureKey === 'water'));
  const waterClue = level.clues.find((clue) => clue.type === 'floorTexture' && clue.textureKey === 'water');
  assert.ok(waterClue, 'the shared water texture should support a personal clue');
  assert.equal(waterClue.text, 'Борис был в воде.');
  assert.ok(!level.clues.some((clue) =>
    clue.subject?.type === 'person'
    && clue.subject.id === 'boris'
    && clue.type === 'sameRoomAsItem'
    && clue.itemTypeId === 'beachUmbrella',
  ), 'Boris must not be explicitly placed in the unique umbrella zone');
  if (waterClue && 'subject' in waterClue && waterClue.subject?.type === 'person') {
    const index = buildLevelIndex(level);
    assert.equal(
      evalClue(waterClue, (personId) => level.solution[personId], level, index, true),
      true,
    );
  } else {
    assert.fail('the water-texture clue must identify a person');
  }

  const victimId = level.people.find((person) => person.isVictim)?.id;
  assert.ok(victimId);
  assert.ok(!level.clues.some((clue) =>
    ('subject' in clue && clue.subject?.type === 'person' && clue.subject.id === victimId)
    || ('otherPersonId' in clue && clue.otherPersonId === victimId),
  ));
});

test('cruise liner places the approved new props and keeps a balanced occupied-item count', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  const itemTypeById = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  const itemsByType = (typeId: string) => level.items.filter((item) => item.typeId === typeId);

  assert.equal(itemsByType('tennisRacket').length, 2);
  assert.equal(itemsByType('tennisBall').length, 1);
  assert.equal(itemsByType('iceCream').length, 2);
  assert.equal(itemsByType('anchorWinch').length, 1);

  const tennisNet = itemTypeById.get('tennisNet');
  assert.ok(tennisNet);
  assert.equal(tennisNet.render, 'span');
  assert.deepEqual(itemsByType('tennisNet').map((item) => item.cells), [[cellId(7, 3), cellId(8, 3)]]);

  const itemById = new Map(level.items.map((item) => [item.id, item]));
  const occupiedItemPeople = level.people.filter((person) => {
    const cell = level.cells.find((candidate) => candidate.id === level.solution[person.id]);
    const item = cell?.itemId ? itemById.get(cell.itemId) : undefined;
    return item && itemTypeById.get(item.typeId)?.kind === 'occupiable';
  }).length;
  assert.ok(occupiedItemPeople >= 3 && occupiedItemPeople <= 6, `unexpected occupied-item count: ${occupiedItemPeople}`);

  const occupiedCells = level.items.reduce((total, item) => total + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length;
  assert.ok(occupiedCells / level.cells.length >= 0.4, 'item and floor-feature density must be at least 40%');
});

test('cruise liner places the agreed props in the right zones and uses the approved pool cells', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  const roomByCell = new Map(level.cells.map((cell) => [cell.id, cell.roomId]));
  const itemTypeById = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  const itemsInRoom = (roomId: string) => level.items.filter(
    (item) => item.cells.every((id) => roomByCell.get(id) === roomId),
  );
  const typesInRoom = (roomId: string) => new Set(itemsInRoom(roomId).map((item) => item.typeId));
  const includesTypes = (actual: Set<string>, expected: string[]) => {
    for (const typeId of expected) assert.ok(actual.has(typeId), `missing ${typeId}`);
  };
  const countType = (roomId: string, typeId: string) => itemsInRoom(roomId).filter((item) => item.typeId === typeId).length;

  const bridgeTypes = typesInRoom('bridge');
  includesTypes(bridgeTypes, ['wheel', 'computer', 'lamp', 'radioStation', 'satelliteDish']);
  assert.equal(countType('bridge', 'computer'), 2);
  assert.equal(countType('bridge', 'satelliteDish'), 2);
  assert.ok(!bridgeTypes.has('table'), 'the bridge must not contain the unplanned table');

  const poolTypes = typesInRoom('pool');
  includesTypes(poolTypes, [
    'inflatableMattress', 'palm', 'slide', 'sunLounger', 'beachUmbrella',
    'beachChair', 'iceCream', 'speaker',
  ]);
  assert.equal(countType('pool', 'inflatableMattress'), 2);
  assert.equal(countType('pool', 'palm'), 1);
  assert.equal(countType('pool', 'slide'), 1);
  assert.equal(countType('pool', 'sunLounger'), 2);
  assert.equal(countType('pool', 'beachChair'), 2);
  assert.equal(countType('pool', 'iceCream'), 1);
  assert.equal(countType('pool', 'speaker'), 1);
  assert.ok(!poolTypes.has('ladder'), 'the pool must not contain the unplanned ladder');
  assert.ok(!poolTypes.has('lifebuoy'), 'lifebuoys belong in the ocean and on the bow');

  const poolWater = new Set(level.cells.filter((cell) => cell.floorFeatureId === 'pool-water').map((cell) => cell.id));
  assert.deepEqual(
    [...poolWater].sort(),
    [cellId(1, 2), cellId(1, 3), cellId(1, 4), cellId(2, 4), cellId(2, 5)].sort(),
  );
  assert.ok([...poolWater].every((id) => roomByCell.get(id) === 'pool'));
  const poolsideTypes = new Set(['palm', 'slide', 'sunLounger', 'beachUmbrella', 'beachChair', 'iceCream', 'speaker']);
  for (const item of itemsInRoom('pool').filter((candidate) => poolsideTypes.has(candidate.typeId))) {
    assert.ok(item.cells.every((id) => !poolWater.has(id)), `${item.id} must be beside the pool, not in the water`);
  }
  for (const mattress of itemsInRoom('pool').filter((item) => item.typeId === 'inflatableMattress')) {
    assert.ok(mattress.cells.every((id) => poolWater.has(id)), `${mattress.id} must float in the pool`);
  }

  const restaurantTypes = typesInRoom('restaurant');
  includesTypes(restaurantTypes, [
    'fineDiningTable', 'chair', 'flowerVase', 'wineGlass', 'servingCloche', 'barCounter', 'barStool', 'iceCream',
  ]);
  assert.equal(countType('restaurant', 'fineDiningTable'), 2);
  assert.ok(!restaurantTypes.has('table'), 'restaurant dining tables must have tablecloths');

  const satelliteDishes = itemsInRoom('bridge').filter((item) => item.typeId === 'satelliteDish');
  assert.equal(satelliteDishes.length, 2);
  const [firstDishCell] = satelliteDishes[0].cells.map((id) => level.cells.find((cell) => cell.id === id)!);
  const [secondDishCell] = satelliteDishes[1].cells.map((id) => level.cells.find((cell) => cell.id === id)!);
  assert.ok(Math.abs(firstDishCell.row - secondDishCell.row) + Math.abs(firstDishCell.col - secondDishCell.col) > 1);

  const restaurantTables = itemsInRoom('restaurant').filter((item) => item.typeId === 'fineDiningTable');
  const [firstTableCell] = restaurantTables[0].cells.map((id) => level.cells.find((cell) => cell.id === id)!);
  const [secondTableCell] = restaurantTables[1].cells.map((id) => level.cells.find((cell) => cell.id === id)!);
  assert.ok(Math.abs(firstTableCell.row - secondTableCell.row) + Math.abs(firstTableCell.col - secondTableCell.col) > 1);

  const decorativeCells = new Set(level.itemTypes.filter((type) => type.kind === 'decorative').map((type) => type.id));
  const itemById = new Map(level.items.map((item) => [item.id, item]));
  const restaurantCellByPosition = new Map(level.cells.map((cell) => [`${cell.row}-${cell.col}`, cell]));
  const decorativeAt = (row: number, col: number) => {
    const cell = restaurantCellByPosition.get(`${row}-${col}`);
    const item = cell?.itemId ? itemById.get(cell.itemId) : undefined;
    return cell?.roomId === 'restaurant' && item && decorativeCells.has(item.typeId);
  };
  let maxDecorativeColumnRun = 0;
  for (let col = 0; col < level.cols; col++) {
    let run = 0;
    for (let row = 0; row < level.size; row++) {
      run = decorativeAt(row, col) ? run + 1 : 0;
      maxDecorativeColumnRun = Math.max(maxDecorativeColumnRun, run);
    }
  }
  assert.ok(maxDecorativeColumnRun <= 3, `restaurant has a run of ${maxDecorativeColumnRun} decorative items in one column`);

  includesTypes(typesInRoom('cabinUpper'), ['bed', 'chair', 'berth', 'suitcase']);
  includesTypes(typesInRoom('cabinLower'), ['bathtub', 'chair', 'bed']);
  for (const [roomId, addedTypes] of [['cabinUpper', ['bed', 'chair']], ['cabinLower', ['bathtub', 'chair']]] as const) {
    for (const typeId of addedTypes) {
      assert.equal(countType(roomId, typeId), 1);
      assert.equal(itemTypeById.get(typeId)?.kind, 'occupiable', `${typeId} must not block a cabin cell`);
    }
  }

  assert.equal(countType('ocean', 'lifebuoy'), 2);
  includesTypes(typesInRoom('ocean'), ['yacht', 'lifeboat']);
  assert.equal(countType('nose', 'anchorWinch'), 1);
  assert.equal(countType('nose', 'lifebuoy'), 1);
  assert.ok(!typesInRoom('nose').has('lamp'), 'the bridge lamp must not drift back to the bow');
  assert.equal(countType('casino', 'slotMachine'), 2);
  assert.equal(countType('casino', 'rouletteTable'), 2);
  assert.equal(countType('casino', 'pokerTable'), 1);
  assert.deepEqual(
    itemsInRoom('ocean').find((item) => item.id === 'ocean-lifeboat')?.cells,
    [cellId(8, 9), cellId(8, 10)],
  );
  assert.equal(level.solution.zhdan, cellId(8, 10), 'Zhdan is safely in the lifeboat rather than standing in open ocean');

  assert.deepEqual(
    Object.fromEntries(level.rooms.map((room) => [room.id, room.floorTexture])),
    {
      bridge: 'workshopFloor',
      pool: 'tile',
      restaurant: 'marble',
      cabinUpper: 'wood',
      cabinLower: 'wood',
      casino: 'checker',
      nose: 'cobble',
      tennis: 'grass',
      ocean: 'water',
    },
  );

  const tennisNet = itemTypeById.get('tennisNet');
  assert.ok(tennisNet);
  assert.equal(tennisNet.render, 'span', 'the net must draw once across its vertical polyomino');
  assert.equal(tennisNet.tileEdgeDepth, undefined, 'the standalone net must not use foliage tile decorations');
  assert.deepEqual(
    level.items.find((item) => item.typeId === 'tennisNet')?.cells,
    [cellId(7, 3), cellId(8, 3)],
  );
});

test('cruise liner uses item-led clue variety and avoids directional clue chains', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  const personalClues = (personId: string) => level.clues.filter(
    (clue) => 'subject' in clue && clue.subject?.type === 'person' && clue.subject.id === personId,
  );
  const hasPersonalClue = (personId: string, type: string, itemTypeId?: string) => personalClues(personId).some(
    (clue) => clue.type === type && (!itemTypeId || ('itemTypeId' in clue && clue.itemTypeId === itemTypeId)),
  );

  assert.equal(level.clues.filter((clue) => clue.type === 'relativePosition').length, 0);
  assert.ok(hasPersonalClue('galina', 'adjacency', 'rouletteTable'));
  assert.ok(!personalClues('galina').some((clue) => 'otherPersonId' in clue && clue.otherPersonId === 'valeria'));
  assert.ok(!personalClues('valeria').some((clue) => clue.type === 'roomMembership'));
  assert.equal(personalClues('valeria').length, 1);
  assert.ok(hasPersonalClue('galina', 'sameRowOrColumnAsItem', 'wineGlass'));
  assert.ok(hasPersonalClue('andrey', 'adjacency', 'chair'));
  assert.ok(hasPersonalClue('boris', 'sameRowOrColumnAsItem', 'sunLounger'));
  assert.ok(hasPersonalClue('elena', 'adjacency', 'chair'));
  assert.ok(hasPersonalClue('elena', 'sameRoomAsItem', 'suitcase'));
  assert.ok(hasPersonalClue('zoya', 'sameRoomAsItem', 'lifebuoy'));
  assert.ok(hasPersonalClue('zoya', 'sameRowOrColumnAsItem', 'anchorWinch'));
  assert.ok(!personalClues('zoya').some((clue) => 'otherPersonId' in clue && clue.otherPersonId === 'galina'));
  assert.equal(personalClues('zoya').length, 2);
  assert.ok(!personalClues('denis').some((clue) => clue.type === 'roomMembership'));
  assert.equal(personalClues('denis').length, 1);
  assert.ok(personalClues('denis').some((clue) => clue.type === 'wallSide' && clue.text === 'Денис стоял у северной стены теннисного корта.'));
  assert.ok(hasPersonalClue('zhdan', 'sameRowOrColumnAsItem', 'bed'));
  assert.ok(!hasPersonalClue('zhdan', 'sameRoomAsItem', 'bed'));
  assert.ok(hasPersonalClue('inna', 'occupiesItem', 'bed'));
  assert.ok(!hasPersonalClue('inna', 'sameRoomAsItem', 'bed'));
  assert.ok(personalClues('inna').some((clue) => clue.type === 'wallSide' && clue.wallDirection === 'south'));

  const itemLedTypes = new Set(['adjacency', 'floorTexture', 'sameRoomAsItem', 'sameRowOrColumnAsItem', 'occupiesItem']);
  const usedItemLedTypes = new Set(level.clues.filter((clue) => itemLedTypes.has(clue.type)).map((clue) => clue.type));
  assert.ok(usedItemLedTypes.size >= 5, `expected 5 item-led clue types, got ${[...usedItemLedTypes].join(', ')}`);

  const index = buildLevelIndex(level);
  const legalCells = level.cells.filter((cell) => isLegalTarget(index, level, cell.id));
  const borisDomain = computeUnaryDomain(level, index, legalCells, 'boris');
  assert.deepEqual(
    new Set(borisDomain.map((id) => index.cellsById.get(id)!.roomId)),
    new Set(['pool', 'ocean']),
    'the water clue should leave Boris plausibly in either the pool or the ocean',
  );

  const bridgeCandidate = cellId(8, 0);
  const candidatePlacement = (personId: string) => personId === 'zhdan' ? bridgeCandidate : level.solution[personId];
  assert.ok(isLegalTarget(index, level, bridgeCandidate), 'the bridge alternative must be a legal, unoccupied cell');
  for (const clue of personalClues('zhdan')) {
    assert.equal(evalClue(clue, candidatePlacement, level, index, true), true, `${clue.id} should allow the bridge candidate`);
  }
  const passengerBridgeLimit = level.clues.find((clue) => clue.type === 'roleZoneLimit' && clue.roleId === 'passenger');
  assert.ok(passengerBridgeLimit);
  assert.deepEqual(
    level.clues
      .filter((clue) => clue.id !== passengerBridgeLimit.id)
      .filter((clue) => evalClue(clue, candidatePlacement, level, index, true) !== true)
      .map((clue) => clue.id),
    [],
    'every other player-visible rule allows this passenger-on-bridge alternative',
  );
  const candidateCells = level.people.map((person) => index.cellsById.get(candidatePlacement(person.id))!);
  assert.equal(new Set(candidateCells.map((cell) => cell.row)).size, level.people.length);
  assert.equal(new Set(candidateCells.map((cell) => cell.col)).size, level.people.length);
  assert.equal(evalClue(passengerBridgeLimit, candidatePlacement, level, index, true), false);
  const withoutPassengerLimit = solveLevel({
    ...level,
    clues: level.clues.filter((clue) => clue.id !== passengerBridgeLimit.id),
  });
  assert.equal(withoutPassengerLimit.status, 'MULTIPLE');
  if (withoutPassengerLimit.status === 'MULTIPLE') {
    assert.equal(withoutPassengerLimit.alternate.zhdan, bridgeCandidate);
    assert.equal(withoutPassengerLimit.matchesAuthored, true);
  }
});

test('cruise liner keeps every room, item footprint, and walkable route connected', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  const neighbors = (id: string) => {
    const [row, col] = id.split('-').map(Number);
    return [`${row - 1}-${col}`, `${row + 1}-${col}`, `${row}-${col - 1}`, `${row}-${col + 1}`];
  };
  const isConnected = (ids: string[]) => {
    const allowed = new Set(ids);
    const reached = new Set<string>();
    const pending = ids.length > 0 ? [ids[0]] : [];
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (reached.has(current)) continue;
      reached.add(current);
      for (const next of neighbors(current)) if (allowed.has(next) && !reached.has(next)) pending.push(next);
    }
    return reached.size === ids.length;
  };

  for (const room of level.rooms) {
    const roomCells = level.cells.filter((cell) => cell.roomId === room.id).map((cell) => cell.id);
    assert.ok(isConnected(roomCells), `${room.id} must be a connected zone`);
  }
  for (const item of level.items) assert.ok(isConnected(item.cells), `${item.id} must have a connected footprint`);

  const itemById = new Map(level.items.map((item) => [item.id, item]));
  const itemTypeById = new Map(level.itemTypes.map((itemType) => [itemType.id, itemType]));
  const walkableCells = level.cells.filter((cell) => {
    if (!cell.itemId) return true;
    return itemTypeById.get(itemById.get(cell.itemId)!.typeId)?.kind === 'occupiable';
  });
  assert.ok(isConnected(walkableCells.map((cell) => cell.id)), 'walkable cells must remain connected');
  assert.ok(
    level.cells.filter((cell) => cell.floorFeatureId === 'pool-water').every((cell) => cell.roomId === 'pool'),
    'the pool-water feature must remain inside the pool zone',
  );
});

test('cruise liner has a unique, fair solution and no fully pinned people', () => {
  assert.ok(level, 'cruiseliner-01 must be registered');
  assert.equal(solveLevel(level).status, 'PROVEN_UNIQUE');

  const rows = new Set<number>();
  const cols = new Set<number>();
  const index = buildLevelIndex(level);
  for (const person of level.people) {
    const cell = index.cellsById.get(level.solution[person.id]);
    assert.ok(cell, `missing solution cell for ${person.id}`);
    assert.ok(!rows.has(cell.row), `row ${cell.row} is occupied more than once`);
    assert.ok(!cols.has(cell.col), `column ${cell.col} is occupied more than once`);
    rows.add(cell.row);
    cols.add(cell.col);
  }

  const victim = level.people.find((person) => person.isVictim)!;
  const murderer = level.people.find((person) => person.isMurderer)!;
  const victimCell = index.cellsById.get(level.solution[victim.id])!;
  const murdererCell = index.cellsById.get(level.solution[murderer.id])!;
  assert.notEqual(victimCell.id, murdererCell.id);
  assert.equal(victimCell.roomId, murdererCell.roomId);
  assert.equal(level.people.filter((person) => index.cellsById.get(level.solution[person.id])!.roomId === victimCell.roomId).length, 2);

  const quality = checkPuzzleQuality(level);
  assert.equal(quality.fullyPinnedCount, 0);
  assert.deepEqual(quality.violations, []);
  for (const person of level.people.filter((candidate) => !candidate.isVictim)) {
    const clueCount = level.clues.filter(
      (clue) => clue.subject?.type === 'person' && clue.subject.id === person.id,
    ).length;
    assert.ok(clueCount >= 1 && clueCount <= 3, `${person.name} has ${clueCount} personal clues`);
  }
  assert.deepEqual(checkLevelAcceptance(level, quality.fullyPinnedCount), []);

  const report = checkMurdererEpistemics(level);
  assert.equal(report.baseline, 'PROVEN_UNIQUE');
  assert.ok(report.worlds.every((world) => world.status === 'NO_SOLUTION'));
});
