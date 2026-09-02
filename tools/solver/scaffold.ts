import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface ScaffoldOptions {
  targetCounts?: Record<string, number>;
  maxAttempts?: number;
}

export interface ScaffoldResult {
  colByRow: number[];
  roomByRow: string[];
  roomCounts: Record<string, number>;
  victimRoomId: string;
}

function shuffledColumns(size: number): number[] {
  const cols = Array.from({ length: size }, (_, i) => i);
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }
  return cols;
}

/**
 * Randomly samples row→col permutations (AllDifferent by construction — one shuffled column
 * per row) until one lands exactly one room at exactly 2 occupants (the victim's room), or an
 * optional exact target distribution is met. Random sampling instead of exhaustive search: for
 * typical level sizes (6-10) this converges in a handful of attempts, well under maxAttempts.
 * A permutation that places anyone on a cut-out cell (roomForCell returns null) is rejected.
 */
export function scaffoldPermutation(
  size: number,
  roomForCell: (row: number, col: number) => string | null,
  options: ScaffoldOptions = {},
): ScaffoldResult | null {
  const maxAttempts = options.maxAttempts ?? 50_000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const colByRow = shuffledColumns(size);
    if (colByRow.some((col, row) => roomForCell(row, col) === null)) continue;
    const roomByRow = colByRow.map((col, row) => roomForCell(row, col) as string);

    const roomCounts: Record<string, number> = {};
    for (const room of roomByRow) roomCounts[room] = (roomCounts[room] ?? 0) + 1;
    const twoOccupantRooms = Object.entries(roomCounts).filter(([, count]) => count === 2);

    if (options.targetCounts) {
      const targetEntries = Object.entries(options.targetCounts);
      const matchesTarget =
        targetEntries.length === Object.keys(roomCounts).length &&
        targetEntries.every(([room, count]) => roomCounts[room] === count);
      if (!matchesTarget) continue;
    } else if (twoOccupantRooms.length !== 1) {
      continue;
    }

    // With an explicit targetCounts, more than one room may legitimately land at count 2 (this
    // happens in shipped levels too, e.g. mall's electronics/cinema); pick the first as the
    // reported victim-room candidate rather than requiring uniqueness in that path.
    const victimRoomId = twoOccupantRooms[0]?.[0] ?? '';
    return { colByRow, roomByRow, roomCounts, victimRoomId };
  }

  return null;
}

function parseTargetCounts(arg: string | undefined): Record<string, number> | undefined {
  if (!arg) return undefined;
  const targetCounts: Record<string, number> = {};
  for (const pair of arg.split(',')) {
    const [room, count] = pair.split(':');
    targetCounts[room] = Number(count);
  }
  return targetCounts;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Использование: npm run scaffold-level -- <путь-к-файлу-уровня> [комната:число,комната:число]');
    console.error('Файл уровня должен экспортировать "size" (number) и "roomForCell" ((row, col) => RoomId).');
    process.exit(1);
  }

  const absPath = resolve(process.cwd(), arg);
  const mod = (await import(pathToFileURL(absPath).href)) as Record<string, unknown>;
  const size = mod.size;
  const roomForCell = mod.roomForCell;
  if (typeof size !== 'number' || typeof roomForCell !== 'function') {
    console.error(`Файл ${arg} должен экспортировать "size" (number) и "roomForCell" ((row, col) => RoomId).`);
    process.exit(1);
  }

  const targetCounts = parseTargetCounts(process.argv[3]);
  const result = scaffoldPermutation(size, roomForCell as (row: number, col: number) => string | null, {
    targetCounts,
  });

  if (!result) {
    console.error('Не удалось найти перестановку с нужным распределением по комнатам в пределах бюджета попыток.');
    process.exit(1);
  }

  console.log(`Перестановка row → col: [${result.colByRow.join(', ')}]`);
  result.roomByRow.forEach((room, row) => {
    console.log(`  ряд ${row} → столбец ${result.colByRow[row]} → комната "${room}"`);
  });
  console.log(`Число людей по комнатам: ${JSON.stringify(result.roomCounts)}`);
  console.log(`Комната жертвы/убийцы (ровно 2 человека): "${result.victimRoomId}"`);
}

main();
