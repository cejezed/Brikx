// lib/ai/TurnPlanner.ts
// Week 2, Day 8 - Turn Planner Module
// Purpose: Determine AI response strategy based on priority matrix

import type {
  TurnPlan,
  TurnAction,
  TurnPriority,
  TurnRoute,
  RecommendedTone,
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
 * TurnPlanner - Determines AI response strategy
 *
 * Priority Matrix (in order):
 * 1. BLOCKING conflicts → conflict_resolution (highest priority)
 * 2. CRITICAL anticipation → probe
 * 3. WARNING conflicts → conflict_resolution (allow patches)
 * 4. HIGH/MEDIUM anticipation → probe
 * 5. Normal user queries → patch or advies
 *
 * Tone Adaptation:
 * - overwhelmed → supportive
 * - doer + decisive → directive
 * - researcher + confident → collaborative
 * - default → informative
 *
 * Performance target: <20ms
 */
export class TurnPlanner {
  /**
   * Create a turn plan based on all intelligence inputs.
   *
   * @param input - All relevant context for planning
   * @returns Complete turn plan with action, tone, priority, route, and reasoning
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

      // Determine tone from behavior profile
      const tone = behaviorProfile.recommendedTone || 'informative';

      // Apply priority matrix
      // 1. Check for BLOCKING conflicts (highest priority)
      const blockingConflicts = sortedConflicts.filter((c) => c.severity === 'blocking');
      if (blockingConflicts.length > 0) {
        return {
          action: 'conflict_resolution',
          tone,
          priority: 'system_conflict',
          route: 'guard_required',
          reasoning: `Detected ${blockingConflicts.length} blocking conflict(s) that must be resolved before proceeding.`,
          systemConflicts: sortedConflicts,
        };
      }

      // 2. Check for CRITICAL anticipation
      if (anticipationGuidance && anticipationGuidance.priority === 'critical') {
        return {
          action: 'probe',
          tone,
          priority: 'anticipation',
          route: 'normal',
          reasoning: `Critical proactive guidance needed: ${anticipationGuidance.question}`,
          anticipationGuidance,
        };
      }

      // 3. Check for WARNING conflicts
      const warningConflicts = sortedConflicts.filter((c) => c.severity === 'warning');
      if (warningConflicts.length > 0) {
        return {
          action: 'conflict_resolution',
          tone,
          priority: 'system_conflict',
          route: 'guard_required',
          reasoning: `Detected ${warningConflicts.length} warning conflict(s) that should be addressed.`,
          systemConflicts: sortedConflicts,
        };
      }

      // 4. Check for HIGH or MEDIUM anticipation
      if (anticipationGuidance && (anticipationGuidance.priority === 'high' || anticipationGuidance.priority === 'medium')) {
        return {
          action: 'probe',
          tone,
          priority: 'anticipation',
          route: 'normal',
          reasoning: `Proactive ${anticipationGuidance.priority} priority guidance available.`,
          anticipationGuidance,
        };
      }

      // 5. Normal user queries - determine if data input or advice request
      const isDataInput = this.detectDataInput(behaviorProfile, userMessage);

      if (isDataInput) {
        return {
          action: 'patch',
          tone,
          priority: 'user_query',
          route: 'guard_required',
          reasoning: 'User is providing concrete data for wizard state.',
        };
      }

      // Default: advice request
      return {
        action: 'advies',
        tone,
        priority: 'user_query',
        route: 'normal',
        reasoning: 'User is asking for advice or information.',
      };
    } catch (error) {
      console.error('[TurnPlanner.plan] Error:', error);
      return this.getDefaultPlan();
    }
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
   * Detect if user is providing data (vs asking questions).
   * @private
   */
  private detectDataInput(behaviorProfile: BehaviorProfile, userMessage: string): boolean {
    // User is providing details and being decisive = data input
    if (behaviorProfile.patterns.providingDetails && behaviorProfile.patterns.decisive) {
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
    ].some((pattern) => pattern.test(userMessage));

    // If user is providing details and message contains data = data input
    if (behaviorProfile.patterns.providingDetails && hasDataPatterns) {
      return true;
    }

    // User is asking many questions = advice request (not data input)
    if (behaviorProfile.patterns.askingManyQuestions) {
      return false;
    }

    // User is exploring = advice request (not data input)
    if (behaviorProfile.patterns.exploring) {
      return false;
    }

    // Default: assume advice request if unclear
    return false;
  }

  /**
   * Get default turn plan for error cases.
   * @private
   */
  private getDefaultPlan(): TurnPlan {
    return {
      action: 'advies',
      tone: 'informative',
      priority: 'user_query',
      route: 'normal',
      reasoning: 'Default plan due to missing or invalid input.',
    };
  }
}
