// lib/stores/useUiStore.ts - FIXED SSR VERSION
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

// 🆕 FIX: Remove global singleton, just export the hook directly
export const useUiStore = create<UiState>()((set) => ({
  // Focus state
  focusedField: null,
  setFocusedField: (k) => set({ focusedField: k }),
  
  // Chapter navigation state
  currentChapter: 'basis',
  setCurrentChapter: (ch) => set({ currentChapter: ch }),
}));

export default useUiStore;