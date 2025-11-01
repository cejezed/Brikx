'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  const currentChapter = useWizardState((s: any) => s.currentChapter as ChapterKey | null);
  const goToChapter = useWizardState((s: any) => s.goToChapter as (ch: ChapterKey) => void);
  const chapterFlow = useWizardState((s: any) => s.chapterFlow as ChapterKey[] | null);

  // ============================================================
  // DYNAMISCHE TABS: strikt ChapterKey[], géén 'intake' hier!
  // ============================================================
  const tabs: ChapterTab[] = useMemo(() => {
    const titles: Record<ChapterKey, string> = {
      basis: 'Basisgegevens',
      wensen: 'Wensen',
      budget: 'Budget',
      ruimtes: 'Ruimtes',
      techniek: 'Techniek',
      duurzaamheid: 'Duurzaamheid',
      risico: "Risico's",
      preview: 'Preview',
    };
    const flow = Array.isArray(chapterFlow) ? (chapterFlow as ChapterKey[]) : [];
    return flow.map((ch) => ({ id: ch, title: titles[ch] ?? ch }));
  }, [chapterFlow]);

  // Active staat kan 'intake' of een ChapterKey zijn
  const [active, setActive] = useState<ActiveId>(currentChapter ?? 'intake');

  useEffect(() => {
    if (currentChapter && currentChapter !== active) setActive(currentChapter);
    if (!currentChapter && active !== 'intake') setActive('intake');
  }, [currentChapter, active]);

  // Handler voor tabklik (komt van ChapterTabs → altijd ChapterKey)
  const onTabChange = (id: ChapterKey) => {
    setActive(id);
    goToChapter(id);
  };

  // Handler voor mobiele select (kan ook 'intake' zijn)
  const onSelectChange = (id: string) => {
    if (id === 'intake') {
      setActive('intake');
      return;
    }
    // id moet nu een ChapterKey zijn
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
    duurzaamheid: Duurzaamheid,
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
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
        <div className="px-3 md:px-5 py-2">
          {/* Desktop: toon ChapterTabs alléén wanneer we niet in 'intake' zitten */}
          {active !== 'intake' && tabs.length > 0 && (
            <div className="hidden md:block">
              <ChapterTabs tabs={tabs} activeId={active as ChapterKey} onChange={onTabChange} />
            </div>
          )}

          {/* Mobiel: altijd een select met 'Start' + flowtabs */}
          <div className="md:hidden">
            <select
              className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm"
              value={active}
              onChange={(e) => onSelectChange(e.target.value)}
            >
              <option value="intake">1. Start</option>
              {tabs.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {active === 'intake' ? i + 2 : i + 1}. {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
            <WizardLayout left={left} middle={middle} right={right} />
          </div>
          <div className="hidden lg:flex flex-1"></div>
        </div>
      </div>

      <Footer />
    </ToastProvider>
  );
}
