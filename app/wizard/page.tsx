// app/wizard/page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WizardLayout from '@/components/wizard/WizardLayout';
import ChapterTabs, { type ChapterTab } from '@/components/wizard/ChapterTabs';
import { ToastProvider } from '@/components/ui/use-toast';
import { useWizardState } from '@/lib/stores/useWizardState';
import Header from "@/components/Header";
import BrikxHero from "@/components/HeroWizard";
import Footer from "@/components/Footer";

// Lazy
const IntakeForm = dynamic(() => import('@/components/intake/IntakeForm'), { ssr: false });
const WizardRouter = dynamic(() => import('@/components/wizard/WizardRouter'), { ssr: false });
const ChatPanel = dynamic(() => import('@/components/chat/ChatPanel'), { ssr: false });
const ExpertCorner = dynamic(() => import('@/components/expert/ExpertCorner'), { ssr: false });

// Fallback boundary
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

export default function WizardPage() {
  const currentChapter = useWizardState((s: any) => s.currentChapter);
  const goToChapter = useWizardState((s: any) => s.goToChapter);

  const tabs: ChapterTab[] = [
    { id: 'intake',       title: 'Start' },
    { id: 'basis',        title: 'Basisgegevens' },
    { id: 'wensen',       title: 'Wensen' },
    { id: 'budget',       title: 'Budget' },
    { id: 'ruimtes',      title: 'Ruimtes' },
    { id: 'techniek',     title: 'Techniek' },
    { id: 'duurzaamheid', title: 'Duurzaamheid' },
    { id: 'risico',       title: "Risico's" },
    { id: 'preview',      title: 'Preview' },
  ];

  const [active, setActive] = useState<string>(currentChapter ?? tabs[0].id);

  // store → UI
  useEffect(() => {
    if (currentChapter && currentChapter !== active) setActive(currentChapter);
  }, [currentChapter]);

  // UI → store
  const onTabChange = (id: string) => {
    setActive(id);
    goToChapter(id);
  };

  const activeIndex = useMemo(
    () => Math.max(0, tabs.findIndex((t) => t.id === active)),
    [active, tabs]
  );

  // Linkerkolom (ongewijzigd)
  const left = (
    <Boundary label="ChatPanel">
      <ChatPanel />
    </Boundary>
  );

  // Middenkolom – compacter: 1 kaart, geen dubbele borders/strepen
  const middle = (
    <div className="space-y-4">
      {/* Tabs BOVENAAN in de middenkolom en altijd volledig zichtbaar (wrap) */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
        <div className="px-3 md:px-5 py-2">
          <div className="hidden md:block">
            <ChapterTabs tabs={tabs} activeId={active} onChange={onTabChange} />
          </div>
          <div className="md:hidden">
            <select
              className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm"
              value={active}
              onChange={(e) => onTabChange(e.target.value)}
            >
              {tabs.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {i + 1}. {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inhoud – 1 enkele kaart, geen extra binnenkaders */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
        <div className="p-4 md:p-6" id={`panel-${active}`}>
          {active === 'intake' ? (
            <>
              <h1 className="text-lg md:text-xl font-semibold mb-3">Brikx Wizard</h1>
              <p className="text-sm text-gray-600 mb-4">
                Kies eerst je projectvariant. Daarna verschijnen de vervolgstappen.
              </p>
              <Boundary label="IntakeForm">
                <IntakeForm />
              </Boundary>
            </>
          ) : (
            <>
              <h2 className="text-base md:text-lg font-semibold mb-3">{tabs[activeIndex].title}</h2>
              <Boundary label="WizardRouter">
                <WizardRouter activeId={active} onChange={onTabChange} />
              </Boundary>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const right = (
    <Boundary label="ExpertCorner">
      <ExpertCorner />
    </Boundary>
  );

  return (
    <ToastProvider>
      <Header />
      <BrikxHero />
      
      {/* Wizard - Witte zijkanten, groene 1600px midden */}
      <div className="bg-white min-h-screen">
        <div className="flex min-h-screen">
          {/* Witte zijbalk links */}
          <div className="hidden lg:flex flex-1"></div>
          
          {/* Groene 1600px midden */}
          <div className="w-full lg:w-[1552px] bg-gradient-to-b from-[#e7f3f4] to-[#e7f3f3]">
            <WizardLayout left={left} middle={middle} right={right} />
          </div>
          
          {/* Witte zijbalk rechts */}
          <div className="hidden lg:flex flex-1"></div>
        </div>
      </div>
      
      <Footer />
    </ToastProvider>
  );
}