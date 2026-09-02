import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Level } from '../../src/types/level';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { findRedundantClues, solveLevel } from './solve';

function isLevel(value: unknown): value is Level {
  return !!value && typeof value === 'object' && 'meta' in value && 'solution' in value && 'clues' in value;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Использование: npm run validate-level -- <путь-к-файлу-уровня>');
    process.exit(1);
  }

  const absPath = resolve(process.cwd(), arg);
  const mod = (await import(pathToFileURL(absPath).href)) as Record<string, unknown>;
  const level = Object.values(mod).find(isLevel);
  if (!level) {
    console.error(`В файле ${arg} не найден экспорт уровня (Level).`);
    process.exit(1);
  }

  console.log(`Уровень: ${level.meta.title} (${level.meta.id})`);

  const lintIssues = lintLevel(level);
  if (lintIssues.length > 0) {
    console.error('ЛИНТ: найдены нарушения:');
    for (const issue of lintIssues) console.error(`  - ${issue}`);
    process.exit(1);
  }
  console.log('ЛИНТ: чисто.');

  const quality = checkPuzzleQuality(level);
  if (quality.violations.length > 0) {
    console.error('КАЧЕСТВО ПОДСКАЗОК: найдены нарушения:');
    for (const v of quality.violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(`КАЧЕСТВО ПОДСКАЗОК: чисто (полностью определены: ${quality.fullyPinnedCount}/${quality.budget}).`);

  console.log('КОМНАТЫ (клеток / людей по решению):');
  for (const r of quality.roomStats) {
    console.log(`  - ${r.name} (${r.roomId}): ${r.cellCount} клеток, ${r.occupantCount} человек`);
  }

  const result = solveLevel(level);
  switch (result.status) {
    case 'PROVEN_UNIQUE': {
      console.log('РЕШЕНИЕ: PROVEN_UNIQUE — ровно одно решение, совпадающее с level.solution.');
      const redundant = findRedundantClues(level);
      if (redundant.length > 0) {
        console.warn('ИЗБЫТОЧНОСТЬ (совет, не блокирует): подсказки, которые можно убрать без потери однозначности:');
        for (const id of redundant) console.warn(`  - ${id}`);
      } else {
        console.log('ИЗБЫТОЧНОСТЬ: чисто (ни одну подсказку нельзя убрать).');
      }
      process.exit(0);
      break;
    }
    case 'NO_SOLUTION':
      console.error('РЕШЕНИЕ: NO_SOLUTION — зашитое level.solution не проходит проверку:');
      for (const v of result.violated) console.error(`  - [${v.clueId}] ${v.text}`);
      process.exit(1);
      break;
    case 'WRONG_SOLUTION':
      console.error('РЕШЕНИЕ: WRONG_SOLUTION — существует ровно одно валидное решение, но оно не совпадает с level.solution:');
      console.error(JSON.stringify(result.found, null, 2));
      process.exit(1);
      break;
    case 'MULTIPLE':
      console.error(
        `РЕШЕНИЕ: MULTIPLE — найдено больше одного валидного решения (авторское ${result.matchesAuthored ? 'входит в их число' : 'НЕ входит в их число!'}). Альтернативное решение:`,
      );
      console.error(JSON.stringify(result.alternate, null, 2));
      process.exit(1);
      break;
    case 'INCONCLUSIVE':
      console.error(`РЕШЕНИЕ: INCONCLUSIVE — ${result.reason}`);
      process.exit(1);
      break;
  }
}

main();
