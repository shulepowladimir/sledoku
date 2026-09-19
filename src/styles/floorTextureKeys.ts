// Canonical list of floor texture keys. Kept in a dependency-free module so the CLI audit
// tool can import it without pulling in the asset registry (import.meta.glob is
// browser/Vite-only).
export const FLOOR_TEXTURE_KEYS = [
  'tile',
  'carpet',
  'wood',
  'marble',
  'linoleum',
  'rug',
  'grass',
  'dirt',
  'stone',
  'water',
  'sand',
  'metal',
  'concrete',
  'rubber',
  'stairs',
  'cliff',
  'cobble',
  'asphalt',
  'snow',
  'ice',
  'checker',
  'rails',
] as const;

export type FloorTextureKey = (typeof FLOOR_TEXTURE_KEYS)[number];
