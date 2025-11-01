// /lib/stores/useWizardState.ts
"use client";

import { create } from "zustand";
import type {
  WizardState as WizardStateType,
  TriageData,
  ChapterKey,
  PatchEvent,
  PatchOperation,
} from "@/types/chat";

type ChapterDelta = {
  path: string;
  operation: PatchOperation;
  value?: any;
};

type Store = WizardStateType & {
  // triage
  setTriage: (patch: Partial<TriageData>) => void;
  patchTriage: (patch: Partial<TriageData>) => void;

  // chapter navigation
  goToChapter: (ch: ChapterKey) => void;

  // chapter writers
  setChapterAnswer: (chapter: ChapterKey, value: any) => void;
  /**
   * Overloads:
   *  - patchChapterAnswer(chapter, { path, operation, value })  // fine-grained delta
   *  - patchChapterAnswer(chapter, { foo:1, bar:2 })            // merge object into chapter
   */
  patchChapterAnswer: (chapter: ChapterKey, delta: ChapterDelta | Record<string, any>) => void;

  // budget helpers
  getBudgetValue: () => number | undefined;
  setBudgetValue: (v: number | null | undefined) => void;

  // safety
  ensureSafety: () => void;

  // UI
  setShowExportModal: (open: boolean) => void;

  // server SSE
  applyPatch?: (p: PatchEvent) => void;

  // optional: chapter flow (some UIs read it defensively)
  chapterFlow?: ChapterKey[];
};

function bump(v?: number) {
  return (v ?? 0) + 1;
}

function ensureChapterShape(obj: any, key: string) {
  if (!obj[key]) {
    obj[key] =
      key === "ruimtes"
        ? []
        : typeof obj[key] === "object" && obj[key] !== null
        ? obj[key]
        : {};
  }
  return obj[key];
}

function applyDeltaToEntry(entry: any, delta: ChapterDelta) {
  const { operation: op, path, value } = delta;
  const p = path ?? "";

  if (op === "add") {
    if (p === "" && Array.isArray(entry)) {
      entry.push(value);
      return;
    }
    if (p.startsWith("byName:")) {
      const [selector, rest] = p.split(".", 2);
      const name = selector.slice("byName:".length);
      const list = Array.isArray(entry) ? entry : [];
      const item = list.find((r: any) => r?.name === name);
      if (item) {
        const field = (rest ?? "").trim();
        if (!field) return;
        if (Array.isArray((item as any)[field])) {
          (item as any)[field].push(value);
        } else if ((item as any)[field] === undefined) {
          (item as any)[field] = [value];
        } else {
          (item as any)[field] = [(item as any)[field], value].filter((x) => x !== undefined);
        }
      }
      return;
    }
  } else if (op === "set" || op === "merge") {
    if (p) {
      const current = (entry as any)[p];
      (entry as any)[p] = op === "set" ? value : { ...(current ?? {}), ...(value ?? {}) };
      return;
    }
  } else if (op === "remove") {
    if (p && (entry as any)[p] !== undefined) {
      delete (entry as any)[p];
      return;
    }
  }
}

export const useWizardState = create<Store>((set, get) => ({
  // state
  stateVersion: 1,
  chapterAnswers: {},
  triage: {
    projectType: undefined,
    projectSize: undefined,
    urgency: undefined,
    budget: undefined,
    intent: [],
    currentChapter: undefined,
  },
  currentChapter: undefined,
  focusedField: undefined,
  showExportModal: false,

  // triage
  setTriage: (patch) =>
    set((s) => {
      const nextIntent = patch.intent ?? s.triage?.intent ?? [];
      return {
        triage: { ...(s.triage ?? {}), ...patch, intent: Array.isArray(nextIntent) ? nextIntent : [] },
        stateVersion: bump(s.stateVersion),
      };
    }),

  patchTriage: (patch) =>
    set((s) => {
      const base = s.triage ?? { intent: [] as string[] };
      const nextIntent = patch.intent ?? base.intent ?? [];
      return {
        triage: { ...base, ...patch, intent: Array.isArray(nextIntent) ? nextIntent : [] },
        stateVersion: bump(s.stateVersion),
      };
    }),

  // navigation
  goToChapter: (ch) =>
    set((s) => ({
      currentChapter: ch,
      triage: { ...(s.triage ?? {}), currentChapter: ch },
      stateVersion: bump(s.stateVersion),
    })),

  // writers
  setChapterAnswer: (chapter, value) =>
    set((s) => ({
      chapterAnswers: { ...(s.chapterAnswers ?? {}), [chapter]: value },
      stateVersion: bump(s.stateVersion),
    })),

  patchChapterAnswer: (chapter, delta) =>
    set((s) => {
      const next = { ...s.chapterAnswers };
      const key = chapter as string;
      const entry = ensureChapterShape(next, key);

      // Overload detectie: als het geen delta-object is met 'operation', beschouw als MERGE
      if (typeof (delta as any)?.operation !== "string") {
        Object.assign(entry, delta);
      } else {
        applyDeltaToEntry(entry, delta as ChapterDelta);
      }

      next[key] = entry;
      return { chapterAnswers: next, stateVersion: bump(s.stateVersion) };
    }),

  // budget helpers
  getBudgetValue: () => {
    const triage = get().triage;
    const budget = triage?.budget;
    return typeof budget === "number" && Number.isFinite(budget) ? budget : undefined;
  },

  setBudgetValue: (v) =>
    set((s) => {
      const budget = typeof v === "number" && Number.isFinite(v) ? v : undefined;
      const base = s.triage ?? { intent: [] as string[] };
      return { triage: { ...base, budget }, stateVersion: bump(s.stateVersion) };
    }),

  // safety
  ensureSafety: () =>
    set((s) => {
      const triage = s.triage ?? {};
      const safeIntent = Array.isArray(triage.intent) ? triage.intent : [];
      return { triage: { ...triage, intent: safeIntent } };
    }),

  // UI
  setShowExportModal: (open) => set((s) => ({ showExportModal: !!open, stateVersion: bump(s.stateVersion) })),

  // server SSE patch
  applyPatch: (p) =>
    set((s) => {
      const next = { ...s.chapterAnswers };
      const key = p.chapter as string;
      const entry = ensureChapterShape(next, key);
      applyDeltaToEntry(entry, {
        path: p.delta.path ?? "",
        operation: p.delta.operation,
        value: p.delta.value,
      });
      next[key] = entry;
      return { chapterAnswers: next, stateVersion: bump(s.stateVersion) };
    }),
}));

export type { ChapterKey } from "@/types/chat";
const store = useWizardState;
export default store;
