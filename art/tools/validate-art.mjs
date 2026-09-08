#!/usr/bin/env node
// Full art gate (run before tests / in CI):
//   1. art/ staging files pass the style conventions (same checks as validate.mjs)
//   2. src/assets/ game files pass the same conventions
//   3. sync-check: art/<cat> ↔ src/assets/<cat> must contain the same keys with
//      byte-identical SVGs — no in-place edits in the game, no drift.
// Exit 1 on any error. Usage (from repo root): npm run validate-art
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTree, formatResults } from './validate.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const ART = fileURLToPath(new URL('..', import.meta.url));

let failed = 0;

// 1) Staging tree (art/)
const art = validateTree(ART, 'staging');
const artOut = formatResults(art, 'art/ (мастерская)');
for (const l of artOut.lines) console.log(l);
failed += artOut.failed;

// 2) Game tree (src/assets/)
const game = validateTree(ROOT, 'game');
const gameOut = formatResults(game, 'src/assets/ (игра)');
for (const l of gameOut.lines) console.log(l);
failed += gameOut.failed;

// 3) Sync-check: same keys, byte-identical SVG content.
// PNG textures in the game are allowed extra only when no art/ SVG shares the key.
const pairs = [
  ['items', 'src/assets/icons/items'],
  ['themes', 'src/assets/icons/themes'],
  ['persons', 'src/assets/icons/persons'],
  ['textures', 'src/assets/textures'],
];
const syncErrs = [];
for (const [cat, gameDir] of pairs) {
  const artDir = join(ART, cat);
  const artFiles = readdirSync(artDir).filter((f) => /\.svg$/i.test(f));
  const gameFiles = readdirSync(join(ROOT, gameDir)).filter((f) => /\.(svg|png)$/i.test(f));
  const artKeys = new Set(artFiles.map((f) => f.replace(/\.[a-z]+$/i, '')));
  const gameKeys = new Map(gameFiles.map((f) => [f.replace(/\.[a-z]+$/i, ''), f]));

  for (const f of artFiles) {
    const key = f.replace(/\.svg$/i, '');
    const g = gameKeys.get(key);
    if (!g) {
      syncErrs.push(`${cat}/${key}: есть в art/, нет в игре — перенеси (см. art/README.md «Перенос в игру»)`);
      continue;
    }
    if (/\.png$/i.test(g)) {
      syncErrs.push(`${cat}/${key}: в игре PNG, а в art/ SVG — замени PNG на SVG из мастерской`);
      continue;
    }
    const a = readFileSync(join(artDir, f), 'utf8');
    const b = readFileSync(join(ROOT, gameDir, g), 'utf8');
    if (a !== b) syncErrs.push(`${cat}/${key}: содержимое разошлось (art/ ↔ ${gameDir}/${g}) — правь только в art/ и перенеси`);
  }
  for (const [key, g] of gameKeys) {
    if (!artKeys.has(key)) syncErrs.push(`${gameDir}/${g}: orphan в игре (нет в art/) — убери или заведи в мастерской`);
  }
}

if (syncErrs.length) {
  console.log('=== sync-check art/ ↔ src/assets/ ===');
  for (const e of syncErrs) console.log(`✗ ${e}`);
  failed += syncErrs.length;
} else {
  console.log('=== sync-check art/ ↔ src/assets/ ===');
  console.log('✓ мастерская и игра синхронны');
}

if (failed > 0) {
  console.log(`\nvalidate-art: ОШИБКИ (${failed}) — тесты запускать нельзя.`);
  process.exit(1);
}
console.log('\nvalidate-art: всё зелёное.');
