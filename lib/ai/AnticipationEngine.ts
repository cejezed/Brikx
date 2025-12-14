// lib/ai/AnticipationEngine.ts
// Week 1, Day 4 - Anticipation Engine Module
// Purpose: Generate proactive AI questions based on project type and state

import type { WizardState, ChapterKey } from '@/types/project';
import type { AnticipationGuidance } from '@/types/ai';

// Internal rule type using string[] for project types (matches projectType from ProjectMeta)
interface InternalAnticipationRule {
  id: string;
  projectTypes: string[]; // 'nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'
  condition: (state: WizardState) => boolean;
  guidance: Omit<AnticipationGuidance, 'id'>;
}

/**
 * AnticipationEngine - Proactive AI question generator
 *
 * Responsibilities:
 * - Generate intelligent guidance based on project type
 * - Consider lifestyle profile for personalization
 * - Return max 1 CRITICAL anticipation per call
 * - Priority system: CRITICAL > HIGH > MEDIUM
 *
 * Performance target: <50ms for getGuidance()
 */
export class AnticipationEngine {
  private rules: InternalAnticipationRule[];

  constructor() {
    this.rules = this.initializeRules();
  }

  private computeLifestyleRelevance(flags: { hasChildren?: boolean; workFromHome?: boolean; activeCooking?: boolean }): string {
    if (flags.hasChildren) return 'hasChildren';
    if (flags.workFromHome) return 'workFromHome';
    if (flags.activeCooking) return 'activeCooking';
    return 'low';
  }

  /**
   * Run anticipation for the given state/chapter.
   * Returns guidance array + flags, matching orchestrator expectations.
   */
  run(
    state: WizardState,
    opts: { currentChapter?: ChapterKey | null; turnCount?: number } = {}
  ): { shouldInterrupt: boolean; guidances: AnticipationGuidance[]; criticalMissing: string[] } {
    const guidance = opts.currentChapter
      ? this.getGuidance(state, opts.currentChapter)
      : null;

    return {
      shouldInterrupt: !!guidance,
      guidances: guidance ? [guidance] : [],
      criticalMissing: [],
    };
  }

  /**
   * Get proactive guidance for the current state and chapter.
   *
   * @param state - Current wizard state
   * @param currentChapter - Current chapter the user is in
   * @returns Single AnticipationGuidance or null if no rules match
   *
   * Returns max 1 guidance per call, prioritizing CRITICAL > HIGH > MEDIUM
   */
  getGuidance(state: WizardState, currentChapter: ChapterKey): AnticipationGuidance | null {
    const projectType = state.projectMeta?.projectType || 'nieuwbouw';

    // Filter rules by project type and evaluate conditions
    const matchingRules = this.rules.filter((rule) => {
      // Check if rule applies to this project type
      if (!rule.projectTypes.includes(projectType)) {
        return false;
      }

      // Check if rule's chapter matches current chapter
      if (rule.guidance.chapter !== currentChapter) {
        return false;
      }

      // Evaluate rule condition
      try {
        return rule.condition(state);
      } catch (error) {
        console.error(`[AnticipationEngine] Rule ${rule.id} condition failed:`, error);
        return false;
      }
    });

    if (matchingRules.length === 0) {
      return null;
    }

    // Sort by priority: critical > high > medium
    const priorityOrder = { critical: 0, high: 1, medium: 2 };
    matchingRules.sort(
      (a, b) => priorityOrder[a.guidance.priority] - priorityOrder[b.guidance.priority]
    );

    // Return the highest priority rule
    const topRule = matchingRules[0];
    return {
      id: topRule.id,
      ...topRule.guidance,
    };
  }

  /**
   * Initialize all anticipation rules.
   * @private
   */
  private initializeRules(): InternalAnticipationRule[] {
    return [
      // ========================================================================
      // NIEUWBOUW RULES
      // ========================================================================

      {
        id: 'nieuwbouw_sustainability_basis',
        projectTypes: ['nieuwbouw'],
        condition: (state) => {
          const basis = state.chapterAnswers.basis as any;
          return !basis?.lifestyleProfile?.prioritizesSustainability;
        },
        guidance: {
          priority: 'high',
          chapter: 'basis',
          question: 'Wil je extra aandacht voor duurzaamheid? Dit kan invloed hebben op je keuzes voor isolatie, energieopwekking en materialen.',
          reasoning: 'Nieuwbouw biedt kans voor optimale duurzaamheid',
          relatedFields: ['basis.lifestyleProfile.prioritizesSustainability'],
        },
      },

      {
        id: 'nieuwbouw_energy_label',
        projectTypes: ['nieuwbouw'],
        condition: (state) => {
          const techniek = state.chapterAnswers.techniek as any;
          return !techniek?.energielabel;
        },
        guidance: {
          priority: 'high',
          chapter: 'techniek',
          question: 'Welk energielabel streef je na? Nieuwbouw moet minimaal energielabel A hebben, maar A++ of NOM (Nul Op de Meter) is ook mogelijk.',
          reasoning: 'Nieuwbouw heeft wettelijke eisen voor energielabel',
          relatedFields: ['techniek.energielabel'],
        },
      },

      // ========================================================================
      // VERBOUWING RULES
      // ========================================================================

      {
        id: 'verbouwing_permit',
        projectTypes: ['verbouwing'],
        condition: (state) => {
          const techniek = state.chapterAnswers.techniek as any;
          return !techniek?.vergunning;
        },
        guidance: {
          priority: 'high',
          chapter: 'techniek',
          question: 'Heb je al gekeken of je een omgevingsvergunning nodig hebt? Dit hangt af van de omvang en aard van de verbouwing.',
          reasoning: 'Vergunning is cruciaal voor planning en legaal bouwen',
          relatedFields: ['techniek.vergunning'],
        },
      },

      {
        id: 'verbouwing_structural',
        projectTypes: ['verbouwing'],
        condition: (state) => {
          const ruimtes = state.chapterAnswers.ruimtes as any;
          const rooms = ruimtes?.rooms || [];
          return rooms.some((room: any) =>
            room.name?.toLowerCase().includes('doorbreken') ||
            room.name?.toLowerCase().includes('muur')
          );
        },
        guidance: {
          priority: 'critical',
          chapter: 'techniek',
          question: 'Let op: als je dragende muren wilt doorbreken, is een constructief onderzoek noodzakelijk. Heb je hier al een constructeur bij betrokken?',
          reasoning: 'Veiligheid en legaliteit vereisen constructief advies',
          relatedFields: ['techniek.constructie'],
        },
      },

      // ========================================================================
      // LIFESTYLE PROFILE RULES (All project types)
      // ========================================================================

      {
        id: 'lifestyle_children_safety',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const basis = state.chapterAnswers.basis as any;
          return basis?.lifestyleProfile?.hasChildren === true;
        },
        guidance: {
          priority: 'medium',
          chapter: 'ruimtes',
          question: 'Omdat je kinderen hebt: denk je aan kindveilige details zoals trapbeveiliging, afgeronde hoeken, en veilige stopcontacten?',
          reasoning: 'Kindveiligheid is belangrijk bij gezinnen',
          relatedFields: ['ruimtes.kindveilig'],
          lifestyleRelevance: 'hasChildren' as any,
          triggers: ['hasChildren'],
        },
      },

      {
        id: 'lifestyle_work_from_home',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const basis = state.chapterAnswers.basis as any;
          const ruimtes = state.chapterAnswers.ruimtes as any;
          return basis?.lifestyleProfile?.workFromHome === true &&
                 !(ruimtes?.rooms || []).some((r: any) => r.type === 'office');
        },
        guidance: {
          priority: 'medium',
          chapter: 'ruimtes',
          question: 'Je werkt thuis - heb je een aparte werkplek of kantoorruimte nodig? Dit kan invloed hebben op de indeling.',
          reasoning: 'Thuiswerken vereist dedicated ruimte',
          relatedFields: ['ruimtes.rooms'],
          lifestyleRelevance: 'workFromHome' as any,
          triggers: ['workFromHome'],
        },
      },

      {
        id: 'lifestyle_active_cooking',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const basis = state.chapterAnswers.basis as any;
          const ruimtes = state.chapterAnswers.ruimtes as any;
          const hasLargeKitchen = (ruimtes?.rooms || []).some(
            (r: any) => r.type === 'kitchen' && (r.m2 || 0) >= 15
          );
          return basis?.lifestyleProfile?.activeCooking === true && !hasLargeKitchen;
        },
        guidance: {
          priority: 'medium',
          chapter: 'ruimtes',
          question: 'Je kookt graag - overweeg je een ruime keuken met kookeiland of extra werkblad? Dit vraagt minimaal 12-15m².',
          reasoning: 'Actief koken vraagt ruime en functionele keuken',
          relatedFields: ['ruimtes.rooms'],
          lifestyleRelevance: 'activeCooking' as any,
          triggers: ['activeCooking'],
        },
      },

      {
        id: 'lifestyle_entertaining',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const basis = state.chapterAnswers.basis as any;
          return basis?.lifestyleProfile?.lovesEntertaining === true;
        },
        guidance: {
          priority: 'medium',
          chapter: 'ruimtes',
          question: 'Je ontvangt graag gasten - denk je aan een open verbinding tussen keuken en woonkamer, of een aparte eetruimte?',
          reasoning: 'Entertainen vraagt open en sociale ruimtes',
          relatedFields: ['ruimtes.rooms', 'ruimtes.openplan'],
        },
      },

      // ========================================================================
      // BUDGET RULES (All project types)
      // ========================================================================

      {
        id: 'budget_not_set',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const budget = state.chapterAnswers.budget as any;
          return !budget?.budgetTotaal;
        },
        guidance: {
          priority: 'high',
          chapter: 'budget',
          question: 'Wat is je totale budget voor dit project? Dit helpt me om realistische keuzes te maken.',
          reasoning: 'Budget is essentieel voor haalbaarheid',
          relatedFields: ['budget.budgetTotaal'],
        },
      },

      {
        id: 'budget_no_contingency',
        projectTypes: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'],
        condition: (state) => {
          const budget = state.chapterAnswers.budget as any;
          return budget?.budgetTotaal && !budget?.contingency;
        },
        guidance: {
          priority: 'high',
          chapter: 'budget',
          question: 'Heb je een buffer voor onvoorziene kosten? Ik adviseer 10-15% van je budget als contingency.',
          reasoning: 'Onvoorziene kosten komen altijd voor',
          relatedFields: ['budget.contingency'],
        },
      },

      // ========================================================================
      // TECHNICAL RULES (All project types)
      // ========================================================================

      {
        id: 'techniek_ventilation_with_insulation',
        projectTypes: ['nieuwbouw', 'verbouwing', 'hybride'],
        condition: (state) => {
          const techniek = state.chapterAnswers.techniek as any;
          return techniek?.isolatie && !techniek?.ventilatie;
        },
        guidance: {
          priority: 'critical',
          chapter: 'techniek',
          question: 'Let op: bij verbeterde isolatie is goede ventilatie essentieel om vochtproblemen en schimmel te voorkomen. Heb je hier al over nagedacht?',
          reasoning: 'Isolatie zonder ventilatie leidt tot vochtproblemen',
          relatedFields: ['techniek.ventilatie', 'techniek.isolatie'],
        },
      },
    ];
  }
}
