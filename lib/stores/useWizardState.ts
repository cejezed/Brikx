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
import { handleUserStateChange } from "@/lib/ai/ArchitectAutoTurnRunner";

type WizardState = CoreWizardState;
type FocusKey = `${string}:${string}`;

// ----------------------------------------------------------------------------
// ACTIES / INTERFACE
// ----------------------------------------------------------------------------

// ✅ v3.7: Snapshot voor undo functionaliteit
type StateSnapshot = {
  chapterAnswers: CoreWizardState["chapterAnswers"];
  stateVersion: number;
};

interface WizardActions {
  // Navigatie & flow
  setChapterFlow: (flow: ChapterKey[]) => void;
  setCurrentChapter: (chapter: ChapterKey, source?: "user" | "ai" | "system") => void;
  goToChapter: (chapter: ChapterKey, source?: "user" | "ai" | "system") => void;

  // Data-mutaties
  updateChapterData: <K extends ChapterKey>(
    chapter: K,
    updater: (prev: ChapterData<K>) => ChapterData<K>
  ) => void;
  applyPatch: (chapter: ChapterKey, delta: PatchDelta, source?: "user" | "ai" | "system") => void;

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

  // ✅ v3.7: Undo laatste wijziging
  undo: () => void;

  // Internal: snapshot management (niet direct aanroepen)
  _lastSnapshot?: StateSnapshot;
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

const snapshotState = (state: WizardStore): WizardState => ({
  stateVersion: state.stateVersion,
  chapterAnswers: state.chapterAnswers,
  chapterFlow: state.chapterFlow,
  currentChapter: state.currentChapter,
  focusedField: state.focusedField,
  showExportModal: state.showExportModal,
  mode: (state as any).mode ?? "PREVIEW",
  triage: (state as any).triage,
  chatSession: state.chatSession,
});

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
      chatSession: { turnCount: 0 },

      // FLOW -----------------------------------------------------------------
      setChapterFlow: (flow) =>
        set(() => ({
          chapterFlow: Array.isArray(flow) ? flow : [],
        })),

      setCurrentChapter: (chapter, source: "user" | "ai" | "system" = "user") => {
        const prev = snapshotState(get() as WizardStore);
        set((state) => ({
          currentChapter: chapter,
          stateVersion: state.stateVersion + 1,
        }));
        const next = snapshotState(get() as WizardStore);
        if (source === "user") {
          void handleUserStateChange(prev, next, {
            mode: "user",
            lastChangeSource: "user",
            projectId: (next as any).projectMeta?.projectId,
            userId: (next as any).projectMeta?.userId,
          });
        }
      },

      goToChapter: (chapter, source: "user" | "ai" | "system" = "user") => {
        const { chapterFlow } = get();
        if (!Array.isArray(chapterFlow) || !chapterFlow.includes(chapter)) {
          console.warn(`[WizardState] Navigating to non-flow chapter: ${chapter}`);
        }
        const prev = snapshotState(get() as WizardStore);
        set((state) => ({
          currentChapter: chapter,
          stateVersion: state.stateVersion + 1,
        }));
        const next = snapshotState(get() as WizardStore);
        if (source === "user") {
          void handleUserStateChange(prev, next, {
            mode: "user",
            lastChangeSource: "user",
            projectId: (next as any).projectMeta?.projectId,
            userId: (next as any).projectMeta?.userId,
          });
        }
      },

      // DATA-UPDATER ----------------------------------------------------------
      updateChapterData: (chapter, updater) => {
        const prevSnap = snapshotState(get() as WizardStore);
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
        });
        const nextSnap = snapshotState(get() as WizardStore);
        void handleUserStateChange(prevSnap, nextSnap, {
          mode: "user",
          lastChangeSource: "user",
          projectId: (nextSnap as any).projectMeta?.projectId,
          userId: (nextSnap as any).projectMeta?.userId,
        });
      },

      // PATCH-HANDLER ---------------------------------------------------------
      // ✅ v3.7: Slaat snapshot op voor undo functionaliteit
      applyPatch: (chapter, delta, source: "user" | "ai" | "system" = "user") => {
        const prevSnap = snapshotState(get() as WizardStore);
        set((state) => {
          const prev = (state.chapterAnswers[chapter] as Record<string, any>) || {};
          const next = transformWithDelta(prev, delta);

          if (!validateChapter(chapter, next)) {
            console.warn(`[WizardState] applyPatch rejected for ${chapter}`, delta, next);
            return state;
          }

          // ✅ v3.7: Sla huidige state op als snapshot voor undo
          const snapshot: StateSnapshot = {
            chapterAnswers: JSON.parse(JSON.stringify(state.chapterAnswers)),
            stateVersion: state.stateVersion,
          };

          return {
            chapterAnswers: {
              ...state.chapterAnswers,
              [chapter]: next,
            },
            stateVersion: state.stateVersion + 1,
            _lastSnapshot: snapshot,
          };
        });
        if (source === "user") {
          const nextSnap = snapshotState(get() as WizardStore);
          void handleUserStateChange(prevSnap, nextSnap, {
            mode: "user",
            lastChangeSource: "user",
            projectId: (nextSnap as any).projectMeta?.projectId,
            userId: (nextSnap as any).projectMeta?.userId,
          });
          // Proactively prune matching proposals to avoid stale suggestions
          queueMicrotask(() => {
            void import("@/lib/stores/useChatStore").then(({ useChatStore }) => {
              useChatStore
                .getState()
                .pruneProposalsByAppliedPatch({
                  chapter,
                  path: delta?.path,
                  operation: delta?.operation,
                  value: (delta as any)?.value,
                });
            });
          });
        }
      },

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
          chatSession: { turnCount: 0 },
          _lastSnapshot: undefined,
        })),

      // UNDO ----------------------------------------------------------------
      // ✅ v3.7: Herstel de laatste snapshot (één niveau terug)
      undo: () =>
        set((state) => {
          const snapshot = state._lastSnapshot;
          if (!snapshot) {
            console.warn("[WizardState] Geen undo-snapshot beschikbaar");
            return state;
          }

          console.log("[WizardState] Undo uitgevoerd, terug naar versie", snapshot.stateVersion);
          return {
            chapterAnswers: snapshot.chapterAnswers,
            stateVersion: snapshot.stateVersion,
            _lastSnapshot: undefined, // Snapshot gebruikt, wissen
          };
        }),

      // Internal snapshot (niet persistent)
      _lastSnapshot: undefined,
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
        chatSession: state.chatSession ?? { turnCount: 0 },
      }),
    }
  )
);

export default useWizardState;
