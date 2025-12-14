// lib/ai/AnswerGuard.ts
// Week 3, Day 13 - AnswerGuard 2.0
// Purpose: Multi-layer validation of OrchestratorResult with retry logic
// Architecture: Parse errors → Hard checks → Soft checks → Optional mini-LLM

import type { OrchestratorResult } from '@/types/ai';
import type { TurnPlan } from '@/types/ai';
import {
  validateResponse,
  buildRetryPrompt,
  type ValidationResult,
  type ValidationIssue,
} from './helpers/guardRules';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Final decision of AnswerGuard validation.
 */
export type GuardVerdict = 'APPROVED' | 'RETRY_REQUIRED' | 'HARD_FAIL';

/**
 * Complete result of AnswerGuard validation.
 */
export interface GuardDecision {
  verdict: GuardVerdict;
  issues: ValidationIssue[];
  retryPrompt?: string;
  shouldRetry: boolean;
  reason: string;
}

/**
 * Options for AnswerGuard validation.
 */
export interface AnswerGuardOptions {
  maxRetries?: number;
  enableMiniLLM?: boolean; // Future: gpt-4o-mini fallback for soft checks
}

// ============================================================================
// ANSWER GUARD 2.0 CLASS
// ============================================================================

/**
 * AnswerGuard 2.0: Multi-layer validation with retry logic.
 *
 * VALIDATION LAYERS:
 * 1. Parse Error Detection (result.status === 'parse_error')
 * 2. Hard Checks (rule-based, MUST pass)
 * 3. Soft Checks (rule-based, log and retry once)
 * 4. Mini-LLM Check (future: gpt-4o-mini for soft check failures)
 *
 * RETRY STRATEGY:
 * - Max 2 retries per turn
 * - Hard failures: immediate retry with correction prompt
 * - Soft failures: log and retry once with gentle reminder
 * - Parse errors: immediate retry with parse error details
 */
export class AnswerGuard {
  private readonly maxRetries: number;
  private readonly enableMiniLLM: boolean;
  private attemptCount: number = 0;

  constructor(options: AnswerGuardOptions = {}) {
    this.maxRetries = options.maxRetries ?? 2;
    this.enableMiniLLM = options.enableMiniLLM ?? false;
  }

  /**
   * Main validation method.
   * Runs all validation layers and returns a decision.
   */
  validate(result: OrchestratorResult, turnPlan: TurnPlan): GuardDecision {
    this.attemptCount++;

    // LLM infra hiccups are allowed to pass (handled upstream)
    if (result.status === 'llm_error') {
      return {
        verdict: 'APPROVED',
        issues: [],
        shouldRetry: false,
        reason: 'LLM error bypassed - allow fallback response to proceed',
      };
    }

    // LAYER 1: Parse Error Detection
    if (result.status === 'parse_error') {
      return this.handleParseError(result);
    }

    // LAYER 2+3: Rule-based validation (hard + soft checks)
    const validation = validateResponse(result, turnPlan);

    // Determine verdict based on validation results
    return this.determineVerdict(validation);
  }

  /**
   * Reset attempt counter for new turn.
   */
  resetAttempts(): void {
    this.attemptCount = 0;
  }

  /**
   * Get current attempt count.
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Handle parse error (Layer 1).
   * Always retries if attempts remaining.
   */
  private handleParseError(result: OrchestratorResult): GuardDecision {
    const shouldHardFail =
      this.maxRetries <= 2 ? this.attemptCount >= this.maxRetries : this.attemptCount > this.maxRetries;

    if (shouldHardFail) {
      return {
        verdict: 'HARD_FAIL',
        issues: [
          {
            rule: 'parse_error',
            severity: 'hard',
            description: `JSON parse failed after ${this.maxRetries} attempts: ${result.parseError}`,
          },
        ],
        shouldRetry: false,
        reason: `Max retries (${this.maxRetries}) exceeded for parse errors`,
      };
    }

    return {
      verdict: 'RETRY_REQUIRED',
      issues: [
        {
          rule: 'parse_error',
          severity: 'hard',
          description: `JSON parse failed: ${result.parseError}`,
        },
      ],
      retryPrompt: this.buildParseErrorRetryPrompt(result.parseError || 'Unknown parse error'),
      shouldRetry: true,
      reason: 'Parse error detected - retry with corrected JSON format',
    };
  }

  /**
   * Determine verdict from rule-based validation (Layer 2+3).
   */
  private determineVerdict(validation: ValidationResult): GuardDecision {
    // Case 1: All checks passed
    if (validation.passed) {
      return {
        verdict: 'APPROVED',
        issues: [],
        shouldRetry: false,
        reason: 'All validation checks passed',
      };
    }

    // Case 2: Has issues - check severity and retry availability
    const hardIssues = validation.issues.filter((i) => i.severity === 'hard');
    const softIssues = validation.issues.filter((i) => i.severity === 'soft');

    const canRetry = this.attemptCount < this.maxRetries;

    // Hard issues: MUST retry (if attempts remaining)
    if (hardIssues.length > 0) {
      if (!canRetry) {
        return {
          verdict: 'HARD_FAIL',
          issues: validation.issues,
          shouldRetry: false,
          reason: `Hard validation failures after ${this.maxRetries} attempts`,
        };
      }

      return {
        verdict: 'RETRY_REQUIRED',
        issues: validation.issues,
        retryPrompt: validation.retryPrompt,
        shouldRetry: true,
        reason: `${hardIssues.length} hard check(s) failed - retry required`,
      };
    }

    // Soft issues only: Retry once, then approve with warning
    if (softIssues.length > 0) {
      if (this.attemptCount === 1 && canRetry) {
        // First attempt with soft issues: retry once
        return {
          verdict: 'RETRY_REQUIRED',
          issues: validation.issues,
          retryPrompt: validation.retryPrompt,
          shouldRetry: true,
          reason: `${softIssues.length} soft check(s) failed - retry once`,
        };
      } else {
        // Second attempt or max retries: approve with warning
        console.warn('[AnswerGuard] Soft issues remain after retry, approving with warning:', {
          attemptCount: this.attemptCount,
          issues: softIssues.map((i) => i.rule),
        });

        return {
          verdict: 'APPROVED',
          issues: validation.issues, // Keep issues for logging
          shouldRetry: false,
          reason: 'Soft issues remain but max retries reached - approved with warning',
        };
      }
    }

    // Fallback: approve (should not reach here)
    return {
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'No blocking issues detected',
    };
  }

  /**
   * Build retry prompt for parse errors.
   */
  private buildParseErrorRetryPrompt(parseError: string): string {
    return `PARSE FOUT GEDETECTEERD:

De vorige response kon niet worden geparsed als JSON.

FOUTMELDING:
${parseError}

CORRECTIE VEREIST:
1. Zorg dat de response ALLEEN JSON bevat (geen Markdown, geen tekst buiten JSON)
2. Gebruik dubbele quotes (") voor strings, niet enkele quotes (')
3. Valideer dat alle haakjes/accolades correct zijn gesloten
4. Escape speciale karakters in strings (\\n, \\", etc.)

Probeer opnieuw met correcte JSON formatting.`;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Single-use validation function.
 * Creates a new AnswerGuard instance and validates.
 */
export function validateOrchestratorResult(
  result: OrchestratorResult,
  turnPlan: TurnPlan,
  options?: AnswerGuardOptions
): GuardDecision {
  const guard = new AnswerGuard(options);
  return guard.validate(result, turnPlan);
}

/**
 * Check if a GuardDecision allows the response to proceed.
 */
export function isApproved(decision: GuardDecision): boolean {
  return decision.verdict === 'APPROVED';
}

/**
 * Check if a GuardDecision requires retry.
 */
export function requiresRetry(decision: GuardDecision): boolean {
  return decision.verdict === 'RETRY_REQUIRED' && decision.shouldRetry;
}

/**
 * Check if a GuardDecision is a hard failure (max retries exceeded).
 */
export function isHardFail(decision: GuardDecision): boolean {
  return decision.verdict === 'HARD_FAIL';
}

// ============================================================================
// LEGACY v4.0 EXPORTS (for backward compatibility)
// TODO: Remove these once route.ts is migrated to v3.1 AnswerGuard
// ============================================================================

/** @deprecated Legacy v4.0 type - use GuardDecision instead */
export type AnswerGuardInput = any;

/** @deprecated Legacy v4.0 function - use AnswerGuard class instead */
export async function runAnswerGuard(...args: any[]): Promise<any> {
  console.warn('[AnswerGuard] runAnswerGuard is deprecated - migrate to v3.1 AnswerGuard class');
  return { verdict: 'OK', reasons: [], suggestions: [], confidence: 0.8 };
}

/** @deprecated Legacy v4.0 function - not used in v3.1 */
export function buildClarificationPrompt(...args: any[]): string {
  console.warn('[AnswerGuard] buildClarificationPrompt is deprecated');
  return '';
}

/** @deprecated Legacy v4.0 function - not used in v3.1 */
export function buildRelevancePrompt(...args: any[]): string {
  console.warn('[AnswerGuard] buildRelevancePrompt is deprecated');
  return '';
}
