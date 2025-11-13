"use client";

import React, { useEffect, useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { ChapterKey } from "@/types/project";
import ChatPanel from "@/components/chat/ChatPanel";
import ExpertCorner from "@/components/expert/ExpertCorner";

import Basis from "@/components/chapters/Basis";
import Ruimtes from "@/components/chapters/Ruimtes";
import Wensen from "@/components/chapters/Wensen";
import Budget from "@/components/chapters/Budget";
import Techniek from "@/components/chapters/Techniek";
import Duurzaamheid from "@/components/chapters/Duurzaamheid";
import Risico from "@/components/chapters/Risico";
// import Preview from "@/components/chapters/Preview"; // Optioneel, zie hieronder

// Als je een Preview-hoofdstuk hebt, kun je "preview" toevoegen.
// Voor nu houden we het bij de 7 kernhoofdstukken.
const DEFAULT_FLOW: ChapterKey[] = [
  "basis",
  "ruimtes",
  "wensen",
  "budget",
  "techniek",
  "duurzaam",
  "risico",
];

const CHAPTER_LABELS: Record<ChapterKey, string> = {
  basis: "Basis",
  ruimtes: "Ruimtes",
  wensen: "Wensen",
  budget: "Budget",
  techniek: "Techniek",
  duurzaam: "Duurzaamheid",
  risico: "Risico",
};

const CHAPTER_COMPONENTS: Record<ChapterKey, React.ComponentType> = {
  basis: Basis,
  ruimtes: Ruimtes,
  wensen: Wensen,
  budget: Budget,
  techniek: Techniek,
  duurzaam: Duurzaamheid,
  risico: Risico,
  // Als je Preview toevoegt:
  // preview: Preview,
};

export default function WizardLayout() {
  const currentChapter = useWizardState((s) => s.currentChapter);
  const chapterFlow = useWizardState((s) => s.chapterFlow);
  const setChapterFlow = useWizardState((s) => s.setChapterFlow);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);

  // Init flow & startchapter één keer
  useEffect(() => {
    if (!chapterFlow || chapterFlow.length === 0) {
      setChapterFlow(DEFAULT_FLOW);
      setCurrentChapter("basis");
    }
  }, [chapterFlow, setChapterFlow, setCurrentChapter]);

  const activeChapter: ChapterKey = (currentChapter as ChapterKey) || "basis";

  const ActiveComponent = useMemo(
    () => CHAPTER_COMPONENTS[activeChapter] ?? Basis,
    [activeChapter]
  );

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.4fr)_minmax(260px,0.7fr)] gap-4 xl:gap-4">
      {/* Links: Chat */}
      <section className="xl:row-start-1 xl:col-start-1 h-full flex flex-col min-h-0">
        <ChatPanel />
      </section>

      {/* Midden: hoofdstukken */}
      <section className="xl:row-start-1 xl:col-start-2 h-full flex flex-col min-h-0">
        {/* Tabs */}
        {chapterFlow && chapterFlow.length > 0 && (
          <nav className="flex-shrink-0 bg-white/95 backdrop-blur px-1 pt-2 pb-2 flex gap-2 overflow-x-auto border-b border-slate-100">
            {chapterFlow.map((ch) => (
              <button
                key={ch}
                type="button"
             onClick={() => {
  if (activeChapter !== ch) setCurrentChapter(ch);
}}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
                  activeChapter === ch
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                {CHAPTER_LABELS[ch] ?? ch}
              </button>
            ))}
          </nav>
        )}

        {/* Content - ALLEEN DEZE SCROLLT */}
        <div className="mt-3 flex-1 min-h-0 rounded-2xl bg-white shadow-sm border border-slate-100 p-4 overflow-y-auto">
          <ActiveComponent />
        </div>
      </section>

      {/* Rechts: ExpertCorner */}
      <aside className="xl:row-start-1 xl:col-start-3 h-full flex flex-col min-h-0">
        <ExpertCorner />
      </aside>
    </div>
  );
}
