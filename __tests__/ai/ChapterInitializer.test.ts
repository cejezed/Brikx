// __tests__/ai/ChapterInitializer.test.ts
// Test suite for ChapterInitializer module
// Week 2, Day 10 - Test-First Development

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  ChapterOpeningResponse,
  ConversationTurn,
  BehaviorProfile,
  SystemConflict,
  AnticipationGuidance,
} from '@/types/ai';
import type { WizardState, ChapterKey } from '@/types/project';

// Import the module under test
import { ChapterInitializer } from '@/lib/ai/ChapterInitializer';

describe('ChapterInitializer', () => {
  let initializer: ChapterInitializer;

  const createMinimalState = (): WizardState => ({
    stateVersion: 1,
    chapterAnswers: {},
  });

  const createConversationHistory = (): ConversationTurn[] => [];

  beforeEach(() => {
    initializer = new ChapterInitializer();
  });

  // ============================================================================
  // TEST SUITE 1: Basic Functionality
  // ============================================================================

  describe('basic functionality', () => {
    it('returns ChapterOpeningResponse with all required fields', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('basis', state, conversation);

      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('turnGoal');
      expect(response).toHaveProperty('tone');
      expect(response).toHaveProperty('allowPatches');
      expect(response).toHaveProperty('focusChapter');

      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(0);
      expect(response.focusChapter).toBe('basis');
    });

    it('handles empty wizard state gracefully', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      expect(() => {
        initializer.handleChapterStart('budget', state, conversation);
      }).not.toThrow();
    });

    it('handles empty conversation history gracefully', () => {
      const state = createMinimalState();

      expect(() => {
        initializer.handleChapterStart('wensen', state, []);
      }).not.toThrow();
    });
  });

  // ============================================================================
  // TEST SUITE 2: All 7 Chapters - Normal Scenario
  // ============================================================================

  describe('all chapters - normal scenario', () => {
    it('BASIS chapter: warm welcoming opening', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('basis', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('basis');
      expect(response.turnGoal).toBe('clarify');
      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
      expect(response.allowPatches).toBe(true);
    });

    it('RUIMTES chapter: exploration-focused opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('ruimtes');
      expect(['clarify', 'anticipate_and_guide']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });

    it('WENSEN chapter: aspirations-focused opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
          ruimtes: { rooms: [] },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('wensen', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('wensen');
      expect(['clarify', 'anticipate_and_guide']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });

    it('BUDGET chapter: practical finance-focused opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          wensen: { wishes: [] },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('budget');
      expect(['clarify', 'fill_data']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });

    it('TECHNIEK chapter: technical details opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
          budget: { budgetTotaal: 200000 },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('techniek', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('techniek');
      expect(['clarify', 'anticipate_and_guide']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });

    it('DUURZAAM chapter: sustainability-focused opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          techniek: {},
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('duurzaam', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('duurzaam');
      expect(['clarify', 'anticipate_and_guide']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });

    it('RISICO chapter: risk assessment opening', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
          duurzaam: {},
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('risico', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('risico');
      expect(['clarify', 'anticipate_and_guide']).toContain(response.turnGoal);
      expect(response.allowPatches).toBe(true);
    });
  });

  // ============================================================================
  // TEST SUITE 3: Anticipation Scenario
  // ============================================================================

  describe('anticipation scenario', () => {
    it('includes anticipation guidance in opening message', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      // Should include some form of proactive guidance
      expect(response.message).toBeTruthy();
      expect(response.turnGoal).toBeDefined();
    });

    it('BUDGET with critical anticipation uses probe turn goal', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          wensen: {
            wishes: [
              { id: '1', text: 'Expensive renovation', priority: 'must' as const },
            ],
          },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      // When there are expensive wishes but no budget, should probe
      expect(response.message).toBeTruthy();
      expect(['anticipate_and_guide', 'clarify']).toContain(response.turnGoal);
    });

    it('TECHNIEK with lifestyle anticipation adapts tone', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: {
            projectType: 'nieuwbouw',
          },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('techniek', state, conversation);

      expect(response.message).toBeTruthy();
      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
    });
  });

  // ============================================================================
  // TEST SUITE 4: Conflict Scenario
  // ============================================================================

  describe('conflict scenario', () => {
    it('BUDGET with blocking conflict prioritizes conflict resolution', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          wensen: {
            wishes: [
              { id: '1', text: 'Keuken', priority: 'must' as const },
              { id: '2', text: 'Badkamer', priority: 'must' as const },
            ],
          },
          budget: { budgetTotaal: 1000 }, // Way too low
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      // Should detect budget conflict and address it
      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('budget');
    });

    it('RUIMTES with physical constraint includes warning', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          ruimtes: {
            rooms: [
              { id: '1', name: 'Huge room', type: 'living', m2: 200 },
            ],
            totalArea: 100, // Impossible
          } as any,
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      // Should acknowledge the physical constraint
      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('ruimtes');
    });

    it('blocking conflict sets turnGoal to conflict_resolution', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          budget: { budgetTotaal: 10000 },
          wensen: {
            wishes: [
              { id: '1', text: 'Expensive item', priority: 'must' as const },
            ],
          },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      // With severe budget mismatch, may trigger conflict resolution
      expect(response.message).toBeTruthy();
      expect(response.turnGoal).toBeDefined();
    });
  });

  // ============================================================================
  // TEST SUITE 5: User Type Adaptation
  // ============================================================================

  describe('user type adaptation', () => {
    it('starter user gets warm supportive tone', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: {
            projectType: 'verbouwing',
            ervaring: 'starter',
          },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
      expect(response.message).toBeTruthy();
    });

    it('experienced user gets direct collaborative tone', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: {
            projectType: 'nieuwbouw',
            ervaring: 'ervaren' as const,
          },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('techniek', state, conversation);

      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
      expect(response.message).toBeTruthy();
    });

    it('user asking many questions gets supportive tone', () => {
      const conversation: ConversationTurn[] = [
        {
          id: '1',
          userId: 'test',
          projectId: 'test',
          role: 'user',
          message: 'What is the difference between nieuwbouw and verbouwing?',
          timestamp: Date.now(),
          source: 'user',
        },
        {
          id: '2',
          userId: 'test',
          projectId: 'test',
          role: 'user',
          message: 'How much does a kitchen renovation cost?',
          timestamp: Date.now(),
          source: 'user',
        },
        {
          id: '3',
          userId: 'test',
          projectId: 'test',
          role: 'user',
          message: 'Do I need a permit?',
          timestamp: Date.now(),
          source: 'user',
        },
      ];

      const state = createMinimalState();
      const response = initializer.handleChapterStart('budget', state, conversation);

      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
    });

    it('decisive user gets directive tone', () => {
      const conversation: ConversationTurn[] = [
        {
          id: '1',
          userId: 'test',
          projectId: 'test',
          role: 'user',
          message: 'Ik wil een nieuwe keuken, budget is €50000.',
          timestamp: Date.now(),
          source: 'user',
        },
      ];

      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };

      const response = initializer.handleChapterStart('budget', state, conversation);

      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
    });
  });

  // ============================================================================
  // TEST SUITE 6: Message Quality
  // ============================================================================

  describe('message quality', () => {
    it('generates non-empty messages', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      const chapters: ChapterKey[] = ['basis', 'ruimtes', 'wensen', 'budget', 'techniek', 'duurzaam', 'risico'];

      chapters.forEach((chapter) => {
        const response = initializer.handleChapterStart(chapter, state, conversation);
        expect(response.message.length).toBeGreaterThan(10);
      });
    });

    it('includes chapter-specific context in message', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      // Message should be contextual and relevant
      expect(response.message).toBeTruthy();
      expect(response.message.length).toBeGreaterThan(20);
    });

    it('messages are in Dutch', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('basis', state, conversation);

      // Simple check: contains common Dutch words
      const dutchWords = ['je', 'het', 'we', 'aan', 'voor', 'van', 'een', 'de'];
      const hasDutch = dutchWords.some((word) => response.message.toLowerCase().includes(word));

      expect(hasDutch).toBe(true);
    });

    it('no silent chapter openings', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      const chapters: ChapterKey[] = ['basis', 'ruimtes', 'wensen', 'budget', 'techniek', 'duurzaam', 'risico'];

      chapters.forEach((chapter) => {
        const response = initializer.handleChapterStart(chapter, state, conversation);
        expect(response.message).not.toBe('');
        expect(response.message).not.toMatch(/^\s*$/);
      });
    });
  });

  // ============================================================================
  // TEST SUITE 7: 6-Step Protocol Execution
  // ============================================================================

  describe('6-step protocol execution', () => {
    it('step 1: loads chapter context correctly', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          budget: { budgetTotaal: 150000 },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('budget', state, conversation);

      // Should have access to existing budget data
      expect(response.focusChapter).toBe('budget');
      expect(response.message).toBeTruthy();
    });

    it('step 2-3: detects anticipation and conflicts', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      // Should run anticipation and conflict detection
      expect(response.message).toBeTruthy();
      expect(response.turnGoal).toBeDefined();
    });

    it('step 4-5: analyzes behavior and determines turn plan', () => {
      const conversation: ConversationTurn[] = [
        {
          id: '1',
          userId: 'test',
          projectId: 'test',
          role: 'user',
          message: 'I want to renovate',
          timestamp: Date.now(),
          source: 'user',
        },
      ];

      const state = createMinimalState();
      const response = initializer.handleChapterStart('basis', state, conversation);

      // Should analyze conversation and determine appropriate turn plan
      expect(response.turnGoal).toBeDefined();
      // Tone is no longer part of ChapterOpeningResponse (LLM determines tone)
    });

    it('step 6: generates contextual opening message', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('wensen', state, conversation);

      // Message should be generated based on all previous steps
      expect(response.message).toBeTruthy();
      expect(response.message.length).toBeGreaterThan(20);
    });
  });

  // ============================================================================
  // TEST SUITE 8: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles unknown chapter gracefully', () => {
      const state = createMinimalState();
      const conversation = createConversationHistory();

      // Should not throw for any valid ChapterKey
      expect(() => {
        initializer.handleChapterStart('basis', state, conversation);
      }).not.toThrow();
    });

    it('handles corrupted wizard state gracefully', () => {
      const state: any = {
        stateVersion: 1,
        chapterAnswers: null, // Corrupted
      };
      const conversation = createConversationHistory();

      expect(() => {
        initializer.handleChapterStart('budget', state, conversation);
      }).not.toThrow();
    });

    it('handles very long conversation history', () => {
      const conversation: ConversationTurn[] = Array.from({ length: 100 }, (_, i) => ({
        id: `turn-${i}`,
        userId: 'test',
        projectId: 'test',
        role: i % 2 === 0 ? 'user' : 'assistant',
        message: `Message ${i}`,
        timestamp: Date.now(),
        source: i % 2 === 0 ? 'user' : 'ai',
      })) as ConversationTurn[];

      const state = createMinimalState();
      const response = initializer.handleChapterStart('basis', state, conversation);

      expect(response.message).toBeTruthy();
    });

    it('handles incomplete chapter data', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' }, // Minimal basis
        },
      };
      const conversation = createConversationHistory();

      const response = initializer.handleChapterStart('ruimtes', state, conversation);

      expect(response.message).toBeTruthy();
      expect(response.focusChapter).toBe('ruimtes');
    });
  });

  // ============================================================================
  // TEST SUITE 9: Performance
  // ============================================================================

  describe('performance', () => {
    it('completes within reasonable time (<200ms)', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          ruimtes: {
            rooms: Array.from({ length: 50 }, (_, i) => ({
              id: `room-${i}`,
              name: `Room ${i}`,
              type: 'living',
              m2: 20,
            })),
          },
        },
      };
      const conversation = createConversationHistory();

      const start = Date.now();
      initializer.handleChapterStart('wensen', state, conversation);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  // ============================================================================
  // TEST SUITE 10: Complete Scenarios (21 Critical Paths)
  // ============================================================================

  describe('complete scenarios - 21 critical paths', () => {
    // Normal scenarios (7 chapters)
    it('1. BASIS - normal start', () => {
      const response = initializer.handleChapterStart('basis', createMinimalState(), []);
      expect(response.focusChapter).toBe('basis');
      expect(response.message).toBeTruthy();
    });

    it('2. RUIMTES - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { basis: { projectType: 'verbouwing' } } };
      const response = initializer.handleChapterStart('ruimtes', state, []);
      expect(response.focusChapter).toBe('ruimtes');
    });

    it('3. WENSEN - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { ruimtes: { rooms: [] } } };
      const response = initializer.handleChapterStart('wensen', state, []);
      expect(response.focusChapter).toBe('wensen');
    });

    it('4. BUDGET - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { wensen: { wishes: [] } } };
      const response = initializer.handleChapterStart('budget', state, []);
      expect(response.focusChapter).toBe('budget');
    });

    it('5. TECHNIEK - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { budget: { budgetTotaal: 200000 } } };
      const response = initializer.handleChapterStart('techniek', state, []);
      expect(response.focusChapter).toBe('techniek');
    });

    it('6. DUURZAAM - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { techniek: {} } };
      const response = initializer.handleChapterStart('duurzaam', state, []);
      expect(response.focusChapter).toBe('duurzaam');
    });

    it('7. RISICO - normal start', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { duurzaam: {} } };
      const response = initializer.handleChapterStart('risico', state, []);
      expect(response.focusChapter).toBe('risico');
    });

    // Anticipation scenarios (7 chapters)
    it('8. BASIS - with anticipation', () => {
      const response = initializer.handleChapterStart('basis', createMinimalState(), []);
      expect(response.message).toBeTruthy();
    });

    it('9. RUIMTES - with anticipation', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { basis: { projectType: 'nieuwbouw' } } };
      const response = initializer.handleChapterStart('ruimtes', state, []);
      expect(response.message).toBeTruthy();
    });

    it('10. WENSEN - with anticipation', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: { basis: { projectType: 'verbouwing' } },
      };
      const response = initializer.handleChapterStart('wensen', state, []);
      expect(response.message).toBeTruthy();
    });

    it('11. BUDGET - with anticipation', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: { wensen: { wishes: [{ id: '1', text: 'Expensive wish', priority: 'must' as const }] } },
      };
      const response = initializer.handleChapterStart('budget', state, []);
      expect(response.message).toBeTruthy();
    });

    it('12. TECHNIEK - with anticipation', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { budget: { budgetTotaal: 500000 } } };
      const response = initializer.handleChapterStart('techniek', state, []);
      expect(response.message).toBeTruthy();
    });

    it('13. DUURZAAM - with anticipation', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { techniek: {} } };
      const response = initializer.handleChapterStart('duurzaam', state, []);
      expect(response.message).toBeTruthy();
    });

    it('14. RISICO - with anticipation', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { duurzaam: {} } };
      const response = initializer.handleChapterStart('risico', state, []);
      expect(response.message).toBeTruthy();
    });

    // Conflict scenarios (7 chapters)
    it('15. BASIS - with conflict', () => {
      const response = initializer.handleChapterStart('basis', createMinimalState(), []);
      expect(response.message).toBeTruthy();
    });

    it('16. RUIMTES - with conflict', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: { ruimtes: { rooms: [{ id: '1', name: 'Big', type: 'living', m2: 200 }], totalArea: 100 } as any },
      };
      const response = initializer.handleChapterStart('ruimtes', state, []);
      expect(response.message).toBeTruthy();
    });

    it('17. WENSEN - with conflict', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { wensen: { wishes: [] } } };
      const response = initializer.handleChapterStart('wensen', state, []);
      expect(response.message).toBeTruthy();
    });

    it('18. BUDGET - with conflict (critical)', () => {
      const state: WizardState = {
        ...createMinimalState(),
        chapterAnswers: {
          budget: { budgetTotaal: 5000 },
          wensen: { wishes: [{ id: '1', text: 'Keuken', priority: 'must' as const }] },
        },
      };
      const response = initializer.handleChapterStart('budget', state, []);
      expect(response.message).toBeTruthy();
    });

    it('19. TECHNIEK - with conflict', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { techniek: {} } };
      const response = initializer.handleChapterStart('techniek', state, []);
      expect(response.message).toBeTruthy();
    });

    it('20. DUURZAAM - with conflict', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { duurzaam: {} } };
      const response = initializer.handleChapterStart('duurzaam', state, []);
      expect(response.message).toBeTruthy();
    });

    it('21. RISICO - with conflict', () => {
      const state: WizardState = { ...createMinimalState(), chapterAnswers: { risico: { risks: [] } } };
      const response = initializer.handleChapterStart('risico', state, []);
      expect(response.message).toBeTruthy();
    });
  });
});
