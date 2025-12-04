// lib/insights/strategies/CoOccurrenceStrategy.ts
// Generate "Anderen kozen ook..." insights from tag co-occurrence patterns
//
// IMPORTANT: This strategy is SERVER-SIDE ONLY.
// It uses the service role key and must never run in a client component.

import { createClient } from '@supabase/supabase-js';
import type { Insight, InsightContext, CustomerExample, InsightStrategy } from '../types';

interface CoOccurrenceResult {
  tag: string;
  cooccurrence_count: number;
  avg_quality: number;
  confidence: number;
  source_example_ids: string[];  // Supabase returns uuid[] as string[]
}

export class CoOccurrenceStrategy implements InsightStrategy {
  name = 'CoOccurrenceStrategy';

  // Server-side Supabase client (same pattern as ExampleMatcher)
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async generate(
    context: InsightContext,
    examples: CustomerExample[]
  ): Promise<Insight[]> {
    // 1. Extract all tags from relevant examples
    const inputTags = this.extractRelevantTags(examples);

    if (inputTags.length === 0) {
      return [];
    }

    // 2. Query co-occurrence view via RPC
    const { data: cooccurrences, error } = await this.supabase
      .rpc('get_tag_cooccurrences', {
        input_tags: inputTags,
        min_count: 5,
        max_results: 20
      });

    if (error || !cooccurrences || cooccurrences.length === 0) {
      if (error) {
        console.error('CoOccurrence query failed:', error);
      }
      return [];
    }

    // 3. Filter out tags user already has
    const filtered = (cooccurrences as CoOccurrenceResult[]).filter(
      co => !inputTags.includes(co.tag)
    );

    if (filtered.length === 0) {
      return [];
    }

    // 4. Group by strength (high/medium)
    const highConfidence = filtered.filter(co => co.confidence >= 0.75);
    const mediumConfidence = filtered.filter(co => co.confidence >= 0.5 && co.confidence < 0.75);

    const insights: Insight[] = [];

    // 5. Generate "Strong Pattern" insight (top 3-5 high confidence)
    if (highConfidence.length >= 3) {
      insights.push(this.createStrongPatternInsight(highConfidence.slice(0, 5), context));
    }

    // 6. Generate individual insights for very strong patterns
    for (const co of highConfidence.slice(0, 2)) {
      if (co.cooccurrence_count >= 20) {  // Min 20 examples
        insights.push(this.createIndividualInsight(co, context));
      }
    }

    // 7. Optional: "Consider also" for medium confidence
    if (mediumConfidence.length >= 3 && insights.length < 2) {
      insights.push(this.createConsiderAlsoInsight(mediumConfidence.slice(0, 3), context));
    }

    return insights.slice(0, 3); // Max 3 co-occurrence insights
  }

  /**
   * Extract relevant tags from examples (frequency weighted)
   */
  private extractRelevantTags(examples: CustomerExample[]): string[] {
    const tagCounts = new Map<string, number>();

    examples.forEach(ex => {
      ex.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Return tags die in >30% van examples voorkomen
    const threshold = examples.length * 0.3;
    return Array.from(tagCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([tag]) => tag)
      .slice(0, 10); // Max 10 input tags
  }

  /**
   * Create "Strong Pattern" insight
   */
  private createStrongPatternInsight(
    cooccurrences: CoOccurrenceResult[],
    context: InsightContext
  ): Insight {
    const totalSupport = cooccurrences.reduce((sum, co) => sum + co.cooccurrence_count, 0);

    const bullets = cooccurrences.map(co =>
      `• ${this.humanizeTag(co.tag)} (${co.cooccurrence_count} projecten)`
    ).join('\n');

    return {
      id: `cooccur_strong_${this.generateId()}`,
      type: 'SIMILAR_CHOICE',
      severity: 'tip',
      title: 'Anderen kozen ook vaak voor',
      content: `In projecten vergelijkbaar met de jouwe werd vaak gekozen voor:\n\n${bullets}\n\nGebaseerd op ${totalSupport} vergelijkbare projecten.`,
      sourceExampleIds: cooccurrences.flatMap(co => co.source_example_ids).slice(0, 50),
      confidence: cooccurrences[0].confidence,
      chapter: context.currentChapter,
      tags: cooccurrences.map(co => co.tag),
      metadata: {
        frequency: totalSupport,
      },
    };
  }

  /**
   * Create individual strong pattern insight
   */
  private createIndividualInsight(
    co: CoOccurrenceResult,
    context: InsightContext
  ): Insight {
    const percentage = Math.round(co.cooccurrence_count * 100 / (co.cooccurrence_count + 10)); // Simplified %

    return {
      id: `cooccur_individual_${this.generateId()}`,
      type: 'SIMILAR_CHOICE',
      severity: 'info',
      title: this.humanizeTag(co.tag),
      content: `${percentage}% van vergelijkbare projecten koos ook voor ${this.humanizeTag(co.tag)}. Overweeg dit toe te voegen aan je plan.`,
      sourceExampleIds: co.source_example_ids.slice(0, 50),
      confidence: co.confidence,
      chapter: context.currentChapter,
      tags: [co.tag],
      metadata: {
        frequency: co.cooccurrence_count,
      },
    };
  }

  /**
   * Create "Consider Also" insight for medium confidence
   */
  private createConsiderAlsoInsight(
    cooccurrences: CoOccurrenceResult[],
    context: InsightContext
  ): Insight {
    const bullets = cooccurrences.map(co =>
      `• ${this.humanizeTag(co.tag)}`
    ).join('\n');

    return {
      id: `cooccur_consider_${this.generateId()}`,
      type: 'SIMILAR_CHOICE',
      severity: 'info',
      title: 'Overweeg ook',
      content: `Andere projecten overwogen ook:\n\n${bullets}`,
      sourceExampleIds: cooccurrences.flatMap(co => co.source_example_ids).slice(0, 30),
      confidence: cooccurrences[0].confidence,
      chapter: context.currentChapter,
      tags: cooccurrences.map(co => co.tag),
      metadata: {
        frequency: cooccurrences.reduce((sum, co) => sum + co.cooccurrence_count, 0),
      },
    };
  }

  /**
   * Humanize tag voor display (badkamer → Badkamer, vloer-verwarming → Vloerverwarming)
   */
  private humanizeTag(tag: string): string {
    return tag
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
