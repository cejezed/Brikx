import type {
  ChapterScore,
  HeadlineConflict,
  PveCheckIntakeData,
  PveChunkActionItem,
  PveChunkSummary,
  PveGap,
} from "@/types/pveCheck";

const SEVERITY_WEIGHT: Record<PveGap["severity"], number> = {
  critical: 100,
  important: 65,
  nice_to_have: 30,
};

const EFFORT_BONUS: Record<PveGap["fixEffort"], number> = {
  XS: 22,
  S: 12,
  M: 4,
};

const FOLLOW_UP_TEMPLATES: Record<string, string> = {
  "budget.budgetTotaal":
    "Wat is je budgetrange en zit daar al een risicobuffer in?",
  "techniek.verwarming":
    "Welke verwarmingskeuze wil je definitief vastleggen (all-electric, hybride of anders)?",
  "techniek.ventilatie":
    "Welk ventilatieconcept kies je (natuurlijk, mechanisch of balans-WTW)?",
  "basis.bouwjaar":
    "Wat is het bouwjaar van de bestaande woning?",
  "duurzaam.energieLabel":
    "Welk concreet energiedoel wil je opnemen (bijv. label A+, A++ of BENG-doel)?",
  "risico.vergunning":
    "Wat is de actuele vergunningsstatus en wanneer wordt die getoetst?",
  "risico.planning":
    "Wat zijn je gewenste start- en oplevermomenten?",
};

function computeImpactScore(
  gap: PveGap,
  chapterScoreMap: Map<string, number>,
  conflictFieldIds: Set<string>,
): number {
  const severity = SEVERITY_WEIGHT[gap.severity];
  const chapterScore = chapterScoreMap.get(gap.chapter) ?? 50;
  const chapterPenalty = Math.max(0, 100 - chapterScore);
  const effortBonus = EFFORT_BONUS[gap.fixEffort];
  const conflictBonus = conflictFieldIds.has(gap.fieldId) ? 12 : 0;
  const vagueBonus = gap.isVagueness ? 6 : 0;
  return severity + chapterPenalty + effortBonus + conflictBonus + vagueBonus;
}

function compactText(input: string | undefined, maxLength: number): string {
  if (!input) return "";
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1)}...`;
}

function buildSuggestedNextStep(gap: PveGap): string {
  if (gap.knowledgeHint) {
    return compactText(gap.knowledgeHint, 160);
  }
  if (gap.suggestedImprovement) {
    return compactText(gap.suggestedImprovement, 160);
  }
  return `Werk "${gap.label}" uit met concrete waarden, keuzes en randvoorwaarden.`;
}

function buildFollowUpQuestions(topActions: PveChunkActionItem[]): string[] {
  const questions = topActions.map((action) => {
    const template = FOLLOW_UP_TEMPLATES[action.fieldId];
    if (template) return template;
    return `Kun je "${action.label}" concreter maken in 1-2 zinnen?`;
  });
  return Array.from(new Set(questions)).slice(0, 3);
}

export function computeChunkSummary(params: {
  gaps: PveGap[];
  conflicts: HeadlineConflict[];
  chapterScores: ChapterScore[];
  overallScore: number;
  intake: PveCheckIntakeData;
}): PveChunkSummary {
  const chapterScoreMap = new Map(
    params.chapterScores.map((score) => [score.chapter, score.score]),
  );
  const conflictFieldIds = new Set(
    params.conflicts.flatMap((conflict) => conflict.relatedFieldIds),
  );

  // Keep only the highest-impact gap per field to avoid duplicate actions.
  const bestPerField = new Map<string, { gap: PveGap; impactScore: number }>();
  for (const gap of params.gaps) {
    const impactScore = computeImpactScore(gap, chapterScoreMap, conflictFieldIds);
    const current = bestPerField.get(gap.fieldId);
    if (!current || impactScore > current.impactScore) {
      bestPerField.set(gap.fieldId, { gap, impactScore });
    }
  }

  const top5Actions: PveChunkActionItem[] = Array.from(bestPerField.values())
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5)
    .map(({ gap, impactScore }) => ({
      chapter: gap.chapter,
      fieldId: gap.fieldId,
      label: gap.label,
      severity: gap.severity,
      fixEffort: gap.fixEffort,
      impactScore,
      whyNow: compactText(gap.reason, 160),
      suggestedNextStep: buildSuggestedNextStep(gap),
    }));

  const weakestChapter = [...params.chapterScores].sort(
    (a, b) => a.score - b.score,
  )[0]?.chapter ?? null;

  const criticalCount = params.gaps.filter(
    (gap) => gap.severity === "critical",
  ).length;

  const topChapters = Array.from(new Set(top5Actions.map((item) => item.chapter)))
    .slice(0, 2)
    .join(" en ");

  const oneLineSummary = topChapters
    ? `Je PvE scoort ${params.overallScore}/100 met ${criticalCount} kritieke gaps. Focus eerst op ${topChapters}.`
    : `Je PvE scoort ${params.overallScore}/100 met ${criticalCount} kritieke gaps.`;

  return {
    totalGapCount: params.gaps.length,
    criticalCount,
    weakestChapter,
    top5Actions,
    followUpQuestions: buildFollowUpQuestions(top5Actions),
    oneLineSummary,
  };
}
