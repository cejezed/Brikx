// lib/stores/useWizardState.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------
 * Types – afgestemd op jouw hoofdstukken/flow
 * ------------------------------------------------------------------ */
export type ChapterKey =
  | 'basis'
  | 'wensen'
  | 'budget'
  | 'ruimtes'
  | 'techniek'
  | 'duurzaamheid'
  | 'risico'
  | 'preview';

export type Mode = 'preview' | 'premium';
export type Archetype =
  | 'nieuwbouw_woning'
  | 'complete_renovatie'
  | 'bijgebouw'
  | 'verbouwing_zolder'
  | 'hybride_project'
  | null;

export interface TriageState {
  projectType: Archetype | null;
  projectSize?: 'klein' | 'midden' | 'groot' | null;
  intent?: ('architect_start' | 'contractor_quote' | 'scenario_exploration')[];
  urgentie?: 'laag' | 'middel' | 'hoog' | null;
}

export interface WizardState {
  mode: Mode;
  archetype: Archetype;
  triage: TriageState;

  chapterFlow: ChapterKey[];
  currentChapter: ChapterKey;

  /** Vrije shape per chapter (we normaliseren op bekende paden) */
  chapterAnswers: Record<string, any>;

  /* --- Router & mode --- */
  setMode: (m: Mode) => void;
  setArchetype: (a: Archetype) => void;
  patchTriage: (patch: Partial<TriageState>) => void;
  goToChapter: (id: ChapterKey) => void;

  /* --- Antwoorden API (nieuw) --- */
  setChapterAnswer: (key: ChapterKey, value: any) => void;
  patchChapterAnswer: (key: ChapterKey, patch: Record<string, any>) => void;

  /* --- Legacy/compat (meervoud) --- */
  setChapterAnswers: {
    (all: Record<string, any>): void;           // hele object
    (key: ChapterKey, value: any): void;        // per chapter
  };
  patchChapterAnswers: (key: ChapterKey, patch: Record<string, any>) => void;

  /* --- Budget helpers (synced) --- */
  getBudgetValue: () => number | null;
  setBudgetValue: (val: number | null) => void;

  /* --- Safety & reset --- */
  ensureSafety: () => void;
  resetAll: () => void;
}

/* ------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------ */
const FLOW_DEFAULT: ChapterKey[] = [
  'basis',
  'wensen',
  'budget',
  'ruimtes',
  'techniek',
  'duurzaamheid',
  'risico',
  'preview',
];

// Bewuste defaults zodat we jouw shapes niet “dichtsmeren”
const defaultAnswers = (): Record<string, any> => ({
  basis: {
    // belangrijk: oude/bestaande componenten gebruiken dit pad
    budgetIndicatie: null as number | null,
  },
  wensen: [],
  budget: {
    budgetTotaal: null as number | null,
    bandbreedte: null as [number, number] | null,
  },
  ruimtes: [],
  techniek: {},
  duurzaamheid: {},
  risico: {},
  preview: {},
});

/* ------------------------------------------------------------------
 * Normalisatie + Budget Sync
 * ------------------------------------------------------------------ */

/** Normaliseer bekende paden (arrays/objects) */
function normalizeAnswers(a: any): Record<string, any> {
  const d = defaultAnswers();
  const out: Record<string, any> = { ...d, ...(a ?? {}) };

  // Arrays borgen
  if (!Array.isArray(out.wensen)) out.wensen = [];
  if (!Array.isArray(out.ruimtes)) out.ruimtes = [];

  // Objecten borgen
  for (const k of ['basis', 'budget', 'techniek', 'duurzaamheid', 'risico', 'preview'] as const) {
    if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = d[k];
  }

  // Bekende velden borgen
  if (typeof out.basis.budgetIndicatie !== 'number' && out.basis.budgetIndicatie !== null) {
    out.basis.budgetIndicatie = d.basis.budgetIndicatie;
  }
  if (
    (typeof out.budget.budgetTotaal !== 'number' && out.budget.budgetTotaal !== null) ||
    Number.isNaN(out.budget.budgetTotaal)
  ) {
    out.budget.budgetTotaal = d.budget.budgetTotaal;
  }
  if (!Array.isArray(out.budget.bandbreedte) && out.budget.bandbreedte !== null) {
    out.budget.bandbreedte = d.budget.bandbreedte;
  }

  // Budget sync bij normalisatie
  return syncBudget(out);
}

/** Centrale budget-sync: basis.budgetIndicatie ↔ budget.budgetTotaal */
function syncBudget(answers: Record<string, any>): Record<string, any> {
  const a = { ...answers };
  const basisVal = a?.basis?.budgetIndicatie;
  const budVal = a?.budget?.budgetTotaal;

  // Kies gezaghebbende bron (als één van beide gezet is)
  const resolved =
    typeof budVal === 'number'
      ? budVal
      : typeof basisVal === 'number'
      ? basisVal
      : (budVal ?? basisVal ?? null);

  // Schrijf naar beide paden (alleen als er een waarde is of expliciet null)
  if (resolved !== undefined) {
    a.basis = { ...(a.basis ?? {}), budgetIndicatie: resolved };
    a.budget = { ...(a.budget ?? {}), budgetTotaal: resolved };
  }
  return a;
}

/* ------------------------------------------------------------------
 * Store
 * ------------------------------------------------------------------ */
export const useWizardState = create<WizardState>()(
  persist(
    (set, get) => ({
      mode: 'preview',
      archetype: null,
      triage: { projectType: null, projectSize: null, intent: [], urgentie: null },

      chapterFlow: FLOW_DEFAULT,
      currentChapter: 'basis',

      chapterAnswers: defaultAnswers(),

      setMode: (m) => set({ mode: m }),
      setArchetype: (a) => set({ archetype: a }),
      patchTriage: (patch) => set((s) => ({ triage: { ...s.triage, ...patch } })),

      goToChapter: (id) =>
        set((s) => {
          const flow = Array.isArray(s.chapterFlow) && s.chapterFlow.length ? s.chapterFlow : FLOW_DEFAULT;
          return { currentChapter: flow.includes(id) ? id : s.currentChapter };
        }),

      /* ----------------- Nieuwe API ----------------- */
      setChapterAnswer: (key, value) =>
        set((s) => {
          const next = { ...s.chapterAnswers, [key]: value };
          // Budget sync als basis of budget wordt gezet
          if (key === 'basis' || key === 'budget') return { chapterAnswers: syncBudget(next) };
          return { chapterAnswers: next };
        }),

      patchChapterAnswer: (key, patch) =>
        set((s) => {
          const prev = (s.chapterAnswers ?? {})[key] ?? {};
          const next = { ...s.chapterAnswers, [key]: { ...prev, ...(patch ?? {}) } };
          if (key === 'basis' || key === 'budget') return { chapterAnswers: syncBudget(next) };
          return { chapterAnswers: next };
        }),

      /* -------- Legacy/compat overloads -------- */
      setChapterAnswers: ((a: any, b?: any) => {
        // 1 arg → hele object vervangen
        if (b === undefined && typeof a === 'object' && a !== null && !Array.isArray(a)) {
          set(() => ({ chapterAnswers: normalizeAnswers(a) }));
          return;
        }
        // 2 args → per chapter
        const key = a as ChapterKey;
        const value = b;
        set((s) => {
          const next = { ...s.chapterAnswers, [key]: value };
          if (key === 'basis' || key === 'budget') {
            return { chapterAnswers: syncBudget(next) };
          }
          return { chapterAnswers: next };
        });
      }) as WizardState['setChapterAnswers'],

      patchChapterAnswers: (key, patch) =>
        set((s) => {
          const prev = (s.chapterAnswers ?? {})[key] ?? {};
          const next = { ...s.chapterAnswers, [key]: { ...prev, ...(patch ?? {}) } };
          if (key === 'basis' || key === 'budget') return { chapterAnswers: syncBudget(next) };
          return { chapterAnswers: next };
        }),

      /* ----------------- Budget helpers ----------------- */
      getBudgetValue: () => {
        const a = get().chapterAnswers;
        const v = a?.budget?.budgetTotaal ?? a?.basis?.budgetIndicatie ?? null;
        return typeof v === 'number' ? v : null;
      },

      setBudgetValue: (val) =>
        set((s) => {
          const num = val === null ? null : Number(val);
          const next = {
            ...s.chapterAnswers,
            basis: { ...(s.chapterAnswers?.basis ?? {}), budgetIndicatie: num },
            budget: { ...(s.chapterAnswers?.budget ?? {}), budgetTotaal: num },
          };
          return { chapterAnswers: syncBudget(next) };
        }),

      /* ----------------- Safety & reset ----------------- */
      ensureSafety: () => {
        const s = get();
        const flow = Array.isArray(s.chapterFlow) && s.chapterFlow.length ? s.chapterFlow : FLOW_DEFAULT;
        const answers = normalizeAnswers(s.chapterAnswers);
        const current = flow.includes(s.currentChapter) ? s.currentChapter : flow[0];
        set({ chapterFlow: flow, currentChapter: current, chapterAnswers: answers });
      },

      resetAll: () => set({
        mode: 'preview',
        archetype: null,
        triage: { projectType: null, projectSize: null, intent: [], urgentie: null },
        chapterFlow: FLOW_DEFAULT,
        currentChapter: 'basis',
        chapterAnswers: defaultAnswers(),
      }),
    }),
    {
      name: 'brikx-wizard-state',
      version: 8, // bump: forceer migratie & sync bij bestaande users
      partialize: (s) => s,
      onRehydrateStorage: () => (state) => {
        // Normaliseer & sync direct na hydrate (dus na refresh ook correct)
        setTimeout(() => state?.ensureSafety?.(), 0);
      },
    }
  )
);
