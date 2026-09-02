import type { CSSProperties, ReactNode } from 'react';
import type { Person } from '../../types/level';
import { levels } from '../../../levels';
import { itemIconRegistry, themeIconRegistry, personArchetypeCount } from '../../assets/iconRegistry';
import { floorStyle, floorTextureKeys } from '../../styles/floorTextures';
import { ItemIcon } from '../board/ItemIcon';
import { ThemeIcon } from '../menu/ThemeIcon';
import { PersonFigureSvg } from '../board/PersonFigureSvg';

// Dev-only asset gallery: /?gallery. Acceptance tool for designer art — every key is shown
// at all render sizes on light/dark/textured backgrounds, with its registry status.
// No route lib needed: the flag is read once at app start.

function iconUsage(): Map<string, { labels: string[]; levelTitles: string[] }> {
  const usage = new Map<string, { labels: string[]; levelTitles: string[] }>();
  for (const level of levels) {
    for (const itemType of level.itemTypes) {
      const entry = usage.get(itemType.icon) ?? { labels: [], levelTitles: [] };
      if (!entry.labels.includes(itemType.label)) entry.labels.push(itemType.label);
      if (!entry.levelTitles.includes(level.meta.title)) entry.levelTitles.push(level.meta.title);
      usage.set(itemType.icon, entry);
    }
  }
  return usage;
}

const USAGE = iconUsage();
const ITEM_KEYS = [...USAGE.keys()].sort();

const PERSON_PALETTE = [...new Set(levels.flatMap((level) => level.people.map((p) => p.color)))].slice(0, 12);

function samplePerson(color: string, gender: Person['gender'], id: string): Person {
  return {
    id,
    name: 'Образец',
    initialLetter: 'О',
    gender,
    color,
    isVictim: false,
    isMurderer: false,
    roles: [],
  };
}

function isCustomTexture(key: string): boolean {
  return String(floorStyle(key, 0, 0).backgroundImage ?? '').includes('url(');
}

function StatusBadge({ custom }: { custom: boolean }) {
  return (
    <span className={`asset-gallery__badge${custom ? ' asset-gallery__badge--custom' : ''}`}>
      {custom ? 'дизайн' : 'fallback'}
    </span>
  );
}

function IconSwatches({ render }: { render: (size: number) => ReactNode }) {
  const swatchBg = floorStyle('wood', 1, 2) as CSSProperties;
  const rows: Array<{ key: string; bg?: CSSProperties; dark?: boolean }> = [
    { key: 'light' },
    { key: 'dark', dark: true },
    { key: 'tex', bg: swatchBg },
  ];
  return (
    <div className="asset-gallery__swatches">
      {rows.map((row) => (
        <div
          key={row.key}
          className={`asset-gallery__swatch${row.dark ? ' asset-gallery__swatch--dark' : ''}`}
          style={row.bg}
        >
          {[18, 40, 64].map((size) => (
            <span key={size} className="asset-gallery__cell">
              {render(size)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AssetGallery() {
  const themeKeys = [...new Set(levels.map((level) => level.meta.theme))].sort();
  const itemsCustom = ITEM_KEYS.filter((key) => itemIconRegistry[key]).length;
  const themesCustom = themeKeys.filter((key) => themeIconRegistry[key]).length;
  const texturesCustom = floorTextureKeys.filter(isCustomTexture).length;

  return (
    <div className="asset-gallery">
      <header className="asset-gallery__header">
        <h1>Галерея ассетов</h1>
        <p>
          Предметы: {itemsCustom}/{ITEM_KEYS.length} · Темы: {themesCustom}/{themeKeys.length} · Текстуры:{' '}
          {texturesCustom}/{floorTextureKeys.length} · Архетипы: м {personArchetypeCount.male} / ж{' '}
          {personArchetypeCount.female}
        </p>
        <a href="/">← К игре</a>
      </header>

      <section className="asset-gallery__section" data-testid="gallery-items">
        <h2>Иконки предметов</h2>
        <ul className="asset-gallery__grid">
          {ITEM_KEYS.map((key) => (
            <li key={key} className="asset-gallery__card" data-testid={`gallery-item-${key}`}>
              <div className="asset-gallery__card-head">
                <code>{key}</code>
                <StatusBadge custom={Boolean(itemIconRegistry[key])} />
              </div>
              <div className="asset-gallery__labels">{USAGE.get(key)?.labels.slice(0, 2).join(', ')}</div>
              <IconSwatches
                render={(size) => (
                  <ItemIcon itemType={{ id: key, label: key, kind: 'decorative', icon: key }} size={size} />
                )}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="asset-gallery__section" data-testid="gallery-themes">
        <h2>Иконки тем меню</h2>
        <ul className="asset-gallery__grid">
          {themeKeys.map((key) => {
            const level = levels.find((l) => l.meta.theme === key);
            return (
              <li key={key} className="asset-gallery__card" data-testid={`gallery-theme-${key}`}>
                <div className="asset-gallery__card-head">
                  <code>{key}</code>
                  <StatusBadge custom={Boolean(themeIconRegistry[key])} />
                </div>
                <div className="asset-gallery__labels">{level?.meta.title}</div>
                <IconSwatches render={(size) => <ThemeIcon theme={key} size={size} />} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="asset-gallery__section" data-testid="gallery-textures">
        <h2>Текстуры пола</h2>
        <ul className="asset-gallery__grid">
          {floorTextureKeys.map((key) => (
            <li key={key} className="asset-gallery__card" data-testid={`gallery-texture-${key}`}>
              <div className="asset-gallery__card-head">
                <code>{key}</code>
                <StatusBadge custom={isCustomTexture(key)} />
              </div>
              <div className="asset-gallery__tile">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => (
                    <div key={`${row}-${col}`} className="asset-gallery__tile-cell" style={floorStyle(key, row, col)} />
                  )),
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="asset-gallery__section" data-testid="gallery-persons">
        <h2>Персонажи</h2>
        <p className="asset-gallery__note">
          Архетипы: мужских {personArchetypeCount.male}, женских {personArchetypeCount.female}. Одежда крашется
          игровым цветом (var(--person-clothing)).
        </p>
        <div className="asset-gallery__persons">
          {PERSON_PALETTE.map((color, i) => (
            <div key={color} className="asset-gallery__person">
              <PersonFigureSvg person={samplePerson(color, 'male', `gallery-m-${i}`)} size={48} />
              <PersonFigureSvg person={samplePerson(color, 'female', `gallery-f-${i}`)} size={48} />
              <code>{color}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
