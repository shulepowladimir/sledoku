// Лёгкая копия алгоритма из tools/solver/scaffold.ts, адаптированная для браузера
// (там есть импорты node:path/node:url, которые нельзя собрать в клиентский бандл).
// Логика идентична: случайно перебираем перестановки row→col (по построению они
// удовлетворяют "все разные" по ряду и столбцу), пока не найдём такую, где ровно
// одна комната содержит ровно 2 человек (комната жертвы/убийцы).

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

export function scaffoldPermutation(
  size: number,
  roomForCell: (row: number, col: number) => string | null,
  isLegalCell: (row: number, col: number) => boolean = () => true,
  maxAttempts = 50_000,
): ScaffoldResult | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const colByRow = shuffledColumns(size);
    if (colByRow.some((col, row) => roomForCell(row, col) === null || !isLegalCell(row, col))) continue;
    const roomByRow = colByRow.map((col, row) => roomForCell(row, col) as string);

    const roomCounts: Record<string, number> = {};
    for (const room of roomByRow) roomCounts[room] = (roomCounts[room] ?? 0) + 1;
    const twoOccupantRooms = Object.entries(roomCounts).filter(([, count]) => count === 2);

    if (twoOccupantRooms.length !== 1) continue;

    const victimRoomId = twoOccupantRooms[0]?.[0] ?? '';
    return { colByRow, roomByRow, roomCounts, victimRoomId };
  }
  return null;
}
