# PAIW Project Overlay

Global workspace rules are loaded through the OpenCode global config.

Project-specific context:

- .paiw/README.md
- ~/.paiw/projects/personal/murdoku/README.md

## Knowledge, memory, search (~/.paiw)

Read `~/.paiw/resources/shared/knowledge-routing.md` and `~/.paiw/resources/shared/agent-memory-policy.md` (parallel `paiw search` + native rg/Grep; must / should / skip — same intent as the self-improvement `activator.mjs` hook).

- Long-lived facts: only `*/personal/` under `~/.paiw`, never `*/shared/`.
- Incident-style lessons: only `~/.paiw/.learnings/*.md` (global) or `~/.paiw/projects/personal/<slug>/.learnings/*.md` — **never** a `.learnings/` folder at the root of a source repo.
- Stable facts: markdown under `*/personal/` or project dirs in `~/.paiw`; after `paiw index`, recall with **`paiw search` and `rg`/Grep in parallel** (see policy).
- Discovery: `paiw index`, then `paiw search` (Bleve and ripgrep run in parallel inside the CLI when `rg` is installed).

End-of-turn: persist stable learnings (right bucket) before saying you are done.
