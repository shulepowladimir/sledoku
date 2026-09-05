import { useEffect, useRef, useState } from 'react';
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

  // Масштаб больших полей: базовые ступени для десктопа (11×11 → 0.9, ≥12 → 0.875) плюс мобильная
  // адаптация fit-by-width/height — обёртка растягивается на всю свободную ширину flex-строки,
  // ResizeObserver меряет её, и итоговый масштаб не превышает ступень и не выходит ни за доступную
  // ширину, ни за доступную высоту (телефон-ландшафт: экран широкий, но низкий).
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [availWidth, setAvailWidth] = useState(0);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setAvailWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const naturalSize = level.size * CELL_SIZE;
  const baseScale = level.size >= 12 ? 0.875 : level.size === 11 ? 0.9 : 1;
  // Fit-by-width AND fit-by-height: in phone landscape the viewport is wide but short —
  // the board must fit below the HUD bar without spilling over the roster below it.
  const fitScaleW = availWidth > 0 ? Math.min(1, availWidth / naturalSize) : 1;
  const availHeight = Math.max(
    120,
    window.innerHeight - (wrapperRef.current?.getBoundingClientRect().top ?? 0) - 12,
  );
  const fitScaleH = Math.min(1, availHeight / naturalSize);
  const boardScale = Math.max(0.3, Math.min(baseScale, fitScaleW, fitScaleH));

  return (
    <div ref={wrapperRef} className="board-wrap" style={{ height: naturalSize * boardScale }}>
      <div
        className={`board${hasCutouts ? ' board--cut' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${level.size}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${level.size}, ${CELL_SIZE}px)`,
          // явный размер: без него grid внутри блочной обёртки сжимается до её ширины
          width: naturalSize,
          height: naturalSize,
          // transform применять ТОЛЬКО при реальном масштабе: даже scale(1) создаёт stacking
          // context и роняет z-index трюк туториала (tutorial-highlight клетки z-2001 должны
          // перекрывать fixed-оверлей z-2000 из root-контекста).
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
            onClick={() => handleRightClick(cell.id)}
            onDoubleClick={() => handleLeftClick(cell.id)}
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
    </div>
  );
}
