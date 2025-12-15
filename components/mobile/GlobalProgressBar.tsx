"use client";

import React, { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { computeGlobalProgress } from "./chapterProgress";

type Props = {
  onOpenOverview?: () => void;
};

export default function GlobalProgressBar({ onOpenOverview }: Props) {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const pct = useMemo(() => computeGlobalProgress(chapterAnswers), [chapterAnswers]);

  return (
    <button
      type="button"
      onClick={onOpenOverview}
      className="w-full flex flex-col gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-lg active:scale-[0.99] transition-all dark:bg-slate-800"
    >
      <div className="flex items-center justify-between text-xs font-semibold">
        <span>PvE voortgang</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 bg-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="PvE voortgang"
        />
      </div>
    </button>
  );
}
