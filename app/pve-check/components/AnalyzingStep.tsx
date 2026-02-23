"use client";

import { useEffect, useState } from "react";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";
import { PVE_RUBRIC } from "@/lib/pveCheck/rubric";

// ---- Stappen die de analyse doorloopt ----
type StepStatus = "done" | "active" | "waiting";

type AnalyzeProgressStep = {
  id: string;
  label: (ctx: StepContext) => string;
  doneAfterMs: number; // simuleer wanneer de stap "klaar" is
};

type StepContext = {
  wordCount: number;
  pageCount: number;
  documentName: string;
  projectLabel: string;
  rubricCount: number;
};

const STEPS: AnalyzeProgressStep[] = [
  {
    id: "document",
    label: (ctx) =>
      `Document geladen — ${ctx.wordCount.toLocaleString("nl-NL")} woorden, ${ctx.pageCount} pagina's`,
    doneAfterMs: 0, // direct
  },
  {
    id: "project",
    label: (ctx) => `Project herkend: ${ctx.projectLabel}, ${ctx.documentName}`,
    doneAfterMs: 1500,
  },
  {
    id: "analyse",
    label: (ctx) => `Analyseren op ${ctx.rubricCount} kwaliteitscriteria`,
    doneAfterMs: 6000,
  },
  {
    id: "kennisbank",
    label: () => "Kennisbank raadplegen voor jouw projecttype",
    doneAfterMs: 18000,
  },
  {
    id: "patches",
    label: () => "Verbetervoorstellen opstellen",
    doneAfterMs: 24000,
  },
];

// ---- "Wist je dat?" kaartjes ----
const WIST_JE_DAT = [
  "Een incomplete PvE is de meest voorkomende oorzaak van meerwerk. Gemiddeld kost onduidelijkheid in een PvE €12.000 extra per project.",
  "Architecten besteden gemiddeld 40% van hun eerste overleg aan het verduidelijken van eisen die al in het PvE hadden kunnen staan.",
  "Een goed PvE verkort de offertefase met 2-4 weken omdat aannemers minder vragen hoeven te stellen.",
  "Bij verbouwingen ontbreekt het bouwjaar in 6 van de 10 PvE's — terwijl dit bepalend is voor asbest-risico en constructieve aannames.",
];

export function AnalyzingStep() {
  const { isAnalyzing, error, result, setStep, docStats, documentName, intake } =
    usePveCheckStore();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [showWistJeDat, setShowWistJeDat] = useState(false);
  const [wistJeDatIdx] = useState(() =>
    Math.floor(Math.random() * WIST_JE_DAT.length),
  );

  // Tick elapsed time while analyzing
  useEffect(() => {
    if (!isAnalyzing) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 250);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Show "Wist je dat?" after 8s
  useEffect(() => {
    if (!isAnalyzing) return;
    const timer = setTimeout(() => setShowWistJeDat(true), 8000);
    return () => clearTimeout(timer);
  }, [isAnalyzing]);

  // If we arrive here without a result and not analyzing, go back
  useEffect(() => {
    if (!isAnalyzing && !result && !error) {
      setStep("upload");
    }
  }, [isAnalyzing, result, error, setStep]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="text-4xl">&#9888;</div>
        <h2 className="text-xl font-semibold text-red-600">Analyse mislukt</h2>
        <p className="text-sm text-red-500 max-w-md">{error}</p>
        <button
          onClick={() => setStep("upload")}
          className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  if (!isAnalyzing) return null;

  // Build context for step labels
  const projectLabel = intake
    ? `${intake.archetype} (${intake.projectType})`
    : "Project";
  const ctx: StepContext = {
    wordCount: docStats?.wordCount ?? 0,
    pageCount: docStats?.pageCount ?? 0,
    documentName: documentName ?? "document",
    projectLabel,
    rubricCount: PVE_RUBRIC.items.length,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 max-w-md mx-auto">

      {/* Spinner + titel */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 border-4 border-[#0d3d4d] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">Document wordt geanalyseerd</h2>
        <p className="text-xs text-slate-400">
          Dit duurt meestal 15-30 seconden
        </p>
      </div>

      {/* Stappenlijst */}
      <div className="w-full space-y-2">
        {STEPS.map((step) => {
          const isDone = elapsedMs >= step.doneAfterMs;
          // Active = not done yet, and the previous step is done
          const prevStep = STEPS[STEPS.indexOf(step) - 1];
          const prevDone = !prevStep || elapsedMs >= prevStep.doneAfterMs;
          const isActive = !isDone && prevDone;
          const status: StepStatus = isDone ? "done" : isActive ? "active" : "waiting";

          return (
            <StepRow
              key={step.id}
              label={step.label(ctx)}
              status={status}
            />
          );
        })}
      </div>

      {/* "Wist je dat?" kaartje — verschijnt na 8s */}
      {showWistJeDat && (
        <div className="w-full p-4 rounded-xl bg-[#0d3d4d]/5 dark:bg-[#0d3d4d]/20 border border-[#0d3d4d]/20 space-y-1 animate-fade-in">
          <p className="text-xs font-semibold text-[#0d3d4d] dark:text-teal-400 uppercase tracking-wide">
            Wist je dat?
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {WIST_JE_DAT[wistJeDatIdx]}
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Stap rij ----
function StepRow({
  label,
  status,
}: {
  label: string;
  status: StepStatus;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
        status === "waiting" ? "opacity-35" : "opacity-100"
      }`}
    >
      {/* Icoon */}
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">
        {status === "done" && (
          <span className="text-green-500 font-bold text-base">✓</span>
        )}
        {status === "active" && (
          <span className="w-4 h-4 border-2 border-[#0d3d4d] border-t-transparent rounded-full animate-spin inline-block dark:border-teal-400" />
        )}
        {status === "waiting" && (
          <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 inline-block" />
        )}
      </span>

      {/* Label */}
      <span
        className={
          status === "done"
            ? "text-slate-700 dark:text-slate-300"
            : status === "active"
              ? "text-[#0d3d4d] dark:text-teal-400 font-medium"
              : "text-slate-400 dark:text-slate-500"
        }
      >
        {label}
      </span>
    </div>
  );
}
