import { levels } from '../../levels/index';
import { lintLevel } from './lint';
import { checkPuzzleQuality } from './puzzleQuality';
import { solveLevel } from './solve';

function main() {
  let failed = false;

  for (const level of levels) {
    const label = `${level.meta.title} (${level.meta.id})`;
    const problems: string[] = [];

    const lintIssues = lintLevel(level);
    problems.push(...lintIssues.map((issue) => `ЛИНТ: ${issue}`));

    const quality = checkPuzzleQuality(level);
    problems.push(...quality.violations.map((v) => `КАЧЕСТВО ПОДСКАЗОК: ${v}`));

    const result = solveLevel(level);
    if (result.status !== 'PROVEN_UNIQUE') {
      problems.push(`РЕШЕНИЕ: ${result.status}`);
    }

    if (problems.length > 0) {
      failed = true;
      console.error(`FAIL  ${label}`);
      for (const p of problems) console.error(`  - ${p}`);
    } else {
      console.log(`OK    ${label}`);
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
