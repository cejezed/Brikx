// lib/ai/BehaviorAnalyzer.ts
// Week 2, Day 6-7 - Behavior Analyzer Module
// Purpose: Analyze user behavior patterns from conversation history

import type {
  ConversationTurn,
  BehaviorProfile,
  BehaviorPattern,
  BehaviorSignals,
  UserStyle,
  RecommendedTone,
} from '@/types/ai';

/**
 * BehaviorAnalyzer - Analyzes user conversation patterns
 *
 * Responsibilities:
 * - Detect patterns: asking questions, providing details, exploring, decisive
 * - Detect signals: overwhelmed, engaged, frustrated, confident
 * - Classify user style: explorer, doer, delegator, researcher
 * - Recommend tone: supportive, directive, informative, collaborative
 *
 * Strategy: Keyword-based pattern matching (no ML)
 * Performance: Analyzes last 10 turns only for speed
 */
export class BehaviorAnalyzer {
  /**
   * Analyze conversation history and return behavior profile.
   *
   * @param conversation - Array of conversation turns
   * @returns Complete behavior profile
   */
  analyze(conversation: ConversationTurn[]): BehaviorProfile {
    try {
      // Handle empty or invalid input
      if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        return this.getDefaultProfile();
      }

      // Analyze last 10 turns only for performance
      const recentTurns = conversation.slice(-10);
      const userTurns = recentTurns.filter((turn) => turn.role === 'user');

      // Detect patterns
      const patterns = this.detectPatterns(userTurns);

      // Detect signals
      const signals = this.detectSignals(userTurns);

      // Classify user style
      const userStyle = this.classifyUserStyle(patterns, signals);

      // Recommend tone
      const recommendedTone = this.recommendTone(patterns, signals, userStyle);

      return {
        patterns,
        signals,
        userStyle,
        recommendedTone,
        turnCount: conversation.length,
      };
    } catch (error) {
      console.error('[BehaviorAnalyzer.analyze] Error:', error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Detect behavioral patterns from user messages.
   * @private
   */
  private detectPatterns(userTurns: ConversationTurn[]): BehaviorPattern {
    const askingManyQuestions = this.hasPattern(userTurns, [
      /\?/g,
      /wat is/i,
      /hoe/i,
      /waarom/i,
      /kun je/i,
      /kan ik/i,
      /moet ik/i,
    ], 3);

    const providingDetails = this.hasPattern(userTurns, [
      /\dm2/i,
      /€\d/,
      /\d+m2/,
      /budget/i,
      /\d+ (euro|k)/i,
      /maart|april|mei|juni|juli|augustus|september|oktober|november|december/i,
    ], 2);

    const exploring = this.hasPattern(userTurns, [
      /verschil/i,
      /vergelijk/i,
      /opties/i,
      /alternatieven/i,
      /versus|vs\.|of/i,
      /voor- en nadelen/i,
      /wat zijn de/i,
    ], 2);

    const decisive = this.hasPattern(userTurns, [
      /ik kies/i,
      /ik wil/i,
      /staat vast/i,
      /zeker/i,
      /geen cent meer/i,
      /definitief/i,
      /besloten/i,
    ], 2);

    return {
      askingManyQuestions,
      providingDetails,
      exploring,
      decisive,
    };
  }

  /**
   * Detect emotional/engagement signals from user messages.
   * @private
   */
  private detectSignals(userTurns: ConversationTurn[]): BehaviorSignals {
    const overwhelmed = this.hasPattern(userTurns, [
      /weet niet/i,
      /te veel/i,
      /ingewikkeld/i,
      /moeilijk/i,
      /snap het niet/i,
      /begrijp het niet/i,
      /te complex/i,
    ], 2);

    // Engaged: long messages (>100 chars average)
    const avgLength = userTurns.length > 0
      ? userTurns.reduce((sum, turn) => sum + turn.message.length, 0) / userTurns.length
      : 0;
    const engaged = avgLength > 100;

    const frustrated = this.hasPattern(userTurns, [
      /maar/i,
      /ja maar/i,
      /schiet niet op/i,
      /geen duidelijk antwoord/i,
      /steeds/i,
      /nog steeds niet/i,
    ], 2);

    const confident = this.hasPattern(userTurns, [
      /RC-waarde/i,
      /U-waarde/i,
      /COP/i,
      /lambda/i,
      /EPC/i,
      /BENG/i,
      /NTA 8800/i,
      /Qpres/i,
      /Bouwbesluit/i,
    ], 1);

    return {
      overwhelmed,
      engaged,
      frustrated,
      confident,
    };
  }

  /**
   * Classify user style based on patterns and signals.
   * @private
   */
  private classifyUserStyle(patterns: BehaviorPattern, signals: BehaviorSignals): UserStyle {
    // Researcher: confident and uses technical language
    if (signals.confident) {
      return 'researcher';
    }

    // Doer: decisive and provides details
    if (patterns.decisive && patterns.providingDetails) {
      return 'doer';
    }

    // Delegator: asking questions but not exploring deeply
    if (patterns.askingManyQuestions && !patterns.exploring) {
      return 'delegator';
    }

    // Explorer: exploring options and comparing (default)
    return 'explorer';
  }

  /**
   * Recommend tone based on behavior profile.
   * @private
   */
  private recommendTone(
    patterns: BehaviorPattern,
    signals: BehaviorSignals,
    userStyle: UserStyle
  ): RecommendedTone {
    // Supportive: user is overwhelmed
    if (signals.overwhelmed) {
      return 'supportive';
    }

    // Directive: decisive doer who wants clear instructions
    if (userStyle === 'doer' && patterns.decisive) {
      return 'directive';
    }

    // Collaborative: researcher with technical knowledge
    if (userStyle === 'researcher' && signals.confident) {
      return 'collaborative';
    }

    // Informative: explorer who wants to learn (default)
    return 'informative';
  }

  /**
   * Check if user messages contain patterns above threshold.
   * @private
   */
  private hasPattern(userTurns: ConversationTurn[], patterns: RegExp[], threshold: number): boolean {
    if (userTurns.length === 0) return false;

    const matches = userTurns.reduce((count, turn) => {
      const matchCount = patterns.reduce((sum, pattern) => {
        const found = turn.message.match(pattern);
        return sum + (found ? found.length : 0);
      }, 0);
      return count + matchCount;
    }, 0);

    return matches >= threshold;
  }

  /**
   * Get default behavior profile for empty or invalid input.
   * @private
   */
  private getDefaultProfile(): BehaviorProfile {
    return {
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
    };
  }
}
