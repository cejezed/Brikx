"use client";

import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";
import { IntakeStep } from "./components/IntakeStep";
import { UploadStep } from "./components/UploadStep";
import { AnalyzingStep } from "./components/AnalyzingStep";
import { ResultsPage } from "./components/ResultsPage";

export default function PveCheckPage() {
  const step = usePveCheckStore((s) => s.step);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#040914] dark:via-[#0a1326] dark:to-[#0F172A] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            &larr; Brikx
          </a>
          <h1 className="text-lg font-semibold text-[#0d3d4d] dark:text-white">
            PvE Check
          </h1>
          <StepIndicator current={step} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {step === "intake" && <IntakeStep />}
          {step === "upload" && <UploadStep />}
          {step === "analyzing" && <AnalyzingStep />}
          {step === "results" && <ResultsPage />}
        </div>
      </main>
    </div>
  );
}

// ---- Step indicator ----
function StepIndicator({
  current,
}: {
  current: "intake" | "upload" | "analyzing" | "results";
}) {
  const steps = [
    { key: "intake", label: "1. Intake" },
    { key: "upload", label: "2. Upload" },
    { key: "analyzing", label: "3. Analyse" },
    { key: "results", label: "4. Resultaat" },
  ] as const;

  return (
    <div className="ml-auto flex gap-2 text-xs">
      {steps.map((s) => (
        <span
          key={s.key}
          className={
            s.key === current
              ? "px-2 py-0.5 rounded-full bg-[#0d3d4d] text-white font-medium"
              : "px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          }
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}
