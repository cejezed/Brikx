// /components/wizard/WizardProgressBar.tsx
"use client";

import { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { getCompletionPercentage } from "@/lib/ai/missing";
import type { WizardState } from "@/types/project";

export default function WizardProgressBar() {
  // Pak alleen de stukken die we nodig hebben uit de store
  const stateVersion = useWizardState((s) => s.stateVersion);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const currentChapter = useWizardState((s) => s.currentChapter);
  const chapterFlow = useWizardState((s) => s.chapterFlow);
  const mode = useWizardState((s) => s.mode);

  // Bereken percentage o.b.v. Smart Essentials (required fields)
  const pct = useMemo(() => {
    const state: WizardState = {
      stateVersion,
      chapterAnswers,
      currentChapter,
      chapterFlow: chapterFlow ?? [],
      mode: mode ?? "PREVIEW",
    };
    const raw = getCompletionPercentage(state);
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [stateVersion, chapterAnswers, currentChapter, chapterFlow, mode]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Voortgang Smart Essentials</span>
        <span className="text-xs text-gray-600">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-2 bg-black transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Voortgang belangrijkste gegevens"
        />
      </div>
    </div>
  );
}
