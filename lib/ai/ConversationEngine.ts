import {
    WizardState,
    ConversationObligation,
    ProjectIntentModel,
    ChatSession
} from "@/types/project";
import { randomUUID } from "node:crypto";

/**
 * ConversationEngine (v2.0)
 * 
 * Verantwoordelijk voor:
 * 1. Project Intent Model (PIM) bijhouden
 * 2. Conversation Obligations (Open lusjes) afdwingen
 * 3. FAST/FULL mode switching
 */
export class ConversationEngine {

    /**
     * Initialiseert of update de chat sessie
     */
    static getInitialSession(state: WizardState): ChatSession {
        return state.chatSession || {
            turnCount: 0,
            pim: {
                northStar: "",
                locked: {
                    topPriorities: []
                },
                assumptions: [],
                openQuestions: [],
                tensions: [],
                lastUpdatedTurn: 0
            },
            obligations: []
        };
    }

    /**
     * Update obligations status op basis van een nieuwe beurt
     */
    static updateObligations(
        obligations: ConversationObligation[],
        currentTurn: number,
        addressedTopic?: string
    ): ConversationObligation[] {
        return obligations.map(ob => {
            // Als een topic is behandeld, zet op 'addressed'
            if (addressedTopic && ob.topic.toLowerCase().includes(addressedTopic.toLowerCase())) {
                return { ...ob, status: 'addressed' as const };
            }

            // Check of een obligation is verlopen (dropped)
            if (ob.status === 'open' && currentTurn > ob.mustAddressByTurn) {
                // In een echte implementatie zouden we dit misschien 'dropped' maken 
                // maar de prompt zegt: "MOET één obligation afhandelen vóór andere dingen."
                // We laten hem dus open staan tot hij behandeld wordt of expliciet gedropt.
            }

            return ob;
        });
    }

    /**
     * Filtert obligations die nú de aandacht MOETEN krijgen
     */
    static getUrgentObligations(obligations: ConversationObligation[], currentTurn: number): ConversationObligation[] {
        return obligations.filter(ob =>
            ob.status === 'open' && currentTurn >= ob.mustAddressByTurn
        );
    }

    /**
     * Maakt een nieuwe obligation aan (alleen als de bot "daar kom ik op terug" o.i.d. zegt)
     */
    static createObligation(topic: string, reason: string, turn: number): ConversationObligation {
        return {
            id: randomUUID(),
            topic,
            reason,
            createdAtTurn: turn,
            mustAddressByTurn: turn + 3,
            status: 'open',
        };
    }

    /**
     * PlanWatcher: Vergelijkt huidige state met PIM om DRIFT, CONFLICT of TENSION te detecteren
     */
    static planWatcher(
        pim: ProjectIntentModel,
        wizardState: WizardState,
        userMsg: string
    ): { nextPIM: ProjectIntentModel; verdict: 'CONSISTENT' | 'DRIFT' | 'CONFLICT' } {
        const turn = wizardState.chatSession?.turnCount || 0;

        // Deep copy PIM om mutaties van de originele state te voorkomen
        const nextPIM: ProjectIntentModel = {
            ...pim,
            locked: { ...pim.locked },
            tensions: [...pim.tensions],
            assumptions: [...pim.assumptions],
            openQuestions: [...pim.openQuestions],
            lastUpdatedTurn: turn
        };
        let verdict: 'CONSISTENT' | 'DRIFT' | 'CONFLICT' = 'CONSISTENT';

        // 1. DRIFT Check (Project type shift)
        const currentType = wizardState.projectMeta?.projectType || wizardState.chapterAnswers.basis?.projectType;
        const pimType = pim.locked.projectType;

        if (pimType && currentType && pimType !== currentType) {
            verdict = 'DRIFT';
        }

        // 2. CONFLICT Check (Hard constraints vs budget)
        const budget = wizardState.chapterAnswers.budget?.budgetTotaal;
        if (budget && budget < 80000 && (pim.northStar.toLowerCase().includes("nieuwbouw") || pim.locked.projectType === 'nieuwbouw')) {
            verdict = 'CONFLICT';
        }

        // 3. ADJACENCY & TENSION Intelligence (Invisible Architect logic)
        // Check voor ruimtelijke spanningen
        const rooms = wizardState.chapterAnswers.ruimtes?.rooms || [];
        const hasTechnicalRoom = rooms.some(r => /techniek|cv|installatie|bijkeuken/i.test(r.name || r.type || ""));
        const hasBedroom = rooms.some(r => /slaap/i.test(r.name || r.type || ""));

        // Heuristische regel: Slaapkamer vs Techniek (Geluid/Rust)
        if (hasTechnicalRoom && hasBedroom) {
            const label = "Geluidsisolatie Slaapkamer";
            if (!nextPIM.tensions.some(t => t.label === label)) {
                nextPIM.tensions.push({
                    label,
                    cause: "Mogelijke geluidsoverlast: Slaapkamer(s) en technische ruimte in hetzelfde plan.",
                    risk: 'low'
                });
            }
        }

        // Heuristische regel: Veel glas vs Duurzaamheid (Oververhitting/Budget)
        const wishes = wizardState.chapterAnswers.wensen?.wishes || [];
        const hasLargeGlass = wishes.some(w => /grote ramen|glas|pui/i.test(w.text || ""));
        const isSustainablePriority = wishes.some(w => /energieneutraal|passief|duurzaam/i.test(w.text || "")) || pim.northStar.toLowerCase().includes("duurzaam");

        if (hasLargeGlass && isSustainablePriority) {
            const label = "Spanning Glas vs Duurzaamheid";
            if (!nextPIM.tensions.some(t => t.label === label)) {
                nextPIM.tensions.push({
                    label,
                    cause: "Spanning tussen grote glasoppervlakken en de ambitie voor een energieneutrale woning (koellast/isolatie).",
                    risk: 'med'
                });
            }
        }

        // Heuristische regel: Open keuken vs Rust/Geuren
        const hasOpenKitchen = wishes.some(w => /open keuken|keukeneiland/i.test(w.text || "")) || rooms.some(r => /open keuken/i.test(r.name || ""));
        const hasLivingRoom = rooms.some(r => /woon/i.test(r.name || r.type || ""));

        if (hasOpenKitchen && hasLivingRoom) {
            const label = "Open Keuken Akoestiek";
            if (!nextPIM.tensions.some(t => t.label === label)) {
                nextPIM.tensions.push({
                    label,
                    cause: "Open keuken verbonden met woonkamer: let op geluidsoverlast van apparatuur en verspreiding van kookgeuren.",
                    risk: 'low'
                });
            }
        }

        // Als er kritieke spanningen zijn, verhogen we de alertheid van de coach
        const hasCriticalTensions = nextPIM.tensions.some(t => t.risk === 'med' || t.risk === 'high');
        if (hasCriticalTensions && verdict === 'CONSISTENT') {
            // We noemen het geen CONFLICT (dat blokkeert patches), maar we vlaggen het intern
        }

        return { nextPIM, verdict };
    }
}
