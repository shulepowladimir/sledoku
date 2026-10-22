import type { CSSProperties } from 'react';
import type { EdgeItem, ItemType } from '../../types/level';
import { parseCellId } from '../../types/level';
import { CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from './ItemIcon';

interface EdgeItemOverlayProps {
  edgeItem: EdgeItem;
  itemType: ItemType;
}

export function EdgeItemOverlay({ edgeItem, itemType }: EdgeItemOverlayProps) {
  const a = parseCellId(edgeItem.cellA);
  const b = parseCellId(edgeItem.cellB);
  const verticalBoundary = a.row === b.row;
  const centerX = verticalBoundary ? (Math.min(a.col, b.col) + 1) * CELL_SIZE : a.col * CELL_SIZE + CELL_SIZE / 2;
  const centerY = verticalBoundary ? a.row * CELL_SIZE + CELL_SIZE / 2 : (Math.min(a.row, b.row) + 1) * CELL_SIZE;
  const size = Math.round(CELL_SIZE * 0.72);
  const style: CSSProperties = {
    left: centerX,
    top: centerY,
    width: size,
    height: size,
    transform: `translate(-50%, -50%) rotate(${verticalBoundary ? 90 : 0}deg)`,
  };

  return (
    <div
      className="edge-item-overlay"
      style={style}
      aria-label={itemType.label}
      data-testid={`edge-item-${edgeItem.id}`}
    >
      <ItemIcon itemType={itemType} size={size} />
    </div>
  );
}
