# Week 2 Architectural Corrections - REQUIRED BEFORE Week 3

**Status**: ⚠️ BLOCKING - Must be fixed before Week 3
**Estimated Time**: 2-3 hours
**Context**: Week 2 modules deviate from v3.1 Manifest specification

---

## Fix 1: BehaviorAnalyzer - Remove Personality Profiling

### Current (WRONG):
```typescript
// types/ai.ts lines 188-204
export type UserStyle = 'explorer' | 'doer' | 'delegator' | 'researcher';  // ❌ DELETE
export type RecommendedTone = 'supportive' | 'directive' | 'informative' | 'collaborative';  // ❌ DELETE

export interface BehaviorProfile {
  patterns: BehaviorPattern;  // ❌ DELETE
  signals: BehaviorSignals;   // ✅ KEEP (but change signals)
  userStyle: UserStyle;       // ❌ DELETE
  recommendedTone: RecommendedTone;  // ❌ DELETE
  turnCount: number;
}
```

### Correct (per Manifest):
```typescript
// types/ai.ts - REPLACE BehaviorProfile
export interface BehaviorSignals {
  overwhelmed: boolean;
  confused: boolean;     // NEW - replaces "frustrated"
  impatient: boolean;    // NEW - replaces "engaged" inverted
  engaged: boolean;      // KEEP
}

export interface BehaviorProfile {
  signals: BehaviorSignals;
  toneHint: 'warm' | 'neutral' | 'direct';
  confidenceLevel: 'low' | 'medium' | 'high';
  speedPreference: 'thorough' | 'balanced' | 'quick';
  turnCount: number;
}
```

### Files to Update:
1. `types/ai.ts` - Change BehaviorProfile interface
2. `lib/ai/BehaviorAnalyzer.ts` - Remove `detectPatterns()`, `classifyUserStyle()`, `recommendTone()`
3. `lib/ai/BehaviorAnalyzer.ts` - Add `determineToneHint()`, `determineConfidenceLevel()`, `determineSpeedPreference()`
4. `__tests__/ai/BehaviorAnalyzer.test.ts` - Remove personality tests, add new signal tests

---

## Fix 2: TurnPlanner - Only Official TurnGoals

### Current (WRONG):
```typescript
// types/ai.ts lines 213-219
export type TurnAction =
  | 'patch'                  // ❌ Should be 'fill_data'
  | 'advies'                 // ❌ Not in Manifest
  | 'probe'                  // ❌ Should be 'anticipate_and_guide'
  | 'navigate'               // ❌ Not a TurnGoal
  | 'feedback'               // ❌ Not a TurnGoal
  | 'conflict_resolution';   // ❌ Should be 'surface_risks'
```

### Correct (per Manifest):
```typescript
// types/ai.ts - REPLACE TurnAction
export type TurnGoal =
  | 'fill_data'              // Collect wizard data
  | 'anticipate_and_guide'   // Proactive guidance
  | 'surface_risks'          // Show conflicts
  | 'offer_alternatives'     // Present options
  | 'clarify';               // Ask clarifying question

export interface TurnPlan {
  goal: TurnGoal;            // RENAME from 'action'
  priority: TurnPriority;
  route: TurnRoute;
  reasoning: string;
  subActions?: string[];     // NEW - for 'navigate', 'reset', etc.
  systemConflicts?: SystemConflict[];
  anticipationGuidance?: AnticipationGuidance;
}
```

### Files to Update:
1. `types/ai.ts` - Rename TurnAction → TurnGoal, change values
2. `lib/ai/TurnPlanner.ts` - Update all action references to goal
3. `lib/ai/ContextPruner.ts` - Change `turnPlan.action` to `turnPlan.goal`
4. `lib/ai/ChapterInitializer.ts` - Change references
5. ALL test files - Update action names to goal names

---

## Fix 3: ChapterInitializer - Remove Tone Assignment

### Current (WRONG):
```typescript
// lib/ai/ChapterInitializer.ts lines 95-101
const message = getChapterOpeningMessage({
  chapter,
  userExperience,      // ❌ DELETE
  tone: turnPlan.tone, // ❌ DELETE - tone comes from LLM
  hasConflict,
  hasAnticipation,
});

// types/ai.ts
export interface ChapterOpeningResponse {
  message: string;
  turnGoal: TurnAction;  // OK but rename to TurnGoal
  tone: RecommendedTone; // ❌ DELETE
  allowPatches: boolean;
  focusChapter: ChapterKey;
}
```

### Correct (per Manifest):
```typescript
// types/ai.ts - REPLACE ChapterOpeningResponse
export interface ChapterOpeningResponse {
  message: string;
  turnGoal: TurnGoal;    // RENAME from TurnAction
  allowPatches: boolean;
  focusChapter: ChapterKey;
  // NO tone field - LLM determines tone
}

// lib/ai/ChapterInitializer.ts - SIMPLIFY
const message = getChapterOpeningMessage({
  chapter,
  hasConflict,
  hasAnticipation,
  // NO userExperience, NO tone
});
```

### Files to Update:
1. `types/ai.ts` - Remove `tone` from ChapterOpeningResponse
2. `lib/ai/ChapterInitializer.ts` - Remove userExperience logic, remove tone passing
3. `lib/ai/helpers/chapterTemplates.ts` - Remove tone/userExperience parameters
4. `__tests__/ai/ChapterInitializer.test.ts` - Remove tone assertion tests

---

## Execution Order

1. **Fix types first** (`types/ai.ts`)
2. **Fix BehaviorAnalyzer** + tests
3. **Fix TurnPlanner** + tests
4. **Fix ChapterInitializer** + tests
5. **Fix ContextPruner** (minor - just rename action→goal)
6. **Run type-check**: `npx tsc --noEmit`
7. **Commit all fixes together**

---

## Commit Message Template

```
fix(ai): Architectural corrections to match v3.1 Manifest

Corrects Week 2 modules to align with official v3.1 specification.

Changes:
- BehaviorAnalyzer: Removed personality profiling (UserStyle, patterns)
  * Now returns only: signals, toneHint, confidenceLevel, speedPreference
  * No more explorer/doer/delegator classification

- TurnPlanner: Renamed TurnAction → TurnGoal, using official goals
  * fill_data (was 'patch')
  * anticipate_and_guide (was 'probe')
  * surface_risks (was 'conflict_resolution')
  * offer_alternatives (new)
  * clarify (was 'advies')
  * Moved navigate/reset/feedback to subActions

- ChapterInitializer: Removed tone assignment
  * Tone determined by LLM via PromptBuilder, not ChapterInitializer
  * Removed userExperience parameter from templates
  * Simplified to: message generation only

Breaking Changes:
- BehaviorProfile interface changed
- TurnAction renamed to TurnGoal with different values
- ChapterOpeningResponse no longer has 'tone' field

Rationale: Ensures consistency with Manifest, prevents:
- Hallucinated personality traits
- TurnGoal conflicts with AnswerGuard
- Tone inconsistencies between modules

TypeScript: ✅ All type-checks passing
Tests: ✅ All tests updated and passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Verification Checklist

After fixes:
- [ ] `npx tsc --noEmit` passes
- [ ] All Week 2 tests still pass
- [ ] No `UserStyle` or `RecommendedTone` in codebase
- [ ] No `TurnAction` type (renamed to `TurnGoal`)
- [ ] ChapterOpeningResponse has no `tone` field
- [ ] BehaviorProfile matches new spec exactly
- [ ] All 'patch'/'advies'/'probe' replaced with official goal names

**AFTER THESE FIXES: Week 3 can begin safely.**
