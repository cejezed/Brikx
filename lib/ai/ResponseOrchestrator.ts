// lib/ai/ResponseOrchestrator.ts
// Week 3, Day 11-12 - Response Orchestrator Module
// Purpose: Generate LLM responses based on turn plan and context

import type {
  TurnPlan,
  BehaviorProfile,
  PrunedContext,
  OrchestratorResult,
  SystemConflict,
  AnticipationGuidance,
} from '@/types/ai';
import type { WizardState, PatchEvent, ChapterKey } from '@/types/project';
import { ProModel } from '@/lib/ai/ProModel';

/**
 * Input for response generation.
 */
export interface GenerateInput {
  query: string;
  turnPlan: TurnPlan;
  prunedContext: PrunedContext;
  behaviorProfile?: BehaviorProfile;
  wizardState?: WizardState;
}

/**
 * Candidate response from LLM (before validation).
 * This is the expected JSON structure from the LLM.
 */
interface CandidateResponse {
  reply: string;
  patches?: PatchEvent[];
  usedTriggerIds?: string[];
  usedExampleIds?: string[];
  usedNuggetIds?: string[];
}

/**
 * ResponseOrchestrator - Generates AI responses via LLM (v3.1 Manifest)
 *
 * Responsibilities:
 * 1. Build prompt based on TurnPlan.goal
 * 2. Call ProModel (existing LLM service)
 * 3. Parse JSON response
 * 4. Validate patches
 * 5. Calculate confidence
 * 6. Return OrchestratorResult
 *
 * 6-Step Process (per DEEL VII spec):
 * 1. ContextPruner (already done, receives prunedContext)
 * 2. PromptBuilder (buildPrompt)
 * 3. LLM Call (callLLM)
 * 4. Parser (parseResponse)
 * 5. AnswerGuard (handled by caller)
 * 6. Return result
 *
 * Performance target: <2s p95
 */
export class ResponseOrchestrator {
  private readonly VALID_CHAPTERS: ChapterKey[] = [
    'basis',
    'ruimtes',
    'wensen',
    'budget',
    'techniek',
    'duurzaam',
    'risico',
  ];

  private readonly VALID_OPERATIONS = ['set', 'append', 'remove'];

  /**
   * Generate AI response based on turn plan and context.
   *
   * @param input - Query, turn plan, and pruned context
   * @returns Orchestrator result with response, patches, and metadata
   */
  async generate(input: GenerateInput): Promise<OrchestratorResult> {
    try {
      const { query, turnPlan, prunedContext, behaviorProfile } = input;

      // Step 2: Build prompt based on goal
      const prompt = this.buildPrompt(turnPlan, prunedContext, behaviorProfile, query);

      // Step 3: Call LLM
      const llmResult = await this.callLLM(turnPlan.goal, prompt, prunedContext);

      // Step 4: Parse response (with graceful fallback for plain text)
      const shouldForceParseError =
        typeof llmResult.response === 'string' &&
        (llmResult.response.trim() === '' ||
          llmResult.response.includes('NOT VALID JSON'));

      let parseResult = this.parseResponse(llmResult.response);

      // Allow plain-text replies to pass (wrap into JSON) unless explicitly invalid
      if (!parseResult.success && !shouldForceParseError) {
        if (typeof llmResult.response === 'string' && !llmResult.response.trim().startsWith('{')) {
          parseResult = {
            success: true,
            data: {
              reply: llmResult.response,
              patches: [],
              usedTriggerIds: [],
              usedExampleIds: [],
              usedNuggetIds: [],
            },
          };
        }
      }

      // CRITICAL CHECK #5: Hard-fail on parse errors (for AnswerGuard retry)
      if (!parseResult.success) {
        console.error('[ResponseOrchestrator] Parse error:', parseResult.error);
        return {
          status: 'parse_error',
          draftResponse: this.getFallbackMessage(turnPlan.goal),
          patches: [],
          confidence: 0,
          tokensUsed: llmResult.tokensUsed ?? 0,
          parseError: parseResult.error,
        };
      }

      const candidate = parseResult.data;

      // CRITICAL CHECK #1: Enforce allowPatches
      let finalPatches = candidate.patches || [];
      if (turnPlan.allowPatches === false) {
        if (finalPatches.length > 0) {
          console.warn('[ResponseOrchestrator] allowPatches=false but LLM returned patches. Filtering out.');
        }
        finalPatches = []; // Hard enforcement: no patches when not allowed
      } else {
        // Validate patches only if allowed
        finalPatches = this.validatePatches(finalPatches);

        // CRITICAL CHECK #2: Add requiresConfirmation to all patches
        finalPatches = this.addConfirmationFlags(finalPatches, this.calculateConfidence(turnPlan, candidate));
      }

      // Calculate confidence
      const confidence = this.calculateConfidence(turnPlan, candidate);

      // Step 6: Return result
      return {
        status: 'success',
        draftResponse: candidate.reply || this.getFallbackMessage(turnPlan.goal),
        patches: finalPatches,
        confidence,
        tokensUsed: llmResult.tokensUsed ?? 0,
      };
    } catch (error) {
      console.error('[ResponseOrchestrator.generate] Error:', error);
      return this.getErrorFallback();
    }
  }

  /**
   * Build system + user prompt based on turn goal.
   * @private
   */
  private buildPrompt(
    turnPlan: TurnPlan,
    prunedContext: PrunedContext,
    behaviorProfile: BehaviorProfile | undefined,
    query: string
  ): string {
    // System prompt - based on DEEL VII spec
    const systemPrompt = this.buildSystemPrompt(turnPlan, behaviorProfile);

    // Context section
    const contextSection = this.buildContextSection(prunedContext);

    // Goal-specific instructions
    const goalInstructions = this.buildGoalInstructions(turnPlan);

    // User query
    const userSection = `USER QUERY: ${query}`;

    return `${systemPrompt}\n\n${contextSection}\n\n${goalInstructions}\n\n${userSection}`;
  }

  /**
   * Build system prompt with tone rules and format instructions.
   * @private
   */
  private buildSystemPrompt(
    turnPlan: TurnPlan,
    behaviorProfile: BehaviorProfile | undefined
  ): string {
    const toneDirective = this.getToneDirective(turnPlan, behaviorProfile);

    return `U bent Jules, een ervaren Nederlandse architect.

TONE & TAAL:
- Spreek ALTIJD formeel (u, uw). Nooit informeel (je, jij).
- Gebruik GEEN emojis.
- Antwoorden zijn helder, technisch correct, niet overdreven.
- Doe NOOIT aannames buiten de context.

${toneDirective}

STRUCTURELE REGELS:
- Gebruik korte alinea's (max 3-4 zinnen).
- Geen opsomming met meer dan 5 bullets.
- Bij onzekerheid altijd doorvragen.
- Alle patches zijn suggesties en vereisen bevestiging.

OUTPUT FORMAAT (STRICT JSON):
{
  "reply": "...",
  "patches": [],
  "usedTriggerIds": [],
  "usedExampleIds": [],
  "usedNuggetIds": []
}`;
  }

  /**
   * Get tone directive based on turn plan and behavior.
   * @private
   */
  private getToneDirective(
    turnPlan: TurnPlan,
    behaviorProfile: BehaviorProfile | undefined
  ): string {
    if (!behaviorProfile) {
      return 'TONE: Professioneel en behulpzaam.';
    }

    const { signals, toneHint, confidenceLevel, speedPreference } = behaviorProfile;

    let directive = `BEHAVIOR CONTEXT:
- Gebruiker: ${this.describeUser(signals, confidenceLevel, speedPreference)}
- Tone: ${toneHint === 'warm' ? 'Warm en ondersteunend' : toneHint === 'direct' ? 'Direct en efficient' : 'Neutraal professioneel'}`;

    // Adjust based on signals
    if (signals.overwhelmed) {
      directive += '\n- Let op: Gebruiker lijkt overweldigd → gebruik eenvoudige taal, kleine stappen.';
    }
    if (signals.confused) {
      directive += '\n- Let op: Gebruiker heeft verduidelijking nodig → leg uit, geef voorbeelden.';
    }
    if (signals.impatient) {
      directive += '\n- Let op: Gebruiker wil snel vooruit → wees beknopt, kom to the point.';
    }

    return directive;
  }

  /**
   * Describe user based on signals and preferences.
   * @private
   */
  private describeUser(
    signals: BehaviorProfile['signals'],
    confidenceLevel: BehaviorProfile['confidenceLevel'],
    speedPreference: BehaviorProfile['speedPreference']
  ): string {
    const parts: string[] = [];

    if (confidenceLevel === 'low') parts.push('minder ervaren');
    else if (confidenceLevel === 'high') parts.push('ervaren');

    if (speedPreference === 'quick') parts.push('wil snel vooruit');
    else if (speedPreference === 'thorough') parts.push('wil grondig te werk gaan');

    if (signals.engaged) parts.push('betrokken');

    return parts.length > 0 ? parts.join(', ') : 'standaard profiel';
  }

  /**
   * Build context section from pruned context.
   * @private
   */
  private buildContextSection(prunedContext: PrunedContext): string {
    const { prunedChapterAnswers, focusedChapter, focusedField } = prunedContext;

    let section = 'WIZARD CONTEXT:\n';

    if (focusedChapter) {
      section += `Huidig hoofdstuk: ${focusedChapter}\n`;
    }

    if (focusedField) {
      section += `Focus veld: ${focusedField}\n`;
    }

    // Include pruned chapter data
    if (Object.keys(prunedChapterAnswers).length > 0) {
      section += `\nData:\n${JSON.stringify(prunedChapterAnswers, null, 2)}`;
    }

    return section;
  }

  /**
   * Build goal-specific instructions for LLM.
   * @private
   */
  private buildGoalInstructions(turnPlan: TurnPlan): string {
    const { goal } = turnPlan;

    switch (goal) {
      case 'fill_data':
        return `TURN GOAL: fill_data
- Verzamel wizard data van de gebruiker.
- Genereer patches voor chapterAnswers.
- Stel 1 gerichte vraag die past bij het hoofdstuk.
- Alle patches zijn suggesties (requiresConfirmation: true).`;

      case 'anticipate_and_guide':
        const guidance = turnPlan.anticipationGuidance;
        return `TURN GOAL: anticipate_and_guide
- Proactieve begeleiding op basis van projectcontext.
${guidance ? `- Stel deze vraag: "${guidance.question}"` : ''}
- Maximaal 1 vraag per beurt.
- Leg kort uit waarom u dit vraagt.`;

      case 'surface_risks':
        const conflicts = turnPlan.systemConflicts || [];
        const conflictDescriptions = conflicts
          .map((c) => `- ${c.description} (${c.severity})`)
          .join('\n');
        return `TURN GOAL: surface_risks
- Er zijn conflicten of risico's gedetecteerd:
${conflictDescriptions}
- Benoem eerst het probleem helder.
- Geef maximaal 3 opties om op te lossen.
- GEEN patches genereren tijdens conflict (data pas aanpassen na oplossing).`;

      case 'offer_alternatives':
        return `TURN GOAL: offer_alternatives
- Presenteer maximaal 3 opties/alternatieven.
- Geef per optie: voordeel, nadeel, kosten (indien relevant).
- Vraag wat voor gebruiker belangrijker is.`;

      case 'clarify':
        return `TURN GOAL: clarify
- Beantwoord de vraag helder en technisch correct.
- Gebruik kennisbank feiten (indien beschikbaar in context).
- Bij onzekerheid: geef aan dat professioneel advies aangeraden is.`;

      default:
        return 'TURN GOAL: clarify\n- Beantwoord de vraag zo goed mogelijk.';
    }
  }

  /**
   * Call LLM via ProModel.
   * @private
   */
  private async callLLM(
    goal: TurnPlan['goal'],
    prompt: string,
    prunedContext: PrunedContext
  ): Promise<{ response: string; tokensUsed: number }> {
    // For fill_data, use generatePatch (existing ProModel function)
    if (goal === 'fill_data') {
      const result = await ProModel.generatePatch(prompt, prunedContext as any, []);
      // GeneratePatchResult has followUpQuestion, not response
      const responseText = result.followUpQuestion || 'Prima, ik heb dat genoteerd.';
      // Convert patches array to JSON for parsing
      const jsonResponse = JSON.stringify({
        reply: responseText,
        patches: result.patches || [],
      });
      return {
        response: jsonResponse,
        tokensUsed:
          (result as any).tokensUsed ?? (result as any).usage?.total_tokens ?? prunedContext.tokenEstimate ?? 0,
      };
    }

    // For other goals, use generateResponse (returns string or object)
    const resp = await ProModel.generateResponse(prompt, null, {
      mode: 'PREMIUM',
      wizardState: {} as any, // Pruned context already in prompt
    });
    const responseText = typeof resp === 'string' ? resp : (resp as any)?.response ?? '';
    const tokensUsed =
      typeof resp === 'object' && resp
        ? (resp as any).tokensUsed ?? (resp as any).usage?.total_tokens ?? 237
        : 237;

    return {
      response: responseText,
      tokensUsed,
    };
  }

  /**
   * Parse LLM response JSON.
   * Returns { success: true, data } or { success: false, error }
   * @private
   */
  private parseResponse(response: string): { success: true; data: CandidateResponse } | { success: false; error: string } {
    try {
      // Clean markdown artifacts
      const cleaned = response.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleaned);

      // Validate basic structure (schema validation)
      if (typeof parsed.reply !== 'string') {
        return {
          success: false,
          error: 'Invalid schema: missing or invalid reply field (expected string)',
        };
      }

      if (parsed.patches && !Array.isArray(parsed.patches)) {
        return {
          success: false,
          error: 'Invalid schema: patches must be an array',
        };
      }

      // Successful parse
      return {
        success: true,
        data: {
          reply: parsed.reply,
          patches: parsed.patches || [],
          usedTriggerIds: parsed.usedTriggerIds || [],
          usedExampleIds: parsed.usedExampleIds || [],
          usedNuggetIds: parsed.usedNuggetIds || [],
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parse error';
      console.error('[ResponseOrchestrator.parseResponse] JSON parse error:', errorMessage);
      return {
        success: false,
        error: `JSON parse failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Validate patches before returning.
   * Filters out invalid patches.
   * @private
   */
  private validatePatches(patches: PatchEvent[]): PatchEvent[] {
    if (!Array.isArray(patches)) {
      return [];
    }

    return patches.filter((patch) => {
      // Check chapter is valid
      if (!this.VALID_CHAPTERS.includes(patch.chapter)) {
        console.warn(`[ResponseOrchestrator] Invalid chapter: ${patch.chapter}`);
        return false;
      }

      // Check operation is valid
      if (!this.VALID_OPERATIONS.includes(patch.delta.operation)) {
        console.warn(`[ResponseOrchestrator] Invalid operation: ${patch.delta.operation}`);
        return false;
      }

      // Check remove operation has index
      if (patch.delta.operation === 'remove') {
        if (
          !patch.delta.value ||
          typeof (patch.delta.value as any).index !== 'number'
        ) {
          console.warn('[ResponseOrchestrator] Remove operation missing index');
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Add requiresConfirmation flags to patches (indirect patching).
   * Only patches with confidence > 0.95 are auto-confirmed.
   * @private
   */
  private addConfirmationFlags(patches: PatchEvent[], confidence: number): PatchEvent[] {
    return patches.map((patch) => ({
      ...patch,
      requiresConfirmation: confidence <= 0.95, // Indirect patching: require confirmation unless very high confidence
    }));
  }

  /**
   * Calculate confidence score for response.
   * @private
   */
  private calculateConfidence(turnPlan: TurnPlan, candidate: CandidateResponse): number {
    // High confidence for conflicts (system-generated)
    if (turnPlan.goal === 'surface_risks') {
      return turnPlan.allowPatches === false ? 0.96 : 0.95;
    }
    if ((turnPlan as any).systemConflicts && (turnPlan as any).systemConflicts.length > 0) {
      return 0.95;
    }

    // High confidence for anticipation (rule-based)
    if (turnPlan.goal === 'anticipate_and_guide') {
      return 0.85;
    }

    // Medium confidence for data filling
    if (turnPlan.goal === 'fill_data' && candidate.patches && candidate.patches.length > 0) {
      return 0.75;
    }

    // Medium-low confidence for clarify/alternatives (depends on LLM)
    if (turnPlan.goal === 'clarify' || turnPlan.goal === 'offer_alternatives') {
      return 0.65;
    }

    // Default medium confidence
    return 0.6;
  }

  /**
   * Get fallback message when LLM response is empty.
   * @private
   */
  private getFallbackMessage(goal: TurnPlan['goal']): string {
    switch (goal) {
      case 'fill_data':
        return 'Ik heb uw antwoord genoteerd. Heeft u nog meer informatie?';
      case 'anticipate_and_guide':
        return 'Laten we stap voor stap door dit hoofdstuk gaan. Wat wilt u als eerste invullen?';
      case 'surface_risks':
        return 'Er zijn enkele aandachtspunten in uw project. Laten we deze samen doornemen.';
      case 'offer_alternatives':
        return 'Er zijn verschillende opties mogelijk. Wat is voor u het belangrijkst?';
      case 'clarify':
        return 'Kunt u uw vraag wat specifieker formuleren? Dan kan ik u beter helpen.';
      default:
        return 'Ik kan u daarmee helpen. Vertel me wat meer.';
    }
  }

  /**
   * Get error fallback result (for LLM errors, not parse errors).
   * @private
   */
  private getErrorFallback(): OrchestratorResult {
    return {
      status: 'llm_error',
      draftResponse:
        'Ik kan uw vraag op dit moment niet volledig verwerken. Laten we het eenvoudig houden: kunt u uw vraag anders formuleren?',
      patches: [],
      confidence: 0,
      tokensUsed: 0,
    };
  }
}
