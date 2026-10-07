import type { Level } from '../../src/types/level';
import { generalCluesForDisplay } from '../../src/engine/cluePresentation';

const MIN_OCCUPANCY_DENSITY = 0.4;
const MAX_COMMON_CLUE_GROUPS = 4;

// Existing levels below the density target are grandfathered; new levels need an explicit user-approved exception.
const DENSITY_EXEMPT_LEVEL_IDS = new Set([
  'egypt-01',
  'space-01',
  'wildwest-02',
  'stadium-01',
  'polar-01',
  'pirates-01',
  'racing-01',
  'parking-01',
  'bowling-01',
  'chemlab-01',
  'cemetery-01',
  // User-approved 38.2% occupancy: fixed underwater layout plus the two-cell breach.
  'underwater-01',
  'wedding-01',
]);

// Apartment-01 and bakery-01 have approved fully-pinned-person allowances.
const PINNED_PERSON_EXEMPT_LEVEL_IDS = new Set(['apartment-01', 'bakery-01']);

// Accepted before the four-group limit; do not extend without discussing a level-specific exception.
const COMMON_CLUE_LIMIT_GRANDFATHERED_LEVEL_IDS = new Set([
  'egypt-01',
  'prison-01',
  'hotel-01',
  'airport-01',
  'hollywood-01',
  'polar-01',
  'festival-01',
  'barbershop-01',
]);

export function checkLevelAcceptance(level: Level, fullyPinnedCount: number): string[] {
  const issues: string[] = [];
  const commonClueGroupCount = generalCluesForDisplay(level.clues).length;

  if (commonClueGroupCount > MAX_COMMON_CLUE_GROUPS
    && !COMMON_CLUE_LIMIT_GRANDFATHERED_LEVEL_IDS.has(level.meta.id)) {
    issues.push(`общих групп подсказок: ${commonClueGroupCount}, допустимо не более ${MAX_COMMON_CLUE_GROUPS}`);
  }

  const occupiedCells = level.items.reduce((count, item) => count + item.cells.length, 0)
    + level.cells.filter((cell) => cell.floorFeatureId).length;
  const density = occupiedCells / level.cells.length;

  if (density < MIN_OCCUPANCY_DENSITY && !DENSITY_EXEMPT_LEVEL_IDS.has(level.meta.id)) {
    issues.push(`плотность предметов и фичей пола ${(density * 100).toFixed(1)}% ниже обязательных 40%`);
  }

  if (fullyPinnedCount > 0 && !PINNED_PERSON_EXEMPT_LEVEL_IDS.has(level.meta.id)) {
    issues.push(`полностью запинено людей: ${fullyPinnedCount}, допустимо: 0`);
  }

  return issues;
}
