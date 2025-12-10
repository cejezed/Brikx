# 📋 IMPLEMENTATION_CHECKLIST v3.0
**Version:** 3.0 (Evolution of v2.0 Week 1-2 plan)  
**Baseline:** IMPLEMENTATION_CHECKLIST_COMPLETE_v2.0  
**Change:** Adds Phase 0 (Constitution) before core build  
**Timeline:** 4 weeks (vs v2.0's 2 weeks for core only)

---

## 🎯 3-PHASE STRUCTURE

### Phase 0: Constitution (NEW - Days 1-3)
Build the data contract layer that v2.0 lacked.

### Phase 1: Core Build (v2.0 Week 1-2 - Days 4-13)
Implement AI-First Triage on top of solid types.

### Phase 2: Integration (v2.0 Week 3-4 adapted - Days 14-20)
Add components, polish, features.

---

## 🏛️ PHASE 0: CONSTITUTION (Days 1-3)

**Goal:** Establish single source of truth before any implementation.  
**Effort:** 3 days (backend + frontend alignment)  
**Blocker:** Must complete before Phase 1 starts

---

### DAY 1: Types & Schemas
**Owner:** Backend + Frontend  
**Files:** `types/project.ts`, `types/chat.ts`, `lib/wizard/CHAPTER_SCHEMAS.ts`

✅ **COMPLETED:**
- [ ] Create `types/project.ts` with all 7 ChapterData types
  - [ ] BasisData (projectType required)
  - [ ] RuimtesData (rooms array)
  - [ ] WensenData (wishes array)
  - [ ] BudgetData
  - [ ] TechniekData
  - [ ] DuurzaamData
  - [ ] RisicoData
- [ ] Create ChapterDataMap union type
- [ ] Create ChapterKey = keyof ChapterDataMap
- [ ] Create PatchDelta with 'set' | 'append' | 'remove' only

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (none)

📊 **ACCEPTANCE CRITERIA:**
```bash
# TypeScript check passes
npm run type-check

# All types importable and correct
import type { BasisData, RuimtesData, ChapterDataMap } from '@/types/project';

# PatchDelta is correctly defined
type TestPatch = PatchDelta;  // Should compile
```

---

### DAY 2: Validation Schemas
**Owner:** Backend  
**Files:** `lib/wizard/CHAPTER_SCHEMAS.ts`, `lib/wizard/validateChapter.ts`

✅ **COMPLETED:**
- [ ] Create CHAPTER_SCHEMAS with JSONSchema for all 7 chapters
- [ ] Implement validateChapter(chapter, data) function
- [ ] Test validation with sample data
  - [ ] Valid BasisData passes
  - [ ] Invalid BasisData fails
  - [ ] Valid RuimtesData with rooms array passes
  - [ ] Missing required fields fails
- [ ] Create test file: `__tests__/schemas/chapter-validation.test.ts`

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (none)

📊 **ACCEPTANCE CRITERIA:**
```bash
# Tests pass
npm run test -- chapter-validation

# Sample validations work
validateChapter('basis', { projectType: 'verbouwing' }) === true
validateChapter('basis', { projectType: 'invalid' }) === false
validateChapter('ruimtes', { rooms: [...] }) === true
```

---

### DAY 3: Store Foundation
**Owner:** Frontend  
**Files:** `lib/stores/useWizardState.ts`

✅ **COMPLETED:**
- [ ] Rewrite useWizardState with transformWithDelta helper
- [ ] Implement updateChapterData<K>(chapter, updater) generic
- [ ] Implement applyPatch(chapter, delta) with validation
- [ ] Add stateVersion increment on all mutations
- [ ] Create test file: `__tests__/stores/useWizardState.test.ts`

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (none)

📊 **ACCEPTANCE CRITERIA:**
```bash
# Store TypeScript types are correct
import type { WizardStore } from '@/lib/stores/useWizardState';

# Tests pass
npm run test -- useWizardState

# Manual test: updateChapterData works
updateChapterData('basis', prev => ({
  ...prev,
  projectNaam: 'Test Project'
}))

# Manual test: applyPatch works
applyPatch('ruimtes', {
  path: 'rooms',
  operation: 'append',
  value: { id: '1', name: 'Bedroom', ... }
})
```

---

## ⚠️ PHASE 1: CORE BUILD (Days 4-13)
**Baseline:** BRIKX_BUILD_PROTOCOL_v2.0 (all v2.0 logic unchanged)  
**Deviations:** Only the data layer (types/store) is new; AI/SSE/policy unchanged

### Structure
- Days 4-5: Server setup (AI, SSE) on top of new types
- Days 6-9: Client setup (ChatPanel) with new applyPatch
- Days 10-13: Integration testing, conflict detection

---

### DAY 4: Server Types & Contracts
**Owner:** Backend  
**Files:** `types/chat.ts`, `app/api/chat/route.ts`

✅ **COMPLETED:**
- [ ] Verify ChatRequest interface (unchanged from v2.0)
  - [ ] wizardState now has Partial<ChapterDataMap> type
  - [ ] stateVersion is required
- [ ] Verify ChatSSEEvent interface (unchanged from v2.0)
- [ ] Create helper: toSSE(event, data)
- [ ] Implement transformWithDelta helper in store (uses only 'set'|'append'|'remove')

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (none)

📊 **ACCEPTANCE CRITERIA:**
```bash
# Compile check
npm run type-check

# ToSSE helper works
toSSE('patch', { chapter: 'ruimtes', delta: {...} })
```

---

### DAY 5: Server - AI Classification & Policy
**Owner:** Backend  
**Files:** `lib/ai/ProModel.ts`, `app/api/chat/route.ts`

✅ **COMPLETED (v2.0 - Unchanged):**
- [ ] ProModel.classify(query, wizardState)
- [ ] Intent detection: VULLEN_DATA | ADVIES_VRAAG | NAVIGATIE | NUDGE | SMALLTALK
- [ ] Confidence scoring (0.0-1.0)
- [ ] determinePolicy() function
- [ ] Context-aware nudge generation
- [ ] SSE stream writer

⚠️ **NEW in v3.0:**
- [ ] ProModel.generatePatches() ONLY emits 'set' | 'append' | 'remove'
  - [ ] If any "add" operations exist, normalize to "append"
  - [ ] Add comment: "⚠️ v3.0 deviation from v2.0"

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (if OpenAI API not ready)

📊 **ACCEPTANCE CRITERIA:**
```bash
# Test classification
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "3 slaapkamers",
    "wizardState": { "stateVersion": 1, "chapterAnswers": {} },
    "mode": "PREVIEW"
  }' 2>&1 | grep "VULLEN_DATA"

# Expected: Event includes policy classification
```

---

### DAY 6: Client - ChatPanel Setup
**Owner:** Frontend  
**Files:** `components/chat/ChatPanel.tsx`

✅ **COMPLETED (v2.0 - Mostly unchanged):**
- [ ] SSE event parser
- [ ] Message streaming display
- [ ] Toast system for inline verification
- [ ] Conflict detection (stateVersion mismatch)

⚠️ **CHANGED in v3.0:**
- [ ] Patch handling now uses unified applyPatch (not chapter-specific handlers)
- [ ] Remove all `patchChapterAnswer` calls
- [ ] Add applyPatch to dependencies

📊 **ACCEPTANCE CRITERIA:**
```bash
npm run dev
# Open http://localhost:3000/wizard
# Send: "Ik wil een grote woonkamer"
# Verify:
#   - Message appears immediately
#   - Response streams (not instant)
#   - No TypeScript errors
#   - Toast shows for verification
```

---

### DAY 7: Components - UNIFIED Pattern for All 7
**Owner:** Frontend  
**Files:** All in `components/chapters/`

✅ **COMPLETED:**
- [ ] ChapterBasis.tsx - Use updateChapterData
- [ ] Ruimtes.tsx - Use updateChapterData (rooms array)
- [ ] Wensen.tsx - Use updateChapterData (wishes array)
- [ ] Budget.tsx - Use updateChapterData
- [ ] Techniek.tsx - Use updateChapterData
- [ ] Duurzaam.tsx - Use updateChapterData
- [ ] Risico.tsx - Use updateChapterData (risks array)

⚠️ **CRITICAL:**
- [ ] NO useState for wizard data
- [ ] NO direct setState calls
- [ ] NO patchChapterAnswer
- [ ] All 7 use IDENTICAL pattern from BUILD_PROTOCOL_v3.0

📊 **ACCEPTANCE CRITERIA:**
```bash
# All components compile
npm run type-check

# Component tests pass
npm run test -- components/chapters

# Manual: Add/edit/remove works in each chapter without state desync
```

---

### DAY 8: Store Integration Tests
**Owner:** Frontend  
**Files:** `__tests__/integration/store-and-components.test.ts`

✅ **COMPLETED:**
- [ ] Test: updateChapterData works for all 7 chapters
- [ ] Test: applyPatch validates before accepting
- [ ] Test: Invalid patches are rejected
- [ ] Test: stateVersion increments on each mutation
- [ ] Test: Zustand subscribers are notified
- [ ] Test: No stale state bugs in arrays

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (if store has bugs)

📊 **ACCEPTANCE CRITERIA:**
```bash
npm run test -- store-and-components

# All tests pass
# Coverage > 80%
```

---

### DAY 9: E2E Test - Full Chat to Component Update
**Owner:** QA / Frontend  
**Files:** `__tests__/e2e/chat-to-component.test.ts`

✅ **COMPLETED:**
- [ ] E2E test: "3 slaapkamers" → server generates patch → store applies → Ruimtes.tsx shows 3 rooms
- [ ] E2E test: "Budget 250k" → patch → Budget.tsx shows 250000
- [ ] E2E test: Invalid patch → rejected → no UI update
- [ ] E2E test: Conflict detection (stateVersion mismatch) → retry works

🚧 **IN PROGRESS:**
- [ ] (none)

❌ **BLOCKED:**
- [ ] (if server/client desync)

📊 **ACCEPTANCE CRITERIA:**
```bash
npm run test:e2e

# All E2E tests pass
# No flakiness
```

---

### DAY 10: Conflict Detection & Versioning
**Owner:** Backend + Frontend  
**Files:** `lib/ai/conflict.ts`, `components/chat/ChatPanel.tsx`

✅ **COMPLETED (v2.0 - Mostly unchanged):**
- [ ] Detect stateVersion mismatch
- [ ] Implement exponential backoff retry
- [ ] Max 3 retries
- [ ] Rollback on failure
- [ ] User notification via toast

⚠️ **NEW:**
- [ ] Validation layer now PREVENTS invalid patches (earlier catch)

📊 **ACCEPTANCE CRITERIA:**
```bash
# Simulate concurrent updates
# Verify retry mechanism works
# Verify max 3 retries enforced
```

---

### DAY 11: Essentials & Missing Fields
**Owner:** Backend  
**Files:** `lib/wizard/computeMissingFields.ts`, `app/api/chat/route.ts`

✅ **COMPLETED (v2.0 - Mostly unchanged):**
- [ ] computeMissingFields() checks projectType
- [ ] ASK_CLARIFY policy when essentials missing
- [ ] Context-aware nudge includes original query
- [ ] NUDGE event sent instead of APPLY

⚠️ **NEW:**
- [ ] Essentials validated against typed structure
- [ ] computeMissingFields uses ChapterDataMap types

📊 **ACCEPTANCE CRITERIA:**
```bash
# Test without projectType
curl ... -d '{"query": "3 rooms", "wizardState": {"chapterAnswers": {}}}'

# Expected: ASK_CLARIFY policy, nudge asking for projectType
```

---

### DAY 12: RAG & Context
**Owner:** Backend  
**Files:** `lib/rag/Kennisbank.ts`, `app/api/chat/route.ts`

✅ **COMPLETED (v2.0 - Unchanged):**
- [ ] RAG metadata event
- [ ] Multi-dimensional tagging
- [ ] Nugget retrieval
- [ ] Premium vs Preview tiers

⚠️ **NEW:**
- [ ] RAG context aware of typed chapter data
- [ ] Can filter by chapter type

📊 **ACCEPTANCE CRITERIA:**
```bash
# Query RAG
npm run test -- Kennisbank

# Verify correct nuggets retrieved
```

---

### DAY 13: Alpha Test & Documentation
**Owner:** All  
**Files:** All above + docs

✅ **COMPLETED:**
- [ ] Code quality check: npm run lint
- [ ] Type check: npm run type-check
- [ ] All tests pass: npm run test
- [ ] Zero TypeScript errors
- [ ] README updated with v3.0 structure
- [ ] Team trained on new patterns

📊 **SIGN-OFF:**
```
✅ Phase 1 Complete - Core Build v1.0
Date: Day 13
Status: Ready for Phase 2
```

---

## 📊 PHASE 2: FEATURES & POLISH (Days 14-20)

**Note:** Days 14-20 follow v2.0 Week 3-4 structure (ExpertCorner, Startup, Motivation, Polish)

No changes needed for these phases - they layer on top of v3.0 type-driven architecture.

- Days 14-16: ExpertCorner implementation
- Days 17-19: Startup sequence + motivation system
- Day 20: Polish & release v1.2

---

## ✅ MASTER CHECKLIST

### Phase 0: Constitution ✅
- [ ] Types defined (all 7 chapters)
- [ ] Schemas validated
- [ ] Store core functions tested

### Phase 1: Core Build ✅
- [ ] Server classification + policy (v2.0 logic)
- [ ] Client SSE streaming (v2.0 logic)
- [ ] All 7 components using unified pattern (v3.0 new)
- [ ] Store applyPatch with validation (v3.0 new)
- [ ] E2E tests passing

### Phase 2: Features
- [ ] ExpertCorner (v2.0 plan)
- [ ] Startup sequence (v2.0 plan)
- [ ] Progress system (v2.0 plan)
- [ ] Polish (v2.0 plan)

---

## 🚀 GO/NO-GO DECISION POINTS

### End of Day 3 (Constitution)
- **GO:** All types compile, schemas validate
- **NO-GO:** TypeScript errors, validation broken

### End of Day 13 (Core Build)
- **GO:** E2E tests pass, all components use unified pattern
- **NO-GO:** Any chapter still using old patterns, data desync issues

### End of Day 20 (Full Build)
- **GO:** All features implemented, no regressions
- **NO-GO:** Conflicts with v2.0 logic, performance issues

---

## 📞 ESCALATION

If blocked:
1. Check BRIKX_BUILD_PROTOCOL_v3.0_TECHNICAL_SPEC.md
2. Verify all 7 chapters follow SAME pattern
3. Check validateChapter is being called
4. Verify no "add" operations in ProModel output

If still blocked → Message with:
- What you're trying to do
- Error message
- What you've tried

---

**IMPLEMENTATION_CHECKLIST v3.0 - Ready for Teams** ✅
