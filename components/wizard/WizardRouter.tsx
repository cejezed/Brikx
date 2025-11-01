'use client';
import React from 'react';
import { useUiStore } from '@/lib/stores/useUiStore';
import ChatPanel from '@/components/chat/ChatPanel';
import type { ChapterKey } from '@/lib/stores/useWizardState';

// ✅ Corrected import paths (removed /wizard/ prefix)
import Basis from '@/components/chapters/Basis';
import Budget from '@/components/chapters/Budget';
import Ruimtes from '@/components/chapters/Ruimtes';
import Wensen from '@/components/chapters/Wensen';
import Techniek from '@/components/chapters/Techniek';
import Duurzaamheid from '@/components/chapters/Duurzaamheid';
import Risico from '@/components/chapters/Risico';
import Preview from '@/components/chapters/Preview';

function ChapterView({ chapter }: { chapter: ChapterKey }) {
  const map: Record<ChapterKey, React.ReactElement> = {
    basis: <Basis />,
    budget: <Budget />,
    ruimtes: <Ruimtes />,
    wensen: <Wensen />,
    techniek: <Techniek />,
    duurzaamheid: <Duurzaamheid />,
    risico: <Risico />,
    preview: <Preview />,
  };
  return map[chapter] ?? <Basis />;
}

export default function WizardRouter() {
  // ✅ Use useUiStore for current chapter navigation
  const current = useUiStore((s) => s.currentChapter);

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_38rem] gap-4">
      <div className="min-h-0 overflow-auto rounded-2xl border bg-white">
        <ChapterView chapter={current} />
      </div>
      <div className="min-h-0">
        <ChatPanel />
      </div>
    </div>
  );
}