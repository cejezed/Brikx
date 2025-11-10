// app/wizard/page.tsx - FIXED INFINITE LOOP
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import WizardLayout from '@/components/wizard/WizardLayout';
import ChapterTabs, { type ChapterTab } from '@/components/wizard/ChapterTabs';
import { ToastProvider } from '@/components/ui/use-toast';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';
import Header from "@/components/Header";
import BrikxHero from "@/components/HeroWizard";
import Footer from "@/components/Footer";

// Lazy load chapters
const IntakeForm = dynamic(() => import('@/components/intake/IntakeForm'), { ssr: false });
const Basis = dynamic(() => import('@/components/chapters/Basis'), { ssr: false });
const Wensen = dynamic(() => import('@/components/chapters/Wensen'), { ssr: false });
const Ruimtes = dynamic(() => import('@/components/chapters/Ruimtes'), { ssr: false });
const Budget = dynamic(() => import('@/components/chapters/Budget'), { ssr: false });
const Techniek = dynamic(() => import('@/components/chapters/Techniek'), { ssr: false });
const Duurzaamheid = dynamic(() => import('@/components/chapters/Duurzaamheid'), { ssr: false });
const Risico = dynamic(() => import('@/components/chapters/Risico'), { ssr: false });
const Preview = dynamic(() => import('@/components/chapters/Preview'), { ssr: false });
const ChatPanel = dynamic(() => import('@/components/chat/ChatPanel'), { ssr: false });
const ExpertCorner = dynamic(() => import('@/components/expert/ExpertCorner'), { ssr: false });

class Boundary extends React.Component<{ label: string; children: React.ReactNode }, { err?: string }> {
  state = { err: undefined as string | undefined };
  static getDerivedStateFromError(e: any) { return { err: e?.message || 'Onbekende fout' }; }
  render() {
    if (this.state.err) {
      return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <strong>{this.props.label} crashte:</strong> {this.state.err}
      </div>;
    }
    return this.props.children;
  }
}

type ActiveId = 'intake' | ChapterKey;

export default function WizardPage() {
  const currentChapter = useWizardState((s) => s.currentChapter as ChapterKey | null);
  const chapterFlow = useWizardState((s) => s.chapterFlow as ChapterKey[] | undefined);
  
  // 🆕 FIX: Use ref to prevent infinite loop
  const goToChapterRef = useRef(useWizardState.getState().goToChapter);

  // ============================================================
  // DYNAMISCHE TABS: gebruik chapterFlow uit store!
  // ============================================================
  const tabs: ChapterTab[] = useMemo(() => {
    const titles: Record<ChapterKey, string> = {
      basis: 'Basisgegevens',
      wensen: 'Wensen',
      budget: 'Budget',
      ruimtes: 'Ruimtes',
      techniek: 'Techniek',
      duurzaam: 'Duurzaamheid',
      risico: 'Risicos',
      preview: 'Preview',
    };

    if (!chapterFlow || chapterFlow.length === 0) {
      return [];
    }

    return chapterFlow.map((ch) => ({ id: ch, title: titles[ch] ?? ch }));
  }, [chapterFlow]);

  // Active staat - initialiseer slim
  const [active, setActive] = useState<ActiveId>(() => {
    if (!chapterFlow || chapterFlow.length === 0) {
      return 'intake';
    }
    return currentChapter ?? chapterFlow[0];
  });

  // 🆕 FIX: Simplified effect - alleen wanneer chapterFlow ECHT verandert
  const hasNavigatedRef = useRef(false);
  
  useEffect(() => {
    if (chapterFlow && chapterFlow.length > 0 && active === 'intake' && !hasNavigatedRef.current) {
      const firstChapter = chapterFlow[0];
      setActive(firstChapter);
      goToChapterRef.current(firstChapter);
      hasNavigatedRef.current = true;
    }
  }, [chapterFlow]); // 🆕 Alleen chapterFlow als dependency!

  // Sync active met currentChapter
  useEffect(() => {
    if (currentChapter && currentChapter !== active && active !== 'intake') {
      setActive(currentChapter);
    }
  }, [currentChapter]); // 🆕 Alleen currentChapter als dependency!

  // Handler voor tabklik
  const onTabChange = (id: ChapterKey) => {
    setActive(id);
    goToChapterRef.current(id);
  };

  // Handler voor mobiele select
  const onSelectChange = (id: string) => {
    if (id === 'intake') {
      setActive('intake');
      return;
    }
    onTabChange(id as ChapterKey);
  };

  const activeIndex = useMemo(
    () => (active === 'intake' ? -1 : Math.max(0, tabs.findIndex((t) => t.id === active))),
    [active, tabs]
  );

  // Chapter component map
  const chapterMap: Record<ActiveId, React.ComponentType<any>> = {
    intake: IntakeForm,
    basis: Basis,
    wensen: Wensen,
    ruimtes: Ruimtes,
    budget: Budget,
    techniek: Techniek,
    duurzaam: Duurzaamheid,
    risico: Risico,
    preview: Preview,
  };

  const ActiveChapter = chapterMap[active] || IntakeForm;

  // Linkerkolom: Chat
  const left = (
    <Boundary label="ChatPanel">
      <ChatPanel />
    </Boundary>
  );

  // Middenkolom: Tabs + Content
  const middle = (
    <div className="space-y-4">
      {/* Debug info (alleen in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2">
          <strong>Debug:</strong> chapterFlow: {chapterFlow?.join(', ') || 'not set'} | 
          active: {active} | tabs: {tabs.length}
        </div>
      )}

      {/* Tabs - ALLEEN tonen als chapterFlow gezet is */}
      {tabs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
          <div className="px-3 md:px-5 py-2">
            {/* Desktop tabs */}
            {active !== 'intake' && (
              <div className="hidden md:block">
                <ChapterTabs tabs={tabs} activeId={active as ChapterKey} onChange={onTabChange} />
              </div>
            )}

            {/* Mobiel select */}
            <div className="md:hidden">
              <select
                className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm"
                value={active}
                onChange={(e) => onSelectChange(e.target.value)}
              >
                <option value="intake">1. Start</option>
                {tabs.map((t, i) => (
                  <option key={t.id} value={t.id}>
                    {i + 2}. {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
        <div className="p-4 md:p-6" id={`panel-${active}`}>
          {active === 'intake' ? (
            <>
              <h1 className="text-lg md:text-xl font-semibold mb-3">Brikx Wizard</h1>
              <p className="text-sm text-gray-600 mb-4">
                Kies eerst je projectvariant. Daarna verschijnen de vervolgstappen.
              </p>
              <Boundary label="IntakeForm">
                <ActiveChapter />
              </Boundary>
            </>
          ) : (
            <>
              <h2 className="text-base md:text-lg font-semibold mb-3">
                {activeIndex >= 0 && tabs[activeIndex] ? tabs[activeIndex].title : 'Hoofdstuk'}
              </h2>
              <Boundary label={active}>
                <ActiveChapter />
              </Boundary>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Rechterkolom: Expert Corner
  const right = (
    <Boundary label="ExpertCorner">
      <ExpertCorner />
    </Boundary>
  );

  return (
    <ToastProvider>
      <Header />
      <BrikxHero />

      <div className="bg-white min-h-screen">
        <div className="flex min-h-screen">
          <div className="hidden lg:flex flex-1"></div>
          <div className="w-full lg:w-[1552px] bg-gradient-to-b from-[#e7f3f4] to-[#e7f3f3]">
            <WizardLayout  />
          </div>
          <div className="hidden lg:flex flex-1"></div>
        </div>
      </div>

      <Footer />
    </ToastProvider>
  );
}