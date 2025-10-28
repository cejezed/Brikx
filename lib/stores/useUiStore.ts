// lib/stores/useUiStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusedField = {
  chapter: string;   // bv. "basis" | "ruimtes" | ...
  fieldId: string;   // bv. "budget" | "oppervlakte" | ...
} | null;

type UiState = {
  focusedField: FocusedField;
  setFocusedField: (f: FocusedField) => void;
  resetFocusedField: () => void;

  currentChapter: string | null;
  setCurrentChapter: (c: string | null) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      focusedField: null,
      setFocusedField: (f) => set({ focusedField: f }),
      resetFocusedField: () => set({ focusedField: null }),

      currentChapter: null,
      setCurrentChapter: (c) => set({ currentChapter: c }),
    }),
    {
      name: "brikx-ui-store", // localStorage key
      partialize: (s) => ({
        focusedField: s.focusedField,
        currentChapter: s.currentChapter,
      }),
    }
  )
);
