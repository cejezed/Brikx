// /app/api/expert/route.ts
// ✅ v3.8: Echte Expert endpoint - combineert statische tips, TECHNIEK_TIPS en RAG

import { NextResponse } from "next/server";
import { serverLog } from "@/lib/server/log";
import { getExpertTips, searchExpertTips } from "@/lib/expert/getExpertTips";
import { Kennisbank } from "@/lib/rag/Kennisbank";
import { deriveLifestyleProfile, deriveScopeProfile } from "@/lib/domain/lifestyle";
import type { ChapterKey, BasisData } from "@/types/project";
import type { TipItem } from "@/components/expert/rules";

export const runtime = "nodejs";

// ============================================================================
// Types
// ============================================================================

interface ExpertRequest {
  query?: string;
  focusKey?: string;
  chapter?: ChapterKey;
  basisData?: Partial<BasisData>;
}

interface ExpertTip {
  id: string;
  text: string;
  severity?: "info" | "warning" | "danger";
  source: "static" | "techniek" | "rag" | "lifestyle";
}

interface ExpertResponse {
  tips: ExpertTip[];
  ragDocs: { text: string; source?: string }[];
  lifestyleHints: string[];
  meta: {
    focusKey: string | null;
    chapter: string | null;
    query: string | null;
    totalTips: number;
  };
}

// ============================================================================
// Lifestyle-based hints generator
// ============================================================================

function generateLifestyleHints(basisData?: Partial<BasisData>): string[] {
  if (!basisData) return [];

  const lifestyle = deriveLifestyleProfile(basisData);
  const scopeProfile = deriveScopeProfile(basisData.projectScope);
  const hints: string[] = [];

  // Alleen hints voor hoofdwoningen
  if (!scopeProfile.isMainResidence) {
    if (scopeProfile.isAuxiliaryBuilding) {
      hints.push("Bij bijgebouwen: focus op opslag, ventilatie en vocht.");
    }
    return hints;
  }

  // Kinderen hints
  if (scopeProfile.relevanceChildren && lifestyle.family !== "geen_kinderen") {
    switch (lifestyle.family) {
      case "jonge_kinderen":
        hints.push("Met jonge kinderen: overweeg zichtlijnen vanuit keuken naar speelhoek.");
        break;
      case "basisschool_kinderen":
        hints.push("Met schoolgaande kinderen: denk aan huiswerkplek en opbergruimte voor schoolspullen.");
        break;
      case "pubers":
        hints.push("Met pubers: privacy en geluidsisolatie tussen kamers is extra relevant.");
        break;
      case "mix_kinderen":
        hints.push("Met kinderen van verschillende leeftijden: flexibele indeling helpt.");
        break;
    }
  }

  // Thuiswerk hints
  if (lifestyle.work !== "niet") {
    hints.push("Bij thuiswerken: overweeg aparte werkruimte met goede akoestiek en daglicht.");
  }

  // Koken hints
  if (lifestyle.cooking !== "basis") {
    hints.push("Als fanatieke kok: ruime werkbladen en goede afzuiging zijn essentieel.");
  }

  // Huisdieren hints
  if (lifestyle.pets !== "geen") {
    hints.push("Met huisdieren: overweeg makkelijk te reinigen vloeren en routing naar tuin.");
  }

  // Gasten hints
  if (lifestyle.hosting === "grote_groepen") {
    hints.push("Bij regelmatig grote groepen ontvangen: flexibele woon-/eetruimte is waardevol.");
  }

  // Geluid hints
  if (lifestyle.noise === "gevoelig") {
    hints.push("Bij geluidsgevoeligheid: extra aandacht voor akoestiek tussen ruimtes.");
  }

  // Mobiliteit hints
  if (lifestyle.mobility !== "fit") {
    hints.push("Met mobiliteitsbeperkingen: denk aan drempels, gangbreedtes en toekomstbestendigheid.");
  }

  return hints.slice(0, 3); // Max 3 hints
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(req: Request) {
  try {
    const body: ExpertRequest = await req.json().catch(() => ({}));
    const { query, focusKey, chapter, basisData } = body;

    const response: ExpertResponse = {
      tips: [],
      ragDocs: [],
      lifestyleHints: [],
      meta: {
        focusKey: focusKey ?? null,
        chapter: chapter ?? null,
        query: query ?? null,
        totalTips: 0,
      },
    };

    // 1. Focus-based tips (statisch + TECHNIEK_TIPS)
    if (focusKey) {
      const { allTips } = getExpertTips(focusKey);
      response.tips.push(
        ...allTips.map((tip: TipItem) => ({
          id: tip.id,
          text: tip.text,
          severity: tip.severity,
          source: tip.id.startsWith("tech_") ? "techniek" as const : "static" as const,
        }))
      );
    }

    // 2. Query-based search (als er een query is)
    if (query && query.trim().length > 2) {
      const searchResults = searchExpertTips(query, chapter);

      // Voeg toe, maar voorkom duplicaten
      const existingIds = new Set(response.tips.map((t) => t.id));
      for (const tip of searchResults) {
        if (!existingIds.has(tip.id)) {
          response.tips.push({
            id: tip.id,
            text: tip.text,
            severity: tip.severity,
            source: tip.id.startsWith("tech_") ? "techniek" : "static",
          });
          existingIds.add(tip.id);
        }
      }

      // 3. RAG query voor extra context
      try {
        const ragResult = await Kennisbank.query(query, {
          chapter: chapter,
          limit: 3,
        });

        if (ragResult.docs.length > 0) {
          response.ragDocs = ragResult.docs.map((doc) => ({
            text: doc.text,
            source: doc.source,
          }));
        }
      } catch (ragError) {
        console.error("[/api/expert] RAG query failed:", ragError);
        // Continue without RAG results
      }
    }

    // 4. Lifestyle-based hints
    if (basisData) {
      response.lifestyleHints = generateLifestyleHints(basisData);
    }

    // 5. Update meta
    response.meta.totalTips =
      response.tips.length + response.ragDocs.length + response.lifestyleHints.length;

    await serverLog("expert.response", {
      ok: true,
      focusKey,
      query: query?.slice(0, 50),
      tipsCount: response.tips.length,
      ragCount: response.ragDocs.length,
      lifestyleCount: response.lifestyleHints.length,
    });

    return NextResponse.json(response);
  } catch (e: unknown) {
    console.error("[/api/expert] Error:", e);
    await serverLog("expert.response", { ok: false, error: String(e) });

    // Return empty response on error (graceful degradation)
    return NextResponse.json(
      {
        tips: [],
        ragDocs: [],
        lifestyleHints: [],
        meta: {
          focusKey: null,
          chapter: null,
          query: null,
          totalTips: 0,
        },
      },
      { status: 200 }
    );
  }
}

// ============================================================================
// GET Handler (for health check)
// ============================================================================

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "3.8",
    description: "Expert tips endpoint - combines static rules, TECHNIEK_TIPS, RAG and lifestyle hints",
  });
}
