import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RoomId } from '../../types/level';
import { parseCellId } from '../../types/level';
import { isLegalTarget, cellBoundary } from '../../engine/board';
import { occupantOf, marksOf, crossKind, personStatus } from '../../engine/selectors';
import { useGameStore } from '../../state/gameStore';
import { useAxisLabelsStore } from '../../state/axisLabelsStore';
import { GridCell } from './GridCell';
import { RoomLabel } from './RoomLabel';
import { ItemOverlay } from './ItemOverlay';
import { ItemTileOverlay } from './ItemTileOverlay';
import { LabelPopup } from './LabelPopup';
import { floorStyle, CELL_SIZE } from '../../styles/floorTextures';
import { polyominoOutlinePath } from '../../engine/polyomino';

/** Сколько живёт вспышка обводки предмета после отпускания пальца (мобайл). */
const ITEM_OUTLINE_FLASH_MS = 600;

/** Габарит зоны подписей координат: 22px сверху (столбцы) и справа (ряды). */
const AXIS_TOP = 22;
const AXIS_RIGHT = 22;
/** Отступ чисел-рядов от правой кромки поля. */
const AXIS_GAP = 6;

export function Board() {
  const level = useGameStore((s) => s.level);
  const index = useGameStore((s) => s.index);
  const player = useGameStore((s) => s.player);
  const handleLeftClick = useGameStore((s) => s.handleLeftClick);
  const handleRightClick = useGameStore((s) => s.handleRightClick);
  const axisLabels = useAxisLabelsStore((s) => s.axisLabels);

  const [hoveredRoomId, setHoveredRoomId] = useState<RoomId | null>(null);
  // Подпись предмета/фичи пола по долгому нажатию (мобильные; см. LabelPopup).
  const [labelPopup, setLabelPopup] = useState<{ text: string; x: number; y: number } | null>(null);
  // Обводка предмета при наведении (десктоп) / нажатии (мобайл): красная пунктирная
  // для decorative («туда нельзя»), зелёная сплошная для occupiable. id предмета
  // либо null; вспышка после короткого тапа держится до touchend + FLASH_MS.
  // Контур — точный силуэт полиомино (ломаные предметы), не bbox.
  const [outlinedItemId, setOutlinedItemId] = useState<string | null>(null);
  const outlineFlashTimeoutRef = useRef<number | null>(null);
  const clearOutlineFlash = () => {
    if (outlineFlashTimeoutRef.current != null) {
      clearTimeout(outlineFlashTimeoutRef.current);
      outlineFlashTimeoutRef.current = null;
    }
  };
  useEffect(() => clearOutlineFlash, []);
  /** Наведение с мыши: обводка живёт, пока курсор на клетках предмета. */
  const hoverItem = (itemId: string | null) => {
    if (itemId === outlinedItemId) return;
    clearOutlineFlash();
    setOutlinedItemId(itemId);
  };
  /** Тач: палец на клетке — обводка; отпустил — короткая вспышка и снятие. */
  const pressItem = (itemId: string) => {
    clearOutlineFlash();
    setOutlinedItemId(itemId);
  };
  const releaseItem = () => {
    if (outlinedItemId == null) return;
    clearOutlineFlash();
    outlineFlashTimeoutRef.current = window.setTimeout(() => {
      outlineFlashTimeoutRef.current = null;
      setOutlinedItemId(null);
    }, ITEM_OUTLINE_FLASH_MS);
  };

  const itemTypesById = new Map(level.itemTypes.map((t) => [t.id, t]));
  const itemsById = new Map(level.items.map((i) => [i.id, i]));
  const peopleById = new Map(level.people.map((p) => [p.id, p]));
  const roomsById = new Map(level.rooms.map((r) => [r.id, r]));
  const floorFeaturesById = new Map(level.floorFeatures.map((f) => [f.id, f]));
  // Нестандартные карты: rows = size, cols = level.cols ?? size (квадрат по умолчанию).
  const rows = level.size;
  const cols = level.cols ?? level.size;

  // Обводка предмета: точный силуэт полиомино (bounding box врал бы на ломаных
  // формах — подсвечивал пустые клетки в вогнутых углах). null, когда не подсвечено.
  const outlinedItem = outlinedItemId ? itemsById.get(outlinedItemId) : undefined;
  const outlinedItemType = outlinedItem ? itemTypesById.get(outlinedItem.typeId) : undefined;
  let outlineStyle: CSSProperties | null = null;
  let outlinePath = '';
  if (outlinedItem && outlinedItemType) {
    const coords = outlinedItem.cells.map(parseCellId);
    const minRow = Math.min(...coords.map((c) => c.row));
    const maxRow = Math.max(...coords.map((c) => c.row));
    const minCol = Math.min(...coords.map((c) => c.col));
    const maxCol = Math.max(...coords.map((c) => c.col));
    outlineStyle = {
      left: minCol * CELL_SIZE,
      top: minRow * CELL_SIZE,
      width: (maxCol - minCol + 1) * CELL_SIZE,
      height: (maxRow - minRow + 1) * CELL_SIZE,
    };
    outlinePath = polyominoOutlinePath(outlinedItem.cells, CELL_SIZE, minRow, minCol);
  }

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
    // тайл-предметы (render:'tile') рендерятся своим слоем ItemTileOverlay —
    // боксовая иконка поверх bbox им не нужна (гигантские квадраты поверх карты)
    .filter(({ itemType }) => itemType.render !== 'tile')
    .filter(({ item }) => !item.cells.some((cid) => occupantOf(player, cid)));
  for (const { item } of multiCellOverlays) {
    for (const cid of item.cells) suppressedCellIds.add(cid);
  }

  // Тайл-предметы (render: 'tile') — свой слой: иконка повторяется per-cell на всю
  // клетку + постоянный силуэтный контур. Из боксовых оверлеев и подавления иконок
  // они исключены (GridCell не должен рисовать иконку поверх тайла).
  const tileOverlays = level.items
    .map((item) => ({ item, itemType: itemTypesById.get(item.typeId) }))
    .filter((entry): entry is { item: (typeof level.items)[number]; itemType: NonNullable<typeof entry.itemType> } => !!entry.itemType && entry.itemType.render === 'tile');
  for (const { item } of tileOverlays) {
    for (const cid of item.cells) suppressedCellIds.add(cid);
  }

  const roomLabels = level.rooms.map((room) => {
    const roomCells = level.cells.filter((c) => c.roomId === room.id);
    const position = room.labelPosition ?? 'bottom';
    const align = room.labelAlign ?? 'center';
    const edgeRow =
      position === 'top'
        ? Math.min(...roomCells.map((c) => c.row))
        : Math.max(...roomCells.map((c) => c.row));
    const edgeRowCells = roomCells.filter((c) => c.row === edgeRow);
    let anchorCell;
    if (align === 'left' || align === 'right') {
      // Край зоны: плашка с собственным фоном читаема и поверх предмета;
      // предпочтение пустых клеток — только для центрирования.
      anchorCell = edgeRowCells.reduce((best, c) =>
        align === 'left' ? (c.col < best.col ? c : best) : (c.col > best.col ? c : best),
      );
    } else {
      const meanCol = roomCells.reduce((sum, c) => sum + c.col, 0) / roomCells.length;
      const emptyEdgeCells = edgeRowCells.filter((c) => !c.itemId);
      const candidates = emptyEdgeCells.length > 0 ? emptyEdgeCells : edgeRowCells;
      anchorCell = candidates.reduce((best, c) =>
        Math.abs(c.col - meanCol) < Math.abs(best.col - meanCol) ? c : best,
      );
    }
    return { room, position, align, anchorRow: anchorCell.row, anchorCol: anchorCell.col };
  });

  // Levels with cut-out cells (e.g. rounded map corners) render fewer cells than rows*cols.
  // Holes must stay empty, so every rendered cell pins itself to its grid track explicitly.
  const hasCutouts = level.cells.length < rows * cols;

  // Масштаб больших полей: базовые ступени для десктопа (11×11 → 0.9, ≥12 → 0.875) плюс мобильная
  // адаптация fit-by-width/height — обёртка растягивается на всю свободную ширину flex-строки,
  // ResizeObserver меряет её, и итоговый масштаб не превышает ступень и не выходит ни за доступную
  // ширину, ни за доступную высоту (телефон-ландшафт: экран широкий, но низкий).
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [availWidth, setAvailWidth] = useState(0);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      // clientWidth (а не contentRect): при включённых подписях paddingRight
      // съедает content-box, и contentRect сжимался бы на собственный padding —
      // масштабирующая спираль. clientWidth стабилен: padding внутри него.
      setAvailWidth(el.clientWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const naturalWidth = cols * CELL_SIZE;
  const naturalHeight = rows * CELL_SIZE;
  // Подписи координат живут над картой и справа от неё (absolute внутри .board):
  // их габарит учитывается в fit-расчёте и в высоте обёртки, иначе на мобиле
  // правые номера уедут за экран, а верхние перекроют ControlLegend.
  const axisTopExtra = axisLabels ? AXIS_TOP : 0;
  const axisRightExtra = axisLabels ? AXIS_RIGHT : 0;
  const effectiveWidth = naturalWidth + axisRightExtra;
  const effectiveHeight = naturalHeight + axisTopExtra;
  const maxDim = Math.max(rows, cols);
  const baseScale = maxDim >= 12 ? 0.875 : maxDim === 11 ? 0.9 : 1;
  // Fit-by-width AND fit-by-height: in phone landscape the viewport is wide but short —
  // the board must fit below the HUD bar without spilling over the roster below it.
  const fitScaleW = availWidth > 0 ? Math.min(1, availWidth / effectiveWidth) : 1;
  const availHeight = Math.max(
    120,
    window.innerHeight - (wrapperRef.current?.getBoundingClientRect().top ?? 0) - 12,
  );
  const fitScaleH = Math.min(1, availHeight / effectiveHeight);
  const boardScale = Math.max(0.3, Math.min(baseScale, fitScaleW, fitScaleH));

  return (
    <>
      <div
        ref={wrapperRef}
        className="board-wrap"
        style={{
          height: effectiveHeight * boardScale,
          paddingTop: axisTopExtra * boardScale,
          paddingRight: axisRightExtra * boardScale,
        }}
      >
      <div
        className={`board${hasCutouts ? ' board--cut' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
          // явный размер: без него grid внутри блочной обёртки сжимается до её ширины
          width: naturalWidth,
          height: naturalHeight,
          // transform применять ТОЛЬКО при реальном масштабе: даже scale(1) создаёт stacking
          // context и роняет z-index трюк туториала (tutorial-highlight клетки z-2001 должны
          // перекрывать fixed-оверлей z-2000 из root-контекста).
          ...(boardScale !== 1 ? { transform: `scale(${boardScale})`, transformOrigin: 'top left' } : {}),
        }}
      >
      {tileOverlays.map(({ item, itemType }) => (
        <ItemTileOverlay key={item.id} item={item} itemType={itemType} />
      ))}
      {multiCellOverlays.map(({ item, itemType }) => (
        <ItemOverlay key={item.id} item={item} itemType={itemType} />
      ))}
      {outlineStyle && outlinedItemType && (
        <div
          className={`item-outline${outlinedItemType.kind === 'decorative' ? ' item-outline--decorative' : ' item-outline--occupiable'}`}
          style={outlineStyle}
          data-testid="item-outline"
        >
          <svg className="item-outline__svg" viewBox={`0 0 ${outlineStyle.width} ${outlineStyle.height}`} aria-hidden="true">
            <path d={outlinePath} />
          </svg>
        </div>
      )}
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
            onMouseEnter={() => {
              setHoveredRoomId(cell.roomId);
              hoverItem(item?.id ?? null);
            }}
            onMouseLeave={() => {
              setHoveredRoomId(null);
              hoverItem(null);
            }}
            onItemPress={item ? () => pressItem(item.id) : undefined}
            onItemRelease={item ? releaseItem : undefined}
            onLongPress={tooltip ? (text, x, y) => setLabelPopup({ text, x, y }) : undefined}
          />
        );
      })}
      {roomLabels.map(({ room, position, align, anchorRow, anchorCol }) => (
        <RoomLabel key={room.id} name={room.name} anchorRow={anchorRow} anchorCol={anchorCol} position={position} align={align} />
      ))}
      {axisLabels && (
        <>
          {Array.from({ length: cols }, (_, c) => (
            <span
              key={`axis-col-${c}`}
              className="axis-label axis-label--col"
              data-testid={`axis-col-${c + 1}`}
              style={{ left: c * CELL_SIZE, top: -AXIS_TOP, width: CELL_SIZE }}
            >
              {c + 1}
            </span>
          ))}
          {Array.from({ length: rows }, (_, r) => (
            <span
              key={`axis-row-${r}`}
              className="axis-label axis-label--row"
              data-testid={`axis-row-${r + 1}`}
              style={{ top: r * CELL_SIZE, left: naturalWidth + AXIS_GAP, height: CELL_SIZE }}
            >
              {r + 1}
            </span>
          ))}
        </>
      )}
      </div>
    </div>
      {labelPopup && <LabelPopup {...labelPopup} onClose={() => setLabelPopup(null)} />}
    </>
  );
}
