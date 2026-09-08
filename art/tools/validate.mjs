#!/usr/bin/env node
// Art staging validator: checks every file in art/ against the conventions
// (art/STYLE-GUIDE.md §3). Standalone — reads only the staging tree, no game imports.
// Also a library: `validate-art.mjs` reuses these checks against src/assets/.
//
// Run from the repo root: node art/tools/validate.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ART = fileURLToPath(new URL('..', import.meta.url));

export const ICON_LIMIT = 15 * 1024;
export const TEXTURE_LIMIT = 24 * 1024;

// Tags/attrs that must never appear: SVGs inline onto one page — filters, blend
// modes, raster embeds, text and scripts all break rendering or isolation.
const FORBIDDEN = [
  { re: /<filter[\s>]/i, why: '<filter>' },
  { re: /<image[\s>]/i, why: '<image> (raster embed)' },
  { re: /<text[\s>]/i, why: '<text>' },
  { re: /<font[\s>]/i, why: '<font>' },
  { re: /<script[\s>]/i, why: '<script>' },
  { re: /<foreignObject[\s>]/i, why: '<foreignObject>' },
  { re: /mix-blend-mode/i, why: 'mix-blend-mode' },
  { re: /style="[^"]*url\(/i, why: 'inline url() reference' },
  { re: /\shref=/i, why: 'href reference (must be self-contained)' },
];

function checkRoot(content, errs) {
  // One root <svg> only — nested/malformed wrappers break inlining silently.
  const opens = (content.match(/<svg[\s>]/g) ?? []).length;
  const closes = (content.match(/<\/svg>/g) ?? []).length;
  if (opens !== 1 || closes !== 1) errs.push(`должен быть ровно один корневой <svg> (найдено ${opens} открывающих, ${closes} закрывающих)`);
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(content)) errs.push('xmlns должен быть "http://www.w3.org/2000/svg"');
}

function checkIconSvg(file, content, sizeBytes, kind) {
  const key = file.replace(/\.svg$/i, '');
  const errs = [];
  const warns = [];

  checkRoot(content, errs);
  if (!/viewBox="0 0 96 96"/.test(content)) errs.push('viewBox должен быть "0 0 96 96"');
  if (sizeBytes > ICON_LIMIT) errs.push(`вес ${sizeBytes} Б > ${ICON_LIMIT} Б`);

  for (const { re, why } of FORBIDDEN) {
    if (re.test(content)) errs.push(`запрещённый элемент: ${why}`);
  }

  // opacity is palette-hostile: solid tones only. Persons get a narrow exception
  // (STYLE-GUIDE §3): dark/white shading over the var-painted clothing.
  const opacityAttrs = content.match(/\sopacity="[\d.]+"/g) ?? [];
  if (kind === 'person') {
    for (const m of content.matchAll(/<(\w+)[^>]*\sopacity="([\d.]+)"/g)) {
      const val = parseFloat(m[2]);
      if (val > 0.35) errs.push(`opacity ${m[2]} > 0.35 (только лёгкое затемнение/осветление)`);
      const el = m[0];
      if (!/fill="#(1A1A1A|FFFFFF|F5E9D0)"/i.test(el)) {
        warns.push(`opacity на элементе без fill #1A1A1A/#FFFFFF/#F5E9D0 — проверь (объём одежды)`);
      }
    }
  } else if (opacityAttrs.length > 0) {
    errs.push(`opacity запрещена (найдено ${opacityAttrs.length}) — сплошные тона палитры`);
  }

  // Gradient/clip ids must be prefixed with the file key: all files inline together.
  const ids = [...content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    if (!id.startsWith(key)) errs.push(`id "${id}" без префикса ключа "${key}"`);
  }

  if (kind === 'person') {
    if (!/^person-(m|f)-\d{2}$/.test(key)) errs.push('имя файла должно быть person-(m|f)-NN');
    if (!content.includes('var(--person-clothing')) errs.push('нет var(--person-clothing) на одежде');
  }

  return { key, errs, warns };
}

function checkTextureSvg(file, content, sizeBytes) {
  const key = file.replace(/\.svg$/i, '');
  const errs = [];
  checkRoot(content, errs);
  if (!/viewBox="0 0 (256 256|512 512)"/.test(content)) errs.push('viewBox должен быть "0 0 256 256" (или 512 512)');
  if (sizeBytes > TEXTURE_LIMIT) errs.push(`вес ${sizeBytes} Б > ${TEXTURE_LIMIT} Б`);
  for (const { re, why } of FORBIDDEN) {
    if (re.test(content)) errs.push(`запрещённый элемент: ${why}`);
  }
  if ((content.match(/\sopacity="[\d.]+"/g) ?? []).length > 0) errs.push('opacity запрещена в текстурах');
  const ids = [...content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    if (!id.startsWith(key)) errs.push(`id "${id}" без префикса ключа "${key}"`);
  }
  return { key, errs, warns: [] };
}

// ── Library API: validate an asset tree (art/ or src/assets/) ────────────────
// layout: 'staging' ({items,themes,persons,textures} dirs) or 'game'
// ({icons/{items,themes,persons}, textures}). Returns [{cat,key,errs,warns,file}].
export function validateTree(root, layout) {
  const dirs =
    layout === 'game'
      ? { items: 'src/assets/icons/items', themes: 'src/assets/icons/themes', persons: 'src/assets/icons/persons', textures: 'src/assets/textures' }
      : { items: 'items', themes: 'themes', persons: 'persons', textures: 'textures' };
  const results = [];
  const seen = new Map(); // rel path -> content, for id-collision + sync reuse

  for (const [cat, rel] of Object.entries(dirs)) {
    const full = join(root, rel);
    if (!existsSync(full)) continue;
    for (const file of readdirSync(full).filter((f) => /\.(svg|png)$/i.test(f))) {
      const p = join(full, file);
      const sizeBytes = statSync(p).size;
      const relPath = `${cat}/${file}`;
      if (/\.png$/i.test(file)) {
        if (cat === 'textures') {
          results.push({ cat, key: file.replace(/\.png$/i, ''), errs: sizeBytes > TEXTURE_LIMIT ? [`вес ${sizeBytes} Б > лимита`] : [], warns: [], file: relPath });
        } else {
          results.push({ cat, key: file.replace(/\.png$/i, ''), errs: ['PNG допустим только в текстурах'], warns: [], file: relPath });
        }
        continue;
      }
      const content = readFileSync(p, 'utf8');
      seen.set(relPath, content);
      const res =
        cat === 'textures'
          ? checkTextureSvg(file, content, sizeBytes)
          : checkIconSvg(file, content, sizeBytes, cat === 'persons' ? 'person' : cat === 'themes' ? 'theme' : 'item');
      results.push({ cat, ...res, file: relPath });
    }
  }

  // Cross-file id collisions: everything inlines onto one page in the game.
  const allIds = new Map();
  for (const [relPath, content] of seen) {
    for (const m of content.matchAll(/\sid="([^"]+)"/g)) {
      const id = m[1];
      if (allIds.has(id)) {
        const r = results.find((x) => x.file === relPath);
        r.errs.push(`id "${id}" уже есть в ${allIds.get(id)} (коллизия при инлайне)`);
      } else {
        allIds.set(id, relPath);
      }
    }
  }
  return results;
}

export function formatResults(results, label) {
  const lines = [];
  let failed = 0;
  if (label) lines.push(`=== ${label} ===`);
  for (const r of results) {
    const icon = r.errs.length ? '✗' : r.warns.length ? '!' : '✓';
    lines.push(`${icon} ${r.cat}/${r.key}${r.errs.length ? '' : r.warns.length ? ' (предупреждения)' : ''}`);
    for (const e of r.errs) lines.push(`    ERROR: ${e}`);
    for (const w of r.warns) lines.push(`    warn:  ${w}`);
    if (r.errs.length) failed += 1;
  }
  lines.push(`${results.length - failed}/${results.length} файлов валидны.`);
  return { lines, failed, total: results.length };
}

// ── CLI: validate the staging tree only (art/) ──────────────────────────────
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const results = validateTree(ART, 'staging');
  const { lines, failed } = formatResults(results);
  for (const l of lines) console.log(l);
  if (failed > 0) {
    console.log(`Ошибок в ${failed} файл(ах).`);
    process.exit(1);
  }
}
