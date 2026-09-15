import type { CSSProperties } from 'react';
import type { Item, ItemType } from '../../types/level';
import { parseCellId } from '../../types/level';
import { CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from './ItemIcon';

interface ItemOverlayProps {
  item: Item;
  itemType: ItemType;
}

/** Per-item-type icon scale for MULTI-cell items (default 0.8). Single-cell items
 *  render via GridCell — see ITEM_CELL_ICON_SIZE there. */
const ITEM_ICON_SCALE: Record<string, number> = {};

export function ItemOverlay({ item, itemType }: ItemOverlayProps) {
  const coords = item.cells.map(parseCellId);
  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));
  const width = (maxCol - minCol + 1) * CELL_SIZE;
  const height = (maxRow - minRow + 1) * CELL_SIZE;
  const style: CSSProperties = { left: minCol * CELL_SIZE, top: minRow * CELL_SIZE, width, height };
  const iconSize = Math.min(width, height) * (ITEM_ICON_SCALE[itemType.id] ?? 0.8);

  return (
    <div className="item-overlay" style={style}>
      <ItemIcon itemType={itemType} size={iconSize} />
    </div>
  );
}
