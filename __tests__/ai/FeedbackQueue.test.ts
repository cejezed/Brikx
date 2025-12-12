// __tests__/ai/FeedbackQueue.test.ts
// Test suite for FeedbackQueue module
// Week 1, Day 3 - Test-First Development

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FieldTrigger } from '@/types/ai';

// Import the module under test (will be implemented after tests)
import { FeedbackQueue } from '@/lib/ai/FeedbackQueue';

describe('FeedbackQueue', () => {
  let feedbackQueue: FeedbackQueue;

  // Helper to create a test trigger
  const createTrigger = (fieldPath: string, value: any = 100): FieldTrigger => ({
    fieldPath,
    chapter: 'budget',
    previousValue: null,
    newValue: value,
    confidence: 1.0,
    source: 'user',
    timestamp: Date.now(),
  });

  beforeEach(() => {
    vi.useFakeTimers();
    feedbackQueue = new FeedbackQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // TEST SUITE 1: Basic Queueing
  // ============================================================================

  describe('basic queueing', () => {
    it('accepts a single trigger', () => {
      const trigger = createTrigger('budget.budgetTotaal');

      feedbackQueue.add([trigger]);

      // Should be in buffer (not yet flushed)
      expect(feedbackQueue.getBufferSize()).toBe(1);
    });

    it('accepts multiple triggers at once', () => {
      const triggers = [
        createTrigger('budget.budgetTotaal'),
        createTrigger('budget.budgetFlexible'),
      ];

      feedbackQueue.add(triggers);

      expect(feedbackQueue.getBufferSize()).toBe(2);
    });

    it('accumulates triggers from multiple add() calls', () => {
      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);
      feedbackQueue.add([createTrigger('ruimtes.rooms')]);

      expect(feedbackQueue.getBufferSize()).toBe(2);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Debouncing (CRITICAL)
  // ============================================================================

  describe('debouncing', () => {
    it('does NOT flush immediately after add()', () => {
      const trigger = createTrigger('budget.budgetTotaal');
      const onFlush = vi.fn();

      feedbackQueue.onFlush(onFlush);
      feedbackQueue.add([trigger]);

      expect(onFlush).not.toHaveBeenCalled();
    });

    it('flushes after 800ms debounce period', () => {
      const trigger = createTrigger('budget.budgetTotaal');
      const onFlush = vi.fn();

      feedbackQueue.onFlush(onFlush);
      feedbackQueue.add([trigger]);

      vi.advanceTimersByTime(800);

      expect(onFlush).toHaveBeenCalledTimes(1);
      expect(onFlush).toHaveBeenCalledWith([trigger]);
    });

    it('resets debounce timer when new trigger arrives', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);
      vi.advanceTimersByTime(600); // Not yet 800ms

      feedbackQueue.add([createTrigger('ruimtes.rooms')]);
      vi.advanceTimersByTime(600); // Another 600ms (total 1200ms from first add)

      // Should NOT have flushed yet (timer was reset)
      expect(onFlush).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200); // Now 800ms from second add

      expect(onFlush).toHaveBeenCalledTimes(1);
      expect(onFlush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ fieldPath: 'budget.budgetTotaal' }),
          expect.objectContaining({ fieldPath: 'ruimtes.rooms' }),
        ])
      );
    });

    it('prevents rapid-fire flushes during quick field changes', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      // Simulate rapid typing (every 100ms for 1 second)
      for (let i = 0; i < 10; i++) {
        feedbackQueue.add([createTrigger('budget.budgetTotaal', 100000 + i * 10000)]);
        vi.advanceTimersByTime(100);
      }

      // Should NOT have flushed during the rapid changes
      expect(onFlush).not.toHaveBeenCalled();

      // Wait for debounce
      vi.advanceTimersByTime(800);

      // Should flush exactly once with all accumulated triggers
      expect(onFlush).toHaveBeenCalledTimes(1);
      expect(onFlush.mock.calls[0][0]).toHaveLength(10);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Deduplication
  // ============================================================================

  describe('deduplication', () => {
    it('deduplicates identical fieldPaths', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('budget.budgetTotaal', 100)]);
      feedbackQueue.add([createTrigger('budget.budgetTotaal', 200)]);
      feedbackQueue.add([createTrigger('budget.budgetTotaal', 300)]);

      vi.advanceTimersByTime(800);

      expect(onFlush).toHaveBeenCalledTimes(1);
      const flushedTriggers = onFlush.mock.calls[0][0];

      // Should only keep the LAST value for the same field
      expect(flushedTriggers).toHaveLength(1);
      expect(flushedTriggers[0].fieldPath).toBe('budget.budgetTotaal');
      expect(flushedTriggers[0].newValue).toBe(300);
    });

    it('keeps different fieldPaths separate', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('budget.budgetTotaal', 100)]);
      feedbackQueue.add([createTrigger('budget.budgetFlexible', 200)]);

      vi.advanceTimersByTime(800);

      const flushedTriggers = onFlush.mock.calls[0][0];
      expect(flushedTriggers).toHaveLength(2);
    });

    it('deduplicates multiple identical triggers in same batch', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([
        createTrigger('budget.budgetTotaal', 100),
        createTrigger('budget.budgetTotaal', 200),
        createTrigger('ruimtes.rooms', 'data'),
      ]);

      vi.advanceTimersByTime(800);

      const flushedTriggers = onFlush.mock.calls[0][0];
      expect(flushedTriggers).toHaveLength(2);
      expect(flushedTriggers.find((t: FieldTrigger) => t.fieldPath === 'budget.budgetTotaal')?.newValue).toBe(
        200
      );
    });
  });

  // ============================================================================
  // TEST SUITE 4: Max Triggers Limit
  // ============================================================================

  describe('max triggers limit', () => {
    it('limits flushed triggers to top 2 by timestamp (most recent)', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      // Add 5 triggers with incrementing timestamps
      feedbackQueue.add([
        { ...createTrigger('field1'), timestamp: 1000 },
        { ...createTrigger('field2'), timestamp: 2000 },
        { ...createTrigger('field3'), timestamp: 3000 },
        { ...createTrigger('field4'), timestamp: 4000 },
        { ...createTrigger('field5'), timestamp: 5000 },
      ]);

      vi.advanceTimersByTime(800);

      const flushedTriggers = onFlush.mock.calls[0][0];
      expect(flushedTriggers).toHaveLength(2);

      // Should be the 2 most recent (highest timestamps)
      expect(flushedTriggers[0].timestamp).toBe(5000);
      expect(flushedTriggers[1].timestamp).toBe(4000);
    });

    it('flushes all triggers if count <= 2', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('field1'), createTrigger('field2')]);

      vi.advanceTimersByTime(800);

      const flushedTriggers = onFlush.mock.calls[0][0];
      expect(flushedTriggers).toHaveLength(2);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Buffer Management
  // ============================================================================

  describe('buffer management', () => {
    it('clears buffer after flush', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);
      expect(feedbackQueue.getBufferSize()).toBe(1);

      vi.advanceTimersByTime(800);

      expect(feedbackQueue.getBufferSize()).toBe(0);
    });

    it('allows new triggers after flush', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      // First batch
      feedbackQueue.add([createTrigger('field1')]);
      vi.advanceTimersByTime(800);

      expect(onFlush).toHaveBeenCalledTimes(1);

      // Second batch
      feedbackQueue.add([createTrigger('field2')]);
      vi.advanceTimersByTime(800);

      expect(onFlush).toHaveBeenCalledTimes(2);
      expect(onFlush.mock.calls[1][0][0].fieldPath).toBe('field2');
    });

    it('handles manual flush() call', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);
      feedbackQueue.flush(); // Manual flush

      expect(onFlush).toHaveBeenCalledTimes(1);
      expect(feedbackQueue.getBufferSize()).toBe(0);
    });

    it('does nothing when flush() called on empty buffer', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.flush();

      expect(onFlush).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TEST SUITE 6: onFlush Callback
  // ============================================================================

  describe('onFlush callback', () => {
    it('allows setting onFlush callback', () => {
      const callback = vi.fn();

      feedbackQueue.onFlush(callback);
      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);
      vi.advanceTimersByTime(800);

      expect(callback).toHaveBeenCalled();
    });

    it('allows changing onFlush callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      feedbackQueue.onFlush(callback1);
      feedbackQueue.add([createTrigger('field1')]);
      vi.advanceTimersByTime(800);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      feedbackQueue.onFlush(callback2);
      feedbackQueue.add([createTrigger('field2')]);
      vi.advanceTimersByTime(800);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('handles missing callback gracefully', () => {
      feedbackQueue.add([createTrigger('budget.budgetTotaal')]);

      expect(() => {
        vi.advanceTimersByTime(800);
      }).not.toThrow();
    });
  });

  // ============================================================================
  // TEST SUITE 7: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty trigger array', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      feedbackQueue.add([]);

      vi.advanceTimersByTime(800);

      expect(onFlush).not.toHaveBeenCalled();
    });

    it('handles very large batches of triggers', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      const largeBatch = Array.from({ length: 100 }, (_, i) =>
        createTrigger(`field${i}`)
      );

      feedbackQueue.add(largeBatch);
      vi.advanceTimersByTime(800);

      expect(onFlush).toHaveBeenCalledTimes(1);
      const flushedTriggers = onFlush.mock.calls[0][0];

      // Should limit to top 2
      expect(flushedTriggers).toHaveLength(2);
    });

    it('preserves trigger source property', () => {
      const onFlush = vi.fn();
      feedbackQueue.onFlush(onFlush);

      const trigger = { ...createTrigger('budget.budgetTotaal'), source: 'user' as const };
      feedbackQueue.add([trigger]);

      vi.advanceTimersByTime(800);

      const flushedTriggers = onFlush.mock.calls[0][0];
      expect(flushedTriggers[0].source).toBe('user');
    });
  });
});
