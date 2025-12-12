// types/ai.ts
// ============================================================================
// ARCHITECT INTELLIGENCE LAYER v3.1 - TYPE DEFINITIONS
// ============================================================================
// Purpose: Types for the AI orchestration layer that coordinates intelligent
//          conversation, anticipation, behavior analysis, and turn planning.
//
// Architecture: Builds on v3.0/v4.0 foundation, adds new intelligence modules
// ============================================================================

// ============================================================================
// IMPORTS FROM EXISTING v3.0/v4.0 TYPES
// ============================================================================

import type {
  // State & Structure
  WizardState,
  ChapterKey,
  ChapterDataMap,

  // Chapter Data Types
  BasisData,
  RuimtesData,
  WensenData,
  BudgetData,
  TechniekData,
  DuurzaamData,
  RisicoData,

  // Entities
  Room,
  Wish,
  Risk,
  WishPriority,

  // Metadata & Profiles
  LifestyleProfile,
  DocumentStatus,
  ProjectScope,
} from './project';

// ============================================================================
// CONVERSATION MEMORY (Week 1, Day 2)
// ============================================================================

/**
 * A single turn in the conversation history.
 * Stored in Supabase for persistence and semantic search.
 */
export interface ConversationTurn {
  id: string;
  userId: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: number;
  source: 'user' | 'ai' | 'system';

  // Optional metadata
  wizardStateSnapshot?: Record<string, any>;
  triggersHandled?: string[];
  patchesApplied?: any[];
}

/**
 * Result of loading conversation memory.
 * Contains recent turns, optional summary of older history, and metadata.
 */
export interface ConversationMemoryResult {
  recent: ConversationTurn[];
  summary: string | null;
  turnCount: number;
  hasLongHistory: boolean;
}

// ============================================================================
// FIELD WATCHER (Week 1, Day 3)
// ============================================================================

/**
 * A field change trigger detected by FieldWatcher.
 * CRITICAL: Only triggers when source === "user" to prevent infinite loops.
 */
export interface FieldTrigger {
  fieldPath: string;           // e.g. "budget.budgetTotaal"
  chapter: ChapterKey;
  previousValue: any;
  newValue: any;
  confidence: number;          // 0.0 - 1.0
  source: 'user' | 'ai' | 'system';
  timestamp: number;
}

/**
 * Feedback queue item for debouncing field triggers.
 * Prevents rapid-fire AI responses for quick field changes.
 */
export interface FeedbackQueueItem {
  id: string;
  trigger: FieldTrigger;
  debounceUntil: number;       // Unix timestamp
  processed: boolean;
}

// ============================================================================
// ANTICIPATION ENGINE (Week 1, Day 4)
// ============================================================================

/**
 * An intelligent proactive question/guidance from the AI.
 * Generated based on project type, current state, and lifestyle profile.
 */
export interface AnticipationGuidance {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  chapter: ChapterKey;
  question: string;            // The actual question to ask user
  reasoning: string;           // Why we're asking (internal)
  relatedFields: string[];     // Fields this guidance relates to
  lifestyleRelevance?: keyof LifestyleProfile;
}

/**
 * A hardcoded anticipation rule.
 * Rules are triggered based on projectType and wizard state conditions.
 */
export interface AnticipationRule {
  id: string;
  projectTypes: ProjectScope[];
  condition: (state: WizardState) => boolean;
  guidance: Omit<AnticipationGuidance, 'id'>;
}

// ============================================================================
// SYSTEM INTELLIGENCE (Week 1, Day 5)
// ============================================================================

/**
 * Severity levels for system conflicts.
 * BLOCKING = prevents normal flow, must be resolved first
 * WARNING = user should be informed but can continue
 * INFO = FYI only
 */
export type SystemConflictSeverity = 'blocking' | 'warning' | 'info';

/**
 * A detected conflict or inconsistency in the wizard state.
 * Examples: budget too low for must-haves, physical impossibilities, etc.
 */
export interface SystemConflict {
  id: string;
  type: 'budget_risk' | 'must_have_unsatisfied' | 'physical_constraint' | 'ambition_mismatch';
  severity: SystemConflictSeverity;
  description: string;         // User-facing description
  affectedFields: string[];    // Field paths involved
  affectedChapters: ChapterKey[];
  resolution: string;          // Suggested resolution
  estimatedCost?: number;      // For budget conflicts
}

// ============================================================================
// BEHAVIOR ANALYZER (Week 2, Day 6-7)
// ============================================================================

/**
 * Emotional/engagement signals from user messages.
 * These are the ONLY behavioral signals we track (per v3.1 Manifest).
 */
export interface BehaviorSignals {
  overwhelmed: boolean;             // Short answers, confusion
  confused: boolean;                // Repeated clarification requests
  impatient: boolean;               // Wants to move faster
  engaged: boolean;                 // Long messages, follow-ups
}

/**
 * Complete behavior analysis result (v3.1 Manifest compliant).
 * No personality profiling - only signals and preferences.
 */
export interface BehaviorProfile {
  signals: BehaviorSignals;
  toneHint: 'warm' | 'neutral' | 'direct';
  confidenceLevel: 'low' | 'medium' | 'high';
  speedPreference: 'thorough' | 'balanced' | 'quick';
  turnCount: number;
}

// ============================================================================
// TURN PLANNER (Week 2, Day 8)
// ============================================================================

/**
 * The goal for this conversation turn (v3.1 Manifest official goals).
 * These are the ONLY allowed goals - no custom actions.
 */
export type TurnGoal =
  | 'fill_data'              // Collect wizard data (was 'patch')
  | 'anticipate_and_guide'   // Proactive guidance (was 'probe')
  | 'surface_risks'          // Show conflicts (was 'conflict_resolution')
  | 'offer_alternatives'     // Present options
  | 'clarify';               // Ask clarifying question (was 'advies')

/**
 * Priority level for this turn.
 * Determines which goal wins if multiple are possible.
 */
export type TurnPriority =
  | 'user_query'           // Normal user query (default)
  | 'system_conflict'      // Critical conflict (highest priority)
  | 'anticipation'         // Proactive guidance
  | 'feedback';            // Queued feedback

/**
 * Routing strategy for LLM call.
 */
export type TurnRoute =
  | 'normal'               // Standard LLM call
  | 'guard_required'       // Requires AnswerGuard validation
  | 'skip_llm';           // No LLM needed (e.g., navigation)

/**
 * The complete plan for this conversation turn.
 * Decided by TurnPlanner based on all intelligence inputs.
 */
export interface TurnPlan {
  goal: TurnGoal;                         // RENAMED from 'action'
  priority: TurnPriority;
  route: TurnRoute;
  reasoning: string;                      // Why this plan was chosen
  allowPatches: boolean;                  // Whether patches are allowed (for AnswerGuard)
  subActions?: string[];                  // NEW - for 'navigate', 'reset', etc.
  systemConflicts?: SystemConflict[];
  anticipationGuidance?: AnticipationGuidance;
}

// ============================================================================
// CONTEXT PRUNER (Week 2, Day 9)
// ============================================================================

/**
 * Pruned context for LLM call.
 * Keeps only relevant data to stay within token budget.
 */
export interface PrunedContext {
  prunedChapterAnswers: Partial<ChapterDataMap>;
  prunedHistory: ConversationTurn[];
  tokenEstimate: number;
  pruneLog: string[];                     // What was removed
  focusedChapter: ChapterKey | null;
  focusedField: string | null;
}

// ============================================================================
// CHAPTER INITIALIZER (Week 2, Day 10)
// ============================================================================

/**
 * Response when opening a new chapter.
 * Provides contextual greeting and sets turn goals.
 * NOTE: Tone is determined by LLM via PromptBuilder, NOT here.
 */
export interface ChapterOpeningResponse {
  message: string;
  turnGoal: TurnGoal;              // UPDATED to use TurnGoal
  allowPatches: boolean;
  focusChapter: ChapterKey;
  // NO tone field - LLM determines tone
}

// ============================================================================
// RESPONSE ORCHESTRATOR (Week 3, Day 11-12)
// ============================================================================

/**
 * Result of orchestrating an LLM response.
 * Contains draft text, patches, and metadata.
 */
export interface OrchestratorResult {
  status: 'success' | 'parse_error' | 'llm_error';  // Explicit status for AnswerGuard
  draftResponse: string;
  patches: any[];                         // Will be PatchEvent[] from project.ts
  confidence: number;
  tokensUsed: number;
  action?: 'reset' | 'undo';             // Special actions
  parseError?: string;                    // Details when status='parse_error'
}

// ============================================================================
// FALLBACK STRATEGY (Week 3, Day 14)
// ============================================================================

/**
 * Type of retry attempted after AnswerGuard rejection.
 */
export type FallbackRetryType = 'clarification' | 'relevance' | 'none';

/**
 * Result of fallback/retry strategy.
 */
export interface FallbackResult {
  finalResponse: string;
  shouldGiveUp: boolean;                 // Max retries reached
  fallbackMessage: string | null;        // Fallback if gave up
  retriedWith: FallbackRetryType;
  attemptCount: number;
}

// ============================================================================
// ORCHESTRATION (Week 3, Day 15 - Integration)
// ============================================================================

/**
 * Complete result of orchestrateTurn().
 * This is the final output after all intelligence layers.
 */
export interface TurnResult {
  response: string;
  patches: any[];                        // PatchEvent[]
  metadata: {
    intent: string;                      // ProIntent from ProModel
    turnPlan: TurnPlan;
    tokensUsed: number;
    intelligenceTrace?: {
      behavior: BehaviorProfile;
      anticipation: AnticipationGuidance[];
      conflicts: SystemConflict[];
      contextPruned: boolean;
      guardVerdict?: string;
    };
  };
}

/**
 * Options for orchestrateTurn() call.
 */
export interface OrchestrateTurnOptions {
  mode: 'PREVIEW' | 'PREMIUM';
  clientFastIntent?: string;             // ProIntent hint from client
  skipAnticipation?: boolean;
  skipConflictDetection?: boolean;
}
