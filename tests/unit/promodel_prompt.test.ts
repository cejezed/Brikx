import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/ai/ProModel';
import { WizardState } from '@/types/project';

describe('ProModel Prompt Building', () => {
    it('includes Conversation Style Contract and PIM in system prompt', () => {
        const state: Partial<WizardState> = {
            projectMeta: {
                projectNaam: "Villa Aurora",
                projectType: 'nieuwbouw'
            },
            chapterAnswers: {
                basis: { projectType: 'nieuwbouw' }
            },
            chatSession: {
                turnCount: 5,
                pim: {
                    northStar: "Een energieneutrale woning voor een gezin met 3 kinderen",
                    locked: {
                        topPriorities: ["Warmtepomp", "Triple glas"]
                    } as any,
                    assumptions: [],
                    openQuestions: [],
                    tensions: [],
                    lastUpdatedTurn: 4
                },
                obligations: [
                    {
                        id: '1',
                        topic: 'Ventilatie',
                        reason: 'User vroeg naar filters',
                        createdAtTurn: 2,
                        mustAddressByTurn: 5,
                        status: 'open'
                    }
                ]
            }
        };

        const prompt = buildSystemPrompt(state as any);

        // Check for Style Contract
        expect(prompt).toContain('CONVERSATION STYLE CONTRACT');
        expect(prompt).toContain('ALTIJD "u" en "uw"');

        // Check for PIM
        expect(prompt).toContain('PROJECT INTENT MODEL');
        expect(prompt).toContain('Villa Aurora');
        expect(prompt).toContain('energieneutrale woning');

        // Check for Obligations
        expect(prompt).toContain('OPEN OBLIGATIONS');
        expect(prompt).toContain('Ventilatie');
    });
});
