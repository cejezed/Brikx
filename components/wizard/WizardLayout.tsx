'use client';

import React from 'react';
import { useUiStore } from '@/lib/stores/useUiStore';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';

import Basis from '@/components/chapters/Basis';
import Wensen from '@/components/chapters/Wensen';
import Ruimtes from '@/components/chapters/Ruimtes';
import Budget from '@/components/chapters/Budget';
import Techniek from '@/components/chapters/Techniek';
import Duurzaamheid from '@/components/chapters/Duurzaamheid';
import Risico from '@/components/chapters/Risico';
import Preview from '@/components/chapters/Preview';

import ChatPanel from '@/components/chat/ChatPanel';
import ExpertCorner from '@/components/expert/ExpertCorner';

const EMPTY_CHAPTER_FLOW: readonly ChapterKey[] = Object.freeze([]);

const chapterComponents: Record<ChapterKey, React.ComponentType<any>> = {
  basis: Basis,
  wensen: Wensen,
  ruimtes: Ruimtes,
  budget: Budget,
  techniek: Techniek,
  duurzaam: Duurzaamheid,
  risico: Risico,
  preview: Preview,
};

export default function WizardLayout() {
  const currentChapter = useUiStore((s) => s.currentChapter);
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);

  const rawChapterFlow = useWizardState(
    (s) => s.chapterFlow as ChapterKey[] | undefined,
  );
  const chapterFlow = rawChapterFlow ?? EMPTY_CHAPTER_FLOW;

  const CurrentChapterComponent =
    (currentChapter && chapterComponents[currentChapter]) || Basis;

  return (
    <div className="min-h-screen grid grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.4fr)_minmax(260px,0.7fr)] gap-4">
      {/* LEFT: Chat */}
      <div className="h-full">
        <ChatPanel />
      </div>

      {/* MIDDLE: Hoofdstukken */}
      <div className="flex flex-col h-full">
        {chapterFlow.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {chapterFlow.map((ch) => (
              <button
                key={ch}
                onClick={() => setCurrentChapter(ch)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  currentChapter === ch
                    ? 'bg-[#0d3d4d] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ch.charAt(0).toUpperCase() + ch.slice(1).replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 rounded-2xl bg-white shadow-sm border border-slate-100 p-4 overflow-y-auto">
          <CurrentChapterComponent />
        </div>
      </div>

      {/* RIGHT: ExpertCorner met save-knop onderin */}
      <div className="h-full">
        <ExpertCorner />
      </div>
    </div>
  );
}
