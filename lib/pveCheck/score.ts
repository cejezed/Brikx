// lib/pveCheck/score.ts — Deterministic scoring engine
// Severity weighting: critical=3pt, important=2pt, nice_to_have=1pt
// Status: present=1.0, vague=0.5, absent=0
import type { ChapterKey } from "@/types/project";
import type {
  ChapterScore,
  PveClassifyResult,
  PveGap,
  PveRubric,
  PveScoreResult,
} from "@/types/pveCheck";

// Chapter labels for display
const CHAPTER_LABELS: Record<ChapterKey, string> = {
  basis: "Projectbasis",
  ruimtes: "Ruimteprogramma",
  wensen: "Wensen & Prioriteiten",
  budget: "Budget",
  techniek: "Techniek & Installaties",
  duurzaam: "Duurzaamheid",
  risico: "Risico & Planning",
};

// Severity multiplier
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 3,
  important: 2,
  nice_to_have: 1,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeScore(params: {
  rubric: PveRubric;
  classify: PveClassifyResult;
  gaps: PveGap[];
}): PveScoreResult {
  const chapterTotals = new Map<
    ChapterKey,
    { score: number; max: number; gapCount: number; criticalGapCount: number }
  >();

  for (const item of params.rubric.items) {
    const entry = chapterTotals.get(item.chapter) ?? {
      score: 0,
      max: 0,
      gapCount: 0,
      criticalGapCount: 0,
    };

    const severityMultiplier = SEVERITY_WEIGHT[item.severity] ?? 1;
    const effectiveWeight = item.weight * severityMultiplier;
    entry.max += effectiveWeight;

    const field = params.classify.fields.find((f) => f.fieldId === item.id);
    if (field) {
      // present=1.0, vague=0.5
      const statusFactor = field.vague ? 0.5 : 1.0;
      entry.score += effectiveWeight * statusFactor;
    }
    // absent=0 → no score added

    chapterTotals.set(item.chapter, entry);
  }

  // Count gaps per chapter
  for (const gap of params.gaps) {
    const entry = chapterTotals.get(gap.chapter);
    if (entry) {
      entry.gapCount++;
      if (gap.severity === "critical") {
        entry.criticalGapCount++;
      }
    }
  }

  const chapterScores: ChapterScore[] = Array.from(
    chapterTotals.entries(),
  ).map(([chapter, values]) => ({
    chapter,
    label: CHAPTER_LABELS[chapter] ?? chapter,
    score: clamp((values.score / Math.max(1, values.max)) * 100),
    gapCount: values.gapCount,
    criticalGapCount: values.criticalGapCount,
  }));

  const totalMax = Array.from(chapterTotals.values()).reduce(
    (acc, row) => acc + row.max,
    0,
  );
  const totalScore = Array.from(chapterTotals.values()).reduce(
    (acc, row) => acc + row.score,
    0,
  );

  return {
    overallScore: clamp((totalScore / Math.max(1, totalMax)) * 100),
    chapterScores,
  };
}
