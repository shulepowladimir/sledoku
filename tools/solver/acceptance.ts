import type { Level } from '../../src/types/level';

const MIN_OCCUPANCY_DENSITY = 0.4;

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
]);

// Apartment-01 is the only level with an approved nonzero fully-pinned-person allowance.
const PINNED_PERSON_EXEMPT_LEVEL_IDS = new Set(['apartment-01']);

export function checkLevelAcceptance(level: Level, fullyPinnedCount: number): string[] {
  const issues: string[] = [];
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
