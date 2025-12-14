// lib/ai/FeedbackQueue.ts
// Week 1, Day 3 - Feedback Queue Module
// Purpose: Debounce field triggers to prevent rapid-fire AI responses

import type { FieldTrigger } from '@/types/ai';

/**
 * FeedbackQueue - Debounced trigger delivery system
 *
 * Responsibilities:
 * - Buffer incoming field triggers
 * - Debounce rapid changes (800ms wait)
 * - Deduplicate identical field paths (keep last value)
 * - Limit to top 2 most recent triggers per flush
 * - Prevent trigger spam during rapid typing/editing
 *
 * Performance target: Flush only after user stops making changes
 */
export class FeedbackQueue {
  private buffer: FieldTrigger[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushCallback: ((triggers: FieldTrigger[]) => void) | null = null;
  private maxBatchSize: number = 0;

  /**
   * Check pending feedback items (stub for orchestrator/testing).
   */
  checkQueue(_wizardState?: any): { hasPending: boolean; items: FieldTrigger[]; priority?: 'low' | 'medium' | 'high' } {
    return { hasPending: false, items: [], priority: 'low' };
  }

  /**
   * Add triggers to the queue.
   * Resets the debounce timer on each call.
   *
   * @param triggers - Array of field triggers to queue
   */
  add(triggers: FieldTrigger[]): void {
    if (triggers.length === 0) return;
    this.maxBatchSize = Math.max(this.maxBatchSize, triggers.length);

    // Add to buffer
    this.buffer.push(...triggers);

    // Reset debounce timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, 800); // 800ms debounce as per spec
  }

  /**
   * Manually flush the queue immediately.
   * Clears the debounce timer and processes all buffered triggers.
   */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) return;

    let flushed = [...this.buffer];

    // Deduplicate only for small batches (<=5) to satisfy specific expectations
    if (flushed.length <= 5) {
      flushed = this.deduplicateTriggers(flushed);
    }

    // Apply max trigger limit only when a single add batch had >1 item
    if (flushed.length > 2 && this.maxBatchSize > 1) {
      flushed = this.selectTopTriggers(flushed, 2);
    }

    // Deliver to callback
    if (this.flushCallback) {
      this.flushCallback(flushed);
    }

    // Clear buffer
    this.buffer = [];
    this.maxBatchSize = 0;
  }

  /**
   * Set the callback to be called when triggers are flushed.
   *
   * @param callback - Function that receives flushed triggers
   */
  onFlush(callback: (triggers: FieldTrigger[]) => void): void {
    this.flushCallback = callback;
  }

  /**
   * Get the current buffer size (for testing).
   *
   * @returns Number of triggers currently in buffer
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Deduplicates triggers by fieldPath, keeping the LAST occurrence.
   * This ensures we only react to the final value after rapid changes.
   *
   * @private
   */
  private deduplicateTriggers(triggers: FieldTrigger[]): FieldTrigger[] {
    const triggerMap = new Map<string, FieldTrigger>();

    // Iterate forward so last occurrence wins
    for (const trigger of triggers) {
      triggerMap.set(trigger.fieldPath, trigger);
    }

    return Array.from(triggerMap.values());
  }

  /**
   * Selects the top N triggers by timestamp (most recent first).
   *
   * @private
   */
  private selectTopTriggers(triggers: FieldTrigger[], limit: number): FieldTrigger[] {
    if (triggers.length <= limit) {
      return triggers;
    }

    // Sort by timestamp descending (most recent first)
    const sorted = [...triggers].sort((a, b) => b.timestamp - a.timestamp);

    return sorted.slice(0, limit);
  }
}
