// lib/stores/useUiStore.ts
'use client';

import { create } from 'zustand';

type FocusKey = `${string}:${string}` | null;

interface UiState {
  focusedField: FocusKey;
  setFocusedField: (k: FocusKey) => void;
}

function createUiStore() {
  return create<UiState>()((set) => ({
    focusedField: null,
    setFocusedField: (k) => set({ focusedField: k }),
  }));
}

const g = globalThis as any;
if (!g.__BRIKX_UI_STORE__) {
  g.__BRIKX_UI_STORE__ = createUiStore();
}
export const useUiStore = g.__BRIKX_UI_STORE__ as ReturnType<typeof createUiStore>;
export default useUiStore;
