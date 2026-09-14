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
 * "Person X was north/south/west/east of person Y" (row 0 = north, col 0 = west).
 * `offset`, if given, requires an exact distance; otherwise just a strict inequality.
 */
export interface RelativePositionClue extends ClueBase {
  type: 'relativePosition';
  subject: Subject;
  otherPersonId: PersonId;
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

/** "Person X was in the same room as person Y" — relational, non-directional alternative to relativePosition. */
export interface SameRoomAsClue extends ClueBase {
  type: 'sameRoomAs';
  subject: Subject;
  otherPersonId: PersonId;
  negated?: boolean;
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

/** "Person X's row/column index was strictly between person Y's and person Z's." */
export interface BetweennessClue extends ClueBase {
  type: 'betweenness';
  subject: Subject;
  otherPersonId1: PersonId;
  otherPersonId2: PersonId;
  axis: 'row' | 'col';
}

/** Level-wide: "No room was left empty — every room had at least one occupant." No subject, no params. */
export interface RoomOccupancyClue extends ClueBase {
  type: 'roomOccupancy';
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
 * Level-wide: "Exactly one person holds role R" (e.g. "there was exactly one sheriff"). No subject —
 * ground-truth-confirming statement about Person.roles; never depends on the placement.
 */
export interface RoleSingletonClue extends ClueBase {
  type: 'roleSingleton';
  roleId: string;
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
  | RelativePositionClue
  | CornerClue
  | FloorFeatureClue
  | SameRoomAsClue
  | RelativeToItemOccupantClue
  | SameRoomAsItemClue
  | OccupiesItemClue
  | WallSideClue
  | RoomSizeClue
  | ParityClue
  | BetweennessClue
  | RoomOccupancyClue
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
