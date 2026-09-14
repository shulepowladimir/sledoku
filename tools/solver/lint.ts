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
  }
  return roles;
}

/** Every non-victim person must have at least one personal clue (`subject.type==='person' && id===person.id`).
 *  Conversely, the victim must have NO personal clues: RosterPanel hides the victim's personal clue
 *  list (fixed "наедине с убийцей" line instead), so a victim-authored clue is invisible to the
 *  player while the solver still counts it — a silent source of player-visible ambiguity (medieval-21). */
export function lintLevel(level: Level): string[] {
  const violations: string[] = [];
  // Идентификаторы подсказок обязаны быть уникальны: дубли молча ломают key/ссылки
  // (прецедент — пираты: c6/c9 дублировались после вставок и прошли валидацию).
  const seenClueIds = new Set<string>();
  for (const clue of level.clues) {
    if (seenClueIds.has(clue.id)) {
      violations.push(`Подсказка "${clue.id}": дублирующийся идентификатор — id подсказок должны быть уникальны.`);
    }
    seenClueIds.add(clue.id);
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
  }
  for (const roleId of new Set(referencedRoles(level.clues))) {
    const count = roleHolderCount(level, roleId);
    if (count !== 1) {
      violations.push(`Роль "${roleId}" используется в подсказках, но имеет ${count} носителей (должен быть ровно 1).`);
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
  return violations;
}
