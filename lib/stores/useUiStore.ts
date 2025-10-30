// lib/stores/useUiStore.ts
'use client';

import { create } from 'zustand';
import type { ChapterKey } from '@/types/wizard';

type FocusKey = `${string}:${string}` | null;

interface UiState {
  // Focus management (voor spotlight)
  focusedField: FocusKey;
  setFocusedField: (k: FocusKey) => void;
  
  // Chapter navigation (UI state, separate from data state)
  currentChapter: ChapterKey;
  setCurrentChapter: (ch: ChapterKey) => void;
}

function createUiStore() {
  return create<UiState>()((set) => ({
    // Focus state
    focusedField: null,
    setFocusedField: (k) => set({ focusedField: k }),
    
    // Chapter navigation state
    currentChapter: 'basis',
    setCurrentChapter: (ch) => set({ currentChapter: ch }),
  }));
}

const g = globalThis as any;
if (!g.__BRIKX_UI_STORE__) {
  g.__BRIKX_UI_STORE__ = createUiStore();
}
export const useUiStore = g.__BRIKX_UI_STORE__ as ReturnType<typeof createUiStore>;
export default useUiStore;