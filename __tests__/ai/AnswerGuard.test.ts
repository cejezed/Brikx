// __tests__/ai/AnswerGuard.test.ts
// Week 3, Day 13 - AnswerGuard 2.0 Test Suite
// Purpose: Comprehensive tests for multi-layer validation with retry logic

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AnswerGuard,
  validateOrchestratorResult,
  isApproved,
  requiresRetry,
  isHardFail,
  type GuardDecision,
} from '@/lib/ai/AnswerGuard';
import type { OrchestratorResult, TurnPlan } from '@/types/ai';
import type { PatchEvent } from '@/types/project';

// ============================================================================
// TEST HELPERS
// ============================================================================

const createOrchestratorResult = (
  overrides: Partial<OrchestratorResult> = {}
): OrchestratorResult => ({
  status: 'success',
  draftResponse: 'Dit is een formeel antwoord in het Nederlands.',
  patches: [],
  confidence: 0.8,
  tokensUsed: 100,
  ...overrides,
});

const createTurnPlan = (overrides: Partial<TurnPlan> = {}): TurnPlan => ({
  goal: 'clarify',
  priority: 'user_query',
  route: 'normal',
  reasoning: 'Test plan',
  allowPatches: true,
  ...overrides,
});

const createValidPatch = (overrides: Partial<PatchEvent> = {}): PatchEvent => ({
  chapter: 'budget',
  delta: {
    operation: 'set',
    path: 'budgetTotaal',
    value: 100000,
  },
  requiresConfirmation: true,
  ...overrides,
});

// ============================================================================
// TEST SUITE 1: Parse Error Detection (Layer 1)
// ============================================================================

describe('AnswerGuard 2.0 - Parse Error Detection', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('detects parse_error status and requires retry (attempt 1)', () => {
    const result = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Unexpected token at position 10',
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.shouldRetry).toBe(true);
    expect(decision.issues).toHaveLength(1);
    expect(decision.issues[0].rule).toBe('parse_error');
    expect(decision.issues[0].severity).toBe('hard');
    expect(decision.retryPrompt).toContain('PARSE FOUT GEDETECTEERD');
    expect(decision.retryPrompt).toContain('Unexpected token at position 10');
  });

  it('fails hard after max retries on parse errors', () => {
    const result = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Invalid JSON',
    });
    const turnPlan = createTurnPlan();

    // First attempt
    guard.validate(result, turnPlan);
    // Second attempt
    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('HARD_FAIL');
    expect(decision.shouldRetry).toBe(false);
    expect(decision.reason).toContain('Max retries (2) exceeded');
  });

  it('resets attempt counter after resetAttempts()', () => {
    const result = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Test error',
    });
    const turnPlan = createTurnPlan();

    // First turn
    guard.validate(result, turnPlan);
    guard.validate(result, turnPlan); // Max retries reached

    // Reset for new turn
    guard.resetAttempts();

    // Third call should be treated as first attempt
    const decision = guard.validate(result, turnPlan);
    expect(decision.verdict).toBe('RETRY_REQUIRED'); // Should retry again
    expect(guard.getAttemptCount()).toBe(1);
  });
});

// ============================================================================
// TEST SUITE 2: Hard Checks (Layer 2)
// ============================================================================

describe('AnswerGuard 2.0 - Hard Checks', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('HARD CHECK: detects allowPatches violation (patches when not allowed)', () => {
    const result = createOrchestratorResult({
      patches: [createValidPatch()],
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'allowPatches_enforcement')).toBe(true);
    expect(decision.retryPrompt).toContain('KRITIEK');
  });

  it('HARD CHECK: detects missing requiresConfirmation flags', () => {
    const result = createOrchestratorResult({
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'set', path: 'budgetTotaal', value: 100000 },
          // Missing requiresConfirmation!
        } as PatchEvent,
      ],
      confidence: 0.8, // Below 0.95
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'indirect_patching')).toBe(true);
  });

  it('HARD CHECK: detects invalid chapter in patch', () => {
    const result = createOrchestratorResult({
      patches: [
        {
          chapter: 'invalid_chapter' as any,
          delta: { operation: 'set', path: 'foo', value: 'bar' },
          requiresConfirmation: true,
        },
      ],
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'patch_whitelist')).toBe(true);
    expect(decision.issues.some((i) => i.description.includes("invalid chapter 'invalid_chapter'"))).toBe(true);
  });

  it('HARD CHECK: detects invalid operation in patch', () => {
    const result = createOrchestratorResult({
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'delete' as any, path: 'budgetTotaal', value: 100000 },
          requiresConfirmation: true,
        },
      ],
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'patch_whitelist')).toBe(true);
    expect(decision.issues.some((i) => i.description.includes("invalid operation 'delete'"))).toBe(true);
  });

  it('HARD CHECK: detects invalid path for chapter', () => {
    const result = createOrchestratorResult({
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'set', path: 'invalidPath', value: 100000 },
          requiresConfirmation: true,
        },
      ],
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'patch_whitelist')).toBe(true);
    expect(decision.issues.some((i) => i.description.includes("invalid path 'invalidPath'"))).toBe(true);
  });

  it('HARD CHECK: fails hard after max retries on hard issues', () => {
    const result = createOrchestratorResult({
      patches: [createValidPatch()],
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    // First attempt
    guard.validate(result, turnPlan);
    // Second attempt (max retries)
    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('HARD_FAIL');
    expect(decision.shouldRetry).toBe(false);
    expect(decision.reason).toContain('Hard validation failures after 2 attempts');
  });
});

// ============================================================================
// TEST SUITE 3: Soft Checks (Layer 3)
// ============================================================================

describe('AnswerGuard 2.0 - Soft Checks', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('SOFT CHECK: detects informal language (je/jij)', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je kunt dit doen door je budget te verhogen.',
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'forbidden_language')).toBe(true);
    expect(decision.issues.some((i) => i.description.includes('Informal language detected'))).toBe(true);
  });

  it('SOFT CHECK: detects emojis in response', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Dat is een goed idee! 👍 Laten we dat doen.',
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'forbidden_language')).toBe(true);
    expect(decision.issues.some((i) => i.description.includes('Emoji detected'))).toBe(true);
  });

  it('SOFT CHECK: detects missing trigger coverage', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Dit is een antwoord over iets anders.',
    });
    const turnPlan = createTurnPlan({
      goal: 'anticipate_and_guide',
      anticipationGuidance: {
        id: 'ant-1',
        priority: 'high',
        chapter: 'budget',
        question: 'Heeft u al nagedacht over zonnepanelen?',
        reasoning: 'Sustainability topic',
        relatedFields: ['solarPanels'],
      },
    });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'trigger_coverage')).toBe(true);
  });

  it('SOFT CHECK: detects missing question for clarify goal', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Ik kan u daarmee helpen.', // No question mark or suggestion
    });
    const turnPlan = createTurnPlan({ goal: 'clarify' });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.some((i) => i.rule === 'next_step_requirement')).toBe(true);
  });

  it('SOFT CHECK: retries once, then approves with warning', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je kunt dit doen.', // Informal language (soft issue)
    });
    const turnPlan = createTurnPlan();

    // First attempt: should retry
    const decision1 = guard.validate(result, turnPlan);
    expect(decision1.verdict).toBe('RETRY_REQUIRED');

    // Second attempt with same issue: should approve with warning
    const decision2 = guard.validate(result, turnPlan);
    expect(decision2.verdict).toBe('APPROVED');
    expect(decision2.issues.length).toBeGreaterThan(0); // Issues still logged
    expect(decision2.reason).toContain('Soft issues remain but max retries reached');
  });
});

// ============================================================================
// TEST SUITE 4: Approved Cases (All checks pass)
// ============================================================================

describe('AnswerGuard 2.0 - Approved Cases', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('approves valid response with no patches', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Dat is een goede vraag. Kunt u wat meer context geven?',
      patches: [],
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
    expect(decision.issues).toHaveLength(0);
    expect(decision.shouldRetry).toBe(false);
    expect(decision.reason).toBe('All validation checks passed');
  });

  it('approves valid response with valid patches (allowPatches=true)', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Prima, ik noteer een budget van €100.000.',
      patches: [createValidPatch()],
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
    expect(decision.issues).toHaveLength(0);
  });

  it('approves response with no patches when allowPatches=false', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Ik begrijp uw vraag.',
      patches: [],
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
    expect(decision.issues).toHaveLength(0);
  });

  it('approves response with question for clarify goal', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Kunt u wat meer vertellen over uw wensen?',
    });
    const turnPlan = createTurnPlan({ goal: 'clarify' });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
  });

  it('approves response with suggestion phrase for anticipate_and_guide goal', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Laten we beginnen met uw budget. Heeft u al een indicatie?',
    });
    const turnPlan = createTurnPlan({ goal: 'anticipate_and_guide' });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
  });

  it('approves high-confidence patches without requiresConfirmation', () => {
    const result = createOrchestratorResult({
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'set', path: 'budgetTotaal', value: 100000 },
          requiresConfirmation: false, // High confidence (>0.95)
        },
      ],
      confidence: 0.96, // Above threshold
    });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED');
  });
});

// ============================================================================
// TEST SUITE 5: Retry Logic & Prompts
// ============================================================================

describe('AnswerGuard 2.0 - Retry Logic', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('builds retry prompt for hard issues', () => {
    const result = createOrchestratorResult({
      patches: [createValidPatch()],
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    const decision = guard.validate(result, turnPlan);

    expect(decision.retryPrompt).toContain('CORRECTIES VEREIST');
    expect(decision.retryPrompt).toContain('KRITIEK (VERPLICHT)');
    expect(decision.retryPrompt).toContain('patches');
  });

  it('builds retry prompt for soft issues', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je moet dit doen.', // Informal
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.retryPrompt).toContain('AANBEVELINGEN');
    expect(decision.retryPrompt).toContain('Informal language');
  });

  it('builds retry prompt for parse errors', () => {
    const result = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Unexpected end of JSON input',
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.retryPrompt).toContain('PARSE FOUT GEDETECTEERD');
    expect(decision.retryPrompt).toContain('Unexpected end of JSON input');
    expect(decision.retryPrompt).toContain('dubbele quotes');
  });

  it('tracks attempt count correctly', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je moet dit doen.',
    });
    const turnPlan = createTurnPlan();

    expect(guard.getAttemptCount()).toBe(0);

    guard.validate(result, turnPlan);
    expect(guard.getAttemptCount()).toBe(1);

    guard.validate(result, turnPlan);
    expect(guard.getAttemptCount()).toBe(2);
  });
});

// ============================================================================
// TEST SUITE 6: Multiple Issues Detection
// ============================================================================

describe('AnswerGuard 2.0 - Multiple Issues', () => {
  let guard: AnswerGuard;

  beforeEach(() => {
    guard = new AnswerGuard({ maxRetries: 2 });
  });

  it('detects multiple hard issues in single validation', () => {
    const result = createOrchestratorResult({
      patches: [
        createValidPatch(), // allowPatches will be false
        {
          chapter: 'invalid_chapter' as any,
          delta: { operation: 'delete' as any, path: 'foo', value: 'bar' },
        },
      ],
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.length).toBeGreaterThan(1);
    // Should have allowPatches violation + whitelist violations
  });

  it('detects multiple soft issues in single validation', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je moet dit doen 😊', // Informal + emoji
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.issues.length).toBeGreaterThan(1);
    expect(decision.issues.filter((i) => i.rule === 'forbidden_language').length).toBe(2);
  });

  it('prioritizes hard issues over soft issues', () => {
    const result = createOrchestratorResult({
      draftResponse: 'Je moet dit doen.', // Soft: informal
      patches: [createValidPatch()], // Hard: allowPatches violation
    });
    const turnPlan = createTurnPlan({ allowPatches: false });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('RETRY_REQUIRED');
    expect(decision.reason).toContain('hard check(s) failed');

    // Retry twice to exceed hard issue retries
    guard.validate(result, turnPlan);

    const finalDecision = guard.validate(result, turnPlan);
    expect(finalDecision.verdict).toBe('HARD_FAIL'); // Hard issues block approval
  });
});

// ============================================================================
// TEST SUITE 7: Convenience Functions
// ============================================================================

describe('AnswerGuard 2.0 - Convenience Functions', () => {
  it('validateOrchestratorResult creates new guard instance', () => {
    const result = createOrchestratorResult();
    const turnPlan = createTurnPlan();

    const decision = validateOrchestratorResult(result, turnPlan);

    expect(decision).toBeDefined();
    expect(decision.verdict).toBe('APPROVED');
  });

  it('isApproved returns true for APPROVED verdict', () => {
    const decision: GuardDecision = {
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'All checks passed',
    };

    expect(isApproved(decision)).toBe(true);
  });

  it('isApproved returns false for RETRY_REQUIRED verdict', () => {
    const decision: GuardDecision = {
      verdict: 'RETRY_REQUIRED',
      issues: [],
      shouldRetry: true,
      reason: 'Retry needed',
    };

    expect(isApproved(decision)).toBe(false);
  });

  it('requiresRetry returns true for RETRY_REQUIRED verdict', () => {
    const decision: GuardDecision = {
      verdict: 'RETRY_REQUIRED',
      issues: [],
      shouldRetry: true,
      reason: 'Retry needed',
    };

    expect(requiresRetry(decision)).toBe(true);
  });

  it('requiresRetry returns false for APPROVED verdict', () => {
    const decision: GuardDecision = {
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'All checks passed',
    };

    expect(requiresRetry(decision)).toBe(false);
  });

  it('isHardFail returns true for HARD_FAIL verdict', () => {
    const decision: GuardDecision = {
      verdict: 'HARD_FAIL',
      issues: [],
      shouldRetry: false,
      reason: 'Max retries exceeded',
    };

    expect(isHardFail(decision)).toBe(true);
  });

  it('isHardFail returns false for other verdicts', () => {
    const decision: GuardDecision = {
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'All checks passed',
    };

    expect(isHardFail(decision)).toBe(false);
  });
});

// ============================================================================
// TEST SUITE 8: Edge Cases
// ============================================================================

describe('AnswerGuard 2.0 - Edge Cases', () => {
  it('handles empty response text', () => {
    const guard = new AnswerGuard();
    const result = createOrchestratorResult({ draftResponse: '' });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    // Empty response is technically valid (no forbidden language, etc.)
    // Might fail soft checks like next_step if goal requires question
    expect(decision).toBeDefined();
  });

  it('handles very long patch arrays', () => {
    const guard = new AnswerGuard();
    const patches = Array(50)
      .fill(null)
      .map(() => createValidPatch());
    const result = createOrchestratorResult({ patches });
    const turnPlan = createTurnPlan({ allowPatches: true });

    const decision = guard.validate(result, turnPlan);

    expect(decision.verdict).toBe('APPROVED'); // All valid patches
  });

  it('handles custom maxRetries option', () => {
    const guard = new AnswerGuard({ maxRetries: 3 });
    const result = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Test',
    });
    const turnPlan = createTurnPlan();

    guard.validate(result, turnPlan); // 1
    guard.validate(result, turnPlan); // 2
    const decision3 = guard.validate(result, turnPlan); // 3

    expect(decision3.verdict).toBe('RETRY_REQUIRED'); // Still retrying (maxRetries=3)

    const decision4 = guard.validate(result, turnPlan); // 4 (exceeds)
    expect(decision4.verdict).toBe('HARD_FAIL');
  });

  it('handles all valid ChapterKeys in patches', () => {
    const guard = new AnswerGuard();
    const validChapters: Array<'basis' | 'ruimtes' | 'wensen' | 'budget' | 'techniek' | 'duurzaam' | 'risico'> = [
      'basis',
      'ruimtes',
      'wensen',
      'budget',
      'techniek',
      'duurzaam',
      'risico',
    ];

    for (const chapter of validChapters) {
      guard.resetAttempts();
      const result = createOrchestratorResult({
        patches: [
          {
            chapter,
            delta: { operation: 'set', path: 'projectType', value: 'test' },
            requiresConfirmation: true,
          } as PatchEvent,
        ],
      });
      const turnPlan = createTurnPlan({ allowPatches: true });

      const decision = guard.validate(result, turnPlan);

      // Chapter is valid, but path might be invalid for that chapter
      // This test just ensures no crash on valid chapters
      expect(decision).toBeDefined();
    }
  });

  it('handles llm_error status (skips validation, just logs)', () => {
    const guard = new AnswerGuard();
    const result = createOrchestratorResult({
      status: 'llm_error',
      draftResponse: 'Fallback message',
      patches: [],
    });
    const turnPlan = createTurnPlan();

    const decision = guard.validate(result, turnPlan);

    // LLM errors don't go through validation, treated as valid response
    expect(decision.verdict).toBe('APPROVED');
  });
});
