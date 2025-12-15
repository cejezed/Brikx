"use client";

import React from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { computeChapterProgress, type ChapterStatus } from "./chapterProgress";
import type { ChapterKey } from "@/types/project";

const LABELS: Record<ChapterKey, string> = {
  basis: "Basis",
  ruimtes: "Ruimtes",
  wensen: "Wensen",
  budget: "Budget",
  techniek: "Techniek",
  duurzaam: "Duurzaamheid",
  risico: "Risico’s",
};

const ICON: Record<ChapterStatus, string> = {
  complete: "✅",
  partial: "🟡",
  empty: "⚪",
};

type Props = {
  onClose: () => void;
};

export default function DocumentOverview({ onClose }: Props) {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);

  const chapters: ChapterKey[] = ["basis", "ruimtes", "wensen", "budget", "techniek", "duurzaam", "risico"];

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-md flex flex-col text-white">
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Documentoverzicht</p>
          <h2 className="text-lg font-bold">Programma van Eisen</h2>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold border border-white/20"
        >
          Sluiten
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
        {chapters.map((ch) => {
          const { status } = computeChapterProgress(ch, chapterAnswers);
          return (
            <button
              key={ch}
              onClick={() => {
                setCurrentChapter(ch);
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{ICON[status]}</span>
                <div>
                  <p className="text-sm font-semibold">{LABELS[ch]}</p>
                  <p className="text-[11px] text-white/70">Programma van Eisen</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-white/80">Tap om te openen</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-lg active:scale-[0.99]"
        >
          Ga verder waar je was
        </button>
      </div>
    </div>
  );
}
