// __tests__/ai/FallbackStrategy.test.ts
// Week 3, Day 14 - FallbackStrategy Test Suite
// Purpose: Test retry loop with AnswerGuard validation

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FallbackStrategy,
  runWithGuardAndRetry,
  buildFallbackResponse,
  type GuardRetryOptions,
} from '@/lib/ai/FallbackStrategy';
import type { OrchestratorResult, TurnPlan, BehaviorProfile } from '@/types/ai';
import type { PrunedContext } from '@/types/ai';

// Mock dependencies
vi.mock('@/lib/ai/ResponseOrchestrator');
vi.mock('@/lib/ai/AnswerGuard');

// ============================================================================
// TEST HELPERS
// ============================================================================

const createTurnPlan = (overrides: Partial<TurnPlan> = {}): TurnPlan => ({
  goal: 'clarify',
  priority: 'user_query',
  route: 'normal',
  reasoning: 'Test plan',
  allowPatches: true,
  ...overrides,
});

const createPrunedContext = (): PrunedContext => ({
  prunedChapterAnswers: {
    budget: { budgetTotaal: 100000 },
  },
  prunedHistory: [],
  tokenEstimate: 1000,
  pruneLog: [],
  focusedChapter: null,
  focusedField: null,
});

const createBehaviorProfile = (): BehaviorProfile => ({
  signals: {
    overwhelmed: false,
    confused: false,
    impatient: false,
    engaged: true,
  },
  toneHint: 'neutral',
  confidenceLevel: 'medium',
  speedPreference: 'balanced',
  turnCount: 3,
});

const createOrchestratorResult = (
  overrides: Partial<OrchestratorResult> = {}
): OrchestratorResult => ({
  status: 'success',
  draftResponse: 'Dit is een formeel antwoord.',
  patches: [],
  confidence: 0.8,
  tokensUsed: 100,
  ...overrides,
});

// ============================================================================
// TEST SUITE 1: Happy Path (Approved First Try)
// ============================================================================

describe('FallbackStrategy - Happy Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns result immediately when guard approves first attempt', async () => {
    const strategy = new FallbackStrategy(2);

    // Mock ResponseOrchestrator to return valid result
    const mockResult = createOrchestratorResult({
      draftResponse: 'Prima, ik heb uw budget genoteerd.',
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'set', path: 'budgetTotaal', value: 100000 },
          requiresConfirmation: true,
        },
      ],
    });

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(mockResult);

    // Mock AnswerGuard to approve
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');
    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'All checks passed',
    });

    const options: GuardRetryOptions = {
      query: 'Mijn budget is 100000 euro',
      turnPlan: createTurnPlan({ goal: 'fill_data' }),
      prunedContext: createPrunedContext(),
    };

    const result = await strategy.runWithGuardAndRetry(options);

    expect(result.response).toBe('Prima, ik heb uw budget genoteerd.');
    expect(result.patches).toHaveLength(1);
    expect(result.metadata.attempts).toBe(1);
    expect(result.metadata.guardVerdict).toBe('APPROVED');
    expect(result.metadata.usedFallback).toBe(false);
    expect(result.confidence).toBe(0.8);
  });

  it('preserves patches when approved', async () => {
    const strategy = new FallbackStrategy();

    const mockResult = createOrchestratorResult({
      patches: [
        { chapter: 'budget', delta: { operation: 'set', path: 'budgetTotaal', value: 100000 } },
        { chapter: 'budget', delta: { operation: 'set', path: 'budgetReserve', value: 10000 } },
      ],
    });

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(mockResult);

    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');
    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'All checks passed',
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(result.patches).toHaveLength(2);
    expect(result.metadata.usedFallback).toBe(false);
  });
});

// ============================================================================
// TEST SUITE 2: Retry Logic
// ============================================================================

describe('FallbackStrategy - Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries once on soft fail, then approves', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    // First attempt: soft fail (informal language)
    const firstResult = createOrchestratorResult({
      draftResponse: 'Je kunt dit doen.',
    });

    // Second attempt: approved
    const secondResult = createOrchestratorResult({
      draftResponse: 'U kunt dit doen.',
    });

    let callCount = 0;
    vi.mocked(ResponseOrchestrator.prototype.generate).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? firstResult : secondResult;
    });

    // First validation: RETRY_REQUIRED
    // Second validation: APPROVED
    let validateCount = 0;
    vi.mocked(AnswerGuard.prototype.validate).mockImplementation(() => {
      validateCount++;
      if (validateCount === 1) {
        return {
          verdict: 'RETRY_REQUIRED',
          issues: [
            {
              rule: 'forbidden_language',
              severity: 'soft',
              description: 'Informal language detected: Je',
            },
          ],
          retryPrompt: 'AANBEVELINGEN:\n- Gebruik formeel Nederlands (u/uw)',
          shouldRetry: true,
          reason: 'Soft check failed',
        };
      } else {
        return {
          verdict: 'APPROVED',
          issues: [],
          shouldRetry: false,
          reason: 'All checks passed',
        };
      }
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Help me',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(result.response).toBe('U kunt dit doen.');
    expect(result.metadata.attempts).toBe(2);
    expect(result.metadata.guardVerdict).toBe('APPROVED');
    expect(result.metadata.usedFallback).toBe(false);
    expect(callCount).toBe(2); // Called twice
  });

  it('retries on parse error with correction prompt', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    // First attempt: parse error
    const firstResult = createOrchestratorResult({
      status: 'parse_error',
      parseError: 'Invalid JSON',
      draftResponse: 'Fallback message',
      confidence: 0,
    });

    // Second attempt: success
    const secondResult = createOrchestratorResult({
      draftResponse: 'U kunt dit doen.',
    });

    let callCount = 0;
    vi.mocked(ResponseOrchestrator.prototype.generate).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? firstResult : secondResult;
    });

    let validateCount = 0;
    vi.mocked(AnswerGuard.prototype.validate).mockImplementation(() => {
      validateCount++;
      if (validateCount === 1) {
        return {
          verdict: 'RETRY_REQUIRED',
          issues: [{ rule: 'parse_error', severity: 'hard', description: 'JSON parse failed' }],
          retryPrompt: 'PARSE FOUT GEDETECTEERD:\nGebruik correcte JSON formatting',
          shouldRetry: true,
          reason: 'Parse error',
        };
      } else {
        return {
          verdict: 'APPROVED',
          issues: [],
          shouldRetry: false,
          reason: 'All checks passed',
        };
      }
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(result.metadata.attempts).toBe(2);
    expect(result.metadata.guardVerdict).toBe('APPROVED');
    expect(callCount).toBe(2);
  });

  it('enforces max 2 retries (3 total attempts)', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    // All attempts fail
    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(
      createOrchestratorResult({
        draftResponse: 'Je moet dit doen.',
      })
    );

    // Always return RETRY_REQUIRED
    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'RETRY_REQUIRED',
      issues: [{ rule: 'forbidden_language', severity: 'soft', description: 'Informal' }],
      retryPrompt: 'Fix informal language',
      shouldRetry: true,
      reason: 'Soft check failed',
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan({ goal: 'clarify' }),
      prunedContext: createPrunedContext(),
    });

    // After 3 attempts (0, 1, 2), should use fallback
    expect(result.metadata.attempts).toBe(3);
    expect(result.metadata.usedFallback).toBe(true);
    expect(result.patches).toHaveLength(0); // No patches on fallback
    expect(result.confidence).toBe(0.5); // Low confidence
  });
});

// ============================================================================
// TEST SUITE 3: Hard Fail & Fallback
// ============================================================================

describe('FallbackStrategy - Hard Fail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses fallback immediately on hard fail', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(
      createOrchestratorResult({
        patches: [{ chapter: 'budget', delta: { operation: 'set', path: 'foo', value: 'bar' } }],
      })
    );

    // Hard fail due to invalid chapter
    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'HARD_FAIL',
      issues: [{ rule: 'patch_whitelist', severity: 'hard', description: 'Invalid chapter' }],
      shouldRetry: false,
      reason: 'Max retries exceeded',
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan({ goal: 'fill_data', allowPatches: false }),
      prunedContext: createPrunedContext(),
    });

    expect(result.metadata.attempts).toBe(1); // Only one attempt
    expect(result.metadata.guardVerdict).toBe('HARD_FAIL');
    expect(result.metadata.usedFallback).toBe(true);
    expect(result.patches).toHaveLength(0); // Fallback has no patches
    expect(result.response).toContain('details'); // Fallback message for fill_data
  });

  it('generates contextual fallback for each turn goal', async () => {
    const strategy = new FallbackStrategy();

    const testCases: Array<{ goal: TurnPlan['goal']; expectedKeyword: string }> = [
      { goal: 'fill_data', expectedKeyword: 'details' },
      { goal: 'anticipate_and_guide', expectedKeyword: 'stap voor stap' },
      { goal: 'surface_risks', expectedKeyword: 'aandachtspunten' },
      { goal: 'offer_alternatives', expectedKeyword: 'opties' },
      { goal: 'clarify', expectedKeyword: 'specifieker' },
    ];

    for (const { goal, expectedKeyword } of testCases) {
      const turnPlan = createTurnPlan({ goal });
      const prunedContext = createPrunedContext();

      const fallback = strategy.buildFallbackResponse('Test reason', turnPlan, prunedContext);

      expect(fallback.reply.toLowerCase()).toContain(expectedKeyword);
      expect(fallback.patches).toHaveLength(0);
    }
  });

  it('generates fallback with conflict context for surface_risks', async () => {
    const strategy = new FallbackStrategy();

    const turnPlan = createTurnPlan({
      goal: 'surface_risks',
      systemConflicts: [
        {
          id: 'c1',
          type: 'budget_risk',
          severity: 'blocking',
          description: 'Budget te laag',
          affectedFields: ['budgetTotaal'],
          affectedChapters: ['budget'],
          resolution: 'Verhoog het budget',
        },
      ],
    });

    const fallback = strategy.buildFallbackResponse('Test', turnPlan, createPrunedContext());

    expect(fallback.reply).toContain('Budget te laag');
    expect(fallback.reply).toContain('Verhoog het budget');
  });
});

// ============================================================================
// TEST SUITE 4: Edge Cases
// ============================================================================

describe('FallbackStrategy - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles RETRY_REQUIRED without retry prompt gracefully', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(
      createOrchestratorResult()
    );

    // RETRY_REQUIRED but no retry prompt (edge case)
    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'RETRY_REQUIRED',
      issues: [],
      retryPrompt: undefined, // Missing!
      shouldRetry: true,
      reason: 'Retry needed',
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    // Should use fallback
    expect(result.metadata.usedFallback).toBe(true);
    expect(result.metadata.guardVerdict).toBe('RETRY_REQUIRED');
  });

  it('resets guard attempts between turns', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    const mockResetAttempts = vi.fn();
    vi.mocked(AnswerGuard.prototype.resetAttempts).mockImplementation(mockResetAttempts);

    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(
      createOrchestratorResult()
    );

    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'OK',
    });

    // First turn
    await strategy.runWithGuardAndRetry({
      query: 'Test 1',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(mockResetAttempts).toHaveBeenCalledTimes(1);

    // Second turn
    await strategy.runWithGuardAndRetry({
      query: 'Test 2',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(mockResetAttempts).toHaveBeenCalledTimes(2);
  });

  it('tracks token usage across retries', async () => {
    const strategy = new FallbackStrategy(2);

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    // First attempt: 100 tokens
    // Second attempt: 150 tokens (should use second)
    let callCount = 0;
    vi.mocked(ResponseOrchestrator.prototype.generate).mockImplementation(async () => {
      callCount++;
      return createOrchestratorResult({
        tokensUsed: callCount === 1 ? 100 : 150,
      });
    });

    let validateCount = 0;
    vi.mocked(AnswerGuard.prototype.validate).mockImplementation(() => {
      validateCount++;
      if (validateCount === 1) {
        return {
          verdict: 'RETRY_REQUIRED',
          issues: [],
          retryPrompt: 'Retry',
          shouldRetry: true,
          reason: 'Test',
        };
      } else {
        return {
          verdict: 'APPROVED',
          issues: [],
          shouldRetry: false,
          reason: 'OK',
        };
      }
    });

    const result = await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    // Should use tokens from final attempt
    expect(result.tokensUsed).toBe(150);
  });
});

// ============================================================================
// TEST SUITE 5: Convenience Functions
// ============================================================================

describe('FallbackStrategy - Convenience Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runWithGuardAndRetry creates new instance', async () => {
    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    vi.mocked(ResponseOrchestrator.prototype.generate).mockResolvedValue(
      createOrchestratorResult()
    );

    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'OK',
    });

    const result = await runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
    });

    expect(result).toBeDefined();
    expect(result.metadata.guardVerdict).toBe('APPROVED');
  });

  it('buildFallbackResponse utility works', () => {
    const turnPlan = createTurnPlan({ goal: 'clarify' });
    const prunedContext = createPrunedContext();

    const fallback = buildFallbackResponse('Test reason', turnPlan, prunedContext);

    expect(fallback.reply).toContain('specifieker');
    expect(fallback.patches).toHaveLength(0);
  });
});

// ============================================================================
// TEST SUITE 6: Integration with BehaviorProfile
// ============================================================================

describe('FallbackStrategy - BehaviorProfile Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes behavior profile to orchestrator', async () => {
    const strategy = new FallbackStrategy();

    const { ResponseOrchestrator } = await import('@/lib/ai/ResponseOrchestrator');
    const { AnswerGuard } = await import('@/lib/ai/AnswerGuard');

    const generateSpy = vi
      .mocked(ResponseOrchestrator.prototype.generate)
      .mockResolvedValue(createOrchestratorResult());

    vi.mocked(AnswerGuard.prototype.validate).mockReturnValue({
      verdict: 'APPROVED',
      issues: [],
      shouldRetry: false,
      reason: 'OK',
    });

    const behaviorProfile = createBehaviorProfile();

    await strategy.runWithGuardAndRetry({
      query: 'Test',
      turnPlan: createTurnPlan(),
      prunedContext: createPrunedContext(),
      behaviorProfile,
    });

    expect(generateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        behaviorProfile,
      })
    );
  });
});
