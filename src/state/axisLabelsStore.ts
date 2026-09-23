import { create } from 'zustand';

const STORAGE_KEY = 'sledoku:axis-labels';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface AxisLabelsStore {
  axisLabels: boolean;
  /** Переключить подписи рядов/столбцов (сохраняется до следующего переключения). */
  toggle: () => void;
}

export const useAxisLabelsStore = create<AxisLabelsStore>((set, get) => ({
  axisLabels: readStored(),
  toggle: () => {
    const axisLabels = !get().axisLabels;
    try {
      localStorage.setItem(STORAGE_KEY, axisLabels ? '1' : '0');
    } catch {
      // localStorage недоступен — режим просто не переживёт перезагрузку
    }
    set({ axisLabels });
  },
}));
