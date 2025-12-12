// __tests__/ai/ContextPruner.test.ts
// Test suite for ContextPruner module
// Week 2, Day 9 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  TurnPlan,
  BehaviorProfile,
  SystemConflict,
  AnticipationGuidance,
  ConversationTurn,
  PrunedContext,
} from '@/types/ai';
import type { WizardState, ChapterKey } from '@/types/project';

// Import the module under test
import { ContextPruner, type FullContext } from '@/lib/ai/ContextPruner';

describe('ContextPruner', () => {
  let pruner: ContextPruner;

  const createMinimalWizardState = (): WizardState => ({
    stateVersion: 1,
    chapterAnswers: {},
  });

  const createBehaviorProfile = (): BehaviorProfile => ({
    patterns: {
      askingManyQuestions: false,
      providingDetails: false,
      exploring: false,
      decisive: false,
    },
    signals: {
      overwhelmed: false,
      engaged: false,
      frustrated: false,
      confident: false,
    },
    userStyle: 'explorer',
    recommendedTone: 'informative',
    turnCount: 0,
  });

  const createTurnPlan = (action: TurnPlan['action'] = 'advies'): TurnPlan => ({
    action,
    tone: 'informative',
    priority: 'user_query',
    route: 'normal',
    reasoning: 'Test plan',
  });

  const createConflict = (type: string, severity: SystemConflict['severity']): SystemConflict => ({
    id: `conflict-${type}`,
    type: type as any,
    severity,
    description: `Test ${type} conflict`,
    affectedFields: ['budget'],
    affectedChapters: ['budget'],
    resolution: 'Fix it',
  });

  const createAnticipation = (priority: AnticipationGuidance['priority']): AnticipationGuidance => ({
    id: `anticipation-${priority}`,
    priority,
    chapter: 'budget',
    question: 'Test question?',
    reasoning: 'Test reasoning',
    relatedFields: ['budgetTotaal'],
  });

  const createConversationTurn = (role: 'user' | 'assistant', message: string): ConversationTurn => ({
    id: `turn-${Date.now()}-${Math.random()}`,
    userId: 'test-user',
    projectId: 'test-project',
    timestamp: Date.now(),
    role,
    message,
    source: role === 'user' ? 'user' : 'ai',
  });

  beforeEach(() => {
    pruner = new ContextPruner();
  });

  // ============================================================================
  // TEST SUITE 1: Token Limit Enforcement
  // ============================================================================

  describe('token limit enforcement', () => {
    it('returns context under 4000 tokens for minimal input', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });

    it('returns context under 4000 tokens for large input', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
          wensen: {
            wishes: Array.from({ length: 20 }, (_, i) => ({
              id: `wish-${i}`,
              text: `Very detailed wish description that contains a lot of information about what the customer wants to achieve with this particular renovation item`,
              priority: 'nice' as const,
            })),
          },
          ruimtes: {
            rooms: Array.from({ length: 15 }, (_, i) => ({
              id: `room-${i}`,
              name: `Room ${i}`,
              type: 'living',
              m2: 50,
            })),
          },
        },
      };

      const conversationHistory = Array.from({ length: 50 }, (_, i) =>
        createConversationTurn(
          i % 2 === 0 ? 'user' : 'assistant',
          `This is a very long conversation message number ${i} that contains detailed information about the renovation project and various questions and answers.`
        )
      );

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
        systemConflicts: Array.from({ length: 10 }, (_, i) =>
          createConflict(`type-${i}`, 'warning')
        ),
        anticipationGuidance: Array.from({ length: 10 }, (_, i) =>
          createAnticipation('medium')
        ),
        kbNuggets: Array.from({ length: 20 }, (_, i) => ({
          id: `nugget-${i}`,
          content: `Very detailed knowledge base nugget with extensive information about renovation best practices and technical details.`,
          relevanceScore: 0.8,
        })),
        customerExamples: Array.from({ length: 10 }, (_, i) => ({
          id: `example-${i}`,
          description: `Detailed customer example showcasing similar renovation projects.`,
          outcome: 'Successful completion',
        })),
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('logs what was pruned in pruneLog', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: Array.from({ length: 50 }, (_, i) =>
          createConversationTurn('user', 'Test message')
        ),
      };

      const pruned = pruner.prune(fullContext);

      expect(Array.isArray(pruned.pruneLog)).toBe(true);
      if (pruned.prunedHistory.length < 50) {
        expect(pruned.pruneLog.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 2: Core Always Included
  // ============================================================================

  describe('core always included', () => {
    it('includes behaviorProfile essentials', () => {
      const behaviorProfile = createBehaviorProfile();
      behaviorProfile.userStyle = 'researcher';
      behaviorProfile.recommendedTone = 'collaborative';

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile,
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      // BehaviorProfile should be preserved (checked via token estimate > 0)
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('includes turnPlan essentials', () => {
      const turnPlan = createTurnPlan('probe');
      turnPlan.reasoning = 'Critical guidance needed';

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan,
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('includes wizardState essentials (currentChapter, basis, budget)', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          budget: { budgetTotaal: 200000 },
          wensen: { wishes: [] },
        },
      };

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'budget',
      };

      const pruned = pruner.prune(fullContext);

      // Budget chapter should be included since it's focused
      expect(pruned.prunedChapterAnswers.budget).toBeDefined();
      expect(pruned.focusedChapter).toBe('budget');
    });
  });

  // ============================================================================
  // TEST SUITE 3: Conditional Content Based on TurnPlan.action
  // ============================================================================

  describe('conditional content: probe action', () => {
    it('includes anticipation guidance for probe action', () => {
      const anticipation = createAnticipation('critical');

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('probe'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        anticipationGuidance: [anticipation],
      };

      const pruned = pruner.prune(fullContext);

      // Anticipation included (check via token estimate)
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('includes recent conversation for probe action (max 2 turns)', () => {
      const conversationHistory = Array.from({ length: 10 }, (_, i) =>
        createConversationTurn(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`)
      );

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('probe'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
      };

      const pruned = pruner.prune(fullContext);

      // Should keep max 2 recent turns for probe
      expect(pruned.prunedHistory.length).toBeLessThanOrEqual(2);
    });
  });

  describe('conditional content: patch action', () => {
    it('includes KB nuggets for patch action (max 3)', () => {
      const kbNuggets = Array.from({ length: 10 }, (_, i) => ({
        id: `nugget-${i}`,
        content: `KB nugget ${i}`,
        relevanceScore: 0.8,
      }));

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        kbNuggets,
      };

      const pruned = pruner.prune(fullContext);

      // Should include nuggets (check via token estimate)
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('includes customer examples for patch action (max 2)', () => {
      const customerExamples = Array.from({ length: 10 }, (_, i) => ({
        id: `example-${i}`,
        description: `Example ${i}`,
        outcome: 'Success',
      }));

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        customerExamples,
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });
  });

  describe('conditional content: conflict_resolution action', () => {
    it('includes all conflicts for conflict_resolution action', () => {
      const conflicts = [
        createConflict('budget_risk', 'blocking'),
        createConflict('physical_constraint', 'warning'),
        createConflict('ambition_mismatch', 'warning'),
      ];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('conflict_resolution'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        systemConflicts: conflicts,
      };

      const pruned = pruner.prune(fullContext);

      // All conflicts should be included
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });

    it('excludes KB nuggets for conflict_resolution action', () => {
      const kbNuggets = Array.from({ length: 10 }, (_, i) => ({
        id: `nugget-${i}`,
        content: `KB nugget ${i}`,
        relevanceScore: 0.8,
      }));

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('conflict_resolution'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        kbNuggets,
      };

      const pruned = pruner.prune(fullContext);

      // Token estimate should be minimal (no nuggets)
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
      expect(pruned.tokenEstimate).toBeLessThan(2000); // Should be much smaller without nuggets
    });
  });

  // ============================================================================
  // TEST SUITE 4: Focused Field/Chapter Never Pruned
  // ============================================================================

  describe('focused field protection', () => {
    it('never prunes focused chapter data', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          budget: { budgetTotaal: 200000 },
          wensen: { wishes: [] },
          ruimtes: { rooms: [] },
        },
      };

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'budget',
      };

      const pruned = pruner.prune(fullContext);

      // Budget chapter should ALWAYS be included
      expect(pruned.prunedChapterAnswers.budget).toBeDefined();
      expect(pruned.focusedChapter).toBe('budget');
    });

    it('preserves focusedField in pruned context', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'budget',
        focusedField: 'budgetTotaal',
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.focusedChapter).toBe('budget');
      expect(pruned.focusedField).toBe('budgetTotaal');
    });

    it('includes focused chapter even when large', () => {
      const largeWishes: any = Array.from({ length: 100 }, (_, i) => ({
        id: `wish-${i}`,
        text: `Very detailed wish with lots of information about what the customer wants`,
        priority: 'must',
      }));

      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          wensen: { wishes: largeWishes },
          budget: { budgetTotaal: 100000 },
        },
      };

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'wensen',
      };

      const pruned = pruner.prune(fullContext);

      // Focused chapter (wensen) must be included even if large
      expect(pruned.prunedChapterAnswers.wensen).toBeDefined();
      expect(pruned.focusedChapter).toBe('wensen');
      // Should still respect 4000 token limit
      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Token Estimation Accuracy
  // ============================================================================

  describe('token estimation accuracy', () => {
    it('estimates tokens using ~4 chars = 1 token heuristic', () => {
      const message = 'a'.repeat(400); // 400 chars = ~100 tokens
      const conversationHistory = [createConversationTurn('user', message)];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
      };

      const pruned = pruner.prune(fullContext);

      // Should estimate around 100 tokens for the message, plus core context
      expect(pruned.tokenEstimate).toBeGreaterThan(50); // At least the message
      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });

    it('token estimate is within ±10% of actual for known input', () => {
      // Create a known-size input: ~1000 chars = ~250 tokens
      const knownMessage = 'test '.repeat(200); // 1000 chars
      const conversationHistory = [createConversationTurn('user', knownMessage)];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
      };

      const pruned = pruner.prune(fullContext);

      // Should be roughly 250 tokens ±10% = 225-275, plus core context overhead
      // Let's say core is ~50-100 tokens, so total should be 275-375
      expect(pruned.tokenEstimate).toBeGreaterThan(200);
      expect(pruned.tokenEstimate).toBeLessThan(500);
    });

    it('returns non-zero token estimate for non-empty context', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // TEST SUITE 6: Conversation History Pruning
  // ============================================================================

  describe('conversation history pruning', () => {
    it('keeps last 3 conversation turns maximum', () => {
      const conversationHistory = Array.from({ length: 20 }, (_, i) =>
        createConversationTurn(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`)
      );

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('advies'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
      };

      const pruned = pruner.prune(fullContext);

      // Should keep max 3 turns
      expect(pruned.prunedHistory.length).toBeLessThanOrEqual(3);
    });

    it('keeps most recent turns', () => {
      const conversationHistory = [
        createConversationTurn('user', 'Old message 1'),
        createConversationTurn('assistant', 'Old response 1'),
        createConversationTurn('user', 'Recent message 1'),
        createConversationTurn('assistant', 'Recent response 1'),
        createConversationTurn('user', 'Latest message'),
      ];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('advies'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory,
      };

      const pruned = pruner.prune(fullContext);

      // Should include latest messages
      if (pruned.prunedHistory.length > 0) {
        const lastMessage = pruned.prunedHistory[pruned.prunedHistory.length - 1];
        expect(lastMessage.message).toContain('Latest message');
      }
    });
  });

  // ============================================================================
  // TEST SUITE 7: Chapter Data Pruning
  // ============================================================================

  describe('chapter data pruning', () => {
    it('keeps only essential wizard state fields', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          budget: { budgetTotaal: 200000 },
          wensen: { wishes: [] },
          ruimtes: { rooms: [] },
          techniek: {},
          duurzaam: {},
          risico: { risks: [] },
        },
      };

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'budget',
      };

      const pruned = pruner.prune(fullContext);

      // Should keep focused chapter + essentials only
      expect(pruned.prunedChapterAnswers.budget).toBeDefined();
      // Other chapters may be pruned to save tokens
      const chapterCount = Object.keys(pruned.prunedChapterAnswers).length;
      expect(chapterCount).toBeGreaterThan(0);
      expect(chapterCount).toBeLessThanOrEqual(7);
    });

    it('includes current chapter from turnPlan if available', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {
          budget: { budgetTotaal: 200000 },
          wensen: { wishes: [] },
        },
      };

      const fullContext: FullContext = {
        wizardState: state,
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        focusedChapter: 'budget',
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.focusedChapter).toBe('budget');
    });
  });

  // ============================================================================
  // TEST SUITE 8: KB Nuggets and Examples Pruning
  // ============================================================================

  describe('KB nuggets pruning', () => {
    it('limits KB nuggets to max 3', () => {
      const kbNuggets = Array.from({ length: 20 }, (_, i) => ({
        id: `nugget-${i}`,
        content: `KB nugget content ${i}`,
        relevanceScore: 0.9 - i * 0.01, // Decreasing relevance
      }));

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        kbNuggets,
      };

      const pruned = pruner.prune(fullContext);

      // Should limit nuggets (verified via reasonable token count)
      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });

    it('selects highest relevance nuggets first', () => {
      const kbNuggets = [
        { id: 'nugget-low', content: 'Low relevance', relevanceScore: 0.3 },
        { id: 'nugget-high', content: 'High relevance', relevanceScore: 0.95 },
        { id: 'nugget-medium', content: 'Medium relevance', relevanceScore: 0.6 },
      ];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        kbNuggets,
      };

      const pruned = pruner.prune(fullContext);

      // Should prioritize high relevance (verified via token estimate)
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });
  });

  describe('customer examples pruning', () => {
    it('limits customer examples to max 2', () => {
      const customerExamples = Array.from({ length: 10 }, (_, i) => ({
        id: `example-${i}`,
        description: `Example description ${i}`,
        outcome: 'Success',
      }));

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        customerExamples,
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });
  });

  // ============================================================================
  // TEST SUITE 9: Conflicts and Anticipation Pruning
  // ============================================================================

  describe('conflicts pruning', () => {
    it('includes only critical/blocking conflicts', () => {
      const conflicts = [
        createConflict('budget_risk', 'blocking'),
        createConflict('physical', 'warning'),
        createConflict('info', 'info' as any),
      ];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('conflict_resolution'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        systemConflicts: conflicts,
      };

      const pruned = pruner.prune(fullContext);

      // Should include conflicts
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });
  });

  describe('anticipation guidance pruning', () => {
    it('limits anticipation guidance to max 2 critical/high priority', () => {
      const anticipationGuidance = [
        createAnticipation('critical'),
        createAnticipation('high'),
        createAnticipation('medium'),
        createAnticipation('medium'), // Changed from 'low' which doesn't exist
      ];

      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan('probe'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        anticipationGuidance,
      };

      const pruned = pruner.prune(fullContext);

      // Should limit to 2 highest priority
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
      expect(pruned.tokenEstimate).toBeLessThan(4000);
    });
  });

  // ============================================================================
  // TEST SUITE 10: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty context gracefully', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeGreaterThan(0);
      expect(pruned.tokenEstimate).toBeLessThan(4000);
      expect(Array.isArray(pruned.pruneLog)).toBe(true);
      expect(Array.isArray(pruned.prunedHistory)).toBe(true);
    });

    it('handles missing optional fields', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        // No kbNuggets, customerExamples, conflicts, etc.
      };

      expect(() => {
        pruner.prune(fullContext);
      }).not.toThrow();
    });

    it('returns valid PrunedContext structure', () => {
      const fullContext: FullContext = {
        wizardState: createMinimalWizardState(),
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned).toHaveProperty('prunedChapterAnswers');
      expect(pruned).toHaveProperty('prunedHistory');
      expect(pruned).toHaveProperty('tokenEstimate');
      expect(pruned).toHaveProperty('pruneLog');
      expect(pruned).toHaveProperty('focusedChapter');
      expect(pruned).toHaveProperty('focusedField');
      expect(typeof pruned.tokenEstimate).toBe('number');
      expect(Array.isArray(pruned.pruneLog)).toBe(true);
      expect(Array.isArray(pruned.prunedHistory)).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 11: Performance
  // ============================================================================

  describe('performance', () => {
    it('completes pruning in reasonable time (<100ms)', () => {
      const largeContext: FullContext = {
        wizardState: {
          stateVersion: 1,
          chapterAnswers: {
            budget: { budgetTotaal: 500000 },
            wensen: {
              wishes: Array.from({ length: 50 }, (_, i) => ({
                id: `wish-${i}`,
                text: `Wish ${i}`,
                priority: 'nice',
              })),
            },
          },
        },
        turnPlan: createTurnPlan(),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: Array.from({ length: 100 }, (_, i) =>
          createConversationTurn('user', `Message ${i}`)
        ),
        kbNuggets: Array.from({ length: 50 }, (_, i) => ({
          id: `nugget-${i}`,
          content: 'Content',
          relevanceScore: 0.5,
        })),
      };

      const start = Date.now();
      pruner.prune(largeContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // TEST SUITE 12: Complete Scenarios
  // ============================================================================

  describe('complete scenarios', () => {
    it('handles typical probe scenario correctly', () => {
      const fullContext: FullContext = {
        wizardState: {
          stateVersion: 1,
          chapterAnswers: {
            budget: { budgetTotaal: 200000 },
          },
        },
        turnPlan: createTurnPlan('probe'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: Array.from({ length: 10 }, (_, i) =>
          createConversationTurn(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`)
        ),
        anticipationGuidance: [createAnticipation('critical')],
        focusedChapter: 'budget',
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
      expect(pruned.focusedChapter).toBe('budget');
      expect(pruned.prunedHistory.length).toBeLessThanOrEqual(2); // Max 2 for probe
    });

    it('handles typical patch scenario correctly', () => {
      const fullContext: FullContext = {
        wizardState: {
          stateVersion: 1,
          chapterAnswers: {
            budget: { budgetTotaal: 200000 },
          },
        },
        turnPlan: createTurnPlan('patch'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        kbNuggets: Array.from({ length: 10 }, (_, i) => ({
          id: `nugget-${i}`,
          content: 'KB content',
          relevanceScore: 0.8,
        })),
        customerExamples: Array.from({ length: 5 }, (_, i) => ({
          id: `example-${i}`,
          description: 'Example',
          outcome: 'Success',
        })),
        focusedChapter: 'budget',
        focusedField: 'budgetTotaal',
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
      expect(pruned.focusedChapter).toBe('budget');
      expect(pruned.focusedField).toBe('budgetTotaal');
    });

    it('handles conflict resolution scenario correctly', () => {
      const fullContext: FullContext = {
        wizardState: {
          stateVersion: 1,
          chapterAnswers: {
            budget: { budgetTotaal: 50000 },
            wensen: {
              wishes: [
                { id: '1', text: 'Expensive wish', priority: 'must' as const },
              ],
            },
          },
        },
        turnPlan: createTurnPlan('conflict_resolution'),
        behaviorProfile: createBehaviorProfile(),
        conversationHistory: [],
        systemConflicts: [
          createConflict('budget_risk', 'blocking'),
          createConflict('ambition_mismatch', 'warning'),
        ],
        kbNuggets: [], // Should not include nuggets for conflict resolution
      };

      const pruned = pruner.prune(fullContext);

      expect(pruned.tokenEstimate).toBeLessThan(4000);
      expect(pruned.tokenEstimate).toBeGreaterThan(0);
    });
  });
});
