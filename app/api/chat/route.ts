// /app/api/chat/route.ts

import { NextRequest } from "next/server";
import { ProModel } from "@/lib/ai/ProModel";
import { Kennisbank } from "@/lib/rag/Kennisbank";
import { createSSEStream, type SSEWriter } from "@/lib/sse/stream";
import { logEvent } from "@/lib/logging/logEvent";

import type { ChatRequest } from "@/types/chat";
import type {
  WizardState,
  ChapterKey as BaseChapterKey,
} from "@/types/wizard";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChapterKey = BaseChapterKey;

type BrikxWizardState = WizardState & {
  chapterFlow?: ChapterKey[];
  triage?: (WizardState["triage"] & { currentChapter?: ChapterKey }) | undefined;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest;
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.log('[route.ts] POST /api/chat received:', body.query);

  try {
    const { stream, writer } = createSSEStream();

    console.log('[route.ts] SSE stream created, starting runAITriage');

    await runAITriage(writer, {
      requestId,
      startTime,
      query: body.query,
      mode: body.mode,
      clientFastIntent: body.clientFastIntent,
      wizardState: body.wizardState as BrikxWizardState,
    });

    console.log('[route.ts] runAITriage completed, returning stream');

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error('[route.ts] CAUGHT ERROR:', error);
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

// ┌──────────────────────────────────────────────────────────────────────────────
// │  CORE TRIAGE LOGICA – CONTEXT & FLOW-GATING
// └──────────────────────────────────────────────────────────────────────────────

async function runAITriage(
  writer: SSEWriter,
  ctx: {
    requestId: string;
    startTime: number;
    query: string;
    mode: "PREVIEW" | "PREMIUM";
    wizardState: BrikxWizardState;
    clientFastIntent?: ChatRequest["clientFastIntent"];
  }
) {
  const { requestId, startTime, query, mode } = ctx;

  console.log('[runAITriage] Starting with query:', query);

  // 1) Normaliseer inkomende state
  const normalized = normalizeWizardState(ctx.wizardState);
  const initialActive = getActiveChapter(normalized);
  const initialFlow = getChapterFlow(normalized);

  // 2) Verrijk state zodat ProModel genoeg context uit wizardState zelf kan halen
  const wizardState: BrikxWizardState = {
    ...normalized,
    currentChapter: initialActive ?? normalized.currentChapter,
    chapterFlow: initialFlow,
    triage: {
      ...(normalized.triage ?? {}),
      currentChapter:
        initialActive ??
        normalized.triage?.currentChapter ??
        normalized.currentChapter,
    },
  };

  const activeChapter = getActiveChapter(wizardState);
  const chapterFlow = getChapterFlow(wizardState);

  try {
    // STEP 1 – Essentials + Context-Aware Nudge
    console.log('[runAITriage] Checking essentials...');
    const missing = checkEssentials(wizardState);

    if (missing.length > 0) {
      console.log('[runAITriage] Missing essentials:', missing);
      const nudge = makeContextAwareNudge(query, missing);

      await logEvent("triage.nudge", {
        requestId,
        missing,
        query,
        activeChapter,
      });

      console.log('[runAITriage] Sending nudge event');
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
  
      console.log('[runAITriage] Nudge stream closed');
      return;
    }

    // STEP 2 – Classify intent (met verrijkte wizardState)
    console.log('[runAITriage] Classifying intent...');
    const classifyResult = await ProModel.classify(query, wizardState);
    const { intent, confidence } = classifyResult;
    const policy = determinePolicy(confidence, intent);

    console.log('[runAITriage] Intent classified:', intent, 'confidence:', confidence, 'policy:', policy);

    await logEvent("triage.classify", {
      requestId,
      intent,
      confidence,
      policy,
      activeChapter,
    });

    writer.writeEvent("metadata", {
      intent,
      confidence,
      policy,
      stateVersion: wizardState.stateVersion ?? 0,
      activeChapter,
    });

    // STEP 3 – Policy Branching
    let patch: any = null;
    let responseText = "";
    let ragContext: any = null;

    // 3A – VULLEN_DATA
    if (intent === "VULLEN_DATA") {
      console.log('[runAITriage] VULLEN_DATA - generating patch');
      patch = await ProModel.generatePatch(query, wizardState);

      if (patch) {
        const targetChapter = (patch.chapter ?? patch.chapterKey) as
          | ChapterKey
          | undefined;

        if (targetChapter && !isAllowedChapter(targetChapter, wizardState)) {
          await logEvent("triage.patch.blocked", {
            requestId,
            reason: "chapter_not_in_flow",
            patch,
            chapterFlow,
          });

          writer.writeEvent("stream", {
            text:
              "Ik kan deze stap niet toepassen, omdat dit hoofdstuk niet beschikbaar is in uw traject.",
          });
        } else {
          console.log('[runAITriage] Sending patch event:', patch);
          writer.writeEvent("patch", patch);
          await logEvent("triage.patch", {
            requestId,
            patch,
          });
        }
      }

      responseText =
        responseText ||
        "Dank u, ik heb dit verwerkt in uw ingevulde gegevens.";

      // 3B – ADVIES_VRAAG (via RAG)
    } else if (intent === "ADVIES_VRAAG") {
      console.log('[runAITriage] ADVIES_VRAAG - querying RAG');
      ragContext = await Kennisbank.query(query, {
        chapter: activeChapter ?? undefined,
        isPremium: mode === "PREMIUM",
      });

      if (ragContext) {
        writer.writeEvent("rag_metadata", {
          topicId: ragContext.topicId,
          docsRetrieved: ragContext.docs.length,
          cacheHit: ragContext.cacheHit,
        });
      }

      responseText = await ProModel.generateResponse(query, ragContext, {
        mode,
        wizardState,
      });

      // 3C – NAVIGATIE (flow-gated)
    } else if (intent === "NAVIGATIE") {
      console.log('[runAITriage] NAVIGATIE - resolving target');
      const target = resolveNavigationTarget(query, wizardState, chapterFlow);

      if (target && isAllowedChapter(target, wizardState)) {
        writer.writeEvent("navigate", { chapter: target });
        responseText = `Prima, we gaan naar **${labelForChapter(
          target
        )}**.`;
      } else if (target) {
        responseText =
          "Dat hoofdstuk is in uw huidige traject niet beschikbaar. Kies eerst een passende projectvariant of upgrade uw pakket.";
      } else {
        responseText =
          "Ik kon niet goed bepalen naar welk onderdeel u wilt. Noem bijvoorbeeld: 'ga naar budget', 'ga naar wensen' of 'toon preview'.";
      }

      // 3D – SMALLTALK / fallback
    } else {
      console.log('[runAITriage] SMALLTALK/fallback - generating response');
      responseText = await ProModel.generateResponse(query, null, {
        mode,
        wizardState,
      });
    }

    // STEP 4 – Stream antwoordtekst
    if (responseText) {
      console.log('[runAITriage] Streaming response text:', responseText.substring(0, 100));
      for (const chunk of chunkText(responseText)) {
        writer.writeEvent("stream", { text: chunk });
      }
    }

    console.log('[runAITriage] Sending done event');
    writer.writeEvent("done", {
      logId: requestId,
      tokensUsed: classifyResult.tokensUsed ?? 0,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('[runAITriage] CAUGHT ERROR:', error);
    await logEvent("triage.error", {
      requestId,
      error: String(error),
    });
    writer.writeEvent("error", {
      message: "Er ging iets mis bij het verwerken van uw vraag.",
    });
  } finally {
    console.log('[runAITriage] Closing stream');
    writer.close();
  }
}

// ┌──────────────────────────────────────────────────────────────────────────────
// │               HELPERS & UTILITIES
// └──────────────────────────────────────────────────────────────────────────────

function normalizeWizardState(state: BrikxWizardState): BrikxWizardState {
  return {
    stateVersion: state.stateVersion ?? 0,
    chapterAnswers: state.chapterAnswers ?? {},
    triage: state.triage ?? {},
    currentChapter:
      state.currentChapter ?? state.triage?.currentChapter ?? undefined,
    chapterFlow: state.chapterFlow ?? [],
    focusedField: state.focusedField,
    showExportModal: state.showExportModal,
  };
}

function getChapterFlow(state: BrikxWizardState): ChapterKey[] {
  return Array.isArray(state.chapterFlow) ? state.chapterFlow : [];
}

function getActiveChapter(state: BrikxWizardState): ChapterKey | null {
  if (state.currentChapter) return state.currentChapter;
  if (state.triage?.currentChapter) return state.triage.currentChapter!;
  const flow = getChapterFlow(state);
  return flow.length > 0 ? flow[0] : null;
}

function isAllowedChapter(target: ChapterKey, state: BrikxWizardState): boolean {
  const flow = getChapterFlow(state);
  if (!flow || flow.length === 0) return true; // backwards compat
  return flow.includes(target);
}

function checkEssentials(state: BrikxWizardState): string[] {
  const missing: string[] = [];

  if (!state.chapterAnswers?.basis?.projectNaam) {
    missing.push("basis.projectNaam");
  }

  if (!state.triage?.projectType) {
    missing.push("triage.projectType");
  }

  return missing;
}

function makeContextAwareNudge(query: string, missing: string[]): string {
  const pretty = missing
    .map((key) => {
      const [, field] = key.split(".");
      switch (field) {
        case "projectNaam":
          return "een projectnaam";
        case "projectType":
          return "het type project (bijv. nieuwbouw, verbouwing)";
        default:
          return field;
      }
    })
    .join(" en ");

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
  if (intent === "VULLEN_DATA") {
    if (confidence >= 0.95) return "APPLY_OPTIMISTIC";
    if (confidence >= 0.7) return "APPLY_WITH_INLINE_VERIFY";
    if (confidence >= 0.5) return "ASK_CLARIFY";
    return "CLASSIFY";
  }

  if (intent === "ADVIES_VRAAG") {
    if (confidence >= 0.7) return "APPLY_WITH_INLINE_VERIFY";
    if (confidence >= 0.5) return "ASK_CLARIFY";
    return "CLASSIFY";
  }

  if (intent === "NAVIGATIE") {
    if (confidence >= 0.7) return "APPLY_OPTIMISTIC";
    return "ASK_CLARIFY";
  }

  return "CLASSIFY";
}

function resolveNavigationTarget(
  query: string,
  state: BrikxWizardState,
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
    risico: 'risico',
    preview: "preview",
    samenvatting: "preview",
    export: "preview",
    pve: "preview",
  };

  for (const [key, chapter] of Object.entries(map)) {
    if (q.includes(key)) return chapter;
  }

  const active = getActiveChapter(state);
  if (!active || !flow || flow.length === 0) return null;

  const idx = flow.indexOf(active);
  if (idx === -1) return null;

  if (q.includes("volgende") || q.includes("next")) {
    return flow[idx + 1] ?? flow[idx];
  }
  if (q.includes("vorige") || q.includes("terug") || q.includes("back")) {
    return flow[idx - 1] ?? flow[idx];
  }

  return null;
}

function labelForChapter(ch: ChapterKey): string {
  switch (ch) {
    case "basis":
      return "Basis";
    case "wensen":
      return "Wensen";
    case "ruimtes":
      return "Ruimtes";
    case "budget":
      return "Budget";
    case "techniek":
      return "Techniek";
    case "duurzaam":
      return "Duurzaamheid";
    case "risico":
      return "Risicos";
    case "preview":
      return "Preview & PvE";
    default:
      return ch;
  }
}

function chunkText(text: string, size = 48): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let buf: string[] = [];

  for (const w of words) {
    if ((buf.join(" ") + " " + w).length > size) {
      chunks.push(buf.join(" ") + " ");
      buf = [w];
    } else {
      buf.push(w);
    }
  }

  if (buf.length) chunks.push(buf.join(" ") + " ");
  return chunks;
}