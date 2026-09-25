import { byFileBase } from './iconRegistryUtils';
import type { SvgComponent } from './galleryIconRegistry';

const themeSvgModules = import.meta.glob('./icons/themes/*.svg', {
  query: '?react',
  import: 'default',
  eager: true,
}) as unknown as Record<string, SvgComponent>;

export const themeIconRegistry = byFileBase(themeSvgModules);
