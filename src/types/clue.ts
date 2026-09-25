import type { PersonId, RoomId, ItemTypeId, Gender } from './level';

// Convention: clues with subject `{ type: 'role', role: 'victim' }` or `{ type: 'person', id: <victim> }`
// are never authored for a person's row — the victim's roster row always shows a fixed sentence instead
// (see RosterPanel). Role subjects 'sheriff'/'murderer' denote the hidden anonymous holder of that role:
// the solver resolves them to the unique ground-truth person (Person.roles / isMurderer) at evaluation
// time; the UI routes role-subject clues to the "Общие подсказки" section since their owner is unknown.
export type Subject = { type: 'person'; id: PersonId } | { type: 'role'; role: 'victim' | 'sheriff' | 'murderer' | (string & {}) };

interface ClueBase {
  id: string;
  text: string; // hand-authored Russian display text
  /** Roster display only: common clues sharing a groupId collapse into ONE line
   *  (the first clue's text wins) — e.g. two zoneGenderExclusive rules shown as
   *  "В парилке и мужской раздевалке находились только мужчины". Solver/lint see
   *  every clue as before; no gameplay effect. */
  groupId?: string;
}

/** "Person X was in row/column N." */
export interface PositionClue extends ClueBase {
  type: 'position';
  subject: Subject;
  axis: 'row' | 'col';
  value: number; // 0-indexed
}

/** "Person X was in room R." */
export interface RoomMembershipClue extends ClueBase {
  type: 'roomMembership';
  subject: Subject;
  roomId: RoomId;
  negated?: boolean;
}

/** "Person X was next to an item of type T" (same room, orthogonal only). */
export interface AdjacencyClue extends ClueBase {
  type: 'adjacency';
  subject: Subject;
  itemTypeId: ItemTypeId;
  negated?: boolean;
}

/** "Person X shared a room with a man/woman." */
export interface SharedRoomGenderClue extends ClueBase {
  type: 'sharedRoomGender';
  subject: Subject;
  otherGender: Gender;
  negated?: boolean;
}

/** Level-wide: "Every instance of item type T was occupied only by men/women." No subject. */
export interface ItemTypeGenderClue extends ClueBase {
  type: 'itemTypeGender';
  itemTypeId: ItemTypeId;
  gender: Gender;
}

/**
 * Level-wide: "Nobody was in the water of room R." Cells of room R without an item
 * (boat, buoy) or floor feature (ford, reef) are banned for placement — being on a
 * boat/ford/reef does not count as being in the water. No subject.
 */
export interface BareCellBanClue extends ClueBase {
  type: 'bareCellBan';
  roomId: RoomId;
}

/**
 * Level-wide: "Every instance of item type T was occupied" — e.g. "no race car was
 * left without a driver": every item of the type has at least one person standing on
 * one of its cells. No subject.
 */
export interface ItemTypeFullyOccupiedClue extends ClueBase {
  type: 'itemTypeFullyOccupied';
  itemTypeId: ItemTypeId;
  /** How many items of the type may stay unoccupied. Default 0 = "every item
   *  occupied" (racing). E.g. "exactly one car was left empty" — vacancies: 1. */
  vacancies?: number;
}

/**
 * Level-wide: "The first or the last column was empty." A disjunction: either column 0
 * or column (cols-1) has no people at all. Eager partial check: false only when someone
 * is already placed in BOTH edge columns. No subject.
 */
export interface EdgeColumnEmptyClue extends ClueBase {
  type: 'edgeColumnEmpty';
}

/**
 * Level-wide: "Women and men were never in the same room" — every occupied zone
 * is single-gender. Eager partial check: false as soon as any room holds both
 * a placed man and a placed woman (violations are monotone). No subject.
 */
export interface ZoneGenderSeparationClue extends ClueBase {
  type: 'zoneGenderSeparation';
}

/**
 * "No one was in zone A or in zone B." A disjunction: at least one of the
 * listed rooms ends up empty (parking-01: "no one was on the roof OR at the entrance").
 * Eager partial check: false only when someone is already placed in EVERY listed room.
 * No subject.
 */
export interface ZoneEmptyDisjunctionClue extends ClueBase {
  type: 'zoneEmptyDisjunction';
  roomIds: RoomId[];
}

/**
 * Level-wide: "No one was in a row with an item of type A, or in a row with an item of
 * type B" — the same empty-edge-row mechanic as edgeColumnEmpty/zoneEmptyDisjunction,
 * but the rows are derived from item placement instead of geometry/rooms
 * (bowling-01: no one was in the pins row OR in the bar-counter row). For each item type
 * the row set is every row holding at least one of its instances; the clue holds when at
 * least one of those row sets ends up empty. Eager partial check: false only when every
 * row set already has an occupant (occupancy is monotone). No subject.
 */
export interface ItemRowEmptyDisjunctionClue extends ClueBase {
  type: 'itemRowEmptyDisjunction';
  itemTypeIds: ItemTypeId[];
}

/**
 * Level-wide parity of head-count per zone: "even floors held an even number of
 * people, odd floors an odd number" — one clue covering several rooms at once.
 * Only fully checkable at the leaf (partial placements under-count), so the eager
 * pass skips it. No subject.
 */
export interface ZoneCountParityClue extends ClueBase {
  type: 'zoneCountParity';
  zones: { roomId: RoomId; parity: 'even' | 'odd' }[];
}

/**
 * "Person X was north/south/west/east of person Y" (row 0 = north, col 0 = west).
 * `offset`, if given, requires an exact distance; otherwise just a strict inequality.
 * The other party is either a concrete person (`otherPersonId`) or a role resolved
 * to its unique ground-truth holder (`otherRole`) — e.g. "Zhanna was north of the judge".
 */
export interface RelativePositionClue extends ClueBase {
  type: 'relativePosition';
  subject: Subject;
  otherPersonId?: PersonId;
  otherRole?: string;
  axis: 'row' | 'col';
  direction: 'before' | 'after';
  offset?: number;
}

/** "Person X was in a corner of their room" (2+ adjacent walls of the same room meet at their cell). */
export interface CornerClue extends ClueBase {
  type: 'corner';
  subject: Subject;
  negated?: boolean;
}

/** "Person X was standing on floor feature F" (e.g. a rug) — decidable purely from the subject's own cell. */
export interface FloorFeatureClue extends ClueBase {
  type: 'floorFeature';
  subject: Subject;
  featureId: string;
  negated?: boolean;
}

/**
 * "Person X was standing on texture T" (e.g. grass, sand, metal) — the subject's own cell resolved
 * to its EFFECTIVE texture: the floor feature's texture overrides the room's on feature cells
 * (festival-01: "was on stage" = the metal stage feature spanning three scene zones — the clue does
 * not reveal WHICH zone). Unary like floorFeature; decidable purely from the subject's own cell.
 */
export interface FloorTextureClue extends ClueBase {
  type: 'floorTexture';
  subject: Subject;
  textureKey: string; // key into the floor-texture registry (rooms' floorTexture / features' textureKey)
  negated?: boolean;
}

/** "Person X was in the same room as person Y" — relational, non-directional alternative to relativePosition. */
export interface SameRoomAsClue extends ClueBase {
  type: 'sameRoomAs';
  subject: Subject;
  otherPersonId: PersonId;
  negated?: boolean;
}

/** "Person X was alone in their room" — the subject's zone has exactly one occupant (the subject).
 *  Relational (depends on everyone else's placement) but reads as a personal clue. */
export interface AloneInRoomClue extends ClueBase {
  type: 'aloneInRoom';
  subject: Subject;
}

/**
 * "Person X was north/south/west/east of the (unknown) person sitting on an item of type T"
 * (e.g. "west of the man in the car"). The occupant of each item instance is resolved from the
 * ground truth at evaluation time (the same hidden-party pattern as role subjects); meaningful
 * only when the item type has ≥2 instances so the player must first deduce who sits where.
 * Direction only — no exact offset (kept for a possible future extension). Not unary: depends
 * on another person's placement. Item-related: capped by the 30% ITEM_RELATED share.
 */
export interface RelativeToItemOccupantClue extends ClueBase {
  type: 'relativeToItemOccupant';
  subject: Subject;
  itemTypeId: ItemTypeId;
  axis: 'row' | 'col';
  direction: 'before' | 'after';
}

/** "Person X was in the same room as an item of type T" — room-wide, not adjacency-limited. */
export interface SameRoomAsItemClue extends ClueBase {
  type: 'sameRoomAsItem';
  subject: Subject;
  itemTypeId: ItemTypeId;
  negated?: boolean;
}

/** "Subject (did not) sit on / occupy an item of type T" — the subject's OWN cell carries an item
 *  of that type (an occupiable item like a horse, chair or stool). Completes the item-relation trio:
 *  occupiesItem = own cell, adjacency = orthogonal neighbor cell, sameRoomAsItem = anywhere in the room. */
export interface OccupiesItemClue extends ClueBase {
  type: 'occupiesItem';
  subject: Subject;
  itemTypeId: ItemTypeId;
  negated?: boolean;
}

/** "Person X stood along the north/south/west/east wall of their own room" (broader than corner). */
export interface WallSideClue extends ClueBase {
  type: 'wallSide';
  subject: Subject;
  wallDirection: 'north' | 'south' | 'east' | 'west';
  negated?: boolean;
}

/** "Person X was in the largest/smallest room (by cell count) on the level." Requires no tie for the given comparison. */
export interface RoomSizeClue extends ClueBase {
  type: 'roomSize';
  subject: Subject;
  comparison: 'largest' | 'smallest';
}

/** "Person X was in a row/column whose 1-indexed number (row 1 = first) is even/odd." */
export interface ParityClue extends ClueBase {
  type: 'parity';
  subject: Subject;
  axis: 'row' | 'col';
  parity: 'even' | 'odd';
}

/** "Person X stood on a light/dark square of the board's alternating checkerboard pattern." */
export interface CheckerboardParityClue extends ClueBase {
  type: 'checkerboardParity';
  subject: Subject;
  tileColor: 'light' | 'dark';
}

/** "Person X's row/column index was strictly between person Y's and person Z's." */
export interface BetweennessClue extends ClueBase {
  type: 'betweenness';
  subject: Subject;
  otherPersonId1: PersonId;
  otherPersonId2: PersonId;
  axis: 'row' | 'col';
}

/**
 * Level-wide: "No room was left empty — every room had at least one occupant." No subject, no params.
 */
export interface RoomOccupancyClue extends ClueBase {
  type: 'roomOccupancy';
}

/**
 * Level-wide: "Every LISTED room had at least one occupant" (mine-01: "ни одна
 * шахта не осталась пустой" — covers only the mine galleries, not the shafts
 * or the rock). Partial check: occupancy is monotone, so false means some
 * listed room has all its cells already ruled out for everyone. No subject.
 */
export interface ZoneOccupancyClue extends ClueBase {
  type: 'zoneOccupancy';
  roomIds: RoomId[];
}

/**
 * Level-wide: "Room R had exactly N people" (fightclub-01: "на ринге ровно
 * двое" — the victim and the referee). Leaf-only: partial placements
 * under-count, so the eager pass skips it. No subject.
 */
export interface ZoneExactCountClue extends ClueBase {
  type: 'zoneExactCount';
  roomId: RoomId;
  count: number;
}

/**
 * Level-wide: "Room R had only men / only women" (bania-01: раздевалки).
 * Leaf-only: partial placements don't prove a violation (недостающие люди
 * могут оказаться другого пола), so the eager pass skips it. No subject.
 */
export interface ZoneGenderExclusiveClue extends ClueBase {
  type: 'zoneGenderExclusive';
  roomId: RoomId;
  gender: 'male' | 'female';
}

/**
 * "Person X stood on the boundary of rooms A and B" (cemetery-01): X's cell is in
 * A or B and orthogonally touches a cell of the OTHER room of the pair. A zonal
 * wallSide — rare boundary cells make a strong discriminator. Eager: checkable
 * as soon as the subject is placed.
 */
export interface ZoneBoundaryClue extends ClueBase {
  type: 'zoneBoundary';
  subject: Subject;
  roomId: RoomId;
  otherRoomId: RoomId;
}

/**
 * "Person X was in a room adjacent to Y" (strictly NOT in Y) — subject may be a
 * person or a role. Design invariant: Y has ≥2 neighbouring rooms, otherwise the
 * clue degrades into a roomMembership over the single neighbour. Eager.
 */
export interface ZoneNeighborOfClue extends ClueBase {
  type: 'zoneNeighborOf';
  subject: Subject;
  roomId: RoomId;
}

/**
 * "Person X and person Y were in adjacent (touching) rooms" — a pair clue over
 * room adjacency: both placed, different rooms, and the rooms share a wall.
 * Eager like relativePosition (undefined until both sides are placed).
 */
export interface AdjacentZonesPairClue extends ClueBase {
  type: 'adjacentZonesPair';
  subject: Subject;
  otherPersonId?: PersonId;
  otherRole?: string;
}

/** Level-wide: "Every instance of item type T had at least one person standing next to it"
 *  (orthogonally adjacent cell, same room — same geometry as the adjacency clue). No subject. */
export interface ItemAdjacencyOccupancyClue extends ClueBase {
  type: 'itemAdjacencyOccupancy';
  itemTypeId: ItemTypeId;
}

/** Level-wide: "Every room had an even/odd headcount." No subject. */
export interface RoomParityClue extends ClueBase {
  type: 'roomParity';
  parity: 'even' | 'odd';
}

/** Level-wide: "Room R had the most/least people among all rooms." Requires no tie in the solution. No subject. */
export interface RoomPopulationClue extends ClueBase {
  type: 'roomPopulation';
  roomId: RoomId;
  comparison: 'most' | 'least';
}

export type LetterClass = 'vowel' | 'consonant';

/** Level-wide: "Everyone whose name starts with a vowel/consonant letter was in the same room." No subject. */
export interface LetterGroupRoomClue extends ClueBase {
  type: 'letterGroupRoom';
  letterClass: LetterClass;
}

/**
 * "Person X (did not) hold role R" — explicit, ground-truth-confirming statement about `Person.roles`.
 * Unary: decidable purely from the subject's own `roles` array, never narrows their cell domain.
 * Role-typed subjects are resolved to the unique ground-truth role holder (see Subject).
 */
export interface RoleClue extends ClueBase {
  type: 'role';
  subject: Subject;
  roleId: string;
  negated?: boolean;
}

/** "Person X (did not) share a room with the holder of role R" — relational, like sameRoomAs but
 *  the other party is the (hidden) anonymous role holder, resolved from ground truth. */
export interface SameRoomAsRoleClue extends ClueBase {
  type: 'sameRoomAsRole';
  subject: Subject;
  roleId: string;
  negated?: boolean;
}

/**
 * Level-wide: "Exactly one person holds role R". Optional withinRoleId restricts the holder to
 * role S, and tileColor can constrain that unique holder to a checkerboard tile color.
 * No subject — the role count confirms ground truth; tileColor additionally depends on placement.
 */
export interface RoleSingletonClue extends ClueBase {
  type: 'roleSingleton';
  roleId: string;
  withinRoleId?: string;
  tileColor?: 'light' | 'dark';
}

/**
 * Level-wide: "In each listed room, if anyone holding guardedRoleId is present, someone holding
 * guardianRoleId must also be present there." No subject — same shape as roomOccupancy/roomParity.
 */
export interface RoleGuardClue extends ClueBase {
  type: 'roleGuard';
  roomIds: RoomId[];
  guardedRoleId: string;
  guardianRoleId: string;
}

/**
 * Level-wide: "Everyone whose name starts with a vowel/consonant letter holds role R" (e.g.
 * "everyone whose name starts with a vowel was a guard"). Ground truth about Person.roles +
 * initialLetter — placement-independent; the complementary letter class holds only non-holders.
 */
export interface LetterRoleClue extends ClueBase {
  type: 'letterRole';
  letterClass: 'vowel' | 'consonant';
  roleId: string;
}

/**
 * Level-wide: "Everyone whose name starts with a letter in the [fromLetter..toLetter] alphabetical
 * range holds role R" (e.g. "everyone from Demyan through Khariton was a park worker"). Ground
 * truth about Person.roles + initialLetter — placement-independent, like letterRole; the alphabet
 * is the Russian letter order without Ё/Й (§5 naming convention). Everyone outside the range
 * holds only non-holder status — the complement is implied.
 */
export interface LetterRangeRoleClue extends ClueBase {
  type: 'letterRangeRole';
  fromLetter: string;
  toLetter: string;
  roleId: string;
}

/**
 * Level-wide: "In each listed room, at most maxCount people holding roleId may be present"
 * (maxCount 0 = "role holders were not in these rooms"). Placement-dependent zone rule.
 */
export interface RoleZoneLimitClue extends ClueBase {
  type: 'roleZoneLimit';
  roleId: string;
  roomIds: RoomId[];
  maxCount: number;
}

/**
 * Level-wide: "In each listed room, at least minCount people holding roleId must be present"
 * (e.g. "no ride was left without an attendant"). Mirror of roleZoneLimit (which caps from
 * above); placement-dependent zone rule.
 */
export interface RoleZoneMinClue extends ClueBase {
  type: 'roleZoneMin';
  roleId: string;
  roomIds: RoomId[];
  minCount: number;
}

export type Clue =
  | PositionClue
  | RoomMembershipClue
  | AdjacencyClue
  | SharedRoomGenderClue
  | ItemTypeGenderClue
  | BareCellBanClue
  | ItemTypeFullyOccupiedClue
  | EdgeColumnEmptyClue
  | ZoneEmptyDisjunctionClue
  | ZoneGenderSeparationClue
  | ItemRowEmptyDisjunctionClue
  | ZoneCountParityClue
  | RelativePositionClue
  | CornerClue
  | FloorFeatureClue
  | FloorTextureClue
  | SameRoomAsClue
  | AloneInRoomClue
  | RelativeToItemOccupantClue
  | SameRoomAsItemClue
  | OccupiesItemClue
  | WallSideClue
  | RoomSizeClue
  | ParityClue
  | CheckerboardParityClue
  | BetweennessClue
  | RoomOccupancyClue
  | ZoneOccupancyClue
  | ZoneExactCountClue
  | ZoneGenderExclusiveClue
  | ZoneBoundaryClue
  | ZoneNeighborOfClue
  | AdjacentZonesPairClue
  | ItemAdjacencyOccupancyClue
  | RoomParityClue
  | RoomPopulationClue
  | LetterGroupRoomClue
  | RoleClue
  | SameRoomAsRoleClue
  | RoleSingletonClue
  | RoleGuardClue
  | LetterRoleClue
  | RoleZoneLimitClue
  | LetterRangeRoleClue
  | RoleZoneMinClue;
