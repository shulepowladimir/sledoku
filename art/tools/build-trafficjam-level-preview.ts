import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ART = join(ROOT, 'art');
const OUT = join(ART, 'preview', 'traffic-jam-level.local.html');
const CELL = 64;
const GRID = [
  '111111111С',
  '11111111СС',
  'ППППППППСС',
  'ППППППППСС',
  'РРРРРРРРРР',
  'РРРРРРРРРР',
  'ЛЛЛЛЛЛЛЛЛЛ',
  'ЛЛЛЛЛЛЛЛЛЛ',
  '2222222222',
  '2222222222',
];

type PreviewItem = {
  key: string;
  label: string;
  row: number;
  col: number;
  span?: number;
  flip?: boolean;
};

const items: PreviewItem[] = [
  // Northbound flow and exit.
  { key: 'car', label: 'Машина · вариант 1', row: 3, col: 1, span: 2, flip: true },
  { key: 'motorcycle', label: 'Мотоцикл', row: 3, col: 3, span: 2, flip: true },
  { key: 'raceCar', label: 'Машина · вариант 2', row: 3, col: 5, span: 2, flip: true },
  { key: 'golfCart', label: 'Машина · вариант 3', row: 3, col: 7, span: 2, flip: true },
  { key: 'motorcycle', label: 'Мотоцикл на съезде', row: 3, col: 9, span: 2, flip: true },
  { key: 'car', label: 'Машина на съезде', row: 2, col: 9, span: 2, flip: true },
  { key: 'raceCar', label: 'Машина перед ремонтом', row: 4, col: 1, span: 2, flip: true },
  { key: 'golfCart', label: 'Машина перед ремонтом', row: 4, col: 3, span: 2, flip: true },
  // Southbound flow.
  { key: 'car', label: 'Машина', row: 8, col: 1, span: 2 },
  { key: 'raceCar', label: 'Машина · вариант 2', row: 7, col: 3, span: 2 },
  { key: 'golfCart', label: 'Машина · вариант 3', row: 7, col: 8, span: 2 },
  { key: 'car', label: 'Машина', row: 8, col: 9, span: 2 },
  { key: 'motorcycle', label: 'Мотоцикл', row: 8, col: 5, span: 2 },
  // Roadside dressing.
  { key: 'tree', label: 'Дерево', row: 1, col: 1 },
  { key: 'townhouse', label: 'Городской дом', row: 1, col: 4 },
  { key: 'broadleafTree', label: 'Дерево', row: 1, col: 7 },
  { key: 'stump', label: 'Пень', row: 2, col: 2 },
  { key: 'bench', label: 'Скамейка', row: 2, col: 5 },
  { key: 'trashcan', label: 'Урна', row: 2, col: 7 },
  { key: 'townhouse', label: 'Городской дом', row: 9, col: 2 },
  { key: 'tree', label: 'Дерево', row: 9, col: 5 },
  { key: 'broadleafTree', label: 'Дерево', row: 9, col: 8 },
  { key: 'bench', label: 'Скамейка', row: 10, col: 3 },
  { key: 'rock', label: 'Камень', row: 10, col: 7 },
  // Divider and repair site.
  { key: 'trafficCone', label: 'Дорожные конусы', row: 4, col: 6 },
  { key: 'trafficCone', label: 'Дорожные конусы', row: 4, col: 8 },
  { key: 'tractor', label: 'Трактор · 2 клетки', row: 5, col: 4, span: 2 },
  { key: 'roadBarrier', label: 'Дорожное ограждение', row: 6, col: 3 },
  { key: 'toolbox', label: 'Ящик с инструментами', row: 5, col: 8 },
  { key: 'tireStack', label: 'Стопка покрышек', row: 6, col: 8 },
  { key: 'trafficSign', label: 'Дорожный знак', row: 6, col: 5 },
];

function readSvg(category: string, key: string): string {
  const path = join(ART, category, `${key}.svg`);
  if (!existsSync(path)) throw new Error(`Missing staged SVG: art/${category}/${key}.svg`);
  return readFileSync(path, 'utf8');
}

function dataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function sizedSvg(svg: string, size: number): string {
  return svg.replace(/<svg([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s(width|height)="[^"]*"/gi, '');
    return `<svg${cleaned} width="${size}" height="${size}" aria-hidden="true">`;
  });
}

const zoneNames: Record<string, string> = {
  '1': 'Верхняя обочина',
  '2': 'Нижняя обочина',
  П: 'Поток направо',
  Р: 'Разделитель',
  Л: 'Поток налево',
  С: 'Съезд',
};
const zoneTextures: Record<string, string> = {
  '1': 'grass',
  '2': 'grass',
  П: 'asphalt',
  Р: 'concrete',
  Л: 'asphalt',
  С: 'asphalt',
};
const textures = [...new Set(Object.values(zoneTextures)), 'dirt'];
const textureUrls = new Map(textures.map((key) => [key, dataUrl(readSvg('textures', key))]));

const rowCount = GRID.length;
const colCount = GRID[0].length;
if (GRID.some((row) => row.length !== colCount)) throw new Error('Traffic jam preview grid must be rectangular.');
if (rowCount !== 10 || colCount !== 10) throw new Error(`Expected a 10×10 grid, got ${rowCount}×${colCount}.`);

const claimedCells = new Set<string>();
for (const item of items) {
  for (let col = item.col; col < item.col + (item.span ?? 1); col++) {
    if (item.row < 1 || item.row > rowCount || col < 1 || col > colCount) {
      throw new Error(`Out-of-board item placement: ${item.label} at r${item.row}c${col}.`);
    }
    const cellKey = `${item.row}-${col}`;
    if (claimedCells.has(cellKey)) throw new Error(`Overlapping preview items at r${item.row}c${col}.`);
    claimedCells.add(cellKey);
  }
}

const cells = GRID.flatMap((row, rowIndex) => [...row].map((zone, colIndex) => {
  const north = GRID[rowIndex - 1]?.[colIndex];
  const east = GRID[rowIndex]?.[colIndex + 1];
  const south = GRID[rowIndex + 1]?.[colIndex];
  const west = GRID[rowIndex]?.[colIndex - 1];
  const edges = [
    north !== zone ? 'top' : '',
    east !== zone ? 'right' : '',
    south !== zone ? 'bottom' : '',
    west !== zone ? 'left' : '',
  ].filter(Boolean).join(' ');
  const repair = rowIndex === 3 && colIndex >= 4 && colIndex <= 8;
  const texture = zoneTextures[zone];
  return `<div class="cell texture-${texture} ${edges} ${repair ? 'repair' : ''}" title="${zoneNames[zone]} · ряд ${rowIndex + 1}, столбец ${colIndex + 1}" style="left:${colIndex * CELL}px;top:${rowIndex * CELL}px"></div>`;
}));

const itemLayers = items.map((item) => {
  const span = item.span ?? 1;
  const svg = sizedSvg(readSvg('items', item.key), Math.round(CELL * span * 0.9));
  const flip = item.flip ? 'flip' : '';
  const width = CELL * span;
  const left = (item.col - 1) * CELL;
  const top = (item.row - 1) * CELL;
  return `<div class="item ${flip}" title="${item.label}" style="left:${left}px;top:${top}px;width:${width}px;height:${CELL}px">${svg}</div>`;
});

const zoneLegend = [...new Set(GRID.flatMap((row) => [...row]))].map((zone) => {
  const count = GRID.reduce((sum, row) => sum + [...row].filter((cell) => cell === zone).length, 0);
  const texture = zoneTextures[zone];
  return `<li><span class="swatch texture-${texture}"></span><strong>${zone}</strong> ${zoneNames[zone]}<small>${count} кл.</small></li>`;
}).join('');

const newKeys = ['tractor', 'roadBarrier', 'trafficCone'];
const newKeyLegend = newKeys.map((key) => `<li><code>${key}</code><span>${items.find((item) => item.key === key)!.label}</span></li>`).join('');
const themeImage = dataUrl(readSvg('themes', 'trafficJam'));
const density = Math.round((claimedCells.size / (rowCount * colCount)) * 100);
const width = colCount * CELL;
const height = rowCount * CELL;
const textureRules = [...textureUrls.entries()]
  .map(([key, url]) => `.texture-${key}{background-image:url("${url}")}`)
  .join('\n');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Пробка на шоссе — макет уровня</title>
<style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#efe9df;color:#1a1a1a;font:14px/1.45 -apple-system,"Segoe UI",sans-serif}
  main{max-width:1160px;margin:auto}h1{margin:0 0 4px;font-size:24px}p{margin:6px 0 16px;color:#5a4636}
  .notice{padding:10px 12px;border-left:4px solid #7b2431;background:#fff;border-radius:4px;max-width:92ch}
  .layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:20px;align-items:start}
  .board-wrap{overflow:auto;background:#d6cabc;padding:10px;border-radius:10px}
  .board{position:relative;width:${width}px;height:${height}px;background:#3a2a20;box-shadow:0 3px 10px #3a2a2040}
  .cell{position:absolute;width:${CELL}px;height:${CELL}px;background-size:${CELL}px ${CELL}px}
  .cell.top{border-top:3px solid #3a2a20}.cell.right{border-right:3px solid #3a2a20}.cell.bottom{border-bottom:3px solid #3a2a20}.cell.left{border-left:3px solid #3a2a20}
  .cell.repair{background-image:repeating-linear-gradient(135deg,#e0a94a66 0 8px,#1a1a1a33 8px 12px),url("${textureUrls.get('dirt')}")}
  .item{position:absolute;z-index:2;display:flex;align-items:center;justify-content:center;pointer-events:none}
  .item svg{overflow:visible}.item.flip svg{transform:scaleX(-1)}
  aside{background:#fff;border:1px solid #d8cfc0;border-radius:10px;padding:12px}aside h2{font-size:16px;margin:0 0 8px}
  ul{list-style:none;margin:0;padding:0}aside li{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid #eee7de}
  aside li small{margin-left:auto;color:#7a6a58}.swatch{width:22px;height:22px;flex:none;border:1px solid #1a1a1a55;background-size:22px 22px}
  .keys{margin-top:18px}.keys li{display:grid;grid-template-columns:105px 1fr;gap:6px}.caption{margin-top:12px;font-size:12px;color:#6e6254}
  .theme-image{display:block;width:84px;height:84px;object-fit:contain;margin:8px auto}.theme-note{font-size:12px;color:#6e6254}
  code{font-size:12px;color:#7b2431}.board-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 8px}.board-title small{color:#6e6254}
  @media(max-width:900px){.layout{grid-template-columns:1fr}aside{display:grid;grid-template-columns:1fr 1fr;gap:18px}.keys{margin:0}}
  @media(max-width:560px){body{padding:14px}.board-wrap{padding:6px}aside{grid-template-columns:1fr}.keys{margin-top:0}}
  ${textureRules}
</style>
</head>
<body><main>
  <h1>Пробка на шоссе — визуальный макет</h1>
  <p>10×10 · шесть зон · ${items.length} объектов · занято предметами ${density}% площади</p>
  <p class="notice">Это черновой просмотр карты и staged-арта, не файл уровня: персонажи, подсказки и роли ещё не заданы. Транспортные позиции следуют брифу; декор обочин и разделителя расставлен для визуальной оценки и может перемещаться. Все SVG загружены из <code>art/</code>, в <code>src/assets/</code> ничего не копировалось.</p>
  <div class="layout">
    <section>
      <div class="board-title"><strong>Потоки, разделитель и ремонт</strong><small>клетка ${CELL}px · ремонт: r4 c5–9</small></div>
      <div class="board-wrap"><div class="board">${cells.join('')}${itemLayers.join('')}</div></div>
      <p class="caption">Для карты в макете использованы асфальт на дорогах, трава на обочинах и отдельная бетонная текстура разделителя. Диагональная штриховка отмечает ремонт и не обозначает препятствия игрового поля.</p>
    </section>
    <aside>
      <section><h2>Зоны</h2><ul>${zoneLegend}</ul></section>
      <section class="keys"><h2>Новые staged-ключи</h2><ul>${newKeyLegend}</ul></section>
      <section class="keys"><h2>Кандидат иконки темы</h2><img class="theme-image" src="${themeImage}" alt="Пробка на шоссе"><p class="theme-note"><code>trafficJam</code> · ещё не привязана к уровню</p></section>
    </aside>
  </div>
</main></body></html>`;

writeFileSync(OUT, html);
console.log(`Traffic jam level preview written to ${OUT}`);
