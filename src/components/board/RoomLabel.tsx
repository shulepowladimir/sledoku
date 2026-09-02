import type { CSSProperties } from 'react';
import { CELL_SIZE } from '../../styles/floorTextures';

interface RoomLabelProps {
  name: string;
  anchorRow: number;
  anchorCol: number;
  position?: 'top' | 'bottom';
}

export function RoomLabel({ name, anchorRow, anchorCol, position = 'bottom' }: RoomLabelProps) {
  const style: CSSProperties =
    position === 'top'
      ? {
          left: anchorCol * CELL_SIZE + CELL_SIZE / 2,
          top: anchorRow * CELL_SIZE + 4,
          transform: 'translate(-50%, 0)',
        }
      : {
          left: anchorCol * CELL_SIZE + CELL_SIZE / 2,
          top: (anchorRow + 1) * CELL_SIZE,
          transform: 'translate(-50%, calc(-100% - 4px))',
        };

  return (
    <div className="room-label" style={style}>
      {name}
    </div>
  );
}
