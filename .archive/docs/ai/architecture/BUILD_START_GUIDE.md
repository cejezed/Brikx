# 🚀 BRIKX v3.1 BUILD START GUIDE
**Voor: Claude in VS Code**  
**Doel: Gecontroleerde implementatie Architect Intelligence Layer**  
**Datum: 11 December 2025**

---

## 🎯 OVERZICHT

Deze guide bevat **exacte prompts** om Claude in VS Code stap-voor-stap te laten bouwen met **maximale controle**.

### Wat je hebt:
✅ Volledige documentatie (11 markdown files)  
✅ Bestaande v3.0 codebase  
✅ 3-weeks implementatie checklist  
✅ Complete technische specificaties

### Wat je gaat doen:
1. **Week 1**: Database + Core modules (Memory, FieldWatcher, Anticipation, System)
2. **Week 2**: Behavior + Planning (BehaviorAnalyzer, TurnPlanner, Context)
3. **Week 3**: Quality + Integration (AnswerGuard, Fallback, Tests)

### Controle strategie:
- **Kleine iteraties** (1 module per sessie)
- **Reviewable changes** (max 500 lines per commit)
- **Test-first approach** (tests voor implementatie)
- **Incremental integration** (geen big-bang)

---

## 📚 DOCUMENTATIE STRUCTUUR

Deze bestanden staan in je project folder:

```
/docs/v3.1/
├── BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md      # Technische bible
├── BRIKX_BUILD_MANIFEST_v3_1_LOCKED_FINAL.md        # Requirements
├── BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md    # Dag-voor-dag taken
├── BRIKX_PROMPT_PACK_v4_1.md                        # LLM prompts
├── DEEL_VII_RESPONSE_ORCHESTRATOR_v3_1.md           # Orchestrator spec
├── DEEL_VIII_ANSWERGUARD_SAFETY_GUARDRAILS_v3_1.md  # Guards spec
└── Architect_Intelligence_KnowledgeBase_v3_1.md     # Domeinkennis
```

---

## 🎬 FASE 1: SETUP (Dag 1 - 2 uur)

### Prompt 1.1: Repository Voorbereiding

```
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md

Ik wil beginnen met Architect Intelligence Layer v3.1 implementatie.

TAAK: Setup Phase - Folders & Types

Volg exact Section 1 van de Implementation Checklist:
1. Maak alle benodigde folders in lib/ai/
2. Maak types/ai.ts met alle interfaces uit BUILD_PROTOCOL Section 2
3. Voeg TODO comments toe waar modules komen

CONSTRAINTS:
- Geen implementatie code, alleen structure
- Alle types moeten compilen
- Gebruik bestaande types/project.ts waar mogelijk

DELIVERABLE:
- Folder structure screenshot
- types/ai.ts bestand
- npm run type-check output (moet slagen)

Vraag voor bevestiging voordat je begint.
```

**Wat je checkt:**
- ✅ Folders correct aangemaakt
- ✅ Geen duplicate types
- ✅ TypeScript compileert
- ✅ Geen breaking changes in bestaande code

---

### Prompt 1.2: Database Schema

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.7)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Section 2.1)

TAAK: Supabase conversation_history table

1. Maak migration file: supabase/migrations/YYYYMMDD_conversation_history.sql
2. Implementeer exact de schema uit BUILD_PROTOCOL Section 4.7
3. Voeg RLS policies toe
4. Test met supabase db reset

CONSTRAINTS:
- Schema EXACT zoals gespecificeerd
- RLS policies MOETEN auth.uid() gebruiken
- Indexes voor performance (user_id, project_id, created_at)

DELIVERABLE:
- Migration file
- Test query output (SELECT * FROM conversation_history LIMIT 1)

Stop na migration, wacht op mijn review.
```

**Wat je checkt:**
- ✅ Schema matched specification
- ✅ RLS policies correct
- ✅ Migration succesvol
- ✅ Geen data loss risk

---

## 🎬 FASE 2: WEEK 1 - FUNDAMENTALS (Dag 2-5)

### Prompt 2.1: ConversationMemory (Dag 2 - 4 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.7)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 1 tasks)

TAAK: Implementeer lib/ai/ConversationMemory.ts

SPECIFICATION:
- Database-backed (Supabase)
- load() method: fetch recent 20 turns
- addTurn() method: persist new turn
- getRelevantContext() method: semantic search (keyword-based v1)

CONSTRAINTS:
- Volg EXACT het interface uit BUILD_PROTOCOL
- Gebruik bestaande supabase client
- Error handling: never throw, return safe defaults
- TypeScript strict mode

TEST-FIRST:
Schrijf eerst __tests__/ai/ConversationMemory.test.ts met:
1. load() with empty history
2. load() with 20+ turns (should return only 20)
3. addTurn() persists correctly
4. getRelevantContext() returns relevant turns

Dan implementeer totdat tests groen zijn.

DELIVERABLE:
- ConversationMemory.ts (max 200 lines)
- ConversationMemory.test.ts
- npm test output (all green)

Implementeer alleen ConversationMemory, niets anders.
Stop na tests groen, wacht op review.
```

**Wat je checkt:**
- ✅ Tests dekkend (>80%)
- ✅ Implementation matched spec
- ✅ Geen side effects
- ✅ Error handling correct
- ✅ Performance acceptabel (<100ms)

---

### Prompt 2.2: FieldWatcher (Dag 3 - 3 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.1)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 1)

TAAK: Implementeer lib/ai/FieldWatcher.ts

KRITIEKE REQUIREMENT:
- Source tracking: alleen triggeren bij source === "user"
- Dit voorkomt infinite loops

SPECIFICATION:
- detectFieldTriggers(prevState, newState, source)
- Returns: FieldTrigger[]
- Debouncing via FeedbackQueue (implementeer samen)

TEST-FIRST:
__tests__/ai/FieldWatcher.test.ts:
1. source === "user" → triggers gegenereerd
2. source === "ai" → GEEN triggers
3. source === "system" → GEEN triggers
4. Multiple field changes → correct deduplicated
5. No change → empty array

DELIVERABLE:
- FieldWatcher.ts
- FeedbackQueue.ts (simple debounce, max 200 lines)
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Source tracking WERKT (kritiek!)
- ✅ Geen infinite loops mogelijk
- ✅ Debouncing correct (1 seconde)
- ✅ Tests simuleren alle scenarios

---

### Prompt 2.3: AnticipationEngine (Dag 4 - 4 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.2)
@Architect_Intelligence_KnowledgeBase_v3_1.md (Anticipation rules)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 1)

TAAK: Implementeer lib/ai/AnticipationEngine.ts

SPECIFICATION:
- getGuidance(wizardState, currentChapter)
- Returns max 1 CRITICAL anticipation per call
- Uses LifestyleProfile from basis.lifestyleProfile (v4.0 feature)

IMPLEMENTATION STRATEGY:
1. Start met 5 projecttype-based rules (nieuwbouw, verbouwing)
2. Hardcode rules (geen ML)
3. Priority: CRITICAL > HIGH > MEDIUM

TEST-FIRST:
__tests__/ai/AnticipationEngine.test.ts:
1. Verbouwing zonder tekeningen → "Heeft u tekeningen?" (CRITICAL)
2. Gezin + 1 badkamer → bathroom bottleneck (HIGH)
3. Large glazing zonder insulation budget → warning (MEDIUM)
4. No matching rules → empty array
5. Multiple matches → return only highest priority

DELIVERABLE:
- AnticipationEngine.ts (max 300 lines)
- anticipationRules.ts (rule definitions)
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Rules logisch
- ✅ Priority system werkt
- ✅ Max 1 critical enforced
- ✅ LifestyleProfile integration correct

---

### Prompt 2.4: SystemIntelligence (Dag 5 - 4 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.4)
@Architect_Intelligence_KnowledgeBase_v3_1.md (System conflicts)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 1)

TAAK: Implementeer lib/ai/SystemIntelligence.ts + helpers

SPECIFICATION:
- detectConflicts(wizardState)
- Returns: SystemConflict[] (sorted by severity)
- Uses MoSCoW priorities (wish.priority === "must")

HELPER FUNCTIONS EERST:
lib/ai/helpers/projectAnalysis.ts:
- hasLargeGlazedArea(ruimtes): boolean
- estimateAmbitionCost(wizardState): number
- getBaseRateForProjectType(type): number
- hasPremiumFinishes(wensen): boolean
- countRoomsByType(ruimtes, type): number

TEST-FIRST:
__tests__/ai/SystemIntelligence.test.ts:
1. Budget < must-haves cost → BLOCKING conflict
2. Large glass + poor insulation → WARNING
3. Premium finishes + low budget → WARNING
4. No conflicts → empty array
5. Multiple conflicts → sorted by severity (BLOCKING first)

__tests__/ai/helpers/projectAnalysis.test.ts:
- Test each helper function independently

DELIVERABLE:
- SystemIntelligence.ts (max 400 lines)
- helpers/projectAnalysis.ts (max 300 lines)
- Tests for both (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Conflicts detectie accurate
- ✅ MoSCoW integration werkt
- ✅ Helper functions correct
- ✅ Cost estimates realistic
- ✅ Severity levels logical

---

## 🎬 FASE 3: WEEK 2 - BEHAVIOR & PLANNING (Dag 6-10)

### Prompt 3.1: BehaviorAnalyzer (Dag 6-7 - 6 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.5)
@Architect_Intelligence_KnowledgeBase_v3_1.md (Behavior patterns)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 2)

TAAK: Implementeer lib/ai/BehaviorAnalyzer.ts

SPECIFICATION:
- analyze(conversationMemory, wizardState)
- Returns: BehaviorProfile
  - experience: "starter" | "enigszins" | "ervaren"
  - pace: "slow" | "normal" | "fast"
  - uncertainty: "none" | "some" | "high"
  - overwhelm: "none" | "some" | "high"

DETECTION STRATEGY:
- Keyword-based (geen ML)
- Analyze last 10 turns
- Pattern matching (question frequency, hesitation words)

TEST-FIRST:
__tests__/ai/BehaviorAnalyzer.test.ts:
1. Many questions → experience: "starter"
2. Few questions → experience: "ervaren"
3. Hesitation keywords ("misschien", "twijfel") → uncertainty: "high"
4. Fast responses, no questions → pace: "fast", experience: "ervaren"
5. Empty conversation → default profile

DELIVERABLE:
- BehaviorAnalyzer.ts (max 300 lines)
- behaviorPatterns.ts (keyword definitions)
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Pattern detection reasonable
- ✅ Default values sensible
- ✅ No over-classification
- ✅ Edge cases handled

---

### Prompt 3.2: TurnPlanner (Dag 8 - 4 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.6)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 2)

TAAK: Implementeer lib/ai/TurnPlanner.ts

SPECIFICATION:
- determinePriority(triage, anticipation, conflicts, behaviorProfile)
- Returns: TurnPlan
  - goal: TurnGoal
  - tone: TurnTone
  - allowPatches: boolean
  - importantTriggers: string[]

PRIORITY MATRIX (in deze volgorde):
1. BLOCKING conflicts → goal: "surface_risks", allowPatches: false
2. CRITICAL anticipation → goal: "anticipate_and_guide", allowPatches: false
3. WARNING conflicts → goal: "surface_risks", allowPatches: true
4. Normal triage → goal: "fill_data" | "advies_vraag"

TONE ADAPTATION:
- starter + overwhelm → tone: "warm"
- ervaren → tone: "direct"
- uncertainty high → tone: "coach"

TEST-FIRST:
__tests__/ai/TurnPlanner.test.ts:
1. Blocking conflict present → correct TurnPlan
2. Critical anticipation present → correct TurnPlan
3. No conflicts, data input → goal: "fill_data"
4. Advice question → goal: "advies_vraag"
5. Behavior affects tone correctly

DELIVERABLE:
- TurnPlanner.ts (max 300 lines)
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Priority matrix correct
- ✅ Tone adaptation logical
- ✅ No conflicting decisions
- ✅ All scenarios covered

---

### Prompt 3.3: ContextPruner (Dag 9 - 3 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.8)
@DEEL_VII_RESPONSE_ORCHESTRATOR_v3_1.md (ContextPruner)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 2)

TAAK: Implementeer lib/ai/ContextPruner.ts

SPECIFICATION:
- prune(fullContext, turnPlan)
- Returns: PrunedContext (always <4000 tokens)

PRUNING STRATEGY:
1. Core always included: behaviorProfile, turnPlan, wizardState essentials
2. Conditional based on turnPlan.goal:
   - "anticipate_and_guide" → include anticipation (max 2), recent conversation (max 2)
   - "fill_data" → include RAG nuggets (max 3), examples (max 2)
   - "surface_risks" → include conflicts (all), no RAG

TOKEN ESTIMATION:
- ~4 chars = 1 token (simple heuristic)
- Measure actual content, not structure

TEST-FIRST:
__tests__/ai/ContextPruner.test.ts:
1. Large context → pruned to <4000 tokens
2. Core always included
3. Conditional content correct per goal
4. Focused field NEVER pruned
5. Token estimation accurate (±10%)

DELIVERABLE:
- ContextPruner.ts (max 250 lines)
- tokenEstimator.ts helper (max 50 lines)
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Token limit NEVER exceeded
- ✅ Core always preserved
- ✅ Pruning strategy logical
- ✅ No information loss for focused topics

---

### Prompt 3.4: ChapterInitializer (Dag 10 - 4 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.13 - CRITICAL)
@BRIKX_PROMPT_PACK_v4_1.md (Section 7 - Chapter Templates)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 2)

TAAK: Implementeer lib/ai/ChapterInitializer.ts

SPECIFICATION:
- handleChapterStart(chapter, wizardState, conversationMemory)
- Returns: ChapterOpeningResponse
- 6-step protocol (zie BUILD_PROTOCOL Section 4.13)

6 STEPS:
1. Load chapter context (schema, required fields, existing data)
2. Run AnticipationEngine (max 1 critical)
3. Run SystemIntelligence (blocking only)
4. Run BehaviorAnalyzer
5. Determine TurnPlan
6. Generate opening message using templates

TEMPLATES:
- Use BRIKX_PROMPT_PACK_v4_1.md Section 7
- Templates per chapter × per scenario (normal/anticipation/conflict)
- Templates per user type (starter/ervaren)

TEST-FIRST:
__tests__/ai/ChapterInitializer.test.ts:
1. BASIS normal start → correct template
2. RUIMTES with anticipation → includes anticipation in opening
3. BUDGET with blocking conflict → conflict message first
4. Starter user → warm tone template
5. Expert user → direct tone template
6. All 7 chapters × 3 scenarios = 21 test cases

DELIVERABLE:
- ChapterInitializer.ts (max 400 lines)
- chapterTemplates.ts (template library)
- Tests (all 21 green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ 6-step protocol followed
- ✅ Templates correct Dutch
- ✅ No silent chapter openings
- ✅ User type adaptation works
- ✅ All 21 scenarios pass

---

## 🎬 FASE 4: WEEK 3 - QUALITY & INTEGRATION (Dag 11-15)

### Prompt 4.1: ResponseOrchestrator Integration (Dag 11-12 - 6 uur)

```
@DEEL_VII_RESPONSE_ORCHESTRATOR_v3_1.md (Full spec)
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.9)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 3)

TAAK: Implementeer lib/ai/ResponseOrchestrator.ts

SPECIFICATION:
- generate(query, prunedContext, turnPlan)
- Returns: CandidateResponse
  - reply: string
  - patches: PendingPatch[]
  - usedTriggerIds: string[]
  - usedNuggetIds: string[]

6 STEPS (zie RESPONSE_ORCHESTRATOR spec):
1. ContextPruner (already implemented)
2. PromptBuilder
3. LLM Call (ProModel)
4. Parser
5. AnswerGuard validation
6. Return or retry

INTEGRATION:
- Use existing ProModel.generateResponse()
- Add new prompts from BRIKX_PROMPT_PACK_v4_1
- Indirect patching: requiresConfirmation always true (unless confidence >0.95)

TEST-FIRST:
__tests__/ai/ResponseOrchestrator.test.ts:
1. Mock LLM → correct CandidateResponse
2. Invalid JSON → graceful error
3. Patches generated correctly (indirect)
4. Used triggers tracked
5. Token limit respected (via ContextPruner)

DELIVERABLE:
- ResponseOrchestrator.ts (max 500 lines)
- Tests (all green)
- Integration test with real ProModel (manual)

Stop na tests, wacht on review.
```

**Wat je checkt:**
- ✅ All steps executed
- ✅ LLM integration correct
- ✅ Error handling robust
- ✅ Indirect patching works
- ✅ Performance acceptable (<2s p95)

---

### Prompt 4.2: AnswerGuard 2.0 (Dag 13 - 4 uur)

```
@DEEL_VIII_ANSWERGUARD_SAFETY_GUARDRAILS_v3_1.md (Full spec)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 3)

TAAK: Extend lib/ai/AnswerGuard.ts

CURRENT: Basic validation exists (v4.0)
NEW: Add rule-based checks + mini-LLM fallback

SPECIFICATION:
- validate(candidateResponse, turnPlan, prunedContext)
- Returns: GuardResult
  - verdict: "pass" | "soft_fail" | "hard_fail"
  - reasons: string[]
  - suggestions: string[]

TWO-LAYER APPROACH:
1. Rule-based checks (free, fast):
   - TurnPlan compliance (patches vs allowPatches)
   - Important triggers addressed
   - Tone detection (keywords)
   - Format validation

2. Mini-LLM checks (only if rule-based fails):
   - GPT-4o-mini
   - 5 token response: "PASS" | "FAIL"
   - Max cost: $0.001 per check

TEST-FIRST:
__tests__/ai/AnswerGuard.test.ts:
1. TurnPlan violation → hard_fail
2. Missing important trigger → soft_fail
3. Wrong tone keywords → soft_fail
4. All checks pass → pass
5. Rule-based catches 90%+ issues

DELIVERABLE:
- AnswerGuard.ts updates (max 300 lines added)
- guardRules.ts (rule definitions)
- Tests (all green)
- Cost analysis (track mini-LLM calls)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Rule-based effective (catches 90%+)
- ✅ Mini-LLM only as fallback
- ✅ Cost acceptable (<$0.01 per conversation)
- ✅ False positive rate low (<5%)

---

### Prompt 4.3: ArchitectFallback (Dag 14 - 3 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 4.11)
@BRIKX_PROMPT_PACK_v4_1.md (Fallback templates)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 3)

TAAK: Implementeer lib/ai/ArchitectFallback.ts

SPECIFICATION:
- getFallbackResponse(turnPlan, wizardState, error)
- Returns: CandidateResponse (safe, generic)

FALLBACK TEMPLATES:
Per TurnGoal:
- "anticipate_and_guide" → "Kunt u mij vertellen [question]?"
- "surface_risks" → "Ik zie een mogelijke inconsistentie. [conflict]."
- "fill_data" → "Laten we [chapter] invullen. Wat is [nextField]?"

NEVER:
- "Er ging iets mis"
- "Probeer het opnieuw"
- Technical error messages

ALWAYS:
- Professional tone
- Constructive next step
- No blame on user

TEST-FIRST:
__tests__/ai/ArchitectFallback.test.ts:
1. Each TurnGoal → appropriate fallback
2. Fallback never empty
3. Fallback always has question/next step
4. No technical jargon
5. Dutch correct

DELIVERABLE:
- ArchitectFallback.ts (max 200 lines)
- fallbackTemplates.ts
- Tests (all green)

Stop na tests, wacht op review.
```

**Wat je checkt:**
- ✅ Templates professional
- ✅ No dead ends
- ✅ Dutch correct
- ✅ User-friendly

---

### Prompt 4.4: Full Pipeline Integration (Dag 15 - 6 uur)

```
@BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md (Section 5 - Full Flow)
@BRIKX_IMPLEMENTATION_CHECKLIST_VERSION_3_1.md (Week 3)

TAAK: Integreer alle modules in app/api/chat/route.ts

MAIN FUNCTION: orchestrateTurn()

FLOW:
1. Detect chapter transition → ChapterInitializer?
2. ConversationMemory.load()
3. **Promise.allSettled** parallel:
   - BehaviorAnalyzer
   - AnticipationEngine
   - SystemIntelligence
   - RAGEngine (existing)
4. TurnPlanner
5. ContextPruner
6. ResponseOrchestrator
7. AnswerGuard
8. Fallback (if needed)
9. Persist conversation
10. Return SSE stream

CRITICAL:
- Preserve @protected features (META_TOOLING, ONBOARDING)
- No breaking changes to existing chat
- Graceful degradation if modules fail
- Latency target: <2s p95

INTEGRATION TESTS:
__tests__/integration/orchestrateTurn.test.ts:
1. Normal chat flow end-to-end
2. Chapter transition triggers ChapterInitializer
3. Blocking conflict → correct response
4. Critical anticipation → correct response
5. Module failure → graceful fallback
6. Performance: <2s for 95% of requests

DELIVERABLE:
- app/api/chat/route.ts updates
- lib/ai/orchestrateTurn.ts (main function)
- Integration tests (all green)
- Performance report

⚠️ STOP BEFORE DEPLOYMENT
Wacht op final review + manual smoke tests.
```

**Wat je checkt:**
- ✅ All modules integrated
- ✅ Promise.allSettled works (crashproof)
- ✅ No regressions in existing features
- ✅ Latency acceptable
- ✅ Error handling robust

---

## 🎯 CONTROLE STRATEGIE

### Na Elke Prompt:

1. **Review Code**
   - Matches specification?
   - TypeScript errors?
   - Test coverage >80%?

2. **Run Tests**
   ```bash
   npm run test -- path/to/module.test.ts
   npm run type-check
   ```

3. **Check Git Diff**
   ```bash
   git diff --stat
   # Should be <500 lines per commit
   ```

4. **Manual Smoke Test**
   - Run one scenario manually
   - Verify behavior matches spec

5. **Document Issues**
   - Note any deviations
   - Track technical debt

### Go/No-Go Decision Points:

**End of Week 1:**
- ✅ All 4 modules pass tests
- ✅ No infinite loops possible (source tracking verified)
- ✅ Database migrations successful
- ✅ Type-check clean

**End of Week 2:**
- ✅ Behavior + Planning modules pass tests
- ✅ ChapterInitializer works for all 7 chapters
- ✅ ContextPruner never exceeds token limit
- ✅ No regressions in v3.0 features

**End of Week 3:**
- ✅ All integration tests green
- ✅ Latency <2s p95
- ✅ AnswerGuard >95% compliance
- ✅ Graceful degradation works

### Red Flags (STOP IMMEDIATELY):

🚨 TypeScript errors introduced  
🚨 Existing tests broken  
🚨 Infinite loops detected  
🚨 Performance degraded >2x  
🚨 Data loss risk  
🚨 Security issues (RLS bypassed)

---

## 📊 DAILY CHECKLIST

Print this and check off after each day:

### Week 1:
- [ ] Day 1: Setup + Database (2h)
- [ ] Day 2: ConversationMemory (4h)
- [ ] Day 3: FieldWatcher + FeedbackQueue (3h)
- [ ] Day 4: AnticipationEngine (4h)
- [ ] Day 5: SystemIntelligence + Helpers (4h)
- [ ] **Week 1 Review**: All tests green? Type-check clean? No regressions?

### Week 2:
- [ ] Day 6-7: BehaviorAnalyzer (6h)
- [ ] Day 8: TurnPlanner (4h)
- [ ] Day 9: ContextPruner (3h)
- [ ] Day 10: ChapterInitializer (4h)
- [ ] **Week 2 Review**: 21 chapter scenarios pass? Token limits enforced?

### Week 3:
- [ ] Day 11-12: ResponseOrchestrator (6h)
- [ ] Day 13: AnswerGuard 2.0 (4h)
- [ ] Day 14: ArchitectFallback (3h)
- [ ] Day 15: Full Integration (6h)
- [ ] **Week 3 Review**: End-to-end tests pass? Performance <2s? Ready for deployment?

---

## 🚀 EERSTE PROMPT VOOR VS CODE CLAUDE

Copy-paste dit exact in VS Code Claude:

```
Hoi! Ik ga de Architect Intelligence Layer v3.1 voor Brikx bouwen.

Ik heb alle documentatie in /docs/v3.1/ en volg BUILD_START_GUIDE.md.

TAAK: Setup Phase - Day 1
Zie BUILD_START_GUIDE.md → FASE 1, Prompt 1.1

1. Maak folder structure:
   - lib/ai/
   - lib/ai/helpers/
   - lib/ai/guards/
   - lib/ai/chapters/

2. Maak types/ai.ts met interfaces uit:
   @BRIKX_BUILD_PROTOCOL_v3_1_TECHNICAL_SPEC.md Section 2

3. Gebruik bestaande types/project.ts waar mogelijk

CONSTRAINTS:
- Alleen structure, geen implementatie
- TypeScript moet compilen
- <200 lines voor types/ai.ts

Vraag voor bevestiging voordat je begint.
Laat zien wat je gaat doen.
```

---

## 💡 TIPS VOOR SUCCES

### 1. Klein Blijven
- Max 1 module per sessie
- Max 500 lines per commit
- Frequent git commits

### 2. Test-First
- Schrijf tests VOOR implementatie
- Tests zijn spec in code
- Groen = done

### 3. Review Everything
- Elke file voor je commit
- Elke diff voor je push
- Elke test voor je further gaat

### 4. Document Issues
- Claude maakt fouten
- Track ze in ISSUES.md
- Fix later (niet blokkend)

### 5. Stay Calm
- Week 1 is fundament (kan traag zijn)
- Week 2 gaat sneller
- Week 3 is polish

---

## 📞 HULP NODIG?

Als je vastloopt:

1. Check BUILD_PROTOCOL voor spec details
2. Check IMPLEMENTATION_CHECKLIST voor context
3. Check bestaande v3.0 code voor patterns
4. Vraag Claude: "Waarom deed je X in plaats van Y?"
5. Reset: "Laten we opnieuw beginnen met deze module"

---

## ✅ SUCCES CRITERIA

Je bent klaar als:

✅ Alle 12 modules geïmplementeerd  
✅ Alle tests groen (>80% coverage)  
✅ No TypeScript errors  
✅ Performance <2s p95  
✅ No regressions in v3.0  
✅ Chapter Opening Protocol werkt  
✅ Source tracking voorkomt loops  
✅ Database migrations succesvol  
✅ AnswerGuard >95% compliance  
✅ Graceful degradation works  

**Dan: 🚀 DEPLOYMENT READY**

---

**VEEL SUCCES!** 🎯

Jules
