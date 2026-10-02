import type { CSSProperties } from 'react';
import type { Item, ItemType } from '../../types/level';
import { parseCellId } from '../../types/level';
import { CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from './ItemIcon';

interface ItemOverlayProps {
  item: Item;
  itemType: ItemType;
  occupied?: boolean;
}

export function ItemOverlay({ item, itemType, occupied = false }: ItemOverlayProps) {
  const coords = item.cells.map(parseCellId);
  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));
  const width = (maxCol - minCol + 1) * CELL_SIZE;
  const height = (maxRow - minRow + 1) * CELL_SIZE;
  const style: CSSProperties = { left: minCol * CELL_SIZE, top: minRow * CELL_SIZE, width, height };
  const iconSize = occupied
    ? Math.round(CELL_SIZE * 0.9)
    : itemType.render === 'span'
      ? Math.round(Math.max(width, height) * 0.9)
      : Math.min(width, height) * 0.8;

  return (
    <div className="item-overlay" style={style} data-testid={`item-overlay-${item.id}`}>
      <ItemIcon itemType={itemType} size={iconSize} />
    </div>
  );
}
