import type { Level } from '../../src/types/level';
import type { Clue } from '../../src/types/clue';

function roleHolderCount(level: Level, roleId: string): number {
  if (roleId === 'victim') return level.people.filter((p) => p.isVictim).length;
  if (roleId === 'murderer') return level.people.filter((p) => p.isMurderer).length;
  return level.people.filter((p) => (p.roles ?? []).includes(roleId)).length;
}

/** Every role referenced anonymously (as a role-subject, in roleSingleton or sameRoomAsRole) must
 * resolve to exactly one person — otherwise the clue is ill-defined and the solver would throw. */
function referencedRoles(clues: Clue[]): string[] {
  const roles: string[] = [];
  for (const clue of clues) {
    if ('subject' in clue && clue.subject.type === 'role') roles.push(clue.subject.role);
    if (clue.type === 'roleSingleton' || clue.type === 'sameRoomAsRole') roles.push(clue.roleId);
    if (clue.type === 'relativePosition' && clue.otherRole != null) roles.push(clue.otherRole);
  }
  return roles;
}

/** Every non-victim person must have at least one personal clue (`subject.type==='person' && id===person.id`).
 *  Conversely, the victim must have NO personal clues: RosterPanel hides the victim's personal clue
 *  list (fixed "наедине с убийцей" line instead), so a victim-authored clue is invisible to the
 *  player while the solver still counts it — a silent source of player-visible ambiguity (medieval-21). */
export function lintLevel(level: Level): string[] {
  const violations: string[] = [];
  if (level.clues.some((clue) => clue.type === 'checkerboardParity' ||
    (clue.type === 'roleSingleton' && clue.tileColor != null)) && level.tilePattern !== 'checkerboard') {
    violations.push('Подсказки с условием цвета клетки требуют видимый checkerboard-узор на всей доске (level.tilePattern).');
  }
  // Ядро судоку: действующих лиц ровно min(рядов, столбцов) — решение живёт в
  // квадрате people×people (полная перестановка: каждый ряд и столбец квадрата
  // занят ровно одним человеком). Прямоугольные карты легальны: лишний ряд
  // (35-parking, 37-bowling — «пустой ряд» как загадка-дизъюнкция) или лишний
  // столбец (33-racing, 39-mine — edgeColumnEmpty). Меньше людей оставляет
  // пустой ряд И столбец внутри квадрата — сломанная базовая механика
  // (прецедент: 44-cemetery вышел с 9 людьми на 10×10 и прошёл все гейты).
  {
    const rowCount = new Set(level.cells.map((c) => c.row)).size;
    const colCount = new Set(level.cells.map((c) => c.col)).size;
    const expected = Math.min(rowCount, colCount);
    if (level.people.length !== expected) {
      violations.push(
        `Действующих лиц должно быть ровно ${expected} — min(рядов=${rowCount}, столбцов=${colCount}): решение живёт в квадрате полной перестановки, найдено ${level.people.length}.`,
      );
    }
  }
  // Идентификаторы подсказок обязаны быть уникальны: дубли молча ломают key/ссылки
  // (прецедент — пираты: c6/c9 дублировались после вставок и прошли валидацию).
  const seenClueIds = new Set<string>();
  for (const clue of level.clues) {
    if (seenClueIds.has(clue.id)) {
      violations.push(`Подсказка "${clue.id}": дублирующийся идентификатор — id подсказок должны быть уникальны.`);
    }
    seenClueIds.add(clue.id);
  }
  for (const clue of level.clues) {
    if (clue.type !== 'roomNumberComparison') continue;
    const numbers = new Set<number>();
    for (const room of level.rooms) {
      if (!Number.isInteger(room.number) || room.number! < 1) {
        violations.push(`Подсказка "${clue.id}" (roomNumberComparison): у зоны "${room.id}" должен быть положительный целый номер.`);
        continue;
      }
      if (numbers.has(room.number!)) {
        violations.push(`Подсказка "${clue.id}" (roomNumberComparison): номер зоны ${room.number} повторяется.`);
      }
      numbers.add(room.number!);
    }
    const otherPerson = level.people.find((person) => person.id === clue.otherPersonId);
    if (!otherPerson) {
      violations.push(`Подсказка "${clue.id}" (roomNumberComparison): персонаж "${clue.otherPersonId}" не найден.`);
    } else if (otherPerson.isVictim) {
      violations.push(`Подсказка "${clue.id}" (roomNumberComparison) упоминает жертву (${otherPerson.name}); замените её другим персонажем.`);
    }
    if (clue.subject.type === 'person') {
      const subject = level.people.find((person) => person.id === clue.subject.id);
      if (!subject) {
        violations.push(`Подсказка "${clue.id}" (roomNumberComparison): персонаж "${clue.subject.id}" не найден.`);
      } else if (subject.isVictim) {
        violations.push(`Подсказка "${clue.id}" (roomNumberComparison) адресована жертве (${subject.name}).`);
      }
      if (clue.subject.id === clue.otherPersonId) {
        violations.push(`Подсказка "${clue.id}" (roomNumberComparison) сравнивает персонажа с самим собой.`);
      }
    }
  }
  for (const person of level.people) {
    if (person.isVictim) continue;
    const hasPersonalClue = level.clues.some(
      (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === person.id,
    );
    if (!hasPersonalClue) {
      violations.push(`${person.name} (${person.id}) не имеет ни одной личной подсказки.`);
    }
  }
  const victim = level.people.find((p) => p.isVictim);
  if (victim) {
    const victimClues = level.clues.filter(
      (clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === victim.id,
    );
    for (const clue of victimClues) {
      violations.push(
        `Подсказка "${clue.id}" адресована жертве (${victim.name}) — личные клю жертвы невидимы игроку (сайдбар показывает фиксированную строку). Удалите её или перепринадлежите другому человеку.`,
      );
    }
    // Канон авторинга: общая клю не может указывать расположение жертвы. Клю с субъектом
    // role:'victim' всегда позиционна (клю, определяющие роли — roleSingleton/letterRole и
    // т.п. — субъекта-жертву не используют) и попадает в общие, давая игроку непропорционально
    // сильный якорь на позицию жертвы, у которой нет личной строки ростера (прецедент: 37-bowling).
    const victimRoleClues = level.clues.filter(
      (clue) => 'subject' in clue && clue.subject.type === 'role' && clue.subject.role === 'victim',
    );
    for (const clue of victimRoleClues) {
      violations.push(
        `Подсказка "${clue.id}" указывает расположение жертвы через субъект role:'victim' — общие клю не могут позиционировать жертву (только определять роли). Переформулируйте через живых людей.`,
      );
    }
  }
  for (const roleId of new Set(referencedRoles(level.clues))) {
    const count = roleHolderCount(level, roleId);
    if (count !== 1) {
      violations.push(`Роль "${roleId}" используется в подсказках, но имеет ${count} носителей (должен быть ровно 1).`);
    }
  }
  for (const clue of level.clues) {
    if (clue.type !== 'roleSingleton' || clue.withinRoleId == null) continue;
    if (roleHolderCount(level, clue.withinRoleId) === 0) {
      violations.push(`Подсказка "${clue.id}": роль-область "${clue.withinRoleId}" не имеет носителей.`);
    }
  }
  // relativeToItemOccupant содержательна только при ≥2 экземплярах occupiable-предмета: с одним
  // экземпляром клю вырождается в позицию относительно известной клетки предмета, и «скрытый
  // сиделец» — фикция (игрок и так видит, где предмет; кто на нём сидит, не успевает стать загадкой).
  for (const clue of level.clues) {
    if (clue.type !== 'relativeToItemOccupant') continue;
    const itemType = level.itemTypes.find((t) => t.id === clue.itemTypeId);
    if (!itemType) {
      violations.push(`Подсказка "${clue.id}": тип предмета "${clue.itemTypeId}" не описан в level.itemTypes.`);
      continue;
    }
    if (itemType.kind !== 'occupiable') {
      violations.push(
        `Подсказка "${clue.id}": предмет "${clue.itemTypeId}" не occupiable — на нём никто не может сидеть.`,
      );
    }
    const instanceCount = level.items.filter((i) => i.typeId === clue.itemTypeId).length;
    if (instanceCount < 2) {
      violations.push(
        `Подсказка "${clue.id}": предмет "${clue.itemTypeId}" встречается ${instanceCount} раз — для relativeToItemOccupant нужно ≥2 экземпляров, иначе клю вырождается в позицию относительно известной клетки.`,
      );
    }
  }
  // Клетки предмета обязаны существовать на доске и образовывать ортогонально-связное
  // полиомино (BFS по смежности). Ломаные предметы — штатная фича (лабиринты из кустов),
  // но опечатка в cellId молча рисовала бы предмет «в двух местах сразу».
  {
    const cellIdSet = new Set(level.cells.map((c) => c.id));
    for (const item of level.items) {
      const missing = item.cells.filter((cid) => !cellIdSet.has(cid));
      if (missing.length > 0) {
        violations.push(
          `Предмет "${item.id}" ссылается на клетки, которых нет на доске: ${missing.join(', ')}.`,
        );
      }
      const present = item.cells.filter((cid) => cellIdSet.has(cid));
      if (present.length === 0) continue;
      const cellSet = new Set<string>(present);
      const queue: string[] = [present[0]];
      const seen = new Set<string>([present[0]]);
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const [r, c] = cur.split('-').map(Number);
        for (const nb of [`${r - 1}-${c}`, `${r + 1}-${c}`, `${r}-${c - 1}`, `${r}-${c + 1}`]) {
          if (cellSet.has(nb) && !seen.has(nb)) {
            seen.add(nb);
            queue.push(nb);
          }
        }
      }
      if (seen.size !== present.length) {
        violations.push(
          `Предмет "${item.id}": клетки не образуют связное целое (${seen.size} из ${present.length} достижимы) — много клеточный предмет должен быть ортогонально-связным полиомино.`,
        );
      }
    }
  }
  return violations;
}
