'use client';

import { create } from 'zustand';

/** ----------------
 *  Types
 *  ---------------- */
export type Archetype =
  | 'nieuwbouw_woning'
  | 'complete_renovatie'
  | 'bijgebouw'
  | 'verbouwing_zolder'
  | 'hybride_project'
  | null;

export type TriageState = {
  projectType: Archetype;
  projectSize: 'klein' | 'midden' | 'groot' | null;
  urgentie: 'laag' | 'middel' | 'hoog' | null;
  intent: Array<'architect_start' | 'contractor_quote' | 'scenario_exploration'>;
};

export type ChapterKey =
  | 'basis'
  | 'wensen'
  | 'budget'
  | 'ruimtes'
  | 'techniek'
  | 'duurzaamheid'
  | 'risico'
  | 'preview';

export type Room = {
  id: string;
  type: 'woonkamer' | 'keuken' | 'slaapkamer' | 'badkamer' | 'overig';
  naam?: string;
  oppM2?: number;
  wensen?: string[];
};

type BasisAnswers = { projectNaam?: string; locatie?: string };
type BudgetAnswers = { bedrag?: number | null };
type TechniekAnswers = { isolatie?: string | null; installaties?: string | null };
type DuurzaamheidAnswers = Record<string, unknown>;
type RisicoAnswers = Record<string, unknown>;

/** ----------------
 *  Helpers
 *  ---------------- */
function safeFlow(archetype: Archetype): ChapterKey[] {
  if (archetype === 'bijgebouw') {
    return ['basis', 'wensen', 'budget', 'ruimtes', 'techniek', 'preview'];
  }
  return ['basis', 'wensen', 'budget', 'ruimtes', 'techniek', 'duurzaamheid', 'risico', 'preview'];
}

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

/** ----------------
 *  State shape
 *  ---------------- */
export interface WizardState {
  projectId?: string | null;

  triage: TriageState;

  // Flow & nav
  chapterFlow: ChapterKey[];
  currentChapter: ChapterKey;
  goToChapter: (ch: ChapterKey) => void;
  setChapterFlow: (flow: ChapterKey[]) => void;
  setTriage: (patch: Partial<TriageState>) => void;

  // Hoofdstukken (top-level)
  basis: BasisAnswers;
  setBasis: (patch: Partial<BasisAnswers>) => void;

  budget: BudgetAnswers;
  setBudget: (euro: number | null) => void;

  ruimtes: Room[];
  addRoom: (room: Partial<Room> & { type: Room['type'] }) => string;
  patchRoom: (id: string, patch: Partial<Room>) => void;

  techniek: TechniekAnswers;
  setTechniek: (patch: Partial<TechniekAnswers>) => void;

  duurzaamheid: DuurzaamheidAnswers;
  setDuurzaamheid: (patch: Partial<DuurzaamheidAnswers>) => void;

  risico: RisicoAnswers;
  setRisico: (patch: Partial<RisicoAnswers>) => void;

  // 🔰 Back-compat containers + aliassen (nooit undefined)
  answers: {
    basis: BasisAnswers;
    wensen: string[];
    budget: BudgetAnswers;
    ruimtes: Room[];
    techniek: TechniekAnswers;
    duurzaamheid: DuurzaamheidAnswers;
    risico: RisicoAnswers;
  };

  /** Vroegere naam die sommige hoofdstukken gebruiken */
  chapterAnswers: WizardState['answers'];

  /** Losse alias voor wensen, voor hoofdstukken die `state.wensen` lezen */
  wensen: string[];
  addWens: (label: string) => void;
  removeWens: (label: string) => void;
  setWensen: (all: string[]) => void;

  // Telemetry (optioneel)
  completedSteps?: number;
  totalSteps?: number;
  progress?: number;
}

/** ----------------
 *  Store
 *  ---------------- */
export const useWizardState = create<WizardState>()((set, get) => ({
  projectId: null,

  triage: {
    projectType: null,
    projectSize: null,
    urgentie: null,
    intent: [],
  },

  chapterFlow: safeFlow(null),
  currentChapter: 'basis',
  goToChapter: (ch) => set({ currentChapter: ch }),
  setChapterFlow: (flow) =>
    set({ chapterFlow: Array.isArray(flow) && flow.length ? flow : safeFlow(get().triage.projectType) }),

  setTriage: (patch) => {
    const next = { ...get().triage, ...patch };
    set({ triage: next, chapterFlow: safeFlow(next.projectType) });
  },

  // ---- Top-level hoofdstukdata (safe defaults) ----
  basis: {},
  setBasis: (patch) =>
    set((s) => {
      const basis = { ...s.basis, ...patch };
      return {
        basis,
        answers: { ...s.answers, basis },
        chapterAnswers: { ...s.chapterAnswers, basis },
      };
    }),

  budget: { bedrag: null },
  setBudget: (euro) =>
    set((s) => {
      const budget = { bedrag: euro };
      return {
        budget,
        answers: { ...s.answers, budget },
        chapterAnswers: { ...s.chapterAnswers, budget },
      };
    }),

  ruimtes: [],
  addRoom: (room) => {
    const id = uuid();
    const r: Room = {
      id,
      type: room.type,
      naam: room.naam ?? room.type,
      oppM2: room.oppM2,
      wensen: room.wensen ?? [],
    };
    set((s) => {
      const next = [...s.ruimtes, r];
      return {
        ruimtes: next,
        answers: { ...s.answers, ruimtes: next },
        chapterAnswers: { ...s.chapterAnswers, ruimtes: next },
      };
    });
    return id;
  },
  patchRoom: (id, patch) =>
    set((s) => {
      const next = s.ruimtes.map((r) => (r.id === id ? { ...r, ...patch } : r));
      return {
        ruimtes: next,
        answers: { ...s.answers, ruimtes: next },
        chapterAnswers: { ...s.chapterAnswers, ruimtes: next },
      };
    }),

  techniek: {},
  setTechniek: (patch) =>
    set((s) => {
      const techniek = { ...s.techniek, ...patch };
      return {
        techniek,
        answers: { ...s.answers, techniek },
        chapterAnswers: { ...s.chapterAnswers, techniek },
      };
    }),

  duurzaamheid: {},
  setDuurzaamheid: (patch) =>
    set((s) => {
      const duurzaamheid = { ...s.duurzaamheid, ...patch };
      return {
        duurzaamheid,
        answers: { ...s.answers, duurzaamheid },
        chapterAnswers: { ...s.chapterAnswers, duurzaamheid },
      };
    }),

  risico: {},
  setRisico: (patch) =>
    set((s) => {
      const risico = { ...s.risico, ...patch };
      return {
        risico,
        answers: { ...s.answers, risico },
        chapterAnswers: { ...s.chapterAnswers, risico },
      };
    }),

  // ---- Back-compat containers + aliassen (NOOIT undefined) ----
  answers: {
    basis: {},
    wensen: [],
    budget: { bedrag: null },
    ruimtes: [],
    techniek: {},
    duurzaamheid: {},
    risico: {},
  },

  chapterAnswers: {
    basis: {},
    wensen: [],
    budget: { bedrag: null },
    ruimtes: [],
    techniek: {},
    duurzaamheid: {},
    risico: {},
  },

  wensen: [],
  addWens: (label) =>
    set((s) => {
      const setdedup = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      const wensen = setdedup([...(s.wensen ?? []), label]);
      return {
        wensen,
        answers: { ...s.answers, wensen },
        chapterAnswers: { ...s.chapterAnswers, wensen },
      };
    }),
  removeWens: (label) =>
    set((s) => {
      const wensen = (s.wensen ?? []).filter((w) => w !== label);
      return {
        wensen,
        answers: { ...s.answers, wensen },
        chapterAnswers: { ...s.chapterAnswers, wensen },
      };
    }),
  setWensen: (all) =>
    set((s) => {
      const wensen = Array.isArray(all) ? all : [];
      return {
        wensen,
        answers: { ...s.answers, wensen },
        chapterAnswers: { ...s.chapterAnswers, wensen },
      };
    }),

  // Telemetry
  completedSteps: 0,
  totalSteps: 8,
  progress: 0,
}));

export default useWizardState;
