'use client';
import { create } from 'zustand';

type FocusKey = `${string}:${string}` | null;

interface UiState {
  focusedField: FocusKey;
  setFocusedField: (k: FocusKey) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  focusedField: null,
  setFocusedField: (k) => set({ focusedField: k }),
}));

export default useUiStore;
