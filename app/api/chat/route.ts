// /app/api/chat/route.ts
import { NextRequest } from "next/server";
import { ProModel } from "@/lib/ai/ProModel";

export const runtime = "nodejs";
export const maxDuration = 45;
// Optioneel: forceer dynamisch gedrag (SSE / geen cache)
// export const dynamic = "force-dynamic";

function openSSE() {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  return {
    readable,
    writer,
    close: () => writer.close(),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = String(body?.query ?? "");
  const wizardState = body?.wizardState ?? {};

  const { readable, writer, close } = openSSE();

  (async () => {
    try {
      // Handshake
      await writer.write(
        `event: metadata\ndata: ${JSON.stringify({
          hello: "brikx-v2",
          policy: "BOOT",
        })}\n\n`
      );

      // ✅ Één brein: AI-First Triage (Nudge → Classify → Rules/LLM-tool → RAG)
      await ProModel.runTriage(writer, query, wizardState);
    } catch (e: any) {
      await writer.write(
        `event: error\ndata: ${JSON.stringify({
          message: "Onverwachte fout in chat route",
          detail: String(e?.message ?? e),
        })}\n\n`
      );
      await writer.write(`event: done\ndata: {}\n\n`);
    } finally {
      await close();
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
