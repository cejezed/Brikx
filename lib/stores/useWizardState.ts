// /lib/stores/useWizardState.ts
// ============================================================================
// BRIKX Build v3.1 – Wizard Store (Shared Brain)
// - Gebaseerd op WizardState uit types/project.ts
// - Ondersteunt alleen "set" | "append" | "remove"
// - Volledig type-gedreven en persistente state
// ============================================================================

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ChapterKey,
  ChapterData,
  PatchDelta,
  TriageData,
  WizardState as CoreWizardState,
} from "@/types/project";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";

type WizardState = CoreWizardState;
type FocusKey = `${string}:${string}`;

// ----------------------------------------------------------------------------
// ACTIES / INTERFACE
// ----------------------------------------------------------------------------

interface WizardActions {
  // Navigatie & flow
  setChapterFlow: (flow: ChapterKey[]) => void;
  setCurrentChapter: (chapter: ChapterKey) => void;
  goToChapter: (chapter: ChapterKey) => void;

  // Data-mutaties
  updateChapterData: <K extends ChapterKey>(
    chapter: K,
    updater: (prev: ChapterData<K>) => ChapterData<K>
  ) => void;
  applyPatch: (chapter: ChapterKey, delta: PatchDelta) => void;

  // UI-helpers
  setFocusedField: (key: FocusKey | null) => void;
  setShowExportModal: (open: boolean) => void;

  // Mode (Preview/Premium)
  setMode: (mode: "PREVIEW" | "PREMIUM") => void;

  // AI-triage
  setTriage: (triage?: TriageData) => void;

  // Budget-helpers
  getBudgetValue: () => number | undefined;
  setBudgetValue: (amount?: number) => void;

  // Onderhoud
  ensureSafety: () => void;
  reset: () => void;
}

export type WizardStore = WizardState & WizardActions;

// ----------------------------------------------------------------------------
// CONSTANTEN & HELPERS
// ----------------------------------------------------------------------------

const VALID_CHAPTERS: ChapterKey[] = [
  "basis",
  "ruimtes",
  "wensen",
  "budget",
  "techniek",
  "duurzaam",
  "risico",
];

// Delta-transformer (flat paths)
function transformWithDelta(
  prev: Record<string, any>,
  delta: PatchDelta
): Record<string, any> {
  const { path, operation, value } = delta;

  if (operation === "set") {
    return { ...prev, [path]: value };
  }

  if (operation === "append") {
    const current = prev[path];
    if (!Array.isArray(current)) {
      return { ...prev, [path]: [value] };
    }
    return { ...prev, [path]: [...current, value] };
  }

  if (operation === "remove") {
    const current = prev[path];
    if (!Array.isArray(current) || typeof value?.index !== "number") {
      return prev;
    }
    return {
      ...prev,
      [path]: current.filter((_: unknown, i: number) => i !== value.index),
    };
  }

  return prev;
}

// ----------------------------------------------------------------------------
// STORE
// ----------------------------------------------------------------------------

export const useWizardState = create<WizardStore>()(
  persist(
    (set, get) => ({
      // INITIËLE STATE --------------------------------------------------------
      stateVersion: 1,
      chapterAnswers: {},
      chapterFlow: [],
      currentChapter: "basis",
      focusedField: null,
      showExportModal: false,
      mode: "PREVIEW",
      triage: undefined,

      // FLOW -----------------------------------------------------------------
      setChapterFlow: (flow) =>
        set(() => ({
          chapterFlow: Array.isArray(flow) ? flow : [],
        })),

      setCurrentChapter: (chapter) =>
        set((state) => ({
          currentChapter: chapter,
          stateVersion: state.stateVersion + 1,
        })),

      goToChapter: (chapter) => {
        const { chapterFlow } = get();
        if (!Array.isArray(chapterFlow) || !chapterFlow.includes(chapter)) {
          console.warn(`[WizardState] Navigating to non-flow chapter: ${chapter}`);
        }
        set((state) => ({
          currentChapter: chapter,
          stateVersion: state.stateVersion + 1,
        }));
      },

      // DATA-UPDATER ----------------------------------------------------------
      updateChapterData: (chapter, updater) =>
        set((state) => {
          const prev =
            (state.chapterAnswers[chapter] as ChapterData<typeof chapter>) ||
            ({} as ChapterData<typeof chapter>);
          const next = updater(prev);

          if (!validateChapter(chapter, next)) {
            console.warn(`[WizardState] updateChapterData rejected for ${chapter}`, next);
            return state;
          }

          return {
            chapterAnswers: {
              ...state.chapterAnswers,
              [chapter]: next,
            },
            stateVersion: state.stateVersion + 1,
          };
        }),

      // PATCH-HANDLER ---------------------------------------------------------
      applyPatch: (chapter, delta) =>
        set((state) => {
          const prev = (state.chapterAnswers[chapter] as Record<string, any>) || {};
          const next = transformWithDelta(prev, delta);

          if (!validateChapter(chapter, next)) {
            console.warn(`[WizardState] applyPatch rejected for ${chapter}`, delta, next);
            return state;
          }

          return {
            chapterAnswers: {
              ...state.chapterAnswers,
              [chapter]: next,
            },
            stateVersion: state.stateVersion + 1,
          };
        }),

      // UI-HELPERS ------------------------------------------------------------
      setFocusedField: (key) =>
        set((state) => ({
          focusedField: key ?? null,
          stateVersion: state.stateVersion + 1,
        })),

      setShowExportModal: (open) =>
        set((state) => ({
          showExportModal: open,
          stateVersion: state.stateVersion + 1,
        })),

      // MODE -----------------------------------------------------------------
      setMode: (mode) =>
        set((state) => ({
          mode,
          stateVersion: state.stateVersion + 1,
        })),

      // TRIAGE ---------------------------------------------------------------
      setTriage: (triage) =>
        set((state) => ({
          triage,
          stateVersion: state.stateVersion + 1,
        })),

      // BUDGET ---------------------------------------------------------------
      getBudgetValue: () => {
        const s = get();
        return s.chapterAnswers?.budget?.budgetTotaal;
      },

      setBudgetValue: (amount) =>
        set((state) => {
          const prev = state.chapterAnswers.budget ?? {};
          const next = {
            ...prev,
            budgetTotaal: typeof amount === "number" ? amount : undefined,
          };

          if (!validateChapter("budget", next)) {
            console.warn("[WizardState] setBudgetValue rejected", next);
            return state;
          }

          return {
            chapterAnswers: {
              ...state.chapterAnswers,
              budget: next,
            },
            stateVersion: state.stateVersion + 1,
          };
        }),

      // SAFETY ---------------------------------------------------------------
      ensureSafety: () => {
        const s = get();
        const patch: Partial<WizardState> = {};

        if (!s.chapterAnswers || typeof s.chapterAnswers !== "object") {
          patch.chapterAnswers = {};
        }
        if (!Array.isArray(s.chapterFlow)) {
          patch.chapterFlow = [];
        }
        if (s.currentChapter && !VALID_CHAPTERS.includes(s.currentChapter)) {
          patch.currentChapter = "basis";
        }
        if (s.focusedField === undefined || s.focusedField === "") {
          patch.focusedField = null;
        }
        if (!s.mode) {
          patch.mode = "PREVIEW";
        }

        if (Object.keys(patch).length > 0) {
          set(patch as WizardState);
        }
      },

      // RESET ---------------------------------------------------------------
      reset: () =>
        set(() => ({
          stateVersion: 1,
          chapterAnswers: {},
          chapterFlow: [],
          currentChapter: "basis",
          focusedField: null,
          showExportModal: false,
          mode: "PREVIEW",
          triage: undefined,
        })),
    }),
    {
      name: "brikx-wizard-state",
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        stateVersion: state.stateVersion,
        chapterAnswers: state.chapterAnswers,
        chapterFlow: state.chapterFlow,
        currentChapter: state.currentChapter,
        focusedField: state.focusedField ?? null,
        showExportModal: state.showExportModal ?? false,
        mode: state.mode ?? "PREVIEW",
        triage: state.triage ?? undefined,
      }),
    }
  )
);

export default useWizardState;
