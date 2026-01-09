// /app/api/chat/route.ts
// ✅ v3.3: Fixed imports, removed unused
// ✅ v3.5: Added crypto for UUID generation
// ✅ v3.x: META_TOOLING pre-layer voor tool-help en onboarding
// ✅ v4.0: ANSWER GUARD integration

import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { ProModel } from "@/lib/ai/ProModel";
import { ConversationEngine } from "@/lib/ai/ConversationEngine";
import { Kennisbank } from "@/lib/rag/Kennisbank";
import { createSSEStream, type SSEWriter } from "@/lib/sse/stream";
import { logEvent } from "@/lib/logging/logEvent";
import {
  computeMissingFields,
  type MissingItem,
} from "@/lib/ai/missing";
import {
  classifyMissing,
} from "@/lib/ai/essentials";
// ✅ FIX: Import uit lib/utils/patch (niet store)
import { transformWithDelta, normalizePatchEvent } from "@/lib/utils/patch";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";
// ✅ v3.x: META_TOOLING helpers
import { getToolHelp, getOnboardingMessage } from "@/lib/ai/toolHelp";
import { detectMetaTooling } from "@/lib/ai/metaDetection";
import { ChapterInitializer } from "@/lib/ai/ChapterInitializer";
// ✅ v4.0: ANSWER GUARD (TODO: Migrate to v3.1 AnswerGuard class)
import {
  runAnswerGuard,
  buildClarificationPrompt,
  buildRelevancePrompt,
  type AnswerGuardInput,
} from "@/lib/ai/AnswerGuard";

import type { ChatRequest } from "@/types/chat";
import type {
  WizardState,
  ChapterKey,
  PatchEvent,
  GeneratePatchResult,
} from "@/types/project";

export const runtime = "nodejs";
export const maxDuration = 30;

type ServerWizardState = WizardState & {
  mode?: "PREVIEW" | "PREMIUM";
  triage?: any;
};

// ┌──────────────────────────────────────────────────────────────
// │ POST handler
// └──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest;
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.log("[/api/chat] received:", body.query);

  try {
    const { stream, writer } = createSSEStream();

    const initialState = (body.wizardState ||
      {}) as ServerWizardState;

    const mode: "PREVIEW" | "PREMIUM" =
      body.mode || initialState.mode || "PREVIEW";

    runAITriage(writer, {
      requestId,
      startTime,
      query: body.query,
      mode,
      wizardState: initialState,
      clientFastIntent: body.clientFastIntent,
      history: body.history,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[/api/chat] CAUGHT ERROR:", error);
    await logEvent("chat.error", {
      requestId,
      error: String(error),
      stage: "POST-handler",
    });

    return new Response(
      `event: error\ndata: ${JSON.stringify({
        message: "Server error",
        requestId,
      })}\n\n`,
      {
        status: 500,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }
}

// ┌──────────────────────────────────────────────────────────────
// │ CORE TRIAGE LOGIC (v3.3: Complete)
// └──────────────────────────────────────────────────────────────

async function runAITriage(
  writer: SSEWriter,
  ctx: {
    requestId: string;
    startTime: number;
    query: string;
    mode: "PREVIEW" | "PREMIUM";
    wizardState: ServerWizardState;
    clientFastIntent?: ChatRequest["clientFastIntent"];
    history?: ChatRequest["history"];
    previousChapter?: ChapterKey | null;
  }
) {
  const { requestId, startTime, query, mode, history } = ctx;

  console.log("[runAITriage] query:", query);

  // 1) Normaliseer state
  const normalized = normalizeWizardState(ctx.wizardState);
  const initialActive = getActiveChapter(normalized);
  const initialFlow = getChapterFlow(normalized);

  // 2) Verrijk state
  const wizardState: ServerWizardState = {
    ...normalized,
    currentChapter: initialActive ?? normalized.currentChapter,
    chapterFlow: initialFlow,
  };

  const activeChapter = getActiveChapter(wizardState);
  const chapterFlow = getChapterFlow(wizardState);
  const previousChapter = ctx.previousChapter ?? null;

  // ✅ v2.0: Init/Update session
  const session = ConversationEngine.getInitialSession(wizardState);
  session.turnCount += 1;
  wizardState.chatSession = session;

  console.log(`[runAITriage] Turn ${session.turnCount}, PIM NorthStar: ${session.pim?.northStar || 'none'}`);

  try {
    // Chapter transition guard: trigger ChapterInitializer once, skip normal flow
    if (previousChapter && previousChapter !== activeChapter) {
      const initializer = new ChapterInitializer();
      const initResponse = initializer.handleChapterStart(
        activeChapter || "basis",
        wizardState,
        history as any[] || []
      );

      writer.writeEvent("metadata", {
        intent: "CHAPTER_OPENING",
        confidence: 1.0,
        policy: "APPLY_OPTIMISTIC",
        stateVersion: wizardState.stateVersion ?? 0,
        activeChapter,
      });
      writer.writeEvent("stream", { text: initResponse.message });
      writer.writeEvent("done", {
        logId: requestId,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
      });
      return;
    }

    // ┌─────────────────────────────────────────────────────────
    // │ PRE-LAYER: META_TOOLING & ONBOARDING (v3.x)
    // └─────────────────────────────────────────────────────────

    // @protected CHAT_F02_META_TOOLING
    // This detectMetaTooling check MUST remain as the first routing layer.
    // DO NOT REMOVE: prevents tool-help questions from hitting RAG/LLM unnecessarily.
    // Check 1: META_TOOLING (tool help vragen)
    if (detectMetaTooling(query)) {
      console.log("[runAITriage] META_TOOLING detected → fixed response");

      // @protected CHAT_F10_QUICK_REPLIES
      // getToolHelp provides fixed responses with quick reply suggestions per chapter.
      // DO NOT REMOVE: this is the call-site for chapter-specific quick replies.
      const helpResponse = getToolHelp(query, {
        currentChapter: activeChapter || "basis",
      });

      await logEvent("triage.meta_tooling", {
        requestId,
        query,
        activeChapter,
      });

      writer.writeEvent("metadata", {
        intent: "META_TOOLING",
        confidence: 0.95,
        policy: "APPLY_OPTIMISTIC",
        stateVersion: wizardState.stateVersion ?? 0,
        activeChapter,
      });

      writer.writeEvent("stream", { text: helpResponse.answer });

      // Quick replies als suggesties
      if (helpResponse.quickReplies && helpResponse.quickReplies.length > 0) {
        writer.writeEvent("suggestions", {
          suggestions: helpResponse.quickReplies,
        });
      }

      writer.writeEvent("done", {
        logId: requestId,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
      });

      return; // STOP - geen verdere processing
    }

    // @protected CHAT_F03_ONBOARDING
    // This onboarding detection (first message check) MUST remain as the second routing layer.
    // DO NOT REMOVE: ensures first user message gets welcome card with progress/quick replies.
    // Check 2: ONBOARDING (eerste bericht)
    const userMessages = history?.filter((m) => m.role === "user") ?? [];
    if (userMessages.length === 0) {
      console.log("[runAITriage] ONBOARDING detected → welcome message");

      // @protected CHAT_F03_ONBOARDING
      // getOnboardingMessage provides the welcome card response.
      // DO NOT REMOVE: this is the call-site that wires onboarding into the chat flow.
      const onboardingResponse = getOnboardingMessage(
        activeChapter || "basis"
      );

      await logEvent("triage.onboarding", {
        requestId,
        activeChapter,
      });

      writer.writeEvent("metadata", {
        intent: "ONBOARDING",
        confidence: 1.0,
        policy: "APPLY_OPTIMISTIC",
        stateVersion: wizardState.stateVersion ?? 0,
        activeChapter,
      });

      writer.writeEvent("stream", { text: onboardingResponse.answer });

      if (onboardingResponse.quickReplies && onboardingResponse.quickReplies.length > 0) {
        writer.writeEvent("suggestions", {
          suggestions: onboardingResponse.quickReplies,
        });
      }

      writer.writeEvent("done", {
        logId: requestId,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
      });

      return; // STOP - geen verdere processing
    }

    // ┌─────────────────────────────────────────────────────────
    // │ STEP 1: GRADUATED ESSENTIALS GATE (v3.3)
    // └─────────────────────────────────────────────────────────

    console.log("[runAITriage] Checking essentials (graduated)...");
    const missingItems = computeMissingFields(wizardState);
    const { critical, strong, hasCritical, hasStrong } =
      classifyMissing(missingItems);

    // Hard block: CRITICAL essentials
    if (hasCritical) {
      console.log(
        "[runAITriage] HARD BLOCK: Critical essentials missing:",
        critical.map((c) => c.fieldId)
      );

      const firstCritical = critical[0];
      const nudge = makeContextAwareNudge(
        query,
        [firstCritical]
      );

      await logEvent("triage.nudge", {
        requestId,
        severity: "CRITICAL",
        missing: critical.map((m) => m.fieldId),
        query,
        activeChapter,
      });

      writer.writeEvent("metadata", {
        intent: "NUDGE",
        confidence: 1.0,
        policy: "ASK_CLARIFY",
        nudge,
        stateVersion: wizardState.stateVersion ?? 0,
        activeChapter,
      });

      writer.writeEvent("stream", { text: nudge });
      writer.writeEvent("done", {
        logId: requestId,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
      });

      return; // STOP
    }

    // ✅ GAAN DOOR: Critical is OK, strong kan wachten
    if (hasStrong) {
      console.log(
        "[runAITriage] Soft prompt: STRONG essentials missing:",
        strong.map((s) => s.fieldId)
      );
    }

    // ┌─────────────────────────────────────────────────────────
    // │ STEP 2: CLASSIFY & PLAN WATCHER (v2.0)
    // └─────────────────────────────────────────────────────────

    console.log("[runAITriage] Classifying intent & watching plan...");

    // PlanWatcher check
    const { nextPIM, verdict } = ConversationEngine.planWatcher(session.pim!, wizardState, query);
    session.pim = nextPIM;

    const classifyResult = await ProModel.classify(
      query,
      wizardState
    );
    const { intent, confidence } = classifyResult;

    // Mode logic: Default FAST, but trigger FULL if CONFLICT/DRIFT
    const isTriggeredFull = verdict !== 'CONSISTENT' || !!ctx.clientFastIntent;
    const mode_v2 = isTriggeredFull ? "FULL" : "FAST";

    console.log(`[runAITriage] Mode: ${mode_v2}, Verdict: ${verdict}, Intent: ${intent}`);

    const policy = determinePolicy(confidence, intent);

    await logEvent("triage.classify", {
      requestId,
      intent,
      confidence,
      policy,
      activeChapter,
      verdict,
      mode: mode_v2
    });

    writer.writeEvent("metadata", {
      intent,
      confidence,
      policy,
      stateVersion: wizardState.stateVersion ?? 0,
      activeChapter,
    });

    // ┌─────────────────────────────────────────────────────────
    // │ STEP 3: POLICY BRANCHES (v3.3: Multiple patches)
    // └─────────────────────────────────────────────────────────

    let responseText = "";
    const patchesApplied: PatchEvent[] = [];

    if (intent === "VULLEN_DATA") {
      console.log("[runAITriage] VULLEN_DATA → generatePatches");

      const llmResult = await ProModel.generatePatch(
        query,
        wizardState,
        history
      );

      // ✅ v2.0: Handle Intelligence Updates
      if (llmResult.pimUpdate) {
        session.pim = { ...session.pim!, ...llmResult.pimUpdate };
        console.log("[runAITriage] PIM Updated from LLM");
      }

      if (llmResult.newObligation) {
        const newOb = ConversationEngine.createObligation(
          llmResult.newObligation.topic,
          llmResult.newObligation.reason,
          session.turnCount
        );
        session.obligations = [...(session.obligations || []), newOb];
        console.log(`[runAITriage] New Obligation created: ${newOb.topic}`);
      }

      if (llmResult.addressedObligationId) {
        session.obligations = session.obligations?.map(o =>
          o.id === llmResult.addressedObligationId ? { ...o, status: 'addressed' } : o
        );
        console.log(`[runAITriage] Obligation addressed: ${llmResult.addressedObligationId}`);
      }

      // ✅ DRIFT/CONFLICT logic: Disable patches if DRIFT/CONFLICT
      const allowPatchesByVerdict = verdict === 'CONSISTENT';
      if (!allowPatchesByVerdict) {
        console.log("[runAITriage] Patches BLOCKED due to DRIFT/CONFLICT verdict");
      }

      responseText = llmResult.followUpQuestion || "";

      // ✅ v3.6: Check voor reset action
      if (llmResult.action === "reset") {
        console.log("[runAITriage] RESET action detected - sending reset event");
        writer.writeEvent("reset", {});
        // responseText is al gezet door de LLM
      }

      // ✅ v3.7: Check voor undo action
      if (llmResult.action === "undo") {
        console.log("[runAITriage] UNDO action detected - sending undo event");
        writer.writeEvent("undo", {});
        // responseText is al gezet door de LLM
      }

      const patches = allowPatchesByVerdict ? (llmResult.patches ?? []) : [];
      console.log(`[runAITriage] Processing ${patches.length} patches from AI`);

      for (const rawPatch of patches) {
        // ✅ FIX: Use normalizePatchDelta helper
        const patch = normalizePatchEvent(rawPatch as PatchEvent);
        const targetChapter = patch.chapter;

        // ✅ v3.5: Type-veilige UUID Injectie (AI genereert GEEN id meer)
        if (
          patch.delta.operation === "append" &&
          (targetChapter === "ruimtes" || targetChapter === "wensen" || targetChapter === "risico") &&
          typeof patch.delta.value === "object" &&
          patch.delta.value !== null &&
          !Array.isArray(patch.delta.value)
        ) {
          const val = patch.delta.value as { id?: string };
          if (!val.id) {
            val.id = randomUUID();
            console.log(`[runAITriage] Injected new UUID for ${targetChapter}`);
          }
        }

        console.log(`[runAITriage] Processing patch for ${targetChapter}`);

        // 1. Check allowed
        if (!isAllowedChapter(targetChapter, wizardState)) {
          console.warn(
            `[runAITriage] Patch rejected: chapter ${targetChapter} not in flow`
          );
          responseText = `Ik kan het deel **${labelForChapter(targetChapter)}** nog niet toepassen, omdat dit niet in uw huidige traject zit.`;
          break; // Stop at first disallowed
        }

        // 2. Transform + validate
        const prevData =
          wizardState.chapterAnswers[targetChapter as ChapterKey] ?? {};
        const nextData = transformWithDelta(
          prevData as any,
          patch.delta
        );

        if (!validateChapter(targetChapter, nextData)) {
          console.warn(
            `[runAITriage] Patch validation FAILED for ${targetChapter}:`,
            patch.delta
          );

          responseText =
            "Ik kan dit nog niet verwerken omdat het geen geldige situatie oplevert. Kunt u dit wat concreter maken?";

          await logEvent("triage.patch_rejected", {
            requestId,
            chapter: targetChapter,
            delta: patch.delta,
            reason: "validation_failed",
          });

          break; // Stop at first invalid
        }

        // 3. Apply + emit
        wizardState.chapterAnswers[targetChapter as ChapterKey] = nextData as any;
        wizardState.stateVersion = (wizardState.stateVersion ?? 0) + 1;

        writer.writeEvent("patch", patch);
        patchesApplied.push(patch);

        console.log(
          `[runAITriage] Patch applied: ${targetChapter} (state v${wizardState.stateVersion})`
        );

        await logEvent("triage.patch_applied", {
          requestId,
          chapter: targetChapter,
          delta: patch.delta,
        });
      }

      // Emit navigate to last-touched chapter
      if (patchesApplied.length > 0) {
        const lastChapter = patchesApplied[patchesApplied.length - 1]
          .chapter;
        writer.writeEvent("navigate", { chapter: lastChapter });

        // ✅ v3.8: Expert focus sync - stuur focus naar het aangepaste veld
        const lastPatch = patchesApplied[patchesApplied.length - 1];
        if (lastPatch.delta?.path) {
          const focusKey = `${lastPatch.chapter}:${lastPatch.delta.path}`;
          writer.writeEvent("expert_focus", { focusKey, query });
          console.log(`[runAITriage] Expert focus sent: ${focusKey}`);
        }
      }

      // ✅ v3.6: GEEN automatische soft nudges meer
      // De AI bepaalt zelf wanneer het logisch is om naar ontbrekende info te vragen
      // Dit voorkomt "domme" vragen die niet bij het gesprek passen
    } else if (intent === "ADVIES_VRAAG") {
      console.log("[runAITriage] ADVIES_VRAAG → RAG + AnswerGuard");
      const ragContext = await Kennisbank.query(query, {
        chapter: activeChapter ?? undefined,
        isPremium: mode === "PREMIUM",
      });

      // ✅ v4.0: STEP 1 - Genereer DRAFT antwoord
      const draftAnswer = await ProModel.generateResponse(
        query,
        ragContext,
        { mode, wizardState, history }
      );

      console.log("[runAITriage] Draft answer generated, running AnswerGuard...");

      // ✅ v4.0: STEP 2 - Valideer met AnswerGuard
      const guardInput: AnswerGuardInput = {
        userQuery: query,
        intent,
        activeChapter,
        draftAnswer,
        ragMeta: {
          topicId: ragContext.topicId,
          docsFound: ragContext.docs?.length || 0,
          cacheHit: ragContext.cacheHit,
        },
      };

      const guardResult = await runAnswerGuard(guardInput, callLLMForValidation);

      // ✅ v4.0: STEP 3 - Handel verdict af
      if (guardResult.verdict === "OK") {
        // Draft is goed, gebruik die
        console.log("[runAITriage] AnswerGuard: OK - using draft");
        responseText = draftAnswer;
      } else if (guardResult.verdict === "NEEDS_CLARIFICATION") {
        // Vraag is te vaag, genereer verbeterd antwoord met verduidelijkingsvragen
        console.log("[runAITriage] AnswerGuard: NEEDS_CLARIFICATION - generating clarification");

        await logEvent("answer_guard.needs_clarification", {
          requestId,
          query,
          intent,
          reasons: guardResult.reasons,
        });

        const clarificationPrompt = buildClarificationPrompt(
          query,
          guardResult.suggestions
        );

        responseText = await generateImprovedResponse(
          query,
          clarificationPrompt,
          mode
        );
      } else if (guardResult.verdict === "IRRELEVANT") {
        // Antwoord is niet relevant, genereer verbeterd antwoord
        console.log("[runAITriage] AnswerGuard: IRRELEVANT - generating focused answer");

        await logEvent("answer_guard.irrelevant", {
          requestId,
          query,
          intent,
          reasons: guardResult.reasons,
        });

        const relevancePrompt = buildRelevancePrompt(
          query,
          guardResult.suggestions
        );

        responseText = await generateImprovedResponse(
          query,
          relevancePrompt,
          mode
        );
      }

      // ✅ v3.8: Expert focus sync voor adviesvragen
      // Als de RAG een topic vindt, update de ExpertCorner focus
      if (ragContext.topicId && ragContext.topicId !== "general") {
        const topicToChapter: Record<string, string> = {
          natural_light: "duurzaam:daglichtAmbitie",
          soundproofing: "duurzaam:akoestiekAmbitie",
          thermal_comfort: "techniek:heatingAmbition",
          budget_estimation: "budget:budgetTotaal",
          permits_regulation: "basis:projectType",
          materials: "duurzaam:materiaalstrategie",
        };
        const focusKey = topicToChapter[ragContext.topicId];
        if (focusKey) {
          writer.writeEvent("expert_focus", { focusKey, query });
          console.log(`[runAITriage] Expert focus from RAG topic: ${focusKey}`);
        }
      }
    } else if (intent === "NAVIGATIE") {
      console.log("[runAITriage] NAVIGATIE");
      const target = resolveNavigationTarget(
        query,
        wizardState,
        chapterFlow
      );

      if (target && isAllowedChapter(target, wizardState)) {
        writer.writeEvent("navigate", { chapter: target });
        responseText = `Prima, we gaan naar **${labelForChapter(
          target
        )}**.`;
      } else if (target) {
        responseText =
          "Dat hoofdstuk is in uw huidige traject niet beschikbaar.";
      } else {
        responseText =
          "Ik kon niet goed bepalen naar welk onderdeel u wilt. Probeer: 'ga naar [hoofdstuk]'.";
      }
    } else {
      console.log("[runAITriage] SMALLTALK/FALLBACK → with AnswerGuard");

      // ✅ v4.0: STEP 1 - Genereer DRAFT antwoord
      const draftAnswer = await ProModel.generateResponse(
        query,
        null,
        { mode, wizardState, history }
      );

      console.log("[runAITriage] Draft answer generated, running AnswerGuard...");

      // ✅ v4.0: STEP 2 - Valideer met AnswerGuard (ook voor SMALLTALK)
      const guardInput: AnswerGuardInput = {
        userQuery: query,
        intent,
        activeChapter,
        draftAnswer,
      };

      const guardResult = await runAnswerGuard(guardInput, callLLMForValidation);

      // ✅ v4.0: STEP 3 - Handel verdict af
      if (guardResult.verdict === "OK") {
        console.log("[runAITriage] AnswerGuard: OK - using draft");
        responseText = draftAnswer;
      } else if (guardResult.verdict === "NEEDS_CLARIFICATION") {
        console.log("[runAITriage] AnswerGuard: NEEDS_CLARIFICATION - generating clarification");

        await logEvent("answer_guard.needs_clarification", {
          requestId,
          query,
          intent,
          reasons: guardResult.reasons,
        });

        const clarificationPrompt = buildClarificationPrompt(
          query,
          guardResult.suggestions
        );

        responseText = await generateImprovedResponse(
          query,
          clarificationPrompt,
          mode
        );
      } else if (guardResult.verdict === "IRRELEVANT") {
        console.log("[runAITriage] AnswerGuard: IRRELEVANT - generating focused answer");

        await logEvent("answer_guard.irrelevant", {
          requestId,
          query,
          intent,
          reasons: guardResult.reasons,
        });

        const relevancePrompt = buildRelevancePrompt(
          query,
          guardResult.suggestions
        );

        responseText = await generateImprovedResponse(
          query,
          relevancePrompt,
          mode
        );
      }
    }

    // ┌─────────────────────────────────────────────────────────
    // │ STEP 4: STREAM TEXT (SSE-volgorde: patches eerst!)
    // └─────────────────────────────────────────────────────────

    if (responseText) {
      for (const chunk of chunkText(responseText)) {
        writer.writeEvent("stream", { text: chunk });
      }
    }

    // Final session state event
    writer.writeEvent("chat_session", session);

    writer.writeEvent("done", {
      logId: requestId,
      tokensUsed: classifyResult.tokensUsed ?? 0,
      latencyMs: Date.now() - startTime,
      mode: mode_v2,
      verdict,
    });
  } catch (error) {
    console.error("[runAITriage] CAUGHT ERROR:", error);
    await logEvent("triage.error", {
      requestId,
      error: String(error),
    });
    writer.writeEvent("error", {
      message:
        "Er ging iets mis bij het verwerken van uw vraag.",
    });
  } finally {
    console.log("[runAITriage] Closing stream");
    writer.close();
  }
}

// ┌──────────────────────────────────────────────────────────────
// │ HELPERS
// └──────────────────────────────────────────────────────────────

function normalizeWizardState(
  state: ServerWizardState
): ServerWizardState {
  return {
    stateVersion: state.stateVersion ?? 1,
    chapterAnswers: state.chapterAnswers ?? {},
    currentChapter: state.currentChapter,
    chapterFlow: Array.isArray(state.chapterFlow)
      ? state.chapterFlow
      : [],
    focusedField: state.focusedField,
    showExportModal: state.showExportModal,
    mode: state.mode,
    triage: state.triage,
  };
}

function getChapterFlow(
  state: ServerWizardState
): ChapterKey[] {
  return Array.isArray(state.chapterFlow)
    ? state.chapterFlow
    : [];
}

function getActiveChapter(
  state: ServerWizardState
): ChapterKey | null {
  if (state.currentChapter) return state.currentChapter;
  const flow = getChapterFlow(state);
  return flow.length > 0 ? flow[0] : null;
}

function isAllowedChapter(
  target: ChapterKey,
  state: ServerWizardState
): boolean {
  const flow = getChapterFlow(state);
  if (!flow || flow.length === 0) return true;
  return flow.includes(target);
}

function makeContextAwareNudge(
  query: string,
  missingItems: MissingItem[]
): string {
  const sorted = [...missingItems].sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "required" ? -1 : 1;
  });

  const first = sorted[0];
  const pretty = first.label;

  return `Ik wil graag **"${query}"** voor u verwerken. Mag ik daarvoor eerst ${pretty} noteren? Dan kan ik u gerichter helpen.`;
}

function determinePolicy(
  confidence: number,
  intent: string
):
  | "APPLY_OPTIMISTIC"
  | "APPLY_WITH_INLINE_VERIFY"
  | "ASK_CLARIFY"
  | "CLASSIFY" {
  if (intent === "NAVIGATIE") {
    return confidence >= 0.7
      ? "APPLY_OPTIMISTIC"
      : "ASK_CLARIFY";
  }
  if (intent === "ADVIES_VRAAG") {
    return confidence >= 0.7
      ? "APPLY_WITH_INLINE_VERIFY"
      : "ASK_CLARIFY";
  }
  if (intent === "SMALLTALK") {
    return "CLASSIFY";
  }
  // VULLEN_DATA
  return confidence >= 0.9
    ? "APPLY_WITH_INLINE_VERIFY"
    : "ASK_CLARIFY";
}

function resolveNavigationTarget(
  query: string,
  state: ServerWizardState,
  flow: ChapterKey[]
): ChapterKey | null {
  const q = query.toLowerCase();

  const map: Record<string, ChapterKey> = {
    basis: "basis",
    start: "basis",
    introductie: "basis",
    wensen: "wensen",
    "wensen en eisen": "wensen",
    kamers: "ruimtes",
    ruimtes: "ruimtes",
    indeling: "ruimtes",
    budget: "budget",
    kosten: "budget",
    techniek: "techniek",
    installaties: "techniek",
    duurzaam: "duurzaam",
    duurzaamheid: "duurzaam",
    risico: "risico",
    "risico's": "risico",
    preview: "basis",
    samenvatting: "basis",
    export: "basis",
    pve: "basis",
  };

  for (const [key, chapter] of Object.entries(map)) {
    if (q.includes(key)) return chapter;
  }

  const active = getActiveChapter(state);
  if (!active || !flow || flow.length === 0) return null;

  const idx = flow.indexOf(active);
  if (idx === -1) return null;

  if (q.includes("volgende") || q.includes("next")) {
    return (flow[idx + 1] ?? flow[idx]) || null;
  }
  if (
    q.includes("vorige") ||
    q.includes("terug") ||
    q.includes("back")
  ) {
    return (flow[idx - 1] ?? flow[idx]) || null;
  }

  return null;
}

function labelForChapter(ch: ChapterKey): string {
  const labels: Record<ChapterKey, string> = {
    basis: "Basis",
    wensen: "Wensen",
    ruimtes: "Ruimtes",
    budget: "Budget",
    techniek: "Techniek",
    duurzaam: "Duurzaamheid",
    risico: "Risico's",
  };
  return labels[ch] ?? ch;
}

function chunkText(text: string, size = 48): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let buf: string[] = [];

  for (const w of words) {
    const next = (buf.join(" ") + " " + w).trim();
    if (next.length > size && buf.length) {
      chunks.push(buf.join(" ") + " ");
      buf = [w];
    } else {
      buf.push(w);
    }
  }

  if (buf.length) {
    chunks.push(buf.join(" ") + " ");
  }

  return chunks;
}

/**
 * ✅ v4.0: Helper voor LLM calls die AnswerGuard gebruikt
 * Maakt een eenvoudige LLM-call zonder streaming voor validatie doeleinden
 */
async function callLLMForValidation(opts: {
  system: string;
  user: string;
}): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Gebruik mini voor snelle validatie
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        temperature: 0.0,
        response_format: { type: "json_object" },
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM validation error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  } catch (error) {
    console.error("[callLLMForValidation] Error:", error);
    return '{"verdict":"OK","reasons":[],"suggestions":[],"confidence":0.5}';
  }
}

/**
 * ✅ v4.0: Helper om een verbeterde response te genereren na AnswerGuard feedback
 */
async function generateImprovedResponse(
  query: string,
  improvedPrompt: string,
  mode: "PREVIEW" | "PREMIUM"
): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: mode === "PREMIUM" ? "gpt-4o" : "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `U bent Jules, de digitale bouwcoach van Brikx.
U bent vriendelijk, behulpzaam en eerlijk.
Spreek de gebruiker aan met "u".`,
          },
          { role: "user", content: improvedPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM improved response error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "Kunt u uw vraag iets specifieker formuleren?"
    );
  } catch (error) {
    console.error("[generateImprovedResponse] Error:", error);
    return "Kunt u uw vraag iets specifieker formuleren? Dan kan ik u beter helpen.";
  }
}

// Test helper export
export { runAITriage };
