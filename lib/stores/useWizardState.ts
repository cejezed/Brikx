// lib/stores/useWizardState.ts
'use client';

import { create } from 'zustand';

/** -------- Types -------- */
export type Archetype =
  | 'nieuwbouw_woning'
  | 'complete_renovatie'
  | 'bijgebouw'
  | 'verbouwing_zolder'
  | 'hybride_project'
  | null;

export type Mode = 'preview' | 'premium';

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

/** -------- Helpers -------- */
function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
function safeFlow(archetype: Archetype): ChapterKey[] {
  if (archetype === 'bijgebouw') {
    return ['basis', 'wensen', 'budget', 'ruimtes', 'techniek', 'preview'];
  }
  return ['basis', 'wensen', 'budget', 'ruimtes', 'techniek', 'duurzaamheid', 'risico', 'preview'];
}

/** -------- Store -------- */
export interface WizardState {
  projectId?: string | null;

  /** UI mode (veel preview/premium logica leunt hierop) */
  mode: Mode;
  setMode: (m: Mode) => void;            // compat voor Preview/Risico

  triage: TriageState;

  chapterFlow: ChapterKey[];
  currentChapter: ChapterKey;

  // canonieke API
  goToChapter: (ch: ChapterKey) => void;
  setChapterFlow: (flow: ChapterKey[]) => void;
  setTriage: (patch: Partial<TriageState>) => void;

  // 🔰 compat-aliases (oude hoofdstukken)
  setCurrentChapter: (ch: ChapterKey) => void;
  setChapter: (ch: ChapterKey) => void;

  // basis
  basis: BasisAnswers;
  setBasis: (patch: Partial<BasisAnswers>) => void;

  // 🔰 basis-compat helpers (veel Basis-components verwachten deze)
  getProjectName: () => string | undefined;
  setProjectName: (v: string) => void;
  getLocation: () => string | undefined;
  setLocation: (v: string) => void;

  // budget
  budget: BudgetAnswers;
  setBudget: (euro: number | null) => void;

  // 🔰 budget-compat
  getBudgetValue: () => number | null;
  setBudgetValue: (euro: number | null) => void;

  // ruimtes
  ruimtes: Room[];
  addRoom: (room: Partial<Room> & { type: Room['type'] }) => string;
  patchRoom: (id: string, patch: Partial<Room>) => void;

  // techniek / duurzaamheid / risico
  techniek: TechniekAnswers;
  setTechniek: (patch: Partial<TechniekAnswers>) => void;

  duurzaamheid: DuurzaamheidAnswers;
  setDuurzaamheid: (patch: Partial<DuurzaamheidAnswers>) => void;

  risico: RisicoAnswers;
  setRisico: (patch: Partial<RisicoAnswers>) => void;

  // 🔰 back-compat containers (nooit undefined)
  answers: {
    basis: BasisAnswers;
    wensen: string[];
    budget: BudgetAnswers;
    ruimtes: Room[];
    techniek: TechniekAnswers;
    duurzaamheid: DuurzaamheidAnswers;
    risico: RisicoAnswers;
  };
  chapterAnswers: WizardState['answers']; // alias
  wensen: string[];
  addWens: (label: string) => void;
  removeWens: (label: string) => void;
  setWensen: (all: string[]) => void;

  // UI metrics
  completedSteps?: number;
  totalSteps?: number;
  progress?: number;
}

export const useWizardState = create<WizardState>()((set, get) => ({
  projectId: null,

  mode: 'preview',
  setMode: (m) => set({ mode: m }),

  triage: {
    projectType: null,
    projectSize: null,
    urgentie: null,
    intent: [],
  },

  chapterFlow: safeFlow(null),
  currentChapter: 'basis',

  goToChapter: (ch) => set({ currentChapter: ch }),
  setCurrentChapter: (ch) => set({ currentChapter: ch }), // compat
  setChapter: (ch) => set({ currentChapter: ch }),        // compat

  setChapterFlow: (flow) =>
    set({ chapterFlow: Array.isArray(flow) && flow.length ? flow : safeFlow(get().triage.projectType) }),

  setTriage: (patch) => {
    const next = { ...get().triage, ...patch };
    set({ triage: next, chapterFlow: safeFlow(next.projectType) });
  },

  // basis
  basis: {},
  setBasis: (patch) =>
    set((s) => {
      const basis = { ...s.basis, ...patch };
      return { basis, answers: { ...s.answers, basis }, chapterAnswers: { ...s.chapterAnswers, basis } };
    }),

  getProjectName: () => get().basis?.projectNaam,
  setProjectName: (v) => get().setBasis({ projectNaam: v }),
  getLocation: () => get().basis?.locatie,
  setLocation: (v) => get().setBasis({ locatie: v }),

  // budget
  budget: { bedrag: null },
  setBudget: (euro) =>
    set((s) => {
      const budget = { bedrag: euro };
      return { budget, answers: { ...s.answers, budget }, chapterAnswers: { ...s.chapterAnswers, budget } };
    }),

  getBudgetValue: () => get().budget?.bedrag ?? null,
  setBudgetValue: (euro) => get().setBudget(euro),

  // ruimtes
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

  // techniek / duurzaamheid / risico
  techniek: {},
  setTechniek: (patch) =>
    set((s) => {
      const techniek = { ...s.techniek, ...patch };
      return { techniek, answers: { ...s.answers, techniek }, chapterAnswers: { ...s.chapterAnswers, techniek } };
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
      return { risico, answers: { ...s.answers, risico }, chapterAnswers: { ...s.chapterAnswers, risico } };
    }),

  // back-compat containers
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
      const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      const wensen = uniq([...(s.wensen ?? []), label]);
      return { wensen, answers: { ...s.answers, wensen }, chapterAnswers: { ...s.chapterAnswers, wensen } };
    }),
  removeWens: (label) =>
    set((s) => {
      const wensen = (s.wensen ?? []).filter((w) => w !== label);
      return { wensen, answers: { ...s.answers, wensen }, chapterAnswers: { ...s.chapterAnswers, wensen } };
    }),
  setWensen: (all) =>
    set((s) => {
      const wensen = Array.isArray(all) ? all : [];
      return { wensen, answers: { ...s.answers, wensen }, chapterAnswers: { ...s.chapterAnswers, wensen } };
    }),

  // UI metrics
  completedSteps: 0,
  totalSteps: 8,
  progress: 0,
}));

export default useWizardState;
