import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { wineryLevel } from '../../levels/50-winery';
import { parseCellId } from '../../src/types/level';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ART = join(ROOT, 'art');
const OUT = join(ART, 'preview', 'winery-level.local.html');
const CELL = 64;

function readSvg(category: string, key: string): string {
  const path = join(ART, category, `${key}.svg`);
  if (!existsSync(path)) throw new Error(`Missing staged SVG: ${category}/${key}.svg`);
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

const roomsById = new Map(wineryLevel.rooms.map((room) => [room.id, room]));
const featuresById = new Map(wineryLevel.floorFeatures.map((feature) => [feature.id, feature]));
const typesById = new Map(wineryLevel.itemTypes.map((type) => [type.id, type]));
const textureUrls = new Map<string, string>();

for (const room of wineryLevel.rooms) {
  if (!textureUrls.has(room.floorTexture)) {
    textureUrls.set(room.floorTexture, dataUrl(readSvg('textures', room.floorTexture)));
  }
}
for (const feature of wineryLevel.floorFeatures) {
  if (!textureUrls.has(feature.textureKey)) {
    textureUrls.set(feature.textureKey, dataUrl(readSvg('textures', feature.textureKey)));
  }
}

const cellStyles = wineryLevel.cells.map((cell) => {
  const feature = cell.floorFeatureId ? featuresById.get(cell.floorFeatureId) : undefined;
  const textureKey = feature?.textureKey ?? roomsById.get(cell.roomId)!.floorTexture;
  const { row, col } = cell;
  const roomAt = (r: number, c: number) => wineryLevel.cells.find((candidate) => candidate.row === r && candidate.col === c)?.roomId;
  const boundaries = [
    roomAt(row - 1, col) !== cell.roomId ? 'top' : '',
    roomAt(row, col + 1) !== cell.roomId ? 'right' : '',
    roomAt(row + 1, col) !== cell.roomId ? 'bottom' : '',
    roomAt(row, col - 1) !== cell.roomId ? 'left' : '',
  ].filter(Boolean).join(' ');
  return `<div class="cell room-${cell.roomId} texture-${textureKey} ${boundaries}" title="${roomsById.get(cell.roomId)!.name} · ряд ${row + 1}, столбец ${col + 1}" style="left:${col * CELL}px;top:${row * CELL}px"></div>`;
});

const itemLayers = wineryLevel.items.flatMap((item) => {
  const type = typesById.get(item.typeId)!;
  const svg = readSvg('items', type.icon);
  const cells = item.cells.map(parseCellId);
  const minRow = Math.min(...cells.map((cell) => cell.row));
  const maxRow = Math.max(...cells.map((cell) => cell.row));
  const minCol = Math.min(...cells.map((cell) => cell.col));
  const maxCol = Math.max(...cells.map((cell) => cell.col));

  if (type.render === 'tile') {
    return cells.map(({ row, col }) =>
      `<div class="item-tile" style="left:${col * CELL}px;top:${row * CELL}px">${sizedSvg(svg, CELL)}</div>`,
    );
  }

  const width = (maxCol - minCol + 1) * CELL;
  const height = (maxRow - minRow + 1) * CELL;
  const iconSize = Math.round(Math.min(width, height) * 0.8);
  return [`<div class="item" style="left:${minCol * CELL}px;top:${minRow * CELL}px;width:${width}px;height:${height}px">${sizedSvg(svg, iconSize)}</div>`];
});

const roomLabels = wineryLevel.rooms.map((room) => {
  const roomCells = wineryLevel.cells.filter((cell) => cell.roomId === room.id);
  const position = room.labelPosition ?? 'bottom';
  const align = room.labelAlign ?? 'center';
  const edgeRow = position === 'top'
    ? Math.min(...roomCells.map((cell) => cell.row))
    : Math.max(...roomCells.map((cell) => cell.row));
  const edgeRowCells = roomCells.filter((cell) => cell.row === edgeRow);
  let anchorCell: typeof edgeRowCells[number];

  if (align === 'left' || align === 'right') {
    anchorCell = edgeRowCells.reduce((best, cell) =>
      align === 'left' ? (cell.col < best.col ? cell : best) : (cell.col > best.col ? cell : best),
    );
  } else {
    const meanCol = roomCells.reduce((sum, cell) => sum + cell.col, 0) / roomCells.length;
    const emptyEdgeCells = edgeRowCells.filter((cell) => !cell.itemId);
    const candidates = emptyEdgeCells.length > 0 ? emptyEdgeCells : edgeRowCells;
    anchorCell = candidates.reduce((best, cell) =>
      Math.abs(cell.col - meanCol) < Math.abs(best.col - meanCol) ? cell : best,
    );
  }

  const left = align === 'left'
    ? anchorCell.col * CELL + 8
    : align === 'right'
      ? (anchorCell.col + 1) * CELL - 8
      : anchorCell.col * CELL + CELL / 2;
  const xShift = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  const top = position === 'top' ? anchorCell.row * CELL + 4 : (anchorCell.row + 1) * CELL;
  const yShift = position === 'top' ? '0' : 'calc(-100% - 4px)';
  return `<div class="room-label" style="left:${left}px;top:${top}px;transform:translate(${xShift},${yShift})">${room.name}</div>`;
}).join('');

const roomLegend = wineryLevel.rooms.map((room) => {
  const count = wineryLevel.cells.filter((cell) => cell.roomId === room.id).length;
  const open = wineryLevel.cells.filter((cell) => cell.roomId === room.id && !cell.itemId).length;
  return `<li><span class="swatch texture-${room.floorTexture}"></span>${room.name}<small>${count} кл. · ${open} св.</small></li>`;
}).join('');

const customKeys = ['grapeVine', 'winePress', 'wineRack', 'grapeCrate', 'wineGlass', 'box'];
const customLegend = customKeys.map((key) => {
  const type = wineryLevel.itemTypes.find((candidate) => candidate.icon === key)!;
  return `<li><code>${key}</code> — ${type.label}</li>`;
}).join('');
const width = wineryLevel.size * CELL;
const height = wineryLevel.size * CELL;
const textureRules = [...textureUrls.entries()]
  .map(([key, url]) => `.texture-${key}{background-image:url("${url}")}`)
  .join('\n');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${wineryLevel.meta.title} — staged art preview</title>
<style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#efe9df;color:#1a1a1a;font:14px/1.45 -apple-system,"Segoe UI",sans-serif}
  main{max-width:1120px;margin:auto}h1{margin:0 0 4px;font-size:24px}p{margin:6px 0 16px;color:#5a4636}
  .notice{padding:10px 12px;border-left:4px solid #7b2431;background:#fff;border-radius:4px;max-width:82ch}
  .layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:20px;align-items:start}
  .board-wrap{overflow:auto;background:#d6cabc;padding:10px;border-radius:10px}
  .board{position:relative;width:${width}px;height:${height}px;background:#3a2a20;box-shadow:0 3px 10px #3a2a2040}
  .cell{position:absolute;width:${CELL}px;height:${CELL}px;background-size:${CELL}px ${CELL}px}
  .cell.top{border-top:3px solid #3a2a20}.cell.right{border-right:3px solid #3a2a20}.cell.bottom{border-bottom:3px solid #3a2a20}.cell.left{border-left:3px solid #3a2a20}
  .item,.item-tile{position:absolute;z-index:2;display:flex;align-items:center;justify-content:center;pointer-events:none}
  .item-tile{width:${CELL}px;height:${CELL}px}.item svg,.item-tile svg{overflow:visible}
  .room-label{position:absolute;z-index:3;pointer-events:none;white-space:nowrap;font-size:12px;font-weight:700;letter-spacing:.02em;color:#2a2a2a;background:rgba(250,248,244,.9);border:1px solid rgba(17,17,17,.35);border-radius:6px;padding:2px 8px}
  aside{background:#fff;border:1px solid #d8cfc0;border-radius:10px;padding:12px}aside h2{font-size:16px;margin:0 0 8px}
  ul{list-style:none;margin:0;padding:0}aside li{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid #eee7de}
  aside li small{margin-left:auto;color:#7a6a58}.swatch{width:18px;height:18px;flex:none;border:1px solid #1a1a1a33;background-size:18px 18px}
  code{font-size:12px;color:#7b2431}.keys{margin-top:18px}.keys li{display:block;padding:5px 0}
  .caption{margin-top:12px;font-size:12px;color:#6e6254}.board-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 8px}
  .board-title small{color:#6e6254}@media(max-width:900px){.layout{grid-template-columns:1fr}aside{display:grid;grid-template-columns:1fr 1fr;gap:18px}.keys{margin:0}}
  @media(max-width:560px){body{padding:14px}.board-wrap{padding:6px}aside{grid-template-columns:1fr}.keys{margin-top:0}}
  ${textureRules}
</style>
</head>
<body><main>
  <h1>${wineryLevel.meta.title}</h1>
  <p>Макет уровня ${wineryLevel.meta.id} · ${wineryLevel.size}×${wineryLevel.size} · staged art из <code>art/</code></p>
  <p class="notice">Это только локальный предпросмотр раскладки. SVG берутся из мастерской; в <code>src/assets/</code> ничего не копировалось. Виноградная лоза повторена по реальным клеткам каждого полиомино.</p>
  <div class="layout">
    <section>
      <div class="board-title"><strong>Игровое поле и предметы</strong><small>${wineryLevel.items.length} размещений · масштаб клетки ${CELL}px</small></div>
      <div class="board-wrap"><div class="board">${cellStyles.join('')}${itemLayers.join('')}${roomLabels}</div></div>
      <p class="caption">Положение комнат, текстур и предметов взято из <code>levels/50-winery.ts</code>. Персонажи не отображаются: это чистая проверка масштаба и читаемости декора.</p>
    </section>
    <aside>
      <section><h2>Зоны</h2><ul>${roomLegend}</ul></section>
      <section class="keys"><h2>Ключи новых предметов</h2><ul>${customLegend}</ul></section>
    </aside>
  </div>
</main></body></html>`;

writeFileSync(OUT, html);
console.log(`Winery level preview written to ${OUT}`);
