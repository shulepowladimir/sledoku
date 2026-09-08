import { create } from 'zustand';

const STORAGE_KEY = 'sledoku:noir';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function applyBodyClass(noir: boolean) {
  document.body.classList.toggle('noir', noir);
}

interface NoirStore {
  noir: boolean;
  /** Переключить нуар-режим (сохраняется до следующего переключения). */
  toggle: () => void;
}

export const useNoirStore = create<NoirStore>((set, get) => ({
  noir: readStored(),
  toggle: () => {
    const noir = !get().noir;
    try {
      localStorage.setItem(STORAGE_KEY, noir ? '1' : '0');
    } catch {
      // localStorage недоступен — режим просто не переживёт перезагрузку
    }
    applyBodyClass(noir);
    set({ noir });
  },
}));

// Применяем сохранённый режим сразу, до первого рендера — без «вспышки цвета».
applyBodyClass(useNoirStore.getState().noir);
