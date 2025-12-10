# 🏭 BRIKX BUILD PROTOCOL v3.0 - TECHNICAL SPECIFICATION
**Version:** 3.0 (Evolved from v2.0)  
**Baseline:** BUILD PROTOCOL v2.0 (11 November 2025)  
**Evolution:** Architecture refactor - Type-driven "Shared Brain" model  
**Status:** ✅ Consensus + Ready for Implementation

---

## 📖 EXECUTIVE SUMMARY

**Base:** This document builds on **BRIKX_BUILD_PROTOCOL_v2.0**, which remains the canonical foundation for AI-First Triage, SSE streaming, and policy trees.

**Change:** v3.0 introduces a **stricter data contract layer** (types + schemas) and **unified component pattern** to eliminate discrepancies. All operations are now explicitly defined.

⚠️ **Deviations from v2.0:** Marked with ⚠️ throughout. All are backwards-compatible reinterpretations or improvements.

---

## 🎯 THREE PILLARS (v2.0 + v3.0 Improvements)

1. **AI-First Triage** ✅ (v2.0 unchanged)
   — Server classifies intent + context-aware nudge

2. **Smart Client** ✅ (v2.0 unchanged)  
   — Implements Confidence Policy Tree + SSE streaming

3. **Type-Driven Architecture** ⚠️ (v3.0 NEW)
   — Explicit data contracts + unified patterns + automated validation

---

## ⚠️ PART 0: CONSTITUTION - THE DATA CONTRACT

**NEW in v3.0:** All types and schemas defined FIRST, before any code.

### 0.1 Chapter Data Types

```typescript
// types/project.ts - SINGLE SOURCE OF TRUTH for all 7 chapters

export type ChapterKey = 'basis' | 'ruimtes' | 'wensen' | 'budget' | 'techniek' | 'duurzaam' | 'risico';

// Chapter 1: INTAKE + CONTEXT
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

// Chapter 2: ROOMS
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
  rooms: Room[];  // ⚠️ DEVIATION: v2.0 used "ruimtes", v3.0 uses "rooms" (internal property)
};

// Chapter 3: WISHES
export type Wish = {
  id: string;
  text: string;
  category?: 'comfort' | 'style' | 'function' | 'other';
  priority?: 'must' | 'nice' | 'optional';
};

export type WensenData = {
  wishes: Wish[];  // ⚠️ DEVIATION: Property name vs chapter name
};

// Chapter 4: BUDGET
export type BudgetData = {
  budgetTotaal?: number;
  bandbreedte?: [number | null, number | null];
  eigenInbreng?: number;
  contingency?: number;
  notes?: string;
};

// Chapter 5: TECHNIEK
export type TechniekData = {  // ⚠️ DEVIATION: v2.0 had "TechniekeData"
  isolatie?: 'bestaand' | 'deels' | 'compleet' | 'ultra';
  ventilatie?: 'natuurlijk' | 'hybride' | 'mechanisch';
  verwarming?: 'cv' | 'warmtepomp' | 'hybrid' | 'anders';
  elektra?: 'bestaand' | 'deels' | 'compleet';
  sanitair?: 'bestaand' | 'deels' | 'compleet';
  opmerkingen?: string;
};

// Chapter 6: DUURZAAM
export type DuurzaamData = {
  energieLabel?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  zonnepanelen?: boolean;
  waterrecyclage?: boolean;
  isolatiedoel?: number;
  circulair?: boolean;
  bouwstoffen?: 'standaard' | 'duurzaam' | 'circulair';
  opmerkingen?: string;
};

// Chapter 7: RISICO
export type Risk = {
  id: string;
  type: 'planning' | 'budget' | 'quality' | 'technical' | 'other';
  description: string;
  severity?: 'laag' | 'medium' | 'hoog';
  mitigation?: string;
};

export type RisicoData = {  // ⚠️ DEVIATION: v2.0 had "RiscoData"
  risks: Risk[];
  overallRisk?: 'laag' | 'medium' | 'hoog';
};

// UNIFIED MAP
export type ChapterDataMap = {
  basis: BasisData;
  ruimtes: RuimtesData;
  wensen: WensenData;
  budget: BudgetData;
  techniek: TechniekData;
  duurzaam: DuurzaamData;
  risico: RisicoData;
};

export type ChapterData<K extends ChapterKey> = ChapterDataMap[K];
```

### 0.2 Patch Operations - STANDARDIZED

```typescript
// ⚠️ MAJOR DEVIATION FROM v2.0
// v2.0 had: "add" | "set" | "append" | "remove"
// v3.0 has: "set" | "append" | "remove" (only 3)
// Rationale: "add" was ambiguous. "append" is always array, "set" is always scalar.

export type PatchDelta = {
  path: string;
  operation: 'set' | 'append' | 'remove';  // ⚠️ NO "add"
  value?: any;
};

export type PatchEvent = {
  chapter: ChapterKey;
  delta: PatchDelta;
};

// INTERPRETATION GUIDE:
// - 'set': Replace scalar value
//   { path: 'budget', operation: 'set', value: 250000 }
//
// - 'append': Add item to array
//   { path: 'rooms', operation: 'append', value: { id: '...', name: 'Bedroom', ... } }
//
// - 'remove': Remove item from array by index
//   { path: 'rooms', operation: 'remove', value: { index: 2 } }
```

### 0.3 Validation Schema

```typescript
// lib/wizard/CHAPTER_SCHEMAS.ts
// ⚠️ NEW in v3.0: Centralized validation

export const CHAPTER_SCHEMAS: Record<ChapterKey, any> = {
  basis: {
    type: 'object',
    fields: {
      projectType: { type: 'enum', values: ['nieuwbouw', 'verbouwing', ...], required: true },
      projectNaam: { type: 'string', required: false },
      // ... all fields with types
    }
  },
  ruimtes: {
    type: 'object',
    fields: {
      rooms: {  // ⚠️ PROPERTY NAME (not "ruimtes")
        type: 'array',
        items: {
          type: 'object',
          fields: {
            id: { type: 'string', required: true },
            name: { type: 'string', required: true },
            // ... all fields
          }
        }
      }
    }
  },
  // ... other chapters
};

export function validateChapter(
  chapter: ChapterKey,
  data: any
): boolean {
  // Validate COMPLETE chapter state against CHAPTER_SCHEMAS
  // Return false if invalid → store rejects patch
}
```

---

## 🎯 PART 1: SERVER SPECIFICATION (`/api/chat`) - v2.0 Base + v3.0 Evolution

### 1.1 Request Contract - v2.0 (unchanged)

```typescript
export interface ChatRequest {
  query: string;
  wizardState: {
    stateVersion: number;
    chapterAnswers?: Record<string, any>;  // ⚠️ Now typed as Partial<ChapterDataMap>
    mode?: "PREVIEW" | "PREMIUM";
  };
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: { type: string; confidence: number };
}
```

✅ **No change from v2.0**

### 1.2 Response Contract (SSE) - v2.0 (unchanged)

```typescript
export type ChatSSEEvent = 
  | { event: 'metadata'; data: MetadataEvent }
  | { event: 'patch'; data: PatchEvent }
  | { event: 'stream'; data: StreamEvent }
  | { event: 'done'; data: string }
  | { event: 'error'; data: ErrorEvent };
```

✅ **Structure unchanged from v2.0**

### 1.3 Server Responsibility - v2.0 + v3.0

```typescript
// /app/api/chat/route.ts

export async function POST(req: Request) {
  const { query, wizardState, mode } = await req.json();

  const response = new ReadableStream({
    async start(controller) {
      // 1. Classify intent (v2.0 - unchanged)
      const { intent, confidence } = await ProModel.classify(query, wizardState);

      // 2. Determine policy (v2.0 - unchanged)
      const policy = determinePolicy(intent, confidence, wizardState);

      // 3. Send metadata (v2.0 - unchanged)
      controller.enqueue(
        toSSE('metadata', {
          intent,
          confidence,
          policy,
          stateVersion: wizardState.stateVersion,
        })
      );

      // 4. IF VULLEN_DATA: Generate patches (v3.0 - now VALIDATED)
      if (policy === 'APPLY_OPTIMISTIC' || policy === 'APPLY_WITH_INLINE_VERIFY') {
        const patches = await ProModel.generatePatches(query, wizardState);
        
        // ⚠️ DEVIATION: ProModel must now emit only 'set' | 'append' | 'remove'
        // (not 'add'). If it tries to emit 'add', normalize to 'append'.
        
        for (const patch of patches) {
          // ⚠️ NEW: Validate patch before sending
          if (!validateChapter(patch.chapter, applyDelta(
            wizardState.chapterAnswers[patch.chapter] || {},
            patch.delta
          ))) {
            console.warn(`[API] Rejecting invalid patch for ${patch.chapter}`);
            continue;
          }
          
          controller.enqueue(toSSE('patch', patch));
        }
      }

      // 5. Stream response (v2.0 - unchanged)
      // ...
    }
  });

  return new Response(response, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

---

## 🎯 PART 2: CLIENT SPECIFICATION (`ChatPanel.tsx`) - v2.0 Base + v3.0 Store

### 2.1 SSE Event Handling - v2.0 (mostly unchanged)

```typescript
// components/chat/ChatPanel.tsx

const handleSSEChunk = useCallback(
  (event: ChatSSEEventName, rawData: string) => {
    switch (event) {
      case 'metadata': {
        // v2.0 - unchanged
        const { policy } = JSON.parse(rawData);
        handlePolicy(policy);
        break;
      }

      case 'patch': {
        // ⚠️ DEVIATION: Patches now go through new applyPatch
        const patch = JSON.parse(rawData) as PatchEvent;
        
        // OLD v2.0: Various chapter-specific handlers
        // NEW v3.0: Unified handler
        const applyPatch = useWizardState(s => s.applyPatch);
        applyPatch(patch.chapter, patch.delta);  // ⚠️ NEW
        break;
      }

      case 'stream': {
        // v2.0 - unchanged
        appendStream(data.text);
        break;
      }
    }
  },
  [appendStream, goToChapter, applyPatch, stopStreaming]  // ⚠️ applyPatch now in deps
);
```

✅ **Policy tree logic unchanged**  
⚠️ **Patch handling now unified via store**

### 2.2 Store Integration - v3.0 NEW

```typescript
// lib/stores/useWizardState.ts

interface WizardActions {
  // v2.0 actions (kept for compatibility)
  setChapterFlow: (flow: ChapterKey[]) => void;
  goToChapter: (chapter: ChapterKey) => void;

  // ⚠️ NEW v3.0: Generic chapter updater
  updateChapterData: <K extends ChapterKey>(
    chapter: K,
    updater: (prev: ChapterData<K>) => ChapterData<K>
  ) => void;

  // ⚠️ NEW v3.0: AI translator (uses updateChapterData internally)
  applyPatch: (chapter: ChapterKey, delta: PatchDelta) => void;
}

// Implementation
const store = create<WizardStore>()(
  persist(
    (set, get) => ({
      // v2.0 state
      stateVersion: 1,
      chapterAnswers: {},  // ⚠️ Now typed as Partial<ChapterDataMap>
      currentChapter: undefined,
      chapterFlow: [],

      // ⚠️ NEW: Universal patch transformer
      applyPatch: (chapter, delta) =>
        set((state) => {
          const prev = (state.chapterAnswers[chapter] ?? {}) as any;
          const next = transformWithDelta(prev, delta);  // ⚠️ Helper function

          // ⚠️ NEW: Validate COMPLETE chapter state
          if (!validateChapter(chapter, next)) {
            console.warn(`[Store] Rejecting invalid patch for ${chapter}`);
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

      // ⚠️ NEW: Generic updater for UI components
      updateChapterData: (chapter, updater) =>
        set((state) => {
          const prev = (state.chapterAnswers[chapter] ?? {}) as any;
          const next = updater(prev);

          if (!validateChapter(chapter, next)) {
            console.warn(`[Store] updateChapterData rejected for ${chapter}`);
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
    }),
    { name: 'brikx-wizard-state', version: 1 }
  )
);
```

---

## 🎯 PART 3: COMPONENTS - v2.0 Patterns + v3.0 Unification

### 3.1 v2.0 Pattern (What NOT to do)

```typescript
// ❌ OLD (v2.0) - Various component-specific patterns
// Ruimtes.tsx used useState + direct setState
// Budget.tsx used patchChapterAnswer
// Wensen.tsx synced locally
// Result: Inconsistency, stale state bugs
```

### 3.2 v3.0 Pattern (What to do) - UNIFIED for All 7 Chapters

```typescript
// ✅ NEW (v3.0) - Same pattern for Basis, Ruimtes, Wensen, Budget, Techniek, Duurzaam, Risico

'use client';

import React, { useMemo } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey, ChapterData } from '@/types/chat';

export default function ChapterTemplate() {
  const chapter: ChapterKey = 'ruimtes';  // ⚠️ Example: ruimtes

  // 1. Read data
  const chapterData = useWizardState((s) => s.chapterAnswers[chapter]);
  const items = useMemo(() => chapterData?.rooms ?? [], [chapterData?.rooms]);

  // 2. Get updater
  const updateChapterData = useWizardState((s) => s.updateChapterData);

  // 3. Define operations (all using same updater)
  const add = () => {
    updateChapterData(chapter, (prev) => ({
      rooms: [
        ...prev.rooms,
        { id: crypto.randomUUID(), name: '', type: 'overig', ... }
      ],
    }));
  };

  const update = (id: string, patch: Partial<Room>) => {
    updateChapterData(chapter, (prev) => ({
      rooms: prev.rooms.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));
  };

  const remove = (id: string) => {
    updateChapterData(chapter, (prev) => ({
      rooms: prev.rooms.filter((r) => r.id !== id),
    }));
  };

  // 4. Render (using only above functions)
  return (
    <section>
      {/* UI here */}
    </section>
  );
}
```

⚠️ **DEVIATION:** All 7 components must follow this IDENTICAL pattern (vs v2.0's mixed approaches)

---

## ⚠️ MIGRATION GUIDE: v2.0 → v3.0

### What v2.0 Teams Need to Know

| v2.0 Pattern | v3.0 Equivalent | Status |
|--------------|-----------------|--------|
| `patchChapterAnswer(chapter, { field: value })` | `updateChapterData(chapter, prev => ({ ...prev, field: value }))` | Replace |
| Direct `useWizardState.setState()` | Use `updateChapterData` + `applyPatch` only | Replace |
| `useState` in components | Use `useWizardState` selectors | Replace |
| `operation: 'add'` | `operation: 'append'` | Normalize |
| Multiple component patterns | Use UNIFIED pattern above | Standardize |

### Backwards Compatibility

✅ **Policy tree logic:** Unchanged  
✅ **SSE streaming:** Unchanged  
✅ **Conflict detection:** Unchanged  
✅ **Intent classification:** Unchanged

⚠️ **New:** Type validation layer (rejecting invalid patches)  
⚠️ **New:** Unified operation set (set|append|remove)  
⚠️ **New:** Chapter property naming standardized

---

## 📋 SUMMARY

| Aspect | v2.0 | v3.0 | Status |
|--------|------|------|--------|
| AI-First Triage | ✅ Core concept | ✅ Unchanged | ✅ Keep |
| SSE Streaming | ✅ Implemented | ✅ Unchanged | ✅ Keep |
| Policy Tree | ✅ Implemented | ✅ Unchanged | ✅ Keep |
| Data Contracts | ⚠️ Implicit | ✅ Explicit | ⚠️ Add |
| Patch Operations | ⚠️ 4 types | ✅ 3 types | ⚠️ Normalize |
| Component Patterns | ⚠️ Mixed | ✅ Unified | ⚠️ Refactor |
| Validation | ❌ None | ✅ Centralized | ⚠️ Add |

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create `types/project.ts` with all 7 ChapterData types
- [ ] Create `types/chat.ts` importing from project.ts
- [ ] Create `CHAPTER_SCHEMAS.ts` with validators
- [ ] Rewrite `useWizardState.ts` with new functions
- [ ] Update all 7 components to use UNIFIED pattern
- [ ] Update ProModel to emit ONLY 'set' | 'append' | 'remove'
- [ ] Update ChatPanel to use new applyPatch
- [ ] Add validateChapter checks in store
- [ ] Add tests for all chapter types
- [ ] Verify no "add" operations in codebase

---

**Build Protocol v3.0 - Ready for Implementation** ✅
