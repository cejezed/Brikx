# MASTER IMPLEMENTATION PLAN: Architect Intelligence Layer v3.1

**Document Version**: 3.1.0
**Datum**: 2025-12-11
**Status**: PLANNING - AWAITING "GO BUILD" CONFIRMATION
**Auteur**: AI Architecture Planning Agent

---

## EXECUTIVE SUMMARY

Dit document beschrijft het volledige implementatieplan voor de **Architect Intelligence Layer v3.1** van het Brikx wizard systeem. De laag vormt het "brein" achter de AI-coach Jules en regelt alle intelligente beslissingen in het gesprek met de gebruiker.

**Huidige Status**: Het systeem heeft al een werkende basis (v4.0 AnswerGuard, v3.x intent classification, RAG), maar mist een gestructureerde orchestratielaag die alle modules coordineert volgens de 4 Brikx Pijlers:

1. **AI-First Triage**: Intelligente routing van user queries
2. **Shared Brain**: Deterministische logica voor consistentie
3. **RAG & Examples**: Kennisbankintegratie voor advies
4. **Export Consistency**: Betrouwbare PDF/JSON output

**Scope**: Dit plan omvat 12 modules die samen de volledige conversational AI-laag vormen, van input (user query) tot output (patches + response).

---

## 1. SYSTEEMOVERZICHT

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER QUERY                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PRE-LAYER: META TOOLING & ONBOARDING (already implemented)         │
│  - detectMetaTooling() → fixed responses                            │
│  - first message → welcome card                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ARCHITECT INTELLIGENCE LAYER v3.1 (NEW)                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ PHASE 1: MEMORY & CONTEXT                                  │    │
│  │  1. ConversationMemory (load recent history)               │    │
│  │  2. FieldWatcher (detect field focus from context)         │    │
│  │  3. FeedbackQueue (pending AI feedback niet verzonden)     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                             │                                        │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ PHASE 2: BEHAVIOR & INTELLIGENCE                           │    │
│  │  4. BehaviorAnalyzer (conversation patterns, signals)      │    │
│  │  5. AnticipationEngine (predict missing, generate probes)  │    │
│  │  6. SystemConflicts (detect budget vs wensen, must-haves)  │    │
│  │  7. TurnPlanner (decide: patch, advies, navigate, probe?)  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                             │                                        │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ PHASE 3: EXECUTION PIPELINE                                │    │
│  │  8. ContextPruner (trim context for LLM call)              │    │
│  │  9. ResponseOrchestrator (generate draft response)         │    │
│  │ 10. AnswerGuard (validate response quality) ✅ EXISTING    │    │
│  │ 11. FallbackStrategy (retry on guard fail)                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                             │                                        │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ OUTPUT                                                      │    │
│  │  - PatchEvents[]                                            │    │
│  │  - Response text                                            │    │
│  │  - Navigation commands                                      │    │
│  │  - Expert focus updates                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SSE STREAM TO CLIENT                                                │
│  - metadata event                                                    │
│  - patch events (state updates)                                     │
│  - stream events (text chunks)                                      │
│  - navigate/focus events                                            │
│  - done event                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Through Pipeline

```
User Query (string)
  │
  ├─> ConversationMemory.load(history)
  │     └─> returns: { recent, summary, turnCount }
  │
  ├─> FieldWatcher.detect(wizardState, history)
  │     └─> returns: { focusedField, confidence, source }
  │
  ├─> FeedbackQueue.check(wizardState)
  │     └─> returns: { hasPending, items[], priority }
  │
  ├─> BehaviorAnalyzer.analyze(history, wizardState)
  │     └─> returns: { patterns, signals, userIntent }
  │
  ├─> AnticipationEngine.run(wizardState, behaviorSignals)
  │     └─> returns: { criticalMissing, probes[], suggestions[] }
  │
  ├─> SystemConflicts.detect(wizardState)
  │     └─> returns: { conflicts[], severity, shouldBlock }
  │
  ├─> TurnPlanner.decide(query, context, conflicts, anticipation)
  │     └─> returns: { action, tone, priority, route }
  │
  ├─> ContextPruner.prune(wizardState, history, focusedField)
  │     └─> returns: { prunedState, prunedHistory, tokenEstimate }
  │
  ├─> ResponseOrchestrator.generate(query, prunedContext)
  │     └─> returns: { draftResponse, patches[], confidence }
  │
  ├─> AnswerGuard.validate(query, draftResponse, intent) ✅ EXISTING
  │     └─> returns: { verdict, reasons[], suggestions[] }
  │
  └─> FallbackStrategy.retry(guardResult, attemptCount)
        └─> returns: { finalResponse, shouldGiveUp, fallbackMessage }
```

---

## 2. MODULE DEPENDENCY MATRIX

### Module 1: ConversationMemory

**Purpose**: Load and summarize recent conversation history

**Inputs**:
- `history: HistoryItem[]` - full chat history
- `maxTurns?: number` - limit for recent context (default: 10)

**Outputs**:
```typescript
interface ConversationMemoryResult {
  recent: HistoryItem[];        // Last N turns
  summary: string | null;        // Summarized older context
  turnCount: number;             // Total turns
  hasLongHistory: boolean;       // > 20 turns
}
```

**Dependencies**: NONE (foundation module)

**Edge Cases**:
- Empty history → return empty recent, null summary
- First message → return single-item recent
- Very long history (>50 turns) → trigger summarization

**Error Handling**: Never throws, returns safe defaults

---

### Module 2: FieldWatcher

**Purpose**: Detect which field the user is currently discussing/editing

**Inputs**:
- `wizardState: WizardState` - current state
- `history: HistoryItem[]` - recent conversation
- `currentFocus?: string` - previously focused field

**Outputs**:
```typescript
interface FieldWatchResult {
  focusedField: string | null;  // e.g. "budget:budgetTotaal"
  confidence: number;            // 0.0 - 1.0
  source: "user" | "ai" | "system" | null;
  timestamp: number;
}
```

**Dependencies**:
- ConversationMemory (needs recent history)

**Rules**:
- Only react to `source: "user"` for natural conversation
- `source: "ai"` = AI suggested a field (don't auto-focus)
- `source: "system"` = programmatic navigation

**Edge Cases**:
- User mentions multiple fields → pick most recent
- User says "change X back" → detect previous value
- Ambiguous field name → return null, confidence < 0.5

**Error Handling**: Return null focus on parse errors

---

### Module 3: FeedbackQueue

**Purpose**: Track pending AI feedback that hasn't been sent yet (e.g., after budget warning)

**Inputs**:
- `wizardState: WizardState` - current state with metadata

**Outputs**:
```typescript
interface FeedbackQueueResult {
  hasPending: boolean;
  items: FeedbackItem[];
  priority: "low" | "medium" | "high";
}

interface FeedbackItem {
  id: string;
  type: "warning" | "suggestion" | "clarification";
  message: string;
  relatedField?: string;
  createdAt: number;
}
```

**Dependencies**: NONE (reads from wizardState.feedbackQueue)

**Rules**:
- High priority feedback (conflicts) blocks normal flow
- Low priority feedback can be deferred

**Edge Cases**:
- Multiple pending items → sort by priority
- Expired feedback (>10 minutes old) → discard

**Error Handling**: Return empty queue on invalid data

---

### Module 4: BehaviorAnalyzer

**Purpose**: Analyze conversation patterns and user signals

**Inputs**:
- `history: HistoryItem[]` - full history
- `wizardState: WizardState` - current state

**Outputs**:
```typescript
interface BehaviorAnalysis {
  patterns: {
    askingManyQuestions: boolean;      // User asks >3 questions in row
    providingDetails: boolean;          // User giving concrete answers
    exploring: boolean;                 // User browsing/comparing options
    decisive: boolean;                  // User making clear choices
  };
  signals: {
    overwhelmed: boolean;               // Short answers, confusion signals
    engaged: boolean;                   // Long messages, follow-ups
    frustrated: boolean;                // Repeated questions, negative tone
    confident: boolean;                 // Precise, technical language
  };
  userStyle: "explorer" | "doer" | "delegator" | "researcher";
  recommendedTone: "supportive" | "directive" | "informative" | "collaborative";
}
```

**Dependencies**:
- ConversationMemory (needs recent + summary)

**Rules**:
- Update userStyle only after 5+ turns
- Detect frustration signals: repeated "hoe", "waarom", "snap het niet"
- Detect confidence: technical terms, precise numbers

**Edge Cases**:
- Very short conversation → default to "explorer" + "supportive"
- Mixed signals → prefer most recent behavior

**Error Handling**: Return safe defaults (explorer + supportive)

---

### Module 5: AnticipationEngine

**Purpose**: Predict critical missing info and generate intelligent probes

**Inputs**:
- `wizardState: WizardState` - current state
- `behaviorSignals: BehaviorAnalysis.signals` - from Module 4
- `currentIntent: ProIntent` - from classify

**Outputs**:
```typescript
interface AnticipationResult {
  criticalMissing: MissingItem[];          // MUST be filled soon
  probes: AnticipationProbe[];             // Intelligent questions
  suggestions: string[];                    // Quick reply buttons
  shouldInterrupt: boolean;                 // Block normal flow?
}

interface AnticipationProbe {
  question: string;
  relatedField: string;
  priority: "critical" | "high" | "medium";
  context: string;                          // Why we're asking
}
```

**Dependencies**:
- Missing fields computation (existing: `computeMissingFields`)
- BehaviorAnalyzer (to tailor probe tone)
- SystemConflicts (critical missing due to conflicts)

**Rules**:
- Maximum 1 critical probe per turn
- Don't probe if user is frustrated (behaviorSignals.frustrated)
- Don't probe during ADVIES_VRAAG unless MOET-echt
- Probe context must reference current conversation topic

**Edge Cases**:
- User just answered a probe → don't ask another immediately
- Multiple critical missing → pick most relevant to current chapter
- User explicitly says "later" → defer probe for 5 turns

**Error Handling**: Return empty probes on error, never crash

---

### Module 6: SystemConflicts

**Purpose**: Detect logical conflicts in wizard state (budget vs must-haves, physical impossibilities)

**Inputs**:
- `wizardState: WizardState` - current state

**Outputs**:
```typescript
interface SystemConflictsResult {
  conflicts: Conflict[];
  severity: "blocking" | "warning" | "info";
  shouldBlock: boolean;                    // Block LLM response?
  resolutionSuggestions: string[];
}

interface Conflict {
  id: string;
  type: "budget_risk" | "must_have_unsatisfied" | "physical_constraint";
  severity: "critical" | "high" | "medium";
  description: string;
  affectedFields: string[];
  detectedAt: number;
}
```

**Dependencies**:
- Existing: `analyzeBudgetRisk` from budgetRiskAnalysis.ts
- Must-have wensen extractor (from wensen.wishes with priority:"must")

**Rules**:
- CRITICAL conflicts (budget < must-haves cost estimate) → shouldBlock = true
- HIGH conflicts (missing must-have implementation) → warning in response
- MEDIUM conflicts (nice-to-have too expensive) → info only

**Edge Cases**:
- Budget unknown → no budget conflicts
- No must-haves → no must-have conflicts
- Conflicting must-haves (e.g., "much light" + "no windows") → flag as design conflict

**Error Handling**: Return no conflicts on error, log for review

---

### Module 7: TurnPlanner

**Purpose**: Decide action for this turn (patch, advies, probe, navigate)

**Inputs**:
- `query: string` - user query
- `intent: ProIntent` - classified intent
- `conflicts: SystemConflictsResult` - from Module 6
- `anticipation: AnticipationResult` - from Module 5
- `behavior: BehaviorAnalysis` - from Module 4
- `feedback: FeedbackQueueResult` - from Module 3

**Outputs**:
```typescript
interface TurnPlan {
  action: "patch" | "advies" | "probe" | "navigate" | "feedback" | "conflict_resolution";
  tone: "supportive" | "directive" | "informative" | "collaborative";
  priority: "user_query" | "system_conflict" | "anticipation" | "feedback";
  route: "normal" | "guard_required" | "skip_llm";
  reasoning: string;                      // Why this plan?
}
```

**Dependencies**:
- ALL previous modules (this is the decision hub)

**Decision Tree**:
```
1. IF conflicts.shouldBlock == true
   → action = "conflict_resolution", priority = "system_conflict"

2. ELSE IF feedback.hasPending && feedback.priority == "high"
   → action = "feedback", priority = "feedback"

3. ELSE IF anticipation.shouldInterrupt == true
   → action = "probe", priority = "anticipation"

4. ELSE IF intent == "VULLEN_DATA"
   → action = "patch", priority = "user_query"

5. ELSE IF intent == "ADVIES_VRAAG"
   → action = "advies", priority = "user_query", route = "guard_required"

6. ELSE IF intent == "NAVIGATIE"
   → action = "navigate", priority = "user_query", route = "skip_llm"

7. ELSE
   → action = "advies", tone = behavior.recommendedTone
```

**Rules**:
- System conflicts ALWAYS take priority over user query
- Anticipation can interrupt ONLY if not frustrating user
- Tone follows BehaviorAnalyzer recommendation
- `route = "guard_required"` triggers AnswerGuard validation

**Edge Cases**:
- Multiple high-priority items → follow decision tree order
- User explicitly overriding anticipation → respect user, set priority = "user_query"

**Error Handling**: Default to action = "advies", tone = "supportive"

---

### Module 8: ContextPruner

**Purpose**: Trim wizard state and history to fit within LLM context window

**Inputs**:
- `wizardState: WizardState` - full state
- `history: HistoryItem[]` - full history
- `focusedField: string | null` - from FieldWatcher
- `maxTokens: number` - target context size (default: 8000)

**Outputs**:
```typescript
interface PrunedContext {
  prunedState: Partial<WizardState>;     // Only relevant chapters
  prunedHistory: HistoryItem[];           // Recent + summarized
  tokenEstimate: number;                  // Estimated total tokens
  pruneLog: string[];                     // What was removed
}
```

**Dependencies**:
- FieldWatcher (to keep focused field context)
- ConversationMemory (to get summarized history)

**Pruning Strategy**:
```
1. ALWAYS keep:
   - Current chapter data (chapterAnswers[currentChapter])
   - Focused field context (if any)
   - Last 5 history turns
   - ProjectMeta (basis info)

2. PRUNE in order:
   - Chapters not in chapterFlow
   - Chapters with no data
   - Old history (keep summary from ConversationMemory)
   - Detailed room/wish descriptions (keep counts only)

3. IF still over limit:
   - Truncate room/wish arrays to first 3 items + count
   - Truncate history to last 3 turns
```

**Edge Cases**:
- Focused field in different chapter → keep both chapters
- Very large wizard state (100+ rooms) → aggressive pruning
- Token estimate too high after pruning → fall back to minimal context

**Error Handling**: Return full context if pruning fails, log warning

---

### Module 9: ResponseOrchestrator

**Purpose**: Generate draft response using LLM with pruned context

**Inputs**:
- `query: string` - user query
- `intent: ProIntent` - classified intent
- `turnPlan: TurnPlan` - from TurnPlanner
- `prunedContext: PrunedContext` - from ContextPruner
- `ragContext?: RAGContext` - for ADVIES_VRAAG

**Outputs**:
```typescript
interface OrchestratorResult {
  draftResponse: string;                 // LLM-generated text
  patches: PatchEvent[];                 // For VULLEN_DATA
  confidence: number;                    // 0.0 - 1.0
  tokensUsed: number;
  action?: "reset" | "undo";            // Special actions
}
```

**Dependencies**:
- Existing ProModel functions:
  - `ProModel.generatePatch()` for VULLEN_DATA
  - `ProModel.generateResponse()` for ADVIES_VRAAG
- ContextPruner (needs pruned context)
- TurnPlanner (needs action + tone)

**Orchestration Logic**:
```
SWITCH turnPlan.action:
  CASE "patch":
    → call ProModel.generatePatch(query, prunedState, history)
    → return { draftResponse, patches, confidence }

  CASE "advies":
    → call ProModel.generateResponse(query, ragContext, prunedContext)
    → return { draftResponse, patches: [], confidence }

  CASE "probe":
    → build probe prompt with anticipation context
    → call generateResponse with probe-optimized prompt
    → return { draftResponse: probe, patches: [], confidence: 0.9 }

  CASE "conflict_resolution":
    → build conflict resolution prompt
    → call generateResponse with conflict details
    → return { draftResponse: resolution, patches: [], confidence: 0.95 }

  CASE "feedback":
    → retrieve pending feedback from queue
    → format as friendly message
    → return { draftResponse: feedback, patches: [], confidence: 1.0 }

  CASE "navigate":
    → skip LLM, return navigation confirmation
    → return { draftResponse: "Prima, we gaan naar X", confidence: 1.0 }
```

**Rules**:
- ALWAYS use tone from TurnPlanner in system prompt
- For conflict_resolution, include conflict.resolutionSuggestions in prompt
- For probe, frame question in context of current conversation

**Edge Cases**:
- LLM returns empty response → retry once with adjusted prompt
- LLM returns invalid patches → filter out, log, continue with valid ones
- Timeout (>10s) → return fallback message

**Error Handling**: Catch LLM errors, return fallback response

---

### Module 10: AnswerGuard

**Status**: ✅ ALREADY IMPLEMENTED (lib/ai/AnswerGuard.ts)

**Purpose**: Validate draft response quality (relevance, hallucination check)

**Inputs**:
```typescript
interface AnswerGuardInput {
  userQuery: string;
  intent: ProIntent;
  activeChapter?: string | null;
  draftAnswer: string;
  ragMeta?: { topicId: string; docsFound: number; cacheHit: boolean };
}
```

**Outputs**:
```typescript
interface AnswerGuardResult {
  verdict: "OK" | "NEEDS_CLARIFICATION" | "IRRELEVANT";
  reasons: string[];
  suggestions: string[];
  confidence?: number;
}
```

**Integration Points**:
- Called AFTER ResponseOrchestrator generates draft
- Only called if `turnPlan.route == "guard_required"`
- Verdict triggers FallbackStrategy if not OK

**No Changes Needed** - already integrated in chat/route.ts lines 470-532

---

### Module 11: FallbackStrategy

**Purpose**: Handle AnswerGuard failures and retry generation

**Inputs**:
- `guardResult: AnswerGuardResult` - from AnswerGuard
- `originalQuery: string` - user query
- `attemptCount: number` - retry attempt (max 2)
- `orchestratorContext: OrchestratorResult` - original draft

**Outputs**:
```typescript
interface FallbackResult {
  finalResponse: string;                // Improved or fallback response
  shouldGiveUp: boolean;                // Max retries reached?
  fallbackMessage: string | null;      // User-facing error message
  retriedWith: "clarification" | "relevance" | "none";
}
```

**Dependencies**:
- AnswerGuard (for verdict interpretation)
- Existing helpers:
  - `buildClarificationPrompt()` for NEEDS_CLARIFICATION
  - `buildRelevancePrompt()` for IRRELEVANT

**Retry Logic**:
```
IF guardResult.verdict == "OK":
  → return { finalResponse: draft, shouldGiveUp: false, retriedWith: "none" }

IF attemptCount >= 2:
  → return { shouldGiveUp: true, fallbackMessage: "Kunt u uw vraag anders formuleren?" }

IF guardResult.verdict == "NEEDS_CLARIFICATION":
  → improvedPrompt = buildClarificationPrompt(query, guardResult.suggestions)
  → retry generateResponse(improvedPrompt)
  → return { finalResponse: improved, retriedWith: "clarification" }

IF guardResult.verdict == "IRRELEVANT":
  → improvedPrompt = buildRelevancePrompt(query, guardResult.suggestions)
  → retry generateResponse(improvedPrompt)
  → return { finalResponse: improved, retriedWith: "relevance" }
```

**Rules**:
- Maximum 2 retry attempts per turn
- Log all retries for quality analysis
- If both retries fail, return polite fallback message
- Never throw errors to user

**Edge Cases**:
- Retry also fails AnswerGuard → use retry response anyway (better than nothing)
- LLM timeout during retry → skip to fallback message
- Clarification suggestions empty → use generic clarification prompt

**Error Handling**: Always return valid FallbackResult, never crash

---

### Module 12: orchestrateTurn (Main Orchestrator)

**Purpose**: Top-level coordinator that calls all modules in sequence

**Signature**:
```typescript
async function orchestrateTurn(
  query: string,
  wizardState: WizardState,
  history: HistoryItem[],
  options: {
    mode: "PREVIEW" | "PREMIUM";
    clientFastIntent?: ProIntent;
  }
): Promise<TurnResult>
```

**Call Sequence**:
```typescript
// PHASE 1: Memory & Context
const memory = await ConversationMemory.load(history);
const fieldFocus = await FieldWatcher.detect(wizardState, memory.recent);
const feedbackQueue = FeedbackQueue.check(wizardState);

// PHASE 2: Behavior & Intelligence
const behavior = await BehaviorAnalyzer.analyze(memory, wizardState);
const anticipation = await AnticipationEngine.run(wizardState, behavior.signals);
const conflicts = await SystemConflicts.detect(wizardState);

// PHASE 3: Planning
const intent = await ProModel.classify(query, wizardState);
const turnPlan = TurnPlanner.decide(query, intent, conflicts, anticipation, behavior, feedbackQueue);

// PHASE 4: Execution
const prunedContext = ContextPruner.prune(wizardState, memory, fieldFocus);
const draft = await ResponseOrchestrator.generate(query, intent, turnPlan, prunedContext);

// PHASE 5: Validation (if required)
let finalResponse = draft.draftResponse;
if (turnPlan.route === "guard_required") {
  const guardResult = await AnswerGuard.validate(query, draft.draftResponse, intent);
  const fallback = await FallbackStrategy.retry(guardResult, query, 0, draft);
  finalResponse = fallback.finalResponse;
}

// PHASE 6: Output
return {
  response: finalResponse,
  patches: draft.patches,
  metadata: { intent, turnPlan, tokensUsed: draft.tokensUsed }
};
```

**Output**: TurnResult sent via SSE stream to client

---

## 3. COMPONENT-BY-COMPONENT BUILD STRATEGY

### 3.1 ConversationMemory

**File**: `lib/ai/intelligence/ConversationMemory.ts`

**Functions**:
```typescript
export async function loadConversationMemory(
  history: HistoryItem[],
  maxRecentTurns = 10
): Promise<ConversationMemoryResult>

// Helper: summarize old history (LLM call)
async function summarizeHistory(
  oldHistory: HistoryItem[]
): Promise<string>

// Helper: detect if summarization needed
function needsSummarization(historyLength: number): boolean
```

**Types Needed**:
```typescript
// In types/intelligence.ts
export interface ConversationMemoryResult {
  recent: HistoryItem[];
  summary: string | null;
  turnCount: number;
  hasLongHistory: boolean;
}
```

**Context Rules**:
- ✅ CAN access: history (read-only)
- ❌ CANNOT access: wizardState (not needed for memory)
- ✅ CAN call: LLM for summarization (only if >20 turns)

**How Called**: `orchestrateTurn` → Phase 1

---

### 3.2 FieldWatcher

**File**: `lib/ai/intelligence/FieldWatcher.ts`

**Functions**:
```typescript
export function detectFieldFocus(
  wizardState: WizardState,
  recentHistory: HistoryItem[],
  previousFocus?: string
): FieldWatchResult

// Helper: extract field mentions from text
function extractFieldMentions(text: string): string[]

// Helper: map user language to field IDs
function normalizeFieldName(userText: string): string | null
```

**Types Needed**:
```typescript
// In types/intelligence.ts
export interface FieldWatchResult {
  focusedField: string | null;
  confidence: number;
  source: "user" | "ai" | "system" | null;
  timestamp: number;
}
```

**Context Rules**:
- ✅ CAN access: wizardState (read-only), recent history
- ❌ CANNOT modify: wizardState directly
- ✅ CAN call: NO LLM (pure logic, fast)

**Behavior Module Decision**: This DECIDES the focused field, it does NOT act on it

**How Called**: `orchestrateTurn` → Phase 1

---

### 3.3 FeedbackQueue

**File**: `lib/ai/intelligence/FeedbackQueue.ts`

**Functions**:
```typescript
export function checkFeedbackQueue(
  wizardState: WizardState
): FeedbackQueueResult

// Helper: add feedback to queue (called from other modules)
export function enqueueFeedback(
  wizardState: WizardState,
  item: FeedbackItem
): void

// Helper: remove processed feedback
export function dequeueFeedback(
  wizardState: WizardState,
  itemId: string
): void

// Helper: check if feedback expired
function isExpired(item: FeedbackItem): boolean
```

**Types Needed**:
```typescript
// In types/intelligence.ts
export interface FeedbackQueueResult {
  hasPending: boolean;
  items: FeedbackItem[];
  priority: "low" | "medium" | "high";
}

export interface FeedbackItem {
  id: string;
  type: "warning" | "suggestion" | "clarification";
  message: string;
  relatedField?: string;
  createdAt: number;
}
```

**Storage**: `wizardState.metadata.feedbackQueue` (new field in WizardState type)

**Context Rules**:
- ✅ CAN access: wizardState.metadata (read + write)
- ❌ CANNOT call: LLM (pure queue management)

**How Called**: `orchestrateTurn` → Phase 1

---

### 3.4 BehaviorAnalyzer

**File**: `lib/ai/intelligence/BehaviorAnalyzer.ts`

**Functions**:
```typescript
export async function analyzeUserBehavior(
  memory: ConversationMemoryResult,
  wizardState: WizardState
): Promise<BehaviorAnalysis>

// Helper: detect patterns in history
function detectPatterns(history: HistoryItem[]): BehaviorAnalysis["patterns"]

// Helper: detect user signals (overwhelmed, frustrated, etc.)
function detectSignals(history: HistoryItem[]): BehaviorAnalysis["signals"]

// Helper: classify user style
function classifyUserStyle(
  patterns: BehaviorAnalysis["patterns"],
  turnCount: number
): BehaviorAnalysis["userStyle"]

// Helper: recommend tone based on signals
function recommendTone(
  signals: BehaviorAnalysis["signals"]
): BehaviorAnalysis["recommendedTone"]
```

**Types Needed**: (see Module 4 output interface)

**Context Rules**:
- ✅ CAN access: full history, wizardState (read-only)
- ❌ CANNOT modify: wizardState
- ✅ CAN call: LLM (optional, for complex pattern detection)

**How Called**: `orchestrateTurn` → Phase 2

---

### 3.5 AnticipationEngine

**File**: `lib/ai/intelligence/AnticipationEngine.ts`

**Functions**:
```typescript
export async function runAnticipation(
  wizardState: WizardState,
  behaviorSignals: BehaviorAnalysis["signals"],
  currentIntent: ProIntent
): Promise<AnticipationResult>

// Helper: generate intelligent probe questions
async function generateProbes(
  missing: MissingItem[],
  context: { chapter: ChapterKey; recentTopic: string }
): Promise<AnticipationProbe[]>

// Helper: decide if we should interrupt
function shouldInterrupt(
  criticalMissing: MissingItem[],
  behaviorSignals: BehaviorAnalysis["signals"]
): boolean
```

**Types Needed**: (see Module 5 output interface)

**Context Rules**:
- ✅ CAN access: wizardState, behaviorSignals
- ✅ CAN call: `computeMissingFields()` (existing)
- ✅ CAN call: LLM (for context-aware probe generation)
- ❌ CANNOT directly ask user (returns probes for TurnPlanner to decide)

**How Called**: `orchestrateTurn` → Phase 2

---

### 3.6 SystemConflicts

**File**: `lib/ai/intelligence/SystemConflicts.ts`

**Functions**:
```typescript
export function detectSystemConflicts(
  wizardState: WizardState
): SystemConflictsResult

// Helper: check budget vs must-haves
function detectBudgetConflicts(
  budget: BudgetData,
  wensen: WensenData,
  basis: BasisData
): Conflict[]

// Helper: check must-have unsatisfied
function detectMustHaveConflicts(
  wensen: WensenData,
  ruimtes: any
): Conflict[]

// Helper: check physical constraints
function detectPhysicalConflicts(
  ruimtes: any,
  basis: BasisData
): Conflict[]

// Helper: generate resolution suggestions
function generateResolutions(conflicts: Conflict[]): string[]
```

**Types Needed**: (see Module 6 output interface)

**Context Rules**:
- ✅ CAN access: wizardState (read-only)
- ✅ CAN call: `analyzeBudgetRisk()` (existing function)
- ❌ CANNOT call: LLM (pure logic, deterministic)

**How Called**: `orchestrateTurn` → Phase 2

---

### 3.7 TurnPlanner

**File**: `lib/ai/intelligence/TurnPlanner.ts`

**Functions**:
```typescript
export function decideTurn(
  query: string,
  intent: ProIntent,
  conflicts: SystemConflictsResult,
  anticipation: AnticipationResult,
  behavior: BehaviorAnalysis,
  feedback: FeedbackQueueResult
): TurnPlan

// Helper: determine priority
function determinePriority(
  conflicts: SystemConflictsResult,
  feedback: FeedbackQueueResult,
  anticipation: AnticipationResult
): TurnPlan["priority"]

// Helper: select tone based on behavior
function selectTone(
  behavior: BehaviorAnalysis,
  action: TurnPlan["action"]
): TurnPlan["tone"]

// Helper: decide if guard needed
function requiresGuard(
  action: TurnPlan["action"],
  intent: ProIntent
): boolean
```

**Types Needed**: (see Module 7 output interface)

**Context Rules**:
- ✅ CAN access: ALL module outputs (decision hub)
- ❌ CANNOT call: LLM (pure decision logic)
- ❌ CANNOT modify: wizardState (only decides, doesn't execute)

**How Called**: `orchestrateTurn` → Phase 3 (after all intelligence modules)

---

### 3.8 ContextPruner

**File**: `lib/ai/intelligence/ContextPruner.ts`

**Functions**:
```typescript
export function pruneContext(
  wizardState: WizardState,
  memory: ConversationMemoryResult,
  focusedField: string | null,
  maxTokens = 8000
): PrunedContext

// Helper: estimate token count
function estimateTokens(state: any, history: any): number

// Helper: prune chapters
function pruneChapters(
  chapterAnswers: WizardState["chapterAnswers"],
  currentChapter: ChapterKey,
  focusedField: string | null
): Partial<WizardState["chapterAnswers"]>

// Helper: prune history
function pruneHistory(
  history: HistoryItem[],
  maxTurns: number,
  summary: string | null
): HistoryItem[]

// Helper: aggressive pruning (if still over limit)
function aggressivePrune(context: any, targetTokens: number): any
```

**Types Needed**: (see Module 8 output interface)

**Context Rules**:
- ✅ CAN access: wizardState, history (read-only)
- ✅ CAN modify: returns NEW pruned copies (immutable)
- ❌ CANNOT call: LLM (pure data transformation)

**How Called**: `orchestrateTurn` → Phase 4 (before ResponseOrchestrator)

---

### 3.9 ResponseOrchestrator

**File**: `lib/ai/intelligence/ResponseOrchestrator.ts`

**Functions**:
```typescript
export async function generateResponse(
  query: string,
  intent: ProIntent,
  turnPlan: TurnPlan,
  prunedContext: PrunedContext,
  ragContext?: RAGContext
): Promise<OrchestratorResult>

// Helper: generate patch response (VULLEN_DATA)
async function generatePatchResponse(
  query: string,
  prunedContext: PrunedContext
): Promise<OrchestratorResult>

// Helper: generate advice response (ADVIES_VRAAG)
async function generateAdviceResponse(
  query: string,
  ragContext: RAGContext,
  prunedContext: PrunedContext
): Promise<OrchestratorResult>

// Helper: generate probe response
async function generateProbeResponse(
  anticipation: AnticipationResult,
  tone: TurnPlan["tone"]
): Promise<OrchestratorResult>

// Helper: generate conflict resolution response
async function generateConflictResponse(
  conflicts: SystemConflictsResult
): Promise<OrchestratorResult>

// Helper: format feedback response (no LLM)
function formatFeedbackResponse(
  feedback: FeedbackQueueResult
): OrchestratorResult
```

**Types Needed**: (see Module 9 output interface)

**Context Rules**:
- ✅ CAN access: prunedContext (NOT full wizardState)
- ✅ CAN call: ProModel functions (existing)
  - `ProModel.generatePatch()`
  - `ProModel.generateResponse()`
- ✅ CAN call: Kennisbank.query() for RAG (existing)
- ❌ CANNOT make direct OpenAI calls (use ProModel wrappers)

**How Called**: `orchestrateTurn` → Phase 4

---

### 3.10 AnswerGuard

**Status**: ✅ ALREADY EXISTS (lib/ai/AnswerGuard.ts)

**No new functions needed** - integration already in chat/route.ts

---

### 3.11 FallbackStrategy

**File**: `lib/ai/intelligence/FallbackStrategy.ts`

**Functions**:
```typescript
export async function retryWithFallback(
  guardResult: AnswerGuardResult,
  originalQuery: string,
  attemptCount: number,
  orchestratorContext: OrchestratorResult
): Promise<FallbackResult>

// Helper: retry with clarification prompt
async function retryWithClarification(
  query: string,
  suggestions: string[]
): Promise<string>

// Helper: retry with relevance prompt
async function retryWithRelevance(
  query: string,
  suggestions: string[]
): Promise<string>

// Helper: generate fallback message (max retries reached)
function generateFallbackMessage(
  verdict: AnswerGuardResult["verdict"]
): string
```

**Types Needed**: (see Module 11 output interface)

**Context Rules**:
- ✅ CAN access: guardResult, orchestratorContext (read-only)
- ✅ CAN call: `buildClarificationPrompt()`, `buildRelevancePrompt()` (existing)
- ✅ CAN call: LLM (for retry generation)
- ❌ CANNOT retry more than 2 times (hard limit)

**How Called**: `orchestrateTurn` → Phase 5 (after AnswerGuard)

---

### 3.12 orchestrateTurn (Main Orchestrator)

**File**: `lib/ai/intelligence/orchestrateTurn.ts`

**Functions**:
```typescript
export async function orchestrateTurn(
  query: string,
  wizardState: WizardState,
  history: HistoryItem[],
  options: OrchestrateTurnOptions
): Promise<TurnResult>

// Helper: handle errors gracefully
function handleOrchestrationError(
  error: Error,
  stage: string
): TurnResult
```

**Types Needed**:
```typescript
export interface OrchestrateTurnOptions {
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: ProIntent;
}

export interface TurnResult {
  response: string;
  patches: PatchEvent[];
  metadata: {
    intent: ProIntent;
    turnPlan: TurnPlan;
    tokensUsed: number;
    intelligenceTrace?: any; // Debug info
  };
}
```

**Context Rules**:
- ✅ CAN access: ALL modules (coordinator)
- ✅ CAN modify: NO direct state modification (returns result)
- ❌ CANNOT skip modules (unless TurnPlanner says so)

**Integration Point**: Called from `app/api/chat/route.ts` → `runAITriage()`

---

## 4. INTERACTION RULES BETWEEN MODULES

### Rule Set A: Data Flow Rules

1. **ConversationMemory → FieldWatcher**: FieldWatcher MUST use `memory.recent`, not full history
2. **FieldWatcher source filtering**: TurnPlanner ONLY reacts to `source: "user"` for natural flow
3. **FeedbackQueue → TurnPlanner**: High priority feedback BLOCKS normal flow (decision tree rule 2)
4. **SystemConflicts → TurnPlanner**: `shouldBlock == true` ALWAYS takes priority (decision tree rule 1)
5. **AnticipationEngine → TurnPlanner**: `shouldInterrupt` can ONLY interrupt if `!behavior.signals.frustrated`
6. **BehaviorAnalyzer → AnticipationEngine**: Frustrated users get NO probes
7. **ContextPruner → ResponseOrchestrator**: Orchestrator ONLY sees pruned context, never full state
8. **TurnPlanner → AnswerGuard**: Guard ONLY runs if `turnPlan.route == "guard_required"`
9. **AnswerGuard → FallbackStrategy**: Fallback ONLY runs if `verdict != "OK"`

### Rule Set B: Call Order Rules

**Strict Sequence** (cannot be reordered):
1. ConversationMemory (foundation)
2. FieldWatcher (depends on memory)
3. FeedbackQueue (independent)
4. BehaviorAnalyzer (depends on memory)
5. AnticipationEngine (depends on behavior)
6. SystemConflicts (independent)
7. TurnPlanner (depends on ALL previous)
8. ContextPruner (depends on FieldWatcher, ConversationMemory)
9. ResponseOrchestrator (depends on TurnPlanner, ContextPruner)
10. AnswerGuard (depends on Orchestrator output)
11. FallbackStrategy (depends on Guard verdict)

**Parallel Execution** (can run concurrently):
- Step 3 (FeedbackQueue) || Step 6 (SystemConflicts)
- Future optimization: Steps 4-6 can be parallelized if no cross-dependencies

### Rule Set C: Behavioral Rules

1. **Never Ask Twice**: AnticipationEngine tracks asked probes, waits 5+ turns before re-asking
2. **Respect User Topic**: TurnPlanner MUST NOT interrupt user-initiated topics unless critical conflict
3. **Tone Consistency**: Once TurnPlanner sets tone, ALL subsequent modules use same tone
4. **Guard Efficiency**: Only expensive topics (budget, legal, technical) trigger AnswerGuard
5. **Conflict Priority**: SystemConflicts ALWAYS beats Anticipation (safety first)

### Rule Set D: Safety Rules

1. **No Infinite Loops**: Maximum 2 retries per turn (FallbackStrategy limit)
2. **Token Budget**: ContextPruner MUST stay under maxTokens, fall back to minimal context if needed
3. **Fail-Safe Defaults**: Every module returns safe defaults on error, NEVER throws unhandled
4. **State Immutability**: NO module modifies wizardState directly (only returns patches)
5. **No Hallucinati** (continued): AnswerGuard blocks hallucinations about budget/legal/technical facts

---

## 5. VEILIGHEIDSSCHEMA'S

### 5.1 Rate Limiting & Debouncing

**Problem**: User typing fast, triggering multiple overlapping LLM calls

**Solution**:
```typescript
// In orchestrateTurn()
const DEBOUNCE_MS = 300;
const inProgressCalls = new Map<string, Promise<TurnResult>>();

export async function orchestrateTurn(...) {
  const callId = `${userId}-${Date.now()}`;

  // Debounce: wait 300ms for more input
  await sleep(DEBOUNCE_MS);

  // De-duplicate: check if newer call already started
  if (hasNewerCall(callId)) {
    return { response: "", patches: [], metadata: { skipped: true } };
  }

  inProgressCalls.set(callId, executeOrchestration(...));
  try {
    return await inProgressCalls.get(callId);
  } finally {
    inProgressCalls.delete(callId);
  }
}
```

**Limits**:
- Maximum 1 concurrent orchestration per user
- Debounce: 300ms wait before processing
- Timeout: 30s maximum (Next.js maxDuration)

### 5.2 Patch Restrictions

**Problem**: AI generating dangerous patches (deleting all data, invalid operations)

**Validation Rules** (already in chat/route.ts, expand):
```typescript
// In ResponseOrchestrator
function validatePatch(patch: PatchEvent): boolean {
  // 1. Chapter must be in allowed list
  if (!VALID_CHAPTERS.includes(patch.chapter)) return false;

  // 2. Operation must be valid
  if (!VALID_OPS.includes(patch.delta.operation)) return false;

  // 3. Remove operation: must have index, not delete entire array
  if (patch.delta.operation === "remove") {
    if (typeof patch.delta.value?.index !== "number") return false;
  }

  // 4. Append operation: must be on array field
  if (patch.delta.operation === "append") {
    if (!["rooms", "wishes", "risks"].includes(patch.delta.path)) return false;
  }

  // 5. Set operation: value type must match schema
  if (patch.delta.operation === "set") {
    return validateSetValue(patch.chapter, patch.delta.path, patch.delta.value);
  }

  return true;
}
```

**Blocked Operations**:
- ❌ Deleting entire chapter data
- ❌ Setting negative budget values
- ❌ Appending to non-array fields
- ❌ Modifying stateVersion directly
- ❌ Patching chapters not in chapterFlow

### 5.3 Tone Enforcement

**Problem**: AI deviating from planned tone, being too casual or too formal

**Enforcement** (in ResponseOrchestrator):
```typescript
function buildSystemPromptWithTone(turnPlan: TurnPlan): string {
  const toneInstructions = {
    supportive: "U bent behulpzaam en vriendelijk. U moedigt aan zonder te pushen.",
    directive: "U geeft duidelijke, concrete instructies. U bent to-the-point maar beleefd.",
    informative: "U legt zaken uit met feiten en context. U bent objectief en helder.",
    collaborative: "U denkt mee met de gebruiker. U stelt vragen en overweegt opties samen."
  };

  return `
${toneInstructions[turnPlan.tone]}

TONE CHECK:
- Spreek ALTIJD met "u" en "uw" (formeel)
- GEEN emoji's tenzij expliciet gevraagd
- GEEN overdreven enthousiasme ("Super!", "Geweldig!")
- WEL: professioneel, behulpzaam, geduldig
`;
}
```

**Validation**: Post-generation check for tone violations (future: AnswerGuard extension)

### 5.4 JSON Validatie

**Problem**: LLM returning invalid JSON for structured outputs (patches, probes)

**Solution** (existing + expand):
```typescript
// Wrap ALL LLM calls with JSON parsing safety
async function callLLMWithJSONValidation<T>(
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      ...
      body: JSON.stringify({
        ...
        response_format: { type: "json_object" }, // ✅ Force JSON mode
      })
    });

    const raw = await response.json();
    const content = raw.choices[0]?.message?.content || "{}";

    // Clean markdown artifacts
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Parse + validate with Zod
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed); // Throws if invalid
  } catch (error) {
    console.error("[LLM] JSON validation failed:", error);
    throw new Error("Invalid LLM response format");
  }
}
```

**Zod Schemas**:
- `PatchEventSchema` (already exists in types/project.ts)
- `AnticipationProbeSchema` (new)
- `ConflictSchema` (new)

### 5.5 Illegal Content Checks

**Problem**: User inputting offensive/inappropriate content

**Solution** (add to orchestrateTurn, before processing):
```typescript
// In orchestrateTurn(), before Phase 1
const contentCheckResult = await checkContentSafety(query);
if (!contentCheckResult.safe) {
  return {
    response: "Ik kan hier helaas niet op ingaan. Laten we focussen op uw bouwproject.",
    patches: [],
    metadata: { intent: "OUT_OF_SCOPE", blocked: true }
  };
}

// Use OpenAI moderation API or simple keyword filter
async function checkContentSafety(text: string): Promise<{ safe: boolean }> {
  // Option 1: OpenAI Moderation API
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text }),
  });

  const result = await response.json();
  return { safe: !result.results[0].flagged };
}
```

**Blocked Content**:
- Hate speech, harassment
- Sexual content
- Violence
- Self-harm references
- Spam / promotional content

---

## 6. SEQUENCE DIAGRAMS

### 6.1 Normale Chat Turn (Happy Path)

```
USER: "Ik wil een grote keuken met kookeiland"

┌──────────┐    ┌──────────────────────────────────────────┐
│  Client  │    │  orchestrateTurn()                        │
└─────┬────┘    └────────┬─────────────────────────────────┘
      │                  │
      │ POST /api/chat   │
      ├─────────────────>│
      │                  │
      │                  │ Phase 1: Memory & Context
      │                  ├──> ConversationMemory.load(history)
      │                  │    └─> { recent: [...], turnCount: 5 }
      │                  │
      │                  ├──> FieldWatcher.detect(state, recent)
      │                  │    └─> { focusedField: "ruimtes:rooms", source: "user" }
      │                  │
      │                  ├──> FeedbackQueue.check(state)
      │                  │    └─> { hasPending: false }
      │                  │
      │                  │ Phase 2: Intelligence
      │                  ├──> BehaviorAnalyzer.analyze(memory, state)
      │                  │    └─> { signals: { engaged: true }, recommendedTone: "collaborative" }
      │                  │
      │                  ├──> AnticipationEngine.run(state, signals)
      │                  │    └─> { shouldInterrupt: false }
      │                  │
      │                  ├──> SystemConflicts.detect(state)
      │                  │    └─> { conflicts: [], shouldBlock: false }
      │                  │
      │                  │ Phase 3: Planning
      │                  ├──> ProModel.classify(query, state)
      │                  │    └─> { intent: "VULLEN_DATA", confidence: 0.95 }
      │                  │
      │                  ├──> TurnPlanner.decide(...)
      │                  │    └─> { action: "patch", tone: "collaborative", route: "normal" }
      │                  │
      │                  │ Phase 4: Execution
      │                  ├──> ContextPruner.prune(state, memory, focus)
      │                  │    └─> { prunedState: {...}, tokenEstimate: 3200 }
      │                  │
      │                  ├──> ResponseOrchestrator.generate(query, pruned)
      │                  │    ├─> ProModel.generatePatch(query, pruned, history)
      │                  │    └─> { draftResponse: "Prima! Ik noteer een grote keuken...",
      │                  │         patches: [{ chapter: "ruimtes", delta: {...} }] }
      │                  │
      │                  │ Phase 5: Output (skip Guard for patches)
      │<─────────────────┤ SSE: metadata event
      │<─────────────────┤ SSE: patch event
      │<─────────────────┤ SSE: stream event (chunks)
      │<─────────────────┤ SSE: done event
      │                  │
```

### 6.2 Chapter Opening Turn (Anticipation Trigger)

```
USER: Navigates to "Budget" chapter (leeg)

┌──────────┐    ┌──────────────────────────────────────────┐
│  Client  │    │  orchestrateTurn()                        │
└─────┬────┘    └────────┬─────────────────────────────────┘
      │                  │
      │ Chapter change   │
      │ event triggers   │
      │ "help me start"  │
      ├─────────────────>│
      │                  │
      │                  │ Phase 1: Memory & Context
      │                  ├──> ConversationMemory (empty chapter history)
      │                  ├──> FieldWatcher (no focus yet)
      │                  ├──> FeedbackQueue (empty)
      │                  │
      │                  │ Phase 2: Intelligence
      │                  ├──> BehaviorAnalyzer
      │                  │    └─> { signals: { exploring: true }, tone: "supportive" }
      │                  │
      │                  ├──> AnticipationEngine.run(state, signals)
      │                  │    └─> { criticalMissing: ["budget:budgetTotaal"],
      │                  │         probes: [{ question: "Heeft u al een budget in gedachten?",
      │                  │                   priority: "high" }],
      │                  │         shouldInterrupt: true }
      │                  │
      │                  ├──> SystemConflicts (no conflicts yet)
      │                  │
      │                  │ Phase 3: Planning
      │                  ├──> TurnPlanner.decide(...)
      │                  │    └─> { action: "probe",  ← ANTICIPATION WINS
      │                  │         priority: "anticipation",
      │                  │         tone: "supportive" }
      │                  │
      │                  │ Phase 4: Execution
      │                  ├──> ResponseOrchestrator.generate(...)
      │                  │    ├─> generateProbeResponse(anticipation, tone)
      │                  │    └─> { draftResponse: "Welkom bij Budget! Heeft u al een
      │                  │                            indicatief budget in gedachten voor
      │                  │                            dit project? Dan kan ik u gerichter
      │                  │                            adviseren.",
      │                  │         patches: [],
      │                  │         confidence: 0.9 }
      │                  │
      │                  │ Phase 5: Output (no Guard for probes)
      │<─────────────────┤ SSE: metadata (intent: "ANTICIPATION")
      │<─────────────────┤ SSE: stream (probe question)
      │<─────────────────┤ SSE: suggestions (quick replies)
      │<─────────────────┤ SSE: done
```

### 6.3 AI-Triggered Feedback (SystemConflicts)

```
USER: "Ik wil een zwembad, een home cinema, en een grote serre"
      (Budget: €100k, Must-haves total estimated: €250k)

┌──────────┐    ┌──────────────────────────────────────────┐
│  Client  │    │  orchestrateTurn()                        │
└─────┬────┘    └────────┬─────────────────────────────────┘
      │                  │
      │ POST /api/chat   │
      ├─────────────────>│
      │                  │
      │                  │ Phase 1: Memory & Context
      │                  ├──> (standard loading)
      │                  │
      │                  │ Phase 2: Intelligence
      │                  ├──> BehaviorAnalyzer
      │                  │    └─> { signals: { engaged: true } }
      │                  │
      │                  ├──> AnticipationEngine
      │                  │    └─> { shouldInterrupt: false }
      │                  │
      │                  ├──> SystemConflicts.detect(state)
      │                  │    ├─> detectBudgetConflicts(budget, wensen)
      │                  │    └─> { conflicts: [
      │                  │          { type: "budget_risk",
      │                  │            severity: "critical",
      │                  │            description: "Must-have wensen (~€250k) overschrijden budget (€100k)",
      │                  │            resolutionSuggestions: [
      │                  │              "Sommige must-haves herclassificeren naar nice-to-have",
      │                  │              "Budget verhogen of in fases werken"
      │                  │            ]}
      │                  │        ],
      │                  │        shouldBlock: true }  ← CRITICAL CONFLICT
      │                  │
      │                  │ Phase 3: Planning
      │                  ├──> ProModel.classify(query, state)
      │                  │    └─> { intent: "VULLEN_DATA", confidence: 0.9 }
      │                  │
      │                  ├──> TurnPlanner.decide(...)
      │                  │    └─> { action: "conflict_resolution",  ← CONFLICT PRIORITY
      │                  │         priority: "system_conflict",
      │                  │         tone: "directive",
      │                  │         route: "guard_required" }
      │                  │
      │                  │ Phase 4: Execution
      │                  ├──> ContextPruner (include budget + wensen context)
      │                  │
      │                  ├──> ResponseOrchestrator.generate(...)
      │                  │    ├─> generateConflictResponse(conflicts)
      │                  │    └─> { draftResponse: "Ik zie dat uw must-have wensen
      │                  │                            (zwembad, cinema, serre) naar schatting
      │                  │                            €250k kosten, maar uw budget is €100k.
      │                  │
      │                  │                            U heeft drie opties:
      │                  │                            1. Sommige wensen herclassificeren naar
      │                  │                               nice-to-have (later realiseren)
      │                  │                            2. Budget verhogen naar €250k+
      │                  │                            3. In fases werken (eerst prioriteiten)
      │                  │
      │                  │                            Hoe wilt u hiermee omgaan?",
      │                  │         patches: [],  ← NO patches applied during conflict
      │                  │         confidence: 0.95 }
      │                  │
      │                  │ Phase 5: Validation
      │                  ├──> AnswerGuard.validate(query, draft, "VULLEN_DATA")
      │                  │    └─> { verdict: "OK",  ← Conflict resolution is relevant
      │                  │         reasons: ["Addresses budget constraint clearly"] }
      │                  │
      │                  │ Output (conflict blocks normal flow)
      │<─────────────────┤ SSE: metadata (intent: "CONFLICT_RESOLUTION")
      │<─────────────────┤ SSE: stream (conflict explanation + options)
      │<─────────────────┤ SSE: done (NO patches sent!)
      │                  │
      │                  │ Feedback ADDED to queue:
      │                  ├──> FeedbackQueue.enqueue(state, {
      │                  │      type: "warning",
      │                  │      message: "Budget vs must-haves conflict",
      │                  │      priority: "high" })
```

---

## 7. GEFASEERDE ROADMAP

### Fase 1: Fundament (Week 1) - CRITICAL PATH

**Doel**: Basis modules zonder AI-logica, pure data management

**Te bouwen**:
1. ✅ Types definieren (types/intelligence.ts)
   - Alle interfaces uit Module Dependency Matrix
   - Zod schemas voor validatie
2. ✅ ConversationMemory (Module 1)
   - Zonder summarization (placeholder)
   - Test: Load history, return recent + count
3. ✅ FieldWatcher (Module 2)
   - Simpele keyword matching (geen ML)
   - Test: Detect "budget" → "budget:budgetTotaal"
4. ✅ FeedbackQueue (Module 3)
   - Queue management in wizardState.metadata
   - Test: Enqueue, check, dequeue
5. ✅ Helper functies
   - Token estimation (rough)
   - Field name normalization

**Output Fase 1**:
- `lib/ai/intelligence/ConversationMemory.ts`
- `lib/ai/intelligence/FieldWatcher.ts`
- `lib/ai/intelligence/FeedbackQueue.ts`
- `types/intelligence.ts`
- Test suite: `__tests__/intelligence/phase1.test.ts`

**Success Criteria**:
- [ ] All phase 1 modules return valid typed outputs
- [ ] No LLM calls yet (pure logic)
- [ ] Test coverage >80%

---

### Fase 2: Gedrag + Intelligentie (Week 2) - AI BRAIN

**Doel**: Intelligente modules met LLM-ondersteuning

**Te bouwen**:
1. ✅ BehaviorAnalyzer (Module 4)
   - Pattern detection (regex + keyword)
   - Signal detection (sentiment analysis via LLM optional)
   - Test: Detect "frustrated" from repeated questions
2. ✅ AnticipationEngine (Module 5)
   - Integrate `computeMissingFields` (existing)
   - LLM-based probe generation
   - Test: Generate context-aware probe for missing budget
3. ✅ SystemConflicts (Module 6)
   - Budget risk detection (existing `analyzeBudgetRisk`)
   - Must-have satisfaction check
   - Physical constraint checks (oppervlakte, ruimte fit)
   - Test: Detect budget conflict, generate resolutions
4. ✅ TurnPlanner (Module 7)
   - Decision tree implementation
   - Priority logic
   - Test: Conflict → conflict_resolution, Normal → patch

**Output Fase 2**:
- `lib/ai/intelligence/BehaviorAnalyzer.ts`
- `lib/ai/intelligence/AnticipationEngine.ts`
- `lib/ai/intelligence/SystemConflicts.ts`
- `lib/ai/intelligence/TurnPlanner.ts`
- Test suite: `__tests__/intelligence/phase2.test.ts`

**Success Criteria**:
- [ ] TurnPlanner correctly prioritizes conflicts over user query
- [ ] AnticipationEngine generates relevant probes (manual review)
- [ ] BehaviorAnalyzer detects >3 user styles accurately
- [ ] No infinite loops (max 2 probes per turn enforced)

---

### Fase 3: Pipeline (Week 3) - EXECUTION

**Doel**: Orkestratie, pruning, response generation, validation

**Te bouwen**:
1. ✅ ContextPruner (Module 8)
   - Token estimation (use tiktoken library)
   - Pruning logic (keep focused field)
   - Test: Prune 100-room state to <8k tokens
2. ✅ ResponseOrchestrator (Module 9)
   - Integrate ProModel functions (existing)
   - Route to correct generation function based on TurnPlan
   - Test: Generate patch response, advice response, probe response
3. ✅ FallbackStrategy (Module 11)
   - Retry logic with clarification/relevance prompts
   - Fallback message generation
   - Test: Retry once on NEEDS_CLARIFICATION, give up after 2 attempts
4. ✅ orchestrateTurn (Module 12)
   - Main coordinator
   - Error handling wrapper
   - Test: Full happy path, conflict path, anticipation path

**Output Fase 3**:
- `lib/ai/intelligence/ContextPruner.ts`
- `lib/ai/intelligence/ResponseOrchestrator.ts`
- `lib/ai/intelligence/FallbackStrategy.ts`
- `lib/ai/intelligence/orchestrateTurn.ts`
- Test suite: `__tests__/intelligence/phase3.test.ts`

**Success Criteria**:
- [ ] orchestrateTurn completes happy path end-to-end
- [ ] ContextPruner stays under token limit 100% of time
- [ ] FallbackStrategy successfully recovers from bad responses
- [ ] All modules integrated, no import errors

---

### Fase 4: Integratie + Testing (Week 4) - GO LIVE

**Doel**: Wire up to existing chat/route.ts, polish, production-ready

**Te bouwen**:
1. ✅ Replace runAITriage logic
   - Call `orchestrateTurn()` instead of direct ProModel calls
   - Keep existing SSE streaming
   - Preserve @protected features (META_TOOLING, ONBOARDING)
2. ✅ Monitoring & Logging
   - Add intelligence trace to metadata
   - Log decision tree path for debugging
   - Performance metrics (latency per phase)
3. ✅ Safety Hardening
   - Implement all schemas from Section 5
   - Add rate limiting (300ms debounce)
   - Content safety check
4. ✅ Documentation
   - API docs for each module
   - Integration guide for extending
   - Runbook for debugging issues

**Output Fase 4**:
- Updated `app/api/chat/route.ts`
- `lib/ai/intelligence/index.ts` (barrel export)
- Monitoring dashboard (optional)
- Production deployment checklist

**Success Criteria**:
- [ ] All existing features still work (regression test)
- [ ] orchestrateTurn handles 100% of test cases without errors
- [ ] Latency <2s for 95th percentile
- [ ] Zero hallucinations in budget/legal advice (AnswerGuard working)
- [ ] Proactive anticipation working in real conversations

---

## 8. RISICOANALYSE

### Risico 1: Performance - Token Overflow

**Beschrijving**: Wizard state te groot, overschrijdt context window

**Kans**: HOOG (bij projecten met 50+ ruimtes/wensen)

**Impact**: KRITIEK (crash of incomplete context)

**Mitigatie**:
- ✅ ContextPruner aggressive mode (truncate arrays)
- ✅ Token estimation BEFORE LLM call
- ✅ Fallback: minimal context (only current chapter + projectMeta)
- ✅ Monitoring: alert if tokenEstimate > 7000

### Risico 2: Infinite Loop - Probe Spam

**Beschrijving**: AnticipationEngine keeps asking same question

**Kans**: MEDIUM (logic bug in shouldInterrupt)

**Impact**: HOOG (user frustration, bad UX)

**Mitigatie**:
- ✅ Track asked probes in wizardState.metadata.askedProbes
- ✅ Hard limit: max 1 probe per turn
- ✅ Cooldown: wait 5 turns before re-asking same probe
- ✅ BehaviorAnalyzer detects frustration → disable probes

### Risico 3: Inconsistentie - Conflicting Decisions

**Beschrijving**: TurnPlanner decides "patch" but SystemConflicts says "block"

**Kans**: LAAG (decision tree is deterministic)

**Impact**: MEDIUM (confusing user experience)

**Mitigatie**:
- ✅ Decision tree ALWAYS checks conflicts.shouldBlock first
- ✅ Unit test all priority branches
- ✅ Logging: trace decision path for debugging

### Risico 4: Token Overflow - Context Pruner Fails

**Beschrijving**: After pruning, context still >8k tokens

**Kans**: LAAG (only if state extremely large)

**Impact**: KRITIEK (LLM call fails)

**Mitigatie**:
- ✅ Aggressive prune mode (keep only 3 rooms/wishes + counts)
- ✅ Fallback: if still over, truncate history to 1 turn
- ✅ Ultimate fallback: error message "Project te groot, deel in fases op"

### Risico 5: Fallback Overschrijding - Max Retries

**Beschrijving**: AnswerGuard keeps rejecting, FallbackStrategy gives up

**Kans**: MEDIUM (voor complexe/vage vragen)

**Impact**: MEDIUM (user gets generic fallback message)

**Mitigatie**:
- ✅ Hard limit: 2 retries max
- ✅ Graceful degradation: use last retry response (better than nothing)
- ✅ Logging: alert on frequent fallbacks (quality issue)
- ✅ Fallback message: "Kunt u uw vraag specifieker formuleren?"

### Risico 6: Race Condition - Parallel Module Calls

**Beschrijving**: If modules run in parallel, shared state corruption

**Kans**: LAAG (current design is sequential)

**Impact**: KRITIEK (unpredictable behavior)

**Mitigatie**:
- ✅ Keep sequential execution for v3.1 (optimize later)
- ✅ If parallelizing: use immutable data structures
- ✅ No shared mutable state between modules

### Risico 7: LLM Hallucination - Budget/Legal Advice

**Beschrijving**: AI makes up budget numbers or legal rules

**Kans**: MEDIUM (zonder AnswerGuard)

**Impact**: KRITIEK (liability, user trust)

**Mitigatie**:
- ✅ AnswerGuard ALWAYS enabled for ADVIES_VRAAG
- ✅ Extra strict on budget/legal topics (defined in AnswerGuard prompt)
- ✅ RAG-first: always check Kennisbank before generating advice
- ✅ Disclaimer in response: "Dit is een indicatie, vraag professional voor zekerheid"

---

## 9. OPENSTAANDE VRAGEN EN AANNAMES

### Vragen voor Gebruiker/PO

1. **Anticipation Frequency**: Hoe vaak mogen we proactief vragen stellen?
   - Huidige aanname: Max 1 per 5 turns als niet frustrerend
   - Vraag: Is dit te weinig/te veel? Gebruikerstesten nodig?

2. **Conflict Priority**: Wat als budget conflict EN missing critical field?
   - Huidige aanname: Conflict ALTIJD eerst
   - Vraag: Of beide in één response combineren?

3. **Tone Switching**: Mag tone binnen één gesprek veranderen?
   - Huidige aanname: Ja, based on behavior signals
   - Vraag: Of consistency belangrijker (één tone per sessie)?

4. **Pruning Aggressiveness**: Bij welk punt geven we op?
   - Huidige aanname: Truncate tot 3 items, daarna fallback
   - Vraag: Of altijd proberen hele state te behouden?

5. **Fallback Message**: Wat zeggen we als we echt niet verder kunnen?
   - Huidige aanname: "Kunt u uw vraag specifieker formuleren?"
   - Vraag: Alternatieve suggesties? Contact met mens?

### Aannames over Techniek

1. **Token Estimation**: Aanname 1 token ≈ 4 characters (Engels)
   - Realiteit: Nederlands kan anders zijn
   - Actie: Test met tiktoken library, calibreer

2. **LLM Response Time**: Aanname <2s voor generateResponse
   - Realiteit: Afhankelijk van OpenAI load
   - Actie: Timeout na 10s, fallback

3. **ConversationMemory Summarization**: Wanneer triggeren?
   - Aanname: Na 20 turns
   - Actie: Test met echte gesprekken, tune threshold

4. **BehaviorAnalyzer Accuracy**: Kunnen we sentiment detect zonder ML model?
   - Aanname: Keyword-based voldoende voor v3.1
   - Actie: Evalueer na pilotfase, overweeg sentiment API

5. **SystemConflicts Physical Constraints**: Hoe detect "zwembad past niet in 50m²"?
   - Aanname: Simpele heuristic (zwembad needs >30m²)
   - Actie: Bouw lookup table voor common ruimtes

### Edge Cases die Nog Niet Helder Zijn

1. **User Explicitly Disagrees with Conflict**: "Nee, budget is oké, ga door"
   - Huidige plan: Respecteer user, disable conflict warning
   - Vraag: Opnieuw waarschuwen na X turns? Of permanent ignoren?

2. **Multiple Must-Haves Conflicting**: "Veel licht" + "Geen ramen i.v.m. privacy"
   - Huidige plan: Detect in SystemConflicts, flag as design conflict
   - Vraag: Hoe oplossen? AI suggests compromise? Of gebruiker laten kiezen?

3. **Anticipation During Crisis**: User in midden van conflict, maar missing field kritiek
   - Huidige plan: Conflict eerst, anticipation later
   - Vraag: Of beide combineren in één message?

4. **Feedback Queue Overflow**: Wat als 10+ pending feedbacks?
   - Huidige plan: Show max 3 per turn, rest blijft in queue
   - Vraag: Of samenvatten in "Er zijn nog X aandachtspunten"?

5. **Context Pruner Removes Focused Field**: User discussing "ruimte X", but pruned
   - Huidige plan: ContextPruner NEVER prunes focused field
   - Vraag: Wat als focused field chapter niet in flow? Skip pruning?

### Designkeuzes die Bevestigd Moeten Worden

1. **Sequence vs Parallel Execution**: Modules sequentieel (veiliger) of parallel (sneller)?
   - **Aanbeveling**: Start sequential, optimize parallel in v3.2
   - **Reden**: Complexity vs performance trade-off

2. **AnswerGuard Scope**: Alleen ADVIES_VRAAG of ook patches?
   - **Aanbeveling**: Alleen ADVIES_VRAAG (patches validate via schema)
   - **Reden**: Overkill voor structured data, focus op natural language

3. **TurnPlanner as Singleton**: Eén centraal decision point of multiple?
   - **Aanbeveling**: Singleton (single source of truth)
   - **Reden**: Voorkomt conflicting decisions

4. **ConversationMemory Summarization**: LLM-based of heuristic?
   - **Aanbeveling**: Start heuristic (last 10 turns), add LLM later
   - **Reden**: Cost vs quality voor v3.1

5. **FeedbackQueue Persistence**: In-memory of database?
   - **Aanbeveling**: In-memory (wizardState.metadata)
   - **Reden**: Simplicity, feedback expire na 10 min anyway

---

## 10. IMPLEMENTATIE CHECKLIST

### Pre-Implementation

- [ ] PO/User approval on open questions (Section 9)
- [ ] Confirm "GO BUILD" (document explicitly states to wait)
- [ ] Create feature branch: `feature/architect-intelligence-v3.1`
- [ ] Set up test infrastructure (Jest + coverage)

### Fase 1 Tasks

- [ ] Define all types in `types/intelligence.ts`
- [ ] Implement ConversationMemory (no summarization)
- [ ] Implement FieldWatcher (keyword matching)
- [ ] Implement FeedbackQueue (queue logic)
- [ ] Write unit tests for Phase 1 (>80% coverage)
- [ ] Manual test: Feed sample history, verify outputs

### Fase 2 Tasks

- [ ] Implement BehaviorAnalyzer (pattern + signal detection)
- [ ] Implement AnticipationEngine (integrate computeMissingFields)
- [ ] Implement SystemConflicts (budget risk + must-have checks)
- [ ] Implement TurnPlanner (decision tree)
- [ ] Write unit tests for Phase 2
- [ ] Integration test: Run Phases 1+2, verify TurnPlan

### Fase 3 Tasks

- [ ] Implement ContextPruner (token estimation + pruning)
- [ ] Implement ResponseOrchestrator (route to ProModel functions)
- [ ] Implement FallbackStrategy (retry logic)
- [ ] Implement orchestrateTurn (main coordinator)
- [ ] Write unit tests for Phase 3
- [ ] End-to-end test: Full pipeline, verify SSE output

### Fase 4 Tasks

- [ ] Integrate orchestrateTurn into `app/api/chat/route.ts`
- [ ] Preserve @protected features (META_TOOLING, ONBOARDING)
- [ ] Add monitoring (intelligence trace in metadata)
- [ ] Implement safety schemas (rate limiting, content check)
- [ ] Regression test: All existing features work
- [ ] Performance test: Latency <2s for 95th percentile
- [ ] Production deployment (canary rollout)

---

## CONCLUSIE

**Totaal Geschatte Effort**: 4 weken (1 FTE developer)

**Dependencies**:
- ✅ Existing: AnswerGuard, ProModel, Kennisbank, CHAPTER_SCHEMAS
- ❌ New: 11 nieuwe modules (12 incl orchestrateTurn)

**Risk Level**: MEDIUM
- Hoog: Performance (context overflow) - mitigated met ContextPruner
- Medium: Infinite loops (probe spam) - mitigated met tracking + cooldown
- Laag: Logic bugs (conflict priority) - mitigated met unit tests

**Go/No-Go Decision Factors**:
1. ✅ Fundament is solide (v4.0 AnswerGuard werkend)
2. ✅ Clear module boundaries (geen monolith)
3. ⚠️ User acceptance op anticipation frequency nodig
4. ⚠️ Performance testing met large states vereist
5. ✅ Rollback plan: Keep old runAITriage logic tot v3.1 stable

**Aanbeveling**: GO - maar start met Fase 1+2 pilottest voor user feedback op anticipation/tone voordat Fase 3+4 volledig uitrollen.

---

**EINDE MASTER IMPLEMENTATION PLAN v3.1**

**Status**: AWAITING "GO BUILD" CONFIRMATION

Zodra bevestigd, start implementatie met Fase 1.
