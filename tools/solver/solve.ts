import type { Cell, CellId, Gender, Level, PersonId, RoomId } from '../../src/types/level';
import { cellId } from '../../src/types/level';
import type { Clue, Subject } from '../../src/types/clue';
import { buildLevelIndex, cellBoundary, isCorner, isLegalTarget, type LevelIndex } from '../../src/engine/board';

type Person = Level['people'][number];

const NODE_BUDGET = 2_000_000;

export type SolverResult =
  | { status: 'PROVEN_UNIQUE' }
  | { status: 'NO_SOLUTION'; violated: { clueId: string; text: string }[] }
  | { status: 'WRONG_SOLUTION'; found: Record<PersonId, CellId> }
  | { status: 'MULTIPLE'; alternate: Record<PersonId, CellId>; matchesAuthored: boolean }
  | { status: 'INCONCLUSIVE'; reason: string };

type GetCell = (personId: PersonId) => CellId | undefined;

const UNARY_TYPES = new Set([
  'position',
  'roomMembership',
  'adjacency',
  'sameRowOrColumnAsItem',
  'corner',
  'floorFeature',
  'floorTexture',
  'wallSide',
  'roomSize',
  'parity',
  'checkerboardParity',
  'sameRoomAsItem',
  'occupiesItem',
  'role',
]);

const VOWELS = new Set(['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я']);

/** The texture actually shown on a cell: the floor feature's texture fully overrides the room's
 *  (same rule as rendering — see FloorFeature.textureKey). Used by the `floorTexture` clue. */
function effectiveTexture(level: Level, cell: Cell): string {
  if (cell.floorFeatureId) {
    const feature = level.floorFeatures.find((f) => f.id === cell.floorFeatureId);
    if (feature) return feature.textureKey;
  }
  return level.rooms.find((r) => r.id === cell.roomId)?.floorTexture ?? '';
}

/** Room cell-count ranking, used by the `roomSize` clue — static per level, independent of the people's assignment. */
function roomCellCounts(level: Level): Map<RoomId, number> {
  const counts = new Map<RoomId, number>();
  for (const room of level.rooms) counts.set(room.id, 0);
  for (const cell of level.cells) counts.set(cell.roomId, (counts.get(cell.roomId) ?? 0) + 1);
  return counts;
}

/** The unique room id achieving the max/min cell count, or null if tied (in which case no room qualifies). */
function extremeRoomId(counts: Map<RoomId, number>, comparison: 'largest' | 'smallest'): RoomId | null {
  const values = [...counts.values()];
  const target = comparison === 'largest' ? Math.max(...values) : Math.min(...values);
  const winners = [...counts.entries()].filter(([, v]) => v === target).map(([id]) => id);
  return winners.length === 1 ? winners[0] : null;
}

/** All person ids holding the given role. 'victim'/'murderer' are reserved names resolved via the
 * ground-truth flags; any other string is looked up in Person.roles. */
function roleHolderIds(roleName: string, level: Level): PersonId[] {
  if (roleName === 'victim') return level.people.filter((p) => p.isVictim).map((p) => p.id);
  if (roleName === 'murderer') return level.people.filter((p) => p.isMurderer).map((p) => p.id);
  return level.people.filter((p) => (p.roles ?? []).includes(roleName)).map((p) => p.id);
}

function uniqueRoleHolder(roleName: string, level: Level): PersonId {
  const holders = roleHolderIds(roleName, level);
  if (holders.length !== 1) {
    throw new Error(`Роль "${roleName}" должна иметь ровно одного носителя, найдено: ${holders.length}.`);
  }
  return holders[0];
}

/** Resolves a clue subject to a concrete PersonId. Person subjects are a fast path; role subjects
 * ('victim'/'murderer'/'sheriff') resolve to the unique ground-truth holder — throws loudly if the
 * role has zero or several holders, keeping puzzles that reference it well-defined (see lintLevel). */
function subjectPersonId(subject: Subject, level: Level): PersonId {
  if (subject.type === 'person') return subject.id;
  return uniqueRoleHolder(subject.role, level);
}

/** Ортогональные соседи клетки (row/col) как ячейки индекса (undefined — за доской/вырез). */
function cellNeighborsOf(index: LevelIndex, row: number, col: number) {
  const dirs: [number, number][] = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  return dirs.map(([r, c]) => index.cellsById.get(cellId(r, c)));
}

/** Зоны граничат: существует клетка a∈A с ортогональным соседом b∈B. */
function zonesTouch(level: Level, index: LevelIndex, roomA: RoomId, roomB: RoomId): boolean {
  return level.cells.some(
    (cell) =>
      cell.roomId === roomA &&
      cellNeighborsOf(index, cell.row, cell.col).some((n) => n?.roomId === roomB),
  );
}

export function evalClue(clue: Clue, getCell: GetCell, level: Level, index: LevelIndex, allAssigned: boolean): boolean | undefined {
  switch (clue.type) {
    case 'position': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const actual = clue.axis === 'row' ? cell.row : cell.col;
      return actual === clue.value;
    }
    case 'roomMembership': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const result = cell.roomId === clue.roomId;
      return clue.negated ? !result : result;
    }
    case 'adjacency': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const neighbors: [number, number][] = [
        [cell.row - 1, cell.col],
        [cell.row + 1, cell.col],
        [cell.row, cell.col - 1],
        [cell.row, cell.col + 1],
      ];
      // «Рядом» ≠ «на»: если человек занимает предмет, соседняя клетка ЭТОГО ЖЕ
      // предмета не делает его «рядом» с предметом (актуально для 2-клеточных
      // occupiable: мотоцикл/машина/booth). Другой экземпляр того же typeId рядом —
      // честное «рядом». Канон: Денис на кровати в 01-apartment — «не рядом с кроватью».
      const ownItem = cell.itemId ? level.items.find((i) => i.id === cell.itemId) : undefined;
      const hasAdjItem = neighbors.some(([r, c]) => {
        const n = index.cellsById.get(cellId(r, c));
        if (!n || n.roomId !== cell.roomId || !n.itemId) return false;
        if (ownItem && n.itemId === ownItem.id) return false;
        const item = level.items.find((i) => i.id === n.itemId);
        return item?.typeId === clue.itemTypeId;
      });
      return clue.negated ? !hasAdjItem : hasAdjItem;
    }
    case 'sameRowOrColumnAsItem': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const subjectCell = index.cellsById.get(subjectCellId)!;
      return level.items.some((item) => {
        if (item.typeId !== clue.itemTypeId) return false;
        return item.cells.some((itemCellId) => {
          const itemCell = index.cellsById.get(itemCellId)!;
          return itemCell.row === subjectCell.row || itemCell.col === subjectCell.col;
        });
      });
    }
    case 'corner': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const result = isCorner(index, subjectCellId);
      return clue.negated ? !result : result;
    }
    case 'floorFeature': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const result = cell.floorFeatureId === clue.featureId;
      return clue.negated ? !result : result;
    }
    case 'floorTexture': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const result = effectiveTexture(level, cell) === clue.textureKey;
      return clue.negated ? !result : result;
    }
    case 'sharedRoomGender': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const subjectId = subjectPersonId(clue.subject, level);
      const others = level.people.filter((p) => p.id !== subjectId);
      const hasMatch = others.some((p) => {
        const pc = getCell(p.id);
        if (!pc) return false;
        const pcCell = index.cellsById.get(pc)!;
        return pcCell.roomId === cell.roomId && p.gender === clue.otherGender;
      });
      if (hasMatch) return clue.negated ? false : true;
      if (!allAssigned) return undefined;
      return clue.negated ? true : false;
    }
    case 'bareCellBan': {
      // «Никого не было в воде»: в зоне roomId запрещены «голые» клетки — только
      // предмет (шлюпка, круг) или фича пола (отмель, риф) считаются «не в воде».
      // Частичная оценка: любое уже размещённое нарушение — немедленный false.
      for (const p of level.people) {
        const pc = getCell(p.id);
        if (!pc) continue;
        const cell = index.cellsById.get(pc)!;
        if (cell.roomId !== clue.roomId) continue;
        if (!cell.itemId && !cell.floorFeatureId) return false;
      }
      return true;
    }
    case 'itemTypeFullyOccupied': {
      // «Ни одна машина не осталась без водителя» / «ровно одна осталась пустой»:
      // незанятых экземпляров типа ровно `vacancies` (по умолчанию 0). Частичная
      // оценка с прунингом: лишние незанятые сверх вакансий должны быть закрыты
      // ещё не размещёнными людьми (каждый закрывает максимум один) — иначе false.
      const vacancies = clue.vacancies ?? 0;
      const itemsOfType = level.items.filter((i) => i.typeId === clue.itemTypeId);
      let unoccupied = 0;
      for (const item of itemsOfType) {
        const hasOccupant = level.people.some((p) => {
          const pc = getCell(p.id);
          return pc != null && item.cells.includes(pc);
        });
        if (!hasOccupant) unoccupied++;
      }
      if (allAssigned) return unoccupied === vacancies;
      const unplaced = level.people.filter((p) => !getCell(p.id)).length;
      return unoccupied - vacancies <= unplaced;
    }
    case 'edgeColumnEmpty': {
      // «Первый или последний столбец был пустым»: дизъюнкция. Частичная оценка:
      // false только если кто-то уже стоит И в первом, И в последнем столбце.
      const lastCol = Math.max(...level.cells.map((c) => c.col));
      let firstUsed = false;
      let lastUsed = false;
      for (const p of level.people) {
        const pc = getCell(p.id);
        if (!pc) continue;
        const col = index.cellsById.get(pc)!.col;
        if (col === 0) firstUsed = true;
        if (col === lastCol) lastUsed = true;
      }
      return !(firstUsed && lastUsed);
    }
    case 'zoneEmptyDisjunction': {
      // «На крыше или на въезде никого не было»: дизъюнкция по зонам — хотя бы одна
      // из перечисленных пуста. Занятость монотонно растёт, поэтому частичная оценка
      // совпадает с листовой: false только когда занята КАЖДАЯ зона из списка.
      const roomSet = new Set(clue.roomIds);
      const occupiedRooms = new Set<string>();
      for (const p of level.people) {
        const pc = getCell(p.id);
        if (!pc) continue;
        const roomId = index.cellsById.get(pc)!.roomId;
        if (roomSet.has(roomId)) occupiedRooms.add(roomId);
      }
      return occupiedRooms.size < roomSet.size;
    }
    case 'itemRowEmptyDisjunction': {
      // «В ряду с кеглями или в ряду с барной стойкой никого не было»: ряды
      // выводятся из расстановки предметов (все ряды, где есть клетки экземпляров
      // типа). Дизъюнкция: хотя бы одно из множеств рядов пусто. Оккупанты
      // монотонно добавляются, поэтому частичная оценка совпадает с листовой:
      // false только когда каждое множество рядов уже занято.
      const rowSets = clue.itemTypeIds.map((itemTypeId) => {
        const rows = new Set<number>();
        for (const item of level.items) {
          if (item.typeId !== itemTypeId) continue;
          for (const cid of item.cells) rows.add(index.cellsById.get(cid)!.row);
        }
        return rows;
      });
      const isOccupied = (rows: Set<number>) =>
        level.people.some((p) => {
          const pc = getCell(p.id);
          return pc != null && rows.has(index.cellsById.get(pc)!.row);
        });
      return rowSets.some((rows) => !isOccupied(rows));
    }
    case 'zoneGenderSeparation': {
      // «Женщины и мужчины не находились в одной зоне»: каждая занятая зона
      // однополая. Нарушение монотонно (в зоне уже есть и м, и ж) — частичная
      // оценка совпадает с листовой.
      const roomGenders = new Map<RoomId, Set<Gender>>();
      for (const p of level.people) {
        const pc = getCell(p.id);
        if (!pc) continue;
        const roomId = index.cellsById.get(pc)!.roomId;
        let genders = roomGenders.get(roomId);
        if (!genders) {
          genders = new Set();
          roomGenders.set(roomId, genders);
        }
        genders.add(p.gender);
      }
      for (const genders of roomGenders.values()) {
        if (genders.size > 1) return false;
      }
      return true;
    }
    case 'zoneCountParity': {
      // «На чётных этажах чётное число людей, на нечётных — нечётное»: паритет
      // населения зон. Проверяется только на листе (частичные расстановки недосчитывают).
      if (!allAssigned) return undefined;
      for (const { roomId, parity } of clue.zones) {
        const count = level.people.filter((p) => {
          const pc = getCell(p.id);
          return pc != null && index.cellsById.get(pc)!.roomId === roomId;
        }).length;
        if (count % 2 !== (parity === 'even' ? 0 : 1)) return false;
      }
      return true;
    }
    case 'itemTypeGender': {
      if (!allAssigned) return undefined;
      const items = level.items.filter((i) => i.typeId === clue.itemTypeId);
      for (const item of items) {
        const occupant = level.people.find((p) => {
          const pc = getCell(p.id);
          return pc != null && item.cells.includes(pc);
        });
        if (!occupant && clue.requireOccupied) return false;
        if (occupant && occupant.gender !== clue.gender) return false;
      }
      return true;
    }
    case 'relativePosition': {
      const a = getCell(subjectPersonId(clue.subject, level));
      const otherId =
        clue.otherRole != null ? uniqueRoleHolder(clue.otherRole, level) : clue.otherPersonId!;
      const b = getCell(otherId);
      if (!a || !b) return undefined;
      const ca = index.cellsById.get(a)!;
      const cb = index.cellsById.get(b)!;
      const va = clue.axis === 'row' ? ca.row : ca.col;
      const vb = clue.axis === 'row' ? cb.row : cb.col;
      if (clue.offset != null) {
        return clue.direction === 'before' ? vb - va === clue.offset : va - vb === clue.offset;
      }
      return clue.direction === 'before' ? va < vb : va > vb;
    }
    case 'roomNumberComparison': {
      const a = getCell(subjectPersonId(clue.subject, level));
      const b = getCell(clue.otherPersonId);
      if (!a || !b) return undefined;
      const roomANumber = level.rooms.find((room) => room.id === index.cellsById.get(a)!.roomId)?.number;
      const roomBNumber = level.rooms.find((room) => room.id === index.cellsById.get(b)!.roomId)?.number;
      if (roomANumber == null || roomBNumber == null) return false;
      return clue.comparison === 'higher' ? roomANumber > roomBNumber : roomANumber < roomBNumber;
    }
    case 'sameRoomAs': {
      const a = getCell(subjectPersonId(clue.subject, level));
      const b = getCell(clue.otherPersonId);
      if (!a || !b) return undefined;
      const result = index.cellsById.get(a)!.roomId === index.cellsById.get(b)!.roomId;
      return clue.negated ? !result : result;
    }
    case 'aloneInRoom': {
      const subjectId = subjectPersonId(clue.subject, level);
      const subjectCellId = getCell(subjectId);
      if (!subjectCellId) return undefined;
      const roomId = index.cellsById.get(subjectCellId)!.roomId;
      const hasRoommate = level.people.some((p) => {
        if (p.id === subjectId) return false;
        const pc = getCell(p.id);
        return pc != null && index.cellsById.get(pc)!.roomId === roomId;
      });
      if (hasRoommate) return false;
      return allAssigned ? true : undefined;
    }
    case 'relativeToItemOccupant': {
      // «Западнее человека, сидевшего в машине»: сиделец неизвестен игроку, но резолвится
      // из расстановки (паттерн роль-субъекта). Семантика направления — как relativePosition:
      // axis row + before = севернее (меньше ряд), axis col + before = западнее (меньше столбец).
      const a = getCell(subjectPersonId(clue.subject, level));
      if (!a) return undefined;
      const occupantIds = level.people
        .filter((p) => {
          const pc = getCell(p.id);
          if (!pc) return false;
          const item = level.items.find((i) => i.cells.includes(pc));
          return item?.typeId === clue.itemTypeId;
        })
        .map((p) => p.id);
      // Ни один экземпляр предмета не занят — на неполной расстановке ждём; на полной это ложь.
      if (occupantIds.length === 0) return allAssigned ? false : undefined;
      const ca = index.cellsById.get(a)!;
      const va = clue.axis === 'row' ? ca.row : ca.col;
      for (const occupantId of occupantIds) {
        const oc = getCell(occupantId)!;
        const occCell = index.cellsById.get(oc)!;
        const vb = clue.axis === 'row' ? occCell.row : occCell.col;
        if (clue.direction === 'before' ? va < vb : va > vb) return true;
      }
      return allAssigned ? false : undefined;
    }
    case 'sameRoomAsItem': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const hasItemInRoom = level.items.some(
        (item) =>
          item.typeId === clue.itemTypeId &&
          item.cells.some((cid) => index.cellsById.get(cid)?.roomId === cell.roomId),
      );
      return clue.negated ? !hasItemInRoom : hasItemInRoom;
    }
    case 'occupiesItem': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const item = cell.itemId ? level.items.find((i) => i.id === cell.itemId) : undefined;
      const result = item?.typeId === clue.itemTypeId;
      return clue.negated ? !result : result;
    }
    case 'sameRoomAsRole': {
      const a = getCell(subjectPersonId(clue.subject, level));
      const b = getCell(uniqueRoleHolder(clue.roleId, level));
      if (!a || !b) return undefined;
      const result = index.cellsById.get(a)!.roomId === index.cellsById.get(b)!.roomId;
      return clue.negated ? !result : result;
    }
    case 'roleSingleton': {
      const holders = roleHolderIds(clue.roleId, level);
      if (holders.length !== 1 ||
        (clue.withinRoleId != null && !roleHolderIds(clue.withinRoleId, level).includes(holders[0]))) {
        return false;
      }
      if (clue.tileColor == null) return true;
      const holderCellId = getCell(holders[0]);
      if (!holderCellId) return undefined;
      const holderCell = index.cellsById.get(holderCellId);
      if (!holderCell) return undefined;
      const light = (holderCell.row + holderCell.col) % 2 === 0;
      return clue.tileColor === (light ? 'light' : 'dark');
    }
    case 'wallSide': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const b = cellBoundary(index, subjectCellId);
      const onWall =
        clue.wallDirection === 'north' ? b.top :
        clue.wallDirection === 'south' ? b.bottom :
        clue.wallDirection === 'west' ? b.left :
        b.right;
      return clue.negated ? !onWall : onWall;
    }
    case 'roomSize': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const winner = extremeRoomId(roomCellCounts(level), clue.comparison);
      if (winner == null) return false;
      return cell.roomId === winner;
    }
    case 'parity': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const value = (clue.axis === 'row' ? cell.row : cell.col) + 1; // 1-indexed row/column number — matches player-facing numbering
      return clue.parity === 'even' ? value % 2 === 0 : value % 2 === 1;
    }
    case 'checkerboardParity': {
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      const light = (cell.row + cell.col) % 2 === 0;
      return clue.tileColor === (light ? 'light' : 'dark');
    }
    case 'betweenness': {
      const a = getCell(subjectPersonId(clue.subject, level));
      const b1 = getCell(clue.otherPersonId1);
      const b2 = getCell(clue.otherPersonId2);
      if (!a || !b1 || !b2) return undefined;
      const va = clue.axis === 'row' ? index.cellsById.get(a)!.row : index.cellsById.get(a)!.col;
      const v1 = clue.axis === 'row' ? index.cellsById.get(b1)!.row : index.cellsById.get(b1)!.col;
      const v2 = clue.axis === 'row' ? index.cellsById.get(b2)!.row : index.cellsById.get(b2)!.col;
      const lo = Math.min(v1, v2);
      const hi = Math.max(v1, v2);
      return va > lo && va < hi;
    }
    case 'roomOccupancy': {
      if (!allAssigned) return undefined;
      const occupiedRooms = new Set(level.people.map((p) => index.cellsById.get(getCell(p.id)!)!.roomId));
      return level.rooms.every((r) => occupiedRooms.has(r.id));
    }
    case 'zoneOccupancy': {
      // «Ни одна шахта не осталась пустой»: каждая зона СПИСКА занята хотя бы
      // одним человеком. Листовая проверка (как roomOccupancy): без пропагации
      // доменов «зона пока пуста» ≠ «зона не сможет быть занятой», поэтому
      // частичный прогон возвращает unknown (false отсекал бы живые ветки).
      if (!allAssigned) return undefined;
      const listed = new Set(clue.roomIds);
      const occupiedRooms = new Set<string>();
      for (const p of level.people) {
        const roomId = index.cellsById.get(getCell(p.id)!)!.roomId;
        if (listed.has(roomId)) occupiedRooms.add(roomId);
      }
      return occupiedRooms.size >= listed.size;
    }
    case 'zoneExactCount': {
      // «На ринге ровно двое»: точный headcount зоны. Листовая проверка —
      // частичная расстановка недосчитывает людей (false душил бы живые ветки).
      if (!allAssigned) return undefined;
      const n = level.people.filter(
        (p) => index.cellsById.get(getCell(p.id)!)!.roomId === clue.roomId,
      ).length;
      return n === clue.count;
    }
    case 'zoneGenderExclusive': {
      // «В зоне были только мужчины/только женщины»: листовая проверка —
      // у непосаженных людей пол неизвестен расстановке (false душил бы ветки).
      if (!allAssigned) return undefined;
      const occupants = level.people.filter(
        (p) => index.cellsById.get(getCell(p.id)!)!.roomId === clue.roomId,
      );
      return occupants.every((p) => p.gender === clue.gender);
    }
    case 'zoneBoundary': {
      // «Стоял на границе зон A и B»: клетка субъекта в одной из пары, И через
      // стену (ортогональный сосед) — вторая зона пары. Зоновый wallSide.
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      if (cell.roomId !== clue.roomId && cell.roomId !== clue.otherRoomId) return false;
      const wanted = cell.roomId === clue.roomId ? clue.otherRoomId : clue.roomId;
      return cellNeighborsOf(index, cell.row, cell.col).some((n) => n?.roomId === wanted);
    }
    case 'zoneNeighborOf': {
      // «Находился в соседней от Y зоне» (строго не в Y): eager — субъект
      // посажен, зона известна, соседство зон — свойство карты.
      const subjectCellId = getCell(subjectPersonId(clue.subject, level));
      if (!subjectCellId) return undefined;
      const cell = index.cellsById.get(subjectCellId)!;
      if (cell.roomId === clue.roomId) return false;
      return zonesTouch(level, index, cell.roomId, clue.roomId);
    }
    case 'adjacentZonesPair': {
      // «X и Y были в соседних зонах»: оба посажены, зоны различны и граничат.
      const a = getCell(subjectPersonId(clue.subject, level));
      const otherId =
        clue.otherRole != null ? uniqueRoleHolder(clue.otherRole, level) : clue.otherPersonId!;
      const b = getCell(otherId);
      if (!a || !b) return undefined;
      const roomA = index.cellsById.get(a)!.roomId;
      const roomB = index.cellsById.get(b)!.roomId;
      return roomA !== roomB && zonesTouch(level, index, roomA, roomB);
    }
    case 'itemAdjacencyOccupancy': {
      if (!allAssigned) return undefined;
      const itemsOfType = level.items.filter((i) => i.typeId === clue.itemTypeId);
      return itemsOfType.every((item) => {
        const adjacentPeople = level.people.filter((p) => {
          const pc = getCell(p.id);
          if (!pc) return false;
          const personCell = index.cellsById.get(pc)!;
          return item.cells.some((cid) => {
            const itemCell = index.cellsById.get(cid)!;
            return (
              personCell.roomId === itemCell.roomId &&
              Math.abs(personCell.row - itemCell.row) + Math.abs(personCell.col - itemCell.col) === 1
            );
          });
        });
        return adjacentPeople.length > 0;
      });
    }
    case 'roomParity': {
      if (!allAssigned) return undefined;
      const counts = new Map<RoomId, number>();
      for (const r of level.rooms) counts.set(r.id, 0);
      for (const p of level.people) {
        const roomId = index.cellsById.get(getCell(p.id)!)!.roomId;
        counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
      }
      return level.rooms.every((r) => {
        const n = counts.get(r.id) ?? 0;
        return clue.parity === 'even' ? n % 2 === 0 : n % 2 === 1;
      });
    }
    case 'roomPopulation': {
      if (!allAssigned) return undefined;
      const counts = new Map<RoomId, number>();
      for (const r of level.rooms) counts.set(r.id, 0);
      for (const p of level.people) {
        const roomId = index.cellsById.get(getCell(p.id)!)!.roomId;
        counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
      }
      const target = counts.get(clue.roomId) ?? 0;
      const others = level.rooms.filter((r) => r.id !== clue.roomId).map((r) => counts.get(r.id) ?? 0);
      return clue.comparison === 'most' ? others.every((n) => target > n) : others.every((n) => target < n);
    }
    case 'letterGroupRoom': {
      if (!allAssigned) return undefined;
      const isVowel = (letter: string) => VOWELS.has(letter);
      const group = level.people.filter((p) => isVowel(p.initialLetter) === (clue.letterClass === 'vowel'));
      const rooms = new Set(group.map((p) => index.cellsById.get(getCell(p.id)!)!.roomId));
      return rooms.size <= 1;
    }
    case 'role': {
      const person = level.people.find((p) => p.id === subjectPersonId(clue.subject, level));
      const result = !!person?.roles?.includes(clue.roleId);
      return clue.negated ? !result : result;
    }
    case 'roleGuard': {
      if (!allAssigned) return undefined;
      const byRoom = new Map<RoomId, { guarded: boolean; guardian: boolean }>();
      for (const p of level.people) {
        const pc = getCell(p.id);
        if (!pc) continue;
        const roomId = index.cellsById.get(pc)!.roomId;
        const entry = byRoom.get(roomId) ?? { guarded: false, guardian: false };
        if (p.roles?.includes(clue.guardedRoleId)) entry.guarded = true;
        if (p.roles?.includes(clue.guardianRoleId)) entry.guardian = true;
        byRoom.set(roomId, entry);
      }
      return clue.roomIds.every((roomId) => {
        const entry = byRoom.get(roomId);
        return !entry?.guarded || entry.guardian;
      });
    }
    case 'letterRole': {
      // Ground truth about roles + initial letters — placement-independent, so it can be
      // evaluated as soon as every person's role data exists (always). The complement letter
      // class must contain no role holders.
      const isVowel = (letter: string) => VOWELS.has(letter);
      const holders = new Set(roleHolderIds(clue.roleId, level));
      return level.people.every((p) => {
        const matchesClass = isVowel(p.initialLetter) === (clue.letterClass === 'vowel');
        return holders.has(p.id) === matchesClass;
      });
    }
    case 'letterRangeRole': {
      // Ground truth about roles + initial letters — placement-independent (like letterRole).
      // Russian alphabet order without Ё/Й (§5): А Б В Г Д Е Ж З И К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я.
      const ALPHABET = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
      const from = ALPHABET.indexOf(clue.fromLetter);
      const to = ALPHABET.indexOf(clue.toLetter);
      const holders = new Set(roleHolderIds(clue.roleId, level));
      return level.people.every((p) => {
        const idx = ALPHABET.indexOf(p.initialLetter);
        const inRange = from <= idx && idx <= to;
        return holders.has(p.id) === inRange;
      });
    }
    case 'roleZoneLimit': {
      if (!allAssigned) return undefined;
      const holders = new Set(roleHolderIds(clue.roleId, level));
      const counts = new Map<RoomId, number>(clue.roomIds.map((roomId) => [roomId, 0]));
      for (const p of level.people) {
        if (!holders.has(p.id)) continue;
        const pc = getCell(p.id);
        if (!pc) continue;
        const roomId = index.cellsById.get(pc)!.roomId;
        if (counts.has(roomId)) counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
      }
      return [...counts.values()].every((count) => count <= clue.maxCount);
    }
    case 'roleZoneMin': {
      if (!allAssigned) return undefined;
      const holders = new Set(roleHolderIds(clue.roleId, level));
      const counts = new Map<RoomId, number>(clue.roomIds.map((roomId) => [roomId, 0]));
      for (const p of level.people) {
        if (!holders.has(p.id)) continue;
        const pc = getCell(p.id);
        if (!pc) continue;
        const roomId = index.cellsById.get(pc)!.roomId;
        if (counts.has(roomId)) counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
      }
      return [...counts.values()].every((count) => count >= clue.minCount);
    }
  }
}

function personalClues(level: Level, personId: PersonId): Clue[] {
  return level.clues.filter((c) => 'subject' in c && c.subject.type === 'person' && c.subject.id === personId);
}

/** Cells consistent with a person's own unary clues alone — no AllDifferent, no knowledge of other people. */
export function computeUnaryDomain(level: Level, index: LevelIndex, legalCells: Cell[], personId: PersonId): CellId[] {
  const unaryClues = personalClues(level, personId).filter((c) => UNARY_TYPES.has(c.type));
  const domain = legalCells.filter((cell: Cell) => {
    const getCell: GetCell = (pid) => (pid === personId ? cell.id : undefined);
    return unaryClues.every((clue) => evalClue(clue, getCell, level, index, false) !== false);
  });
  return domain.map((c) => c.id);
}

export function diagnoseAgainstAuthoredSolution(level: Level, index: LevelIndex): { clueId: string; text: string }[] {
  const getCell: GetCell = (pid) => level.solution[pid];
  const violated: { clueId: string; text: string }[] = [];
  for (const clue of level.clues) {
    if (evalClue(clue, getCell, level, index, true) === false) {
      violated.push({ clueId: clue.id, text: clue.text });
    }
  }

  const rows = new Map<number, PersonId>();
  const cols = new Map<number, PersonId>();
  for (const person of level.people) {
    const solutionCellId = level.solution[person.id];
    const cell = solutionCellId ? index.cellsById.get(solutionCellId) : undefined;
    if (!cell) {
      violated.push({ clueId: 'structural', text: `${person.name}: клетка решения ${solutionCellId ?? '(нет)'} не существует.` });
      continue;
    }
    if (!isLegalTarget(index, level, solutionCellId!)) {
      violated.push({ clueId: 'structural', text: `${person.name} стоит на декоративной клетке.` });
    }
    const rowOwner = rows.get(cell.row);
    if (rowOwner) {
      const other = level.people.find((p) => p.id === rowOwner);
      violated.push({ clueId: 'structural', text: `${person.name} и ${other?.name ?? rowOwner} делят ряд ${cell.row}.` });
    }
    rows.set(cell.row, person.id);
    const colOwner = cols.get(cell.col);
    if (colOwner) {
      const other = level.people.find((p) => p.id === colOwner);
      violated.push({ clueId: 'structural', text: `${person.name} и ${other?.name ?? colOwner} делят столбец ${cell.col}.` });
    }
    cols.set(cell.col, person.id);
  }

  const victim = level.people.find((p) => p.isVictim);
  if (victim) {
    const victimCellId = level.solution[victim.id];
    const victimCell = victimCellId ? index.cellsById.get(victimCellId) : undefined;
    if (victimCell) {
      const roomMates = level.people.filter((p) => index.cellsById.get(level.solution[p.id])?.roomId === victimCell.roomId);
      if (roomMates.length !== 2) {
        violated.push({
          clueId: 'structural',
          text: `В комнате жертвы (${victimCell.roomId}) оказалось ${roomMates.length} человек, а должно быть ровно 2.`,
        });
      }
    }
  }

  return violated;
}

export function solveLevel(level: Level): SolverResult {
  const index = buildLevelIndex(level);
  const people = level.people;
  const legalCells = level.cells.filter((c) => isLegalTarget(index, level, c.id));

  const domains = new Map<PersonId, CellId[]>();
  for (const person of people) {
    domains.set(person.id, computeUnaryDomain(level, index, legalCells, person.id));
  }

  // Все клю проверяются по ходу перебора (eagerlyConsistent), а не только на листьях:
  // evalClue с allAssigned=false возвращает undefined, пока клю неразрешима, и false —
  // только при уже доказанном нарушении (субъект размещён и условие нарушено; для
  // level-wide клю вроде bareCellBan — любое размещённое нарушение). Это отсекает
  // ветки задолго до полной расстановки и держит большие «фоновые» зоны в узде.
  function eagerlyConsistent(): boolean {
    for (const clue of level.clues) {
      if (evalClue(clue, getCell, level, index, false) === false) return false;
    }
    return true;
  }

  const assignment = new Map<PersonId, CellId>();
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const usedCells = new Set<CellId>();
  const solutions: Record<PersonId, CellId>[] = [];
  let nodeCount = 0;
  let budgetExceeded = false;

  const getCell: GetCell = (pid) => assignment.get(pid);

  function isValidLeaf(): boolean {
    for (const clue of level.clues) {
      if (evalClue(clue, getCell, level, index, true) === false) return false;
    }
    const victim = people.find((p) => p.isVictim)!;
    const victimRoomId = index.cellsById.get(assignment.get(victim.id)!)!.roomId;
    const occupantsInRoom = people.filter((p) => index.cellsById.get(assignment.get(p.id)!)!.roomId === victimRoomId);
    // «Жертва находилась наедине с убийцей» (фиксированная строка ростера): ровно двое
    // в зоне жертвы, и второй — именно убийца. Без проверки убийцы солвер пропускал
    // расстановки «жертва + случайный свидетель» (прецедент: racing-01, Ефим+Харитина).
    return occupantsInRoom.length === 2 && occupantsInRoom.some((p) => p.isMurderer);
  }

  function search(remaining: Person[]): void {
    if (budgetExceeded || solutions.length >= 2) return;
    nodeCount++;
    if (nodeCount > NODE_BUDGET) {
      budgetExceeded = true;
      return;
    }

    if (remaining.length === 0) {
      if (isValidLeaf()) {
        solutions.push(Object.fromEntries(assignment) as Record<PersonId, CellId>);
      }
      return;
    }

    let best: Person | null = null;
    let bestDomain: CellId[] = [];
    for (const person of remaining) {
      const domain = (domains.get(person.id) ?? []).filter(
        (candidateCellId) =>
          !usedCells.has(candidateCellId) &&
          !usedRows.has(index.cellsById.get(candidateCellId)!.row) &&
          !usedCols.has(index.cellsById.get(candidateCellId)!.col),
      );
      if (best === null || domain.length < bestDomain.length) {
        best = person;
        bestDomain = domain;
      }
      if (bestDomain.length === 0) break;
    }
    if (!best || bestDomain.length === 0) return;

    const rest = remaining.filter((p) => p.id !== best!.id);
    for (const candidateCellId of bestDomain) {
      if (budgetExceeded || solutions.length >= 2) return;
      const cell = index.cellsById.get(candidateCellId)!;
      assignment.set(best.id, candidateCellId);
      usedCells.add(candidateCellId);
      usedRows.add(cell.row);
      usedCols.add(cell.col);

      if (eagerlyConsistent()) {
        search(rest);
      }

      assignment.delete(best.id);
      usedCells.delete(candidateCellId);
      usedRows.delete(cell.row);
      usedCols.delete(cell.col);
    }
  }

  search(people);

  if (budgetExceeded) {
    return { status: 'INCONCLUSIVE', reason: `Превышен бюджет узлов поиска (${NODE_BUDGET}).` };
  }

  if (solutions.length === 0) {
    return { status: 'NO_SOLUTION', violated: diagnoseAgainstAuthoredSolution(level, index) };
  }

  const matchesAuthored = (sol: Record<PersonId, CellId>) => people.every((p) => sol[p.id] === level.solution[p.id]);
  const authoredMatch = solutions.find(matchesAuthored);

  if (solutions.length === 1) {
    return authoredMatch ? { status: 'PROVEN_UNIQUE' } : { status: 'WRONG_SOLUTION', found: solutions[0] };
  }

  const alternate = solutions.find((s) => s !== authoredMatch) ?? solutions[1];
  return { status: 'MULTIPLE', alternate, matchesAuthored: !!authoredMatch };
}

/**
 * Greedily finds clues that can be removed one at a time while the puzzle stays PROVEN_UNIQUE.
 * Removals accumulate — each check runs against the already-reduced clue set, so the result is a
 * minimal (not just individually-redundant) clue set relative to removal order.
 */
export function findRedundantClues(level: Level): string[] {
  const redundant: string[] = [];
  let working = level.clues;
  for (const clue of level.clues) {
    const trial: Level = { ...level, clues: working.filter((c) => c.id !== clue.id) };
    if (solveLevel(trial).status === 'PROVEN_UNIQUE') {
      redundant.push(clue.id);
      working = trial.clues;
    }
  }
  return redundant;
}
