import type { Cell, CellId, ItemId, RoomId } from '../src/types/level';
import { cellId } from '../src/types/level';

export function buildCells(
  size: number,
  roomForCell: (row: number, col: number) => RoomId | null,
  itemAtCell: (row: number, col: number) => ItemId | undefined,
  /** Column count for non-square maps (e.g. 10 rows x 11 cols); defaults to size. */
  cols?: number,
): Cell[] {
  const colCount = cols ?? size;
  const cells: Cell[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < colCount; col++) {
      const roomId = roomForCell(row, col);
      if (roomId === null) continue; // cut-out cell (e.g. rounded map corners) — not part of the board
      const id: CellId = cellId(row, col);
      cells.push({
        id,
        row,
        col,
        roomId,
        itemId: itemAtCell(row, col),
      });
    }
  }
  return cells;
}
