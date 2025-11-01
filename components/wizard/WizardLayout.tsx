'use client';

import React from 'react';
import { useUiStore } from '@/lib/stores/useUiStore';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';

// Import chapter components
import Basis from '@/components/chapters/Basis';
import Wensen from '@/components/chapters/Wensen';
import Ruimtes from '@/components/chapters/Ruimtes';
import Budget from '@/components/chapters/Budget';
import Techniek from '@/components/chapters/Techniek';
import Duurzaamheid from '@/components/chapters/Duurzaamheid';
import Risico from '@/components/chapters/Risico';
import Preview from '@/components/chapters/Preview';

// Import layout components
import ChatPanel from '@/components/chat/ChatPanel';
import ExpertCorner from '@/components/expert/ExpertCorner';

interface WizardLayoutProps {
  left?: React.ReactNode;
  middle?: React.ReactNode;
  right?: React.ReactNode;
}

export default function WizardLayout({ left, middle, right }: WizardLayoutProps) {
  const currentChapter = useUiStore((s) => s.currentChapter);
  // Forceer lokale typezekerheid als ChapterKey[]
  const chapterFlow = useWizardState((s) => (s.chapterFlow as unknown as ChapterKey[]) ?? []);
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);

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
    <div className="min-h-screen px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[35%_45%_20%] gap-6 py-8">
        {/* LEFT COLUMN: Chat (35%) */}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {left || <ChatPanel />}
        </div>

        {/* MIDDLE COLUMN: Canvas (45%) */}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {middle ? (
            middle
          ) : (
            <div className="space-y-4">
              {/* Chapter tabs */}
              {chapterFlow.length > 0 && (
                <div className="flex gap-2 flex-wrap sticky top-0 bg-white py-3 border-b">
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

              {/* Current chapter content */}
              <div className="bg-white rounded-lg p-6">
                <CurrentChapterComponent />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Expert Corner (20%) */}
        <div className="hidden lg:block overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {right || <ExpertCorner />}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .grid { grid-template-columns: 1fr 1.5fr !important; }
        }
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr !important; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgb(209, 213, 219); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgb(156, 163, 175); }
      `}</style>
    </div>
  );
}
