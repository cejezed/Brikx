// lib/insights/strategies/BudgetRiskStrategy.ts
// Generate BUDGET_WARNING insights from customer examples + budget rules
//
// Deze strategy werkt puur op basis van heuristiek:
// - Geen LLM
// - Geen extra Supabase calls
// - Alleen de examples die InsightGenerator al heeft opgehaald

import type { Insight, InsightContext, CustomerExample, InsightStrategy } from '../types';
import { BUDGET_RULES, type BudgetRule, type BudgetImpactLevel } from '../budget-rules';

export class BudgetRiskStrategy implements InsightStrategy {
  name = 'BudgetRiskStrategy';

  async generate(
    context: InsightContext,
    examples: CustomerExample[]
  ): Promise<Insight[]> {
    if (examples.length === 0) {
      return [];
    }

    // 1. Verzamel alle tags uit de huidige examples
    const contextTags = this.extractAllTags(examples);

    if (contextTags.length === 0) {
      return [];
    }

    const insights: Insight[] = [];

    // 2. Voor elke budget rule: check of deze van toepassing is
    for (const rule of BUDGET_RULES) {
      const insight = this.evaluateRule(rule, contextTags, examples, context);
      if (insight) {
        insights.push(insight);
      }
    }

    // 3. Sorteer op impact + frequency
    const sorted = this.sortByPriority(insights);

    // 4. Max 2 budget warnings per context (niet spammen)
    return sorted.slice(0, 2);
  }

  /**
   * Extract alle unieke tags uit examples
   */
  private extractAllTags(examples: CustomerExample[]): string[] {
    const tagSet = new Set<string>();

    examples.forEach(ex => {
      ex.tags.forEach(tag => {
        tagSet.add(tag.toLowerCase().trim());
      });
    });

    return Array.from(tagSet);
  }

  /**
   * Evalueer een budget rule tegen de huidige context
   */
  private evaluateRule(
    rule: BudgetRule,
    contextTags: string[],
    examples: CustomerExample[],
    context: InsightContext
  ): Insight | null {
    // Check of rule-tags intersecten met context-tags
    const ruleTags = rule.tags.map(t => t.toLowerCase().trim());
    const matchingTags = ruleTags.filter(rt => contextTags.includes(rt));

    if (matchingTags.length === 0) {
      return null;
    }

    // Find supporting examples (examples die minimaal één van de rule-tags bevatten)
    const supportingExamples = examples.filter(ex =>
      ex.tags.some(tag =>
        ruleTags.includes(tag.toLowerCase().trim())
      )
    );

    const minExamples = rule.minExamples ?? 3;
    if (supportingExamples.length < minExamples) {
      return null;
    }

    // Genereer insight
    const severity = this.mapImpactToSeverity(rule.impact);
    const confidence = this.calculateConfidence(supportingExamples.length);

    return {
      id: `budget_${rule.id}_${this.generateId()}`,
      type: 'BUDGET_WARNING',
      severity,
      title: rule.title,
      content: rule.message,
      sourceExampleIds: supportingExamples.map(ex => ex.id).slice(0, 50),
      confidence,
      chapter: context.currentChapter,
      tags: matchingTags,
      metadata: {
        budgetImpact: rule.impact,
        frequency: supportingExamples.length,
      },
    };
  }

  /**
   * Map budget impact level naar insight severity
   */
  private mapImpactToSeverity(impact: BudgetImpactLevel): 'info' | 'warning' | 'critical' {
    switch (impact) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Bereken confidence score op basis van aantal supporting examples
   * Formula: 0.6 + 0.1 * log(count + 1), max 0.95
   */
  private calculateConfidence(supportingCount: number): number {
    const base = 0.6;
    const bonus = 0.1 * Math.log(supportingCount + 1);
    return Math.min(base + bonus, 0.95);
  }

  /**
   * Sorteer insights op impact (high eerst) + frequency
   */
  private sortByPriority(insights: Insight[]): Insight[] {
    const impactWeight: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return insights.sort((a, b) => {
      const aImpact = impactWeight[a.metadata?.budgetImpact || 'low'] || 0;
      const bImpact = impactWeight[b.metadata?.budgetImpact || 'low'] || 0;

      const aFreq = a.metadata?.frequency || 0;
      const bFreq = b.metadata?.frequency || 0;

      // Primair: impact level
      if (aImpact !== bImpact) {
        return bImpact - aImpact;
      }

      // Secundair: frequency
      return bFreq - aFreq;
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
