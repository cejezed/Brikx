// __tests__/ai/FieldWatcher.test.ts
// Test suite for FieldWatcher module
// Week 1, Day 3 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type { FieldTrigger } from '@/types/ai';
import type { WizardState } from '@/types/project';

// Import the module under test
import { FieldWatcher } from '@/lib/ai/FieldWatcher';

describe('FieldWatcher', () => {
  let fieldWatcher: FieldWatcher;

  // Base wizard state for testing (matches actual v3.5 structure)
  const createBaseState = (): WizardState => ({
    stateVersion: 1,
    chapterAnswers: {},
    currentChapter: 'basis',
  });

  beforeEach(() => {
    fieldWatcher = new FieldWatcher();
  });

  // ============================================================================
  // TEST SUITE 1: Source Tracking (CRITICAL - Loop Prevention)
  // ============================================================================

  describe('source tracking (loop prevention)', () => {
    it('generates triggers when source === "user"', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers.every((t: FieldTrigger) => t.source === 'user')).toBe(true);
    });

    it('returns EMPTY array when source === "ai" (prevents loops)', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'ai');

      expect(triggers).toEqual([]);
    });

    it('returns EMPTY array when source === "system" (prevents loops)', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'system');

      expect(triggers).toEqual([]);
    });
  });

  // ============================================================================
  // TEST SUITE 2: Budget Field Detection
  // ============================================================================

  describe('budget field detection', () => {
    it('triggers when budgetTotaal is set for the first time', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers.length).toBeGreaterThan(0);
      const budgetTrigger = triggers.find((t: FieldTrigger) => t.fieldPath.includes('budget'));
      expect(budgetTrigger).toBeDefined();
    });

    it('triggers when budgetTotaal is changed', () => {
      const prevState: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 300000 },
        },
      };
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers.length).toBeGreaterThan(0);
    });

    it('does NOT trigger when budgetTotaal stays the same', () => {
      const prevState: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers).toEqual([]);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Multiple Field Changes
  // ============================================================================

  describe('multiple field changes', () => {
    it('detects all changed fields in a single update', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
          ruimtes: { rooms: [{ id: 'room-1', name: 'Keuken', type: 'kitchen', m2: 20 }] },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers.length).toBeGreaterThan(1);
    });

    it('deduplicates identical field paths', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      const fieldPaths = triggers.map((t: FieldTrigger) => t.fieldPath);
      const uniquePaths = new Set(fieldPaths);
      expect(fieldPaths.length).toBe(uniquePaths.size); // No duplicates
    });
  });

  // ============================================================================
  // TEST SUITE 4: No Changes
  // ============================================================================

  describe('no changes', () => {
    it('returns empty array when states are identical', () => {
      const state = createBaseState();

      const triggers = fieldWatcher.detectFieldTriggers(state, state, 'user');

      expect(triggers).toEqual([]);
    });

    it('returns empty array when only metadata changes', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        currentChapter: 'budget',
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      // currentChapter is metadata, should not generate triggers for chapterAnswers
      expect(triggers).toEqual([]);
    });
  });

  // ============================================================================
  // TEST SUITE 5: Confidence Scoring
  // ============================================================================

  describe('confidence scoring', () => {
    it('assigns confidence >= 0.7 for field changes', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      triggers.forEach((trigger: FieldTrigger) => {
        expect(trigger.confidence).toBeGreaterThanOrEqual(0.7);
        expect(trigger.confidence).toBeLessThanOrEqual(1.0);
      });
    });
  });

  // ============================================================================
  // TEST SUITE 6: Timestamp
  // ============================================================================

  describe('timestamps', () => {
    it('assigns current timestamp to all triggers', () => {
      const prevState = createBaseState();
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const before = Date.now();
      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');
      const after = Date.now();

      triggers.forEach((trigger: FieldTrigger) => {
        expect(trigger.timestamp).toBeGreaterThanOrEqual(before);
        expect(trigger.timestamp).toBeLessThanOrEqual(after);
      });
    });
  });

  // ============================================================================
  // TEST SUITE 7: Deep Object Changes
  // ============================================================================

  describe('deep object changes', () => {
    it('detects nested field changes in budget', () => {
      const prevState: WizardState = {
        ...createBaseState(),
        chapterAnswers: {
          budget: {
            budgetTotaal: 500000,
            contingency: 5000,
          },
        },
      };
      const nextState: WizardState = {
        ...prevState,
        chapterAnswers: {
          budget: {
            budgetTotaal: 500000,
            contingency: 10000,
          },
        },
      };

      const triggers = fieldWatcher.detectFieldTriggers(prevState, nextState, 'user');

      expect(triggers.length).toBeGreaterThan(0);
      const contingencyTrigger = triggers.find((t: FieldTrigger) =>
        t.fieldPath.includes('contingency')
      );
      expect(contingencyTrigger).toBeDefined();
    });
  });
});
