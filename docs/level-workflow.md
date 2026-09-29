# Level Authoring Workflow

Use this workflow for new levels and changes to existing level data. Keep the design brief short; do not re-open a passed stage without new evidence or a user change. Treat the user's approved change list as a hard scope boundary: investigate out-of-scope findings with read-only or in-memory checks, then ask before editing them.

## 1. Brief and preflight

Before editing the level file, record only the decisions that affect implementation:

- User-fixed map, size, theme, title, cast, or mechanics.
- An acceptance contract for every hard requirement: exact common-clue count (counting distinct displayed groups), density target, fully-pinned-person budget, map/placement constraints, and role-deduction outcomes. Mark each criterion as hard or flexible, and name its automated assertion. Do not draft the full level until the hard limits are explicit.
- Board dimensions, room layout, intended actor count, and victim/murderer room.
- The player's deduction goal, any hidden role, and the intended decoy.
- Whether this level introduces a new mechanic or uses existing clue types.
- Default to a known victim on `Х`, shown last in the alphabetized roster with only the standard “Жертва находилась наедине с убийцей” line. Set `meta.victimIdentityHidden` only when the user explicitly requests a hidden victim identity; that mode moves the crime-scene rule to general clues and changes victim-clue visibility. For ordinary levels, never mention the victim in authored clues or relate another character to the victim (`sameRoomAs`, `relativePosition`, etc.); that directly filters suspects because the victim is known and alone with the murderer. An explicitly requested hidden-victim level may give the hidden person's normal personal clues, but must not use `role:'victim'` clues or wording that reveals victim status.

Check the row/column permutation and decorative-item collisions before writing clues. `scaffold-level` considers room geometry, not item blockers. For large grids or item sets, use a script rather than manual tracing. Use the browser editor only when its documented feature set covers the level; otherwise start in TypeScript.

Use `floorTexture` only when the texture itself is informative: either the same texture appears across multiple zones, or it belongs to a distinct floor feature/overlay in one or more zones. Do not use a zone's base texture when that texture belongs to only that one zone; use `roomMembership` instead. A floor feature overrides the room's base texture. Use `floorFeature` when the clue must identify a specific feature rather than its texture, and keep the wording aligned with what the clue checks.

## 2. Build and diagnose

1. Create the map, people, items, and authored solution.
2. Run `npm run validate-level -- levels/<file>.ts`.
3. Resolve a `MULTIPLE` result by inspecting the reported alternate solution. Add or change one clue at a time, then rerun the fast validator.
4. Treat `INCONCLUSIVE` as unverified. Do not infer a cause from a timeout; inspect the solver status and use a focused diagnostic.
5. Do not run redundancy pruning on every iteration. `npm run validate-redundancy -- levels/<file>.ts` is an optional end-of-design report; its suggestions are not a release gate and clues should not be removed mechanically.

Add level-specific assertions for user-approved clue-count and placement limits before authoring is considered complete. Both `npm run validate-level` and `npm run validate-all` enforce at least 40% combined item/floor-feature density and zero fully pinned people for new levels; existing density exceptions and the apartment pin exception are explicitly grandfathered in `tools/solver/acceptance.ts` and must not be extended without user approval.

For a hidden role, use `checkHiddenRoleEpistemics` from `tools/solver/epistemic.ts` and include every player-plausible holder and every non-victim murderer; let the solver choose placements freely. If the player must infer multiple hidden roles jointly, enumerate the Cartesian product of all plausible role-holder sets and murderer candidates in the same world. Testing one role at a time while holding the other hidden roles at their authored holders can miss a combined alternative. For a hidden victim, use `checkHiddenVictimEpistemics` and list every player-plausible victim candidate; it enumerates every victim/murderer pair and lets the solver find placements freely. Assert only the authored role tuple is `PROVEN_UNIQUE` and every alternative is `NO_SOLUTION`; `WRONG_SOLUTION`, `MULTIPLE`, and `INCONCLUSIVE` are failures. `PROVEN_UNIQUE` for the authored role tuple alone proves neither that hidden roles are deducible nor that the player can trust a proposed alternative.

For every murder-mystery level, also check the puzzle as the player sees it: the murderer is unknown. Use `checkMurdererEpistemics` from `tools/solver/epistemic.ts` to try every non-victim as murderer, letting `solveLevel` choose placements freely in each world. Require the authored murderer world to be `PROVEN_UNIQUE` and every alternative murderer world to be `NO_SOLUTION`. A unique result with `people[].isMurderer` fixed to the author's answer is not sufficient.

When QA includes a screenshot, transcribe each person's identity and 1-based row/column to an explicit assignment before evaluating it. Check the complete candidate against player-visible clues and its full role tuple; never reject it just because it disagrees with `people[].roles` or `isMurderer`. Preserve any valid counterexample as a regression case. After every clue edit, rerun the level validator and the focused epistemic test against the current file; previous green output does not apply to a changed clue set.

## 3. Final verification

After registering the level in `levels/index.ts`, run:

```bash
npm run verify
```

This is the single final gate: all-level lint/quality/solver validation, TypeScript build, lint, solver tests, art synchronization, and the complete Playwright suite. Fix failures at their source; do not substitute a narrower command for the final gate.

Human QA is reserved for what automation cannot establish: clue wording and fairness, intended deduction, and visual presentation of changed assets. It must be performed by the user; agent-run browser checks are a technical gate, not user QA. Keep the level in Doing until the user reviews and accepts it. Do not repeat visual review of unchanged assets.

## 4. New art

For an asset batch, register the new game keys first, then run:

```bash
npm run preview-art
```

Review `art/preview/index.local.html` in a browser. After approval, copy only the approved files from `art/` to the corresponding `src/assets/` directory, then run `npm run verify`. The preview is generated locally and is not part of source-control diffs.

## Completion criteria

- The level is registered and `npm run verify` passes.
- Hidden-role alternatives have an explicit epistemic test when applicable.
- The user has manually reviewed and accepted the changed player-facing text/art/deduction that requires judgment; green automation alone never marks a level complete.
- The final response reports the commands actually run and any remaining manual QA.
