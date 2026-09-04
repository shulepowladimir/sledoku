import { transliterate } from '../../lib/transliterate';

export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base || 'item';
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

export function camelCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

/** editor-внутренний id ("person-3"/"room-2") -> читаемый слаг ("andrei"/"kitchen"), уникальный в пределах списка. */
export function buildSlugMap<T extends { id: string; name: string }>(list: T[]): Map<string, string> {
  const taken = new Set<string>();
  const map = new Map<string, string>();
  for (const entry of list) {
    map.set(entry.id, uniqueSlug(transliterate(entry.name), taken));
  }
  return map;
}
