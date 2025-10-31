'use client';

import React from 'react';
import useWizardState from '@/lib/stores/useWizardState';
import ChatPanel from '@/components/chat/ChatPanel';

// ⬇️ Chapters nu vanuit components/wizard/chapters/*
import Basis from '@/components/wizard/chapters/Basis';
import Budget from '@/components/wizard/chapters/Budget';
import Ruimtes from '@/components/wizard/chapters/Ruimtes';
import Wensen from '@/components/wizard/chapters/Wensen';
import Techniek from '@/components/wizard/chapters/Techniek';
import Duurzaamheid from '@/components/wizard/chapters/Duurzaamheid';
import Risico from '@/components/wizard/chapters/Risico';
import Preview from '@/components/wizard/chapters/Preview';

function ChapterView() {
  const current = useWizardState((s) => s.currentChapter);
  switch (current) {
    case 'basis': return <Basis />;
    case 'budget': return <Budget />;
    case 'ruimtes': return <Ruimtes />;
    case 'wensen': return <Wensen />;
    case 'techniek': return <Techniek />;
    case 'duurzaamheid': return <Duurzaamheid />;
    case 'risico': return <Risico />;
    case 'preview': return <Preview />;
    default: return <Basis />;
  }
}

/**
 * Layoutregels (belangrijk voor sticky input in ChatPanel):
 * - Linker paneel (wizard) mag scrollen: `overflow-auto`.
 * - Rechter paneel (chat) géén overflow op parent; ChatPanel beheert zijn eigen scroll + sticky.
 * - Gebruik overal `min-h-0` in flex/grid containers zodat sticky kan werken.
 */
export default function WizardRouter() {
  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_38rem] gap-4">
      <div className="min-h-0 overflow-auto rounded-2xl border bg-white">
        <ChapterView />
      </div>

      <div className="min-h-0">
        <ChatPanel />
      </div>
    </div>
  );
}
