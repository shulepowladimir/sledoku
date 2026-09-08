# PAIW Project Overlay

Global workspace rules are loaded through the OpenCode global config.

Project-specific context:

- .paiw/README.md
- ~/.paiw/projects/personal/murdoku/README.md

## Art workflow (мастерская art/)

Канон стиля и воркфлоу: `art/STYLE-GUIDE.md` + `art/README.md` («Новые ассеты для новых уровней»).

- Новые ассеты (предметы/темы/текстуры/архетипы) рисуются **только в `art/<категория>/`**,
  никогда сразу в `src/assets/`.
- Цикл: `node art/tools/validate.mjs` → `build-preview.mjs` → `check-preview.mjs` →
  ревью человеком в `art/preview/index.html` → `cp` в `src/assets/…`.
- Гейт `npm run validate-art` (в `pretest:smoke`) проверяет конвенции обеих папок и
  их синхронность: правка «по месту» в игре уронит тесты — чини через мастерскую.
- Новый цвет = токен в STYLE-GUIDE §1 с пометкой использования; новый приём = эталон в §6.

## Knowledge, memory, search (~/.paiw)

Read `~/.paiw/resources/shared/knowledge-routing.md` and `~/.paiw/resources/shared/agent-memory-policy.md` (parallel `paiw search` + native rg/Grep; must / should / skip — same intent as the self-improvement `activator.mjs` hook).

- Long-lived facts: only `*/personal/` under `~/.paiw`, never `*/shared/`.
- Incident-style lessons: only `~/.paiw/.learnings/*.md` (global) or `~/.paiw/projects/personal/<slug>/.learnings/*.md` — **never** a `.learnings/` folder at the root of a source repo.
- Stable facts: markdown under `*/personal/` or project dirs in `~/.paiw`; after `paiw index`, recall with **`paiw search` and `rg`/Grep in parallel** (see policy).
- Discovery: `paiw index`, then `paiw search` (Bleve and ripgrep run in parallel inside the CLI when `rg` is installed).

End-of-turn: persist stable learnings (right bucket) before saying you are done.
