import type { CSSProperties } from 'react';
import { CELL_SIZE } from '../../styles/floorTextures';

interface RoomLabelProps {
  name: string;
  worldId?: string;
  anchorRow: number;
  anchorCol: number;
  position?: 'top' | 'bottom';
  /** Horizontal anchor within the edge row: 'center' (default) centers the pill on the
   *  anchor cell; 'left'/'right' flush the pill against the zone's left/right edge
   *  with a small inset (anchor cell = the edge row's endmost cell). */
  align?: 'left' | 'center' | 'right';
  edgeGap?: number;
  bottomInset?: number;
  highlighted?: boolean;
}

export function RoomLabel({
  name,
  worldId,
  anchorRow,
  anchorCol,
  position = 'bottom',
  align = 'center',
  edgeGap = 4,
  bottomInset = 0,
  highlighted = false,
}: RoomLabelProps) {
  // Горизонталь: центр якорной клетки / левый край + 8px / правый край − 8px.
  const left =
    align === 'left'
      ? anchorCol * CELL_SIZE + 8
      : align === 'right'
        ? (anchorCol + 1) * CELL_SIZE - 8
        : anchorCol * CELL_SIZE + CELL_SIZE / 2;
  const xShift = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';

  const style: CSSProperties =
    position === 'top'
      ? {
          left,
          top: anchorRow * CELL_SIZE + edgeGap,
          transform: `translate(${xShift}, 0)${worldId === 'otherworld' ? ' rotate(180deg)' : ''}`,
        }
      : {
          left,
          top: (anchorRow + 1) * CELL_SIZE - bottomInset,
          transform: `translate(${xShift}, calc(-100% - ${edgeGap}px))${worldId === 'otherworld' ? ' rotate(180deg)' : ''}`,
        };

  return (
    <div className={`room-label${highlighted ? ' room-label--highlighted' : ''}`} data-world-id={worldId} style={style}>
      {name}
    </div>
  );
}
