import type { ComponentType, CSSProperties, ReactNode } from 'react';

// Registry of designer-supplied art. Files are keyed by name: dropping `plane.svg` into
// `src/assets/icons/items/` replaces the plane icon everywhere (board, overlays) without
// any code change. Missing keys keep rendering the built-in fallback art, so the game
// stays fully playable while the library is being filled in batch by batch.
//
// Conventions (see docs/assets.md):
// - items/themes/persons: SVG, rendered inline as React components
// - persons: clothing shape must use fill="var(--person-clothing)"; the game sets that
//   variable to the person's gameplay color
// - textures: seamless square SVG or PNG tiles, rendered as background-image URLs

export type SvgComponent = ComponentType<{
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  children?: ReactNode;
}>;

function globKeys(modules: Record<string, unknown>): string[] {
  return Object.keys(modules).map((path) => path.split('/').pop()!.replace(/\.[a-z]+$/i, ''));
}

function byFileBase<T>(modules: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [path, value] of Object.entries(modules)) {
    const base = path.split('/').pop()!.replace(/\.[a-z]+$/i, '');
    if (!(base in out)) out[base] = value;
  }
  return out;
}

const itemSvgModules = import.meta.glob('./icons/items/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

const themeSvgModules = import.meta.glob('./icons/themes/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

const personSvgModules = import.meta.glob('./icons/persons/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

const textureSvgUrlModules = import.meta.glob('./textures/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as unknown as Record<string, string>;

const texturePngUrlModules = import.meta.glob('./textures/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
}) as unknown as Record<string, string>;

export const itemIconRegistry: Record<string, SvgComponent> = byFileBase(itemSvgModules);
export const themeIconRegistry: Record<string, SvgComponent> = byFileBase(themeSvgModules);

const personComponents: Record<string, SvgComponent> = byFileBase(personSvgModules);

// SVG textures win over same-named PNG.
export const textureUrlRegistry: Record<string, string> = {
  ...byFileBase(texturePngUrlModules),
  ...byFileBase(textureSvgUrlModules),
};

// Person archetypes follow the `person-<m|f>-<nn>` naming convention; the file set can be
// unbalanced (e.g. only male archetypes delivered so far) — the other gender falls back
// to the built-in parametric figure.
function archetypeKeys(prefix: string): string[] {
  return globKeys(personSvgModules)
    .filter((key) => key.startsWith(prefix))
    .sort();
}

const maleArchetypeKeys = archetypeKeys('person-m-');
const femaleArchetypeKeys = archetypeKeys('person-f-');

export const personArchetypeCount = {
  male: maleArchetypeKeys.length,
  female: femaleArchetypeKeys.length,
};

function hashId(id: string): number {
  let hash = 7;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

export function personArchetypeFor(gender: 'male' | 'female', personId: string): SvgComponent | null {
  const keys = gender === 'male' ? maleArchetypeKeys : femaleArchetypeKeys;
  if (keys.length === 0) return null;
  return personComponents[keys[hashId(personId) % keys.length]];
}

export function personArchetypeKeys(): string[] {
  return [...maleArchetypeKeys, ...femaleArchetypeKeys].sort();
}
