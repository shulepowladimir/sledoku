import { useState } from 'react';
import type { RoomId } from '../../types/level';
import { isLegalTarget, cellBoundary } from '../../engine/board';
import { occupantOf, marksOf, crossKind, personStatus } from '../../engine/selectors';
import { useGameStore } from '../../state/gameStore';
import { GridCell } from './GridCell';
import { RoomLabel } from './RoomLabel';
import { ItemOverlay } from './ItemOverlay';
import { floorStyle, CELL_SIZE } from '../../styles/floorTextures';

export function Board() {
  const level = useGameStore((s) => s.level);
  const index = useGameStore((s) => s.index);
  const player = useGameStore((s) => s.player);
  const handleLeftClick = useGameStore((s) => s.handleLeftClick);
  const handleRightClick = useGameStore((s) => s.handleRightClick);

  const [hoveredRoomId, setHoveredRoomId] = useState<RoomId | null>(null);

  const itemTypesById = new Map(level.itemTypes.map((t) => [t.id, t]));
  const itemsById = new Map(level.items.map((i) => [i.id, i]));
  const peopleById = new Map(level.people.map((p) => [p.id, p]));
  const roomsById = new Map(level.rooms.map((r) => [r.id, r]));
  const floorFeaturesById = new Map(level.floorFeatures.map((f) => [f.id, f]));

  const roomOriginById = new Map<RoomId, { minRow: number; minCol: number }>();
  for (const room of level.rooms) {
    const roomCells = level.cells.filter((c) => c.roomId === room.id);
    roomOriginById.set(room.id, {
      minRow: Math.min(...roomCells.map((c) => c.row)),
      minCol: Math.min(...roomCells.map((c) => c.col)),
    });
  }
  const featureOriginById = new Map<string, { minRow: number; minCol: number }>();
  for (const feature of level.floorFeatures) {
    const featureCells = level.cells.filter((c) => c.floorFeatureId === feature.id);
    if (featureCells.length === 0) continue;
    featureOriginById.set(feature.id, {
      minRow: Math.min(...featureCells.map((c) => c.row)),
      minCol: Math.min(...featureCells.map((c) => c.col)),
    });
  }

  const suppressedCellIds = new Set<string>();
  const multiCellOverlays = level.items
    .filter((item) => item.cells.length > 1)
    .map((item) => ({ item, itemType: itemTypesById.get(item.typeId) }))
    .filter((entry): entry is { item: (typeof level.items)[number]; itemType: NonNullable<typeof entry.itemType> } => !!entry.itemType)
    .filter(({ item }) => !item.cells.some((cid) => occupantOf(player, cid)));
  for (const { item } of multiCellOverlays) {
    for (const cid of item.cells) suppressedCellIds.add(cid);
  }

  const roomLabels = level.rooms.map((room) => {
    const roomCells = level.cells.filter((c) => c.roomId === room.id);
    const position = room.labelPosition ?? 'bottom';
    const edgeRow =
      position === 'top'
        ? Math.min(...roomCells.map((c) => c.row))
        : Math.max(...roomCells.map((c) => c.row));
    const edgeRowCells = roomCells.filter((c) => c.row === edgeRow);
    const meanCol = roomCells.reduce((sum, c) => sum + c.col, 0) / roomCells.length;
    const emptyEdgeCells = edgeRowCells.filter((c) => !c.itemId);
    const candidates = emptyEdgeCells.length > 0 ? emptyEdgeCells : edgeRowCells;
    const anchorCell = candidates.reduce((best, c) =>
      Math.abs(c.col - meanCol) < Math.abs(best.col - meanCol) ? c : best,
    );
    return { room, position, anchorRow: anchorCell.row, anchorCol: anchorCell.col };
  });

  // Levels with cut-out cells (e.g. rounded map corners) render fewer cells than size*size.
  // Holes must stay empty, so every rendered cell pins itself to its grid track explicitly.
  const hasCutouts = level.cells.length < level.size * level.size;

  // Large boards (11×11, 12×12+) don't fit the viewport next to the roster panel:
  // scale the whole board down in steps so the player sees it without scrolling.
  // The wrapper reserves the scaled size so flex layout is not fooled by the untransformed box.
  const boardScale = level.size >= 12 ? 0.875 : level.size === 11 ? 0.9 : 1;

  const board = (
    <div
      className={`board${hasCutouts ? ' board--cut' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${level.size}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${level.size}, ${CELL_SIZE}px)`,
        // explicit size keeps the grid from shrinking to the scaled wrapper's width
        width: level.size * CELL_SIZE,
        height: level.size * CELL_SIZE,
        ...(boardScale !== 1 ? { transform: `scale(${boardScale})`, transformOrigin: 'top left' } : {}),
      }}
    >
      {multiCellOverlays.map(({ item, itemType }) => (
        <ItemOverlay key={item.id} item={item} itemType={itemType} />
      ))}
      {level.cells.map((cell) => {
        const item = cell.itemId ? itemsById.get(cell.itemId) : undefined;
        const itemType = item ? itemTypesById.get(item.typeId) : undefined;
        const feature = cell.floorFeatureId ? floorFeaturesById.get(cell.floorFeatureId) : undefined;
        const tooltip = itemType?.label ?? feature?.label;
        const textureKey = feature?.textureKey ?? roomsById.get(cell.roomId)?.floorTexture ?? 'tile';
        const origin = (feature ? featureOriginById.get(feature.id) : roomOriginById.get(cell.roomId)) ?? {
          minRow: 0,
          minCol: 0,
        };
        const personId = occupantOf(player, cell.id);
        const person = personId ? peopleById.get(personId) : undefined;
        const marks = marksOf(player, cell.id);
        const pencilMarks = Array.from(marks.pencilMarks).map((pid) => {
          const markPerson = peopleById.get(pid);
          return { letter: markPerson?.initialLetter ?? '?', color: markPerson?.color ?? '#999999' };
        });

        return (
          <GridCell
            key={cell.id}
            testId={`cell-${cell.id}`}
            row={cell.row}
            col={cell.col}
            floorStyle={floorStyle(textureKey, cell.row - origin.minRow, cell.col - origin.minCol)}
            itemType={itemType}
            suppressItemIcon={suppressedCellIds.has(cell.id)}
            tooltip={tooltip}
            person={person}
            personStatus={personId ? personStatus(player, personId) : undefined}
            pencilMarks={pencilMarks}
            crossKind={crossKind(player, cell.id)}
            boundary={cellBoundary(index, cell.id)}
            interactive={isLegalTarget(index, level, cell.id)}
            highlighted={hoveredRoomId === cell.roomId}
            onClick={() => handleLeftClick(cell.id)}
            onContextMenu={(event) => {
              event.preventDefault();
              handleRightClick(cell.id);
            }}
            onMouseEnter={() => setHoveredRoomId(cell.roomId)}
            onMouseLeave={() => setHoveredRoomId(null)}
          />
        );
      })}
      {roomLabels.map(({ room, position, anchorRow, anchorCol }) => (
        <RoomLabel key={room.id} name={room.name} anchorRow={anchorRow} anchorCol={anchorCol} position={position} />
      ))}
    </div>
  );

  if (boardScale === 1) return board;

  return (
    <div
      style={{
        width: level.size * CELL_SIZE * boardScale,
        height: level.size * CELL_SIZE * boardScale,
      }}
    >
      {board}
    </div>
  );
}
