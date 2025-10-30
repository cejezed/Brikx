'use client';

import { create } from 'zustand';
import type { ChapterKey } from '@/types/wizard';

interface UIState {
  currentChapter: ChapterKey;
  focusedField?: string; // format: "chapter:fieldId"
  isLoading: boolean;
  
  setCurrentChapter: (ch: ChapterKey) => void;
  setFocusedField: (field?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useUiStore = create<UIState>((set) => ({
  currentChapter: 'basis',
  focusedField: undefined,
  isLoading: false,
  
  setCurrentChapter: (ch) => set({ currentChapter: ch }),
  setFocusedField: (field) => set({ focusedField: field }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));