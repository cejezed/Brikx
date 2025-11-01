// =====================================================
// API Route: /app/api/feedback/analytics/route.ts
// =====================================================
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tryCreateServerSupabase } from "@/lib/supabase/server";

// Dwing Node runtime + dynamisch af om build-time evaluatie te vermijden
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- Types & Validatie ----------
const ValidEvent = z.union([
  z.literal("modal_opened"),
  z.literal("question_answered"),
  z.literal("form_completed"),
  z.literal("form_abandoned"),
]);

const PostBodySchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  eventType: ValidEvent,
  questionNumber: z.number().int().min(0).optional(),
metadata: z.record(z.string(), z.unknown()).optional().default({}),
  userId: z.string().optional().nullable(),
});

type AnalyticsRow = {
  id: string;
  project_id: string | null;
  user_id: string | null;
  event_type: z.infer<typeof ValidEvent>;
  question_number: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string; // ISO
};

// ---------- Helpers ----------
type FunnelMetrics = {
  modalOpened: number;
  startedFilling: number;
  reachedQuestion2: number;
  reachedQuestion3: number;
  reachedQuestion4: number;
  completed: number;
  abandoned: number;
  conversionRates: {
    startRate: string;      // percentage als string met 1 decimaal
    completionRate: string; // idem
    abandonRate: string;    // idem
  };
};

function calculateFunnelMetrics(events: AnalyticsRow[]): FunnelMetrics {
  const metrics = {
    modalOpened: 0,
    startedFilling: 0,
    reachedQuestion2: 0,
    reachedQuestion3: 0,
    reachedQuestion4: 0,
    completed: 0,
    abandoned: 0,
  };

  for (const event of events) {
    switch (event.event_type) {
      case "modal_opened":
        metrics.modalOpened++;
        break;
      case "question_answered": {
        const q = event.question_number ?? 0;
        if (q >= 1) metrics.startedFilling++;
        if (q >= 2) metrics.reachedQuestion2++;
        if (q >= 3) metrics.reachedQuestion3++;
        if (q >= 4) metrics.reachedQuestion4++;
        break;
      }
      case "form_completed":
        metrics.completed++;
        break;
      case "form_abandoned":
        metrics.abandoned++;
        break;
    }
  }

  const pct = (n: number, d: number) =>
    d > 0 ? ((n / d) * 100).toFixed(1) : "0";

  return {
    ...metrics,
    conversionRates: {
      startRate: pct(metrics.startedFilling, metrics.modalOpened),
      completionRate: pct(metrics.completed, metrics.startedFilling),
      abandonRate: pct(metrics.abandoned, metrics.modalOpened),
    },
  };
}

// =====================================================
// POST: track event
// =====================================================
export async function POST(request: NextRequest) {
  const supabase = tryCreateServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase niet geconfigureerd (env mist)" },
      { status: 503 }
    );
  }

  try {
    const json = await request.json();
    const parsed = PostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { projectId, eventType, questionNumber, metadata, userId } =
      parsed.data;

    const { error } = await supabase
      .from("feedback_analytics")
      .insert({
        project_id: projectId ?? null,
        user_id: userId ?? null,
        event_type: eventType,
        question_number: questionNumber ?? null,
        metadata: metadata ?? {},
      });

    if (error) {
      console.error("[analytics:insert] error", error);
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[analytics:post] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =====================================================
// GET: query events + funnel
// =====================================================
export async function GET(request: NextRequest) {
  const supabase = tryCreateServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase niet geconfigureerd (env mist)" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limitRaw = searchParams.get("limit") ?? "100";

    const limit = (() => {
      const n = Number.parseInt(limitRaw, 10);
      if (Number.isNaN(n) || n <= 0) return 100;
      return Math.min(n, 1000); // guardrail
    })();

    let query = supabase
      .from("feedback_analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (projectId) query = query.eq("project_id", projectId);
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    const { data, error } = await query;

    if (error) {
      console.error("[analytics:get] fetch error", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    const events = (data ?? []) as AnalyticsRow[];
    const funnel = calculateFunnelMetrics(events);

    return NextResponse.json({
      events,
      funnel,
      total: events.length,
    });
  } catch (err) {
    console.error("[analytics:get] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
