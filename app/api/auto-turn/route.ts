// /app/api/auto-turn/route.ts
// Auto-turn server route: runs orchestrateTurn and streams SSE

import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { createSSEStream } from "@/lib/sse/stream";
import { orchestrateTurn } from "@/lib/ai/orchestrateTurn";
import type { WizardState } from "@/types/project";
import type { ArchitectEvent } from "@/lib/ai/ArchitectTriggers";
import {
  buildAutoTurnFallback,
  buildAutoTurnQuery,
  enforceAutoTurnContract,
  mapAutoTurnTriggerType,
  validateAutoTurnContract,
} from "@/lib/ai/autoTurn";

export const runtime = "nodejs";
export const maxDuration = 30;

type AutoTurnRequest = {
  event: ArchitectEvent;
  wizardState: WizardState;
  projectId?: string;
  userId?: string;
};

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

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const startTime = Date.now();
  const { stream, writer } = createSSEStream();

  try {
    const body = (await req.json()) as AutoTurnRequest;
    const event = body?.event;
    const wizardState = body?.wizardState;

    if (!event || !wizardState) {
      writer.writeEvent("error", {
        message: "Invalid auto-turn request payload",
        recoverable: false,
      });
      writer.close();
      return new Response(stream, {
        status: 400,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const query = buildAutoTurnQuery(event);
    const triggerType = mapAutoTurnTriggerType(event.type);

    const baseInput = {
      query,
      wizardState,
      projectId: body.projectId ?? "default",
      userId: body.userId ?? "auto",
      currentChapter: event.chapter,
      mode: "PREMIUM" as const,
      interactionMode: "auto" as const,
      triggerType,
      triggerId: event.id,
      skipAnticipation: false,
      skipConflictDetection: false,
    };

    const result = await orchestrateTurn(baseInput);
    let finalResponse = result?.response ?? "";
    let check = validateAutoTurnContract(event, finalResponse);

    if (!check.ok) {
      const correctionQuery =
        `${query}\n[FORMAT_GUARD]\n` +
        "Gebruik exact Context:/Inzicht:/Actie: en maximaal 1 vraag. Schrijf formeel Nederlands (u/uw), geen emoji's.";
      const retryResult = await orchestrateTurn({
        ...baseInput,
        query: correctionQuery,
      });
      finalResponse = retryResult?.response ?? finalResponse;
      check = validateAutoTurnContract(event, finalResponse);
    }

    const safeResponse = check.ok
      ? enforceAutoTurnContract(event, finalResponse)
      : buildAutoTurnFallback(event);

    writer.writeEvent("metadata", {
      intent: "CLASSIFY",
      confidence: 1.0,
      policy: "JUST_ANSWER",
      stateVersion: wizardState.stateVersion ?? 0,
    });

    if (result?.patches && Array.isArray(result.patches)) {
      for (const patch of result.patches) {
        writer.writeEvent("patch", patch);
      }
    }

    for (const chunk of chunkText(safeResponse)) {
      writer.writeEvent("stream", { text: chunk });
    }

    writer.writeEvent("done", {
      logId: requestId,
      tokensUsed: result?.metadata?.tokensUsed ?? 0,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[/api/auto-turn] CAUGHT ERROR:", error);
    writer.writeEvent("error", {
      message: "Server error",
      recoverable: true,
    });
  } finally {
    writer.close();
  }

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
