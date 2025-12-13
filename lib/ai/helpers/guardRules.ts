// lib/ai/helpers/guardRules.ts
// Week 3, Day 13 - AnswerGuard 2.0 Rule-based Validation
// Purpose: Deterministic validation rules for LLM responses

import type { OrchestratorResult } from '@/types/ai';
import type { TurnPlan, TurnGoal } from '@/types/ai';
import type { PatchEvent, ChapterKey } from '@/types/project';

/**
 * Validation issue severity levels.
 */
export type IssueSeverity = 'hard' | 'soft';

/**
 * Validation issue detected by guard rules.
 */
export interface ValidationIssue {
  rule: string;
  severity: IssueSeverity;
  description: string;
  field?: string;
}

/**
 * Result of rule-based validation.
 */
export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
  requiresRetry: boolean;
  retryPrompt?: string;
}

// ============================================================================
// WHITELIST CONSTANTS
// ============================================================================

const VALID_CHAPTERS: ChapterKey[] = [
  'basis',
  'ruimtes',
  'wensen',
  'budget',
  'techniek',
  'duurzaam',
  'risico',
];

const VALID_OPERATIONS = ['set', 'append', 'remove'];

const VALID_PATCH_PATHS: Record<ChapterKey, string[]> = {
  basis: ['projectType', 'locatie', 'projectScope'],
  ruimtes: ['rooms'],
  wensen: ['wishes'],
  budget: ['budgetTotaal', 'budgetReserve'],
  techniek: ['heatingType', 'ventilationType', 'insulationType'],
  duurzaam: ['solarPanels', 'heatPump', 'greenRoof'],
  risico: ['risks'],
};

// ============================================================================
// HARD CHECKS (MUST pass, retry with correction)
// ============================================================================

/**
 * Check 1: allowPatches enforcement.
 * If turnPlan.allowPatches=false, patches array MUST be empty.
 */
export function checkAllowPatches(
  result: OrchestratorResult,
  turnPlan: TurnPlan
): ValidationIssue | null {
  if (turnPlan.allowPatches === false && result.patches.length > 0) {
    return {
      rule: 'allowPatches_enforcement',
      severity: 'hard',
      description: `TurnPlan disallows patches but ${result.patches.length} patches were returned`,
    };
  }
  return null;
}

/**
 * Check 2: requiresConfirmation flags.
 * All patches MUST have requiresConfirmation=true unless confidence>0.95.
 */
export function checkRequiresConfirmation(
  result: OrchestratorResult
): ValidationIssue | null {
  const invalidPatches = result.patches.filter(
    (patch: PatchEvent) =>
      result.confidence <= 0.95 && patch.requiresConfirmation !== true
  );

  if (invalidPatches.length > 0) {
    return {
      rule: 'indirect_patching',
      severity: 'hard',
      description: `${invalidPatches.length} patches missing requiresConfirmation flag (confidence=${result.confidence})`,
    };
  }
  return null;
}

/**
 * Check 3: Patch whitelist validation.
 * Chapters, operations, and paths must be in whitelist.
 */
export function checkPatchWhitelist(
  result: OrchestratorResult
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  result.patches.forEach((patch: PatchEvent, index: number) => {
    // Check chapter
    if (!VALID_CHAPTERS.includes(patch.chapter)) {
      issues.push({
        rule: 'patch_whitelist',
        severity: 'hard',
        description: `Patch ${index}: invalid chapter '${patch.chapter}'`,
        field: `patches[${index}].chapter`,
      });
    }

    // Check operation
    if (!VALID_OPERATIONS.includes(patch.delta.operation)) {
      issues.push({
        rule: 'patch_whitelist',
        severity: 'hard',
        description: `Patch ${index}: invalid operation '${patch.delta.operation}'`,
        field: `patches[${index}].operation`,
      });
    }

    // Check path (if chapter is valid)
    if (VALID_CHAPTERS.includes(patch.chapter)) {
      const validPaths = VALID_PATCH_PATHS[patch.chapter];
      if (!validPaths.includes(patch.delta.path)) {
        issues.push({
          rule: 'patch_whitelist',
          severity: 'hard',
          description: `Patch ${index}: invalid path '${patch.delta.path}' for chapter '${patch.chapter}'`,
          field: `patches[${index}].path`,
        });
      }
    }
  });

  return issues;
}

// ============================================================================
// SOFT CHECKS (log and retry once)
// ============================================================================

/**
 * Check 4: Important triggers coverage.
 * If turnPlan has importantTriggers, reply should mention them.
 */
export function checkImportantTriggers(
  result: OrchestratorResult,
  turnPlan: TurnPlan
): ValidationIssue | null {
  // Extract important trigger from anticipationGuidance
  if (!turnPlan.anticipationGuidance) {
    return null; // No triggers to check
  }

  const triggerQuestion = turnPlan.anticipationGuidance.question.toLowerCase();
  const reply = result.draftResponse.toLowerCase();

  // Check if reply addresses the trigger (simple keyword match)
  const keywords = extractKeywords(triggerQuestion);
  const hasCoverage = keywords.some((keyword) => reply.includes(keyword));

  if (!hasCoverage) {
    return {
      rule: 'trigger_coverage',
      severity: 'soft',
      description: `Reply does not address important trigger: "${turnPlan.anticipationGuidance.question}"`,
    };
  }

  return null;
}

/**
 * Check 5: Next-step requirement per goal.
 * For clarify/anticipate_and_guide: reply MUST contain a question or suggestion.
 */
export function checkNextStep(
  result: OrchestratorResult,
  turnPlan: TurnPlan
): ValidationIssue | null {
  const goalsRequiringNextStep: TurnGoal[] = ['clarify', 'anticipate_and_guide'];

  if (!goalsRequiringNextStep.includes(turnPlan.goal)) {
    return null; // Not applicable
  }

  const reply = result.draftResponse;
  const hasQuestion = /\?/.test(reply); // Contains question mark
  const hasSuggestion = /(kunt u|wilt u|heeft u|laten we|zou u)/i.test(reply);

  if (!hasQuestion && !hasSuggestion) {
    return {
      rule: 'next_step_requirement',
      severity: 'soft',
      description: `Goal '${turnPlan.goal}' requires question or suggestion, but none found in reply`,
    };
  }

  return null;
}

/**
 * Check 6: Verboden taal (je/jij/emoji).
 * Reply must be formal Dutch (u/uw) and no emojis.
 */
export function checkForbiddenLanguage(
  result: OrchestratorResult
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const reply = result.draftResponse;

  // Check for informal language (je/jij/jouw)
  const informalMatches = reply.match(/\b(je|jij|jouw|jouwe)\b/gi);
  if (informalMatches && informalMatches.length > 0) {
    issues.push({
      rule: 'forbidden_language',
      severity: 'soft',
      description: `Informal language detected: ${informalMatches.join(', ')}. Use formal 'u/uw' instead.`,
      field: 'draftResponse',
    });
  }

  // Check for emojis (Unicode emoji ranges)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(reply)) {
    issues.push({
      rule: 'forbidden_language',
      severity: 'soft',
      description: 'Emoji detected in response. Remove all emojis.',
      field: 'draftResponse',
    });
  }

  return issues;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract keywords from a question for trigger coverage check.
 */
function extractKeywords(question: string): string[] {
  // Remove common Dutch question words and extract nouns/verbs
  const stopWords = ['heeft', 'bent', 'kunt', 'wilt', 'zou', 'is', 'een', 'het', 'de', 'u', 'uw'];
  const words = question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word));

  return words;
}

/**
 * Build retry prompt based on validation issues.
 */
export function buildRetryPrompt(issues: ValidationIssue[]): string {
  const hardIssues = issues.filter((i) => i.severity === 'hard');
  const softIssues = issues.filter((i) => i.severity === 'soft');

  let prompt = 'CORRECTIES VEREIST:\n\n';

  if (hardIssues.length > 0) {
    prompt += 'KRITIEK (VERPLICHT):\n';
    hardIssues.forEach((issue) => {
      prompt += `- ${issue.description}\n`;
    });
    prompt += '\n';
  }

  if (softIssues.length > 0) {
    prompt += 'AANBEVELINGEN:\n';
    softIssues.forEach((issue) => {
      prompt += `- ${issue.description}\n`;
    });
  }

  return prompt;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Run all rule-based validations on OrchestratorResult.
 * Returns aggregated validation result with retry prompt if needed.
 */
export function validateResponse(
  result: OrchestratorResult,
  turnPlan: TurnPlan
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Hard checks
  const allowPatchesIssue = checkAllowPatches(result, turnPlan);
  if (allowPatchesIssue) issues.push(allowPatchesIssue);

  const confirmationIssue = checkRequiresConfirmation(result);
  if (confirmationIssue) issues.push(confirmationIssue);

  const whitelistIssues = checkPatchWhitelist(result);
  issues.push(...whitelistIssues);

  // Soft checks
  const triggerIssue = checkImportantTriggers(result, turnPlan);
  if (triggerIssue) issues.push(triggerIssue);

  const nextStepIssue = checkNextStep(result, turnPlan);
  if (nextStepIssue) issues.push(nextStepIssue);

  const languageIssues = checkForbiddenLanguage(result);
  issues.push(...languageIssues);

  // Determine if retry is needed
  const hardIssues = issues.filter((i) => i.severity === 'hard');
  const softIssues = issues.filter((i) => i.severity === 'soft');

  const requiresRetry = hardIssues.length > 0 || softIssues.length > 0;
  const retryPrompt = requiresRetry ? buildRetryPrompt(issues) : undefined;

  return {
    passed: issues.length === 0,
    issues,
    requiresRetry,
    retryPrompt,
  };
}
