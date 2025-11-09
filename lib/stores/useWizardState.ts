// /lib/stores/useWizardState.ts

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChapterKey, TriageData, WizardState } from "@/types/chat";

interface WizardActions {
  setChapterFlow: (flow: ChapterKey[]) => void;
  setCurrentChapter: (chapter: ChapterKey) => void;
  goToChapter: (chapter: ChapterKey) => void;

  patchTriage: (data: Partial<TriageData>) => void;

  /**
   * Flexibele writer:
   * - patchChapterAnswer("basis", { projectNaam: "..." })
   * - patchChapterAnswer("basis", "projectNaam", "...")
   */
  patchChapterAnswer: (...args: any[]) => void;

  setFocusedField: (field?: string) => void;

  setShowExportModal: (open: boolean) => void;

  getBudgetValue: () => number | undefined;
  setBudgetValue: (amount?: number) => void;

  ensureSafety: () => void;
  reset: () => void;
}

export type WizardStore = WizardState & WizardActions;

// We maken één store instantie en exporteren die zowel named als default,
// zodat ALLE bestaande imports blijven werken.
const store = create<WizardStore>()(
  persist(
    (set, get) => ({
      // ─────────────────────────
      // Initial state
      // ─────────────────────────
      stateVersion: 1,
      chapterAnswers: {},
      triage: {},
      currentChapter: undefined,
      chapterFlow: [],
      focusedField: undefined,
      showExportModal: false,

      // ─────────────────────────
      // Flow & hoofdstukken
      // ─────────────────────────
      setChapterFlow: (flow) =>
        set(() => ({
          chapterFlow: Array.isArray(flow) ? flow : [],
        })),

      setCurrentChapter: (chapter) =>
        set((state) => ({
          currentChapter: chapter,
          triage: {
            ...(state.triage ?? {}),
            currentChapter: chapter,
          },
          stateVersion: state.stateVersion + 1,
        })),

      goToChapter: (chapter) => {
        const { chapterFlow } = get();
        if (Array.isArray(chapterFlow) && chapterFlow.length > 0) {
          if (!chapterFlow.includes(chapter)) {
            // Flow-gate: als niet in flow, niet navigeren.
            return;
          }
        }
        get().setCurrentChapter(chapter);
      },

      // ─────────────────────────
      // Triage
      // ─────────────────────────
      patchTriage: (data) =>
        set((state) => {
          const next: TriageData = {
            ...(state.triage ?? {}),
            ...data,
          };
          return {
            triage: next,
            currentChapter: next.currentChapter ?? state.currentChapter,
            stateVersion: state.stateVersion + 1,
          };
        }),

      // ─────────────────────────
      // Antwoorden
      // ─────────────────────────
      patchChapterAnswer: (...args: any[]) =>
        set((state) => {
          const [chapter, a, b] = args;
          if (!chapter || typeof chapter !== "string") return state;

          const current = state.chapterAnswers ?? {};
          const prev = current[chapter] ?? {};

          let patch: Record<string, any> = {};

          if (typeof a === "string" && args.length === 3) {
            patch = { [a]: b };
          } else if (a && typeof a === "object") {
            patch = a;
          } else {
            return state;
          }

          return {
            chapterAnswers: {
              ...current,
              [chapter]: {
                ...prev,
                ...patch,
              },
            },
            stateVersion: state.stateVersion + 1,
          };
        }),

      // ─────────────────────────
      // UI helpers
      // ─────────────────────────
      setFocusedField: (field) =>
        set((state) => ({
          focusedField: field,
          stateVersion: state.stateVersion + 1,
        })),

      setShowExportModal: (open) =>
        set((state) => ({
          showExportModal: open,
          stateVersion: state.stateVersion + 1,
        })),

      // ─────────────────────────
      // Budget helpers
      // ─────────────────────────
      getBudgetValue: () => {
        const { triage } = get();
        return triage?.budget;
      },

      setBudgetValue: (amount) =>
        set((state) => ({
          triage: {
            ...(state.triage ?? {}),
            budget: typeof amount === "number" ? amount : undefined,
          },
          stateVersion: state.stateVersion + 1,
        })),

      // ─────────────────────────
      // Safety / SSR / Hydration guards
      // ─────────────────────────
      ensureSafety: () => {
        const s = get();
        const patch: Partial<WizardState> = {};

        if (!s.triage) patch.triage = {};
        if (!s.chapterAnswers) patch.chapterAnswers = {};
        if (!Array.isArray(s.chapterFlow)) patch.chapterFlow = [];
        if (typeof s.stateVersion !== "number") patch.stateVersion = 1;

        if (Object.keys(patch).length > 0) {
          set(patch as any);
        }
      },

      // ─────────────────────────
      // Reset volledige wizard
      // ─────────────────────────
      reset: () =>
        set(() => ({
          stateVersion: 1,
          chapterAnswers: {},
          triage: {},
          currentChapter: undefined,
          chapterFlow: [],
          focusedField: undefined,
          showExportModal: false,
        })),
    }),
    {
      name: "brikx-wizard-state",
      version: 1,
    }
  )
);

// Named + default export voor maximale compatibiliteit
export const useWizardState = store;
export default store;
