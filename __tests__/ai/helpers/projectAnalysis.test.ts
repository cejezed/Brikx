// __tests__/ai/helpers/projectAnalysis.test.ts
// Test suite for projectAnalysis helper functions
// Week 1, Day 5 - Test-First Development

import { describe, it, expect } from 'vitest';
import type { WizardState } from '@/types/project';
import {
  calculateProjectCompleteness,
  estimateTotalCost,
  analyzeRiskLevel,
  type ProjectAnalysis,
} from '@/lib/ai/helpers/projectAnalysis';

describe('projectAnalysis helpers', () => {
  const createBaseState = (): WizardState => ({
    stateVersion: 1,
    chapterAnswers: {},
  });

  // ============================================================================
  // TEST SUITE 1: Project Completeness
  // ============================================================================

  describe('calculateProjectCompleteness', () => {
    it('returns 0% for empty state', () => {
      const state = createBaseState();

      const completeness = calculateProjectCompleteness(state);

      expect(completeness).toBe(0);
    });

    it('returns 25% when only basis chapter is filled', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
        },
      };

      const completeness = calculateProjectCompleteness(state);

      expect(completeness).toBeGreaterThanOrEqual(20);
      expect(completeness).toBeLessThanOrEqual(30);
    });

    it('returns 100% when all chapters are filled', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
          ruimtes: { rooms: [{ id: '1', name: 'Keuken', type: 'kitchen', m2: 20 }] },
          wensen: { wishes: [{ id: '1', text: 'Keuken', priority: 'must' }] },
          budget: { budgetTotaal: 500000 },
          techniek: {},
        },
      };

      const completeness = calculateProjectCompleteness(state);

      expect(completeness).toBe(100);
    });

    it('handles partially filled chapters', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          budget: { budgetTotaal: 100000 },
        },
      };

      const completeness = calculateProjectCompleteness(state);

      expect(completeness).toBeGreaterThan(0);
      expect(completeness).toBeLessThan(100);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Total Cost Estimation
  // ============================================================================

  describe('estimateTotalCost', () => {
    it('returns 0 when no wishes have costs', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must' },
              { id: '2', text: 'Badkamer', priority: 'nice' },
            ],
          },
        },
      };

      const totalCost = estimateTotalCost(state);

      expect(totalCost).toBe(0);
    });

    it('sums all wish costs correctly', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 30000 } as any,
              { id: '2', text: 'Badkamer', priority: 'must', estimatedCost: 25000 } as any,
              { id: '3', text: 'Zwembad', priority: 'nice', estimatedCost: 50000 } as any,
            ],
          },
        },
      };

      const totalCost = estimateTotalCost(state);

      expect(totalCost).toBe(105000);
    });

    it('handles missing wensen chapter', () => {
      const state = createBaseState();

      const totalCost = estimateTotalCost(state);

      expect(totalCost).toBe(0);
    });

    it('handles empty wishes array', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          wensen: { wishes: [] },
        },
      };

      const totalCost = estimateTotalCost(state);

      expect(totalCost).toBe(0);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Risk Level Analysis
  // ============================================================================

  describe('analyzeRiskLevel', () => {
    it('returns LOW risk for balanced budget and wishes', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 30000 } as any,
              { id: '2', text: 'Badkamer', priority: 'must', estimatedCost: 25000 } as any,
            ],
          },
        },
      };

      const riskLevel = analyzeRiskLevel(state);

      expect(riskLevel).toBe('low');
    });

    it('returns HIGH risk when budget is insufficient for must-haves', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 50000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 30000 } as any,
              { id: '2', text: 'Badkamer', priority: 'must', estimatedCost: 40000 },
            ],
          },
        },
      };

      const riskLevel = analyzeRiskLevel(state);

      expect(riskLevel).toBe('high');
    });

    it('returns MEDIUM risk when budget is tight but sufficient', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 60000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must', estimatedCost: 30000 } as any,
              { id: '2', text: 'Badkamer', priority: 'must', estimatedCost: 25000 } as any,
            ],
          },
        },
      };

      const riskLevel = analyzeRiskLevel(state);

      expect(riskLevel).toBe('medium');
    });

    it('returns LOW risk when no budget or wishes are set', () => {
      const state = createBaseState();

      const riskLevel = analyzeRiskLevel(state);

      expect(riskLevel).toBe('low');
    });

    it('returns HIGH risk when physical constraints are violated', () => {
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

      const riskLevel = analyzeRiskLevel(state);

      expect(riskLevel).toBe('high');
    });
  });

  // ============================================================================
  // TEST SUITE 4: Full Project Analysis
  // ============================================================================

  describe('ProjectAnalysis type', () => {
    it('has all required fields', () => {
      const analysis: ProjectAnalysis = {
        completeness: 75,
        estimatedCost: 250000,
        riskLevel: 'medium',
        conflictCount: 1,
        recommendations: ['Verhoog het budget met €10.000'],
      };

      expect(analysis).toHaveProperty('completeness');
      expect(analysis).toHaveProperty('estimatedCost');
      expect(analysis).toHaveProperty('riskLevel');
      expect(analysis).toHaveProperty('conflictCount');
      expect(analysis).toHaveProperty('recommendations');
    });
  });

  // ============================================================================
  // TEST SUITE 5: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles undefined chapterAnswers gracefully', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {},
      };

      expect(() => calculateProjectCompleteness(state)).not.toThrow();
      expect(() => estimateTotalCost(state)).not.toThrow();
      expect(() => analyzeRiskLevel(state)).not.toThrow();
    });

    it('handles malformed data gracefully', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: -1000 },
          wensen: { wishes: null as any },
        },
      };

      expect(() => calculateProjectCompleteness(state)).not.toThrow();
      expect(() => estimateTotalCost(state)).not.toThrow();
      expect(() => analyzeRiskLevel(state)).not.toThrow();
    });

    it('handles very large numbers correctly', () => {
      const state: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 10000000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Villa', priority: 'must', estimatedCost: 5000000 } as any,
            ],
          },
        },
      };

      const totalCost = estimateTotalCost(state);
      expect(totalCost).toBe(5000000);

      const riskLevel = analyzeRiskLevel(state);
      expect(riskLevel).toBe('low');
    });
  });
});
