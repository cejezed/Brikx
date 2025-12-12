// lib/ai/BehaviorAnalyzer.ts
// Week 2, Day 6-7 - Behavior Analyzer Module (v3.1 Manifest Compliant)
// Purpose: Analyze user behavior signals from conversation history

import type {
  ConversationTurn,
  BehaviorProfile,
  BehaviorSignals,
} from '@/types/ai';

/**
 * BehaviorAnalyzer - Analyzes user conversation signals (v3.1 Manifest)
 *
 * Responsibilities:
 * - Detect 4 signals: overwhelmed, confused, impatient, engaged
 * - Determine toneHint: warm, neutral, direct
 * - Determine confidenceLevel: low, medium, high
 * - Determine speedPreference: thorough, balanced, quick
 *
 * Strategy: Keyword-based pattern matching (no ML, no personality profiling)
 * Performance: Analyzes last 10 turns only for speed
 */
export class BehaviorAnalyzer {
  /**
   * Analyze conversation history and return behavior profile.
   *
   * @param conversation - Array of conversation turns
   * @returns Behavior profile with signals and preferences
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

      // Detect signals (ONLY these 4)
      const signals = this.detectSignals(userTurns);

      // Determine preferences
      const toneHint = this.determineToneHint(signals, userTurns);
      const confidenceLevel = this.determineConfidenceLevel(userTurns);
      const speedPreference = this.determineSpeedPreference(signals, userTurns);

      return {
        signals,
        toneHint,
        confidenceLevel,
        speedPreference,
        turnCount: conversation.length,
      };
    } catch (error) {
      console.error('[BehaviorAnalyzer.analyze] Error:', error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Detect the 4 behavioral signals from user messages.
   * @private
   */
  private detectSignals(userTurns: ConversationTurn[]): BehaviorSignals {
    const overwhelmed = this.hasPattern(userTurns, [
      /te veel/i,
      /te complex/i,
      /te ingewikkeld/i,
      /snap het niet/i,
      /begrijp het niet/i,
    ], 2);

    const confused = this.hasPattern(userTurns, [
      /weet niet/i,
      /snap/i,
      /begrijp/i,
      /wat bedoel je/i,
      /hoe zit dat/i,
      /kun je uitleggen/i,
      /wat is/i,
    ], 3);

    const impatient = this.hasPattern(userTurns, [
      /snel/i,
      /kort/i,
      /vlot/i,
      /direct/i,
      /zonder veel uitleg/i,
      /gewoon/i,
      /simpel/i,
    ], 2);

    // Engaged: long messages (>100 chars average)
    const avgLength = userTurns.length > 0
      ? userTurns.reduce((sum, turn) => sum + turn.message.length, 0) / userTurns.length
      : 0;
    const engaged = avgLength > 100;

    return {
      overwhelmed,
      confused,
      impatient,
      engaged,
    };
  }

  /**
   * Determine tone hint based on signals.
   * @private
   */
  private determineToneHint(signals: BehaviorSignals, userTurns: ConversationTurn[]): 'warm' | 'neutral' | 'direct' {
    // Warm: user is overwhelmed or confused
    if (signals.overwhelmed || signals.confused) {
      return 'warm';
    }

    // Direct: user is impatient
    if (signals.impatient) {
      return 'direct';
    }

    // Neutral: default
    return 'neutral';
  }

  /**
   * Determine confidence level based on technical language usage.
   * @private
   */
  private determineConfidenceLevel(userTurns: ConversationTurn[]): 'low' | 'medium' | 'high' {
    // High: uses technical terms
    const usesTechnicalTerms = this.hasPattern(userTurns, [
      /RC-waarde/i,
      /U-waarde/i,
      /COP/i,
      /lambda/i,
      /EPC/i,
      /BENG/i,
      /NTA 8800/i,
      /Qpres/i,
      /Bouwbesluit/i,
      /isolatie/i,
      /warmtepomp/i,
    ], 1);

    if (usesTechnicalTerms) {
      return 'high';
    }

    // Medium: provides concrete details
    const providesDetails = this.hasPattern(userTurns, [
      /\dm2/i,
      /€\d/,
      /\d+m2/,
      /budget/i,
      /\d+ (euro|k)/i,
    ], 2);

    if (providesDetails) {
      return 'medium';
    }

    // Low: default
    return 'low';
  }

  /**
   * Determine speed preference based on signals and message patterns.
   * @private
   */
  private determineSpeedPreference(signals: BehaviorSignals, userTurns: ConversationTurn[]): 'thorough' | 'balanced' | 'quick' {
    // Quick: impatient user
    if (signals.impatient) {
      return 'quick';
    }

    // Thorough: exploring options
    const isExploring = this.hasPattern(userTurns, [
      /verschil/i,
      /vergelijk/i,
      /opties/i,
      /alternatieven/i,
      /versus|vs\.|of/i,
      /voor- en nadelen/i,
      /wat zijn de/i,
    ], 2);

    if (isExploring) {
      return 'thorough';
    }

    // Balanced: default
    return 'balanced';
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
      signals: {
        overwhelmed: false,
        confused: false,
        impatient: false,
        engaged: false,
      },
      toneHint: 'neutral',
      confidenceLevel: 'medium',
      speedPreference: 'balanced',
      turnCount: 0,
    };
  }
}
