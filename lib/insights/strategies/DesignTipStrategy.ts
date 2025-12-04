// lib/insights/strategies/DesignTipStrategy.ts
// Generate design tips from designImplications patterns

import type { Insight, InsightContext, CustomerExample, InsightStrategy } from '../types';

export class DesignTipStrategy implements InsightStrategy {
  name = 'DesignTipStrategy';

  async generate(
    context: InsightContext,
    examples: CustomerExample[]
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Filter examples with designImplications
    const relevantExamples = examples.filter(ex =>
      ex.interpretation.designImplications &&
      ex.interpretation.designImplications.length > 0 &&
      ex.qualityScore >= 0.75
    );

    if (relevantExamples.length === 0) {
      return [];
    }

    // Group by similar designImplications
    const grouped = this.groupByImplication(relevantExamples);

    // Generate insights from clusters (min 3 examples per cluster)
    for (const [implication, exs] of Object.entries(grouped)) {
      if (exs.length >= 3) {
        insights.push({
          id: `design_${this.generateId()}`,
          type: 'DESIGN_TIP',
          severity: 'tip',
          title: this.generateTitle(implication),
          content: this.generateContent(implication, exs),
          sourceExampleIds: exs.map(e => e.id),
          confidence: this.calculateConfidence(exs),
          chapter: context.currentChapter,
          tags: this.extractCommonTags(exs),
          metadata: {
            frequency: exs.length,
            designImplication: implication,
          },
        });
      }
    }

    // Rank by confidence & frequency, return top 3
    return insights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Group examples by similar designImplications
   */
  private groupByImplication(
    examples: CustomerExample[]
  ): Record<string, CustomerExample[]> {
    const grouped: Record<string, CustomerExample[]> = {};

    for (const ex of examples) {
      const implications = ex.interpretation.designImplications || [];

      for (const impl of implications) {
        // Normalize key (lowercase, trim)
        const key = impl.toLowerCase().trim();

        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(ex);
      }
    }

    return grouped;
  }

  /**
   * Calculate confidence based on quality scores + frequency
   */
  private calculateConfidence(examples: CustomerExample[]): number {
    const avgQuality = examples.reduce((sum, ex) => sum + ex.qualityScore, 0) / examples.length;

    // Frequency bonus: max +0.2 for 10+ examples
    const frequencyBonus = Math.min(examples.length / 10, 0.2);

    return Math.min(avgQuality + frequencyBonus, 1.0);
  }

  /**
   * Generate title from implication
   */
  private generateTitle(implication: string): string {
    // Capitalize first letter
    const clean = implication.charAt(0).toUpperCase() + implication.slice(1);

    // Truncate if too long
    return clean.length > 50 ? clean.substring(0, 47) + '...' : clean;
  }

  /**
   * Generate content from implication + examples
   */
  private generateContent(implication: string, examples: CustomerExample[]): string {
    const count = examples.length;

    // Template-based (no LLM generation)
    return `${implication} (Gebaseerd op ${count} vergelijkbare projecten)`;
  }

  /**
   * Extract tags that appear in >50% of examples
   */
  private extractCommonTags(examples: CustomerExample[]): string[] {
    const tagCounts = new Map<string, number>();

    examples.forEach(ex => {
      ex.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Tags die in >50% van examples voorkomen
    const threshold = examples.length * 0.5;
    return Array.from(tagCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([tag]) => tag)
      .slice(0, 5); // Max 5 tags
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
