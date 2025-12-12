// __tests__/ai/SystemIntelligence.test.ts
// Test suite for SystemIntelligence module
// Week 1, Day 5 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type { SystemConflict } from '@/types/ai';
import type { WizardState } from '@/types/project';

// Import the module under test
import { SystemIntelligence } from '@/lib/ai/SystemIntelligence';

describe('SystemIntelligence', () => {
  let intelligence: SystemIntelligence;

  const createBaseState = (): WizardState => ({
    stateVersion: 1,
    chapterAnswers: {},
  });

  beforeEach(() => {
    intelligence = new SystemIntelligence();
  });

  // ============================================================================
  // TEST SUITE 1: Budget Risk Detection
  // ============================================================================

  describe('budget risk detection', () => {
    it('detects budget_risk when budget is too low for must-haves', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 50000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Nieuwe keuken', priority: 'must', estimatedCost: 30000 } as any,
              { id: '2', text: 'Nieuwe badkamer', priority: 'must', estimatedCost: 25000 } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const budgetRisk = conflicts.find((c: SystemConflict) => c.type === 'budget_risk');
      expect(budgetRisk).toBeDefined();
      expect(budgetRisk?.severity).toBe('blocking');
    });

    it('returns no budget_risk when budget is sufficient', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 150000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Nieuwe keuken', priority: 'must', estimatedCost: 30000 } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const budgetRisk = conflicts.find((c: SystemConflict) => c.type === 'budget_risk');
      expect(budgetRisk).toBeUndefined();
    });
  });

  // ============================================================================
  // TEST SUITE 2: Must-Have Satisfaction
  // ============================================================================

  describe('must-have satisfaction', () => {
    it('detects must_have_unsatisfied when critical wishes have no budget', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          wensen: {
            wishes: [
              { id: '1', text: 'Veilige trap', priority: 'must' } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const mustHave = conflicts.find((c: SystemConflict) => c.type === 'must_have_unsatisfied');
      expect(mustHave).toBeDefined();
      expect(mustHave?.severity).toBe('warning');
    });
  });

  // ============================================================================
  // TEST SUITE 3: Physical Constraints
  // ============================================================================

  describe('physical constraints', () => {
    it('detects physical_constraint for impossible room sizes', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          ruimtes: {
            rooms: [
              { id: '1', name: 'Woonkamer', type: 'living', m2: 150 },
              { id: '2', name: 'Keuken', type: 'kitchen', m2: 80 },
            ],
            totalArea: 100,
          } as any,
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const physical = conflicts.find((c: SystemConflict) => c.type === 'physical_constraint');
      expect(physical).toBeDefined();
      expect(physical?.severity).toBe('blocking');
    });
  });

  // ============================================================================
  // TEST SUITE 4: Ambition Mismatch
  // ============================================================================

  describe('ambition mismatch', () => {
    it('detects ambition_mismatch when wishes exceed budget significantly', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 100000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Luxe keuken', priority: 'nice', estimatedCost: 50000 } as any,
              { id: '2', text: 'Smart home', priority: 'nice', estimatedCost: 40000 } as any,
              { id: '3', text: 'Zwembad', priority: 'nice', estimatedCost: 80000 } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const ambition = conflicts.find((c: SystemConflict) => c.type === 'ambition_mismatch');
      expect(ambition).toBeDefined();
      expect(ambition?.severity).toBe('warning');
    });
  });

  // ============================================================================
  // TEST SUITE 5: Conflict Properties
  // ============================================================================

  describe('conflict properties', () => {
    it('returns conflicts with all required fields', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 50000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 60000 } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      if (conflicts.length > 0) {
        const conflict = conflicts[0];
        expect(conflict).toHaveProperty('id');
        expect(conflict).toHaveProperty('type');
        expect(conflict).toHaveProperty('severity');
        expect(conflict).toHaveProperty('description');
        expect(conflict).toHaveProperty('affectedFields');
        expect(conflict).toHaveProperty('affectedChapters');
        expect(conflict).toHaveProperty('resolution');
        expect(Array.isArray(conflict.affectedFields)).toBe(true);
        expect(Array.isArray(conflict.affectedChapters)).toBe(true);
      }
    });

    it('includes estimatedCost for budget conflicts', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 50000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 60000 } as any,
            ],
          },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      const budgetRisk = conflicts.find((c: SystemConflict) => c.type === 'budget_risk');
      if (budgetRisk) {
        expect(budgetRisk.estimatedCost).toBeDefined();
        expect(typeof budgetRisk.estimatedCost).toBe('number');
      }
    });
  });

  // ============================================================================
  // TEST SUITE 6: Multiple Conflicts
  // ============================================================================

  describe('multiple conflicts', () => {
    it('can detect multiple conflicts simultaneously', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 50000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 40000 } as any,
              { id: '2', text: 'Badkamer', priority: 'must', estimatedCost: 30000 } as any,
            ],
          },
          ruimtes: {
            rooms: [{ id: '1', name: 'Grote hal', type: 'hallway', m2: 200 }],
            totalArea: 100,
          } as any,
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      expect(conflicts.length).toBeGreaterThan(1);
      const types = conflicts.map((c: SystemConflict) => c.type);
      expect(types.includes('budget_risk')).toBe(true);
      expect(types.includes('physical_constraint')).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 7: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('returns empty array for clean state', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
          wensen: { wishes: [] },
          ruimtes: { rooms: [] },
        },
      };

      const conflicts = intelligence.detectConflicts(state);

      expect(conflicts).toEqual([]);
    });

    it('handles missing chapters gracefully', () => {
      const state = createBaseState();

      expect(() => {
        intelligence.detectConflicts(state);
      }).not.toThrow();
    });

    it('handles undefined values gracefully', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: {},
          wensen: { wishes: [] },
        },
      };

      expect(() => {
        intelligence.detectConflicts(state);
      }).not.toThrow();
    });
  });
});
