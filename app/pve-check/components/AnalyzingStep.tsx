"use client";

import { useEffect } from "react";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";

export function AnalyzingStep() {
  const { isAnalyzing, error, result, setStep } = usePveCheckStore();

  // If we arrive here without a result and not analyzing, go back
  useEffect(() => {
    if (!isAnalyzing && !result && !error) {
      setStep("upload");
    }
  }, [isAnalyzing, result, error, setStep]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      {isAnalyzing ? (
        <>
          <div className="w-16 h-16 border-4 border-[#0d3d4d] border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Document wordt geanalyseerd</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              LLM-classificatie, scoring, gap-detectie en conflict-analyse...
            </p>
            <p className="text-xs text-slate-400">
              Dit kan 10-30 seconden duren.
            </p>
          </div>
        </>
      ) : error ? (
        <div className="text-center space-y-4">
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
      ) : null}
    </div>
  );
}
