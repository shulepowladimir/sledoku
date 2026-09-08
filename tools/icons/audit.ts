// Asset library audit: compares keys used by the game (levels + built-in icon switches)
// against designer files in src/assets/. Also regenerates docs/icon-reference.md.
//
// Run: npm run audit-icons
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { levels } from '../../levels';
import { ItemLibrary } from '../../levels/itemLibrary';
import { FLOOR_TEXTURE_KEYS } from '../../src/styles/floorTextureKeys';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

function listFiles(dir: string, exts: string[]): string[] {
  const full = join(ROOT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full).filter((name) => exts.some((ext) => name.endsWith(ext)));
}

function baseName(name: string): string {
  return name.replace(/\.[a-z]+$/i, '');
}

function parseSwitchCases(relPath: string): Set<string> {
  const source = readFileSync(join(ROOT, relPath), 'utf8');
  return new Set([...source.matchAll(/case '([A-Za-z0-9]+)':/g)].map((m) => m[1]));
}

function parseThemeDelegations(relPath: string): Map<string, string> {
  const source = readFileSync(join(ROOT, relPath), 'utf8');
  const map = new Map<string, string>();
  for (const m of source.matchAll(/^\s+(\w+):\s*\{[^}]*icon: '([A-Za-z0-9]+)'/gm)) {
    map.set(m[1], m[2]);
  }
  return map;
}

type ItemRow = {
  key: string;
  label: string;
  levelTitles: string[];
  file: boolean;
  fallbackCase: boolean;
};

function itemUsage(): Map<string, { label: string; levelTitles: string[] }> {
  const usage = new Map<string, { label: string; levelTitles: string[] }>();
  for (const level of levels) {
    for (const itemType of level.itemTypes) {
      const entry = usage.get(itemType.icon) ?? { label: itemType.label, levelTitles: [] };
      if (!entry.levelTitles.includes(level.meta.title)) entry.levelTitles.push(level.meta.title);
      usage.set(itemType.icon, entry);
    }
  }
  return usage;
}

function buildReport() {
  const usage = itemUsage();
  const itemCases = parseSwitchCases('src/components/board/ItemIcon.tsx');
  const itemFiles = new Set(listFiles('src/assets/icons/items', ['.svg']).map(baseName));

  // Icon keys known to the project: used in levels + library defaults + switch cases.
  const libraryKeys = new Set(Object.values(ItemLibrary).map((factory) => factory().icon));
  const allItemKeys = [...new Set([...usage.keys(), ...libraryKeys, ...itemCases])].sort();

  const itemRows: ItemRow[] = allItemKeys.map((key) => ({
    key,
    label: usage.get(key)?.label ?? '',
    levelTitles: usage.get(key)?.levelTitles ?? [],
    file: itemFiles.has(key),
    fallbackCase: itemCases.has(key),
  }));

  const themeCases = parseSwitchCases('src/components/menu/ThemeIcon.tsx');
  const themeDelegations = parseThemeDelegations('src/components/menu/ThemeIcon.tsx');
  const themeFiles = new Set(listFiles('src/assets/icons/themes', ['.svg']).map(baseName));
  const themeKeys = [...new Set(levels.map((level) => level.meta.theme))].sort();

  const themeRows = themeKeys.map((key) => ({
    key,
    title: levels.find((l) => l.meta.theme === key)?.meta.title ?? '',
    file: themeFiles.has(key),
    fallbackCase: themeCases.has(key) || themeDelegations.has(key),
    delegation: themeDelegations.get(key) ?? null,
  }));

  const textureFiles = listFiles('src/assets/textures', ['.svg', '.png']);
  const textureBaseNames = textureFiles.map(baseName);
  const textureRows = FLOOR_TEXTURE_KEYS.map((key) => ({
    key,
    file: textureBaseNames.includes(key),
  }));

  const personFiles = listFiles('src/assets/icons/persons', ['.svg']);
  const personRows = personFiles.map((name) => {
    const content = readFileSync(join(ROOT, 'src/assets/icons/persons', name), 'utf8');
    const key = baseName(name);
    return {
      key,
      validName: /^person-(m|f)-\d{2}$/.test(key),
      // Prefix match: both `var(--person-clothing)` and the recommended
      // fallback form `var(--person-clothing, #8A8A8A)` are valid.
      hasClothingVar: content.includes('var(--person-clothing'),
    };
  });

  return { itemRows, itemFiles, themeRows, themeFiles, textureRows, textureFiles, personRows };
}

const r = buildReport();

const itemsMissing = r.itemRows.filter((row) => !row.file && !row.fallbackCase);
const itemsCustom = r.itemRows.filter((row) => row.file).length;
const itemOrphans = [...r.itemFiles].filter((key) => !r.itemRows.some((row) => row.key === key));

const themesMissing = r.themeRows.filter((row) => !row.file && !row.fallbackCase);
const themesCustom = r.themeRows.filter((row) => row.file).length;
const themeOrphans = [...r.themeFiles].filter((key) => !r.themeRows.some((row) => row.key === key));

const texturesCustom = r.textureRows.filter((row) => row.file).length;
const textureKeys = new Set(FLOOR_TEXTURE_KEYS as readonly string[]);
const textureOrphans = r.textureFiles.map(baseName).filter((key) => !textureKeys.has(key));

const dupTextureKeys = r.textureFiles
  .map(baseName)
  .filter((key, i, arr) => arr.indexOf(key) !== i);

const personInvalid = r.personRows.filter((row) => !row.validName || !row.hasClothingVar);

console.log('=== Audit: asset library ===\n');

console.log(`Items:    ${itemsCustom}/${r.itemRows.length} custom, rest on fallback switch`);
if (itemsMissing.length) {
  console.log(`  MISSING (no file, no fallback case): ${itemsMissing.map((x) => x.key).join(', ')}`);
}
if (itemOrphans.length) {
  console.log(`  ORPHAN files (no such key): ${itemOrphans.join(', ')}`);
}

console.log(`Themes:   ${themesCustom}/${r.themeRows.length} custom, rest on fallback`);
if (themesMissing.length) {
  console.log(`  MISSING (no file, no fallback case): ${themesMissing.map((x) => x.key).join(', ')}`);
}
if (themeOrphans.length) {
  console.log(`  ORPHAN files (no such theme): ${themeOrphans.join(', ')}`);
}

console.log(`Textures: ${texturesCustom}/${r.textureRows.length} custom, rest on CSS gradients`);
if (textureOrphans.length) {
  console.log(`  ORPHAN files (no such texture key): ${textureOrphans.join(', ')}`);
}
if (dupTextureKeys.length) {
  console.log(`  DUPLICATE svg+png for: ${dupTextureKeys.join(', ')} (svg wins)`);
}

console.log(`Persons:  ${r.personRows.length} archetype files`);
for (const row of personInvalid) {
  console.log(`  INVALID ${row.key}: name=${row.validName ? 'ok' : 'BAD'} clothingVar=${row.hasClothingVar ? 'ok' : 'MISSING'}`);
}

// Regenerate the designer reference doc.
const lines: string[] = [];
lines.push('# Icon reference (generated)');
lines.push('');
lines.push('Регенерируется `npm run audit-icons`. Требования к файлам — в [assets.md](./assets.md).');
lines.push('');
lines.push('## Иконки предметов');
lines.push('');
lines.push('| Ключ | Название | Уровни | Файл |');
lines.push('| --- | --- | --- | --- |');
for (const row of r.itemRows) {
  const levelList = row.levelTitles.length ? row.levelTitles.join(', ') : '— (библиотека)';
  lines.push(`| \`${row.key}\` | ${row.label || '—'} | ${levelList} | ${row.file ? 'да' : ''} |`);
}
lines.push('');
lines.push('## Иконки тем меню');
lines.push('');
lines.push('| Тема | Уровень | Файл | Fallback |');
lines.push('| --- | --- | --- | --- |');
for (const row of r.themeRows) {
  const fallback = row.delegation ? `иконка предмета \`${row.delegation}\`` : row.fallbackCase ? 'встроенная' : 'нет';
  lines.push(`| \`${row.key}\` | ${row.title} | ${row.file ? 'да' : ''} | ${fallback} |`);
}
lines.push('');
lines.push('## Текстуры пола');
lines.push('');
lines.push('| Ключ | Файл |');
lines.push('| --- | --- |');
for (const row of r.textureRows) {
  lines.push(`| \`${row.key}\` | ${row.file ? 'да' : ''} |`);
}
lines.push('');
lines.push('## Архетипы персонажей');
lines.push('');
lines.push('Игровые цвета одежды (одежда архетипа красится ими через `var(--person-clothing)`, заливка-заглушка в файле — #8A8A8A):');
lines.push('');
const personPalette = [...new Set(levels.flatMap((level) => level.people.map((p) => p.color)))].sort();
for (const color of personPalette) {
  lines.push(`- \`${color}\``);
}
lines.push('');
if (r.personRows.length === 0) {
  lines.push('Пока нет файлов. Конвенция: `person-m-01.svg` / `person-f-02.svg`, одежда — `fill="var(--person-clothing)"`.');
} else {
  lines.push('| Файл | Имя по конвенции | Одежда var(--person-clothing) |');
  lines.push('| --- | --- | --- |');
  for (const row of r.personRows) {
    lines.push(`| \`${row.key}.svg\` | ${row.validName ? 'ок' : 'нарушено'} | ${row.hasClothingVar ? 'ок' : 'нет'} |`);
  }
}
lines.push('');

writeFileSync(join(ROOT, 'docs/icon-reference.md'), lines.join('\n'));
console.log('\ndocs/icon-reference.md обновлён.');

if (itemsMissing.length || themesMissing.length || personInvalid.length) {
  process.exitCode = 1;
}
