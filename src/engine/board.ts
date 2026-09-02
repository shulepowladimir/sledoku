import type { Cell, CellId, ItemType, Level } from '../types/level';
import { cellId, parseCellId } from '../types/level';

export interface CellBoundary {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface LevelIndex {
  cellsById: Map<CellId, Cell>;
  itemTypesById: Map<string, ItemType>;
  /** For each cell, every OTHER cell sharing its row or column that is a legal placement target. */
  rowColPeersById: Map<CellId, CellId[]>;
}

export function buildLevelIndex(level: Level): LevelIndex {
  const cellsById = new Map(level.cells.map((c) => [c.id, c]));
  const itemTypesById = new Map(level.itemTypes.map((t) => [t.id, t]));

  const isLegal = (cell: Cell): boolean => {
    if (!cell.itemId) return true;
    const item = level.items.find((i) => i.id === cell.itemId);
    if (!item) return true;
    const itemType = itemTypesById.get(item.typeId);
    return itemType?.kind !== 'decorative';
  };

  const rowColPeersById = new Map<CellId, CellId[]>();
  for (const cell of level.cells) {
    const peers = level.cells.filter(
      (other) => other.id !== cell.id && (other.row === cell.row || other.col === cell.col) && isLegal(other),
    );
    rowColPeersById.set(cell.id, peers.map((p) => p.id));
  }

  return { cellsById, itemTypesById, rowColPeersById };
}

export function isLegalTarget(index: LevelIndex, level: Level, cellId: CellId): boolean {
  const cell = index.cellsById.get(cellId);
  if (!cell) return false;
  if (!cell.itemId) return true;
  const item = level.items.find((i) => i.id === cell.itemId);
  if (!item) return true;
  const itemType = index.itemTypesById.get(item.typeId);
  return itemType?.kind !== 'decorative';
}

export function rowColPeers(index: LevelIndex, cellId: CellId): CellId[] {
  return index.rowColPeersById.get(cellId) ?? [];
}

export function cellBoundary(index: LevelIndex, id: CellId): CellBoundary {
  const { row, col } = parseCellId(id);
  const roomId = index.cellsById.get(id)?.roomId;
  const neighborRoom = (r: number, c: number) => index.cellsById.get(cellId(r, c))?.roomId;
  return {
    top: neighborRoom(row - 1, col) !== roomId,
    right: neighborRoom(row, col + 1) !== roomId,
    bottom: neighborRoom(row + 1, col) !== roomId,
    left: neighborRoom(row, col - 1) !== roomId,
  };
}

export function isCorner(index: LevelIndex, id: CellId): boolean {
  const b = cellBoundary(index, id);
  return (b.top && b.left) || (b.top && b.right) || (b.bottom && b.left) || (b.bottom && b.right);
}
