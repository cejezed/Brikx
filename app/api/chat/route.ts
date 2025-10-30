import { NextRequest, NextResponse } from "next/server";
import {
  ConfidencePolicy,
  type ChatRequest,
  type ChatResponse,
  type PatchEnvelope,
} from "@/types/chat";
import { makeNudge } from "@/lib/chat/prompts";
import { detectFastIntent } from "@/lib/chat/detectFastIntent";

export const runtime = "nodejs";

function essentialsCheck(wizardState: ChatRequest["wizardState"], intent: string) {
  const missing: string[] = [];
  const size = wizardState?.triage?.project_size ?? null;
  const projectNaam = wizardState?.chapterAnswers?.basis?.projectNaam;
  if (intent === "VULLEN_DATA" && !projectNaam) missing.push("basis.projectNaam");
  const budgetClass = wizardState?.chapterAnswers?.budget?.klasse;
  if (!budgetClass) missing.push("budget.klasse");
  const planning = wizardState?.chapterAnswers?.basis?.planningStart;
  if (!planning) missing.push("basis.planningStart");
  if (size === "klein") {
    // skip deep-tech fields for small projects (bewust niets doen)
  }
  return missing;
}

function mockClassify(query: string): {
  intent: ChatResponse["intent"];
  confidence: number;
} {
  const q = query.toLowerCase();
  if (/ga\s+naar|open\s+|switch\s+to/.test(q))
    return { intent: "NAVIGATIE", confidence: 0.97 };
  if (/(slaapk?amers?|kamers?)/.test(q))
    return { intent: "VULLEN_DATA", confidence: 0.82 };
  if (/(kosten|prijs|vergunning|beng|rc-waarde|isolatie|fundering)/.test(q))
    return { intent: "ADVIES_VRAAG", confidence: 0.78 };
  if (/(hallo|hoi|dag|goedemorgen|goedenavond)/.test(q))
    return { intent: "SMALLTALK", confidence: 0.9 };
  return { intent: "ADVIES_VRAAG", confidence: 0.45 };
}

function buildPatchForFastIntent(
  fast: ReturnType<typeof detectFastIntent>
): PatchEnvelope | null {
  if (!fast) return null;
  switch (fast.type) {
    case "NAVIGATE":
      return {
        chapter: "meta",
        delta: {
          kind: "object:merge",
          path: "ui",
          value: { currentChapter: fast.payload.chapter },
        },
      };
    case "SET_BUDGET_DELTA":
      return {
        chapter: "budget",
        delta: { kind: "number:add", path: "amount", value: fast.payload.value },
      };
    case "SET_ROOMS":
      return {
        chapter: "ruimtes",
        delta: {
          kind: "object:merge",
          path: "counts",
          value: { slaapkamers: fast.payload.rooms },
        },
      };
    case "SET_PROJECT_NAME":
      return {
        chapter: "basis",
        delta: {
          kind: "object:merge",
          path: "projectNaam",
          value: fast.payload.name,
        } as any,
      };
    case "FOCUS_FIELD":
      return {
        chapter: "meta",
        delta: {
          kind: "object:merge",
          path: "ui",
          value: { focusField: fast.payload.field },
        },
      };
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const logId = crypto.randomUUID();

  try {
    const body = (await req.json()) as ChatRequest;
    const { query, wizardState, mode } = body;

    // 1) Server-side fast-intent (optioneel aanvullend op client)
    const fast = detectFastIntent(query) || null;

    // 2) Classify (mock in Week 1)
    const { intent, confidence } = mockClassify(query);

    // 3) Policy map
    const policy = ConfidencePolicy.for(confidence);

    // 4) Context-bewuste nudge (⚠️ geef query mee!)
    const missing = essentialsCheck(wizardState, intent);
    const nudge = missing.length ? makeNudge(missing, query) : null;

    // 5) Patch bepalen (alleen bij policies die het toelaten)
    let patch: PatchEnvelope | null = null;
    if (fast && (policy === "APPLY_OPTIMISTIC" || policy === "APPLY_WITH_INLINE_VERIFY")) {
      patch = buildPatchForFastIntent(fast);
    }

    // 6) Tekstuele respons (mock)
    const responseText =
      intent === "NAVIGATIE"
        ? "Prima. Ik open het gewenste onderdeel."
        : intent === "VULLEN_DATA"
        ? `Helder, ik verwerk “${query}” voor u.`
        : intent === "ADVIES_VRAAG"
        ? mode === "PREMIUM"
          ? "Richtwaarden en context volgen."
          : "In de preview geef ik geen bedragen; zal ik u kort op weg helpen?"
        : intent === "SMALLTALK"
        ? "Dag! Waar zal ik u mee helpen binnen uw project?"
        : "Ik help u graag binnen de wizard. Kunt u dit toelichten?";

    const res: ChatResponse = {
      intent,
      confidence,
      policy,
      patch: patch ?? null,
      response: responseText,
      nudge,
      rag: { activated: false },
      metadata: {
        latencyMs: { total: Date.now() - t0 },
        logId,
      },
    };

    return NextResponse.json(res);
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      {
        intent: "OUT_OF_SCOPE",
        confidence: 0,
        policy: "CLASSIFY",
        patch: null,
        response: `Er ging iets mis: ${err.message}`,
        nudge: null,
        rag: { activated: false },
        metadata: { latencyMs: { total: Date.now() - t0 }, logId },
      } satisfies ChatResponse,
      { status: 200 }
    );
  }
}
