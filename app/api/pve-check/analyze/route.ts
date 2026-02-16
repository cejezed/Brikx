// app/api/pve-check/analyze/route.ts — Idempotent analyse pipeline
// Auth required. Node.js runtime. Idempotent on (documentId, intakeHash).
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { extractDocument } from "@/lib/pveCheck/extract";
import { classifyDocument } from "@/lib/pveCheck/classify";
import { computeScore } from "@/lib/pveCheck/score";
import { computeGaps } from "@/lib/pveCheck/gaps";
import { computeConflicts } from "@/lib/pveCheck/conflicts";
import { computePatchPlans } from "@/lib/pveCheck/patches";
import { computeBenchmark } from "@/lib/pveCheck/benchmark";
import { PVE_RUBRIC } from "@/lib/pveCheck/rubric";
import { computeMissingFields } from "@/lib/ai/missing";
import { scan as scanRisks } from "@/lib/risk/scan";
import { computeBudgetWarning } from "@/lib/report/heuristics";
import { queryKnowledgeForGaps, enrichGapsWithKnowledge, buildKnowledgeContext } from "@/lib/pveCheck/knowledge";
import type { PveCheckIntakeData, PveCheckMappedData, PveCheckResult } from "@/types/pveCheck";
import type { WizardState } from "@/types/project";

export const runtime = "nodejs";

// ============================================================================
// INTAKE SCHEMA (v5.1)
// ============================================================================

const analyzeSchema = z.object({
  documentId: z.string().uuid(),
  intake: z.object({
    archetype: z.string().min(1),
    projectType: z.enum([
      "nieuwbouw",
      "verbouwing",
      "bijgebouw",
      "hybride",
      "anders",
    ]),
    locatie: z.string().min(1),
    postcode4: z.string().length(4).optional(),
    budgetRange: z.enum([
      "< €100k",
      "€100k-€250k",
      "€250k-€500k",
      "€500k-€1M",
      "> €1M",
    ]),
    bouwjaar: z.string().optional(),
    duurzaamheidsAmbitie: z.enum([
      "basis",
      "normaal",
      "ambitieus",
      "zeer_ambitieus",
    ]),
  }),
});

// ============================================================================
// STABLE HASH (for idempotency)
// ============================================================================

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

function stableHash(input: unknown): string {
  const json = JSON.stringify(sortDeep(input));
  return createHash("sha256").update(json).digest("hex");
}

// ============================================================================
// RESULT BUILDER (DB row → PveCheckResult)
// ============================================================================

function dbRowToResult(row: Record<string, unknown>): PveCheckResult {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    intake: row.intake as PveCheckIntakeData,
    intakeHash: row.intake_hash as string,
    documentId: row.document_id as string,
    documentName: row.document_name as string,
    docStats: row.doc_stats as PveCheckResult["docStats"],
    nudgeSummary: (row.nudge_summary as string) ?? null,
    rubricVersion: row.rubric_version as string,
    overallScore: row.overall_score as number,
    chapterScores: row.chapter_scores as PveCheckResult["chapterScores"],
    gaps: row.gaps as PveCheckResult["gaps"],
    conflicts: row.conflicts as PveCheckResult["conflicts"],
    mapped: row.mapped_data as PveCheckMappedData,
    criticalGapCount: row.critical_gap_count as number,
    conflictCount: row.conflict_count as number,
    isPremium: (row.is_premium as boolean) ?? false,
    paymentIntentId: row.payment_intent_id as string | undefined,
    reviewStatus: (row.review_status as PveCheckResult["reviewStatus"]) ?? "none",
    reviewCheckedAt: row.review_checked_at as string | undefined,
    reviewNotes: row.review_notes as Record<string, unknown> | undefined,
  };
}

// ============================================================================
// DEV BYPASS — remove before production
// ============================================================================

const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";

async function getAuthUserId(): Promise<
  { userId: string } | { error: NextResponse }
> {
  if (process.env.NODE_ENV === "development") {
    return { userId: DEV_USER_ID };
  }
  const auth = await requireAuth();
  if ("error" in auth) return { error: auth.error };
  return { userId: auth.user.id };
}

// ============================================================================
// HANDLER
// ============================================================================

export async function POST(request: Request) {
  const auth = await getAuthUserId();
  if ("error" in auth) return auth.error;

  try {
    const payload = analyzeSchema.parse(await request.json());
    const userId = auth.userId;
    const intake = payload.intake as PveCheckIntakeData;
    const intakeHash = stableHash(intake);

    // ---- IDEMPOTENCY CHECK ----
    const existing = await supabaseAdmin
      .from("pve_check_results")
      .select("*")
      .eq("document_id", payload.documentId)
      .eq("intake_hash", intakeHash)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing.error) {
      return NextResponse.json(
        { error: existing.error.message },
        { status: 500 },
      );
    }
    if (existing.data) {
      return NextResponse.json({
        resultId: existing.data.id,
        idempotent: true,
        result: dbRowToResult(existing.data),
      });
    }

    // ---- FETCH DOCUMENT ----
    const document = await supabaseAdmin
      .from("pve_check_documents")
      .select(
        "id, user_id, storage_path, document_name, mime, size, text_hash, doc_stats",
      )
      .eq("id", payload.documentId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (document.error || !document.data) {
      return NextResponse.json(
        { error: "Document niet gevonden" },
        { status: 404 },
      );
    }

    // ---- DOWNLOAD & EXTRACT ----
    const download = await supabaseAdmin.storage
      .from("pve-check-docs")
      .download(document.data.storage_path);

    if (download.error || !download.data) {
      return NextResponse.json(
        {
          error: `Document download mislukt: ${download.error?.message ?? "unknown"}`,
        },
        { status: 500 },
      );
    }

    const blob = download.data;
    const file = new File(
      [await blob.arrayBuffer()],
      document.data.document_name,
      { type: document.data.mime },
    );

    const extracted = await extractDocument(file);

    // ---- CLASSIFY (LLM + nudge + evidence) ----
    const classify = await classifyDocument({
      text: extracted.text,
      pages: extracted.pages,
      rubric: PVE_RUBRIC,
      intake,
    });

    // ---- GAPS (3 layers) ----
    const gaps = computeGaps({
      rubric: PVE_RUBRIC,
      classify,
      intake,
    });

    // ---- SCORE (needs gaps for chapter counts) ----
    const score = computeScore({
      rubric: PVE_RUBRIC,
      classify,
      gaps,
    });

    // ---- KENNISBANK ENRICHMENT (per chapter, parallel) ----
    let knowledgeMap: Awaited<ReturnType<typeof queryKnowledgeForGaps>> = new Map();
    try {
      knowledgeMap = await queryKnowledgeForGaps(gaps, intake);
      enrichGapsWithKnowledge(gaps, knowledgeMap);
    } catch { /* Kennisbank unavailable — continue without enrichment */ }

    // ---- CONFLICTS (6 headline, reuses existing code) ----
    const conflicts = computeConflicts({ classify, intake });

    // ---- PATCHES (LLM + CHAPTER_SCHEMAS validation + Kennisbank context) ----
    const patches = await computePatchPlans(gaps, extracted.text, knowledgeMap);

    // ---- BENCHMARK ----
    const roomCount = Array.isArray(
      (classify.mappedData.ruimtes as Record<string, unknown>)?.rooms,
    )
      ? (
          (classify.mappedData.ruimtes as Record<string, unknown>)
            .rooms as unknown[]
        ).length
      : 0;

    const benchmark = computeBenchmark({
      projectType: intake.projectType,
      budget: null, // Budget is range, not exact
      wordCount: extracted.wordCount,
      roomCount,
    });

    // ---- DERIVED DATA (computeMissingFields, scanRisks, budgetWarning) ----
    const wizardState: WizardState = {
      stateVersion: 1,
      chapterAnswers: classify.mappedData,
      chapterFlow: [],
      mode: "PREVIEW",
    } as WizardState;

    let missing: ReturnType<typeof computeMissingFields> = [];
    try { missing = computeMissingFields(wizardState); } catch { /* LLM data shape mismatch */ }
    let risks: ReturnType<typeof scanRisks> = [];
    try { risks = scanRisks(wizardState); } catch { /* LLM data shape mismatch */ }
    let budgetWarning: string | null = null;
    try { budgetWarning = computeBudgetWarning(classify.mappedData); } catch { /* LLM data shape mismatch */ }

    const mappedData: PveCheckMappedData = {
      mappedChapterData: classify.mappedData,
      patchEvents: patches
        .filter((p) => p.patchEvent)
        .map((p) => p.patchEvent!),
      derived: {
        missing,
        risks,
        warnings: budgetWarning ? [budgetWarning] : [],
      },
    };

    // ---- DB INSERT ----
    const docStats = {
      pageCount: extracted.pageCount,
      wordCount: extracted.wordCount,
      textHash: extracted.textHash,
    };

    const insert = await supabaseAdmin
      .from("pve_check_results")
      .insert({
        user_id: userId,
        document_id: payload.documentId,
        intake,
        intake_hash: intakeHash,
        document_name: document.data.document_name,
        doc_stats: docStats,
        text_hash: extracted.textHash,
        nudge_summary: classify.nudgeSummary,
        rubric_version: PVE_RUBRIC.version,
        overall_score: score.overallScore,
        chapter_scores: score.chapterScores,
        gaps,
        conflicts,
        mapped_data: mappedData,
        critical_gap_count: gaps.filter((g) => g.severity === "critical")
          .length,
        conflict_count: conflicts.length,
      })
      .select("*")
      .single();

    if (insert.error || !insert.data) {
      return NextResponse.json(
        {
          error: `Result insert mislukt: ${insert.error?.message ?? "unknown"}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      resultId: insert.data.id,
      idempotent: false,
      result: dbRowToResult(insert.data),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige payload", details: error.issues },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Onverwachte fout bij analyse";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
