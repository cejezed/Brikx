"use client";

import { useState } from "react";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";
import { PVE_RUBRIC } from "@/lib/pveCheck/rubric";
import type { PveGap, HeadlineConflict, ChapterScore, ReviewStatus } from "@/types/pveCheck";
import type { PatchEvent } from "@/types/project";

const IS_DEV = process.env.NODE_ENV === "development";

export function ResultsPage() {
  const { result, reset } = usePveCheckStore();

  // DEV: local override for premium simulation
  const [devIsPremium, setDevIsPremium] = useState(false);
  const [devReviewStatus, setDevReviewStatus] = useState<ReviewStatus>("none");

  if (!result) {
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

  const isPremium = IS_DEV ? devIsPremium : result.isPremium;
  const reviewStatus = IS_DEV ? devReviewStatus : result.reviewStatus;
  const isApproved = isPremium && reviewStatus === "approved";
  const isPending = isPremium && reviewStatus === "pending";
  const needsAdjustment = isPremium && reviewStatus === "needs_adjustment";

  const criticalGaps = result.gaps.filter((g) => g.severity === "critical");
  const importantGaps = result.gaps.filter((g) => g.severity === "important");
  const niceGaps = result.gaps.filter((g) => g.severity === "nice_to_have");

  // Build a map from fieldId → patch suggestion (from stored patchEvents)
  const patchMap = new Map<string, PatchEvent>();
  for (const p of result.mapped?.patchEvents ?? []) {
    if (p.delta?.path) patchMap.set(p.delta.path, p);
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

      {/* Score overview */}
      <section className="text-center space-y-3">
        <ScoreCircle score={result.overallScore} />
        <h2 className="text-2xl font-bold">Score: {result.overallScore}/100</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rubric versie: {result.rubricVersion} &mdash;{" "}
          {result.gaps.length} gaps, {result.conflicts.length} conflicten
        </p>
        {result.nudgeSummary && (
          <p className="text-sm text-amber-600 dark:text-amber-400 italic">
            {result.nudgeSummary}
          </p>
        )}
      </section>

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

      {/* Gaps by severity */}
      {criticalGaps.length > 0 && (
        <GapSection title="Kritieke gaps" color="red" gaps={criticalGaps} isApproved={isApproved} patchMap={patchMap} />
      )}
      {importantGaps.length > 0 && (
        <GapSection title="Belangrijke gaps" color="amber" gaps={importantGaps} isApproved={isApproved} patchMap={patchMap} />
      )}
      {niceGaps.length > 0 && (
        <GapSection title="Nice-to-have" color="blue" gaps={niceGaps} isApproved={isApproved} patchMap={patchMap} />
      )}

      {/* Premium states */}
      {isPending && <PremiumPendingBanner />}
      {needsAdjustment && <NeedsAdjustmentBanner />}

      {/* Premium approved: action buttons */}
      {isApproved && (
        <section className="p-4 rounded-xl bg-[#0d3d4d]/5 dark:bg-[#0d3d4d]/20 border border-[#0d3d4d]/20 space-y-3">
          <h3 className="font-semibold text-[#0d3d4d] dark:text-teal-400">
            Acties — Premium
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-lg bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0a2f3a] transition-colors">
              Exporteer rapport (PDF)
            </button>
            <button className="px-4 py-2 rounded-lg border border-[#0d3d4d] text-[#0d3d4d] dark:text-teal-400 dark:border-teal-400 text-sm font-medium hover:bg-[#0d3d4d]/5 transition-colors">
              Zet over naar Brikx PvE
            </button>
            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Vul gaps bij (chat)
            </button>
          </div>
          <p className="text-xs text-slate-400 italic">
            Dit rapport is automatisch geanalyseerd en door een architect gecontroleerd op hoofdpunten.
            Definitieve toetsing vindt plaats binnen een ontwerpopdracht.
          </p>
        </section>
      )}

      {/* Free: paywall CTA */}
      {!isPremium && (
        <section className="p-5 rounded-xl bg-gradient-to-br from-[#0d3d4d]/10 to-[#0d3d4d]/5 dark:from-[#0d3d4d]/30 dark:to-[#0d3d4d]/10 border border-[#0d3d4d]/20 text-center space-y-3">
          <h3 className="font-semibold text-[#0d3d4d] dark:text-teal-300">
            Ontgrendel verbetervoorstellen
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Een architect controleert je analyse en voegt concrete verbeterpunten toe.
            Je ontvangt een volledig rapport met patchknoppen om direct door te werken in de wizard.
          </p>
          <button className="px-6 py-2.5 rounded-lg bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0a2f3a] transition-colors">
            Architect review aanvragen →
          </button>
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

      {/* Review status */}
      <section className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
        <p>
          <strong>Review status:</strong> {reviewStatus}
        </p>
        <p>
          <strong>Premium:</strong> {isPremium ? "Ja" : "Nee (gratis)"}
        </p>
      </section>

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
function NeedsAdjustmentBanner() {
  return (
    <section className="p-5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 space-y-2">
      <h3 className="font-semibold text-orange-700 dark:text-orange-400">
        We missen nog enkele antwoorden
      </h3>
      <p className="text-sm text-orange-600 dark:text-orange-300">
        Om je rapport betrouwbaar te maken hebben we wat aanvullende informatie nodig.
      </p>
      <button className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
        Vul nu aan →
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

  // Find rubric example for this gap
  const rubricItem = PVE_RUBRIC.items.find((r) => r.id === gap.fieldId || r.fieldId === gap.fieldId);
  const exampleGood = rubricItem?.exampleGood;

  // Find patch suggestion from stored patches
  const patch = patchMap.get(gap.fieldId);
  const patchValue = patch?.delta?.value as string | undefined;
  const suggestion = gap.suggestedImprovement ?? patchValue ?? exampleGood;

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
            {gap.reason}
          </p>
        </div>
        <span className="text-slate-400 text-xs mt-0.5 shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-100 dark:border-slate-700">
          {/* Reason */}
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-2">
            {gap.reason}
          </p>

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

          {/* Free: rubric example (blurred if not approved) */}
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
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-[#0d3d4d]/10 text-[#0d3d4d] dark:text-teal-400 hover:bg-[#0d3d4d]/20 transition-colors"
              onClick={() => alert("Patch: " + JSON.stringify(patch.delta))}
            >
              Zet over naar PvE →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
