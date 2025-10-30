'use client';

import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';
import { useState, useEffect } from 'react';

// Import chapter components
import Basis from '@/components/chapters/Basis';
import Wensen from '@/components/chapters/Wensen';
import Ruimtes from '@/components/chapters/Ruimtes';
import Budget from '@/components/chapters/Budget';
import Techniek from '@/components/chapters/Techniek';
import Duurzaamheid from '@/components/chapters/Duurzaamheid';
import Risico from '@/components/chapters/Risico';
import Preview from '@/components/chapters/Preview';
import { useUiStore } from '@/lib/stores/useUiStore';

// Import layout components
import ChatPanel from '@/components/chat/ChatPanel';
import ExpertCorner from '@/components/expert/ExpertCorner';

export default function WizardRouter() {
const currentChapter = useUiStore((s) => s.currentChapter);
  const chapterFlow = useWizardState((s) => s.chapterFlow);
const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const chapterComponents: Record<ChapterKey, React.ComponentType<any>> = {
    basis: Basis,
    wensen: Wensen,
    ruimtes: Ruimtes,
    budget: Budget,
    techniek: Techniek,
    duurzaamheid: Duurzaamheid,
    risico: Risico,
    preview: Preview,
  };

  const CurrentChapterComponent = chapterComponents[currentChapter] || Basis;

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* LEFT: Chat (35%) */}
      <div className="w-[35%] border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
        <ChatPanel />
      </div>

      {/* CENTER: Canvas (50%) */}
      <div className="w-[50%] flex flex-col overflow-hidden">
        {/* Chapter tabs */}
        {chapterFlow && chapterFlow.length > 0 && (
          <div className="border-b border-gray-200 bg-white px-6 py-3 overflow-x-auto">
            <div className="flex gap-2 flex-nowrap">
              {chapterFlow.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setCurrentChapter(ch as ChapterKey)}
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
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <CurrentChapterComponent />
          </div>
        </div>
      </div>

      {/* RIGHT: Expert Corner (15%) */}
      <div className="w-[15%] border-l border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
        <ExpertCorner />
      </div>
    </div>
  );
}