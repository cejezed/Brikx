// lib/stores/useWizardState.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ChapterKey =
  | 'basis'
  | 'wensen'
  | 'budget'
  | 'ruimtes'
  | 'techniek'
  | 'duurzaamheid'
  | 'risico'
  | 'preview';

type ChapterAnswers = {
  basis: Record<string, any>;
  wensen: any[];
  budget: { bedrag: number | null } & Record<string, any>;
  ruimtes: any[];
  techniek: Record<string, any>;
  duurzaamheid: Record<string, any>;
  risico: Record<string, any>;
  // preview: als hoofdstuk heeft geen eigen data nodig, maar houden we vrij
};

export interface WizardState {
  // triage = router/gatekeeper (bepaalt flow, chapters, validatie)
  triage: {
    projectType?: string;
    projectSize?: string;
    urgency?: string;
    budget?: number;
    intent?: string[];
  };

  // hoofdstate
  chapterAnswers: ChapterAnswers;
  // back-compat mirror (sommige components lezen 'answers')
  answers: ChapterAnswers;

  currentChapter: ChapterKey;

  // navigatie
  goToChapter: (ch: ChapterKey) => void;
  // back-compat aliassen
  setCurrentChapter: (ch: ChapterKey) => void;
  setChapter: (ch: ChapterKey) => void;

  // triage management (router/gatekeeper)
  setTriage: (val: WizardState['triage']) => void;
  patchTriage: (patch: Partial<WizardState['triage']>) => void;
  getTriage: () => WizardState['triage'];

  // generiek API (aanbevolen)
  setChapterAnswer: (ch: ChapterKey, val: any) => void;
  patchChapterAnswer: (ch: ChapterKey, patch: any) => void;
  setChapterAnswers: (partial: Partial<Record<ChapterKey, any>>) => void;
  getChapterAnswer: (ch: ChapterKey) => any;

  // compat helpers die legacy code kan aanroepen
  setBudget: (euro: number | null) => void;
  getBudgetValue: () => number | null;
}

const DEFAULTS: ChapterAnswers = {
  basis: {},
  wensen: [],
  budget: { bedrag: null },
  ruimtes: [],
  techniek: {},
  duurzaamheid: {},
  risico: {},
};

const DEFAULT_TRIAGE = {
  projectType: undefined,
  projectSize: undefined,
  urgency: undefined,
  budget: undefined,
  intent: [],
};

function normalize(obj: any): ChapterAnswers {
  const src = obj ?? {};
  return {
    basis: src.basis && typeof src.basis === 'object' ? src.basis : {},
    wensen: Array.isArray(src.wensen) ? src.wensen : [],
    budget:
      src.budget && typeof src.budget === 'object'
        ? { bedrag: src.budget.bedrag ?? null, ...src.budget }
        : { bedrag: null },
    ruimtes: Array.isArray(src.ruimtes) ? src.ruimtes : [],
    techniek: src.techniek && typeof src.techniek === 'object' ? src.techniek : {},
    duurzaamheid: src.duurzaamheid && typeof src.duurzaamheid === 'object' ? src.duurzaamheid : {},
    risico: src.risico && typeof src.risico === 'object' ? src.risico : {},
  };
}

const STORE_VERSION = 3;

export const useWizardState = create<WizardState>()(
  persist(
    (set, get) => ({
      triage: { ...DEFAULT_TRIAGE },

      chapterAnswers: { ...DEFAULTS },
      answers: { ...DEFAULTS }, // mirror

      currentChapter: 'basis',

      goToChapter: (ch) => set({ currentChapter: ch }),
      setCurrentChapter: (ch) => set({ currentChapter: ch }),
      setChapter: (ch) => set({ currentChapter: ch }),

      // triage methods
      setTriage: (val) => set({ triage: val }),
      patchTriage: (patch) =>
        set((s) => ({
          triage: { ...s.triage, ...patch },
        })),
      getTriage: () => get().triage,

      setChapterAnswer: (ch, val) =>
        set((s) => {
          const next = { ...s.chapterAnswers, [ch]: val };
          return { chapterAnswers: next, answers: next };
        }),

      patchChapterAnswer: (ch, patch) =>
        set((s) => {
          const current = s.chapterAnswers?.[ch];
          let patched: any;
          if (current && typeof current === 'object' && !Array.isArray(current)) {
            patched = { ...current, ...patch };
          } else {
            // als het geen object is, neem patch als nieuwe waarde
            patched = patch;
          }
          const next = { ...s.chapterAnswers, [ch]: patched };
          return { chapterAnswers: next, answers: next };
        }),

      setChapterAnswers: (partial) =>
        set((s) => {
          const next = { ...s.chapterAnswers, ...partial };
          return { chapterAnswers: next, answers: next };
        }),

      getChapterAnswer: (ch) => get().chapterAnswers?.[ch],

      // compat
      setBudget: (euro) =>
        set((s) => {
          const budget = { ...(s.chapterAnswers.budget ?? {}), bedrag: euro };
          const next = { ...s.chapterAnswers, budget };
          return { chapterAnswers: next, answers: next };
        }),
      getBudgetValue: () => get().chapterAnswers?.budget?.bedrag ?? null,
    }),
    {
      name: 'brikx-wizard-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: any, fromVersion: number) => {
        // Geen data? fresh start
        if (!persisted || typeof persisted !== 'object') {
          return {
            chapterAnswers: { ...DEFAULTS },
            answers: { ...DEFAULTS },
            currentChapter: 'basis',
          } as Partial<WizardState>;
        }

        // v0/v1/v2 → normaliseren
        const persistedAnswers =
          // sommige oudere versies hadden 'chapterAnswers', sommige alleen 'answers'
          persisted.chapterAnswers ?? persisted.answers ?? {};

        const normalized = normalize(persistedAnswers);

        // currentChapter fallback
        const currentChapter: ChapterKey =
          (persisted.currentChapter as ChapterKey) ?? 'basis';

        // triage fallback
        const triage = persisted.triage ?? { ...DEFAULT_TRIAGE };

        return {
          triage,
          chapterAnswers: normalized,
          answers: normalized,
          currentChapter,
        } as Partial<WizardState>;
      },
      // alleen relevante keys opslaan
      partialize: (s) => ({
        triage: s.triage,
        chapterAnswers: s.chapterAnswers,
        answers: s.answers,
        currentChapter: s.currentChapter,
      }),
    }
  )
);

export default useWizardState;