import type { CSSProperties } from 'react';
import { textureUrlRegistry } from '../assets/iconRegistry';
import { FLOOR_TEXTURE_KEYS, type FloorTextureKey } from './floorTextureKeys';

export const CELL_SIZE = 64;

type FloorStyleFn = (row: number, col: number) => CSSProperties;

const tile: FloorStyleFn = (_row, _col) => ({
  backgroundColor: '#dcd7ce',
  backgroundImage:
    'linear-gradient(0deg, rgba(0,0,0,0.08) 0 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px)',
  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
});

const carpet: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 37) % 40);
  const offsetY = -((row * 23) % 40);
  return {
    backgroundColor: '#d9a8ab',
    backgroundImage:
      'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.18) 0 3px, transparent 3px), ' +
      'radial-gradient(circle at 28px 26px, rgba(0,0,0,0.08) 0 3px, transparent 3px)',
    backgroundSize: '40px 40px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const wood: FloorStyleFn = (row, _col) => {
  const plankOffset = -((row % 2) * (CELL_SIZE / 2));
  return {
    backgroundColor: '#cda374',
    backgroundImage:
      'linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px), ' +
      'linear-gradient(0deg, rgba(255,255,255,0.08) 0 50%, rgba(0,0,0,0.04) 50% 100%)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    backgroundPosition: `${plankOffset}px 0px`,
  };
};

const marble: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 29) % 64);
  const offsetY = -((row * 41) % 64);
  return {
    backgroundColor: '#e8e4de',
    backgroundImage:
      'linear-gradient(0deg, rgba(0,0,0,0.06) 0 1.5px, transparent 1.5px), ' +
      'linear-gradient(90deg, rgba(0,0,0,0.06) 0 1.5px, transparent 1.5px), ' +
      'linear-gradient(135deg, rgba(150,145,135,0.16) 0 2px, transparent 2px, transparent 30px)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, 64px 64px`,
    backgroundPosition: `0 0, 0 0, ${offsetX}px ${offsetY}px`,
  };
};

const linoleum: FloorStyleFn = (_row, _col) => ({
  backgroundColor: '#bcd6cf',
  backgroundImage:
    'linear-gradient(0deg, rgba(0,0,0,0.07) 0 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.07) 0 2px, transparent 2px)',
  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
});

const rug: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 19) % 32);
  const offsetY = -((row * 13) % 32);
  return {
    backgroundColor: '#c9536b',
    backgroundImage:
      'radial-gradient(circle at 8px 8px, rgba(255,255,255,0.16) 0 2.5px, transparent 2.5px), ' +
      'radial-gradient(circle at 22px 20px, rgba(0,0,0,0.12) 0 2.5px, transparent 2.5px)',
    backgroundSize: '32px 32px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const grass: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 17 + row * 5) % 28);
  const offsetY = -((row * 11 + col * 3) % 28);
  return {
    backgroundColor: '#8bab6c',
    backgroundImage:
      'radial-gradient(circle at 6px 20px, rgba(0,0,0,0.10) 0 2px, transparent 2px), ' +
      'radial-gradient(circle at 18px 8px, rgba(255,255,255,0.12) 0 2px, transparent 2px), ' +
      'radial-gradient(circle at 22px 22px, rgba(0,0,0,0.08) 0 1.6px, transparent 1.6px)',
    backgroundSize: '28px 28px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const dirt: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 23) % 36);
  const offsetY = -((row * 19) % 36);
  return {
    backgroundColor: '#c9a56b',
    backgroundImage:
      'radial-gradient(circle at 9px 9px, rgba(0,0,0,0.10) 0 3px, transparent 3px), ' +
      'radial-gradient(circle at 26px 18px, rgba(255,255,255,0.08) 0 2.5px, transparent 2.5px), ' +
      'radial-gradient(circle at 15px 28px, rgba(0,0,0,0.07) 0 2px, transparent 2px)',
    backgroundSize: '36px 36px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const stone: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 31) % 48);
  const offsetY = -((row * 27) % 48);
  return {
    backgroundColor: '#9a9690',
    backgroundImage:
      'linear-gradient(0deg, rgba(0,0,0,0.14) 0 2px, transparent 2px), ' +
      'linear-gradient(90deg, rgba(0,0,0,0.14) 0 2px, transparent 2px), ' +
      'linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px, transparent 24px)',
    backgroundSize: `${CELL_SIZE / 2}px ${CELL_SIZE / 2}px, ${CELL_SIZE / 2}px ${CELL_SIZE / 2}px, 48px 48px`,
    backgroundPosition: `0 0, 0 0, ${offsetX}px ${offsetY}px`,
  };
};

const water: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 21) % 40);
  const offsetY = -((row * 15) % 40);
  return {
    backgroundColor: '#6fa8bf',
    backgroundImage:
      'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.16) 0 4px, transparent 4px), ' +
      'radial-gradient(circle at 28px 26px, rgba(255,255,255,0.10) 0 3px, transparent 3px), ' +
      'linear-gradient(0deg, rgba(0,0,0,0.05) 0 40px)',
    backgroundSize: '40px 40px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const sand: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 25) % 44);
  const offsetY = -((row * 17) % 44);
  return {
    backgroundColor: '#e3c98a',
    backgroundImage:
      'radial-gradient(circle at 12px 10px, rgba(255,255,255,0.14) 0 3px, transparent 3px), ' +
      'radial-gradient(circle at 30px 24px, rgba(0,0,0,0.08) 0 2.5px, transparent 2.5px)',
    backgroundSize: '44px 44px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const metal: FloorStyleFn = (_row, _col) => ({
  backgroundColor: '#4b5160',
  backgroundImage:
    'linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px), ' +
    'linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px), ' +
    'radial-gradient(circle at 6px 6px, rgba(255,255,255,0.18) 0 1.6px, transparent 1.6px), ' +
    'radial-gradient(circle at 58px 6px, rgba(255,255,255,0.18) 0 1.6px, transparent 1.6px), ' +
    'radial-gradient(circle at 6px 58px, rgba(255,255,255,0.18) 0 1.6px, transparent 1.6px), ' +
    'radial-gradient(circle at 58px 58px, rgba(255,255,255,0.18) 0 1.6px, transparent 1.6px)',
  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
});

const concrete: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 21) % 40);
  const offsetY = -((row * 13) % 40);
  return {
    backgroundColor: '#b3aea6',
    backgroundImage:
      'linear-gradient(0deg, rgba(0,0,0,0.10) 0 1.5px, transparent 1.5px), ' +
      'linear-gradient(90deg, rgba(0,0,0,0.10) 0 1.5px, transparent 1.5px), ' +
      'radial-gradient(circle at 9px 14px, rgba(0,0,0,0.07) 0 2px, transparent 2px), ' +
      'radial-gradient(circle at 27px 30px, rgba(255,255,255,0.10) 0 2.5px, transparent 2.5px)',
    backgroundSize: `${CELL_SIZE / 2}px ${CELL_SIZE / 2}px, ${CELL_SIZE / 2}px ${CELL_SIZE / 2}px, 40px 40px, 40px 40px`,
    backgroundPosition: `0 0, 0 0, ${offsetX}px ${offsetY}px`,
  };
};

const snow: FloorStyleFn = (row, col) => {
  const drift = ((row * 7 + col * 13) % 5) * 0.02;
  return {
    backgroundColor: '#e9edf2',
    backgroundImage:
      `linear-gradient(0deg, rgba(160,175,200,${(0.10 + drift).toFixed(3)}) 0 100%), ` +
      'radial-gradient(circle at 6px 8px, rgba(255,255,255,0.9) 0 2px, transparent 2px), ' +
      'radial-gradient(circle at 18px 22px, rgba(160,175,200,0.25) 0 2.4px, transparent 2.4px), ' +
      'radial-gradient(circle at 28px 12px, rgba(255,255,255,0.7) 0 1.6px, transparent 1.6px)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px`,
    backgroundPosition: `0 0, ${-((col * 9) % CELL_SIZE)}px ${-((row * 5) % CELL_SIZE)}px, ${-((col * 3) % CELL_SIZE)}px ${-((row * 11) % CELL_SIZE)}px, ${-((col * 15) % CELL_SIZE)}px ${-((row * 7) % CELL_SIZE)}px`,
  };
};

const ice: FloorStyleFn = (row, col) => {
  const crackShift = (row + col) % 3;
  return {
    backgroundColor: '#cfe3ee',
    backgroundImage:
      `linear-gradient(135deg, rgba(255,255,255,0.5) 0 25%, transparent 25%), ` +
      `linear-gradient(225deg, rgba(255,255,255,${(0.25 + crackShift * 0.08).toFixed(2)}) 0 30%, transparent 30%), ` +
      'radial-gradient(circle at 10px 30px, rgba(255,255,255,0.65) 0 3px, transparent 3px), ' +
      'linear-gradient(90deg, rgba(120,160,190,0.18) 0 1px, transparent 1px)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE / 2}px ${CELL_SIZE / 2}px`,
    backgroundPosition: `0 0, 0 0, ${-((col * 13) % CELL_SIZE)}px ${-((row * 6) % CELL_SIZE)}px, 0 0`,
  };
};

const asphalt: FloorStyleFn = (row, col) => {
  const seamX = col % 2 === 0 ? 0 : -(CELL_SIZE / 2);
  return {
    backgroundColor: '#5c5f66',
    backgroundImage:
      'linear-gradient(0deg, rgba(255,255,255,0.045) 0 1.5px, transparent 1.5px), ' +
      'linear-gradient(90deg, rgba(255,255,255,0.05) 0 1.5px, transparent 1.5px), ' +
      'radial-gradient(circle at 7px 9px, rgba(255,255,255,0.06) 0 1.3px, transparent 1.3px), ' +
      'radial-gradient(circle at 19px 21px, rgba(0,0,0,0.14) 0 1.6px, transparent 1.6px)',
    backgroundSize: `${CELL_SIZE / 2}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE / 2}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px`,
    backgroundPosition: `${seamX}px 0, 0 0, ${-((col * 11) % CELL_SIZE)}px ${-((row * 7) % CELL_SIZE)}px, ${-((col * 5) % CELL_SIZE)}px ${-((row * 13) % CELL_SIZE)}px`,
  };
};

const rubber: FloorStyleFn = (_row, col) => ({
  backgroundColor: '#b3552f',
  backgroundImage:
    'linear-gradient(90deg, rgba(255,255,255,0.10) 0 3px, transparent 3px), ' +
    'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.10) 0 1.6px, transparent 1.6px), ' +
    'radial-gradient(circle at 42px 38px, rgba(0,0,0,0.10) 0 1.6px, transparent 1.6px)',
  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px, ${CELL_SIZE}px ${CELL_SIZE}px`,
  backgroundPosition: `${-((col * 8) % CELL_SIZE)}px 0`,
});

const stairs: FloorStyleFn = (row, _col) => {
  const step = row % 4;
  const shade = 0.06 + step * 0.05;
  return {
    backgroundColor: '#a8927a',
    backgroundImage:
      `linear-gradient(0deg, rgba(0,0,0,${(0.22).toFixed(2)}) 0 3px, transparent 3px), ` +
      `linear-gradient(0deg, rgba(255,255,255,${shade.toFixed(2)}) 0 100%), ` +
      'linear-gradient(90deg, rgba(0,0,0,0.10) 0 2px, transparent 2px)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE / 4}px, ${CELL_SIZE}px ${CELL_SIZE / 4}px, ${CELL_SIZE}px ${CELL_SIZE / 4}px`,
    backgroundPosition: `0 ${-(step * (CELL_SIZE / 4))}px, 0 0, 0 0`,
  };
};

const cliff: FloorStyleFn = (row, col) => {
  const offsetX = -((col * 27) % 44);
  const offsetY = -((row * 19) % 44);
  return {
    backgroundColor: '#7d7568',
    backgroundImage:
      'radial-gradient(ellipse at 12px 14px, rgba(0,0,0,0.16) 0 4px, transparent 4px), ' +
      'radial-gradient(ellipse at 32px 30px, rgba(255,255,255,0.09) 0 3px, transparent 3px), ' +
      'radial-gradient(ellipse at 24px 8px, rgba(0,0,0,0.10) 0 2.5px, transparent 2.5px)',
    backgroundSize: '44px 44px, 44px 44px, 44px 44px',
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };
};

const cobble: FloorStyleFn = (row, _col) => {
  const oddRow = row % 2 === 1;
  const offsetCol = oddRow ? CELL_SIZE / 2 : 0;
  return {
    backgroundColor: '#9c948a',
    backgroundImage:
      'radial-gradient(ellipse at 16px 16px, rgba(255,255,255,0.10) 0 11px, rgba(0,0,0,0.14) 11px 13px, transparent 13px), ' +
      'radial-gradient(ellipse at 48px 16px, rgba(255,255,255,0.07) 0 11px, rgba(0,0,0,0.12) 11px 13px, transparent 13px), ' +
      'radial-gradient(ellipse at 16px 48px, rgba(255,255,255,0.07) 0 11px, rgba(0,0,0,0.12) 11px 13px, transparent 13px), ' +
      'radial-gradient(ellipse at 48px 48px, rgba(255,255,255,0.10) 0 11px, rgba(0,0,0,0.14) 11px 13px, transparent 13px)',
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    backgroundPosition: `${-offsetCol}px 0`,
  };
};

// Procedural fallback for `checker` (the designer SVG in src/assets/textures takes
// precedence in the browser; this keeps the Record complete and CLI-safe).
const checker: FloorStyleFn = (row, col) => ({
  backgroundColor: (row + col) % 2 === 0 ? '#DFD6C6' : '#786862',
});

const FLOOR_TEXTURES: Record<FloorTextureKey, FloorStyleFn> = { tile, carpet, wood, marble, linoleum, rug, grass, dirt, stone, water, sand, metal, concrete, rubber, stairs, cliff, cobble, asphalt, snow, ice, checker };

export const floorTextureKeys: readonly string[] = FLOOR_TEXTURE_KEYS;

export function floorStyle(textureKey: string, row: number, col: number): CSSProperties {
  // Designer tile (src/assets/textures/<key>.svg|.png) takes precedence over the
  // procedural CSS gradient below. Quotes are required: Vite inlines assets under
  // assetsInlineLimit as data-URIs that themselves contain single quotes — an
  // unquoted url() would be silently dropped by the CSS parser.
  const customUrl = textureUrlRegistry[textureKey];
  if (customUrl) {
    return {
      backgroundImage: `url(${JSON.stringify(customUrl)})`,
      backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    };
  }
  const fn = (FLOOR_TEXTURES as Record<string, FloorStyleFn>)[textureKey];
  return fn ? fn(row, col) : { backgroundColor: '#3a3a3a' };
}
