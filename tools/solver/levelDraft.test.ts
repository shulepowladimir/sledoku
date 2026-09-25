import assert from 'node:assert/strict';
import { test } from 'node:test';
import { elapsedMsNow } from '../../src/engine/selectors';
import { apartmentLevel } from '../../levels/01-apartment';
import {
  isInProgressLevelDraft,
  mergeLevelDraftMaps,
  restoreLevelDraft,
  serializeLevelDraft,
  tombstoneLevelDraft,
  type LevelDraft,
} from '../../src/utils/levelDraft';

test('level draft serialization preserves placements and marks while freezing elapsed time', () => {
  const personId = apartmentLevel.people[0].id;
  const [cellId, markCellId] = apartmentLevel.cells.filter((cell) => !cell.itemId).slice(0, 2).map((cell) => cell.id);
  const player = {
    placements: { [personId]: cellId },
    cellMarks: {
      [markCellId]: { pencilMarks: new Set([personId]), manualCross: true, autoCrossSources: new Set([personId]) },
    },
    timer: { startedAt: 1_000, elapsedMs: 2_000, running: true, finishedAt: null },
    lastResult: null,
  };

  const draft = serializeLevelDraft(apartmentLevel.meta.id, player, 5_000);
  const restored = restoreLevelDraft(draft, apartmentLevel, 10_000);

  assert.deepEqual(restored?.placements, player.placements);
  assert.deepEqual([...restored!.cellMarks[markCellId]!.pencilMarks], [personId]);
  assert.equal(restored!.cellMarks[markCellId]!.manualCross, true);
  assert.deepEqual([...restored!.cellMarks[markCellId]!.autoCrossSources], [personId]);
  assert.equal(restored?.timer.elapsedMs, 6_000);
  assert.equal(restored?.timer.startedAt, 10_000);
  assert.equal(restored?.timer.running, true);
});

test('completed level snapshots restore the solved board and frozen timer without becoming in-progress', () => {
  const now = 6_000;
  const solvedPlayer = {
    placements: { ...apartmentLevel.solution },
    cellMarks: {},
    timer: { startedAt: 1_000, elapsedMs: 30_000, running: false, finishedAt: now },
    lastResult: {
      checkedAt: now,
      perPerson: Object.fromEntries(apartmentLevel.people.map((person) => [person.id, 'correct' as const])),
      allCorrect: true,
    },
  };

  const snapshot = serializeLevelDraft(apartmentLevel.meta.id, solvedPlayer, now);
  const restored = restoreLevelDraft(snapshot, apartmentLevel, 20_000);

  assert.equal(snapshot.completed, true);
  assert.ok(restored);
  assert.deepEqual(restored.placements, apartmentLevel.solution);
  assert.equal(restored.timer.startedAt, null);
  assert.equal(restored.timer.running, false);
  assert.notEqual(restored.timer.finishedAt, null);
  assert.equal(elapsedMsNow(restored, 30_000), 35_000);
  assert.equal(isInProgressLevelDraft(snapshot), false);
});

test('legacy unfinished snapshots remain in-progress when their completion marker is absent', () => {
  const legacy = serializeLevelDraft(apartmentLevel.meta.id, {
    placements: {},
    cellMarks: {},
    timer: { startedAt: 1_000, elapsedMs: 0, running: true, finishedAt: null },
    lastResult: null,
  }, 1_000);
  delete legacy.completed;

  assert.equal(isInProgressLevelDraft(legacy), true);
});

test('invalid or wrong-version level drafts are rejected', () => {
  const invalid = {
    version: 99,
    levelId: apartmentLevel.meta.id,
    savedAt: 1,
    player: { placements: {}, cellMarks: {}, elapsedMs: 0, lastResult: null },
  } as unknown as LevelDraft;

  assert.equal(restoreLevelDraft(invalid, apartmentLevel, 10_000), null);
});

test('draft maps keep the newest save for each level', () => {
  const makeDraft = (levelId: string, savedAt: number): LevelDraft => ({
    version: 1,
    levelId,
    savedAt,
    player: { placements: {}, cellMarks: {}, elapsedMs: savedAt, lastResult: null },
  });

  const merged = mergeLevelDraftMaps(
    { [apartmentLevel.meta.id]: makeDraft(apartmentLevel.meta.id, 10), other: makeDraft('other', 30) },
    { [apartmentLevel.meta.id]: makeDraft(apartmentLevel.meta.id, 20) },
  );

  assert.equal(merged[apartmentLevel.meta.id].savedAt, 20);
  assert.equal(merged.other.savedAt, 30);
});

test('a newer deletion marker prevents completed drafts from returning from cloud', () => {
  const deleted = tombstoneLevelDraft(apartmentLevel.meta.id, 20);
  const active: LevelDraft = {
    version: 1,
    levelId: apartmentLevel.meta.id,
    savedAt: 10,
    player: { placements: {}, cellMarks: {}, elapsedMs: 0, lastResult: null },
  };
  const merged = mergeLevelDraftMaps(
    { [apartmentLevel.meta.id]: active },
    { [apartmentLevel.meta.id]: deleted },
  );

  assert.ok('deleted' in merged[apartmentLevel.meta.id]);
});
