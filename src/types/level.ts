export type PersonId = string;
export type RoomId = string;
export type ItemTypeId = string;
export type ItemId = string;
export type LevelId = string;
export type CellId = `${number}-${number}`; // `${row}-${col}`, 0-based

export function cellId(row: number, col: number): CellId {
  return `${row}-${col}`;
}

export function parseCellId(id: CellId): { row: number; col: number } {
  const [row, col] = id.split('-').map(Number);
  return { row, col };
}

export interface Room {
  id: RoomId;
  name: string;
  floorTexture: string; // key into the floor-texture registry
  /** Where the room label is anchored inside the room. Default: 'bottom' (just above the
   *  room's bottom edge). 'top' places it just below the room's top edge — useful on stripe
   *  maps where bottom-anchored labels of neighbouring zones would collide. */
  labelPosition?: 'top' | 'bottom';
  /** Horizontal label alignment within the edge row: 'center' (default) anchors at the
   *  item-free cell closest to the room's mean column; 'left'/'right' hug the zone's
   *  edge row ends (over items if needed — the label pill carries its own background;
   *  parkmaze-01: the NW quadrant's only free bottom cell sits on the seam with NE). */
  labelAlign?: 'left' | 'center' | 'right';
}

export type ItemKind = 'decorative' | 'occupiable';

export interface ItemType {
  id: ItemTypeId;
  label: string;
  kind: ItemKind;
  icon: string; // key into the icon registry
  /** Render mode. Absent (default): a single icon centered over the item's bounding box.
   *  'tile': the icon is repeated per cell at full cell size — for multi-cell "wall"-like
   *  items (e.g. hedge bushes of a park maze) whose cells tile seamlessly, like floor
   *  textures, while still being a regular item (clues, tooltip, outline). */
  render?: 'tile';
  /** Whether tiled items get the foliage scallops and shadow bands. Defaults to true;
   *  false keeps the polyomino contour without those depth decorations. */
  tileEdgeDepth?: boolean;
}

export interface Item {
  id: ItemId;
  typeId: ItemTypeId;
  cells: CellId[]; // 1+ cells; multi-cell furniture may take any orthogonally-connected shape (straight or bent)
}

export interface FloorFeature {
  id: string;
  label: string;
  textureKey: string; // key into the floor-texture registry; fully overrides the room's texture on its cells
}

export interface Cell {
  id: CellId;
  row: number;
  col: number;
  roomId: RoomId;
  itemId?: ItemId;
  floorFeatureId?: string;
}

export type Gender = 'male' | 'female';

export interface Person {
  id: PersonId;
  name: string;
  initialLetter: string;
  gender: Gender;
  color: string; // hex, unique within the level — roster name + on-board marks
  isVictim: boolean;
  isMurderer: boolean; // solution fact — hidden until the level is solved; revealed by name in the VictoryBanner
  roles?: string[]; // ground truth for role-based clues (e.g. 'doctor', 'patient') — free-form per level, no registry
}

import type { Clue } from './clue';

export interface LevelMeta {
  id: LevelId;
  title: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Budget for how many non-victim people may be fully pinned by their own unary clues alone (see tools/solver/puzzleQuality.ts). */
  maxFullyPinnedPeople: number;
  /** Exempts this level from the ≤20% per-clue-type share gate — accepted debt
   *  (02-shop, 03-museum, mine-01: adjacency 31.6% — epistemically mandatory clue,
   *  user-approved on QA). Do not set on new levels without an explicit user decision. */
  clueBalanceExempt?: boolean;
  /** Tutorial level: excluded from stats/leaderboards/records, rendered as a pinned "Обучение" card in the menu, runs the step-by-step tutorial scenario. */
  isTutorial?: boolean;
  /** Desktop roster column sizes (top to bottom = left to right), e.g. [5, 3, 4] for 12 people.
   *  Optional — when omitted the roster splits people into even chunks (ceil(N / columnCount)). */
  rosterColumnCounts?: number[];
}

export interface Level {
  meta: LevelMeta;
  size: number; // rows count; grid is size x cols (cols defaults to size for square levels)
  cols?: number; // for non-square maps (e.g. 10 rows x 11 cols); omit for square boards
  tilePattern?: 'checkerboard';
  rooms: Room[];
  itemTypes: ItemType[];
  items: Item[];
  floorFeatures: FloorFeature[];
  cells: Cell[]; // size*size entries, row-major
  people: Person[]; // N entries: (N-1) regular + 1 victim
  solution: Record<PersonId, CellId>;
  clues: Clue[];
}
