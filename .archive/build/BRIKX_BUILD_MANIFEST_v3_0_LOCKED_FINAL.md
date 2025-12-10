# 🏗️ BRIKX BUILD MANIFEST v3.0 - ABSOLUTE FINAL 💎
## Single Source of Truth - Data Architecture for ALL 7 Chapters

**Status:** FINAL LOCKED - All micro-consistencies applied
**Last Updated:** November 2025
**Owner:** Jules (Build Architecture)
**Frozen:** Ready for permanent reference

---

## 📝 MICRO-FIXES APPLIED

✅ **Fix 1: PatchDelta Operations**
- Standardized to: `'set' | 'append' | 'remove'` (no 'add')
- Used everywhere: ProModel, ChatPanel, store

✅ **Fix 2: chapterAnswers Type**
- Chose Option A: `Partial<ChapterDataMap>` (flexible init)
- Consistent throughout store

✅ **Fix 3: ChapterKey & Preview**
- ChapterKey = only the 7 chapters (no preview)
- Preview = derived output, separate UI state

---

## 📐 DEFINITIVE TYPES - types/project.ts

```typescript
// ============================================================================
// CHAPTERS DATA TYPES
// ============================================================================

export type BasisData = {
  projectType: 'nieuwbouw' | 'verbouwing' | 'bijgebouw' | 'hybride' | 'anders';
  projectNaam?: string;
  locatie?: string;
  projectSize?: '<75m2' | '75-150m2' | '150-250m2' | '>250m2';
  urgency?: '<3mnd' | '3-6mnd' | '6-12mnd' | '>12mnd' | 'onzeker';
  ervaring?: 'starter' | 'enigszins' | 'ervaren';
  toelichting?: string;
  budget?: number;
};

export type Room = {
  id: string;
  name: string;
  type: string;
  group?: string;
  m2?: number | '';
  wensen?: string[];
  count?: number;
};

export type RuimtesData = {
  rooms: Room[];
};

export type Wish = {
  id: string;
  text: string;
  category?: 'comfort' | 'style' | 'function' | 'other';
  priority?: 'must' | 'nice' | 'optional';
};

export type WensenData = {
  wishes: Wish[];
};

export type BudgetData = {
  budgetTotaal?: number;
  bandbreedte?: [number | null, number | null];
  eigenInbreng?: number;
  contingency?: number;
  notes?: string;
};

export type TechniekData = {
  isolatie?: 'bestaand' | 'deels' | 'compleet' | 'ultra';
  ventilatie?: 'natuurlijk' | 'hybride' | 'mechanisch';
  verwarming?: 'cv' | 'warmtepomp' | 'hybrid' | 'anders';
  elektra?: 'bestaand' | 'deels' | 'compleet';
  sanitair?: 'bestaand' | 'deels' | 'compleet';
  opmerkingen?: string;
};

export type DuurzaamData = {
  energieLabel?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  zonnepanelen?: boolean;
  waterrecyclage?: boolean;
  isolatiedoel?: number;
  circulair?: boolean;
  bouwstoffen?: 'standaard' | 'duurzaam' | 'circulair';
  opmerkingen?: string;
};

export type Risk = {
  id: string;
  type: 'planning' | 'budget' | 'quality' | 'technical' | 'other';
  description: string;
  severity?: 'laag' | 'medium' | 'hoog';
  mitigation?: string;
};

export type RisicoData = {
  risks: Risk[];
  overallRisk?: 'laag' | 'medium' | 'hoog';
};

// ============================================================================
// CHAPTER MAP & KEYS
// ============================================================================

export type ChapterDataMap = {
  basis: BasisData;
  ruimtes: RuimtesData;
  wensen: WensenData;
  budget: BudgetData;
  techniek: TechniekData;
  duurzaam: DuurzaamData;
  risico: RisicoData;
};

export type ChapterKey = keyof ChapterDataMap;  // Exactly: 7 chapters only
export type ChapterData<K extends ChapterKey> = ChapterDataMap[K];

// ============================================================================
// PATCH OPERATIONS - STANDARDIZED
// ============================================================================

export type PatchDelta = {
  path: string;
  operation: 'set' | 'append' | 'remove';  // ✅ ONLY THESE THREE
  value?: any;
};

export type PatchEvent = {
  chapter: ChapterKey;
  delta: PatchDelta;
};

// ============================================================================
// WIZARD STATE
// ============================================================================

export type WizardState = {
  stateVersion: number;
  chapterAnswers: Partial<ChapterDataMap>;  // ✅ OPTION A: Flexible init
  currentChapter?: ChapterKey;
  chapterFlow: ChapterKey[];
  focusedField?: string;
  showExportModal?: boolean;
};
```

---

## 🧠 DEFINITIVE STORE - lib/stores/useWizardState.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChapterKey, ChapterDataMap, ChapterData, PatchDelta, WizardState } from '@/types/chat';
import { validateChapter } from '@/lib/wizard/CHAPTER_SCHEMAS';

// ============================================================================
// TRANSFORM HELPER - Universal delta handler
// ============================================================================

function transformWithDelta(
  prev: Record<string, any>,
  delta: PatchDelta
): Record<string, any> {
  const { path, operation, value } = delta;

  if (operation === 'set') {
    return { ...prev, [path]: value };
  }
  else if (operation === 'append') {
    const array = prev[path] ?? [];
    if (!Array.isArray(array)) {
      console.warn(`Cannot append to non-array at ${path}`);
      return { ...prev, [path]: [value] };
    }
    return { ...prev, [path]: [...array, value] };
  }
  else if (operation === 'remove') {
    const array = prev[path] ?? [];
    if (!Array.isArray(array)) return prev;
    // value should be { index: number }
    return {
      ...prev,
      [path]: array.filter((_, i) => i !== value?.index),
    };
  }

  return prev;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface WizardActions {
  setChapterFlow: (flow: ChapterKey[]) => void;
  setCurrentChapter: (chapter: ChapterKey) => void;
  goToChapter: (chapter: ChapterKey) => void;

  // Generic chapter updater (for UI components)
  updateChapterData: <K extends ChapterKey>(
    chapter: K,
    updater: (prev: ChapterData<K>) => ChapterData<K>
  ) => void;

  // AI translator (for ChatPanel)
  applyPatch: (chapter: ChapterKey, delta: PatchDelta) => void;

  setFocusedField: (field?: string) => void;
  setShowExportModal: (open: boolean) => void;
  ensureSafety: () => void;
  reset: () => void;
}

export type WizardStore = WizardState & WizardActions;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const store = create<WizardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      stateVersion: 1,
      chapterAnswers: {},  // ✅ OPTION A: Partial, filled on-demand
      currentChapter: undefined,
      chapterFlow: [],
      focusedField: undefined,
      showExportModal: false,

      // ============================================================
      // UI ACTIONS
      // ============================================================

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
        if (Array.isArray(chapterFlow) && chapterFlow.includes(chapter)) {
          get().setCurrentChapter(chapter);
        }
      },

      // ============================================================
      // GENERIC CHAPTER UPDATER (for all 7 chapters)
      // ============================================================
      updateChapterData: (chapter, updater) =>
        set((state) => {
          const prev = (state.chapterAnswers[chapter] ?? {}) as any;
          const next = updater(prev);

          // ✅ Validate COMPLETE chapter state
          if (!validateChapter(chapter, next)) {
            console.warn(
              `[Wizard] updateChapterData rejected invalid data for ${chapter}`,
              next
            );
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

      // ============================================================
      // AI TRANSLATOR (applyPatch)
      // ============================================================
      applyPatch: (chapter, delta) =>
        set((state) => {
          const prev = (state.chapterAnswers[chapter] ?? {}) as any;
          
          // ✅ Transform using universal handler
          const next = transformWithDelta(prev, delta);

          // ✅ Validate COMPLETE new chapter state
          if (!validateChapter(chapter, next)) {
            console.warn(
              `[Wizard] applyPatch rejected invalid patch for ${chapter}:`,
              delta
            );
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

      // ============================================================
      // UI HELPERS
      // ============================================================

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

      // ============================================================
      // MAINTENANCE
      // ============================================================

      ensureSafety: () => {
        const s = get();
        const patch: Partial<WizardState> = {};
        if (!s.chapterAnswers) patch.chapterAnswers = {};
        if (!Array.isArray(s.chapterFlow)) patch.chapterFlow = [];
        if (Object.keys(patch).length > 0) set(patch as any);
      },

      reset: () =>
        set(() => ({
          stateVersion: 1,
          chapterAnswers: {},
          currentChapter: undefined,
          chapterFlow: [],
          focusedField: undefined,
          showExportModal: false,
        })),
    }),
    {
      name: 'brikx-wizard-state',
      version: 1,
    }
  )
);

export const useWizardState = store;
export default store;
```

---

## 🎨 DEFINITIVE COMPONENT PATTERN - Template for All 7

```typescript
// Example: components/chapters/Ruimtes.tsx
// Use this EXACT pattern for: Basis, Ruimtes, Wensen, Budget, Techniek, Duurzaam, Risico

'use client';

import React, { useMemo } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { Room } from '@/types/project';

export default function Ruimtes() {
  // 1. Read data
  const ruimtesData = useWizardState((s) => s.chapterAnswers.ruimtes);
  const rooms = useMemo(
    () => ruimtesData?.rooms ?? [],
    [ruimtesData?.rooms]
  );

  // 2. Get updater
  const updateChapterData = useWizardState((s) => s.updateChapterData);

  // 3. Define operations
  const addRoom = () => {
    updateChapterData('ruimtes', (prev) => ({
      rooms: [
        ...prev.rooms,
        {
          id: crypto.randomUUID(),
          name: '',
          type: 'overig',
          group: '',
          m2: '',
          wensen: [],
        },
      ],
    }));
  };

  const updateRoom = (id: string, patch: Partial<Room>) => {
    updateChapterData('ruimtes', (prev) => ({
      rooms: prev.rooms.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));
  };

  const removeRoom = (id: string) => {
    updateChapterData('ruimtes', (prev) => ({
      rooms: prev.rooms.filter((r) => r.id !== id),
    }));
  };

  // 4. Render
  return (
    <section className="space-y-4">
      {/* UI here, using only: addRoom, updateRoom, removeRoom */}
    </section>
  );
}
```

---

## ⚙️ STANDARDIZED OPERATIONS REFERENCE

### In ALL Files (types, store, ProModel, ChatPanel):

```typescript
// ✅ ONLY THESE OPERATIONS
export type PatchDelta = {
  path: string;
  operation: 'set' | 'append' | 'remove';  // NOT 'add'
  value?: any;
};

// Usage Examples:

// Set a scalar value
{ path: 'budget', operation: 'set', value: 250000 }

// Append to array
{ path: 'rooms', operation: 'append', value: { id: '...', name: 'Bedroom', ... } }

// Remove from array
{ path: 'rooms', operation: 'remove', value: { index: 2 } }
```

---

## ✅ ABSOLUTE FINAL CHECKLIST

- [x] ChapterKey = only 7 chapters (no Preview)
- [x] Preview = derived output, separate UI state
- [x] `chapterAnswers: Partial<ChapterDataMap>` (Option A)
- [x] PatchDelta operations = `'set' | 'append' | 'remove'` (NO 'add')
- [x] ProModel uses ONLY: 'set', 'append', 'remove'
- [x] ChatPanel uses ONLY: 'set', 'append', 'remove'
- [x] Store transformWithDelta handles all 3
- [x] validateChapter runs on COMPLETE chapter state
- [x] All 7 components use IDENTICAL pattern
- [x] No useState for wizard data (anywhere)
- [x] No direct setState calls (anywhere)
- [x] No patchChapterAnswer (anywhere)

---

## 🔒 STATUS: LOCKED FOR REFERENCE

This manifest is the definitive architecture for BRIKX Build v3.0.

**All code must align with this manifest.**
**No exceptions. No deviations.**

This is the "Grondwet" (Constitution) of the build. ✅

---

## 📝 NEXT: Implementation Roadmap

### Phase 1: Types (Lock Constitution)
- [ ] Create `types/project.ts` (use provided above)
- [ ] Create `types/chat.ts` (imports from project.ts)
- [ ] Create `CHAPTER_SCHEMAS.ts` (validator)

### Phase 2: Store (Implement Brain)
- [ ] Rewrite `useWizardState.ts` (use provided above)
- [ ] Test: all operations work for all 7 chapters

### Phase 3: UI (Implement Views)
- [ ] Update all 7 components (use pattern above)
- [ ] Each component: add, update, remove operations

### Phase 4: AI (Implement Translator)
- [ ] Update ProModel.ts (use ONLY: 'set', 'append', 'remove')
- [ ] Update ChatPanel.tsx (use applyPatch)

---

**BUILD MANIFEST v3.0 - LOCKED & FINAL** 💎
