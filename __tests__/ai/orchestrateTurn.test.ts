// __tests__/ai/orchestrateTurn.test.ts
// Week 3, Day 15 - orchestrateTurn Test Suite
// Purpose: Test main coordinator that orchestrates all modules

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  orchestrateTurn,
  orchestrateTurnSimple,
  hasPendingPatches,
  usedFallback,
  type OrchestrateTurnInput,
} from '@/lib/ai/orchestrateTurn';
import type { WizardState } from '@/types/project';

// Mock all module dependencies
vi.mock('@/lib/ai/ConversationMemory');
vi.mock('@/lib/ai/FieldWatcher');
vi.mock('@/lib/ai/FeedbackQueue');
vi.mock('@/lib/ai/BehaviorAnalyzer');
vi.mock('@/lib/ai/AnticipationEngine');
vi.mock('@/lib/ai/SystemIntelligence');
vi.mock('@/lib/ai/TurnPlanner');
vi.mock('@/lib/ai/ContextPruner');
vi.mock('@/lib/ai/FallbackStrategy');

// ============================================================================
// TEST HELPERS
// ============================================================================

const createWizardState = (): WizardState => ({
  stateVersion: 1,
  chapterAnswers: {
    budget: { budgetTotaal: 100000 },
  },
  currentChapter: 'budget',
});

const createInput = (overrides: Partial<OrchestrateTurnInput> = {}): OrchestrateTurnInput => ({
  query: 'Wat is een realistisch budget?',
  wizardState: createWizardState(),
  userId: 'user-123',
  projectId: 'project-456',
  mode: 'PREMIUM',
  ...overrides,
});

// ============================================================================
// TEST SUITE 1: Happy Path - Normal Query
// ============================================================================

describe('orchestrateTurn - Happy Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('orchestrates full pipeline and returns response', async () => {
    // Mock all modules
    const { ConversationMemory } = await import('@/lib/ai/ConversationMemory');
    const { FieldWatcher } = await import('@/lib/ai/FieldWatcher');
    const { FeedbackQueue } = await import('@/lib/ai/FeedbackQueue');
    const { BehaviorAnalyzer } = await import('@/lib/ai/BehaviorAnalyzer');
    const { AnticipationEngine } = await import('@/lib/ai/AnticipationEngine');
    const { SystemIntelligence } = await import('@/lib/ai/SystemIntelligence');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { ContextPruner } = await import('@/lib/ai/ContextPruner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    // Phase 1: Memory & Context
    vi.mocked(ConversationMemory.prototype.load).mockResolvedValue({
      recent: [],
      summary: null,
      turnCount: 5,
      hasLongHistory: false,
    });

    vi.mocked(FieldWatcher.prototype.detectFocus).mockReturnValue({
      focusedField: 'budget:budgetTotaal',
      confidence: 0.9,
      source: 'user',
      timestamp: Date.now(),
    });

    vi.mocked(FeedbackQueue.prototype.checkQueue).mockReturnValue({
      hasPending: false,
      items: [],
      priority: 'low',
    });

    // Phase 2: Intelligence
    vi.mocked(BehaviorAnalyzer.prototype.analyze).mockResolvedValue({
      signals: { overwhelmed: false, confused: false, impatient: false, engaged: true },
      toneHint: 'neutral',
      confidenceLevel: 'medium',
      speedPreference: 'balanced',
      turnCount: 5,
    });

    vi.mocked(AnticipationEngine.prototype.run).mockResolvedValue({
      shouldInterrupt: false,
      guidances: [],
      criticalMissing: [],
    });

    vi.mocked(SystemIntelligence.prototype.detectConflicts).mockResolvedValue({
      conflicts: [],
      shouldBlock: false,
    });

    // Phase 3: Planning
    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'clarify',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'User asking for clarification',
      allowPatches: false,
    });

    // Phase 4: Pruning
    vi.mocked(ContextPruner.prototype.prune).mockReturnValue({
      prunedChapterAnswers: { budget: { budgetTotaal: 100000 } },
      prunedHistory: [],
      tokenEstimate: 1500,
      pruneLog: [],
      focusedChapter: 'budget',
      focusedField: 'budget:budgetTotaal',
    });

    // Phase 5: Execution
    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Een realistisch budget hangt af van uw projecttype en ambities.',
      patches: [],
      confidence: 0.8,
      tokensUsed: 150,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    vi.mocked(ConversationMemory.prototype.addTurn).mockResolvedValue(undefined);

    // Execute
    const result = await orchestrateTurn(createInput());

    // Verify result
    expect(result.response).toContain('realistisch budget');
    expect(result.patches).toHaveLength(0);
    expect(result.metadata.intent).toBe('clarify');
    expect(result.metadata.turnPlan.goal).toBe('clarify');
    expect(result.metadata.usedFallback).toBe(false);
    expect(result.metadata.intelligenceTrace).toBeDefined();

    // Verify all phases called
    expect(ConversationMemory.prototype.load).toHaveBeenCalled();
    expect(FieldWatcher.prototype.detectFocus).toHaveBeenCalled();
    expect(BehaviorAnalyzer.prototype.analyze).toHaveBeenCalled();
    expect(TurnPlanner.prototype.decide).toHaveBeenCalled();
    expect(ContextPruner.prototype.prune).toHaveBeenCalled();
    expect(FallbackStrategy.prototype.runWithGuardAndRetry).toHaveBeenCalled();
    expect(ConversationMemory.prototype.addTurn).toHaveBeenCalledTimes(2); // User + assistant
  });

  it('passes correct parameters to each module', async () => {
    const { ConversationMemory } = await import('@/lib/ai/ConversationMemory');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { ContextPruner } = await import('@/lib/ai/ContextPruner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    // Setup mocks (minimal)
    vi.mocked(ConversationMemory.prototype.load).mockResolvedValue({
      recent: [],
      summary: null,
      turnCount: 3,
      hasLongHistory: false,
    });

    const decideSpy = vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'fill_data',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Test',
      allowPatches: true,
    });

    const pruneSpy = vi.mocked(ContextPruner.prototype.prune).mockReturnValue({
      prunedChapterAnswers: {},
      prunedHistory: [],
      tokenEstimate: 1000,
      pruneLog: [],
      focusedChapter: null,
      focusedField: null,
    });

    const guardRetrySpy = vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test',
      patches: [],
      confidence: 0.8,
      tokensUsed: 100,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const input = createInput({
      query: 'Mijn budget is 100k',
      currentChapter: 'budget',
      mode: 'PREVIEW',
    });

    await orchestrateTurn(input);

    // Verify TurnPlanner received all intelligence
    expect(decideSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'Mijn budget is 100k',
        wizardState: expect.anything(),
      })
    );

    // Verify ContextPruner received correct maxTokens for PREVIEW mode
    expect(pruneSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        maxTokens: 4000, // PREVIEW mode
      })
    );

    // Verify FallbackStrategy received turnPlan and context
    expect(guardRetrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'Mijn budget is 100k',
        turnPlan: expect.objectContaining({ goal: 'fill_data' }),
        prunedContext: expect.anything(),
      })
    );
  });
});

// ============================================================================
// TEST SUITE 2: Conflict Path (surface_risks)
// ============================================================================

describe('orchestrateTurn - Conflict Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles conflict detection and surface_risks goal', async () => {
    const { ConversationMemory } = await import('@/lib/ai/ConversationMemory');
    const { SystemIntelligence } = await import('@/lib/ai/SystemIntelligence');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    vi.mocked(ConversationMemory.prototype.load).mockResolvedValue({
      recent: [],
      summary: null,
      turnCount: 2,
      hasLongHistory: false,
    });

    // Conflict detected
    vi.mocked(SystemIntelligence.prototype.detectConflicts).mockResolvedValue({
      conflicts: [
        {
          id: 'conflict-1',
          type: 'budget_risk',
          severity: 'blocking',
          description: 'Must-have wensen overschrijden budget',
          affectedFields: ['budgetTotaal'],
          affectedChapters: ['budget', 'wensen'],
          resolution: 'Verhoog budget of herclassificeer wensen',
          estimatedCost: 250000,
        },
      ],
      shouldBlock: true,
    });

    // TurnPlanner chooses surface_risks goal
    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'surface_risks',
      priority: 'system_conflict',
      route: 'guard_required',
      reasoning: 'Conflict detected',
      allowPatches: false,
      systemConflicts: [
        {
          id: 'conflict-1',
          type: 'budget_risk',
          severity: 'blocking',
          description: 'Must-have wensen overschrijden budget',
          affectedFields: ['budgetTotaal'],
          affectedChapters: ['budget', 'wensen'],
          resolution: 'Verhoog budget of herclassificeer wensen',
          estimatedCost: 250000,
        },
      ],
    });

    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Ik zie een budgetrisico: uw must-have wensen kosten meer dan uw budget.',
      patches: [],
      confidence: 0.95,
      tokensUsed: 120,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurn(createInput());

    expect(result.metadata.turnPlan.goal).toBe('surface_risks');
    expect(result.metadata.turnPlan.priority).toBe('system_conflict');
    expect(result.metadata.turnPlan.allowPatches).toBe(false);
    expect(result.metadata.intelligenceTrace.conflicts).toHaveLength(1);
    expect(result.patches).toHaveLength(0); // No patches for surface_risks
  });
});

// ============================================================================
// TEST SUITE 3: Anticipation Path
// ============================================================================

describe('orchestrateTurn - Anticipation Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles anticipation guidance', async () => {
    const { ConversationMemory } = await import('@/lib/ai/ConversationMemory');
    const { AnticipationEngine } = await import('@/lib/ai/AnticipationEngine');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    vi.mocked(ConversationMemory.prototype.load).mockResolvedValue({
      recent: [],
      summary: null,
      turnCount: 1,
      hasLongHistory: false,
    });

    // Anticipation triggered
    vi.mocked(AnticipationEngine.prototype.run).mockResolvedValue({
      shouldInterrupt: true,
      guidances: [
        {
          id: 'ant-1',
          priority: 'high',
          chapter: 'budget',
          question: 'Heeft u al een indicatief budget in gedachten?',
          reasoning: 'Budget is critical',
          relatedFields: ['budgetTotaal'],
        },
      ],
      criticalMissing: ['budgetTotaal'],
    });

    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'anticipate_and_guide',
      priority: 'anticipation',
      route: 'normal',
      reasoning: 'Proactive guidance',
      allowPatches: true,
      anticipationGuidance: {
        id: 'ant-1',
        priority: 'high',
        chapter: 'budget',
        question: 'Heeft u al een indicatief budget in gedachten?',
        reasoning: 'Budget is critical',
        relatedFields: ['budgetTotaal'],
      },
    });

    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Heeft u al een indicatief budget in gedachten voor dit project?',
      patches: [],
      confidence: 0.85,
      tokensUsed: 90,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurn(createInput());

    expect(result.metadata.turnPlan.goal).toBe('anticipate_and_guide');
    expect(result.metadata.intelligenceTrace.anticipation).toHaveLength(1);
    expect(result.response).toContain('budget');
  });

  it('skips anticipation when skipAnticipation=true', async () => {
    const { AnticipationEngine } = await import('@/lib/ai/AnticipationEngine');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');

    const anticipationSpy = vi.mocked(AnticipationEngine.prototype.run);

    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'clarify',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Normal query',
      allowPatches: false,
    });

    await orchestrateTurn(
      createInput({
        skipAnticipation: true,
      })
    );

    // AnticipationEngine.run should not be called
    expect(anticipationSpy).not.toHaveBeenCalled();
  });
});

// ============================================================================
// TEST SUITE 4: Fallback & Retry
// ============================================================================

describe('orchestrateTurn - Fallback & Retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles fallback when guard rejects multiple times', async () => {
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    // Fallback used after retries
    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Kunt u uw vraag wat specifieker formuleren?',
      patches: [],
      confidence: 0.5, // Low confidence
      tokensUsed: 150,
      metadata: {
        attempts: 3, // Max retries
        guardVerdict: 'RETRY_REQUIRED',
        usedFallback: true,
        guardIssues: ['forbidden_language', 'next_step_requirement'],
      },
    });

    const result = await orchestrateTurn(createInput());

    expect(result.metadata.usedFallback).toBe(true);
    expect(result.metadata.attempts).toBe(3);
    expect(result.patches).toHaveLength(0); // Fallback has no patches
  });

  it('tracks token usage correctly', async () => {
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test response',
      patches: [],
      confidence: 0.8,
      tokensUsed: 250,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurn(createInput());

    expect(result.metadata.tokensUsed).toBe(250);
  });
});

// ============================================================================
// TEST SUITE 5: Error Handling
// ============================================================================

describe('orchestrateTurn - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles intelligence module failures gracefully (Promise.allSettled)', async () => {
    const { BehaviorAnalyzer } = await import('@/lib/ai/BehaviorAnalyzer');
    const { AnticipationEngine } = await import('@/lib/ai/AnticipationEngine');
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    // BehaviorAnalyzer fails
    vi.mocked(BehaviorAnalyzer.prototype.analyze).mockRejectedValue(new Error('Analysis error'));

    // AnticipationEngine succeeds
    vi.mocked(AnticipationEngine.prototype.run).mockResolvedValue({
      shouldInterrupt: false,
      guidances: [],
      criticalMissing: [],
    });

    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'clarify',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Normal',
      allowPatches: false,
    });

    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test',
      patches: [],
      confidence: 0.7,
      tokensUsed: 100,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    // Should not throw, should use defaults for failed module
    const result = await orchestrateTurn(createInput());

    expect(result).toBeDefined();
    expect(result.metadata.intelligenceTrace.behavior).toBeUndefined(); // Failed, so undefined
  });
});

// ============================================================================
// TEST SUITE 6: Utility Functions
// ============================================================================

describe('orchestrateTurn - Utility Functions', () => {
  it('orchestrateTurnSimple uses default options', async () => {
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test',
      patches: [],
      confidence: 0.8,
      tokensUsed: 100,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurnSimple(
      'Test query',
      createWizardState(),
      'user-123',
      'project-456'
    );

    expect(result).toBeDefined();
  });

  it('hasPendingPatches detects patches with requiresConfirmation', () => {
    const resultWithPending = {
      response: 'Test',
      patches: [{ chapter: 'budget', delta: {}, requiresConfirmation: true }],
      metadata: {} as any,
    };

    const resultWithoutPending = {
      response: 'Test',
      patches: [],
      metadata: {} as any,
    };

    expect(hasPendingPatches(resultWithPending)).toBe(true);
    expect(hasPendingPatches(resultWithoutPending)).toBe(false);
  });

  it('usedFallback detects fallback usage', () => {
    const resultWithFallback = {
      response: 'Test',
      patches: [],
      metadata: { usedFallback: true } as any,
    };

    const resultWithoutFallback = {
      response: 'Test',
      patches: [],
      metadata: { usedFallback: false } as any,
    };

    expect(usedFallback(resultWithFallback)).toBe(true);
    expect(usedFallback(resultWithoutFallback)).toBe(false);
  });
});

// ============================================================================
// TEST SUITE 7: Integration - allowPatches Enforcement
// ============================================================================

describe('orchestrateTurn - Critical Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CRITICAL: enforces allowPatches=false (no patches in final result)', async () => {
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    // TurnPlanner sets allowPatches=false
    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'clarify',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Clarification needed',
      allowPatches: false, // CRITICAL
    });

    // FallbackStrategy returns NO patches (enforced by ResponseOrchestrator)
    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test',
      patches: [], // MUST be empty
      confidence: 0.8,
      tokensUsed: 100,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurn(createInput());

    // CRITICAL: Final result MUST have no patches
    expect(result.patches).toHaveLength(0);
    expect(result.metadata.turnPlan.allowPatches).toBe(false);
  });

  it('CRITICAL: preserves requiresConfirmation on patches (indirect patching)', async () => {
    const { TurnPlanner } = await import('@/lib/ai/TurnPlanner');
    const { FallbackStrategy } = await import('@/lib/ai/FallbackStrategy');

    vi.mocked(TurnPlanner.prototype.decide).mockReturnValue({
      goal: 'fill_data',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Data collection',
      allowPatches: true,
    });

    // Patches with requiresConfirmation
    vi.mocked(FallbackStrategy.prototype.runWithGuardAndRetry).mockResolvedValue({
      response: 'Test',
      patches: [
        {
          chapter: 'budget',
          delta: { operation: 'set', path: 'budgetTotaal', value: 100000 },
          requiresConfirmation: true, // CRITICAL
        },
      ],
      confidence: 0.75,
      tokensUsed: 120,
      metadata: {
        attempts: 1,
        guardVerdict: 'APPROVED',
        usedFallback: false,
        guardIssues: [],
      },
    });

    const result = await orchestrateTurn(createInput());

    expect(result.patches).toHaveLength(1);
    expect(result.patches[0].requiresConfirmation).toBe(true);
  });
});
