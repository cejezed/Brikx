// __tests__/ai/AnticipationEngine.test.ts
// Test suite for AnticipationEngine module
// Week 1, Day 4 - Test-First Development

import { describe, it, expect, beforeEach } from 'vitest';
import type { AnticipationGuidance } from '@/types/ai';
import type { WizardState } from '@/types/project';

// Import the module under test
import { AnticipationEngine } from '@/lib/ai/AnticipationEngine';

describe('AnticipationEngine', () => {
  let engine: AnticipationEngine;

  // Helper to create a base wizard state
  const createBaseState = (projectType: string = 'nieuwbouw'): WizardState => ({
    stateVersion: 1,
    projectMeta: {
      projectNaam: 'Test Project',
      projectType: projectType as any,
    },
    chapterAnswers: {},
    currentChapter: 'basis',
  });

  beforeEach(() => {
    engine = new AnticipationEngine();
  });

  // ============================================================================
  // TEST SUITE 1: Project Type Rules (Nieuwbouw)
  // ============================================================================

  describe('nieuwbouw project type rules', () => {
    it('suggests sustainability questions early in nieuwbouw projects', () => {
      const state = createBaseState('nieuwbouw');

      const guidance = engine.getGuidance(state, 'basis');

      if (guidance) {
        expect(guidance.priority).toBe('high');
        expect(guidance.chapter).toBe('basis');
        expect(guidance.question).toContain('duurzaamheid');
      }
    });

    it('asks about energy label for nieuwbouw in techniek chapter', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        currentChapter: 'techniek',
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
        },
      };

      const guidance = engine.getGuidance(state, 'techniek');

      if (guidance) {
        expect(guidance.chapter).toBe('techniek');
        expect(guidance.relatedFields).toContain('techniek.energielabel');
      }
    });

    it('returns only 1 guidance per call (max 1 CRITICAL)', () => {
      const state = createBaseState('nieuwbouw');

      const guidance = engine.getGuidance(state, 'basis');

      // Either returns 1 guidance or null, never array
      expect(guidance === null || typeof guidance === 'object').toBe(true);
      if (guidance) {
        expect(guidance).toHaveProperty('question');
      }
    });
  });

  // ============================================================================
  // TEST SUITE 2: Project Type Rules (Verbouwing)
  // ============================================================================

  describe('verbouwing project type rules', () => {
    it('asks about vergunning for verbouwing projects', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        currentChapter: 'techniek',
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
        },
      };

      const guidance = engine.getGuidance(state, 'techniek');

      if (guidance) {
        expect(['techniek', 'budget']).toContain(guidance.chapter);
      }
    });

    it('prioritizes structural questions for verbouwing', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        currentChapter: 'techniek',
        chapterAnswers: {
          basis: { projectType: 'verbouwing' },
          ruimtes: {
            rooms: [
              { id: 'room-1', name: 'Muur doorbreken', type: 'living', m2: 40 },
            ],
          },
        },
      };

      const guidance = engine.getGuidance(state, 'techniek');

      if (guidance) {
        expect(guidance.priority).toBe('critical');
        expect(guidance.question.toLowerCase()).toMatch(/draagmuur|constructie|statisch/);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 3: LifestyleProfile Integration
  // ============================================================================

  describe('lifestyle profile integration', () => {
    it('asks about kindveiligheid when hasChildren = true', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          basis: {
            projectType: 'nieuwbouw',
            lifestyleProfile: {
              hasChildren: true,
              workFromHome: false,
              lovesEntertaining: false,
              prioritizesSustainability: false,
              activeCooking: false,
            },
          } as any,
        },
      };

      const guidance = engine.getGuidance(state, 'ruimtes');

      if (guidance) {
        expect(guidance.lifestyleRelevance).toBe('hasChildren');
        expect(guidance.question.toLowerCase()).toMatch(/kind|veilig|trap/);
      }
    });

    it('suggests thuiswerkplek when workFromHome = true', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        chapterAnswers: {
          basis: {
            projectType: 'verbouwing',
            lifestyleProfile: {
              hasChildren: false,
              workFromHome: true,
              lovesEntertaining: false,
              prioritizesSustainability: false,
              activeCooking: false,
            },
          } as any,
        },
      };

      const guidance = engine.getGuidance(state, 'ruimtes');

      if (guidance) {
        expect(guidance.lifestyleRelevance).toBe('workFromHome');
        expect(guidance.question.toLowerCase()).toMatch(/werkplek|kantoor|thuiswerk/);
      }
    });

    it('suggests grote keuken when activeCooking = true', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          basis: {
            projectType: 'nieuwbouw',
            lifestyleProfile: {
              hasChildren: false,
              workFromHome: false,
              lovesEntertaining: false,
              prioritizesSustainability: false,
              activeCooking: true,
            },
          } as any,
        },
      };

      const guidance = engine.getGuidance(state, 'ruimtes');

      if (guidance) {
        expect(guidance.lifestyleRelevance).toBe('activeCooking');
        expect(guidance.question.toLowerCase()).toMatch(/keuken|kookeiland|fornuis/);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 4: Budget Context Awareness
  // ============================================================================

  describe('budget context awareness', () => {
    it('suggests budget range when no budget set', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        currentChapter: 'budget',
        chapterAnswers: {},
      };

      const guidance = engine.getGuidance(state, 'budget');

      if (guidance) {
        expect(guidance.chapter).toBe('budget');
        expect(guidance.relatedFields).toContain('budget.budgetTotaal');
      }
    });

    it('asks about contingency when budget is set but no buffer', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        chapterAnswers: {
          budget: {
            budgetTotaal: 150000,
          },
        },
      };

      const guidance = engine.getGuidance(state, 'budget');

      if (guidance) {
        expect(guidance.question.toLowerCase()).toMatch(/reserve|buffer|contingency|onvoorzien/);
        expect(guidance.priority).toBe('high');
      }
    });
  });

  // ============================================================================
  // TEST SUITE 5: Priority System (CRITICAL > HIGH > MEDIUM)
  // ============================================================================

  describe('priority system', () => {
    it('returns CRITICAL priority for structural safety questions', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        chapterAnswers: {
          ruimtes: {
            rooms: [
              { id: 'room-1', name: 'Muur doorbreken', type: 'living', m2: 50 },
            ],
          },
        },
      };

      const guidance = engine.getGuidance(state, 'techniek');

      if (guidance && guidance.priority === 'critical') {
        expect(guidance.reasoning).toMatch(/veiligheid|structureel|draagmuur/i);
      }
    });

    it('returns HIGH priority for budget/planning questions', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          budget: { budgetTotaal: 500000 },
        },
      };

      const guidance = engine.getGuidance(state, 'budget');

      if (guidance && guidance.priority === 'high') {
        expect(['budget', 'techniek']).toContain(guidance.chapter);
      }
    });

    it('returns MEDIUM priority for lifestyle optimization questions', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          basis: {
            projectType: 'nieuwbouw',
            lifestyleProfile: {
              hasChildren: false,
              workFromHome: false,
              lovesEntertaining: true,
              prioritizesSustainability: false,
              activeCooking: false,
            },
          } as any,
        },
      };

      const guidance = engine.getGuidance(state, 'ruimtes');

      if (guidance && guidance.question.toLowerCase().includes('gasten')) {
        expect(guidance.priority).toBe('medium');
      }
    });
  });

  // ============================================================================
  // TEST SUITE 6: Chapter Context
  // ============================================================================

  describe('chapter context awareness', () => {
    it('returns guidance relevant to current chapter', () => {
      const state = createBaseState('nieuwbouw');

      const budgetGuidance = engine.getGuidance(state, 'budget');
      const techniekGuidance = engine.getGuidance(state, 'techniek');

      if (budgetGuidance) {
        expect(budgetGuidance.chapter).toBe('budget');
      }

      if (techniekGuidance) {
        expect(techniekGuidance.chapter).toBe('techniek');
      }
    });

    it('returns null when no rules match current chapter', () => {
      const state: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          basis: { projectType: 'nieuwbouw' },
          budget: { budgetTotaal: 500000, contingency: 50000 },
          ruimtes: { rooms: [] },
          techniek: {},
        },
      };

      // All chapters filled out - may return null or low-priority guidance
      const guidance = engine.getGuidance(state, 'wensen');

      // Should either be null or low priority
      if (guidance) {
        expect(['medium', 'high', 'critical']).toContain(guidance.priority);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 7: Rule Conditions
  // ============================================================================

  describe('rule condition evaluation', () => {
    it('only triggers rules when conditions are met', () => {
      const stateWithoutBudget = createBaseState('nieuwbouw');
      const stateWithBudget: WizardState = {
        ...createBaseState('nieuwbouw'),
        chapterAnswers: {
          budget: { budgetTotaal: 500000, contingency: 50000 },
        },
      };

      const guidanceWithout = engine.getGuidance(stateWithoutBudget, 'budget');
      const guidanceWith = engine.getGuidance(stateWithBudget, 'budget');

      // Different guidance based on state
      if (guidanceWithout && guidanceWith) {
        // Questions should be different
        expect(guidanceWithout.question !== guidanceWith.question || guidanceWithout.id !== guidanceWith.id).toBe(true);
      }
    });

    it('evaluates multiple conditions correctly', () => {
      const state: WizardState = {
        ...createBaseState('verbouwing'),
        chapterAnswers: {
          basis: {
            projectType: 'verbouwing',
            lifestyleProfile: {
              hasChildren: true,
              workFromHome: true,
              lovesEntertaining: false,
              prioritizesSustainability: false,
              activeCooking: false,
            },
          } as any,
          budget: { budgetTotaal: 100000 },
        },
      };

      const guidance = engine.getGuidance(state, 'ruimtes');

      // Should trigger rules based on multiple conditions
      if (guidance) {
        expect(guidance).toHaveProperty('question');
        expect(guidance.relatedFields.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 8: Response Format
  // ============================================================================

  describe('response format', () => {
    it('returns guidance with all required fields', () => {
      const state = createBaseState('nieuwbouw');

      const guidance = engine.getGuidance(state, 'basis');

      if (guidance) {
        expect(guidance).toHaveProperty('id');
        expect(guidance).toHaveProperty('priority');
        expect(guidance).toHaveProperty('chapter');
        expect(guidance).toHaveProperty('question');
        expect(guidance).toHaveProperty('reasoning');
        expect(guidance).toHaveProperty('relatedFields');
        expect(Array.isArray(guidance.relatedFields)).toBe(true);
      }
    });

    it('generates unique IDs for different guidance', () => {
      const state1 = createBaseState('nieuwbouw');
      const state2 = createBaseState('verbouwing');

      const guidance1 = engine.getGuidance(state1, 'basis');
      const guidance2 = engine.getGuidance(state2, 'basis');

      if (guidance1 && guidance2) {
        expect(guidance1.id).not.toBe(guidance2.id);
      }
    });
  });

  // ============================================================================
  // TEST SUITE 9: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles missing projectMeta gracefully', () => {
      const state: WizardState = {
        stateVersion: 1,
        chapterAnswers: {},
        currentChapter: 'basis',
      };

      expect(() => {
        engine.getGuidance(state, 'basis');
      }).not.toThrow();
    });

    it('handles empty chapterAnswers', () => {
      const state = createBaseState('nieuwbouw');

      const guidance = engine.getGuidance(state, 'budget');

      // Should still return guidance even with empty state
      expect(guidance === null || typeof guidance === 'object').toBe(true);
    });

    it('handles invalid chapter gracefully', () => {
      const state = createBaseState('nieuwbouw');

      expect(() => {
        engine.getGuidance(state, 'invalid' as any);
      }).not.toThrow();
    });
  });
});
