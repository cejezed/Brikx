// lib/ai/SystemIntelligence.ts
// Week 1, Day 5 - SystemIntelligence Module
// Purpose: Detect conflicts and inconsistencies in WizardState

import type { WizardState } from '@/types/project';
import type { SystemConflict } from '@/types/ai';

/**
 * SystemIntelligence - Conflict Detection System
 *
 * Responsibilities:
 * - Detect budget risks (insufficient funds for must-haves)
 * - Detect must-have satisfaction issues (critical wishes without budget)
 * - Detect physical constraints (room sizes exceeding available area)
 * - Detect ambition mismatches (wishes significantly exceeding budget)
 *
 * Performance target: <100ms for detectConflicts()
 * Never throws errors - returns empty array on error
 */
export class SystemIntelligence {
  /**
   * Detect all conflicts in the current wizard state.
   *
   * @param state - Current wizard state
   * @returns Array of detected conflicts (empty array if none or error)
   */
  detectConflicts(state: WizardState): any {
    try {
      const conflicts: SystemConflict[] = [];

      // Budget risk detection
      const budgetRisk = this.detectBudgetRisk(state);
      if (budgetRisk) conflicts.push(budgetRisk);

      // Must-have satisfaction
      const mustHaveIssues = this.detectMustHaveUnsatisfied(state);
      if (mustHaveIssues) conflicts.push(mustHaveIssues);

      // Physical constraints
      const physicalConstraint = this.detectPhysicalConstraints(state);
      if (physicalConstraint) conflicts.push(physicalConstraint);

      // Ambition mismatch
      const ambitionMismatch = this.detectAmbitionMismatch(state);
      if (ambitionMismatch) conflicts.push(ambitionMismatch);

      return conflicts;
    } catch (error) {
      console.error('[SystemIntelligence.detectConflicts] Error:', error);
      return [];
    }
  }

  /**
   * Detect budget risk when total budget is insufficient for must-have wishes.
   * @private
   */
  private detectBudgetRisk(state: WizardState): SystemConflict | null {
    try {
      const budget = (state.chapterAnswers.budget as any)?.budgetTotaal;
      const wensen = (state.chapterAnswers.wensen as any)?.wishes;

      if (!budget || !wensen || !Array.isArray(wensen)) {
        return null;
      }

      // Calculate total cost of must-have wishes
      const mustHaveCost = wensen
        .filter((wish: any) => wish.priority === 'must')
        .reduce((sum: number, wish: any) => sum + (wish.estimatedCost || 0), 0);

      if (mustHaveCost > budget) {
        const shortfall = mustHaveCost - budget;
        return {
          id: `budget_risk_${Date.now()}`,
          type: 'budget_risk',
          severity: 'blocking',
          description: `Budget te laag: €${budget.toLocaleString()} beschikbaar, maar must-haves kosten €${mustHaveCost.toLocaleString()} (tekort: €${shortfall.toLocaleString()})`,
          affectedFields: ['budget.budgetTotaal', 'wensen.wishes'],
          affectedChapters: ['budget', 'wensen'],
          resolution: `Verhoog het budget met minimaal €${shortfall.toLocaleString()} of heroverweeg de prioriteit van sommige must-have wensen.`,
          estimatedCost: mustHaveCost,
        };
      }

      return null;
    } catch (error) {
      console.error('[SystemIntelligence.detectBudgetRisk] Error:', error);
      return null;
    }
  }

  /**
   * Detect must-have wishes without budget allocation.
   * @private
   */
  private detectMustHaveUnsatisfied(state: WizardState): SystemConflict | null {
    try {
      const wensen = (state.chapterAnswers.wensen as any)?.wishes;
      const budget = (state.chapterAnswers.budget as any)?.budgetTotaal;

      if (!wensen || !Array.isArray(wensen)) {
        return null;
      }

      const mustHaves = wensen.filter((wish: any) => wish.priority === 'must');

      if (mustHaves.length > 0 && !budget) {
        return {
          id: `must_have_unsatisfied_${Date.now()}`,
          type: 'must_have_unsatisfied',
          severity: 'warning',
          description: `Je hebt ${mustHaves.length} must-have wensen, maar nog geen budget ingesteld.`,
          affectedFields: ['wensen.wishes', 'budget.budgetTotaal'],
          affectedChapters: ['wensen', 'budget'],
          resolution: 'Stel een budget in om te controleren of je must-have wensen haalbaar zijn.',
        };
      }

      return null;
    } catch (error) {
      console.error('[SystemIntelligence.detectMustHaveUnsatisfied] Error:', error);
      return null;
    }
  }

  /**
   * Detect physical constraint violations (room sizes exceeding total area).
   * @private
   */
  private detectPhysicalConstraints(state: WizardState): SystemConflict | null {
    try {
      const ruimtes = state.chapterAnswers.ruimtes as any;

      if (!ruimtes || !ruimtes.rooms || !Array.isArray(ruimtes.rooms)) {
        return null;
      }

      const totalArea = ruimtes.totalArea;
      const rooms = ruimtes.rooms;

      if (!totalArea || rooms.length === 0) {
        return null;
      }

      // Calculate sum of all room sizes
      const totalRoomSize = rooms.reduce(
        (sum: number, room: any) => sum + (room.m2 || 0),
        0
      );

      if (totalRoomSize > totalArea) {
        const excess = totalRoomSize - totalArea;
        return {
          id: `physical_constraint_${Date.now()}`,
          type: 'physical_constraint',
          severity: 'blocking',
          description: `Totale oppervlakte van ruimtes (${totalRoomSize}m²) is groter dan beschikbare oppervlakte (${totalArea}m²). Overschrijding: ${excess}m²`,
          affectedFields: ['ruimtes.rooms', 'ruimtes.totalArea'],
          affectedChapters: ['ruimtes'],
          resolution: `Verklein de ruimtes met totaal ${excess}m² of verhoog de beschikbare oppervlakte.`,
        };
      }

      return null;
    } catch (error) {
      console.error('[SystemIntelligence.detectPhysicalConstraints] Error:', error);
      return null;
    }
  }

  /**
   * Detect ambition mismatch when total wishes significantly exceed budget.
   * @private
   */
  private detectAmbitionMismatch(state: WizardState): SystemConflict | null {
    try {
      const budget = (state.chapterAnswers.budget as any)?.budgetTotaal;
      const wensen = (state.chapterAnswers.wensen as any)?.wishes;

      if (!budget || !wensen || !Array.isArray(wensen)) {
        return null;
      }

      // Calculate total cost of all wishes (including nice-to-haves)
      const totalWishCost = wensen.reduce(
        (sum: number, wish: any) => sum + (wish.estimatedCost || 0),
        0
      );

      // Threshold: wishes exceed budget by more than 50%
      const threshold = budget * 1.5;

      if (totalWishCost > threshold) {
        const excess = totalWishCost - budget;
        return {
          id: `ambition_mismatch_${Date.now()}`,
          type: 'ambition_mismatch',
          severity: 'warning',
          description: `Totale kosten van alle wensen (€${totalWishCost.toLocaleString()}) overschrijden het budget (€${budget.toLocaleString()}) aanzienlijk met €${excess.toLocaleString()}.`,
          affectedFields: ['budget.budgetTotaal', 'wensen.wishes'],
          affectedChapters: ['budget', 'wensen'],
          resolution: 'Overweeg om de prioriteit van sommige nice-to-have wensen te verlagen of het budget te verhogen.',
          estimatedCost: totalWishCost,
        };
      }

      return null;
    } catch (error) {
      console.error('[SystemIntelligence.detectAmbitionMismatch] Error:', error);
      return null;
    }
  }
}
