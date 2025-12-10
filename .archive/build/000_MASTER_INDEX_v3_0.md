# 📑 BRIKX MASTER INDEX v3.0
**Version:** 3.0 (Evolution of v2.0)  
**Baseline:** Master Index v2.0 (AI-First Triage canonical)  
**Evolution:** Type-driven "Shared Brain" architecture  
**Status:** ✅ Complete + Ready for Implementation

---

## 🎯 QUICK START

### New to v3.0?

1. **Read:** This document (10 min)
2. **Understand:** [BUILD_MANIFEST_v3.0_LOCKED_FINAL.md](./BRIKX_BUILD_MANIFEST_v3_0_LOCKED_FINAL.md) (15 min)
3. **Implement:** [IMPLEMENTATION_CHECKLIST_v3_0.md](./IMPLEMENTATION_CHECKLIST_v3_0.md) (start Day 1)

### Returning from v2.0?

- **No changes to AI logic** ✅
- **New: Type-driven data layer** ⚠️
- **New: Unified component pattern** ⚠️
- **All deviations marked with ⚠️**

---

## 📦 DOCUMENT STRUCTURE

### Layer 0: Current Status (Read First for Existing Projects)

#### 0.1 IMPLEMENTATION_STATUS_v4_0.md
- **What:** Comprehensive audit of current implementation vs v3.0 specification
- **Length:** 25 KB
- **Purpose:** Shows what's implemented, what works, and what's different
- **Status:** ✅ 95% v3.0 Complete + v4.0 Enhancements
- **When:** Read this first if evaluating existing codebase
- **Contains:**
  - ✅ Phase 0-2 completion status
  - ✅ v4.0 enhancements (AnswerGuard, leefprofielen, MoSCoW)
  - ⚠️ Known gaps and workarounds
  - 🚀 Production readiness assessment

**Start here if:** You want to know current implementation status

---

### Layer 1: Foundation (Read First for New Projects)

#### 1.1 BUILD_MANIFEST_v3.0_LOCKED_FINAL.md
- **What:** Architecture definition + contracts
- **Length:** 25 KB
- **Purpose:** Single source of truth for all types, schemas, store functions
- **When:** Read once, reference often
- **Contains:**
  - ✅ All 7 chapter types (BasisData, RuimtesData, etc)
  - ✅ ChapterDataMap + ChapterKey definitions
  - ✅ PatchDelta operations (set|append|remove only)
  - ✅ Store pattern template
  - ✅ Component pattern template

**Start here if:** You need to understand v3.0 architecture

---

#### 1.2 BRIKX_BUILD_PROTOCOL_v3.0_TECHNICAL_SPEC.md
- **What:** Technical implementation specification
- **Length:** 35 KB
- **Purpose:** How to implement v3.0 on top of v2.0
- **When:** Reference while coding
- **Contains:**
  - ✅ Part 0: Constitution (types/schemas)
  - ✅ Part 1: Server (unchanged v2.0 + v3.0 validation)
  - ✅ Part 2: Client (ChatPanel + new store)
  - ✅ Part 3: Components (unified pattern)
  - ✅ Migration guide v2.0 → v3.0
  - ⚠️ All deviations from v2.0 marked

**Start here if:** You're implementing code

---

### Layer 2: Execution (Day-by-Day)

#### 2.1 IMPLEMENTATION_CHECKLIST_v3_0.md
- **What:** Day-by-day task list
- **Length:** 40 KB
- **Timeline:** 20 days (Phase 0+1+2)
- **Structure:**
  - Phase 0 (Days 1-3): Constitution
  - Phase 1 (Days 4-13): Core build
  - Phase 2 (Days 14-20): Features
- **Each day has:**
  - Owner
  - Files to change
  - Acceptance criteria
  - Go/No-go gates

**Use this:** As your daily reference

---

### Layer 3: Reference (Historical + v2.0 Canon)

#### 3.1 BRIKX_BUILD_PROTOCOL_v2_0_TECHNICAL_SPEC.md (v2.0 - ARCHIVED)
- **Status:** Historical reference only
- **Still valid for:** AI-First Triage logic, SSE patterns, policy tree
- **Obsolete for:** Data contracts, component patterns, store design
- **Keep because:** Foundation for v3.0, useful for understanding evolution

---

#### 3.2 IMPLEMENTATION_CHECKLIST_COMPLETE_v2_0.md (v2.0 - ARCHIVED)
- **Status:** Historical reference only
- **Still relevant:** Week 1-2 concepts (core build)
- **Obsolete:** Overall structure (missing Phase 0, mixed patterns)
- **Use v3.0 instead** for new implementations

---

#### 3.3 DAILY_STANDUP_REFERENCE.md (v2.0 - ARCHIVED)
- **Status:** Partial reference
- **Still relevant:** Week 1-2 standup templates
- **Needs update:** Missing Phase 0 standups, v3.0 pattern standups

---

### Layer 4: Features (Compatible with v3.0)

These documents are **independent of internal architecture**. Use as-is on top of v3.0 foundation.

#### 4.1 BRIKX_PROMPT_PACK_v4_0.md
- **What:** AI prompts for Pro-model
- **Compatibility:** ✅ Works with v3.0
- **When:** Reference while building ProModel

---

#### 4.2 EXPERT_CORNER_IMPLEMENTATION_PLAN.md
- **What:** Proactive guidance UI component
- **Compatibility:** ✅ Works with v3.0
- **When:** Implement in Phase 2 (Day 14+)

---

#### 4.3 STARTUP_SEQUENCE_SPEC.md
- **What:** Welcome experience
- **Compatibility:** ✅ Works with v3.0
- **When:** Implement in Phase 2 (Day 14+)

---

#### 4.4 MOTIVATION_AND_POLISH_SPEC.md
- **What:** Progress system + visual identity
- **Compatibility:** ✅ Works with v3.0
- **When:** Implement in Phase 2 (Day 18+)

---

## 🗺️ ARCHITECTURE OVERVIEW

### v2.0 → v3.0 Evolution

```
v2.0 (Canonical - Nov 3-14)
├── AI-First Triage
│   ├── Server classification
│   ├── Policy tree
│   └── Context-aware nudge
├── Smart Client
│   ├── SSE streaming
│   ├── Conflict detection
│   └── State versioning
└── Features (Week 3-4)
    ├── ExpertCorner
    ├── Startup
    └── Motivation+Polish

                    ⬇️ EVOLUTION ⬇️

v3.0 (v2.0 + Type Layer - Nov 17+)
├── v2.0 AI-First Triage ✅ (unchanged)
├── v2.0 Smart Client ✅ (mostly unchanged)
├── Type-Driven Architecture ⚠️ (NEW)
│   ├── Constitution (Phase 0)
│   │   ├── types/project.ts (all 7 chapters)
│   │   ├── types/chat.ts (contracts)
│   │   └── CHAPTER_SCHEMAS.ts (validation)
│   ├── Unified Store ⚠️ (NEW)
│   │   ├── updateChapterData()
│   │   ├── applyPatch()
│   │   └── validateChapter()
│   └── Unified Components ⚠️ (NEW)
│       └── Same pattern for all 7 chapters
└── Features (Phase 2 - unchanged)
    ├── ExpertCorner ✅
    ├── Startup ✅
    └── Motivation+Polish ✅
```

---

## 🎯 DECISION TREE

### "Should I use v2.0 or v3.0?"

**Use v2.0 if:**
- ❌ You only have 2 weeks
- ❌ You prefer loose data contracts
- ❌ You want to mix component patterns

**Use v3.0 if:**
- ✅ You have 3+ weeks
- ✅ You want strict type safety
- ✅ You want elimination of stale state bugs
- ✅ You want production-quality codebase

**Recommendation:** v3.0 (recommended) - Only 3 extra days for Phase 0, huge payoff

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 0: Constitution (Days 1-3)
**Owner:** Backend + Frontend together  
**Goal:** Establish single source of truth

```
Day 1: Create types/project.ts, types/chat.ts
Day 2: Create CHAPTER_SCHEMAS.ts with validators
Day 3: Rewrite useWizardState.ts with new functions
```

✅ **After Phase 0:**
- All 7 chapters have strict types
- Data validation is centralized
- Store functions are in place

---

### Phase 1: Core Build (Days 4-13)
**Owner:** Backend (Days 4-5) → Frontend (Days 6-9) → All (Days 10-13)  
**Goal:** Implement v2.0 AI-First Triage on v3.0 foundation

```
Days 4-5:  Server setup (types + AI + SSE)
Days 6-9:  Client setup (ChatPanel + components)
Days 10-13: Integration + conflict detection + release v1.0
```

✅ **After Phase 1:**
- Core v1.0 fully functional
- All 7 components using unified pattern
- No data desync bugs

---

### Phase 2: Features (Days 14-20)
**Owner:** Frontend  
**Goal:** Add v2.0 features on v3.0 foundation

```
Days 14-16: ExpertCorner
Days 17-19: Startup + Motivation
Day 20:     Polish + v1.2 release
```

✅ **After Phase 2:**
- Production-ready v1.2
- All features from v2.0 plan implemented
- State-of-the-art UX

---

## 🔄 COMPATIBILITY MATRIX

| Feature | v2.0 | v3.0 | Status |
|---------|------|------|--------|
| AI-First Triage | ✅ | ✅ | Same logic |
| SSE Streaming | ✅ | ✅ | Same implementation |
| Policy Tree | ✅ | ✅ | Same algorithm |
| Conflict Detection | ✅ | ✅ | Same mechanism |
| **Types/Contracts** | ⚠️ Implicit | ✅ Explicit | **NEW** |
| **Patch Operations** | ⚠️ 4 types | ✅ 3 types | **STANDARDIZED** |
| **Component Pattern** | ⚠️ Mixed | ✅ Unified | **UNIFIED** |
| **Data Validation** | ❌ None | ✅ Centralized | **NEW** |
| ExpertCorner | ✅ | ✅ | Compatible |
| Startup Sequence | ✅ | ✅ | Compatible |
| Motivation System | ✅ | ✅ | Compatible |

---

## 📊 EFFORT ESTIMATE

### v2.0 Plan (2 weeks - Core Only)
- Server: 3 days
- Client: 3 days
- Integration: 4 days
- **Total:** 10 days

### v3.0 Plan (3 weeks - Core + Type Layer)
- **Phase 0 (NEW):** 3 days
- Server: 3 days
- Client: 3 days
- Integration: 4 days
- **Total:** 13 days

### Difference
- **Extra effort:** +3 days (Phase 0)
- **Payoff:** Eliminates all stale state bugs, type safety, unified patterns
- **ROI:** 3 days investment → months of maintenance savings

---

## ✅ FILE CHECKLIST

### Current Status (v4.0)
- [x] IMPLEMENTATION_STATUS_v4_0.md (NEW - audit report)

### Must Have (v3.0 Core)
- [x] BRIKX_BUILD_MANIFEST_v3_0_LOCKED_FINAL.md
- [x] BRIKX_BUILD_PROTOCOL_v3_0_TECHNICAL_SPEC.md
- [x] IMPLEMENTATION_CHECKLIST_v3_0.md
- [x] 000_MASTER_INDEX_v3_0.md (this file)

### Reference (v2.0 Baseline)
- [x] BRIKX_BUILD_PROTOCOL_v2_0_TECHNICAL_SPEC.md
- [x] IMPLEMENTATION_CHECKLIST_COMPLETE_v2_0.md
- [x] DAILY_STANDUP_REFERENCE.md

### Features (Works with Both)
- [x] BRIKX_PROMPT_PACK_v4_0.md
- [x] EXPERT_CORNER_IMPLEMENTATION_PLAN.md
- [x] STARTUP_SEQUENCE_SPEC.md
- [x] MOTIVATION_AND_POLISH_SPEC.md

---

## 🚀 HOW TO START

### For Project Leads
1. Read this MASTER_INDEX (10 min)
2. Read BUILD_MANIFEST_v3_0 (15 min)
3. Decide: v2.0 (2 weeks) or v3.0 (3 weeks)?
4. Share relevant docs with team
5. Schedule kickoff

### For Backend Developers
1. Read BUILD_PROTOCOL_v3_0 Part 0 (Constitution)
2. Follow IMPLEMENTATION_CHECKLIST Days 1-5
3. Create: types/project.ts → CHAPTER_SCHEMAS.ts → ProModel updates

### For Frontend Developers
1. Read BUILD_PROTOCOL_v3_0 Part 2-3 (Client + Components)
2. Follow IMPLEMENTATION_CHECKLIST Days 1-9
3. Create: types/chat.ts → useWizardState.ts → all 7 components

### For QA
1. Read BUILD_MANIFEST_v3_0 (understand contracts)
2. Follow IMPLEMENTATION_CHECKLIST Days 8-13 (test plan)
3. Create E2E tests for all 7 chapters

---

## 📞 QUESTIONS?

### "Which docs do I read?"

**Evaluating existing project:** IMPLEMENTATION_STATUS_v4_0 (current state)
**Starting new project:** MASTER_INDEX_v3_0 (this file)
**Then:** BUILD_MANIFEST_v3_0 (architecture)
**Then:** BUILD_PROTOCOL_v3_0 (implementation)
**Then:** CHECKLIST_v3_0 (daily tasks)

### "How is v3.0 different from v2.0?"

**Same:** AI logic, SSE, policy tree  
**New:** Types, schemas, unified patterns, validation  
**Benefit:** No stale state bugs, type safety, consistency

### "Can I use just v2.0?"

Yes, but:
- More stale state bugs likely
- Less type safety
- Inconsistent component patterns
- More maintenance work

### "Do I need all 4 weeks?"

- Week 1 (Phase 0): MUST (constitution)
- Weeks 2-3 (Phase 1): MUST (core build)
- Week 4 (Phase 2): OPTIONAL (features)

Minimum: 2 weeks (Days 1-13 for core v1.0)  
Recommended: 3 weeks (all phases for v1.2)

### "Can I skip Phase 0?"

No. If you skip:
- You'll spend Phase 1 fixing desync bugs
- Components will still use mixed patterns
- Data validation won't exist
- You'll end up rebuilding (worse timeline)

Just do Phase 0 (3 days). It saves weeks of debugging.

---

## 🎯 FINAL DECISION

### Ready to start v3.0?

**Prerequisites:**
- [ ] Dev environment set up
- [ ] Git repo ready
- [ ] Team assigned (backend + frontend)
- [ ] This MASTER_INDEX reviewed by team
- [ ] BUILD_MANIFEST_v3_0 understood

**If all checked:** You're ready for Day 1 ✅

**If not all checked:** Review requirements before starting

---

## 📊 SUCCESS CRITERIA

### End of Phase 0 (Day 3)
✅ All types compile  
✅ Schemas validate correctly  
✅ Store functions work

### End of Phase 1 (Day 13)
✅ v1.0 fully functional  
✅ All 7 components use unified pattern  
✅ E2E tests pass  
✅ Zero stale state bugs

### End of Phase 2 (Day 20)
✅ v1.2 production-ready  
✅ All features working  
✅ Deployment ready

---

## 🏆 WHAT YOU'LL HAVE

**After v3.0 Implementation:**

✅ Strict type safety (no "any" in wizard code)  
✅ Single source of truth (one ChapterDataMap)  
✅ Unified patterns (all 7 chapters identical)  
✅ Automatic validation (invalid patches rejected)  
✅ Zero stale state bugs  
✅ Maintainable codebase  
✅ Production-ready features  

---

**MASTER_INDEX v3.0 - Complete Navigation Hub** ✅  
**Ready to Build with v3.0** 🚀
