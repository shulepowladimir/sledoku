import type { Clue } from '../types/clue';

export function collapseGroupedClues(clues: Clue[]): Clue[] {
  const seenGroupIds = new Set<string>();
  return clues.filter((clue) => {
    if (!clue.groupId) return true;
    if (seenGroupIds.has(clue.groupId)) return false;
    seenGroupIds.add(clue.groupId);
    return true;
  });
}

export function generalCluesForDisplay(clues: Clue[]): Clue[] {
  return collapseGroupedClues(
    clues.filter((clue) => !('subject' in clue) || clue.subject.type === 'role'),
  );
}
