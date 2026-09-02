import type { CSSProperties, MouseEvent } from 'react';
import type { ItemType, Person } from '../../types/level';
import type { PersonCheckStatus } from '../../types/game';
import type { CrossKind } from '../../engine/selectors';
import { CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from './ItemIcon';
import { PersonToken } from './PersonToken';
import { PencilMarks } from './PencilMarks';
import type { PencilMarkEntry } from './PencilMarks';
import { CrossOverlay } from './CrossOverlay';

export interface RoomBoundary {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const HOVER_ACCENT = '#ffcf4d';

interface GridCellProps {
  testId: string;
  /** 0-based board coordinates — pin the cell to its grid track so cut-out (missing) cells leave holes instead of shifting others. */
  row: number;
  col: number;
  floorStyle: CSSProperties;
  itemType?: ItemType;
  suppressItemIcon?: boolean;
  tooltip?: string;
  person?: Person;
  personStatus?: PersonCheckStatus;
  pencilMarks: PencilMarkEntry[];
  crossKind: CrossKind;
  boundary: RoomBoundary;
  interactive: boolean;
  highlighted: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function GridCell({
  testId,
  row,
  col,
  floorStyle,
  itemType,
  suppressItemIcon,
  tooltip,
  person,
  personStatus,
  pencilMarks,
  crossKind,
  boundary,
  interactive,
  highlighted,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
}: GridCellProps) {
  const style: CSSProperties = {
    ...floorStyle,
    width: CELL_SIZE,
    height: CELL_SIZE,
    gridRow: row + 1,
    gridColumn: col + 1,
    cursor: interactive ? 'pointer' : 'default',
    borderTopWidth: boundary.top ? 3 : 1,
    borderRightWidth: boundary.right ? 3 : 1,
    borderBottomWidth: boundary.bottom ? 3 : 1,
    borderLeftWidth: boundary.left ? 3 : 1,
    borderTopColor: highlighted && boundary.top ? HOVER_ACCENT : undefined,
    borderRightColor: highlighted && boundary.right ? HOVER_ACCENT : undefined,
    borderBottomColor: highlighted && boundary.bottom ? HOVER_ACCENT : undefined,
    borderLeftColor: highlighted && boundary.left ? HOVER_ACCENT : undefined,
  };

  return (
    <div
      className="grid-cell"
      data-testid={testId}
      style={style}
      title={tooltip}
      onClick={interactive ? onClick : undefined}
      onContextMenu={interactive ? onContextMenu : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {itemType && !person && !suppressItemIcon && (
        <ItemIcon itemType={itemType} size={itemType.kind === 'decorative' ? 40 : 26} />
      )}
      {itemType && person && itemType.kind === 'occupiable' && (
        <div className="grid-cell__item-under">
          <ItemIcon itemType={itemType} size={22} />
        </div>
      )}
      {person && <PersonToken person={person} status={personStatus} />}
      <PencilMarks marks={pencilMarks} />
      <CrossOverlay kind={crossKind} />
    </div>
  );
}
