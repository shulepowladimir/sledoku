import type { CellId } from '../types/level';
import { parseCellId } from '../types/level';

/**
 * Polyomino outline utilities — exact silhouette tracing for multi-cell items
 * (bent shapes, walls, mazes). A bounding box would light up empty cells inside
 * concave angles; the traced contour follows the item's true shape, including
 * hole boundaries (a ring of hedges keeps its inner contour).
 */

interface DirectedEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Builds a closed SVG path around the polyomino's silhouette: one `M…Z` ring per
 * contour (outer ring + one per hole), coordinates in px given `cellSize` and the
 * polyomino's min-row/min-col origin. Outer rings wind clockwise, holes counter-
 * clockwise — compatible with evenodd fill. Rings are traced by walking directed
 * unit edges head-to-tail: every non-boundary unit edge has exactly one unused
 * continuation at its head, so every walk closes.
 */
export function polyominoOutlinePath(cells: CellId[], cellSize: number, minRow: number, minCol: number): string {
  const occupied = new Set(cells);
  const edges: DirectedEdge[] = [];
  const push = (x1: number, y1: number, x2: number, y2: number) => edges.push({ x1, y1, x2, y2 });

  for (const cid of cells) {
    const { row, col } = parseCellId(cid);
    const x = (col - minCol) * cellSize;
    const y = (row - minRow) * cellSize;
    // Boundary edges of this cell (skipped when the neighbour is part of the item).
    // Top edge goes right, bottom goes left, left goes up, right goes down —
    // that yields clockwise outer rings.
    if (!occupied.has(`${row - 1}-${col}`)) push(x, y, x + cellSize, y);
    if (!occupied.has(`${row + 1}-${col}`)) push(x + cellSize, y + cellSize, x, y + cellSize);
    if (!occupied.has(`${row}-${col - 1}`)) push(x, y + cellSize, x, y);
    if (!occupied.has(`${row}-${col + 1}`)) push(x + cellSize, y, x + cellSize, y + cellSize);
  }

  // Index edge start points for head-to-tail chaining: "x1,y1" → edge indices.
  const byStart = new Map<string, number[]>();
  edges.forEach((e, i) => {
    const key = `${e.x1},${e.y1}`;
    const list = byStart.get(key);
    if (list) list.push(i);
    else byStart.set(key, [i]);
  });

  const used = new Array<boolean>(edges.length).fill(false);
  const rings: DirectedEdge[][] = [];
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    const ring: DirectedEdge[] = [];
    let cur = i;
    while (!used[cur]) {
      used[cur] = true;
      ring.push(edges[cur]);
      const candidates = byStart.get(`${edges[cur].x2},${edges[cur].y2}`) ?? [];
      const next = candidates.find((j) => !used[j]);
      if (next === undefined) break; // walk closed — back at the ring's start
      cur = next;
    }
    rings.push(ring);
  }

  // Rings → compact SVG path: merge collinear unit runs into single segments.
  return rings
    .map((ring) => {
      let d = `M ${ring[0].x1} ${ring[0].y1}`;
      let prevX = ring[0].x1;
      let prevY = ring[0].y1;
      for (const e of ring) {
        if (e.x1 !== prevX || e.y1 !== prevY) {
          d += ` M ${e.x1} ${e.y1}`; // ring start after a break (defensive; walks close)
        }
        d += ` L ${e.x2} ${e.y2}`;
        prevX = e.x2;
        prevY = e.y2;
      }
      return `${d} Z`;
    })
    .join(' ');
}

export type EdgeDirection = 'north' | 'south' | 'west' | 'east';

export interface EdgeSegment {
  row: number; // absolute board coordinates (0-based)
  col: number;
  dir: EdgeDirection;
}

/**
 * Unit boundary segments of a polyomino: for every cell, each side whose
 * orthogonal neighbour is NOT part of the item yields one segment. A segment
 * "north" means the cell's top side faces a non-item cell (or the outside).
 * Shared source of truth for edge decorations (rendering) and their tests.
 */
export function polyominoEdgeSegments(cells: CellId[]): EdgeSegment[] {
  const occupied = new Set(cells);
  const segments: EdgeSegment[] = [];
  for (const cid of cells) {
    const { row, col } = parseCellId(cid);
    if (!occupied.has(`${row - 1}-${col}`)) segments.push({ row, col, dir: 'north' });
    if (!occupied.has(`${row + 1}-${col}`)) segments.push({ row, col, dir: 'south' });
    if (!occupied.has(`${row}-${col - 1}`)) segments.push({ row, col, dir: 'west' });
    if (!occupied.has(`${row}-${col + 1}`)) segments.push({ row, col, dir: 'east' });
  }
  return segments;
}

export interface PolyominoEdgeDecorations {
  /** Inner shadow strips along south/east edges (light from the north-west):
   *  solid dark-green rectangles pressed against the boundary, inside the cell. */
  shadows: { x: number; y: number; width: number; height: number }[];
  /** Open quadratic "lens" paths bulging OUT along north/west edges — a wavy
   *  foliage lip. Fill + stroke of an open path: the chord is not stroked. */
  scallops: string[];
  /** Straight dark contour strokes along south/east edges (the lit scallop
   *  strokes cover north/west, so they are absent here). */
  contourPath: string;
}

/**
 * Edge decorations that make a tiled polyomino read as one solid object with
 * volume rather than a texture patch: south/east sides get an inner shadow
 * strip, north/west sides get a wavy scalloped lip (light from the top-left,
 * the art style guide's global light). Scallop lips on the board's outer edge
 * (row 0 / col 0) are suppressed — the bush is "trimmed" flush with the frame
 * instead of spilling over the board border.
 */
export function polyominoEdgeDecorations(
  cells: CellId[],
  cellSize: number,
  minRow: number,
  minCol: number,
): PolyominoEdgeDecorations {
  const strip = Math.max(3, Math.round(cellSize * 0.09)); // shadow strip depth (≈6px at 64)
  const lip = Math.max(2, Math.round(cellSize * 0.05)); // scallop apex depth (≈3px at 64)

  const shadows: PolyominoEdgeDecorations['shadows'] = [];
  const scallops: string[] = [];
  let contour = '';

  for (const seg of polyominoEdgeSegments(cells)) {
    const x = (seg.col - minCol) * cellSize;
    const y = (seg.row - minRow) * cellSize;
    if (seg.dir === 'south') {
      shadows.push({ x, y: y + cellSize - strip, width: cellSize, height: strip });
      contour += ` M ${x} ${y + cellSize} L ${x + cellSize} ${y + cellSize}`;
    } else if (seg.dir === 'east') {
      shadows.push({ x: x + cellSize - strip, y, width: strip, height: cellSize });
      contour += ` M ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize}`;
    } else if (seg.dir === 'north') {
      // Q control at -2*lip → curve apex dips `lip` above the edge.
      if (seg.row > 0) scallops.push(`M ${x} ${y} Q ${x + cellSize / 2} ${y - 2 * lip} ${x + cellSize} ${y}`);
    } else {
      if (seg.col > 0) scallops.push(`M ${x} ${y} Q ${x - 2 * lip} ${y + cellSize / 2} ${x} ${y + cellSize}`);
    }
  }

  return { shadows, scallops, contourPath: contour.trim() };
}
