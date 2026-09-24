# PAIW Project Overlay

Global workspace rules are loaded through the OpenCode global config.

Project-specific context:

- `~/.paiw/projects/personal/murdoku/project-context.md` — compact context; do not load full historical notes by default.
- `docs/level-workflow.md` — required process for level authoring and changes.

## Art workflow (`art/` workshop)

Style source: `art/STYLE-GUIDE.md`. Operational details: `art/README.md`.

- Create or edit assets only in `art/<category>/`, never directly in `src/assets/`.
- Run `npm run preview-art`, review `art/preview/index.local.html`, then copy approved assets into the game.
- Run `npm run verify` after copying. It includes the `validate-art` synchronization gate.
- Add new colors to STYLE-GUIDE §1 and approved new techniques to §6.

## Working rules

- For a level task, read `docs/level-workflow.md`; do not read full PAIW history unless a specific past case is relevant.
- One analysis pass per decision. If the next step is unclear, use a targeted search, script, test, or question instead of repeating the same reasoning.
- For data sets larger than about 20 entries, generate/check them with a script rather than tracing them manually.
- A passed stage stays closed unless new evidence or a user change invalidates it.

## Knowledge, memory, search (~/.paiw)

Read `~/.paiw/resources/shared/knowledge-routing.md` and `~/.paiw/resources/shared/agent-memory-policy.md` (parallel `paiw search` + native rg/Grep; must / should / skip — same intent as the self-improvement `activator.mjs` hook).

- Long-lived facts: only `*/personal/` under `~/.paiw`, never `*/shared/`.
- Incident-style lessons: only `~/.paiw/.learnings/*.md` (global) or `~/.paiw/projects/personal/<slug>/.learnings/*.md` — **never** a `.learnings/` folder at the root of a source repo.
- Stable facts: markdown under `*/personal/` or project dirs in `~/.paiw`; after `paiw index`, recall with **`paiw search` and `rg`/Grep in parallel** (see policy).
- Discovery: `paiw index`, then `paiw search` (Bleve and ripgrep run in parallel inside the CLI when `rg` is installed).

End-of-turn: persist stable learnings (right bucket) before saying you are done.
