// lib/insights/types.ts
// Type definitions for ExpertCorner insights system

import type { ChapterKey, ChapterDataMap } from '@/types/project';

/**
 * Types of insights that can be generated
 */
export type InsightType =
  | 'DESIGN_TIP'        // Design advice from designImplications
  | 'SIMILAR_CHOICE'    // "Others also chose..." from co-occurrence
  | 'BUDGET_WARNING'    // Budget impact warnings
  | 'RISK_WARNING'      // Risk alerts
  | 'ROOM_BEST_PRACTICE' // Room-specific best practices
  | 'FOLLOW_UP_QUESTION'; // Suggested questions

/**
 * Severity levels for insights
 */
export type InsightSeverity = 'info' | 'tip' | 'warning' | 'critical';

/**
 * Core insight object returned to frontend
 */
export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  content: string;

  /** Traceability: IDs of source examples */
  sourceExampleIds: string[];

  /** Confidence score (0-1), derived from qualityScore + frequency */
  confidence: number;

  /** Optional chapter association */
  chapter?: ChapterKey;

  /** Associated tags */
  tags?: string[];

  /** Type-specific metadata */
  metadata?: {
    budgetImpact?: 'low' | 'medium' | 'high';
    frequency?: number;  // how many examples support this
    designImplication?: string;
  };
}

/**
 * Context passed to insight generation
 */
export interface InsightContext {
  currentChapter: ChapterKey;
  focusedField?: string | null;
  chapterAnswers: ChapterDataMap;
  userQuery?: string;
  roomType?: string;
}

/**
 * Response from /api/insights
 */
export interface InsightResponse {
  insights: Insight[];
  meta: {
    totalExamplesConsidered: number;
    processingTimeMs: number;
    cacheHit: boolean;
  };
}

/**
 * Customer example from database
 */
export interface CustomerExample {
  id: string;
  userQuery: string;
  interpretation: {
    chapter?: ChapterKey;
    reasoning?: string;
    designImplications?: string[];
    emotionalCategory?: string;
    followUpStrategy?: string;
    suggestedQuestions?: string[];
    potentialPatches?: unknown[];
  };
  tags: string[];
  qualityScore: number;
  embedding?: number[];
}

/**
 * Options for ExampleMatcher.findSimilar()
 */
export interface MatchOptions {
  limit?: number;
  minQualityScore?: number;
  tags?: string[];
  chapter?: ChapterKey;
}

/**
 * Base interface for insight strategies
 */
export interface InsightStrategy {
  name: string;
  generate(
    context: InsightContext,
    examples: CustomerExample[]
  ): Promise<Insight[]>;
}
