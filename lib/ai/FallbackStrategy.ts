// lib/ai/FallbackStrategy.ts
// Week 3, Day 14 - FallbackStrategy
// Purpose: Retry logic that bridges ResponseOrchestrator and AnswerGuard
// Architecture: Orchestrates retry loop with max 2 retries per turn

import type { OrchestratorResult, TurnPlan, BehaviorProfile } from '@/types/ai';
import type { PrunedContext } from '@/types/ai';
import { ResponseOrchestrator } from './ResponseOrchestrator';
import { AnswerGuard, type GuardDecision } from './AnswerGuard';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Final result after guard validation and retry loop.
 */
export interface FinalTurnResult {
  response: string;
  patches: any[];
  confidence: number;
  tokensUsed: number;
  metadata: {
    attempts: number;
    guardVerdict: 'APPROVED' | 'RETRY_REQUIRED' | 'HARD_FAIL';
    usedFallback: boolean;
    guardIssues: string[];
  };
}

/**
 * Options for retry with guard validation.
 */
export interface GuardRetryOptions {
  query: string;
  turnPlan: TurnPlan;
  prunedContext: PrunedContext;
  behaviorProfile?: BehaviorProfile;
  maxRetries?: number;
}

// ============================================================================
// FALLBACK STRATEGY CLASS
// ============================================================================

/**
 * FallbackStrategy: Retry loop with AnswerGuard validation.
 *
 * FLOW:
 * 1. Call ResponseOrchestrator.generate()
 * 2. Validate with AnswerGuard
 * 3. If RETRY_REQUIRED: append retryPrompt and retry (max 2 retries)
 * 4. If HARD_FAIL or max retries: use fallback response
 * 5. If APPROVED: return result
 *
 * RETRY RULES:
 * - Max 2 retries per turn (attempts: 0, 1, 2)
 * - After attempt 2, always use fallback
 * - Retry prompt is appended to original query
 */
export class FallbackStrategy {
  private readonly maxRetries: number;
  private readonly orchestrator: ResponseOrchestrator;
  private readonly guard: AnswerGuard;

  constructor(maxRetries: number = 2) {
    this.maxRetries = maxRetries;
    this.orchestrator = new ResponseOrchestrator();
    this.guard = new AnswerGuard({ maxRetries });
  }

  /**
   * Main retry loop with guard validation.
   * Returns final result after validation and retries.
   */
  async runWithGuardAndRetry(options: GuardRetryOptions): Promise<FinalTurnResult> {
    const { query, turnPlan, prunedContext, behaviorProfile } = options;

    let currentQuery = query;
    let attempt = 0;
    let lastResult: OrchestratorResult | null = null;
    let lastDecision: GuardDecision | null = null;

    // Reset guard attempts for new turn
    this.guard.resetAttempts();

    // Retry loop (max 2 retries = 3 total attempts)
    while (attempt <= this.maxRetries) {
      // Attempt to generate response
      const result = await this.orchestrator.generate({
        query: currentQuery,
        turnPlan,
        prunedContext,
        behaviorProfile,
      });

      lastResult = result;

      // Validate with AnswerGuard
      const decision = this.guard.validate(result, turnPlan);
      lastDecision = decision;

      console.log(`[FallbackStrategy] Attempt ${attempt}: verdict=${decision.verdict}, issues=${decision.issues.length}`);

      // APPROVED: Success!
      if (decision.verdict === 'APPROVED') {
        return {
          response: result.draftResponse,
          patches: result.patches,
          confidence: result.confidence,
          tokensUsed: result.tokensUsed,
          metadata: {
            attempts: attempt + 1,
            guardVerdict: 'APPROVED',
            usedFallback: false,
            guardIssues: decision.issues.map((i) => i.rule),
          },
        };
      }

      // HARD_FAIL or max retries reached: Use fallback
      if (decision.verdict === 'HARD_FAIL' || attempt >= this.maxRetries) {
        console.warn(`[FallbackStrategy] ${decision.verdict === 'HARD_FAIL' ? 'Hard fail' : 'Max retries'} - using fallback`);

        const fallbackResponse = this.buildFallbackResponse(
          decision.reason,
          turnPlan,
          prunedContext
        );

        return {
          response: fallbackResponse.reply,
          patches: [], // No patches on fallback
          confidence: 0.5, // Low confidence for fallback
          tokensUsed: result.tokensUsed,
          metadata: {
            attempts: attempt + 1,
            guardVerdict: decision.verdict,
            usedFallback: true,
            guardIssues: decision.issues.map((i) => i.rule),
          },
        };
      }

      // RETRY_REQUIRED: Append retry prompt and try again
      if (decision.verdict === 'RETRY_REQUIRED' && decision.retryPrompt) {
        console.log(`[FallbackStrategy] Retrying with correction prompt`);
        currentQuery = this.buildRetryQuery(query, decision.retryPrompt);
        attempt++;
        continue;
      }

      // Fallback if no retry prompt (shouldn't happen)
      console.error('[FallbackStrategy] RETRY_REQUIRED but no retryPrompt - using fallback');
      const fallbackResponse = this.buildFallbackResponse(
        'No retry prompt available',
        turnPlan,
        prunedContext
      );

      return {
        response: fallbackResponse.reply,
        patches: [],
        confidence: 0.5,
        tokensUsed: result.tokensUsed,
        metadata: {
          attempts: attempt + 1,
          guardVerdict: 'RETRY_REQUIRED',
          usedFallback: true,
          guardIssues: decision.issues.map((i) => i.rule),
        },
      };
    }

    // Should never reach here, but fallback just in case
    console.error('[FallbackStrategy] Unexpected exit from retry loop');
    const fallbackResponse = this.buildFallbackResponse(
      'Unexpected retry loop exit',
      turnPlan,
      prunedContext
    );

    return {
      response: fallbackResponse.reply,
      patches: [],
      confidence: 0.5,
      tokensUsed: lastResult?.tokensUsed || 0,
      metadata: {
        attempts: attempt + 1,
        guardVerdict: lastDecision?.verdict || 'HARD_FAIL',
        usedFallback: true,
        guardIssues: lastDecision?.issues.map((i) => i.rule) || [],
      },
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Build retry query by appending correction prompt.
   */
  private buildRetryQuery(originalQuery: string, retryPrompt: string): string {
    return `${originalQuery}\n\n[SYSTEM CORRECTIE]:\n${retryPrompt}`;
  }

  /**
   * Build fallback response when retries exhausted or hard fail.
   * Returns safe, formal Dutch response based on turn goal.
   */
  buildFallbackResponse(
    reason: string,
    turnPlan: TurnPlan,
    prunedContext: PrunedContext
  ): { reply: string; patches: any[] } {
    console.warn(`[FallbackStrategy] Building fallback: ${reason}`);

    // Build contextual fallback based on turn goal
    let reply: string;

    switch (turnPlan.goal) {
      case 'fill_data':
        reply = 'Ik heb uw input genoteerd. Kunt u wat meer details geven zodat ik dit correct kan verwerken?';
        break;

      case 'anticipate_and_guide':
        reply = 'Laten we dit stap voor stap aanpakken. Kunt u beginnen met het invullen van de basisgegevens?';
        break;

      case 'surface_risks':
        if (turnPlan.systemConflicts && turnPlan.systemConflicts.length > 0) {
          const conflict = turnPlan.systemConflicts[0];
          reply = `Ik zie een mogelijke inconsistentie: ${conflict.description}. ${conflict.resolution}`;
        } else {
          reply = 'Er zijn mogelijk enkele aandachtspunten in uw project. Laten we deze samen doornemen.';
        }
        break;

      case 'offer_alternatives':
        reply = 'Er zijn verschillende opties mogelijk. Kunt u aangeven wat voor u het belangrijkst is, dan kan ik u gerichter adviseren?';
        break;

      case 'clarify':
        reply = 'Kunt u uw vraag wat specifieker formuleren? Dan kan ik u beter helpen.';
        break;

      default:
        reply = 'Ik kan u daarmee helpen. Vertel me wat meer over uw situatie.';
    }

    return {
      reply,
      patches: [], // Fallback never includes patches
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Single-use function to run retry loop with guard validation.
 * Creates new FallbackStrategy instance.
 */
export async function runWithGuardAndRetry(
  options: GuardRetryOptions
): Promise<FinalTurnResult> {
  const strategy = new FallbackStrategy(options.maxRetries);
  return strategy.runWithGuardAndRetry(options);
}

/**
 * Build fallback response for a given turn plan.
 * Utility function for testing or direct use.
 */
export function buildFallbackResponse(
  reason: string,
  turnPlan: TurnPlan,
  prunedContext: PrunedContext
): { reply: string; patches: any[] } {
  const strategy = new FallbackStrategy();
  return strategy.buildFallbackResponse(reason, turnPlan, prunedContext);
}
