// lib/ai/FieldWatcher.ts
// Week 1, Day 3 - Field Watcher Module
// Purpose: Detect relevant wizard state changes and generate field triggers

import type { WizardState } from '@/types/project';
import type { FieldTrigger } from '@/types/ai';

/**
 * FieldWatcher - Detects relevant field changes in WizardState
 *
 * CRITICAL RULE: Only triggers when source === "user" to prevent infinite loops
 *
 * Responsibilities:
 * - Deep-compare prev vs next WizardState
 * - Generate FieldTriggers for significant changes
 * - Map field paths to correct chapters
 * - Assign confidence scores
 */
export class FieldWatcher {
  /**
   * Detects field triggers from state changes.
   *
   * @param prevState - Previous wizard state
   * @param nextState - New wizard state
   * @param source - Source of the change ('user', 'ai', or 'system')
   * @returns Array of FieldTriggers (empty if source !== 'user')
   *
   * CRITICAL: Returns empty array if source !== 'user' to prevent AI feedback loops
   */
  detectFieldTriggers(
    prevState: WizardState,
    nextState: WizardState,
    source: 'user' | 'ai' | 'system'
  ): FieldTrigger[] {
    // CRITICAL: Loop prevention - only trigger on user changes
    if (source !== 'user') {
      return [];
    }

    const triggers: FieldTrigger[] = [];
    const timestamp = Date.now();

    // Detect changes in chapterAnswers (the main data structure)
    const prevAnswers = prevState.chapterAnswers || {};
    const nextAnswers = nextState.chapterAnswers || {};

    // Check each chapter for changes
    const allChapters = new Set([
      ...Object.keys(prevAnswers),
      ...Object.keys(nextAnswers),
    ]);

    for (const chapter of allChapters) {
      const prevChapterData = (prevAnswers as any)[chapter];
      const nextChapterData = (nextAnswers as any)[chapter];

      // Detect deep changes in this chapter
      const chapterTriggers = this.detectChapterChanges(
        chapter,
        prevChapterData,
        nextChapterData,
        source,
        timestamp
      );

      triggers.push(...chapterTriggers);
    }

    // Deduplicate by field path (keep last occurrence)
    return this.deduplicateTriggers(triggers);
  }

  /**
   * Detects changes within a specific chapter's data.
   * @private
   */
  private detectChapterChanges(
    chapter: string,
    prevData: any,
    nextData: any,
    source: 'user' | 'ai' | 'system',
    timestamp: number
  ): FieldTrigger[] {
    const triggers: FieldTrigger[] = [];

    // If one is undefined and the other isn't, it's a change
    if (!prevData && nextData) {
      // New chapter data added
      triggers.push({
        fieldPath: chapter,
        chapter: chapter as any,
        previousValue: null,
        newValue: nextData,
        confidence: 1.0,
        source,
        timestamp,
      });
      return triggers;
    }

    if (prevData && !nextData) {
      // Chapter data removed (rare)
      triggers.push({
        fieldPath: chapter,
        chapter: chapter as any,
        previousValue: prevData,
        newValue: null,
        confidence: 1.0,
        source,
        timestamp,
      });
      return triggers;
    }

    // Deep comparison of chapter data
    if (prevData && nextData) {
      const fieldChanges = this.detectFieldChangesInObject(
        chapter,
        prevData,
        nextData,
        chapter as any,
        source,
        timestamp
      );
      triggers.push(...fieldChanges);
    }

    return triggers;
  }

  /**
   * Recursively detects field changes in objects.
   * @private
   */
  private detectFieldChangesInObject(
    basePath: string,
    prevObj: any,
    nextObj: any,
    chapter: any,
    source: 'user' | 'ai' | 'system',
    timestamp: number,
    depth: number = 0
  ): FieldTrigger[] {
    const triggers: FieldTrigger[] = [];

    // Prevent infinite recursion
    if (depth > 5) return triggers;

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(prevObj || {}), ...Object.keys(nextObj || {})]);

    for (const key of allKeys) {
      const prevValue = prevObj?.[key];
      const nextValue = nextObj?.[key];

      const fieldPath = `${basePath}.${key}`;

      // Skip if values are identical (deep equality for primitives and simple objects)
      if (this.isEqual(prevValue, nextValue)) {
        continue;
      }

      // If both are objects (but not arrays), recurse
      if (
        this.isPlainObject(prevValue) &&
        this.isPlainObject(nextValue) &&
        !Array.isArray(prevValue) &&
        !Array.isArray(nextValue)
      ) {
        const nestedTriggers = this.detectFieldChangesInObject(
          fieldPath,
          prevValue,
          nextValue,
          chapter,
          source,
          timestamp,
          depth + 1
        );
        triggers.push(...nestedTriggers);
        continue;
      }

      // Value changed - create trigger
      triggers.push({
        fieldPath,
        chapter,
        previousValue: prevValue,
        newValue: nextValue,
        confidence: this.calculateConfidence(prevValue, nextValue, depth),
        source,
        timestamp,
      });
    }

    return triggers;
  }

  /**
   * Calculates confidence score for a field change.
   * @private
   */
  private calculateConfidence(prevValue: any, nextValue: any, depth: number): number {
    // Explicit field changes have highest confidence
    if (prevValue === null || prevValue === undefined) {
      return 1.0;
    }

    // Nested changes have slightly lower confidence
    const depthPenalty = Math.min(depth * 0.1, 0.3);
    return Math.max(0.7, 1.0 - depthPenalty);
  }

  /**
   * Checks if two values are equal (deep comparison for objects/arrays).
   * @private
   */
  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    if (this.isPlainObject(a) && this.isPlainObject(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => this.isEqual(a[key], b[key]));
    }

    return false;
  }

  /**
   * Checks if value is a plain object (not array, null, or class instance).
   * @private
   */
  private isPlainObject(value: any): boolean {
    if (value === null || typeof value !== 'object') return false;
    return Object.getPrototypeOf(value) === Object.prototype;
  }

  /**
   * Deduplicates triggers by fieldPath, keeping the last occurrence.
   * @private
   */
  private deduplicateTriggers(triggers: FieldTrigger[]): FieldTrigger[] {
    const triggerMap = new Map<string, FieldTrigger>();

    for (const trigger of triggers) {
      triggerMap.set(trigger.fieldPath, trigger);
    }

    return Array.from(triggerMap.values());
  }
}
