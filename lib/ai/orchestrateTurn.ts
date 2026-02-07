// lib/ai/orchestrateTurn.ts
// Week 3, Day 15 - orchestrateTurn
// Purpose: Main coordinator that orchestrates all AI intelligence modules
// Architecture: 5-phase pipeline from memory → intelligence → planning → execution → fallback

import type { WizardState, ChapterKey } from '@/types/project';
import type {
  TurnPlan,
  BehaviorProfile,
  AnticipationGuidance,
  SystemConflict,
  ConversationMemoryResult,
  PrunedContext,
} from '@/types/ai';

// Module imports
import { ConversationMemory } from './ConversationMemory';
import { FieldWatcher } from './FieldWatcher';
import { FeedbackQueue } from './FeedbackQueue';
import { BehaviorAnalyzer } from './BehaviorAnalyzer';
import { AnticipationEngine } from './AnticipationEngine';
import { SystemIntelligence } from './SystemIntelligence';
import { TurnPlanner } from './TurnPlanner';
import { ContextPruner } from './ContextPruner';
import { FallbackStrategy, type FinalTurnResult } from './FallbackStrategy';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input options for orchestrateTurn.
 */
export interface OrchestrateTurnInput {
  query: string;
 wizardState: WizardState;
 userId: string;
 projectId: string;
  currentChapter?: ChapterKey;
  mode?: 'PREVIEW' | 'PREMIUM';
  interactionMode?: 'user' | 'auto';
  triggerType?:
    | 'chapter_start'
    | 'chapter_completed'
    | 'budget_change'
    | 'room_added'
    | 'risk_increased'
    | 'wizard_idle';
  triggerId?: string;
  skipAnticipation?: boolean;
  skipConflictDetection?: boolean;
}

/**
 * Complete result of turn orchestration.
 */
export interface TurnResult {
  response: string;
  patches: any[];
  metadata: {
    intent: string;
    turnPlan: TurnPlan;
    tokensUsed: number;
    attempts: number;
    usedFallback: boolean;
    intelligenceTrace: {
      behavior?: BehaviorProfile;
      anticipation: AnticipationGuidance[];
      conflicts: SystemConflict[];
      contextPruned: boolean;
      guardVerdict: string;
    };
  };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

/**
 * Main turn orchestrator.
 * Coordinates all AI intelligence modules in the correct order.
 *
 * PIPELINE (5 Phases):
 * 1. Memory & Context: Load history, detect field focus, check feedback queue
 * 2. Intelligence (Parallel): Behavior analysis, anticipation, conflict detection
 * 3. Planning: Decide turn goal and route
 * 4. Execution: Prune context, generate response, validate with guard
 * 5. Fallback: Retry loop with corrections if needed
 *
 * CRITICAL RULES:
 * - allowPatches=false MUST result in patches=[]
 * - Indirect patching MUST be preserved (requiresConfirmation)
 * - Formal Dutch (u/uw), no emojis
 * - Max 2 retries per turn
 */
export async function orchestrateTurn(input: OrchestrateTurnInput): Promise<TurnResult> {
  const {
    query,
    wizardState,
    userId,
    projectId,
    currentChapter,
    mode = 'PREMIUM',
    skipAnticipation = false,
    skipConflictDetection = false,
  } = input;

  console.log('[orchestrateTurn] Starting turn orchestration', {
    query: query.substring(0, 50),
    userId,
    currentChapter,
    mode,
    interactionMode: input.interactionMode ?? 'user',
    triggerType: input.triggerType,
  });

  // ==========================================================================
  // PHASE 1: MEMORY & CONTEXT
  // ==========================================================================

  const conversationMemory = new ConversationMemory(userId, projectId);
  const fieldWatcher = new FieldWatcher();
  const feedbackQueue = new FeedbackQueue();

  // Load conversation history
  const memory: ConversationMemoryResult = await conversationMemory.load(10);

  // Detect field focus from recent conversation
  const fieldFocus = fieldWatcher.detectFocus(wizardState, memory.recent);

  // Check for pending feedback
  const feedbackResult = feedbackQueue.checkQueue(wizardState);

  console.log('[orchestrateTurn] Phase 1 complete: Memory & Context', {
    turnCount: memory.turnCount,
    fieldFocus: fieldFocus.focusedField,
    hasPendingFeedback: feedbackResult.hasPending,
  });

  // ==========================================================================
  // PHASE 2: INTELLIGENCE (Parallel Execution)
  // ==========================================================================

  // Run intelligence modules in parallel for performance
  const [behaviorResult, anticipationResult, conflictResult] = await Promise.allSettled([
    // Behavior analysis
    new BehaviorAnalyzer().analyze(memory.recent),

    // Anticipation (skip if disabled or on explicit queries)
    skipAnticipation
      ? Promise.resolve({ shouldInterrupt: false, guidances: [], criticalMissing: [] })
      : new AnticipationEngine().run(wizardState, {
          currentChapter,
          turnCount: memory.turnCount,
        }),

    // Conflict detection (skip if disabled)
    skipConflictDetection
      ? Promise.resolve({ conflicts: [], shouldBlock: false } as { conflicts: SystemConflict[]; shouldBlock: boolean })
      : new SystemIntelligence().detectConflicts(wizardState),
  ]);

  // Extract results (use defaults if any failed)
  const behaviorProfile: BehaviorProfile | undefined =
    behaviorResult.status === 'fulfilled' ? ((behaviorResult.value as unknown) as BehaviorProfile) : undefined;

  const anticipation =
    anticipationResult.status === 'fulfilled'
      ? anticipationResult.value
      : { shouldInterrupt: false, guidances: [], criticalMissing: [] };

  const conflictObj: { conflicts: SystemConflict[]; shouldBlock: boolean } = (() => {
    if (conflictResult.status !== 'fulfilled') {
      return { conflicts: [], shouldBlock: false };
    }
    const val = conflictResult.value as any;
    if (Array.isArray(val)) {
      return { conflicts: val, shouldBlock: !!(val as any).shouldBlock };
    }
    if (val && Array.isArray(val.conflicts)) {
      return { conflicts: val.conflicts, shouldBlock: !!val.shouldBlock };
    }
    return { conflicts: [], shouldBlock: false };
  })();

  console.log('[orchestrateTurn] Phase 2 complete: Intelligence', {
    behaviorProfile: behaviorProfile
      ? `${behaviorProfile.toneHint}/${behaviorProfile.speedPreference}`
      : 'none',
    anticipationCount: anticipation.guidances.length,
    conflictCount: conflictObj.conflicts.length,
  });

  // ==========================================================================
  // PHASE 3: PLANNING
  // ==========================================================================

  const turnPlanner = new TurnPlanner();

  // Decide turn plan based on all intelligence inputs
  const turnPlan: TurnPlan = turnPlanner.decide({
    query,
    wizardState,
    memory,
    behaviorProfile: behaviorProfile as BehaviorProfile,
    anticipation,
    conflicts: conflictObj,
    feedbackQueue: feedbackResult,
    fieldFocus,
    // Backwards compatible mapping for planner input
    userMessage: query,
    systemConflicts: conflictObj.conflicts,
    anticipationGuidance: anticipation.guidances[0],
  } as any);

  console.log('[orchestrateTurn] Phase 3 complete: Planning', {
    goal: turnPlan.goal,
    priority: turnPlan.priority,
    route: turnPlan.route,
    allowPatches: turnPlan.allowPatches,
  });

  // ==========================================================================
  // PHASE 4: CONTEXT PRUNING
  // ==========================================================================

  const contextPruner = new ContextPruner();

  const prunedContext: PrunedContext = contextPruner.prune({
    wizardState,
    turnPlan,
    behaviorProfile: behaviorProfile as BehaviorProfile,
    conversationHistory: memory.recent,
    focusedField: fieldFocus.focusedField,
    focusedChapter: currentChapter || null,
    systemConflicts: conflictObj.conflicts,
    anticipationGuidance: anticipation.guidances,
    maxTokens: mode === 'PREVIEW' ? 4000 : 8000,
  });

  console.log('[orchestrateTurn] Phase 4 complete: Context Pruning', {
    tokenEstimate: prunedContext.tokenEstimate,
    prunedChapters: Object.keys(prunedContext.prunedChapterAnswers).length,
    focusedField: prunedContext.focusedField,
  });

  // ==========================================================================
  // PHASE 5: EXECUTION WITH GUARD & FALLBACK
  // ==========================================================================

  const fallbackStrategy = new FallbackStrategy(2);

  // Run response generation with guard validation and retry loop
  const finalResult: FinalTurnResult = await fallbackStrategy.runWithGuardAndRetry({
    query,
    turnPlan,
    prunedContext,
    behaviorProfile,
    maxRetries: 2,
  });

  // Enforce allowPatches guardrail: if disallowed, drop patches entirely
  const rawPatches = turnPlan.allowPatches === false ? [] : (finalResult.patches || []);

  const patchesWithConfirmation =
    input.interactionMode === 'auto'
      ? applyAutoTurnPatchGate(rawPatches)
      : rawPatches.map((p: any) =>
          p && p.requiresConfirmation === undefined
            ? { ...p, requiresConfirmation: true }
            : p
        );

  console.log('[orchestrateTurn] Phase 5 complete: Execution & Guard', {
    attempts: finalResult.metadata.attempts,
    guardVerdict: finalResult.metadata.guardVerdict,
    usedFallback: finalResult.metadata.usedFallback,
    patchCount: patchesWithConfirmation.length,
  });

  // ==========================================================================
  // PHASE 6: PERSIST TURN & RETURN
  // ==========================================================================

  // Persist conversation turn to memory
  await conversationMemory.addTurn({
    userId,
    projectId,
    role: 'user',
    message: query,
    wizardStateSnapshot: wizardState,
    source: 'user',
    timestamp: Date.now(),
  });

  await conversationMemory.addTurn({
    userId,
    projectId,
    role: 'assistant',
    message: finalResult.response,
    wizardStateSnapshot: wizardState,
    triggersHandled: anticipation.guidances.map((g) => g.id),
    patchesApplied: patchesWithConfirmation,
    source: 'ai',
    timestamp: Date.now(),
  });

  console.log('[orchestrateTurn] Turn complete - persisted to memory');

  // ==========================================================================
  // FINAL RESULT
  // ==========================================================================

  return {
    response: finalResult.response,
    patches: patchesWithConfirmation,
    metadata: {
      intent: turnPlan.goal, // Use turn goal as intent
      turnPlan,
      tokensUsed: finalResult.tokensUsed,
      attempts: finalResult.metadata.attempts,
      usedFallback: finalResult.metadata.usedFallback,
      intelligenceTrace: {
        behavior: behaviorProfile,
        anticipation: anticipation.guidances,
        conflicts: conflictObj.conflicts,
        contextPruned: prunedContext.pruneLog.length > 0,
        guardVerdict: finalResult.metadata.guardVerdict,
      },
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick orchestration for testing or simple use cases.
 * Uses default options.
 */
export async function orchestrateTurnSimple(
  query: string,
  wizardState: WizardState,
  userId: string,
  projectId: string
): Promise<TurnResult> {
  return orchestrateTurn({
    query,
    wizardState,
    userId,
    projectId,
    mode: 'PREMIUM',
  });
}

/**
 * Check if turn result has patches that need confirmation.
 */
export function hasPendingPatches(result: TurnResult): boolean {
  return result.patches.length > 0 && result.patches.some((p) => p.requiresConfirmation === true);
}

/**
 * Check if turn result used fallback (low confidence).
 */
export function usedFallback(result: TurnResult): boolean {
  return result.metadata.usedFallback;
}

/**
 * Extract guard issues from result metadata.
 */
export function getGuardIssues(result: TurnResult): string[] {
  // Guard issues are tracked in FinalTurnResult metadata
  // This is a placeholder for potential future implementation
  return [];
}

// ============================================================================
// AUTO-TURN PATCH GUARDRAILS
// ============================================================================

const AUTO_TURN_MAX_PATCHES = 3;

function isAutoTurnSafeAutoApply(patch: any): boolean {
  if (!patch?.delta) return false;
  const { chapter } = patch;
  const { operation, path } = patch.delta;

  if (operation === 'append' && chapter === 'risico' && path === 'risks') return true;
  if (operation === 'set' && chapter === 'risico' && path === 'overallRisk') return true;
  return false;
}

function applyAutoTurnPatchGate(patches: any[]): any[] {
  if (!Array.isArray(patches) || patches.length === 0) return [];

  const filtered = patches.filter((p) => p?.delta?.operation !== 'remove').slice(0, AUTO_TURN_MAX_PATCHES);

  return filtered.map((p) => {
    const autoApply = isAutoTurnSafeAutoApply(p);
    return { ...p, requiresConfirmation: !autoApply };
  });
}
