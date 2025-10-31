// /app/api/chat/route.ts
import { NextRequest } from "next/server";
import { createSSEStream } from "@/lib/sse/stream";
import { logEvent } from "@/lib/logging/logEvent";
import { ProModel } from "@/lib/ai/ProModel";
import { Kennisbank } from "@/lib/rag/Kennisbank";
import type { ChatRequest, WizardState } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  return new Response("ok", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest;
  const { query, wizardState, mode } = body;

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { stream, writer } = createSSEStream();
    runAITriage(writer, { requestId, query, wizardState, mode, startTime });
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    logEvent(requestId, "chat.error", { error: String(error) });
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: "Server error" })}\n\n`,
      { status: 500, headers: { "Content-Type": "text/event-stream; charset=utf-8" } }
    );
  }
}

type Ctx = {
  requestId: string;
  query: string;
  wizardState: WizardState;
  mode: "PREVIEW" | "PREMIUM";
  startTime: number;
};
type SSEWriter = ReturnType<typeof createSSEStream>["writer"];

function checkEssentials(ws: WizardState): string[] {
  const missing: string[] = [];
  if (!ws?.chapterAnswers?.basis?.projectNaam) missing.push("basis.projectNaam");
  if (!ws?.triage?.projectType) missing.push("triage.projectType");
  return missing;
}

function makeContextAwareNudge(query: string, missing: string[]): string {
  const pretty = missing.map((m) => `**${m.split(".")[1]}**`).join(", ");
  return `Ik wil graag **"${query}"** voor je verwerken. Mag ik daarvoor eerst ${pretty} noteren? Dan kan ik je gerichter helpen.`;
}

function determinePolicy(
  confidence: number,
  _intent: string
): "APPLY_OPTIMISTIC" | "APPLY_WITH_INLINE_VERIFY" | "ASK_CLARIFY" | "CLASSIFY" {
  if (confidence >= 0.95) return "APPLY_OPTIMISTIC";
  if (confidence >= 0.7) return "APPLY_WITH_INLINE_VERIFY";
  if (confidence >= 0.5) return "ASK_CLARIFY";
  return "CLASSIFY";
}

async function runAITriage(writer: SSEWriter, ctx: Ctx) {
  const { requestId, query, wizardState, mode, startTime } = ctx;

  try {
    // start-ping
    writer.writeEvent("metadata", {
      intent: "CLASSIFY",
      confidence: 0,
      policy: "CLASSIFY",
      stateVersion: wizardState.stateVersion ?? 0,
    });

    const classify = await ProModel.classify(query, {
      triage: wizardState.triage,
      chapterAnswers: wizardState.chapterAnswers,
    });
    const policy = determinePolicy(classify.confidence, classify.intent);
    logEvent(requestId, "triage.classify", { intent: classify.intent, confidence: classify.confidence, policy });
    writer.writeEvent("metadata", {
      intent: classify.intent,
      confidence: classify.confidence,
      policy,
      stateVersion: wizardState.stateVersion ?? 0,
    });

    const essentials = checkEssentials(wizardState);
    const essentialsMissing = essentials.length > 0;
    const isDataFill = classify.intent === "VULLEN_DATA" && classify.confidence >= 0.8;

    if (essentialsMissing && !isDataFill) {
      const nudgeText = makeContextAwareNudge(query, essentials);
      logEvent(requestId, "triage.nudge", { missing: essentials, query });
      writer.writeEvent("metadata", {
        intent: "NUDGE",
        confidence: 1.0,
        policy: "ASK_CLARIFY",
        nudge: nudgeText,
        stateVersion: wizardState.stateVersion ?? 0,
      });
      writer.writeEvent("stream", { text: nudgeText });
      writer.writeEvent("done", { logId: requestId, tokensUsed: 0, latencyMs: Date.now() - startTime });
      writer.close();
      return;
    }

    let responseText = "";

    if (classify.intent === "VULLEN_DATA") {
      const patchOrPatches = await ProModel.generatePatch(query, wizardState);

      let navigateChapter: string | null = null;

      if (patchOrPatches) {
        if (Array.isArray(patchOrPatches)) {
          for (const p of patchOrPatches) {
            writer.writeEvent("patch", p);
            navigateChapter ??= p.chapter; // nav eenmaal, eerste patch bepaalt
          }
        } else {
          writer.writeEvent("patch", patchOrPatches);
          navigateChapter = patchOrPatches.chapter;
        }
        logEvent(requestId, "triage.patch", { patch: patchOrPatches });

        // ✅ direct navigeren naar het hoofdstuk waar we net iets invulden
        if (navigateChapter) {
          writer.writeEvent("navigate", { chapter: navigateChapter });
          logEvent(requestId, "triage.navigate", { chapter: navigateChapter });
        }
      }

      responseText = patchOrPatches
        ? "Dank je, ik heb dit genoteerd in de wizard."
        : "Ik heb je input gelezen. Wil je dit toevoegen aan de wizard? Licht dit evt. toe.";
    } else if (classify.intent === "NAVIGATIE") {
      const target = ProModel.extractNavigation(query);
      if (target) {
        writer.writeEvent("navigate", { chapter: target });
        logEvent(requestId, "triage.navigate", { chapter: target });
        responseText = `Ik open **${target}**.`;
      } else {
        responseText = "Welke sectie wil je openen? (bijv. “ga naar budget”).";
      }
    } else if (classify.intent === "ADVIES_VRAAG") {
      const rag = await Kennisbank.query(query, {
        chapter: wizardState.triage?.currentChapter,
        isPremium: mode === "PREMIUM",
      });
      writer.writeEvent("rag_metadata", { topicId: rag.topicId, docsRetrieved: rag.docs.length, cacheHit: rag.cacheHit });
      responseText = await ProModel.generateResponse(query, rag, { mode, wizardState });
    } else {
      responseText = await ProModel.generateResponse(query, null, { mode, wizardState });
    }

    for (const chunk of responseText.split(" ")) {
      writer.writeEvent("stream", { text: chunk + " " });
      await new Promise((r) => setTimeout(r, 6));
    }

    writer.writeEvent("done", { logId: requestId, tokensUsed: 0, latencyMs: Date.now() - startTime });
  } catch (e) {
    logEvent(ctx.requestId, "triage.error", { error: String(e) });
    writer.writeEvent("error", { message: String(e) });
  } finally {
    writer.close();
  }
}
