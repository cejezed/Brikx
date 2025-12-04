// lib/insights/strategies/RoomBestPracticeStrategy.ts
// Generate ROOM_BEST_PRACTICE insights per ruimte (roomType)
//
// Deze strategy werkt puur op basis van heuristiek:
// - Geen LLM
// - Geen extra Supabase calls
// - Analyseert tags binnen examples om best practices te identificeren

import type { Insight, InsightContext, CustomerExample, InsightStrategy } from '../types';

// Mapping van roomType naar verwachte tags
const ROOM_TAG_MAPPINGS: Record<string, string[]> = {
  badkamer: ['badkamer', 'sanitair', 'douche', 'toilet'],
  keuken: ['keuken', 'kookeiland', 'werkblad'],
  woonkamer: ['woonkamer', 'living', 'zithoek'],
  slaapkamer: ['slaapkamer', 'bedroom', 'slaapruimte'],
  zolder: ['zolder', 'vliering', 'dakkapel'],
  tuin: ['tuin', 'terras', 'buitenruimte'],
};

export class RoomBestPracticeStrategy implements InsightStrategy {
  name = 'RoomBestPracticeStrategy';

  async generate(
    context: InsightContext,
    examples: CustomerExample[]
  ): Promise<Insight[]> {
    if (examples.length === 0) {
      return [];
    }

    // 1. Bepaal roomType uit context
    const roomType = this.detectRoomType(context, examples);

    if (!roomType) {
      return [];
    }

    // 2. Filter examples die relevant zijn voor deze ruimte
    const roomExamples = this.filterExamplesForRoom(examples, roomType);

    if (roomExamples.length < 5) {
      // Te weinig data voor betrouwbare best practices
      return [];
    }

    // 3. Tel alle tags in deze subset
    const tagFrequencies = this.calculateTagFrequencies(roomExamples);

    // 4. Kies de meest voorkomende tags (top 5) met frequentie >40%
    const threshold = roomExamples.length * 0.4;
    const topTags = Object.entries(tagFrequencies)
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    if (topTags.length < 3) {
      // Te weinig consensus voor best practices
      return [];
    }

    // 5. Genereer insight
    const insight = this.createBestPracticeInsight(
      roomType,
      topTags,
      roomExamples,
      context
    );

    return [insight];
  }

  /**
   * Detecteer roomType uit InsightContext
   * Fallback: analyseer tags in examples
   */
  private detectRoomType(context: InsightContext, examples: CustomerExample[]): string | null {
    // Optie 1: Expliciet roomType veld
    if (context.roomType) {
      return context.roomType.toLowerCase().trim();
    }

    // Optie 2: Via chapterAnswers.basis.roomType (aanname)
    const basisData = context.chapterAnswers?.basis as any;
    if (basisData?.roomType) {
      return String(basisData.roomType).toLowerCase().trim();
    }

    // Optie 3: Heuristiek via focusedField
    if (context.focusedField) {
      const [chapter, field] = context.focusedField.split(':');

      // Check of field een ruimte-type suggereert
      for (const [room, keywords] of Object.entries(ROOM_TAG_MAPPINGS)) {
        if (keywords.some(kw => field?.toLowerCase().includes(kw))) {
          return room;
        }
      }
    }

    // Optie 4: Fallback via meest voorkomende room tags in examples
    return this.detectRoomFromExamples(examples);
  }

  /**
   * Detecteer roomType via tag frequentie in examples
   */
  private detectRoomFromExamples(examples: CustomerExample[]): string | null {
    const roomCounts: Record<string, number> = {};

    for (const [room, keywords] of Object.entries(ROOM_TAG_MAPPINGS)) {
      const count = examples.filter(ex =>
        ex.tags.some(tag =>
          keywords.some(kw => tag.toLowerCase().includes(kw))
        )
      ).length;

      if (count > 0) {
        roomCounts[room] = count;
      }
    }

    // Return de ruimte met meeste matches
    const sorted = Object.entries(roomCounts).sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0 && sorted[0][1] >= 3) {
      return sorted[0][0];
    }

    return null;
  }

  /**
   * Filter examples die relevant zijn voor deze ruimte
   */
  private filterExamplesForRoom(
    examples: CustomerExample[],
    roomType: string
  ): CustomerExample[] {
    const roomKeywords = ROOM_TAG_MAPPINGS[roomType] || [roomType];

    return examples.filter(ex =>
      ex.tags.some(tag =>
        roomKeywords.some(kw => tag.toLowerCase().includes(kw))
      ) ||
      ex.interpretation?.chapter?.toLowerCase().includes(roomType)
    );
  }

  /**
   * Bereken tag frequenties in room examples
   */
  private calculateTagFrequencies(examples: CustomerExample[]): Record<string, number> {
    const frequencies: Record<string, number> = {};

    examples.forEach(ex => {
      ex.tags.forEach(tag => {
        const normalized = tag.toLowerCase().trim();
        frequencies[normalized] = (frequencies[normalized] || 0) + 1;
      });
    });

    return frequencies;
  }

  /**
   * Maak ROOM_BEST_PRACTICE insight
   */
  private createBestPracticeInsight(
    roomType: string,
    topTags: string[],
    roomExamples: CustomerExample[],
    context: InsightContext
  ): Insight {
    const roomLabel = this.humanizeRoomType(roomType);

    // Bullets met humanized tags
    const bullets = topTags
      .map(tag => `• ${this.humanizeTag(tag)}`)
      .join('\n');

    const content = `In vergelijkbare projecten werden voor de ${roomLabel} vaak de volgende zaken meegenomen:\n\n${bullets}`;

    // Confidence based op aantal examples + consensus
    const avgFrequency = topTags.reduce((sum, tag) => {
      const freq = roomExamples.filter(ex =>
        ex.tags.some(t => t.toLowerCase() === tag)
      ).length;
      return sum + freq;
    }, 0) / topTags.length;

    const confidence = Math.min(0.7 + (avgFrequency / roomExamples.length) * 0.2, 0.95);

    return {
      id: `room_best_${roomType}_${this.generateId()}`,
      type: 'ROOM_BEST_PRACTICE',
      severity: 'tip',
      title: `Best practices voor de ${roomLabel}`,
      content,
      sourceExampleIds: roomExamples.map(ex => ex.id).slice(0, 50),
      confidence,
      chapter: context.currentChapter,
      tags: topTags,
      metadata: {
        frequency: roomExamples.length,
      },
    };
  }

  /**
   * Humanize room type voor display
   */
  private humanizeRoomType(roomType: string): string {
    const mapping: Record<string, string> = {
      badkamer: 'badkamer',
      keuken: 'keuken',
      woonkamer: 'woonkamer',
      slaapkamer: 'slaapkamer',
      zolder: 'zolder',
      tuin: 'tuin',
    };

    return mapping[roomType] || roomType;
  }

  /**
   * Humanize tag voor display
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
