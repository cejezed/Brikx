// lib/insights/InsightGenerator.ts
// Orchestrator voor insight generation

import { ExampleMatcher } from './ExampleMatcher';
import { DesignTipStrategy } from './strategies/DesignTipStrategy';
import { CoOccurrenceStrategy } from './strategies/CoOccurrenceStrategy';
import { BudgetRiskStrategy } from './strategies/BudgetRiskStrategy';
import { RoomBestPracticeStrategy } from './strategies/RoomBestPracticeStrategy';
import type {
  InsightContext,
  InsightResponse,
  Insight,
  InsightStrategy
} from './types';

export class InsightGenerator {
  private matcher = new ExampleMatcher();

  private strategies: InsightStrategy[] = [
    new DesignTipStrategy(),         // Fase 1: Design implications
    new CoOccurrenceStrategy(),      // Fase 2: Tag co-occurrence patterns
    new BudgetRiskStrategy(),        // Fase 3: Budget warnings
    new RoomBestPracticeStrategy(),  // Fase 3: Room-specific best practices
  ];

  /**
   * Generate insights voor gegeven context
   */
  async generate(context: InsightContext): Promise<InsightResponse> {
    const startTime = Date.now();

    // 1. Build semantic query from context
    const query = this.buildQuery(context);

    // 2. Find relevant examples via vector similarity
    const examples = await this.matcher.findSimilar(query, {
      limit: 50,
      minQualityScore: 0.7,
      chapter: context.currentChapter,
    });

    // 3. Run all strategies in parallel
    const insightPromises = this.strategies.map(strategy =>
      strategy.generate(context, examples).catch(err => {
        console.error(`Strategy ${strategy.name} failed:`, err);
        return [] as Insight[];
      })
    );

    const insightArrays = await Promise.all(insightPromises);
    const allInsights = insightArrays.flat();

    // 4. Deduplicate & rank
    const rankedInsights = this.rankInsights(allInsights);

    // 5. Prepare response
    const response: InsightResponse = {
      insights: rankedInsights.slice(0, 8), // Max 8 insights total
      meta: {
        totalExamplesConsidered: examples.length,
        processingTimeMs: Date.now() - startTime,
        cacheHit: false, // Fase 4: Redis caching
      },
    };

    return response;
  }

  /**
   * Build semantic query from context
   */
  private buildQuery(context: InsightContext): string {
    // Priority 1: explicit user query
    if (context.userQuery) {
      return context.userQuery;
    }

    // Priority 2: focused field
    if (context.focusedField) {
      const [chapter, field] = context.focusedField.split(':');
      return `${chapter} ${field || ''}`.trim();
    }

    // Priority 3: current chapter
    return context.currentChapter;
  }

  /**
   * Rank insights by severity, confidence, frequency
   */
  private rankInsights(insights: Insight[]): Insight[] {
    const severityWeight: Record<string, number> = {
      critical: 4,
      warning: 3,
      tip: 2,
      info: 1
    };

    return insights.sort((a, b) => {
      const aScore = (severityWeight[a.severity] || 0) * 100
        + a.confidence * 10
        + (a.metadata?.frequency || 0);

      const bScore = (severityWeight[b.severity] || 0) * 100
        + b.confidence * 10
        + (b.metadata?.frequency || 0);

      return bScore - aScore;
    });
  }
}
