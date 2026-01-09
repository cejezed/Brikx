import { describe, it, expect } from 'vitest';
import { ConversationEngine } from '@/lib/ai/ConversationEngine';
import { WizardState } from '@/types/project';

describe('ConversationEngine Invisible Intelligence', () => {
    const mockPim = {
        northStar: "Mijn droomhuis",
        locked: {
            projectType: 'nieuwbouw' as const,
            topPriorities: []
        },
        assumptions: [],
        openQuestions: [],
        tensions: [],
        lastUpdatedTurn: 0
    };

    it('detects tension when bedroom and technical room coexist', () => {
        const state: Partial<WizardState> = {
            chatSession: { turnCount: 1 },
            projectMeta: { projectType: 'nieuwbouw', projectNaam: 'Test' },
            chapterAnswers: {
                basis: { projectType: 'nieuwbouw' },
                ruimtes: {
                    rooms: [
                        { id: '1', name: 'Slaapkamer 1', type: 'slaapkamer' },
                        { id: '2', name: 'CV Ruimte', type: 'techniek' }
                    ]
                },
                wensen: { wishes: [] }
            }
        };

        const { nextPIM } = ConversationEngine.planWatcher(mockPim as any, state as any, "Ik heb een slaapkamer en een cv-hok toegevoegd.");
        expect(nextPIM.tensions.length).toBeGreaterThan(0);
        expect(nextPIM.tensions[0].label).toBe("Geluidsisolatie Slaapkamer");
    });

    it('detects tension between large glass and sustainability', () => {
        const state: any = {
            chatSession: { turnCount: 1 },
            chapterAnswers: {
                wensen: {
                    wishes: [
                        { id: '1', text: 'grote ramen' },
                        { id: '2', text: 'energieneutraal' }
                    ]
                }
            }
        };

        const { nextPIM } = ConversationEngine.planWatcher(mockPim as any, state as any, "glas en duurzaam");
        const labels = nextPIM.tensions.map(t => t.label);
        expect(labels).toContain("Spanning Glas vs Duurzaamheid");
    });
});
