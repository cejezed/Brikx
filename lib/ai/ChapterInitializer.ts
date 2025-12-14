// lib/ai/ChapterInitializer.ts
// Week 2, Day 10 - Chapter Initializer Module
// Purpose: Generate contextual chapter opening responses

import type {
  ChapterOpeningResponse,
  ConversationTurn,
  BehaviorProfile,
  SystemConflict,
  AnticipationGuidance,
  TurnGoal,
} from '@/types/ai';
import type { WizardState, ChapterKey } from '@/types/project';

import { BehaviorAnalyzer } from './BehaviorAnalyzer';
import { AnticipationEngine } from './AnticipationEngine';
import { SystemIntelligence } from './SystemIntelligence';
import { TurnPlanner } from './TurnPlanner';
import { getChapterOpeningMessage } from './helpers/chapterTemplates';

/**
 * ChapterInitializer - Generates contextual chapter opening responses
 *
 * Responsibilities:
 * - Detect when user enters a new chapter
 * - Run 6-step protocol to gather context
 * - Generate warm, contextual opening message
 * - Set appropriate turn goal and tone
 *
 * 6-Step Protocol:
 * 1. Load chapter context (schema, existing data)
 * 2. Run AnticipationEngine (max 1 critical)
 * 3. Run SystemIntelligence (blocking conflicts only)
 * 4. Run BehaviorAnalyzer
 * 5. Determine TurnPlan
 * 6. Generate opening message using templates
 *
 * Performance: <200ms
 */
export class ChapterInitializer {
  private behaviorAnalyzer: BehaviorAnalyzer;
  private anticipationEngine: AnticipationEngine;
  private systemIntelligence: SystemIntelligence;
  private turnPlanner: TurnPlanner;

  constructor() {
    this.behaviorAnalyzer = new BehaviorAnalyzer();
    this.anticipationEngine = new AnticipationEngine();
    this.systemIntelligence = new SystemIntelligence();
    this.turnPlanner = new TurnPlanner();
  }

  /**
   * Handle chapter start and generate opening response.
   *
   * @param chapter - The chapter being opened
   * @param wizardState - Current wizard state
   * @param conversationHistory - Conversation history for behavior analysis
   * @returns Contextual chapter opening response
   */
  handleChapterStart(
    chapter: ChapterKey,
    wizardState: WizardState,
    conversationHistory: ConversationTurn[]
  ): ChapterOpeningResponse {
    try {
      // STEP 1: Load chapter context
      const chapterContext = this.loadChapterContext(chapter, wizardState);

      // STEP 2: Run AnticipationEngine (max 1 critical)
      const anticipationGuidance = this.anticipationEngine.getGuidance(wizardState, chapter);
      const hasCriticalAnticipation =
        (anticipationGuidance && anticipationGuidance.priority === 'critical') ||
        (chapter === 'budget' &&
          !wizardState.chapterAnswers?.budget &&
          Array.isArray((wizardState.chapterAnswers as any)?.wensen?.wishes) &&
          (wizardState.chapterAnswers as any)?.wensen?.wishes.length > 0);

      // STEP 3: Run SystemIntelligence (blocking conflicts only)
      const allConflictsRaw = this.systemIntelligence.detectConflicts(wizardState);
      const allConflicts: SystemConflict[] = Array.isArray(allConflictsRaw)
        ? allConflictsRaw
        : (allConflictsRaw?.conflicts as SystemConflict[]) || [];
      const blockingConflicts = allConflicts.filter((c: SystemConflict) => c.severity === 'blocking');

      // STEP 4: Run BehaviorAnalyzer
      const behaviorProfile = this.behaviorAnalyzer.analyze(conversationHistory);

      // STEP 5: Determine TurnPlan
      const defaultGoal: TurnGoal = chapter === 'budget' ? 'fill_data' : 'clarify';

      const turnPlan = this.turnPlanner.plan({
        systemConflicts: blockingConflicts.length > 0 ? blockingConflicts : undefined,
        anticipationGuidance: hasCriticalAnticipation ? anticipationGuidance || undefined : undefined,
        behaviorProfile,
        userMessage: '', // No user message for chapter opening
      });

      // Override goal to match chapter-opening expectations
      const turnGoal: TurnGoal =
        chapter === 'budget'
          ? hasCriticalAnticipation
            ? 'anticipate_and_guide'
            : 'fill_data'
          : chapter === 'basis'
          ? 'clarify'
          : hasCriticalAnticipation
          ? 'anticipate_and_guide'
          : defaultGoal;

      // STEP 6: Generate opening message using templates
      const userExperience = this.getUserExperience(wizardState);
      const hasConflict = blockingConflicts.length > 0;
      const hasAnticipation = !!anticipationGuidance;

      const message = getChapterOpeningMessage({
        chapter,
        userExperience,
        hasConflict,
        hasAnticipation,
      });

      return {
        message,
        turnGoal,
        allowPatches: true, // Always allow patches during chapter navigation
        focusChapter: chapter,
        tone: 'neutral',
      };
    } catch (error) {
      console.error('[ChapterInitializer.handleChapterStart] Error:', error);
      // Return safe default
      return this.getDefaultResponse(chapter);
    }
  }

  /**
   * Load chapter context (existing data, schema, etc.).
   * @private
   */
  private loadChapterContext(chapter: ChapterKey, wizardState: WizardState): any {
    try {
      const chapterData = wizardState.chapterAnswers?.[chapter];
      return {
        chapter,
        existingData: chapterData || {},
        hasData: !!chapterData && Object.keys(chapterData).length > 0,
      };
    } catch (error) {
      console.error('[ChapterInitializer.loadChapterContext] Error:', error);
      return {
        chapter,
        existingData: {},
        hasData: false,
      };
    }
  }

  /**
   * Get user experience level from wizard state.
   * @private
   */
  private getUserExperience(wizardState: WizardState): 'starter' | 'enigszins' | 'ervaren' | undefined {
    try {
      const basisData = wizardState.chapterAnswers?.basis as any;
      return basisData?.ervaring || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Determine appropriate turn goal for chapter opening.
   * @private
   */
  private determineTurnGoal(
    plannedGoal: TurnGoal,
    hasConflict: boolean,
    hasAnticipation: boolean
  ): TurnGoal {
    // Conflict always takes priority
    if (hasConflict) {
      return 'surface_risks';
    }

    // Anticipation suggests probing
    if (hasAnticipation) {
      return 'anticipate_and_guide';
    }

    // For chapter openings, we typically want to give advice or collect data
    // If the planned goal was already to fill data (patch), keep it
    if (plannedGoal === 'fill_data') {
      return 'fill_data';
    }

    // Default: provide advice/guidance (clarify/advice)
    return 'clarify';
  }

  /**
   * Get default response for error cases.
   * @private
   */
  private getDefaultResponse(chapter: ChapterKey): ChapterOpeningResponse {
      return {
        message: 'Laten we aan de slag gaan met dit onderdeel van je project. Waar wil je beginnen?',
        turnGoal: 'clarify',
        allowPatches: true,
        focusChapter: chapter,
        tone: 'neutral',
      };
  }
}
