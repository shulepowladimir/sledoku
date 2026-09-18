import { useRef, type CSSProperties, type MouseEvent, type TouchEvent } from 'react';
import type { ItemType, Person } from '../../types/level';
import type { PersonCheckStatus } from '../../types/game';
import type { CrossKind } from '../../engine/selectors';
import { CELL_SIZE } from '../../styles/floorTextures';
import { ItemIcon } from './ItemIcon';
import { PersonToken } from './PersonToken';
import { PencilMarks } from './PencilMarks';
import type { PencilMarkEntry } from './PencilMarks';
import { CrossOverlay } from './CrossOverlay';

/** Per-item-type icon size override for single-cell items (defaults: decorative 40, occupiable 26).
 *  Some drawings leave generous safe-area margins in their viewBox and read better
 *  larger inside the cell — e.g. pokerTable renders at ~cell size. */
const ITEM_CELL_ICON_SIZE: Partial<Record<string, number>> = {
  pokerTable: 52,
};

export interface RoomBoundary {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const HOVER_ACCENT = '#ffcf4d';

/** Задержка долгого нажатия: короче нативного contextmenu Android (~500мс). */
const LONG_PRESS_MS = 450;
/** Палец сдвинулся больше чем на столько — это скролл, не лонг-пресс. */
const LONG_PRESS_SLACK_PX = 10;
/** Сколько живёт подавление клика после лонг-пресса — чтобы проглотить
 *  синтезированный браузером click сразу после touchend. */
const SUPPRESS_MS = 600;

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
  onDoubleClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  /** Долгое нажатие на клетке с подписью (предмет/фича пола) — мобильная замена hover. */
  onLongPress?: (text: string, x: number, y: number) => void;
  /** Мобильная обводка предмета: палец лёг на клетку предмета / поднялся.
   *  Вызывается только на клетках с предметом — и decorative, и occupiable. */
  onItemPress?: () => void;
  onItemRelease?: () => void;
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
  onDoubleClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  onLongPress,
  onItemPress,
  onItemRelease,
}: GridCellProps) {
  const longPressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Лонг-пресс подвешивается на ВСЕХ клетках с tooltip — в том числе на
  // неинтерактивных (decorative-предмет блокирует размещение, но подпись
  // посмотреть можно). preventDefault на touchstart НЕ звать — он ломает скролл.
  // Обводка предмета при нажатии вешается на клетки С предметом (любым):
  // красная пунктирная для decorative, зелёная сплошная для occupiable —
  // игрок сразу видит, куда ставить можно, а куда нет.
  const handleTouchStart = (event: TouchEvent) => {
    suppressClickRef.current = false; // новый жест — прежнее подавление снято
    if (event.touches.length > 1) {
      touchStartRef.current = null;
      clearLongPressTimer();
      onItemRelease?.();
      return;
    }
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearLongPressTimer();
    onItemPress?.();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, SUPPRESS_MS);
      const start = touchStartRef.current;
      onLongPress?.(tooltip ?? '', start?.x ?? touch.clientX, start?.y ?? touch.clientY);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (event: TouchEvent) => {
    const start = touchStartRef.current;
    if (!start || longPressTimerRef.current == null) return;
    const touch = event.touches[0];
    if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > LONG_PRESS_SLACK_PX) {
      touchStartRef.current = null;
      clearLongPressTimer();
      onItemRelease?.();
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    clearLongPressTimer();
    onItemRelease?.();
  };

  const handleClick = () => {
    if (suppressClickRef.current) return;
    onClick();
  };

  // Android стреляет contextmenu посреди долгого нажатия — в этот момент палец
  // ещё на экране (touchStartRef занят) либо лонг-пресс уже сработал. Оба случая —
  // НЕ десктопный ПКМ: глотаем, иначе лонг-пресс ставил бы крестик/метку.
  const handleContextMenu = (event: MouseEvent) => {
    if (suppressClickRef.current || touchStartRef.current != null || longPressTimerRef.current != null) {
      event.preventDefault();
      return;
    }
    onContextMenu(event);
  };

  const style: CSSProperties = {
    ...floorStyle,
    width: CELL_SIZE,
    height: CELL_SIZE,
    gridRow: row + 1,
    gridColumn: col + 1,
    cursor: !interactive && itemType ? 'not-allowed' : interactive ? 'pointer' : 'default',
    // Без этого мобильные браузеры ждут ~300мс перед обычным кликом (проверяя,
    // не двойной ли это тап для зума) — из-за этого двойной тап для установки
    // персонажа работал бы с ощутимой задержкой или не срабатывал вовсе.
    touchAction: 'manipulation',
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
      onClick={interactive ? handleClick : undefined}
      onDoubleClick={interactive ? onDoubleClick : undefined}
      onContextMenu={interactive ? handleContextMenu : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {itemType && !person && !suppressItemIcon && (
        <ItemIcon
          itemType={itemType}
          size={ITEM_CELL_ICON_SIZE[itemType.id] ?? (itemType.kind === 'decorative' ? 40 : 26)}
        />
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
