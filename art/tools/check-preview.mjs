#!/usr/bin/env node
// Headless verification of art/preview/index.html (run after build-preview):
//   badKeys    — staged SVGs whose key doesn't exist in the game (must be 0)
//   zeroRender — SVGs rendering at zero size / broken images (must be 0)
//   missing    — game keys without a staged file, per category (must be empty)
//   noir       — the «Нуар» toggle flips body.noir and aria-pressed both ways
//   strips64   — game-scale 64px strips, one per texture
// Usage: node art/tools/check-preview.mjs   (from repo root)
import { chromium } from 'playwright';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ART = fileURLToPath(new URL('..', import.meta.url));

const ref = readFileSync(join(ROOT, 'docs/icon-reference.md'), 'utf8');
function refKeys(header) {
  const idx = ref.indexOf(header);
  if (idx < 0) return [];
  const chunk = ref.slice(idx, ref.indexOf('\n## ', idx + 1));
  return [...chunk.matchAll(/^\| `([A-Za-z0-9]+)`/gm)].map((m) => m[1]);
}
const cats = [
  ['items', refKeys('## Иконки предметов')],
  ['themes', refKeys('## Иконки тем меню')],
  ['textures', refKeys('## Текстуры пола')],
];

const missing = {};
for (const [dir, keys] of cats) {
  const full = join(ART, dir);
  const staged = existsSync(full)
    ? readdirSync(full).map((f) => f.replace(/\.[a-z]+$/i, ''))
    : [];
  const miss = keys.filter((k) => !staged.includes(k));
  if (miss.length) missing[dir] = miss;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + encodeURI(join(ART, 'preview', 'index.html')));

const badKeys = await page.locator('.badge.bad').count();
const zeroRender = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll('svg')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) n += 1;
  }
  for (const img of document.querySelectorAll('img')) {
    if (!img.complete || img.naturalWidth === 0) n += 1;
  }
  return n;
});
const strips = await page.locator('.wide--game').count();

const noir = await page.evaluate(() => {
  const btn = document.getElementById('noir');
  btn.click();
  const on = document.body.classList.contains('noir') && btn.getAttribute('aria-pressed') === 'true';
  btn.click();
  const off = !document.body.classList.contains('noir') && btn.getAttribute('aria-pressed') === 'false';
  return on && off;
});

await browser.close();

const missingCount = Object.values(missing).reduce((a, b) => a + b.length, 0);
const ok = badKeys === 0 && zeroRender === 0 && missingCount === 0 && noir && strips > 0;

console.log(
  `badKeys=${badKeys} zeroRender=${zeroRender} missing=${JSON.stringify(missing)} strips64=${strips} noir=${noir ? 'ok' : 'FAIL'}`,
);
process.exit(ok ? 0 : 1);
