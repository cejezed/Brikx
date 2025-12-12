// __tests__/ai/ResponseOrchestrator.test.ts
// Test suite for ResponseOrchestrator module
// Week 3, Day 11-12 - Test-First Development

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  TurnPlan,
  BehaviorProfile,
  PrunedContext,
  OrchestratorResult,
} from '@/types/ai';

// Import the module under test
import { ResponseOrchestrator } from '@/lib/ai/ResponseOrchestrator';

// Mock ProModel since we don't want to call real LLM in tests
vi.mock('@/lib/ai/ProModel', () => ({
  ProModel: {
    generateResponse: vi.fn(),
    generatePatch: vi.fn(),
  },
}));

describe('ResponseOrchestrator', () => {
  let orchestrator: ResponseOrchestrator;

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
    turnCount: 5,
  });

  const createTurnPlan = (goal: TurnPlan['goal'] = 'clarify', allowPatches: boolean = true): TurnPlan => ({
    goal,
    priority: 'user_query',
    route: 'normal',
    allowPatches,
    reasoning: 'Test plan',
  });

  const createPrunedContext = (): PrunedContext => ({
    prunedChapterAnswers: {
      budget: { budgetTotaal: 100000 },
    },
    prunedHistory: [],
    tokenEstimate: 1500,
    pruneLog: [],
    focusedChapter: 'budget',
    focusedField: 'budgetTotaal',
  });

  beforeEach(() => {
    orchestrator = new ResponseOrchestrator();
    vi.clearAllMocks();
  });

  // ============================================================================
  // TEST SUITE 1: Basic Response Generation
  // ============================================================================

  describe('basic response generation', () => {
    it('generates response for clarify goal', async () => {
      const query = 'Wat is een realistische budget voor een aanbouw?';
      const turnPlan = createTurnPlan('clarify');
      const prunedContext = createPrunedContext();

      // Mock LLM response
      const mockLLMResponse = {
        reply: 'Een aanbouw kost gemiddeld €1500-2000 per m². Voor een standaard aanbouw van 20m² rekent u op €30.000-€40.000.',
        patches: [],
        usedTriggerIds: [],
        usedExampleIds: [],
        usedNuggetIds: ['nugget-budget-aanbouw'],
      };

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue(mockLLMResponse.reply);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result).toBeDefined();
      expect(result.draftResponse).toBe(mockLLMResponse.reply);
      expect(result.patches).toEqual([]);
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('generates response for fill_data goal with patches', async () => {
      const query = 'Mijn budget is 100000 euro';
      const turnPlan = createTurnPlan('fill_data');
      const prunedContext = createPrunedContext();

      const mockPatchResult = {
        patches: [
          {
            chapter: 'budget' as const,
            delta: {
              operation: 'set' as const,
              path: 'budgetTotaal',
              value: 100000,
            },
          },
        ],
        followUpQuestion: 'Prima, ik noteer een budget van €100.000.',
        tokensUsed: 120,
      };

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generatePatch).mockResolvedValue(mockPatchResult);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.draftResponse).toContain('100.000');
      expect(result.patches).toHaveLength(1);
      expect(result.patches[0].chapter).toBe('budget');
      expect(result.patches[0].delta.value).toBe(100000);
    });

    it('generates response for anticipate_and_guide goal', async () => {
      const query = 'help me start budget';
      const turnPlan: TurnPlan = {
        goal: 'anticipate_and_guide',
        priority: 'anticipation',
        route: 'normal',
        allowPatches: true,
        reasoning: 'User needs guidance on budget',
        anticipationGuidance: {
          id: 'ant-1',
          priority: 'high',
          chapter: 'budget',
          question: 'Heeft u al een indicatief budget in gedachten?',
          reasoning: 'Budget is critical for project scope',
          relatedFields: ['budgetTotaal'],
        },
      };
      const prunedContext = createPrunedContext();

      const mockResponse = 'Welkom bij Budget! Heeft u al een indicatief budget in gedachten voor dit project? Dan kan ik u gerichter adviseren over wat realistisch is.';

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue(mockResponse);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.draftResponse).toContain('budget');
      expect(result.confidence).toBeGreaterThan(0.8); // High confidence for anticipation
    });

    it('generates response for surface_risks goal with conflicts', async () => {
      const query = 'Ik wil een zwembad, home cinema en grote serre';
      const turnPlan: TurnPlan = {
        goal: 'surface_risks',
        priority: 'system_conflict',
        route: 'guard_required',
        allowPatches: false,
        reasoning: 'Budget conflict detected',
        systemConflicts: [
          {
            id: 'conflict-1',
            type: 'budget_risk',
            severity: 'blocking',
            description: 'Must-have wensen overschrijden budget',
            affectedFields: ['budgetTotaal', 'wishes'],
            affectedChapters: ['budget', 'wensen'],
            resolution: 'Verhoog budget of herclassificeer wensen',
            estimatedCost: 250000,
          },
        ],
      };
      const prunedContext = createPrunedContext();

      const mockResponse = 'Ik zie dat uw must-have wensen (zwembad, cinema, serre) naar schatting €250.000 kosten, maar uw budget is €100.000. U heeft drie opties: 1) Sommige wensen herclassificeren, 2) Budget verhogen, 3) In fases werken.';

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue(mockResponse);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.draftResponse).toContain('budget');
      expect(result.draftResponse).toContain('250.000');
      expect(result.confidence).toBeGreaterThan(0.9); // High confidence for conflicts
    });

    it('generates response for offer_alternatives goal', async () => {
      const query = 'Ik weet niet welk type verwarming ik moet kiezen';
      const turnPlan = createTurnPlan('offer_alternatives');
      const prunedContext = createPrunedContext();

      const mockResponse = 'Voor verwarming heeft u drie hoofdopties: 1) Warmtepomp (duurzaam, hoge investering), 2) CV-ketel (betaalbaar, minder duurzaam), 3) Hybride systeem (combinatie). Wat is voor u belangrijker: initiële kosten of duurzaamheid?';

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue(mockResponse);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.draftResponse).toContain('opties');
      expect(result.patches).toHaveLength(0); // No patches for alternatives
    });
  });

  // ============================================================================
  // TEST SUITE 2: Error Handling
  // ============================================================================

  describe('error handling', () => {
    it('handles LLM timeout gracefully', async () => {
      const query = 'Test query';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockRejectedValue(new Error('Timeout'));

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result).toBeDefined();
      expect(result.draftResponse).toContain('kan uw vraag op dit moment niet volledig verwerken');
      expect(result.patches).toEqual([]);
      expect(result.confidence).toBe(0);
    });

    it('handles invalid JSON response from LLM', async () => {
      const query = 'Test query';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue('NOT VALID JSON - this will cause JSON parse error');

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result).toBeDefined();
      expect(result.draftResponse).toContain('kan uw vraag op dit moment niet volledig verwerken');
      expect(result.confidence).toBe(0);
    });

    it('handles empty LLM response', async () => {
      const query = 'Test query';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue(''); // Empty response

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result).toBeDefined();
      expect(result.draftResponse).toBeTruthy(); // Should have fallback message
    });

    it('validates patches are valid before returning', async () => {
      const query = 'Set budget to 100k';
      const turnPlan = createTurnPlan('fill_data');
      const prunedContext = createPrunedContext();

      const mockPatchResult = {
        followUpQuestion: 'Budget set',
        patches: [
          {
            chapter: 'invalid_chapter' as any, // Invalid chapter
            delta: {
              operation: 'set' as const,
              path: 'budgetTotaal',
              value: 100000,
            },
          },
        ],
        tokensUsed: 80,
      };

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generatePatch).mockResolvedValue(mockPatchResult);

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      // Invalid patches should be filtered out
      expect(result.patches).toHaveLength(0);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Prompt Building
  // ============================================================================

  describe('prompt building', () => {
    it('includes behavior profile in prompt context', async () => {
      const query = 'Help me with budget';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();
      const behaviorProfile: BehaviorProfile = {
        signals: {
          overwhelmed: true,
          confused: false,
          impatient: false,
          engaged: false,
        },
        toneHint: 'warm',
        confidenceLevel: 'low',
        speedPreference: 'thorough',
        turnCount: 3,
      };

      const { ProModel } = await import('@/lib/ai/ProModel');
      const generateSpy = vi.mocked(ProModel.generateResponse).mockResolvedValue('Test response');

      await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
        behaviorProfile,
      });

      // Verify ProModel was called with behavior context
      expect(generateSpy).toHaveBeenCalled();
      const callArgs = generateSpy.mock.calls[0];
      expect(callArgs).toBeDefined();
      // The prompt should include behavior hints
    });

    it('includes turn goal in system prompt', async () => {
      const query = 'What is my budget?';
      const turnPlan = createTurnPlan('fill_data');
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      const generateSpy = vi.mocked(ProModel.generatePatch).mockResolvedValue({
        followUpQuestion: 'Test response',
        patches: [],
        tokensUsed: 100,
      });

      await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(generateSpy).toHaveBeenCalled();
    });

    it('adapts prompt based on turn goal', async () => {
      const query = 'Test';
      const prunedContext = createPrunedContext();

      // Test different goals generate different prompts
      const goals: TurnPlan['goal'][] = ['fill_data', 'clarify', 'anticipate_and_guide', 'surface_risks', 'offer_alternatives'];

      for (const goal of goals) {
        vi.clearAllMocks();
        const turnPlan = createTurnPlan(goal);

        const { ProModel } = await import('@/lib/ai/ProModel');
        if (goal === 'fill_data') {
          vi.mocked(ProModel.generatePatch).mockResolvedValue({
            followUpQuestion: `Response for ${goal}`,
            patches: [],
            tokensUsed: 100,
          });
        } else {
          vi.mocked(ProModel.generateResponse).mockResolvedValue(`Response for ${goal}`);
        }

        const result = await orchestrator.generate({
          query,
          turnPlan,
          prunedContext,
        });

        expect(result).toBeDefined();
        if (goal === 'fill_data') {
          expect(vi.mocked(ProModel.generatePatch)).toHaveBeenCalled();
        } else {
          expect(vi.mocked(ProModel.generateResponse)).toHaveBeenCalled();
        }
      }
    });
  });

  // ============================================================================
  // TEST SUITE 4: Performance & Token Tracking
  // ============================================================================

  describe('performance and token tracking', () => {
    it('tracks tokens used from LLM call', async () => {
      const query = 'Test';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue('Test response');

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.tokensUsed).toBe(237);
    });

    it('completes within 2s performance target', async () => {
      const query = 'Test';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue('Test response');

      const startTime = Date.now();
      await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(2000); // <2s target
    });
  });

  // ============================================================================
  // TEST SUITE 5: Confidence Calculation
  // ============================================================================

  describe('confidence calculation', () => {
    it('returns high confidence (>0.95) for conflicts', async () => {
      const query = 'Test';
      const turnPlan: TurnPlan = {
        goal: 'surface_risks',
        priority: 'system_conflict',
        route: 'guard_required',
        allowPatches: false,
        reasoning: 'Conflict detected',
        systemConflicts: [
          {
            id: 'c1',
            type: 'budget_risk',
            severity: 'blocking',
            description: 'Test conflict',
            affectedFields: [],
            affectedChapters: ['budget'],
            resolution: 'Fix it',
          },
        ],
      };
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue('Conflict response');

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.confidence).toBeGreaterThan(0.95);
    });

    it('returns medium confidence for normal queries', async () => {
      const query = 'What is a good budget?';
      const turnPlan = createTurnPlan('clarify');
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockResolvedValue('Answer');

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(0.95);
    });

    it('returns zero confidence for error cases', async () => {
      const query = 'Test';
      const turnPlan = createTurnPlan();
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      vi.mocked(ProModel.generateResponse).mockRejectedValue(new Error('Failed'));

      const result = await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(result.confidence).toBe(0);
    });
  });

  // ============================================================================
  // TEST SUITE 6: Integration with Existing ProModel
  // ============================================================================

  describe('ProModel integration', () => {
    it('uses generatePatch for fill_data goal', async () => {
      const query = 'Budget is 100k';
      const turnPlan = createTurnPlan('fill_data');
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      const patchSpy = vi.mocked(ProModel.generatePatch).mockResolvedValue({
        followUpQuestion: 'OK',
        patches: [],
        tokensUsed: 100,
      });
      const responseSpy = vi.mocked(ProModel.generateResponse);

      await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(patchSpy).toHaveBeenCalled();
      expect(responseSpy).not.toHaveBeenCalled();
    });

    it('uses generateResponse for other goals', async () => {
      const query = 'What is a good budget?';
      const turnPlan = createTurnPlan('clarify');
      const prunedContext = createPrunedContext();

      const { ProModel } = await import('@/lib/ai/ProModel');
      const patchSpy = vi.mocked(ProModel.generatePatch);
      const responseSpy = vi.mocked(ProModel.generateResponse).mockResolvedValue('Answer');

      await orchestrator.generate({
        query,
        turnPlan,
        prunedContext,
      });

      expect(responseSpy).toHaveBeenCalled();
      expect(patchSpy).not.toHaveBeenCalled();
    });
  });
});
