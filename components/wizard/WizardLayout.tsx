"use client";

import React, { useEffect, useMemo, useState } from "react";
import MobileChatInput from "./MobileChatInput";
import MobileExpertIndicator from "./MobileExpertIndicator";

import { useWizardState } from "@/lib/stores/useWizardState";
// @protected PREMIUM_F01_MODE_GATING
// useIsPremium hook is critical for premium mode gating throughout the wizard.
// DO NOT REMOVE: this is the primary entry point for premium feature access control.
import { useIsPremium } from "@/lib/stores/useAccountStore";
import type { ChapterKey, BasisData } from "@/types/project";
// @protected CHAT_F03_ONBOARDING
// ChatPanel is the primary chat interface component containing onboarding, message flow, and AI interaction.
// DO NOT REMOVE or replace: this is tracked in config/features.registry.json.
import ChatPanel from "@/components/chat/ChatPanel";
// @protected EXPERT_F01_CORE_COMPONENT
// ExpertCorner is the critical Expert Corner component that must always be present in the wizard layout.
// DO NOT REMOVE or replace with another component: this feature is tracked in the feature registry.
import ExpertCorner from "@/components/expert/ExpertCorner";
import { useSaveProject } from "@/lib/hooks/useSaveProject";

import Basis from "@/components/chapters/Basis";
import Ruimtes from "@/components/chapters/Ruimtes";
import Wensen from "@/components/chapters/Wensen";
import Budget from "@/components/chapters/Budget";
import Techniek from "@/components/chapters/Techniek";
import Duurzaamheid from "@/components/chapters/Duurzaamheid";
import Risico from "@/components/chapters/Risico";
import Preview from "@/components/chapters/Preview";

// @protected WIZARD_F01_CHAPTER_FLOW
// This DEFAULT_FLOW array defines the exact 7-chapter structure of the wizard.
// DO NOT MODIFY: changing this breaks the entire wizard flow and is tracked in the feature registry.
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
  const projectMeta = useWizardState((s) => s.projectMeta);
  const basisData = useWizardState((s) => s.chapterAnswers.basis as BasisData | undefined);
  const currentChapter = useWizardState((s) => s.currentChapter);
  const chapterFlow = useWizardState((s) => s.chapterFlow);
  const setChapterFlow = useWizardState((s) => s.setChapterFlow);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);

  const [showPreview, setShowPreview] = useState(false);

  // @protected PREMIUM_F01_MODE_GATING
  // @protected EXPERT_F01_CORE_COMPONENT
  // Premium mode detection and expertMode calculation are critical for feature gating.
  // DO NOT REMOVE: this wires premium mode into ExpertCorner and is tracked in the feature registry.
  // ✅ v3.10: Premium mode voor ExpertCorner
  const isPremium = useIsPremium();
  const expertMode = isPremium ? "PREMIUM" : "PREVIEW";

  const { handleSave, isSaving, authLoading } = useSaveProject();

  // Init flow & startchapter één keer
  useEffect(() => {
    if (!chapterFlow || chapterFlow.length === 0) {
      setChapterFlow(DEFAULT_FLOW);
      setCurrentChapter("basis");
    }
  }, [chapterFlow, setChapterFlow, setCurrentChapter]);

  const activeChapter: ChapterKey = (currentChapter as ChapterKey) || "basis";

  const ActiveComponent = useMemo(
    () => showPreview ? Preview : (CHAPTER_COMPONENTS[activeChapter] ?? Basis),
    [activeChapter, showPreview]
  );

  return (
    <div className="h-full w-full font-sans relative flex items-center justify-center transition-colors duration-500">

      {/* 1. Global Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-700 -z-10 bg-slate-200">
        <div className="absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob bg-brikx-400/30 mix-blend-multiply opacity-80"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50rem] h-[50rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 bg-blue-400/30 mix-blend-multiply opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
      </div>

      {/* 2. Main Dashboard Shell - Matches 'containerClass' from archive */}
      <div className="w-full h-full lg:max-w-[1800px] lg:h-[94vh] border lg:rounded-[2.5rem] relative z-10 flex flex-col lg:flex-row overflow-hidden transition-all duration-500 bg-white/40 border-white/40 shadow-2xl shadow-slate-400/20 backdrop-blur-[60px]">

        {/* Left: Chat Panel - 40% Width as requested */}
        <section className="
            absolute inset-0 z-50 lg:relative lg:z-30 
            hidden lg:flex flex-col
            lg:w-[35%] lg:min-w-[400px] lg:max-w-[800px] 
            bg-white/70 border-r border-white/60 backdrop-blur-2xl shadow-[20px_0_50px_-10px_rgba(148,163,184,0.3)]
        ">
          {/* @protected CHAT_F03_ONBOARDING */}
          <ChatPanel />
        </section>

        {/* Middle: Content Area - Matches 'contentPanelClass' */}
        <section className="flex-1 flex flex-col min-w-0 relative z-10 transition-colors duration-500 bg-white/30">

          {/* Top Toolbar */}
          <header className="h-20 px-8 flex items-center justify-between z-20 border-b transition-colors duration-500 border-white/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border backdrop-blur-sm bg-white/60 border-white/50 text-brikx-600 shadow-sm">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {basisData?.projectType || projectMeta?.projectType || "Nieuw Project"}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {basisData?.projectNaam || projectMeta?.projectNaam || "Naamloos Project"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {/* Expert Tips Toggle (Mobile/Tablet) */}
                <MobileExpertIndicator className="xl:hidden flex items-center justify-center p-2 rounded-lg text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors" />

                <button
                  onClick={handleSave}
                  disabled={isSaving || authLoading}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors text-slate-500 hover:text-brikx-600 hover:bg-white/60 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{isSaving ? "Even geduld..." : "Opslaan"}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 py-4 scroll-smooth z-0">
            <div className="max-w-3xl mx-auto pb-32 pt-4">
              <ActiveComponent />

              {/* Expert Corner moved back to sidebar */}
            </div>
          </div>

          {/* Bottom Action Bar (Sticky) */}
          <div className="fixed bottom-0 lg:absolute inset-x-0 p-4 lg:p-6 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between z-50 transition-all duration-500 bg-white/60 border-t border-white/40 gap-4">

            {/* Mobile Chat Input Integration */}
            <div className="w-full lg:hidden order-1">
              <MobileChatInput />
            </div>

            <div className="flex items-center justify-between w-full lg:w-auto gap-4 order-2 lg:order-1">
              <button
                onClick={() => {
                  const idx = chapterFlow?.indexOf(activeChapter) ?? -1;
                  if (idx > 0 && chapterFlow) {
                    setCurrentChapter(chapterFlow[idx - 1]);
                    setShowPreview(false);
                  }
                }}
                disabled={!chapterFlow || chapterFlow.indexOf(activeChapter) === 0}
                className="px-6 py-3 rounded-xl text-sm font-bold disabled:invisible transition-all border border-transparent text-slate-500 hover:text-brikx-600 hover:bg-white/60"
              >
                Vorige Stap
              </button>
              <button
                onClick={() => {
                  const idx = chapterFlow?.indexOf(activeChapter) ?? -1;
                  if (idx >= 0 && chapterFlow && idx < chapterFlow.length - 1) {
                    setCurrentChapter(chapterFlow[idx + 1]);
                    setShowPreview(false);
                  }
                }}
                className="px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group bg-slate-800 text-white shadow-slate-400/50 hover:bg-slate-900"
              >
                <span>Volgende Stap</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-white/20 group-hover:bg-white/30">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Right: Navigation Panel - Matches 'navPanelClass' */}
        <aside className="hidden xl:flex w-[260px] relative z-10 border-l transition-colors duration-500 bg-white/30 border-white/40 backdrop-blur-md flex-col min-h-0 gap-4 p-4">
          {/* Note: In the archive, this panel contained the Navigation.tsx. Here we adapted the existing navigation logic. */}
          {chapterFlow && chapterFlow.length > 0 && (
            <nav className="flex-shrink-0 space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 px-2">
                Overzicht
              </h3>
              {chapterFlow.map((ch, index) => {
                const isActive = activeChapter === ch && !showPreview;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      if (activeChapter !== ch) {
                        setCurrentChapter(ch);
                        setShowPreview(false);
                      }
                    }}
                    className={[
                      "relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg group",
                      isActive
                        ? "bg-white/60 border-l-4 border-brikx-500 text-slate-900 shadow-sm"
                        : "border-l-4 border-transparent text-slate-600 hover:bg-white/40 hover:text-slate-900",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold transition-colors",
                        isActive
                          ? "bg-brikx-500 text-white"
                          : "border border-slate-300 text-slate-400 group-hover:border-brikx-300 group-hover:text-brikx-500",
                      ].join(" ")}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-bold truncate">{CHAPTER_LABELS[ch] ?? ch}</span>
                  </button>
                );
              })}
              <div className="w-full h-px bg-slate-200/50 my-2" />
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={[
                  "relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg group",
                  showPreview
                    ? "bg-white/60 border-l-4 border-brikx-500 text-slate-900 shadow-sm"
                    : "border-l-4 border-transparent text-slate-600 hover:bg-white/40 hover:text-slate-900",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold transition-colors",
                    showPreview
                      ? "bg-brikx-500 text-white"
                      : "border border-slate-300 text-slate-400 group-hover:border-brikx-300 group-hover:text-brikx-500",
                  ].join(" ")}
                >
                  📋
                </div>
                <span className="text-sm font-bold truncate">Overzicht</span>
              </button>
            </nav>
          )}

          {/* Expert Corner restored to sidebar */}
          <div className="mt-auto border-t border-white/40 pt-4">
            <ExpertCorner mode={expertMode} />
          </div>
        </aside>

      </div>


    </div>
  );
}
