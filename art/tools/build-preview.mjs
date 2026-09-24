#!/usr/bin/env node
// Builds art/preview/index.local.html — a self-contained local gallery of staged art
// (mirrors the in-game /?gallery acceptance view: 18/40/64px on light/dark/texture
// backgrounds, grayscale readability check, every clothing color for persons,
// 3×3 seamless tiles for textures, plus game-key coverage from docs/icon-reference.md).
// No server needed — open the file directly in a browser.
//
// Run from the repo root: node art/tools/build-preview.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ART = fileURLToPath(new URL('..', import.meta.url));

function list(dir, exts) {
  const full = join(ART, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).filter((f) => exts.some((e) => f.endsWith(e)));
}
const base = (name) => name.replace(/\.[a-z]+$/i, '');

// ── Game keys & palette from the generated reference doc ─────────────────────
const ref = readFileSync(join(ROOT, 'docs/icon-reference.md'), 'utf8');
function refKeys(sectionHeader) {
  const idx = ref.indexOf(sectionHeader);
  if (idx < 0) return [];
  const chunk = ref.slice(idx, ref.indexOf('\n## ', idx + 1));
  // Keys are camelCase-capable (clueBoard, barCounter, …), not just lowercase.
  return [...chunk.matchAll(/^\| `([A-Za-z0-9]+)`/gm)].map((m) => m[1]);
}
const gameItemKeys = refKeys('## Иконки предметов');
const gameThemeKeys = refKeys('## Иконки тем меню');
const gameTextureKeys = refKeys('## Текстуры пола');
const personPalette = [...ref.matchAll(/^- `(#(?:[0-9a-f]{6}))`$/gim)].map((m) => m[1]);
const CLOTHING = personPalette.length
  ? personPalette
  : ['#2bc4c4', '#3cbf7c', '#4d8dff', '#5fa8d3', '#7cc9e8', '#8a5a3a', '#9b7ce0',
     '#b06ab3', '#c9536b', '#c98f38', '#d9a441', '#e0629b', '#e0824a', '#e0a94a'];

// ── Staged files ─────────────────────────────────────────────────────────────
const items = list('items', ['.svg']).map((f) => ({ key: base(f), svg: readFileSync(join(ART, 'items', f), 'utf8') }));
const themes = list('themes', ['.svg']).map((f) => ({ key: base(f), svg: readFileSync(join(ART, 'themes', f), 'utf8') }));
const persons = list('persons', ['.svg']).map((f) => ({ key: base(f), svg: readFileSync(join(ART, 'persons', f), 'utf8') }));
const textures = list('textures', ['.svg', '.png']).map((f) => {
  const p = join(ART, 'textures', f);
  if (f.endsWith('.png')) {
    const b64 = readFileSync(p).toString('base64');
    return { key: base(f), url: `data:image/png;base64,${b64}` };
  }
  const svg = readFileSync(p, 'utf8');
  return { key: base(f), url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
});

const woodTexture = textures.find((t) => t.key === 'wood');
const texBg = woodTexture
  ? `background-image:url('${woodTexture.url}');background-size:64px 64px`
  : 'background:#cda374';
const sampleItem = items[0]; // layered onto texture tiles to mimic a real cell stack

// Inline an SVG string, sized via width/height. The staging SVGs carry viewBox
// only, so a size attribute must be injected (first tag gets width/height).
function inline(svg, size, extra = '') {
  const sized = svg.replace(/<svg([^>]*)>/i, (m, attrs) => {
    const cleaned = attrs.replace(/\s(width|height)="[^"]*"/gi, '');
    return `<svg${cleaned} width="${size}" height="${size}" ${extra}>`;
  });
  return sized;
}

// ── Sections ─────────────────────────────────────────────────────────────────
function swatches(svg) {
  const rows = [
    { label: 'светлый', style: 'background:#F5E9D0' },
    { label: 'тёмный', style: 'background:#1A1A1A' },
    { label: 'текстура', style: texBg },
    { label: 'ч/б', style: 'background:#dcd7ce' },
  ];
  return `<div class="swatches">${rows
    .map(
      (row) => `<div class="swatch" style="${row.style}">
        ${[18, 40, 64].map((s) => `<span class="cell">${inline(svg, s)}</span>`).join('')}
      </div>`,
    )
    .join('')}</div>`;
}
function iconCard({ key, svg, gameKeys, cat }) {
  const inGame = gameKeys.includes(key);
  const badge = inGame ? '<span class="badge ok">ключ в игре</span>' : '<span class="badge bad">нет такого ключа!</span>';
  const gray = `<div class="swatch swatch--gray" style="background:#dcd7ce">
    ${[18, 40, 64].map((s) => `<span class="cell">${inline(svg, s)}</span>`).join('')}
  </div>`;
  return `<li class="card" id="${cat}-${key}">
    <div class="head"><code>${key}</code> ${badge}</div>
    ${swatches(svg)}
    <div class="grayrow"><span class="graylabel">ч/б:</span>${gray}</div>
  </li>`;
}

function personsSection() {
  if (persons.length === 0) return '';
  const blocks = persons
    .map(
      (p) => `<div class="pcard">
      <div class="head"><code>${p.key}</code></div>
      <div class="pcolors">
        ${CLOTHING.map(
          (c) => `<span class="pswatch" style="--person-clothing:${c}" title="${c}">${inline(p.svg, 56)}</span>`,
        ).join('')}
      </div>
    </div>`,
    )
    .join('');
  return `<section><h2>Персонажи <small>${persons.length} staged</small></h2>
    <p class="note">Каждый архетип покрашен всеми ${CLOTHING.length} игровыми цветами одежды (var(--person-clothing)).
    Смотрите: контраст кожи/волос с каждым цветом, читаемость лица на 56px и меньше.</p>
    <div class="pgrid">${blocks}</div></section>`;
}

function texturesSection() {
  if (textures.length === 0) return '';
  const cards = textures
    .map((t) => {
      const cells = [];
      for (let i = 0; i < 9; i += 1) {
        const bg = `background-image:url('${t.url}');background-size:64px 64px`;
        // Middle cell carries the real game stack: item 26px + person 40px on top.
        const stack =
          i === 4 && sampleItem
            ? `<div class="tstack">${inline(sampleItem.svg, 26)}${
                persons[0]
                  ? `<span class="tperson" style="--person-clothing:#4d8dff">${inline(persons[0].svg, 40)}</span>`
                  : ''
              }</div>`
            : '';
        cells.push(`<div class="tcell" style="${bg}${stack ? ';position:relative' : ''}">${stack}</div>`);
      }
      return `<li class="card"><div class="head"><code>${t.key}</code></div>
        <div class="tile">${cells.join('')}</div>
        <div class="wide" style="background-image:url('${t.url}');background-size:128px 128px"></div>
        <div class="wide wide--game" style="background-image:url('${t.url}');background-size:64px 64px"></div>
      </li>`;
    })
    .join('');
  return `<section><h2>Текстуры <small>${textures.length} staged / ${gameTextureKeys.length} в игре</small></h2>
    <p class="note">3×3 — проверка бесшовности; в средней клетке — предмет 26px и персонаж 40px (реальный стек клетки).
    Полосы: верхняя 128px (крупные детали), нижняя 64px — реальный игровой масштаб клетки.
    Кнопка «Нуар» в шапке переводит всю галерею в ч/б — текстуры обязаны различаться и оттенком серого, и паттерном.</p>
    <ul class="grid">${cards}</ul></section>`;
}

const itemsCovered = items.filter((i) => gameItemKeys.includes(i.key)).length;
const themesCovered = themes.filter((t) => gameThemeKeys.includes(t.key)).length;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Art staging — превью</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font: 14px/1.45 -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; background: #efe9df; color: #1A1A1A; }
  header { padding: 20px 24px 12px; }
  header h1 { margin: 0 0 4px; font-size: 22px; }
  header p { margin: 0; color: #5a4636; }
  section { padding: 12px 24px 8px; }
  h2 { font-size: 17px; margin: 18px 0 6px; }
  h2 small { color: #5a4636; font-weight: 400; }
  .note { color: #5a4636; margin: 4px 0 10px; max-width: 72ch; }
  .grid, .pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; list-style: none; padding: 0; margin: 0; }
  .card { background: #fff; border: 1px solid #d8cfc0; border-radius: 10px; padding: 10px; }
  .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .head code { font-weight: 600; }
  .badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; }
  .badge.ok { background: #dcedd8; color: #2c5230; }
  .badge.bad { background: #f3d3d3; color: #7c2222; }
  .swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
  .swatch { display: flex; align-items: flex-end; gap: 8px; border-radius: 8px; padding: 6px; min-height: 78px; }
  .swatch .cell { display: flex; align-items: flex-end; }
  .swatch--gray { filter: grayscale(1); }
  .grayrow .swatch--gray { filter: grayscale(1) contrast(1.05); }
  .grayrow { position: relative; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
  .graylabel { font-size: 10px; color: #7a6a58; }
  .tile { display: grid; grid-template-columns: repeat(3, 64px); grid-auto-rows: 64px; gap: 0; border-radius: 6px; overflow: hidden; width: max-content; border: 1px solid #1A1A1A33; }
  .tcell { width: 64px; height: 64px; }
  .tstack { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
  .wide { margin-top: 8px; height: 72px; border-radius: 6px; border: 1px solid #1A1A1A33; }
  .wide--game { height: 96px; }
  #noir { font: inherit; font-size: 13px; padding: 4px 14px; border-radius: 999px; border: 1.5px solid #1A1A1A; background: #fff; cursor: pointer; }
  #noir[aria-pressed="true"] { background: #1A1A1A; color: #fff; }
  body.noir #page { filter: grayscale(1); }
  .pcard { background: #fff; border: 1px solid #d8cfc0; border-radius: 10px; padding: 10px; }
  .pcolors { display: flex; flex-wrap: wrap; gap: 4px; }
  .pswatch { display: inline-flex; border-radius: 6px; padding: 3px; }
  .tperson { display: inline-flex; }
  svg { display: block; }
  footer { padding: 16px 24px 32px; color: #7a6a58; font-size: 12px; }
</style>
</head>
<body>
<div id="page">
<header>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
    <h1>Art staging — превью</h1>
    <button id="noir" aria-pressed="false" title="Перевести всю галерею в ч/б (режим «Нуар»)">Нуар</button>
  </div>
  <p>Локальная галерея нового арта (папка <code>art/</code>). Игра не затронута.
     Покрытие: предметы ${itemsCovered}/${gameItemKeys.length} · темы ${themesCovered}/${gameThemeKeys.length} ·
     текстуры ${textures.length}/${gameTextureKeys.length} · архетипы ${persons.length}.
     Регенерация: <code>node art/tools/build-preview.mjs</code>, проверки: <code>node art/tools/validate.mjs</code>.</p>
</header>

<section>
  <h2>Предметы <small>${items.length} staged / ${gameItemKeys.length} ключей в игре</small></h2>
  <p class="note">Каждая карточка: 18/40/64px на светлом, тёмном и деревянном фоне; ниже — те же свотчи
  в ч/б (силуэт обязан быть узнаваем без цвета, предмет под персонажем рендерится в 22px).</p>
  <ul class="grid">${items.map((i) => iconCard({ ...i, gameKeys: gameItemKeys, cat: 'items' })).join('')}</ul>
</section>

${personsSection()}
${texturesSection()}

<section>
  <h2>Темы меню <small>${themes.length} staged / ${gameThemeKeys.length} ключей в игре</small></h2>
  ${themes.length ? `<ul class="grid">${themes.map((t) => iconCard({ ...t, gameKeys: gameThemeKeys, cat: 'themes' })).join('')}</ul>` : '<p class="note">Пока пусто.</p>'}
</section>

<footer>Сгенерировано автоматически — не редактировать руками. Эталоны стиля: art/STYLE-GUIDE.md §6–7.</footer>
</div>
<script>
  const btn = document.getElementById('noir');
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('noir');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
</script>
</body>
</html>`;

writeFileSync(join(ART, 'preview', 'index.local.html'), html);
console.log(
  `preview: ${items.length} items, ${themes.length} themes, ${persons.length} persons, ${textures.length} textures → art/preview/index.local.html`,
);
