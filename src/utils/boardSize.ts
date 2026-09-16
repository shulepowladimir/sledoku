import type { Level } from '../types/level';

/** Нестандартная (не-квадратная) доска: cols задан и отличается от size (10×11, 11×10…). */
export function isCustomBoard(level: Level): boolean {
  return level.cols != null && level.cols !== level.size;
}

/**
 * Лейбл единой категории нестандартных досок в меню и статистике. Сегодня это
 * карты «десять на одиннадцать» в обеих ориентациях (гонки 10×11, паркинг 11×10);
 * будущие «особенные» карты также складываются сюда.
 */
export const CUSTOM_BOARD_LABEL = '10×11';

/**
 * Ключ сортировки уровней: нестандартные доски встают сразу после квадратных
 * уровней своего меньшего измерения (10×11 и 11×10 — между 10×10 и 11×11),
 * внутри ключа порядок хронологический (стабильная сортировка).
 */
export function boardSortKey(level: Level): number {
  return isCustomBoard(level) ? Math.min(level.size, level.cols!) + 0.5 : level.size;
}
