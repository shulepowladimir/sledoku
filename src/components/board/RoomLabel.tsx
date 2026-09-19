import type { CSSProperties } from 'react';
import { CELL_SIZE } from '../../styles/floorTextures';

interface RoomLabelProps {
  name: string;
  anchorRow: number;
  anchorCol: number;
  position?: 'top' | 'bottom';
  /** Horizontal anchor within the edge row: 'center' (default) centers the pill on the
   *  anchor cell; 'left'/'right' flush the pill against the zone's left/right edge
   *  with a small inset (anchor cell = the edge row's endmost cell). */
  align?: 'left' | 'center' | 'right';
}

export function RoomLabel({
  name,
  anchorRow,
  anchorCol,
  position = 'bottom',
  align = 'center',
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
          top: anchorRow * CELL_SIZE + 4,
          transform: `translate(${xShift}, 0)`,
        }
      : {
          left,
          top: (anchorRow + 1) * CELL_SIZE,
          transform: `translate(${xShift}, calc(-100% - 4px))`,
        };

  return (
    <div className="room-label" style={style}>
      {name}
    </div>
  );
}
