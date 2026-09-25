export function byFileBase<T>(modules: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [path, value] of Object.entries(modules)) {
    const base = path.split('/').pop()!.replace(/\.[a-z]+$/i, '');
    if (!(base in out)) out[base] = value;
  }
  return out;
}

export function globKeys(modules: Record<string, unknown>): string[] {
  return Object.keys(modules).map((path) => path.split('/').pop()!.replace(/\.[a-z]+$/i, ''));
}
