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

const CHAPTER_KEYS: ChapterKey[] = [
  'basis','wensen','budget','ruimtes','techniek','duurzaamheid','risico','preview'
];

// Losse mapping zodat inkomende patches met bv. 'rooms' alsnog landen.
const CHAPTER_ALIASES: Record<string, ChapterKey> = {
  rooms: 'ruimtes',
  room: 'ruimtes',
  basics: 'basis',
  base: 'basis',
  sustainability: 'duurzaamheid',
  risk: 'risico',
  summary: 'preview',
};

type Ruimte = { name: string; type: string; group: string; m2: number|''; wensen: string[] };

type ChapterAnswers = {
  basis: Record<string, any>;
  wensen: any[];
  budget: {
    bedrag?: number|null;
    budgetTotaal?: number|null;
    bandbreedte?: [number|null, number|null] | null;
    eigenInbreng?: number|null;
  } & Record<string, any>;
  ruimtes: Ruimte[];
  techniek: Record<string, any>;
  duurzaamheid: Record<string, any>;
  risico: Record<string, any>;
};

export type PatchEvent = {
  chapter: string;
  delta: {
    path: string; // "" voor array-add op chapter-root
    operation: 'add'|'set'|'append'|'remove';
    value?: any;
  };
};

export interface WizardState {
  triage: {
    projectType?: string;
    projectSize?: string;
    urgency?: string;
    budget?: number;
    intent?: string[];
  };

  chapterAnswers: ChapterAnswers;
  answers: ChapterAnswers;

  currentChapter: ChapterKey;
  chapterFlow?: string[];

  stateVersion: number;

  // navigatie (enige bron van waarheid)
  goToChapter: (ch: ChapterKey) => void;
  setCurrentChapter: (ch: ChapterKey) => void; // alias
  setChapter: (ch: ChapterKey) => void;        // alias
  setChapterFlow: (flow: string[]) => void;

  setTriage: (val: WizardState['triage']) => void;
  patchTriage: (patch: Partial<WizardState['triage']>) => void;
  getTriage: () => WizardState['triage'];

  setChapterAnswer: (ch: ChapterKey, val: any) => void;
  patchChapterAnswer: (ch: ChapterKey, patch: any) => void;
  setChapterAnswers: (partial: Partial<Record<ChapterKey, any>>) => void;
  getChapterAnswer: (ch: ChapterKey) => any;

  setBudget: (euro: number | null) => void;
  getBudgetValue: () => number | null;

  applyServerPatch: (patch: PatchEvent) => void;
}

const DEFAULTS: ChapterAnswers = {
  basis: {},
  wensen: [],
  budget: { bedrag: null, budgetTotaal: null, bandbreedte: null, eigenInbreng: null },
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
  intent: [] as string[] | undefined,
};

function normalize(obj: any): ChapterAnswers {
  const src = obj ?? {};
  return {
    basis: src.basis && typeof src.basis === 'object' ? src.basis : {},
    wensen: Array.isArray(src.wensen) ? src.wensen : [],
    budget: src.budget && typeof src.budget === 'object'
      ? {
          bedrag: src.budget.bedrag ?? null,
          budgetTotaal: src.budget.budgetTotaal ?? null,
          bandbreedte: src.budget.bandbreedte ?? null,
          eigenInbreng: src.budget.eigenInbreng ?? null,
          ...src.budget
        }
      : { bedrag: null, budgetTotaal: null, bandbreedte: null, eigenInbreng: null },
    ruimtes: Array.isArray(src.ruimtes) ? src.ruimtes : [],
    techniek: src.techniek && typeof src.techniek === 'object' ? src.techniek : {},
    duurzaamheid: src.duurzaamheid && typeof src.duurzaamheid === 'object' ? src.duurzaamheid : {},
    risico: src.risico && typeof src.risico === 'object' ? src.risico : {},
  };
}

function canonChapter(input: string): ChapterKey | null {
  const k = input as ChapterKey;
  if (CHAPTER_KEYS.includes(k)) return k;
  const alias = CHAPTER_ALIASES[input];
  if (alias) return alias;
  return null;
}

const STORE_VERSION = 6;

export const useWizardState = create<WizardState>()(
  persist(
    (set, get) => ({
      triage: { ...DEFAULT_TRIAGE },

      chapterAnswers: { ...DEFAULTS },
      answers: { ...DEFAULTS },

      currentChapter: 'basis',
      chapterFlow: undefined,

      stateVersion: 0,

      // Eén bron van waarheid
      goToChapter: (ch) => set({ currentChapter: ch }),
      setCurrentChapter: (ch) => set({ currentChapter: ch }),
      setChapter: (ch) => set({ currentChapter: ch }),
      setChapterFlow: (flow) => set({ chapterFlow: flow }),

      setTriage: (val) => set({ triage: val }),
      patchTriage: (patch) => set((s) => ({ triage: { ...s.triage, ...patch } })),
      getTriage: () => get().triage,

      setChapterAnswer: (ch, val) =>
        set((s) => {
          const next = { ...s.chapterAnswers, [ch]: val };
          return { chapterAnswers: next, answers: next, stateVersion: (s.stateVersion ?? 0) + 1 };
        }),

      patchChapterAnswer: (ch, patch) =>
        set((s) => {
          const current = s.chapterAnswers?.[ch];
          let patched: any;
          if (current && typeof current === 'object' && !Array.isArray(current)) {
            patched = { ...current, ...patch };
          } else {
            patched = patch;
          }
          const next = { ...s.chapterAnswers, [ch]: patched };
          return { chapterAnswers: next, answers: next, stateVersion: (s.stateVersion ?? 0) + 1 };
        }),

      setChapterAnswers: (partial) =>
        set((s) => {
          const next = { ...s.chapterAnswers, ...partial };
          return { chapterAnswers: next, answers: next, stateVersion: (s.stateVersion ?? 0) + 1 };
        }),

      getChapterAnswer: (ch) => get().chapterAnswers?.[ch],

      setBudget: (euro) =>
        set((s) => {
          const budget = { ...(s.chapterAnswers.budget ?? {}), bedrag: euro, budgetTotaal: euro };
          const next = { ...s.chapterAnswers, budget };
          return { chapterAnswers: next, answers: next, stateVersion: (s.stateVersion ?? 0) + 1 };
        }),
      getBudgetValue: () =>
        get().chapterAnswers?.budget?.budgetTotaal ?? get().chapterAnswers?.budget?.bedrag ?? null,

      // ======== ROBUUST PATCHEN =========
      applyServerPatch: (patch) => {
        const { chapter: rawChapter, delta } = patch;
        const c = canonChapter(String(rawChapter).trim());
        if (!c) {
          console.warn('[applyServerPatch] onbekend chapter:', rawChapter, '– patch genegeerd');
          return;
        }

        set((s) => {
          const answers = s.chapterAnswers ?? {};
          const current = answers[c as keyof typeof answers];

          // A) array-root add (bijv. ruimtes)
          if (Array.isArray(current) && delta.path === '' && delta.operation === 'add') {
            const nextArray = [...current, delta.value];
            const nextAnswers = { ...answers, [c]: nextArray };
            return {
              chapterAnswers: nextAnswers,
              answers: nextAnswers,
              stateVersion: (s.stateVersion ?? 0) + 1,
            };
          }

          // B) special path: byName:<Naam>.<veld> (ruimtes slim aanpassen)
          if (c === 'ruimtes' && typeof delta.path === 'string' && delta.path.startsWith('byName:')) {
            const rest = delta.path.slice('byName:'.length); // "Keuken.wensen" of "Keuken.m2"
            const dot = rest.indexOf('.');
            const roomName = (dot === -1 ? rest : rest.slice(0, dot)).trim();
            const roomField = dot === -1 ? undefined : rest.slice(dot + 1);

            const list = Array.isArray(current) ? [...current] as Ruimte[] : [];
            let idx = list.findIndex((r) => (r?.name ?? '').toLowerCase() === roomName.toLowerCase());
            if (idx === -1) {
              list.push({ name: roomName, type: roomName.toLowerCase(), group: '', m2: '', wensen: [] });
              idx = list.length - 1;
            }

            const item = { ...list[idx] };

            if (roomField === 'wensen') {
              const cur = Array.isArray(item.wensen) ? [...item.wensen] : [];
              if (delta.operation === 'add' && delta.value != null) cur.push(String(delta.value));
              item.wensen = cur;
            } else if (roomField === 'm2') {
              if (delta.operation === 'set') item.m2 = typeof delta.value === 'number' ? delta.value : '';
            } else if (roomField) {
              if (delta.operation === 'set') (item as any)[roomField] = delta.value;
              if (delta.operation === 'add' && Array.isArray((item as any)[roomField])) {
                (item as any)[roomField] = [ ...(item as any)[roomField], delta.value ];
              }
            }

            list[idx] = item;
            const nextAnswers = { ...answers, [c]: list };
            return {
              chapterAnswers: nextAnswers,
              answers: nextAnswers,
              stateVersion: (s.stateVersion ?? 0) + 1,
            };
          }

          // C) object pad (a.b.c)
          const chapterObj = Array.isArray(current) ? {} : { ...(current ?? {}) };
          const keys = delta.path ? delta.path.split('.') : [];
          if (keys.length === 0 && !Array.isArray(current)) {
            if (delta.operation === 'add' || delta.operation === 'set') {
              if (delta.value && typeof delta.value === 'object') Object.assign(chapterObj, delta.value);
            }
          } else {
            let cursor: any = chapterObj;
            const last = keys.pop();
            for (const k of keys) {
              cursor[k] = cursor[k] ?? {};
              cursor = cursor[k];
            }
            if (last) {
              switch (delta.operation) {
                case 'add':
                  if (Array.isArray(cursor[last])) cursor[last] = [...cursor[last], delta.value];
                  else if (cursor[last] == null) cursor[last] = delta.value;
                  else if (typeof cursor[last] === 'object') cursor[last] = { ...cursor[last], ...delta.value };
                  else cursor[last] = delta.value;
                  break;
                case 'set':
                  cursor[last] = delta.value;
                  break;
                case 'append':
                  cursor[last] = (cursor[last] ?? '') + String(delta.value ?? '');
                  break;
                case 'remove':
                  if (Array.isArray(cursor[last])) cursor[last] = (cursor[last] as any[]).filter((x) => x !== delta.value);
                  else delete cursor[last];
                  break;
              }
            }
          }

          const nextAnswers = { ...answers, [c]: Array.isArray(current) ? current : chapterObj };
          return { chapterAnswers: nextAnswers, answers: nextAnswers, stateVersion: (s.stateVersion ?? 0) + 1 };
        });
      },
    }),
    {
      name: 'brikx-wizard-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: any) => {
        if (!persisted || typeof persisted !== 'object') {
          return {
            chapterAnswers: { ...DEFAULTS },
            answers: { ...DEFAULTS },
            currentChapter: 'basis',
            chapterFlow: undefined,
            stateVersion: 0,
            triage: { ...DEFAULT_TRIAGE },
          } as Partial<WizardState>;
        }

        const persistedAnswers = persisted.chapterAnswers ?? persisted.answers ?? {};
        const normalized = normalize(persistedAnswers);
        const currentChapter: ChapterKey = (persisted.currentChapter as ChapterKey) ?? 'basis';
        const triage = persisted.triage ?? { ...DEFAULT_TRIAGE };
        const chapterFlow = persisted.chapterFlow ?? undefined;
        const stateVersion = typeof persisted.stateVersion === 'number' ? persisted.stateVersion : 0;

        return {
          triage,
          chapterAnswers: normalized,
          answers: normalized,
          currentChapter,
          chapterFlow,
          stateVersion,
        } as Partial<WizardState>;
      },
      partialize: (s) => ({
        triage: s.triage,
        chapterAnswers: s.chapterAnswers,
        answers: s.answers,
        currentChapter: s.currentChapter,
        chapterFlow: s.chapterFlow,
        stateVersion: s.stateVersion,
      }),
    }
  )
);

export default useWizardState;
