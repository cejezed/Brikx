"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";
import { useWizardState } from "@/lib/stores/useWizardState";
import { PVE_RUBRIC } from "@/lib/pveCheck/rubric";
import { filterUnansweredQuickFillQuestions } from "@/lib/pveCheck/intakeAnswers";
import type {
  PveGap,
  HeadlineConflict,
  ChapterScore,
  ReviewStatus,
  PveBenchmarkDelta,
  PveClassifiedField,
  PveChunkSummary,
} from "@/types/pveCheck";
import type { PatchEvent, ChapterKey } from "@/types/project";

const IS_DEV = process.env.NODE_ENV === "development";

// ---- Score bands (A1) ----
type ScoreBand = {
  label: string;
  description: string;
  expectedAfterPremium: string;
};

function getScoreBand(score: number): ScoreBand {
  if (score <= 40) {
    return {
      label: "Schets-fase",
      description: "Onvoldoende voor een offerteaanvraag.",
      expectedAfterPremium: "65-80",
    };
  }
  if (score <= 60) {
    return {
      label: "Concept-fase",
      description: "Bruikbaar als gespreksbasis, maar mist concrete eisen.",
      expectedAfterPremium: "72-85",
    };
  }
  if (score <= 80) {
    return {
      label: "Werkconcept",
      description: "Klaar voor een architect-gesprek.",
      expectedAfterPremium: "82-92",
    };
  }
  return {
    label: "Uitgewerkt PvE",
    description: "Gereed voor offerteaanvraag.",
    expectedAfterPremium: "90-100",
  };
}

type QuickFillInputType = "text" | "select";

type QuickFillQuestion = {
  fieldId: string;
  label: string;
  prompt: string;
  placeholder?: string;
  inputType: QuickFillInputType;
  options?: Array<{ label: string; value: string }>;
  impact: number;
};

const QUICK_FILL_BUDGET_OPTIONS: Array<{
  label: string;
  value: string;
}> = [
  { label: "< EUR 100.000", value: "<100k" },
  { label: "EUR 100.000 - EUR 250.000", value: "100k-250k" },
  { label: "EUR 250.000 - EUR 500.000", value: "250k-500k" },
  { label: "EUR 500.000 - EUR 1.000.000", value: "500k-1M" },
  { label: "> EUR 1.000.000", value: ">1M" },
];

const QUICK_FILL_PRESETS: Record<
  string,
  Omit<QuickFillQuestion, "fieldId" | "label" | "impact">
> = {
  "budget.budgetTotaal": {
    prompt: "Wat is je actuele budgetrange?",
    inputType: "select",
    options: QUICK_FILL_BUDGET_OPTIONS,
  },
  "basis.bouwjaar": {
    prompt: "Wat is het bouwjaar van de bestaande woning?",
    inputType: "text",
    placeholder: "Bijv. 1932",
  },
  "techniek.verwarming": {
    prompt: "Welke verwarmingskeuze wil je hanteren?",
    inputType: "select",
    options: [
      {
        label: "All-electric warmtepomp",
        value: "All-electric warmtepomp met LT-afgifte.",
      },
      {
        label: "Hybride warmtepomp",
        value: "Hybride warmtepomp met pieklast op cv-ketel.",
      },
      {
        label: "Cv-ketel (tijdelijk)",
        value: "Cv-ketel als tijdelijke fase-oplossing.",
      },
    ],
  },
  "duurzaam.energieLabel": {
    prompt: "Welk energiedoel wil je vastleggen?",
    inputType: "select",
    options: [
      { label: "Label A", value: "Doelstelling: minimaal energielabel A." },
      { label: "Label A+", value: "Doelstelling: minimaal energielabel A+." },
      {
        label: "Label A++",
        value: "Doelstelling: minimaal energielabel A++.",
      },
      {
        label: "BENG-doel",
        value: "Doelstelling: voldoen aan BENG-eisen met gasloze exploitatie.",
      },
    ],
  },
  "risico.vergunning": {
    prompt: "Wat is de vergunningsstatus?",
    inputType: "select",
    options: [
      {
        label: "Nog niet getoetst",
        value: "Vergunningsstatus: nog niet getoetst, toetsing volgt in VO-fase.",
      },
      {
        label: "Vergunning vereist",
        value: "Vergunningsstatus: omgevingsvergunning vereist, aanvraag gepland.",
      },
      {
        label: "Waarschijnlijk vergunningvrij",
        value:
          "Vergunningsstatus: waarschijnlijk vergunningvrij, formele toets volgt.",
      },
    ],
  },
};

function computeGapImpact(
  gap: PveGap,
  chapterScoreMap: Map<string, number>,
): number {
  const severityWeight: Record<PveGap["severity"], number> = {
    critical: 100,
    important: 65,
    nice_to_have: 30,
  };
  const effortBonus: Record<PveGap["fixEffort"], number> = {
    XS: 22,
    S: 12,
    M: 4,
  };
  const chapterScore = chapterScoreMap.get(gap.chapter) ?? 50;
  const chapterPenalty = Math.max(0, 100 - chapterScore);
  return (
    severityWeight[gap.severity] + effortBonus[gap.fixEffort] + chapterPenalty
  );
}

function buildQuickFillQuestions(
  gaps: PveGap[],
  chapterScores: ChapterScore[],
): QuickFillQuestion[] {
  const chapterScoreMap = new Map(
    chapterScores.map((score) => [score.chapter, score.score]),
  );
  const bestByField = new Map<string, { gap: PveGap; impact: number }>();

  for (const gap of gaps) {
    if (gap.isConflict) continue;
    if (gap.severity === "nice_to_have") continue;

    const impact = computeGapImpact(gap, chapterScoreMap);
    const current = bestByField.get(gap.fieldId);
    if (!current || impact > current.impact) {
      bestByField.set(gap.fieldId, { gap, impact });
    }
  }

  return Array.from(bestByField.values())
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map(({ gap, impact }) => {
      const preset = QUICK_FILL_PRESETS[gap.fieldId];
      return {
        fieldId: gap.fieldId,
        label: gap.label,
        prompt: preset?.prompt ?? `Maak dit onderdeel concreet: ${gap.label}`,
        placeholder: preset?.placeholder ?? "Geef een concreet antwoord in 1 zin",
        inputType: preset?.inputType ?? "text",
        options: preset?.options,
        impact,
      };
    });
}

function extractPendingQuestions(
  reviewNotes: Record<string, unknown> | undefined,
  chunkSummary: PveChunkSummary | undefined,
): string[] {
  const fromReviewNotes =
    (Array.isArray(reviewNotes?.pending_questions)
      ? reviewNotes?.pending_questions
      : Array.isArray(reviewNotes?.pendingQuestions)
        ? reviewNotes?.pendingQuestions
        : []) ?? [];

  const cleanFromReviewNotes = fromReviewNotes
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (cleanFromReviewNotes.length > 0) {
    return cleanFromReviewNotes.slice(0, 3);
  }

  const fromSummary = chunkSummary?.followUpQuestions ?? [];
  return fromSummary
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 3);
}

export function ResultsPage() {
  const { result, reset, setIntake, analyze, isAnalyzing } = usePveCheckStore();
  const applyPatch = useWizardState((s) => s.applyPatch);
  const router = useRouter();

  // DEV: local override for premium simulation
  const [devIsPremium, setDevIsPremium] = useState(false);
  const [devReviewStatus, setDevReviewStatus] = useState<ReviewStatus>("none");
  const [convertDone, setConvertDone] = useState(false);
  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});
  const currentResult = result;

  useEffect(() => {
    if (!result) {
      setQuickAnswers({});
      return;
    }
    setQuickAnswers(result.intake.quickAnswers ?? {});
  }, [result]);

  if (!currentResult) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Geen resultaat beschikbaar.</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm"
        >
          Opnieuw beginnen
        </button>
      </div>
    );
  }

  const isPremium = IS_DEV ? devIsPremium : currentResult.isPremium;
  const reviewStatus = IS_DEV ? devReviewStatus : currentResult.reviewStatus;
  const isApproved = isPremium && reviewStatus === "approved";
  const isPending = isPremium && reviewStatus === "pending";
  const needsAdjustment = isPremium && reviewStatus === "needs_adjustment";

  const criticalGaps = currentResult.gaps.filter((g) => g.severity === "critical");
  const importantGaps = currentResult.gaps.filter((g) => g.severity === "important");
  const niceGaps = currentResult.gaps.filter((g) => g.severity === "nice_to_have");

  // Build a map from fieldId → patch suggestion (from stored patchEvents)
  const patchMap = new Map<string, PatchEvent>();
  for (const p of currentResult.mapped?.patchEvents ?? []) {
    if (p.delta?.path) patchMap.set(p.delta.path, p);
  }

  // Score band (A1)
  const band = getScoreBand(currentResult.overallScore);

  // Dynamic CTA text (B1)
  const ctaText = buildCtaText(currentResult.gaps, currentResult.chapterScores);

  // Teaser gap for B3 (lowest-severity non-approved)
  const teaserGap = !isApproved
    ? (currentResult.gaps.find((g) => g.severity === "nice_to_have") ??
       currentResult.gaps.find((g) => g.severity === "important"))
    : undefined;
  const chunkSummary = currentResult.mapped?.chunkSummary;
  const pendingQuestions = extractPendingQuestions(
    currentResult.reviewNotes,
    chunkSummary,
  );
  const baseQuickFillQuestions = buildQuickFillQuestions(
    currentResult.gaps,
    currentResult.chapterScores,
  );
  const storedQuickAnswers = currentResult.intake.quickAnswers ?? {};
  const shouldShowQuickFill = !isPremium || needsAdjustment;
  const quickFillQuestions = shouldShowQuickFill
    ? filterUnansweredQuickFillQuestions(baseQuickFillQuestions.map((question, index) => ({
        ...question,
        prompt:
          needsAdjustment && pendingQuestions[index]
            ? pendingQuestions[index]
            : question.prompt,
      })), storedQuickAnswers)
    : [];
  const hasQuickAnswer = quickFillQuestions.some(
    (question) => (quickAnswers[question.fieldId] ?? "").trim().length > 0,
  );

  async function handleQuickReanalyze() {
    const resultSnapshot = currentResult;
    if (!resultSnapshot) return;

    const mergedQuickAnswers = {
      ...(resultSnapshot.intake.quickAnswers ?? {}),
      ...Object.fromEntries(
        quickFillQuestions
          .map((question) => [
            question.fieldId,
            (quickAnswers[question.fieldId] ?? "").trim(),
          ])
          .filter(([, value]) => value.length > 0),
      ),
    };

    const nextIntake = {
      ...resultSnapshot.intake,
      quickAnswers:
        Object.keys(mergedQuickAnswers).length > 0
          ? mergedQuickAnswers
          : undefined,
      bouwjaar:
        mergedQuickAnswers["basis.bouwjaar"]?.trim() ||
        resultSnapshot.intake.bouwjaar,
    };

    setIntake(nextIntake);
    await analyze();
  }

  // P1: Apply all validated patches from this result to the wizard store, then navigate
  function convertToPve() {
    if (!result) return;
    const patches = result.mapped?.patchEvents ?? [];
    if (patches.length === 0) {
      router.push("/wizard");
      return;
    }
    let applied = 0;
    for (const patch of patches) {
      try {
        applyPatch(patch.chapter as ChapterKey, patch.delta, "system");
        applied++;
      } catch {
        // Schema rejected — skip silently
      }
    }
    console.log(`[PvE→Wizard] ${applied}/${patches.length} patches toegepast`);
    setConvertDone(true);
    router.push("/wizard");
  }

  function exportReportPdf() {
    // Minimal functional export for testing: browser print dialog (save as PDF).
    window.print();
  }

  function fillGapsViaChat() {
    router.push("/wizard?entry=fill-gaps&source=pve-check");
  }

  return (
    <div className="space-y-8">

      {/* DEV toolbar */}
      {IS_DEV && (
        <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-2">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            DEV — Premium simulatie (alleen zichtbaar in development)
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: "Gratis", isPremium: false, status: "none" as ReviewStatus },
                { label: "Premium · Pending", isPremium: true, status: "pending" as ReviewStatus },
                { label: "Premium · Approved", isPremium: true, status: "approved" as ReviewStatus },
                { label: "Premium · Needs adjustment", isPremium: true, status: "needs_adjustment" as ReviewStatus },
              ] as const
            ).map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setDevIsPremium(opt.isPremium);
                  setDevReviewStatus(opt.status);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  devIsPremium === opt.isPremium && devReviewStatus === opt.status
                    ? "bg-amber-400 border-amber-500 text-white"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-amber-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Score overview (A1: score framing) */}
      <section className="text-center space-y-2">
        <ScoreCircle score={result.overallScore} />
        <h2 className="text-2xl font-bold">
          Je PvE is {result.overallScore}% compleet
        </h2>
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">
          {band.label} — {band.description}
        </p>
        {!isPremium && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Met architect review: verwacht {band.expectedAfterPremium}%
          </p>
        )}
        {result.nudgeSummary && (
          <p className="text-sm text-slate-600 dark:text-slate-400 italic max-w-md mx-auto mt-1">
            {result.nudgeSummary}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {result.gaps.length} gaps &mdash; {result.conflicts.length} conflicten &mdash; rubric {result.rubricVersion}
        </p>
      </section>

      {/* DocumentReadSection — "Wat we in je document herkenden" */}
      {result.classifyFields && result.classifyFields.length > 0 && (
        <DocumentReadSection classifyFields={result.classifyFields} />
      )}

      {/* Sterke punten (A2) — boven de gaps */}
      <StrongPointsSection classifyFields={result.classifyFields ?? []} />

      {/* Benchmark card */}
      {result.mapped?.benchmarkDeltas && result.mapped.benchmarkDeltas.length > 0 && (
        <BenchmarkCard deltas={result.mapped.benchmarkDeltas} />
      )}

      {/* A6: Snel aanvullen + heranalyse */}
      {shouldShowQuickFill && quickFillQuestions.length > 0 && (
        <QuickFillSection
          questions={quickFillQuestions}
          answers={quickAnswers}
          isAnalyzing={isAnalyzing}
          canReanalyze={hasQuickAnswer}
          onAnswerChange={(fieldId, value) =>
            setQuickAnswers((prev) => ({ ...prev, [fieldId]: value }))
          }
          onReanalyze={() => {
            void handleQuickReanalyze();
          }}
        />
      )}

      {/* Chapter scores */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Hoofdstukscores</h3>
        <div className="grid gap-2">
          {result.chapterScores.map((cs) => (
            <ChapterScoreBar key={cs.chapter} score={cs} />
          ))}
        </div>
      </section>

      {/* Conflicts */}
      {result.conflicts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
            Conflicten ({result.conflicts.length})
          </h3>
          <div className="space-y-3">
            {result.conflicts.map((c) => (
              <ConflictCard key={c.id} conflict={c} />
            ))}
          </div>
        </section>
      )}

      {/* P3: ChunkSummary top-5 actieplan (compact, boven gaps) */}
      {chunkSummary && chunkSummary.top5Actions.length > 0 && (
        <ChunkSummarySection summary={chunkSummary} />
      )}

      {/* Gaps by severity */}
      {criticalGaps.length > 0 && (
        <>
          <GapSection title="Kritieke gaps" color="red" gaps={criticalGaps} isApproved={isApproved} patchMap={patchMap} />
          {/* B6: In-context micro-CTA after first critical gap section */}
          {!isPremium && (
            <div className="py-1 text-center text-xs text-[#0d3d4d] dark:text-teal-400">
              ↑ Deze kritieke gaps hebben architect-gevalideerde verbetervoorstellen.{" "}
              <button
                className="underline font-medium hover:opacity-70 transition-opacity"
                onClick={() => {
                  const el = document.getElementById("pve-paywall");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Bekijk wat een architect oplost →
              </button>
            </div>
          )}
        </>
      )}
      {importantGaps.length > 0 && (
        <GapSection title="Belangrijke gaps" color="amber" gaps={importantGaps} isApproved={isApproved} patchMap={patchMap} />
      )}
      {niceGaps.length > 0 && (
        <GapSection title="Nice-to-have" color="blue" gaps={niceGaps} isApproved={isApproved} patchMap={patchMap} />
      )}

      {/* B3: Teaser — één volledig verbetervoorstel gratis */}
      {!isPremium && teaserGap && (
        <TeaserSection gap={teaserGap} />
      )}

      {/* Free: paywall CTA (B2: verlies-framing + B7: checkout link) */}
      {!isPremium && (
        <section
          id="pve-paywall"
          className="p-5 rounded-xl bg-gradient-to-br from-[#0d3d4d]/10 to-[#0d3d4d]/5 dark:from-[#0d3d4d]/30 dark:to-[#0d3d4d]/10 border border-[#0d3d4d]/20 space-y-4"
        >
          {/* Verlies-framing (B2) */}
          {criticalGaps.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Zonder verbetering:
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs">
                Je PvE bevat {criticalGaps.length} kritieke gaps. Op basis van vergelijkbare projecten
                leidt dit bij 7 van de 10 projecten tot meerwerk of vertraging — gemiddeld
                €8.000-€15.000 extra.
              </p>
            </div>
          )}

          <div className="text-center space-y-3">
            <h3 className="font-semibold text-[#0d3d4d] dark:text-teal-300">
              {ctaText}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Een architect controleert je analyse op hoofdpunten en voegt concrete verbeterpunten
              toe per gap. Je ontvangt ook patchknoppen om direct door te werken in de wizard.
            </p>
            <button
              className="px-6 py-2.5 rounded-lg bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0a2f3a] transition-colors"
              onClick={() => {
                window.location.href = `/checkout?feature=pve-check&source=results&resultId=${result.id}`;
              }}
            >
              Architect review aanvragen →
            </button>
            <p className="text-xs text-slate-400">
              € 49 eenmalig — of riskeer gemiddeld €8.000-€15.000 meerwerk
            </p>
          </div>
        </section>
      )}

      {/* Premium states */}
      {isPending && <PremiumPendingBanner />}
      {needsAdjustment && (
        <NeedsAdjustmentBanner
          onFillNow={() => {
            const target = document.getElementById("quick-fill-section");
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      {/* Premium approved: action buttons */}
      {isApproved && (
        <section className="p-4 rounded-xl bg-[#0d3d4d]/5 dark:bg-[#0d3d4d]/20 border border-[#0d3d4d]/20 space-y-3">
          <h3 className="font-semibold text-[#0d3d4d] dark:text-teal-400">
            Acties — Premium
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportReportPdf}
              className="px-4 py-2 rounded-lg bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0a2f3a] transition-colors"
            >
              Exporteer rapport (PDF)
            </button>
            <button
              onClick={convertToPve}
              className="px-4 py-2 rounded-lg border border-[#0d3d4d] text-[#0d3d4d] dark:text-teal-400 dark:border-teal-400 text-sm font-medium hover:bg-[#0d3d4d]/5 transition-colors"
            >
              {convertDone ? "Naar wizard →" : `Zet over naar Brikx PvE (${result.mapped?.patchEvents?.length ?? 0} aanpassingen)`}
            </button>
            <button
              onClick={fillGapsViaChat}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Vul gaps bij (chat)
            </button>
          </div>
          <p className="text-xs text-slate-400 italic">
            Dit rapport is automatisch geanalyseerd en door een architect gecontroleerd op hoofdpunten.
            Definitieve toetsing vindt plaats binnen een ontwerpopdracht.
          </p>
        </section>
      )}

      {/* Warnings */}
      {result.mapped?.derived?.warnings?.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Waarschuwingen</h3>
          <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
            {result.mapped.derived.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span>&#9888;</span> {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reset */}
      <div>
        <button
          onClick={reset}
          className="w-full py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Nieuw document analyseren
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENT READ SECTION — "Wat we in je document herkenden"
// ============================================================================

function DocumentReadSection({
  classifyFields,
}: {
  classifyFields: PveClassifiedField[];
}) {
  const [expanded, setExpanded] = useState(false);

  const findings = classifyFields
    .filter((f) => f.confidence >= 0.5)
    .map((f) => {
      const rubricItem = PVE_RUBRIC.items.find((r) => r.id === f.fieldId);
      return {
        fieldId: f.fieldId,
        label: rubricItem?.label ?? f.fieldId,
        status: f.vague ? "vaag" : "goed",
        quote: f.quote,
        observation: f.observation,
        weakness: f.weakness,
        confidence: f.confidence,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  const goedCount = findings.filter((f) => f.status === "goed").length;
  const vaagCount = findings.filter((f) => f.status === "vaag").length;

  if (findings.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-sm">
            Wat we in je document herkenden
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {goedCount} onderdelen aanwezig
            {vaagCount > 0 && `, ${vaagCount} te vaag uitgewerkt`}
          </p>
        </div>
        <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {findings.map((finding) => (
            <div key={finding.fieldId} className="px-4 py-3 space-y-1">
              <div className="flex items-start gap-2">
                <span
                  className={`text-xs font-bold mt-0.5 w-4 shrink-0 ${
                    finding.status === "goed"
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-500 dark:text-amber-400"
                  }`}
                >
                  {finding.status === "goed" ? "✓" : "~"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{finding.label}</span>

                  {finding.quote && (
                    <blockquote className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-600 pl-2">
                      &ldquo;{finding.quote}&rdquo;
                    </blockquote>
                  )}

                  {finding.observation && finding.status === "goed" && (
                    <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                      {finding.observation}
                    </p>
                  )}

                  {finding.weakness && finding.status === "vaag" && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      {finding.weakness}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// STERKE PUNTEN (A2) — "Wat je goed hebt gedaan"
// ============================================================================

function StrongPointsSection({
  classifyFields,
}: {
  classifyFields: PveClassifiedField[];
}) {
  const strongFields = classifyFields.filter(
    (f) => f.confidence > 0.7 && !f.vague,
  );

  if (strongFields.length === 0) return null;

  return (
    <section className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
      <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
        Dit heb je goed uitgewerkt
      </h3>
      <ul className="space-y-1">
        {strongFields.slice(0, 5).map((f) => {
          const rubricItem = PVE_RUBRIC.items.find((r) => r.id === f.fieldId);
          const label = rubricItem?.label ?? f.fieldId;
          return (
            <li key={f.fieldId} className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
              <span className="font-bold mt-0.5">✓</span>
              <span>
                <span className="font-medium">{label}</span>
                {f.observation && (
                  <span className="text-green-600 dark:text-green-500">
                    {" "}— {f.observation}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ============================================================================
// TEASER (B3) — één volledig verbetervoorstel gratis
// ============================================================================

function TeaserSection({ gap }: { gap: PveGap }) {
  const rubricItem = PVE_RUBRIC.items.find(
    (r) => r.id === gap.fieldId || r.fieldId === gap.fieldId,
  );
  const example = rubricItem?.exampleGood;
  if (!example) return null;

  return (
    <section className="p-4 rounded-xl border border-dashed border-[#0d3d4d]/30 dark:border-teal-700/50 bg-[#0d3d4d]/3 dark:bg-[#0d3d4d]/10 space-y-3">
      <p className="text-xs font-semibold text-[#0d3d4d] dark:text-teal-400 uppercase tracking-wide">
        Voorbeeld verbetervoorstel (gratis preview)
      </p>
      <div className="space-y-1">
        <p className="text-xs text-slate-500">
          Gap: <span className="font-medium text-slate-700 dark:text-slate-300">{gap.label}</span>
        </p>
        <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
            Verbetervoorstel (Brikx AI + architect):
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">{example}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Voor de overige {Math.max(0, (gap.severity === "nice_to_have"
          ? 0
          : 0) + (gap.severity === "important" ? 1 : 0))} verbetervoorstellen →{" "}
        <button
          className="underline text-[#0d3d4d] dark:text-teal-400 font-medium"
          onClick={() => {
            const el = document.getElementById("pve-paywall");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Ontgrendel architect review
        </button>
      </p>
    </section>
  );
}

// ============================================================================
// DYNAMIC CTA TEXT (B1)
// ============================================================================

function buildCtaText(
  gaps: PveGap[],
  chapterScores: ChapterScore[],
): string {
  const criticals = gaps.filter((g) => g.severity === "critical");

  if (criticals.some((g) => g.chapter === "budget")) {
    return "Laat een architect je budgetstructuur controleren";
  }
  if (criticals.some((g) => g.chapter === "techniek")) {
    return "Laat een architect je installatiekeuzes doorlichten";
  }
  if (criticals.some((g) => g.chapter === "duurzaam")) {
    return "Laat een architect je duurzaamheidsdoelen concretiseren";
  }

  const worstChapter = [...chapterScores].sort((a, b) => a.score - b.score)[0];
  if (worstChapter) {
    return `Verbeter je ${worstChapter.label.toLowerCase()}-score van ${worstChapter.score}%`;
  }

  return "Ontgrendel verbetervoorstellen";
}

function QuickFillSection({
  questions,
  answers,
  isAnalyzing,
  canReanalyze,
  onAnswerChange,
  onReanalyze,
}: {
  questions: QuickFillQuestion[];
  answers: Record<string, string>;
  isAnalyzing: boolean;
  canReanalyze: boolean;
  onAnswerChange: (fieldId: string, value: string) => void;
  onReanalyze: () => void;
}) {
  return (
    <section
      id="quick-fill-section"
      className="p-4 rounded-xl border border-[#0d3d4d]/20 bg-[#0d3d4d]/5 dark:bg-[#0d3d4d]/15 space-y-3"
    >
      <div>
        <h3 className="text-sm font-semibold text-[#0d3d4d] dark:text-teal-300">
          Snel aanvullen
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Beantwoord deze 3 vragen met de hoogste score-impact en heranalyseer.
        </p>
      </div>

      <div className="space-y-3">
        {questions.map((question, idx) => (
          <div
            key={question.fieldId}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40 space-y-2"
          >
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {idx + 1}. {question.prompt}
            </p>
            {question.inputType === "select" && question.options ? (
              <select
                value={answers[question.fieldId] ?? ""}
                onChange={(event) =>
                  onAnswerChange(question.fieldId, event.target.value)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
              >
                <option value="">Kies een antwoord</option>
                {question.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={answers[question.fieldId] ?? ""}
                onChange={(event) =>
                  onAnswerChange(question.fieldId, event.target.value)
                }
                placeholder={question.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
              />
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Impactscore: {question.impact}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isAnalyzing || !canReanalyze}
        onClick={onReanalyze}
        className="px-4 py-2 rounded-lg bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0a2f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isAnalyzing ? "Heranalyse bezig..." : "Heranalyseer met deze info ->"}
      </button>
    </section>
  );
}

// ---- Premium pending banner ----
function PremiumPendingBanner() {
  return (
    <section className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
      <h3 className="font-semibold text-blue-700 dark:text-blue-400">
        Je verbeteringen worden klaargezet
      </h3>
      <p className="text-sm text-blue-600 dark:text-blue-300">
        Een architect controleert je analyse op hoofdpunten en voegt concrete verbeterpunten toe.
        Je krijgt een bericht zodra de check klaar is — meestal binnen 1-2 werkdagen.
      </p>
    </section>
  );
}

// ---- Needs adjustment banner ----
function NeedsAdjustmentBanner({ onFillNow }: { onFillNow: () => void }) {
  return (
    <section className="p-5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 space-y-2">
      <h3 className="font-semibold text-orange-700 dark:text-orange-400">
        We missen nog enkele antwoorden
      </h3>
      <p className="text-sm text-orange-600 dark:text-orange-300">
        Vul de vragen aan en heranalyseer. Daarna gaat je dossier opnieuw naar review.
      </p>
      <button
        type="button"
        onClick={onFillNow}
        className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
      >
        Vul nu aan {"->"}
      </button>
    </section>
  );
}

// ---- Score circle ----
function ScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "text-green-500"
      : score >= 50
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

// ---- Chapter score bar ----
function ChapterScoreBar({ score }: { score: ChapterScore }) {
  const color =
    score.score >= 75
      ? "bg-green-500"
      : score.score >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-40 text-slate-600 dark:text-slate-300 truncate">
        {score.label}
      </span>
      <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs">{score.score}%</span>
      {score.criticalGapCount > 0 && (
        <span className="text-xs text-red-500 font-medium">
          {score.criticalGapCount} kritiek
        </span>
      )}
    </div>
  );
}

// ---- Conflict card ----
function ConflictCard({ conflict }: { conflict: HeadlineConflict }) {
  const borderColor =
    conflict.severity === "hoog"
      ? "border-red-400"
      : "border-amber-400";

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${borderColor} bg-white dark:bg-slate-800 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm">{conflict.title}</h4>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            conflict.severity === "hoog"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}
        >
          {conflict.severity}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {conflict.summary}
      </p>
      <p className="text-xs text-[#0d3d4d] dark:text-teal-400 mt-2 font-medium">
        Volgende stap: {conflict.suggestedNextStep}
      </p>
    </div>
  );
}

function ChunkSummarySection({ summary }: { summary: PveChunkSummary }) {
  return (
    <section className="p-4 rounded-xl border border-[#0d3d4d]/20 bg-[#0d3d4d]/5 dark:bg-[#0d3d4d]/15 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#0d3d4d] dark:text-teal-300">
          Top-5 actieplan
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          {summary.oneLineSummary}
        </p>
      </div>

      <div className="space-y-2">
        {summary.top5Actions.map((action, index) => (
          <div
            key={`${action.fieldId}-${index}`}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {index + 1}. {action.label}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                impact {action.impactScore}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {action.whyNow}
            </p>
            <p className="text-xs text-[#0d3d4d] dark:text-teal-400 mt-1">
              Volgende stap: {action.suggestedNextStep}
            </p>
          </div>
        ))}
      </div>

      {summary.followUpQuestions.length > 0 && (
        <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Aanvulvragen
          </p>
          <ul className="space-y-1">
            {summary.followUpQuestions.map((question, index) => (
              <li key={`${question}-${index}`} className="text-xs text-slate-600 dark:text-slate-300">
                {index + 1}. {question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ---- Gap section ----
function GapSection({
  title,
  color,
  gaps,
  isApproved,
  patchMap,
}: {
  title: string;
  color: "red" | "amber" | "blue";
  gaps: PveGap[];
  isApproved: boolean;
  patchMap: Map<string, PatchEvent>;
}) {
  const headerColor = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
  }[color];

  const badgeColor = {
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  }[color];

  return (
    <section>
      <h3 className={`text-lg font-semibold mb-3 ${headerColor}`}>
        {title} ({gaps.length})
      </h3>
      <div className="space-y-2">
        {gaps.map((gap) => (
          <GapCard
            key={gap.id}
            gap={gap}
            badgeColor={badgeColor}
            isApproved={isApproved}
            patchMap={patchMap}
          />
        ))}
      </div>
    </section>
  );
}

// ---- Gap card ----
function GapCard({
  gap,
  badgeColor,
  isApproved,
  patchMap,
}: {
  gap: PveGap;
  badgeColor: string;
  isApproved: boolean;
  patchMap: Map<string, PatchEvent>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const applyPatch = useWizardState((s) => s.applyPatch);
  const router = useRouter();

  // Find rubric example for this gap
  const rubricItem = PVE_RUBRIC.items.find((r) => r.id === gap.fieldId || r.fieldId === gap.fieldId);
  const exampleGood = rubricItem?.exampleGood;

  // Find patch suggestion from stored patches
  const patch = patchMap.get(gap.fieldId);
  const patchValue = patch?.delta?.value as string | undefined;
  const suggestion = gap.suggestedImprovement ?? patchValue ?? exampleGood;

  function applyGapPatch() {
    if (!patch) return;
    try {
      applyPatch(patch.chapter as ChapterKey, patch.delta, "system");
      setPatchApplied(true);
    } catch {
      // Schema rejected
    }
  }

  return (
    <div className="rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-3 text-left flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{gap.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${badgeColor}`}>
              {gap.fixEffort}
            </span>
            {gap.isVagueness && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                vaag
              </span>
            )}
            {isApproved && suggestion && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                verbetering beschikbaar
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {gap.friendlyReason ?? gap.reason}
          </p>
        </div>
        <span className="text-slate-400 text-xs mt-0.5 shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-100 dark:border-slate-700">
          {/* Friendly + technical reason (A3) */}
          {gap.friendlyReason && (
            <div className="pt-2 p-2 rounded bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Menselijke uitleg
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {gap.friendlyReason}
              </p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Technische reden
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {gap.reason}
            </p>
          </div>

          {/* Risk overlay */}
          {gap.riskOverlay && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Risico: {gap.riskOverlay}
            </p>
          )}

          {/* Evidence */}
          {gap.evidence && (
            <p className="text-xs text-slate-400 italic">
              Evidence (p.{gap.evidence.page}): &quot;
              {gap.evidence.snippet.slice(0, 120)}...&quot;
            </p>
          )}

          {/* Kennisbank hint */}
          {gap.knowledgeHint && (
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-0.5">
                Advies uit Kennisbank:
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {gap.knowledgeHint}
              </p>
            </div>
          )}

          {/* Free: rubric example (blurred) */}
          {!isApproved && exampleGood && (
            <div className="relative">
              <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                  Voorbeeld (gratis preview):
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 blur-sm select-none">
                  {exampleGood}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded bg-white/60 dark:bg-slate-900/60">
                <span className="text-xs text-[#0d3d4d] dark:text-teal-400 font-medium">
                  🔒 Ontgrendel met architect review
                </span>
              </div>
            </div>
          )}

          {/* Approved: full suggestion */}
          {isApproved && suggestion && (
            <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                Verbetervoorstel:
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {suggestion}
              </p>
            </div>
          )}

          {/* Approved: patch button */}
          {isApproved && patch && (
            <div className="flex items-center gap-2">
              {!patchApplied ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded bg-[#0d3d4d]/10 text-[#0d3d4d] dark:text-teal-400 hover:bg-[#0d3d4d]/20 transition-colors"
                  onClick={applyGapPatch}
                >
                  Zet over naar PvE →
                </button>
              ) : (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Toegepast —{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => router.push("/wizard")}
                  >
                    Naar wizard
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Benchmark card ----
const METRIC_LABELS: Record<string, string> = {
  wordCount: "Woorden in PvE",
  roomCount: "Ruimtes benoemd",
  budget: "Budget",
};

function BenchmarkCard({ deltas }: { deltas: PveBenchmarkDelta[] }) {
  const wordDelta = deltas.find((d) => d.metric === "wordCount");
  const isThin = wordDelta && wordDelta.delta !== null && wordDelta.delta < -500;
  const isRich = wordDelta && wordDelta.delta !== null && wordDelta.delta > 500;

  return (
    <section className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        Vergelijking met gemiddeld PvE
      </h3>

      {isThin && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2">
          Je PvE is dunner dan gebruikelijk voor dit projecttype. Overweeg ruimteprogramma, technische eisen en risico&apos;s verder uit te werken.
        </p>
      )}
      {isRich && (
        <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
          Je PvE is uitgebreider dan gemiddeld — goed uitgangspunt.
        </p>
      )}

      <div className="space-y-2">
        {deltas
          .filter((d) => d.metric !== "budget")
          .map((d) => (
            <BenchmarkRow key={d.metric} delta={d} />
          ))}
      </div>
    </section>
  );
}

function BenchmarkRow({ delta }: { delta: PveBenchmarkDelta }) {
  const label = METRIC_LABELS[delta.metric] ?? delta.metric;
  const value = delta.value ?? 0;
  const benchmark = delta.benchmark;
  const pct = Math.round((value / benchmark) * 100);
  const isLow = pct < 70;
  const isHigh = pct > 130;

  const barColor = isLow ? "bg-amber-400" : isHigh ? "bg-green-500" : "bg-[#0d3d4d]";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>
          <span className={isLow ? "text-amber-600 dark:text-amber-400 font-medium" : "font-medium"}>
            {value.toLocaleString("nl-NL")}
          </span>
          {" / "}
          <span className="text-slate-400">gem. {benchmark.toLocaleString("nl-NL")}</span>
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-visible">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-400 dark:bg-slate-500"
          style={{ left: "100%" }}
          title={`Gemiddeld: ${benchmark}`}
        />
      </div>
    </div>
  );
}


