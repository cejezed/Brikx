// lib/ai/helpers/projectAnalysis.ts
// Week 1, Day 5 - Project Analysis Helper
// Purpose: Analyze project completeness, costs, and risk levels

import type { WizardState, ChapterKey } from '@/types/project';

/**
 * Risk level for the project
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Complete project analysis result
 */
export interface ProjectAnalysis {
  completeness: number;
  estimatedCost: number;
  riskLevel: RiskLevel;
  conflictCount: number;
  recommendations: string[];
}

/**
 * Calculate project completeness as a percentage (0-100).
 *
 * @param state - Current wizard state
 * @returns Completeness percentage
 */
export function calculateProjectCompleteness(state: WizardState): number {
  try {
    const chapterAnswers = state.chapterAnswers || {};
    // Weighted completeness per chapter (sums to 100)
    const chapterWeights: Partial<Record<ChapterKey, number>> = {
      basis: 25,
      ruimtes: 20,
      wensen: 20,
      budget: 20,
      techniek: 15,
    };

    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length >= 0; // presence counts as filled
      if (typeof value === 'object') return true; // any object present counts as filled
      if (typeof value === 'number') return Number.isFinite(value);
      if (typeof value === 'string') return value.trim().length >= 0;
      return true;
    };

    let totalWeight = 0;
    let filledWeight = 0;
    for (const [chapter, weight] of Object.entries(chapterWeights) as [ChapterKey, number][]) {
      totalWeight += weight;
      const filled = isFilled((chapterAnswers as any)[chapter]);
      if (filled) {
        filledWeight += weight;
      }
    }

    const completeness = totalWeight === 0 ? 0 : Math.round((filledWeight / totalWeight) * 100);

    return Math.min(100, completeness);
  } catch (error) {
    console.error('[projectAnalysis.calculateProjectCompleteness] Error:', error);
    return 0;
  }
}

/**
 * Estimate total cost of all wishes.
 *
 * @param state - Current wizard state
 * @returns Total estimated cost
 */
export function estimateTotalCost(state: WizardState): number {
  try {
    const wensen = (state.chapterAnswers.wensen as any)?.wishes;

    if (!wensen || !Array.isArray(wensen)) {
      return 0;
    }

    return wensen.reduce(
      (sum: number, wish: any) => sum + (wish.estimatedCost || 0),
      0
    );
  } catch (error) {
    console.error('[projectAnalysis.estimateTotalCost] Error:', error);
    return 0;
  }
}

/**
 * Analyze risk level based on budget, wishes, and physical constraints.
 *
 * @param state - Current wizard state
 * @returns Risk level (low, medium, high)
 */
export function analyzeRiskLevel(state: WizardState): RiskLevel {
  try {
    const budget = (state.chapterAnswers.budget as any)?.budgetTotaal;
    const wensen = (state.chapterAnswers.wensen as any)?.wishes;
    const ruimtes = state.chapterAnswers.ruimtes as any;

    // Check physical constraints first (highest priority)
    if (ruimtes && ruimtes.rooms && Array.isArray(ruimtes.rooms) && ruimtes.totalArea) {
      const totalRoomSize = ruimtes.rooms.reduce(
        (sum: number, room: any) => sum + (room.m2 || 0),
        0
      );

      if (totalRoomSize > ruimtes.totalArea) {
        return 'high';
      }
    }

    // Check budget vs must-haves
    if (budget && wensen && Array.isArray(wensen)) {
      const mustHaveCost = wensen
        .filter((wish: any) => wish.priority === 'must')
        .reduce((sum: number, wish: any) => sum + (wish.estimatedCost || 0), 0);

      if (mustHaveCost === 0) {
        // No costs set yet
        return 'low';
      }

      if (mustHaveCost > budget) {
        // Budget insufficient for must-haves
        return 'high';
      }

      // Calculate budget utilization
      const utilization = mustHaveCost / budget;

      if (utilization > 0.85) {
        // Budget is tight (>85% used by must-haves alone)
        return 'medium';
      }

      return 'low';
    }

    // Default: no risks detected
    return 'low';
  } catch (error) {
    console.error('[projectAnalysis.analyzeRiskLevel] Error:', error);
    return 'low';
  }
}

/**
 * Perform a complete project analysis.
 *
 * @param state - Current wizard state
 * @param conflictCount - Number of conflicts detected by SystemIntelligence
 * @returns Complete project analysis
 */
export function analyzeProject(state: WizardState, conflictCount: number = 0): ProjectAnalysis {
  try {
    const completeness = calculateProjectCompleteness(state);
    const estimatedCost = estimateTotalCost(state);
    const riskLevel = analyzeRiskLevel(state);

    const recommendations: string[] = [];

    // Generate recommendations based on analysis
    if (completeness < 50) {
      recommendations.push('Vul meer hoofdstukken in om een compleet beeld te krijgen.');
    }

    if (riskLevel === 'high') {
      recommendations.push('Er zijn blokkerende risico\'s gedetecteerd. Los deze eerst op.');
    } else if (riskLevel === 'medium') {
      recommendations.push('Let op: het budget is krap. Overweeg een buffer voor onvoorziene kosten.');
    }

    if (conflictCount > 0) {
      recommendations.push(`Er zijn ${conflictCount} conflicten gedetecteerd. Bekijk de details voor meer informatie.`);
    }

    const budget = (state.chapterAnswers.budget as any)?.budgetTotaal;
    if (budget && estimatedCost > budget) {
      recommendations.push(`De geschatte kosten (€${estimatedCost.toLocaleString()}) overschrijden het budget (€${budget.toLocaleString()}).`);
    }

    return {
      completeness,
      estimatedCost,
      riskLevel,
      conflictCount,
      recommendations,
    };
  } catch (error) {
    console.error('[projectAnalysis.analyzeProject] Error:', error);
    return {
      completeness: 0,
      estimatedCost: 0,
      riskLevel: 'low',
      conflictCount: 0,
      recommendations: ['Er is een fout opgetreden bij het analyseren van het project.'],
    };
  }
}
