import type { CSSProperties } from 'react';
import type { CellId, ItemType } from '../../types/level';
import { cellId } from '../../types/level';
import { floorStyle, CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from '../board/ItemIcon';
import type { EditorItem, EditorPerson, EditorRoom } from './editorStore';

interface EditorBoardProps {
  size: number;
  rooms: EditorRoom[];
  roomByCell: Record<CellId, string>;
  items: EditorItem[];
  itemTypesById: Map<string, ItemType>;
  /** Персонажи на клетках — для шага "Решение" (клетка -> персонаж). */
  peopleAtCell?: Map<CellId, EditorPerson>;
  /** id персонажа, выделенного для перестановки местами (шаг "Решение"). */
  selectedPersonId?: string | null;
  onCellClick?: (cell: CellId) => void;
  onCellEnter?: (cell: CellId) => void;
  interactive?: boolean;
}

function boundaryFor(roomByCell: Record<CellId, string>, row: number, col: number) {
  const own = roomByCell[cellId(row, col)];
  const neighbor = (r: number, c: number) => roomByCell[cellId(r, c)];
  return {
    top: neighbor(row - 1, col) !== own,
    right: neighbor(row, col + 1) !== own,
    bottom: neighbor(row + 1, col) !== own,
    left: neighbor(row, col - 1) !== own,
  };
}

export function EditorBoard({
  size,
  rooms,
  roomByCell,
  items,
  itemTypesById,
  peopleAtCell,
  selectedPersonId,
  onCellClick,
  onCellEnter,
  interactive = true,
}: EditorBoardProps) {
  const roomsById = new Map(rooms.map((r) => [r.id, r]));
  const itemByCell = new Map(items.map((it) => [it.cellId, it]));

  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) cells.push({ row, col });
  }

  return (
    <div
      className="editor-board"
      style={{ gridTemplateColumns: `repeat(${size}, ${CELL_SIZE}px)`, gridTemplateRows: `repeat(${size}, ${CELL_SIZE}px)` }}
    >
      {cells.map(({ row, col }) => {
        const cid = cellId(row, col);
        const roomId = roomByCell[cid];
        const room = roomId ? roomsById.get(roomId) : undefined;
        const item = itemByCell.get(cid);
        const itemType = item ? itemTypesById.get(item.typeId) : undefined;
        const person = peopleAtCell?.get(cid);
        const boundary = boundaryFor(roomByCell, row, col);

        const style: CSSProperties = room
          ? floorStyle(room.floorTexture, row, col)
          : {
              backgroundColor: '#e5e1d6',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0 6px, transparent 6px 12px)',
            };

        return (
          <button
            key={cid}
            type="button"
            className="editor-cell"
            style={{
              ...style,
              gridColumn: col + 1,
              gridRow: row + 1,
              borderTopWidth: boundary.top ? 2 : 0,
              borderRightWidth: boundary.right ? 2 : 0,
              borderBottomWidth: boundary.bottom ? 2 : 0,
              borderLeftWidth: boundary.left ? 2 : 0,
            }}
            onClick={() => onCellClick?.(cid)}
            onMouseEnter={() => onCellEnter?.(cid)}
            disabled={!interactive}
          >
            {itemType && !person && (
              <span className="editor-cell__item">
                <ItemIcon itemType={itemType} size={30} />
              </span>
            )}
            {itemType && person && (
              <span className="editor-cell__item-under">
                <ItemIcon itemType={itemType} size={20} />
              </span>
            )}
            {person && (
              <span
                className={`editor-cell__person${person.id === selectedPersonId ? ' editor-cell__person--selected' : ''}`}
                style={{ backgroundColor: person.color }}
              >
                {person.initialLetter}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
