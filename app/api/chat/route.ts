// /app/api/chat/route.ts
import { NextRequest } from "next/server";
import { createSSEStream } from "@/lib/sse/stream";
import { logEvent } from "@/lib/logging/logEvent";
import { runAITriage, type ServerWizardState } from "./logic";
import type { ChatRequest } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 30;

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

    const initialState = (body.wizardState || {}) as ServerWizardState;
    const mode: "PREVIEW" | "PREMIUM" = body.mode || initialState.mode || "PREVIEW";

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
