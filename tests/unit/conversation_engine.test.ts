import { describe, it, expect } from 'vitest';
import { ConversationEngine } from '@/lib/ai/ConversationEngine';
import { WizardState } from '@/types/project';

describe('ConversationEngine', () => {
    const mockPim = {
        northStar: "Een aanbouw voor een nieuwe keuken",
        locked: {
            projectType: 'verbouwing' as const,
            topPriorities: []
        },
        assumptions: [],
        openQuestions: [],
        tensions: [],
        lastUpdatedTurn: 0
    };

    it('detects DRIFT when project type changes', () => {
        const state: Partial<WizardState> = {
            projectMeta: {
                projectNaam: "Test",
                projectType: 'nieuwbouw' as const
            },
            chapterAnswers: {
                basis: { projectType: 'nieuwbouw' }
            }
        };

        const { verdict } = ConversationEngine.planWatcher(mockPim as any, state as any, "Ik wil toch alles nieuw bouwen");
        expect(verdict).toBe('DRIFT');
    });

    it('detects CONFLICT when budget is too low for nieuwbouw', () => {
        const pimNieuwbouw = {
            ...mockPim,
            locked: { ...mockPim.locked, projectType: 'nieuwbouw' as const },
            northStar: "Nieuwbouw woning"
        };
        const state: Partial<WizardState> = {
            chapterAnswers: {
                budget: { budgetTotaal: 40000 }
            }
        };

        const { verdict } = ConversationEngine.planWatcher(pimNieuwbouw as any, state as any, "Mijn budget is 40k");
        expect(verdict).toBe('CONFLICT');
    });

    it('manages obligations turn count', () => {
        const turn = 1;
        const ob = ConversationEngine.createObligation("Test Topic", "Reason", turn);
        expect(ob.mustAddressByTurn).toBe(4);

        const urgent = ConversationEngine.getUrgentObligations([ob], 4);
        expect(urgent.length).toBe(1);

        const notUrgent = ConversationEngine.getUrgentObligations([ob], 3);
        expect(notUrgent.length).toBe(0);
    });
});
