// /components/wizard/ChapterControls.tsx
// ✅ 100% v3.0 Conform

"use client";

import { useCallback } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
// ⚠️ FIX: Import pad gecorrigeerd naar /types/project
import type { ChapterKey } from "@/types/project";

type ChapterItem = { key: ChapterKey; title: string };

export default function ChapterControls({
  chapters,
  activeIndex,
}: {
  chapters: ChapterItem[];
  activeIndex: number;
}) {
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);

  const goPrev = useCallback(() => {
    if (!chapters.length) return;
    const i = Math.max(activeIndex - 1, 0);
    setCurrentChapter(chapters[i].key);
  }, [activeIndex, chapters, setCurrentChapter]);

  const goNext = useCallback(() => {
    if (!chapters.length) return;
    const i = Math.min(activeIndex + 1, chapters.length - 1);
    setCurrentChapter(chapters[i].key);
  }, [activeIndex, chapters, setCurrentChapter]);

  if (!chapters.length) return null;

  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={goPrev}
        disabled={activeIndex <= 0}
        className="px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 bg-white/60 hover:bg-white/80 text-slate-700 border-2 border-white/50 hover:border-slate-300 shadow-sm backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Vorige
      </button>
      <div className="text-sm font-semibold text-slate-500 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
        Stap {activeIndex + 1} / {chapters.length}
      </div>
      <button
        type="button"
        onClick={goNext}
        disabled={activeIndex >= chapters.length - 1}
        className="px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 bg-gradient-to-r from-brikx-500 to-emerald-500 hover:from-brikx-600 hover:to-emerald-600 text-white shadow-xl shadow-brikx-500/30 hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Volgende →
      </button>
    </div>
  );
}