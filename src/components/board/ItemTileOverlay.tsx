import type { CSSProperties } from 'react';
import type { Item, ItemType } from '../../types/level';
import { parseCellId } from '../../types/level';
import { CELL_SIZE } from '../../styles/floorTextures';
import { polyominoEdgeDecorations } from '../../engine/polyomino';
import { ItemIcon } from './ItemIcon';

interface ItemTileOverlayProps {
  item: Item;
  itemType: ItemType;
}

/** Multi-cell "wall" items (`render: 'tile'` — hedge mazes, counters): the icon
 *  repeats per cell at full cell size, tiling seamlessly like a floor texture
 *  while remaining a regular item (clues, tooltip, outline). Edge decorations
 *  (see polyominoEdgeDecorations) make each polyomino read as one solid object:
 *  an inner shadow along south/east edges and a wavy scalloped lip along
 *  north/west — volume under the art style's top-left light, never a flat
 *  texture patch. The lip is trimmed flush on the board's outer border. */
export function ItemTileOverlay({ item, itemType }: ItemTileOverlayProps) {
  const coords = item.cells.map(parseCellId);
  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));
  const width = (maxCol - minCol + 1) * CELL_SIZE;
  const height = (maxRow - minRow + 1) * CELL_SIZE;
  const style: CSSProperties = { left: minCol * CELL_SIZE, top: minRow * CELL_SIZE, width, height };
  const { shadows, scallops, contourPath } = polyominoEdgeDecorations(item.cells, CELL_SIZE, minRow, minCol);

  return (
    <div className="item-tile-overlay" style={style} data-testid={`item-tiles-${item.id}`}>
      {coords.map(({ row, col }) => (
        <div
          key={`${row}-${col}`}
          className="item-tile-overlay__tile"
          style={{
            left: (col - minCol) * CELL_SIZE,
            top: (row - minRow) * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        >
          <ItemIcon itemType={itemType} size={CELL_SIZE} />
        </div>
      ))}
      <svg className="item-tile-overlay__outline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <g className="item-tile-overlay__scallop">
          {scallops.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g className="item-tile-overlay__shadow">
          {shadows.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} />
          ))}
        </g>
        {contourPath && <path className="item-tile-overlay__contour" d={contourPath} />}
      </svg>
    </div>
  );
}
