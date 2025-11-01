// /app/api/chat/route.ts
import { NextRequest } from "next/server";
import type { WritableStreamDefaultWriter } from "stream/web";
import { ProModel } from "@/lib/ai/ProModel";

// -- Types die je al hebt in /types/chat.ts -----------------------------
// (We importeren niet om cirkels te vermijden; houd dit in sync met jouw types.)
type ChatMode = "PREVIEW" | "PREMIUM";
type ChapterKey =
  | "basis"
  | "budget"
  | "ruimtes"
  | "wensen"
  | "techniek"
  | "duurzaamheid"
  | "risico"
  | "preview";

type WizardState = {
  stateVersion: number;
  chapterAnswers?: Record<string, any>;
  triage?: Record<string, any>;
};

type ChatRequest = {
  query: string;
  wizardState: WizardState;
  mode: ChatMode;
  clientFastIntent?: {
    type: string;
    confidence: number;
    action?: string;
    chapter?: string;
    field?: string;
  };
};

type ChatSSEEventName =
  | "metadata"
  | "patch"
  | "navigate"
  | "stream"
  | "error"
  | "done";

// -- SSE helpers ---------------------------------------------------------
function write(
  writer: WritableStreamDefaultWriter,
  event: ChatSSEEventName,
  data: any
) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  return writer.write(`event: ${event}\n` + `data: ${payload}\n\n`);
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function essentialsMissing(ws: WizardState): { ok: boolean; missing: string[] } {
  const basis = ws?.chapterAnswers?.basis ?? {};
  const missing: string[] = [];
  if (!basis.projectNaam || String(basis.projectNaam).trim() === "") {
    missing.push("basis.projectNaam");
  }
  return { ok: missing.length === 0, missing };
}

// -- POST handler --------------------------------------------------------
export async function POST(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = (writable as unknown as WritableStream).getWriter();

  (async () => {
    const started = Date.now();
    try {
      const body = (await req.json()) as ChatRequest;
      const query = String(body?.query ?? "").trim();
      const mode = (body?.mode ?? "PREVIEW") as ChatMode;
      const wizardState = (body?.wizardState ?? { stateVersion: 1 }) as WizardState;

      // A) Essentials gate (context-bewuste nudge, echo query)
      const ess = essentialsMissing(wizardState);
      if (!ess.ok) {
        await write(writer, "metadata", {
          intent: "ASK_ESSENTIALS",
          policy: "ASK_CLARIFY",
          essentials: ess.missing,
        });
        await write(
          writer,
          "stream",
          `Ik wil **"${query}"** voor u verwerken, maar mis nog ${ess.missing.join(
            ", "
          )}. Mag ik eerst de **projectNaam** noteren? (Bijv.: \`projectnaam Villa Dijk\`).`
        );
        await write(writer, "done", { latencyMs: Date.now() - started });
        await writer.close();
        return;
      }

      // B) Classify → intent
      const cls = await ProModel.classify(query, wizardState);
      await write(writer, "metadata", {
        intent: cls.intent,
        confidence: cls.confidence,
        reason: cls.reason,
        policy: "CLASSIFIED",
      });

      // C) Policy branch
      if (cls.intent === "NAVIGATIE") {
        const key = query.toLowerCase().replace(/^ga naar\s+|^open\s+/i, "").trim();
        const map: Record<string, ChapterKey> = {
          basis: "basis",
          budget: "budget",
          ruimtes: "ruimtes",
          wensen: "wensen",
          techniek: "techniek",
          duurzaamheid: "duurzaamheid",
          risico: "risico",
          preview: "preview",
        };
        const ch = map[key];
        if (ch) {
          await write(writer, "navigate", { chapter: ch });
          await write(writer, "stream", { text: `Ik open **${ch}**. ` });
        } else {
          await write(writer, "stream", {
            text: "Welk hoofdstuk wilt u openen? (basis, budget, ruimtes…)",
          });
        }
        await write(writer, "done", { latencyMs: Date.now() - started });
        await writer.close();
        return;
      }

      if (cls.intent === "VULLEN_DATA") {
        const patch = await ProModel.generatePatch(query, wizardState);
        if (patch) {
          await write(writer, "metadata", {
            intent: "VULLEN_DATA",
            policy: "APPLY_OPTIMISTIC",
            source: "RULES",
          });
          await write(writer, "patch", patch);

          // Navigatiehint: navigeer naar eerste chapter van patch
          const chapter = patch.chapter as ChapterKey;
          if (chapter) {
            await write(writer, "navigate", { chapter });
          }
          await write(writer, "stream", { text: "Ik heb dit genoteerd in de wizard. " });
          await write(writer, "done", { latencyMs: Date.now() - started });
          await writer.close();
          return;
        }

        // Geen deterministische match → korte verduidelijking
        await write(writer, "metadata", {
          intent: "ASK_CLARIFY",
          policy: "ASK_CLARIFY",
        });
        await write(writer, "stream", {
          text:
            "Wat wilt u precies invullen (bijv. ‘woonkamer 30 m²’ of ‘bandbreedte 250k–300k’)? ",
        });
        await write(writer, "done", { latencyMs: Date.now() - started });
        await writer.close();
        return;
      }

      if (cls.intent === "ADVIES_VRAAG" || cls.intent === "SMALLTALK") {
        // (Optioneel) RAG context detectie; kan later gekoppeld worden
        const topicId = ProModel.detectTopic(query);
        const ragContext = null; // plug RAG here

        const text = await ProModel.generateResponse(query, ragContext, {
          mode,
          wizardState,
        } as any);

        // stream als één chunk (je kunt dit per woord/zin knippen als gewenst)
        await write(writer, "metadata", {
          intent: cls.intent,
          policy: ragContext ? "RAG" : "RESPOND",
        });
        await write(writer, "stream", { text });
        await write(writer, "done", { latencyMs: Date.now() - started });
        await writer.close();
        return;
      }

      // OUT_OF_SCOPE of onbekend → zachte fallback
      await write(writer, "metadata", {
        intent: cls.intent,
        policy: "RESPOND",
      });
      await write(
        writer,
        "stream",
        `Ik richt me hier op het (ver)bouw-PvE. Wilt u gegevens invullen of advies per ruimte/onderwerp?`
      );
      await write(writer, "done", { latencyMs: Date.now() - started });
      await writer.close();
    } catch (e: any) {
      await write(
        writer,
        "error",
        JSON.stringify({
          message: e?.message ?? "Onbekende fout",
        })
      );
      await writer.close();
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: sseHeaders(),
  });
}
