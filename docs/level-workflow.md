# Level Authoring Workflow

Use this workflow for new levels and changes to existing level data. Keep the design brief short; do not re-open a passed stage without new evidence or a user change.

## 1. Brief and preflight

Before editing the level file, record only the decisions that affect implementation:

- User-fixed map, size, theme, title, cast, or mechanics.
- Board dimensions, room layout, intended actor count, and victim/murderer room.
- The player's deduction goal, any hidden role, and the intended decoy.
- Whether this level introduces a new mechanic or uses existing clue types.

Check the row/column permutation and decorative-item collisions before writing clues. `scaffold-level` considers room geometry, not item blockers. For large grids or item sets, use a script rather than manual tracing. Use the browser editor only when its documented feature set covers the level; otherwise start in TypeScript.

## 2. Build and diagnose

1. Create the map, people, items, and authored solution.
2. Run `npm run validate-level -- levels/<file>.ts`.
3. Resolve a `MULTIPLE` result by inspecting the reported alternate solution. Add or change one clue at a time, then rerun the fast validator.
4. Treat `INCONCLUSIVE` as unverified. Do not infer a cause from a timeout; inspect the solver status and use a focused diagnostic.
5. Do not run redundancy pruning on every iteration. `npm run validate-redundancy -- levels/<file>.ts` is an optional end-of-design report; its suggestions are not a release gate and clues should not be removed mechanically.

For a hidden-role deduction, use `checkHiddenRoleEpistemics` from `tools/solver/epistemic.ts` in a solver test. List every player-plausible role-holder candidate (including candidates who should be eliminated by role clues); the helper transfers only that role, enumerates every non-victim murderer, preserves all other roles, and lets the solver find placements freely. Assert the authored baseline is `PROVEN_UNIQUE` and every alternative is `NO_SOLUTION`; `INCONCLUSIVE` is not a pass. A solver-unique authored world alone does not prove the player's deduction is sound.

## 3. Final verification

After registering the level in `levels/index.ts`, run:

```bash
npm run verify
```

This is the single final gate: all-level lint/quality/solver validation, TypeScript build, lint, solver tests, art synchronization, and the complete Playwright suite. Fix failures at their source; do not substitute a narrower command for the final gate.

Human QA is reserved for what automation cannot establish: clue wording and fairness, intended deduction, and visual presentation of changed assets. Do not repeat visual review of unchanged assets.

## 4. New art

For an asset batch, register the new game keys first, then run:

```bash
npm run preview-art
```

Review `art/preview/index.local.html` in a browser. After approval, copy only the approved files from `art/` to the corresponding `src/assets/` directory, then run `npm run verify`. The preview is generated locally and is not part of source-control diffs.

## Completion criteria

- The level is registered and `npm run verify` passes.
- Hidden-role alternatives have an explicit epistemic test when applicable.
- A human has reviewed only the changed player-facing text/art/deduction that requires judgment.
- The final response reports the commands actually run and any remaining manual QA.
