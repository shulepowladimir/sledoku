import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restaurantLevel, roomForCell } from '../../levels/54-restaurant';
import { buildLevelIndex, isLegalTarget } from '../../src/engine/board';
import { cellId } from '../../src/types/level';
import { createEpistemicWorld } from './epistemic';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { evalClue, solveLevel } from './solve';

const peopleById = new Map(restaurantLevel.people.map((person) => [person.id, person]));
const victim = peopleById.get('khariton')!;
const generalClues = restaurantLevel.clues.filter((clue) => !('subject' in clue) || clue.subject.type === 'role');
const personalClues = restaurantLevel.clues.filter((clue) => 'subject' in clue && clue.subject.type === 'person');

const roomOfCell = (id: string) => {
  const [row, col] = id.split('-').map(Number);
  return roomForCell(row, col);
};

const personalClueDomain = (personId: string) => {
  const index = buildLevelIndex(restaurantLevel);
  const legalCells = restaurantLevel.cells.filter((cell) => isLegalTarget(index, restaurantLevel, cell.id));
  const clues = personalClues.filter((clue) => clue.subject.type === 'person' && clue.subject.id === personId);
  return legalCells.filter((cell) => clues.every((clue) => evalClue(
    clue,
    (candidateId) => candidateId === personId ? cell.id : undefined,
    restaurantLevel,
    index,
    false,
  ) !== false)).map((cell) => cell.id);
};

const itemCount = (roomId: string, typeId: string) => restaurantLevel.items.filter(
  (item) => item.typeId === typeId && item.cells.every((id) => roomOfCell(id) === roomId),
).length;

test('Острая критика preserves the exact 10x10 grid and authored placements', () => {
  const expectedGrid = [
    'chefOffice,chefOffice,chefOffice,kitchen,kitchen,courtyard,courtyard,courtyard,courtyard,courtyard',
    'chefOffice,chefOffice,chefOffice,kitchen,kitchen,courtyard,courtyard,courtyard,courtyard,courtyard',
    'chefOffice,chefOffice,kitchen,kitchen,kitchen,courtyard,courtyard,changing,changing,changing',
    'kitchen,kitchen,kitchen,kitchen,kitchen,changing,changing,changing,changing,changing',
    'kitchen,kitchen,kitchen,kitchen,kitchen,kitchen,kitchen,changing,terrace,terrace',
    'dining,dining,dining,dining,dining,dining,dining,dining,terrace,terrace',
    'dining,dining,dining,dining,dining,dining,dining,bar,terrace,terrace',
    'entrance,entrance,entrance,entrance,dining,dining,dining,bar,terrace,terrace',
    'entrance,entrance,entrance,vip,vip,vip,vip,bar,bar,terrace',
    'entrance,entrance,entrance,entrance,vip,vip,bar,bar,bar,terrace',
  ];

  assert.equal(restaurantLevel.meta.title, 'Острая критика');
  assert.equal(restaurantLevel.size, 10);
  assert.equal(restaurantLevel.cells.length, 100);
  assert.deepEqual(restaurantLevel.rooms.map((room) => room.id), [
    'chefOffice', 'kitchen', 'courtyard', 'changing', 'dining', 'entrance', 'terrace', 'bar', 'vip',
  ]);
  for (let row = 0; row < restaurantLevel.size; row++) {
    assert.equal(
      Array.from({ length: restaurantLevel.size }, (_, col) => roomForCell(row, col)).join(','),
      expectedGrid[row],
      `unexpected room layout on row ${row + 1}`,
    );
  }

  const expectedSolution = {
    anna: cellId(0, 2),
    boris: cellId(3, 1),
    vera: cellId(2, 9),
    galina: cellId(1, 5),
    denis: cellId(5, 3),
    esenia: cellId(4, 8),
    zhanna: cellId(8, 7),
    zoya: cellId(7, 0),
    inna: cellId(9, 4),
    khariton: cellId(6, 6),
  };
  assert.deepEqual(restaurantLevel.solution, expectedSolution);
  assert.equal(new Set(Object.values(expectedSolution).map((id) => id.split('-')[0])).size, 10);
  assert.equal(new Set(Object.values(expectedSolution).map((id) => id.split('-')[1])).size, 10);
  assert.deepEqual(new Set(restaurantLevel.people.map((person) => roomOfCell(restaurantLevel.solution[person.id]))),
    new Set(restaurantLevel.rooms.map((room) => room.id)));
});

test('Острая критика keeps the victim public and assigns the hidden roles to A and X', () => {
  assert.notEqual(restaurantLevel.meta.victimIdentityHidden, true);
  assert.equal(restaurantLevel.people.length, 10);
  assert.deepEqual(restaurantLevel.people.map((person) => person.initialLetter), ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Х']);
  assert.ok(restaurantLevel.people.every((person) => person.initialLetter === person.name[0]));
  assert.equal(victim.name, 'Харитон');
  assert.equal(victim.isVictim, true);
  assert.ok(victim.roles?.includes('critic'));
  assert.equal(peopleById.get('anna')?.roles?.includes('chef'), true);
  assert.equal(peopleById.get('denis')?.isMurderer, true);

  assert.deepEqual(
    restaurantLevel.people.filter((person) => person.roles?.includes('staff')).map((person) => person.initialLetter),
    ['А', 'Б', 'В', 'Г', 'Д'],
  );
  assert.deepEqual(
    restaurantLevel.people.filter((person) => person.roles?.includes('guest')).map((person) => person.initialLetter),
    ['Е', 'Ж', 'З', 'И', 'Х'],
  );
  assert.equal(lintLevel(restaurantLevel).length, 0, lintLevel(restaurantLevel).join('\n'));
  assert.equal(checkPuzzleQuality(restaurantLevel).fullyPinnedCount, 0);
  assert.deepEqual(checkPuzzleQuality(restaurantLevel).violations, []);
  assert.notEqual(restaurantLevel.meta.clueBalanceExempt, true);
  assert.ok(personalClueDomain('boris').length > 1, 'Boris must not be pinned by his own clues');
  const borisEvenColumnClue = personalClues.find((clue) => clue.id === 'restaurant-boris-even-column');
  assert.equal(borisEvenColumnClue?.type, 'parity');
  if (borisEvenColumnClue?.type === 'parity') {
    assert.deepEqual(borisEvenColumnClue.subject, { type: 'person', id: 'boris' });
    assert.equal(borisEvenColumnClue.axis, 'col');
    assert.equal(borisEvenColumnClue.parity, 'even');
    assert.equal(borisEvenColumnClue.text, 'Борис находился в столбце с чётным номером.');
  }
  const eseniaClue = personalClues.find((clue) => clue.id === 'restaurant-esenia-rug');
  assert.equal(eseniaClue?.type, 'floorTexture');
  if (eseniaClue?.type === 'floorTexture') {
    assert.equal(eseniaClue.textureKey, 'rug');
    assert.equal(eseniaClue.text, 'Есения находилась на ковре.');
  }
  assert.deepEqual(new Set(personalClueDomain('esenia').map(roomOfCell)), new Set(['chefOffice', 'dining', 'entrance', 'terrace']));
  const zoyaEntranceClue = personalClues.find((clue) => clue.id === 'restaurant-zoya-entrance');
  assert.equal(zoyaEntranceClue?.type, 'roomMembership');
  assert.equal(zoyaEntranceClue?.text, 'Зоя находилась на входе.');
});

test('Острая критика shows exactly the four agreed general clues and keeps all other clues personal', () => {
  const displayedGeneral = new Map<string, string>();
  for (const clue of generalClues) displayedGeneral.set(clue.groupId ?? clue.id, clue.text);

  assert.deepEqual([...displayedGeneral.values()], [
    'Все, чьи имена начинались с букв от А до Д, работали в ресторане; остальные были гостями.',
    'Среди сотрудников ресторана был шеф-повар, а среди гостей — критик.',
    'Шеф-повар находился в своём кабинете.',
    'Критик находился в одной зоне с сотрудником ресторана.',
  ]);
  assert.ok(personalClues.every((clue) => clue.subject.type === 'person'));
  assert.ok(!personalClues.some((clue) => /шеф-повар|критик|сотрудник|гост/i.test(clue.text)));
  assert.ok(!restaurantLevel.clues.some((clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === victim.id));
  assert.ok(!restaurantLevel.clues.some((clue) => 'otherPersonId' in clue && clue.otherPersonId === victim.id));

  const personalCountByPerson = new Map<string, number>();
  for (const clue of personalClues) {
    assert.equal(clue.subject.type, 'person');
    personalCountByPerson.set(clue.subject.id, (personalCountByPerson.get(clue.subject.id) ?? 0) + 1);
  }
  for (const person of restaurantLevel.people.filter((candidate) => !candidate.isVictim)) {
    assert.ok(personalCountByPerson.has(person.id), `${person.name} needs a visible personal clue`);
    assert.ok((personalCountByPerson.get(person.id) ?? 0) <= 3, `${person.name} has too many personal clues`);
  }
  assert.ok(new Set(personalClues.map((clue) => clue.type)).size >= 8, 'personal clue types should be broadly varied');

  const annaGlassClue = personalClues.find((clue) => clue.id === 'restaurant-anna-wine-glass');
  assert.equal(annaGlassClue?.type, 'adjacency');
  if (annaGlassClue?.type === 'adjacency') {
    assert.equal(annaGlassClue.subject.type, 'person');
    assert.equal(annaGlassClue.itemTypeId, 'wineGlass');
  }
  assert.ok(new Set(restaurantLevel.items
    .filter((item) => item.typeId === 'wineGlass')
    .map((item) => roomOfCell(item.cells[0]))).size >= 3, 'wine glasses should offer several plausible rooms');
});

test('Острая критика places every agreed prop in its intended room', () => {
  const expectedCounts: [string, string, number, number?][] = [
    ['chefOffice', 'workbench', 1], ['chefOffice', 'wineGlass', 1], ['chefOffice', 'tv', 1], ['chefOffice', 'sofa', 1], ['chefOffice', 'portrait', 1],
    ['kitchen', 'fridge', 2], ['kitchen', 'stove', 2], ['kitchen', 'fryingPan', 1], ['kitchen', 'plate', 1, 2],
    ['kitchen', 'kitchenIsland', 1], ['kitchen', 'waiterTrolley', 1], ['kitchen', 'servingCloche', 1], ['kitchen', 'trashcan', 1],
    ['courtyard', 'car', 1], ['courtyard', 'motorcycle', 1], ['courtyard', 'cat', 1], ['courtyard', 'trough', 1], ['courtyard', 'trashcan', 1],
    ['changing', 'locker', 2], ['changing', 'bench', 2],
    ['terrace', 'chair', 2], ['terrace', 'plant', 2], ['terrace', 'cat', 1],
    ['dining', 'fineDiningTable', 2], ['dining', 'chair', 2], ['dining', 'waiterTrolley', 1], ['dining', 'flowerVase', 1],
    ['dining', 'servingCloche', 1], ['dining', 'plate', 1], ['dining', 'wineGlass', 2],
    ['vip', 'fineDiningTable', 1], ['vip', 'flowerVase', 1], ['vip', 'wineGlass', 1], ['vip', 'chair', 1],
    ['entrance', 'wardrobe', 1], ['entrance', 'rack', 1], ['entrance', 'flowerVase', 1], ['entrance', 'makeupMirror', 1], ['entrance', 'sofa', 1],
    ['bar', 'barCounter', 1], ['bar', 'wineRack', 1], ['bar', 'wineGlass', 1],
  ];

  for (const [roomId, typeId, minimum, maximum = minimum] of expectedCounts) {
    const count = itemCount(roomId, typeId);
    assert.ok(count >= minimum && count <= maximum, `${roomId} should have ${minimum}${maximum === minimum ? '' : `–${maximum}`} ${typeId}, found ${count}`);
  }

  const itemCells = restaurantLevel.items.flatMap((item) => item.cells);
  assert.equal(new Set(itemCells).size, itemCells.length, 'different props must not overlap');
  const occupiableItemTypes = new Set(restaurantLevel.itemTypes.filter((type) => type.kind === 'occupiable').map((type) => type.id));
  for (const item of restaurantLevel.items) {
    assert.ok(item.cells.every((id) => restaurantLevel.cells.some((cell) => cell.id === id)), `${item.id} must use board cells`);
    assert.equal(new Set(item.cells.map(roomOfCell)).size, 1, `${item.id} must stay in one room`);
  }
  for (const person of restaurantLevel.people) {
    const target = restaurantLevel.solution[person.id];
    assert.ok(!restaurantLevel.items.some((item) => item.cells.includes(target) && !occupiableItemTypes.has(item.typeId)), `${person.name} cannot be blocked by a decorative prop`);
  }
});

test('Острая критика distributes kitchen and dining props across their room footprints', () => {
  const kitchenItems = restaurantLevel.items.flatMap((item) => item.cells.filter((id) => roomOfCell(id) === 'kitchen'));
  const diningItems = restaurantLevel.items.flatMap((item) => item.cells.filter((id) => roomOfCell(id) === 'dining'));
  const coordinates = (ids: string[], axis: 'row' | 'col') => ids.map((id) => {
    const [row, col] = id.split('-').map(Number);
    return axis === 'row' ? row : col;
  });
  const occupiedKitchenRows = new Set(coordinates(kitchenItems, 'row'));
  const occupiedKitchenCols = coordinates(kitchenItems, 'col');
  const occupiedDiningRows = new Set(coordinates(diningItems, 'row'));

  assert.equal(kitchenItems.length, 12);
  assert.equal(new Set(kitchenItems).size, 12);
  assert.equal(occupiedKitchenRows.size, 5);
  assert.equal(Math.min(...occupiedKitchenCols), 0);
  assert.equal(Math.max(...occupiedKitchenCols), 6);
  assert.equal(restaurantLevel.cells.filter((cell) => cell.roomId === 'kitchen' && !kitchenItems.includes(cell.id)).length, 7);
  assert.ok(!kitchenItems.includes(restaurantLevel.solution.boris), 'Boris needs a clear kitchen cell');

  assert.equal(diningItems.length, 10);
  assert.equal(new Set(diningItems).size, 10);
  assert.equal(occupiedDiningRows.size, 3);
  assert.equal(restaurantLevel.cells.filter((cell) => cell.roomId === 'dining' && !diningItems.includes(cell.id)).length, 8);
  assert.ok(!diningItems.includes(restaurantLevel.solution.denis), 'Denis needs a clear dining cell');
  assert.ok(!diningItems.includes(restaurantLevel.solution.khariton), 'Hariton needs a clear dining cell');
});

test('Острая критика places rugs, courtyard puddles, and kitchen hatches as floor features', () => {
  const featureById = new Map(restaurantLevel.floorFeatures.map((feature) => [feature.id, feature]));
  const roomIdsByFeature = new Map<string, Set<string>>();
  for (const cell of restaurantLevel.cells) {
    if (!cell.floorFeatureId) continue;
    const rooms = roomIdsByFeature.get(cell.floorFeatureId) ?? new Set<string>();
    rooms.add(cell.roomId);
    roomIdsByFeature.set(cell.floorFeatureId, rooms);
  }

  assert.equal(featureById.get('office-rug')?.textureKey, 'rug');
  assert.equal(featureById.get('dining-rug')?.textureKey, 'rug');
  assert.equal(featureById.get('entrance-rug')?.textureKey, 'rug');
  assert.equal(featureById.get('terrace-rug')?.textureKey, 'rug');
  assert.deepEqual(roomIdsByFeature.get('office-rug'), new Set(['chefOffice']));
  assert.deepEqual(roomIdsByFeature.get('dining-rug'), new Set(['dining']));
  assert.deepEqual(roomIdsByFeature.get('entrance-rug'), new Set(['entrance']));
  assert.deepEqual(roomIdsByFeature.get('terrace-rug'), new Set(['terrace']));
  assert.equal(featureById.get('courtyard-puddle')?.textureKey, 'water');
  assert.deepEqual(roomIdsByFeature.get('courtyard-puddle'), new Set(['courtyard']));
  assert.equal(featureById.get('kitchen-hatch')?.textureKey, 'metal');
  assert.deepEqual(roomIdsByFeature.get('kitchen-hatch'), new Set(['kitchen']));
  for (const featureId of ['office-rug', 'dining-rug', 'entrance-rug', 'terrace-rug']) {
    const featureCells = restaurantLevel.cells.filter((cell) => cell.floorFeatureId === featureId);
    assert.ok(featureCells.length > 0, `${featureId} needs floor cells`);
    assert.ok(featureCells.every((cell) => !cell.itemId), `${featureId} must stay visible and accessible`);
  }
});

test('Острая критика uniquely solves the visible clues and all three role facts are load-bearing', () => {
  assert.equal(solveLevel(restaurantLevel).status, 'PROVEN_UNIQUE');

  const staffIds = restaurantLevel.people.filter((person) => person.roles?.includes('staff')).map((person) => person.id);
  const guestIds = restaurantLevel.people.filter((person) => person.roles?.includes('guest')).map((person) => person.id);
  const murdererIds = restaurantLevel.people.filter((person) => !person.isVictim).map((person) => person.id);
  const expectedChefId = 'anna';
  const expectedCriticId = 'khariton';
  const expectedMurdererId = 'denis';

  for (const chefId of staffIds) {
    const world = createEpistemicWorld(restaurantLevel, 'chef', chefId, expectedMurdererId);
    assert.equal(solveLevel(world).status, chefId === expectedChefId ? 'PROVEN_UNIQUE' : 'NO_SOLUTION', `chef=${chefId}`);
  }
  for (const criticId of guestIds) {
    let world = createEpistemicWorld(restaurantLevel, 'chef', expectedChefId, expectedMurdererId);
    world = createEpistemicWorld(world, 'critic', criticId, expectedMurdererId);
    assert.equal(solveLevel(world).status, criticId === expectedCriticId ? 'PROVEN_UNIQUE' : 'NO_SOLUTION', `critic=${criticId}`);
  }
  for (const murdererId of murdererIds) {
    const world = createEpistemicWorld(restaurantLevel, 'chef', expectedChefId, murdererId);
    assert.equal(solveLevel(world).status, murdererId === expectedMurdererId ? 'PROVEN_UNIQUE' : 'NO_SOLUTION', `murderer=${murdererId}`);
  }
});
