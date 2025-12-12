// __tests__/ai/TurnPlanner.test.ts
// Test suite for TurnPlanner module
// Week 2, Day 8 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  TurnPlan,
  SystemConflict,
  AnticipationGuidance,
  BehaviorProfile,
} from '@/types/ai';
import { TurnPlanner } from '@/lib/ai/TurnPlanner';

describe('TurnPlanner', () => {
  let planner: TurnPlanner;

  // Helper to create default behavior profile
  const createBehaviorProfile = (overrides?: Partial<BehaviorProfile>): BehaviorProfile => ({
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
    turnCount: 5,
    ...overrides,
  });

  // Helper to create system conflict
  const createConflict = (
    type: SystemConflict['type'],
    severity: SystemConflict['severity']
  ): SystemConflict => ({
    id: `conflict-${Math.random()}`,
    type,
    severity,
    description: 'Test conflict',
    affectedFields: ['test.field'],
    affectedChapters: ['budget'],
    resolution: 'Test resolution',
  });

  // Helper to create anticipation guidance
  const createGuidance = (priority: 'critical' | 'high' | 'medium'): AnticipationGuidance => ({
    id: `guidance-${Math.random()}`,
    priority,
    chapter: 'budget',
    question: 'Test question?',
    reasoning: 'Test reasoning',
    relatedFields: ['budget.budgetTotaal'],
  });

  beforeEach(() => {
    planner = new TurnPlanner();
  });

  // ============================================================================
  // TEST SUITE 1: Priority Matrix - Blocking Conflicts (Highest Priority)
  // ============================================================================

  describe('priority: blocking conflicts', () => {
    it('prioritizes blocking conflict over everything else', () => {
      const blockingConflict = createConflict('budget_risk', 'blocking');
      const criticalGuidance = createGuidance('critical');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [blockingConflict],
        anticipationGuidance: criticalGuidance,
        behaviorProfile,
        userMessage: 'Wat kost dit?',
      });

      expect(plan.action).toBe('conflict_resolution');
      expect(plan.priority).toBe('system_conflict');
      expect(plan.systemConflicts).toContain(blockingConflict);
      expect(plan.reasoning).toContain('blocking');
    });

    it('sets route to guard_required for blocking conflicts', () => {
      const blockingConflict = createConflict('physical_constraint', 'blocking');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [blockingConflict],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.route).toBe('guard_required');
    });

    it('uses supportive tone when user is overwhelmed with blocking conflict', () => {
      const blockingConflict = createConflict('budget_risk', 'blocking');
      const behaviorProfile = createBehaviorProfile({
        signals: { overwhelmed: true, engaged: false, frustrated: false, confident: false },
        recommendedTone: 'supportive',
      });

      const plan = planner.plan({
        systemConflicts: [blockingConflict],
        behaviorProfile,
        userMessage: 'Help',
      });

      expect(plan.tone).toBe('supportive');
    });
  });

  // ============================================================================
  // TEST SUITE 2: Priority Matrix - Critical Anticipation
  // ============================================================================

  describe('priority: critical anticipation', () => {
    it('prioritizes critical anticipation when no blocking conflicts', () => {
      const criticalGuidance = createGuidance('critical');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        anticipationGuidance: criticalGuidance,
        behaviorProfile,
        userMessage: 'Ik ga beginnen',
      });

      expect(plan.action).toBe('probe');
      expect(plan.priority).toBe('anticipation');
      expect(plan.anticipationGuidance).toEqual(criticalGuidance);
    });

    it('uses critical anticipation over warning conflicts', () => {
      const warningConflict = createConflict('ambition_mismatch', 'warning');
      const criticalGuidance = createGuidance('critical');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [warningConflict],
        anticipationGuidance: criticalGuidance,
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.action).toBe('probe');
      expect(plan.priority).toBe('anticipation');
    });

    it('sets route to normal for critical anticipation', () => {
      const criticalGuidance = createGuidance('critical');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        anticipationGuidance: criticalGuidance,
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.route).toBe('normal');
    });
  });

  // ============================================================================
  // TEST SUITE 3: Priority Matrix - Warning Conflicts
  // ============================================================================

  describe('priority: warning conflicts', () => {
    it('addresses warning conflicts when no critical items', () => {
      const warningConflict = createConflict('must_have_unsatisfied', 'warning');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [warningConflict],
        behaviorProfile,
        userMessage: 'Hoe zit het met mijn budget?',
      });

      expect(plan.action).toBe('conflict_resolution');
      expect(plan.priority).toBe('system_conflict');
      expect(plan.systemConflicts).toContain(warningConflict);
    });

    it('sets route to guard_required for warning conflicts', () => {
      const warningConflict = createConflict('ambition_mismatch', 'warning');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [warningConflict],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.route).toBe('guard_required');
    });
  });

  // ============================================================================
  // TEST SUITE 4: Priority Matrix - High Priority Anticipation
  // ============================================================================

  describe('priority: high priority anticipation', () => {
    it('uses high priority anticipation when no conflicts or critical guidance', () => {
      const highGuidance = createGuidance('high');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        anticipationGuidance: highGuidance,
        behaviorProfile,
        userMessage: 'Wat nu?',
      });

      expect(plan.action).toBe('probe');
      expect(plan.priority).toBe('anticipation');
      expect(plan.anticipationGuidance).toEqual(highGuidance);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Normal User Queries - Data Input
  // ============================================================================

  describe('normal queries: data input', () => {
    it('detects data input intent and sets action to patch', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: false,
          providingDetails: true,
          exploring: false,
          decisive: true,
        },
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Mijn budget is €250.000 en ik wil 3 slaapkamers van elk 12m2',
      });

      expect(plan.action).toBe('patch');
      expect(plan.priority).toBe('user_query');
      expect(plan.route).toBe('guard_required');
    });

    it('uses directive tone for decisive data providers', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: false,
          providingDetails: true,
          exploring: false,
          decisive: true,
        },
        userStyle: 'doer',
        recommendedTone: 'directive',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Budget: €200k, start: maart',
      });

      expect(plan.tone).toBe('directive');
    });
  });

  // ============================================================================
  // TEST SUITE 6: Normal User Queries - Advice Request
  // ============================================================================

  describe('normal queries: advice request', () => {
    it('detects advice request and sets action to advies', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: true,
          providingDetails: false,
          exploring: true,
          decisive: false,
        },
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Wat raad je me aan voor verwarming? Warmtepomp of gas?',
      });

      expect(plan.action).toBe('advies');
      expect(plan.priority).toBe('user_query');
      expect(plan.route).toBe('normal');
    });

    it('uses informative tone for explorers asking advice', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: true,
          providingDetails: false,
          exploring: true,
          decisive: false,
        },
        userStyle: 'explorer',
        recommendedTone: 'informative',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Wat zijn de opties?',
      });

      expect(plan.tone).toBe('informative');
    });
  });

  // ============================================================================
  // TEST SUITE 7: Tone Adaptation Based on Behavior
  // ============================================================================

  describe('tone adaptation', () => {
    it('uses supportive tone when user is overwhelmed', () => {
      const behaviorProfile = createBehaviorProfile({
        signals: { overwhelmed: true, engaged: false, frustrated: false, confident: false },
        recommendedTone: 'supportive',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Dit is te moeilijk',
      });

      expect(plan.tone).toBe('supportive');
    });

    it('uses directive tone for confident doers', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: false,
          providingDetails: true,
          exploring: false,
          decisive: true,
        },
        userStyle: 'doer',
        recommendedTone: 'directive',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Ik wil vloerverwarming, punt uit',
      });

      expect(plan.tone).toBe('directive');
    });

    it('uses collaborative tone for researchers', () => {
      const behaviorProfile = createBehaviorProfile({
        signals: { overwhelmed: false, engaged: true, frustrated: false, confident: true },
        userStyle: 'researcher',
        recommendedTone: 'collaborative',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Volgens mijn berekening heb ik RC 6.0 nodig',
      });

      expect(plan.tone).toBe('collaborative');
    });

    it('uses informative tone by default', () => {
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Vertel me meer',
      });

      expect(plan.tone).toBe('informative');
    });
  });

  // ============================================================================
  // TEST SUITE 8: Multiple Conflicts - Severity Sorting
  // ============================================================================

  describe('multiple conflicts', () => {
    it('prioritizes blocking over warning when multiple conflicts exist', () => {
      const blockingConflict = createConflict('budget_risk', 'blocking');
      const warningConflict = createConflict('ambition_mismatch', 'warning');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [warningConflict, blockingConflict],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.action).toBe('conflict_resolution');
      expect(plan.systemConflicts?.[0]).toEqual(blockingConflict);
    });

    it('includes all conflicts sorted by severity', () => {
      const blocking1 = createConflict('budget_risk', 'blocking');
      const blocking2 = createConflict('physical_constraint', 'blocking');
      const warning = createConflict('ambition_mismatch', 'warning');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [warning, blocking2, blocking1],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.systemConflicts).toHaveLength(3);
      expect(plan.systemConflicts?.[0].severity).toBe('blocking');
      expect(plan.systemConflicts?.[1].severity).toBe('blocking');
      expect(plan.systemConflicts?.[2].severity).toBe('warning');
    });
  });

  // ============================================================================
  // TEST SUITE 9: Reasoning Quality
  // ============================================================================

  describe('reasoning quality', () => {
    it('provides clear reasoning for blocking conflict decision', () => {
      const blockingConflict = createConflict('budget_risk', 'blocking');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [blockingConflict],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.reasoning).toBeTruthy();
      expect(plan.reasoning.length).toBeGreaterThan(20);
      expect(plan.reasoning.toLowerCase()).toContain('blocking');
    });

    it('provides clear reasoning for anticipation decision', () => {
      const criticalGuidance = createGuidance('critical');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        anticipationGuidance: criticalGuidance,
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.reasoning).toBeTruthy();
      expect(plan.reasoning.toLowerCase()).toContain('critical');
    });

    it('provides clear reasoning for normal query', () => {
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Wat zijn de opties?',
      });

      expect(plan.reasoning).toBeTruthy();
      expect(plan.reasoning.length).toBeGreaterThan(10);
    });
  });

  // ============================================================================
  // TEST SUITE 10: Route Assignment
  // ============================================================================

  describe('route assignment', () => {
    it('assigns guard_required for data patches', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: false,
          providingDetails: true,
          exploring: false,
          decisive: true,
        },
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Budget is €200.000',
      });

      expect(plan.route).toBe('guard_required');
    });

    it('assigns normal for advice requests', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: true,
          providingDetails: false,
          exploring: true,
          decisive: false,
        },
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Wat raad je aan?',
      });

      expect(plan.route).toBe('normal');
    });

    it('assigns guard_required for conflict resolution', () => {
      const conflict = createConflict('budget_risk', 'blocking');
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        systemConflicts: [conflict],
        behaviorProfile,
        userMessage: 'Test',
      });

      expect(plan.route).toBe('guard_required');
    });
  });

  // ============================================================================
  // TEST SUITE 11: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty inputs gracefully', () => {
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        behaviorProfile,
        userMessage: '',
      });

      expect(plan).toHaveProperty('action');
      expect(plan).toHaveProperty('tone');
      expect(plan).toHaveProperty('priority');
      expect(plan).toHaveProperty('route');
      expect(plan).toHaveProperty('reasoning');
    });

    it('handles missing conflicts and guidance', () => {
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Test message',
      });

      expect(plan.action).toBe('advies');
      expect(plan.priority).toBe('user_query');
    });

    it('handles null or undefined behavior profile gracefully', () => {
      expect(() => {
        planner.plan({
          behaviorProfile: null as any,
          userMessage: 'Test',
        });
      }).not.toThrow();
    });

    it('returns valid plan for minimal input', () => {
      const behaviorProfile = createBehaviorProfile();

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Hi',
      });

      expect(plan.action).toBeDefined();
      expect(plan.tone).toBeDefined();
      expect(plan.priority).toBeDefined();
      expect(plan.route).toBeDefined();
      expect(plan.reasoning).toBeDefined();
    });
  });

  // ============================================================================
  // TEST SUITE 12: Complete Scenarios
  // ============================================================================

  describe('complete scenarios', () => {
    it('starter user with blocking conflict gets supportive conflict resolution', () => {
      const blockingConflict = createConflict('budget_risk', 'blocking');
      const behaviorProfile = createBehaviorProfile({
        signals: { overwhelmed: true, engaged: false, frustrated: false, confident: false },
        recommendedTone: 'supportive',
      });

      const plan = planner.plan({
        systemConflicts: [blockingConflict],
        behaviorProfile,
        userMessage: 'Help, wat nu?',
      });

      expect(plan.action).toBe('conflict_resolution');
      expect(plan.tone).toBe('supportive');
      expect(plan.priority).toBe('system_conflict');
      expect(plan.route).toBe('guard_required');
    });

    it('experienced user providing data gets directive patch action', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: false,
          providingDetails: true,
          exploring: false,
          decisive: true,
        },
        userStyle: 'doer',
        recommendedTone: 'directive',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Budget €250k, 3 slaapkamers, start maart',
      });

      expect(plan.action).toBe('patch');
      expect(plan.tone).toBe('directive');
      expect(plan.priority).toBe('user_query');
      expect(plan.route).toBe('guard_required');
    });

    it('researcher asking for advice gets collaborative informative response', () => {
      const behaviorProfile = createBehaviorProfile({
        patterns: {
          askingManyQuestions: true,
          providingDetails: false,
          exploring: true,
          decisive: false,
        },
        signals: { overwhelmed: false, engaged: true, frustrated: false, confident: true },
        userStyle: 'researcher',
        recommendedTone: 'collaborative',
      });

      const plan = planner.plan({
        behaviorProfile,
        userMessage: 'Wat zijn de verschillen tussen RC 4.5 en RC 6.0?',
      });

      expect(plan.action).toBe('advies');
      expect(plan.tone).toBe('collaborative');
      expect(plan.priority).toBe('user_query');
    });
  });
});
