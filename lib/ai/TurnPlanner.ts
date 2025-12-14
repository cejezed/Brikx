// lib/ai/TurnPlanner.ts
// Week 2, Day 8 - Turn Planner Module (v3.1 Manifest Compliant)
// Purpose: Determine AI response strategy based on priority matrix

import type {
  TurnPlan,
  TurnGoal,
  TurnPriority,
  TurnRoute,
  SystemConflict,
  AnticipationGuidance,
  BehaviorProfile,
} from '@/types/ai';

/**
 * Input for turn planning decision.
 */
export interface TurnPlannerInput {
  systemConflicts?: SystemConflict[];
  anticipationGuidance?: AnticipationGuidance;
  behaviorProfile: BehaviorProfile;
  userMessage: string;
}

/**
 * TurnPlanner - Determines AI response strategy (v3.1 Manifest)
 *
 * Priority Matrix (in order):
 * 1. BLOCKING conflicts → surface_risks (highest priority)
 * 2. CRITICAL anticipation → anticipate_and_guide
 * 3. WARNING conflicts → surface_risks (allow patches)
 * 4. HIGH/MEDIUM anticipation → anticipate_and_guide
 * 5. Normal user queries → fill_data or clarify
 *
 * Official TurnGoals (ONLY these 5):
 * - fill_data: Collect wizard data
 * - anticipate_and_guide: Proactive guidance
 * - surface_risks: Show conflicts
 * - offer_alternatives: Present options
 * - clarify: Ask clarifying question
 *
 * Performance target: <20ms
 */
export class TurnPlanner {
  /**
   * Create a turn plan based on all intelligence inputs.
   *
   * @param input - All relevant context for planning
   * @returns Complete turn plan with goal, priority, route, and reasoning
   */
  plan(input: TurnPlannerInput): TurnPlan {
    try {
      // Handle invalid input
      if (!input.behaviorProfile) {
        return this.getDefaultPlan();
      }

      const { systemConflicts, anticipationGuidance, behaviorProfile, userMessage } = input;

      // Sort conflicts by severity (blocking first)
      const sortedConflicts = this.sortConflictsBySeverity(systemConflicts || []);

      // Apply priority matrix
      // 1. Check for BLOCKING conflicts (highest priority)
      const blockingConflicts = sortedConflicts.filter((c) => c.severity === 'blocking');
      if (blockingConflicts.length > 0) {
        return {
          goal: 'surface_risks',
          priority: 'system_conflict',
          route: 'guard_required',
          allowPatches: false, // BLOCKING conflicts = NO patches allowed
          reasoning: `Detected ${blockingConflicts.length} blocking conflict(s) that must be resolved before proceeding.`,
          systemConflicts: sortedConflicts,
          action: 'surface_conflicts',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // 2. Check for CRITICAL anticipation
      if (anticipationGuidance && anticipationGuidance.priority === 'critical') {
        return {
          goal: 'anticipate_and_guide',
          priority: 'anticipation',
          route: 'normal',
          allowPatches: false, // CRITICAL anticipation = NO patches allowed
          reasoning: `Critical proactive guidance needed: ${anticipationGuidance.question}`,
          anticipationGuidance,
          action: 'proactive_guidance',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // 3. Check for WARNING conflicts
      const warningConflicts = sortedConflicts.filter((c) => c.severity === 'warning');
      if (warningConflicts.length > 0) {
        return {
          goal: 'surface_risks',
          priority: 'system_conflict',
          route: 'guard_required',
          allowPatches: true, // WARNING conflicts = patches allowed
          reasoning: `Detected ${warningConflicts.length} warning conflict(s) that should be addressed.`,
          systemConflicts: sortedConflicts,
          action: 'surface_conflicts',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // 4. Check for HIGH or MEDIUM anticipation
      if (anticipationGuidance && (anticipationGuidance.priority === 'high' || anticipationGuidance.priority === 'medium')) {
        return {
          goal: 'anticipate_and_guide',
          priority: 'anticipation',
          route: 'normal',
          allowPatches: true, // Normal anticipation = patches allowed
          reasoning: `Proactive ${anticipationGuidance.priority} priority guidance available.`,
          anticipationGuidance,
          action: 'proactive_guidance',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // 5. Normal user queries - determine if data input or clarification needed
      const adviceRequest = this.isAdviceRequest(userMessage);

      // Advice/explanation requests always go to clarify (no alternatives, no data mode override)
      if (adviceRequest) {
        return {
          goal: 'clarify',
          priority: 'user_query',
          route: 'normal',
          allowPatches: true,
          reasoning: 'Advies- of uitlegverzoek ƒÅ\' kies clarifying flow.',
          action: 'ask_clarifying_question',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      const isDataInput = this.detectDataInput(behaviorProfile, userMessage);

      if (isDataInput) {
        return {
          goal: 'fill_data',
          priority: 'user_query',
          route: 'guard_required',
          allowPatches: true, // Data input = patches expected
          reasoning: 'User is providing concrete data for wizard state.',
          action: 'collect_data',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // Check if alternatives should be offered (only when explicitly exploring options)
      const needsAlternatives = this.detectNeedsAlternatives(behaviorProfile, userMessage);
      if (needsAlternatives) {
        return {
          goal: 'offer_alternatives',
          priority: 'user_query',
          route: 'normal',
          allowPatches: true, // Offering alternatives = patches allowed
          reasoning: 'User is exploring options and needs alternatives.',
          action: 'offer_options',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      if (adviceRequest) {
        return {
          goal: 'clarify',
          priority: 'user_query',
          route: 'normal',
          allowPatches: true, // Clarification questions
          reasoning: 'Advice request handled with clarification and guidance.',
          action: 'ask_clarifying_question',
          tone: behaviorProfile.toneHint || 'neutral',
        };
      }

      // Default: clarify
      return {
        goal: 'clarify',
        priority: 'user_query',
        route: 'normal',
        allowPatches: true, // Clarification questions = patches allowed
        reasoning: 'User is asking for clarification or information.',
        action: 'ask_clarifying_question',
        tone: behaviorProfile.toneHint || 'neutral',
      };
    } catch (error) {
      console.error('[TurnPlanner.plan] Error:', error);
      return this.getDefaultPlan();
    }
  }

  /**
   * Backwards-compatible alias for older orchestrator/tests.
   */
  decide(input: TurnPlannerInput): TurnPlan {
    return this.plan(input);
  }

  /**
   * Sort conflicts by severity (blocking first, then warning).
   * @private
   */
  private sortConflictsBySeverity(conflicts: SystemConflict[]): SystemConflict[] {
    const severityOrder = { blocking: 0, warning: 1, info: 2 };
    return [...conflicts].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }

  /**
   * Detect advice-style requests.
   * @private
   */
  private isAdviceRequest(userMessage: string): boolean {
    return /\b(wat (kan|moet) ik|wat raad je|raad je (me)? aan|wat zijn de opties|welke (keuze|optie)|hoe (pak|doe) ik|wat is beter|verschillen tussen|kun je|kan je)\b/i.test(
      userMessage
    );
  }

  /**
   * Detect if user is providing data (vs asking questions).
   * @private
   */
  private detectDataInput(behaviorProfile: BehaviorProfile, userMessage: string): boolean {
    // User has high confidence and providing details = data input
    if (behaviorProfile.confidenceLevel === 'high' && behaviorProfile.speedPreference === 'quick') {
      return true;
    }

    // Check for data patterns in message
    const hasDataPatterns = [
      /\d+m2/i,
      /€\d/,
      /budget/i,
      /\d+ (slaapkamers|kamers)/i,
      /is €/i,
      /maart|april|mei|juni|juli|augustus|september|oktober|november|december/i,
      /ik kies/i,
      /ik wil/i,
      /staat vast/i,
    ].some((pattern) => pattern.test(userMessage));

    // If user is engaged and message contains data = data input
    if (behaviorProfile.signals.engaged && hasDataPatterns) {
      return true;
    }

    // User is confused = not data input
    if (behaviorProfile.signals.confused) {
      return false;
    }

    // Default: assume clarification needed if unclear
    return false;
  }

  /**
   * Detect if user needs alternatives/options presented.
   * @private
   */
  private detectNeedsAlternatives(behaviorProfile: BehaviorProfile, userMessage: string): boolean {
    // Check for exploration patterns in message
    const hasExplorationPatterns = [
      /verschil/i,
      /vergelijk/i,
      /opties/i,
      /alternatieven/i,
      /versus|vs\.|of/i,
      /voor- en nadelen/i,
      /wat zijn de/i,
    ].some((pattern) => pattern.test(userMessage));

    return hasExplorationPatterns;
  }

  /**
   * Get default turn plan for error cases.
   * @private
   */
  private getDefaultPlan(): TurnPlan {
    return {
      goal: 'clarify',
      priority: 'user_query',
      route: 'normal',
      allowPatches: true,
      reasoning: 'Default plan due to missing or invalid input.',
      action: 'ask_clarifying_question',
      tone: 'neutral',
    };
  }
}
