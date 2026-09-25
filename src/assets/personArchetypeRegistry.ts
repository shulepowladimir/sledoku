import { byFileBase, globKeys } from './iconRegistryUtils';
import type { SvgComponent } from './galleryIconRegistry';

const personSvgModules = import.meta.glob('./icons/persons/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

const personComponents = byFileBase(personSvgModules);

function archetypeKeys(prefix: string): string[] {
  return globKeys(personSvgModules).filter((key) => key.startsWith(prefix)).sort();
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
