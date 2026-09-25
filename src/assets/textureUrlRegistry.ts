import { byFileBase } from './iconRegistryUtils';

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

export const textureUrlRegistry: Record<string, string> = {
  ...byFileBase(texturePngUrlModules),
  ...byFileBase(textureSvgUrlModules),
};
