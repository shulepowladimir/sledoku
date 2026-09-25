import { byFileBase } from './iconRegistryUtils';
import type { SvgComponent } from './galleryIconRegistry';

const itemSvgModules = import.meta.glob('./icons/items/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

export const itemIconRegistry = byFileBase(itemSvgModules);
