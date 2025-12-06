"use client";

import React, { useEffect, useMemo, useState } from "react";
import MobileChatInput from "./MobileChatInput";
import { useWizardState } from "@/lib/stores/useWizardState";
// @protected PREMIUM_F01_MODE_GATING
// useIsPremium hook is critical for premium mode gating throughout the wizard.
// DO NOT REMOVE: this is the primary entry point for premium feature access control.
import { useIsPremium } from "@/lib/stores/useAccountStore";
import type { ChapterKey } from "@/types/project";
// @protected CHAT_F03_ONBOARDING
// ChatPanel is the primary chat interface component containing onboarding, message flow, and AI interaction.
// DO NOT REMOVE or replace: this is tracked in config/features.registry.json.
import ChatPanel from "@/components/chat/ChatPanel";
// @protected EXPERT_F01_CORE_COMPONENT
// ExpertCorner is the critical Expert Corner component that must always be present in the wizard layout.
// DO NOT REMOVE or replace with another component: this feature is tracked in the feature registry.
import ExpertCorner from "@/components/expert/ExpertCorner";

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
    <div className="h-full flex flex-col xl:grid xl:grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.4fr)_minmax(260px,0.7fr)] gap-0 xl:gap-4 relative">
      {/* @protected CHAT_F03_ONBOARDING */}
      {/* ChatPanel MUST be present in the layout - it contains the primary chat interface. */}
      {/* DO NOT REMOVE: this is the call-site for CHAT_F03_ONBOARDING and related chat features. */}
      {/* Links: Chat - Hidden on mobile, always visible on desktop */}
      <section className="hidden xl:flex xl:row-start-1 xl:col-start-1 flex-col min-h-0">
        <ChatPanel />
      </section>

      {/* Midden: hoofdstukken - Always visible */}
      <section className="flex-1 min-h-0 flex flex-col xl:row-start-1 xl:col-start-2">
        {/* Content - ALLEEN DEZE SCROLLT - Extra padding bottom on mobile for chat input */}
        <div className="flex-1 min-h-0 xl:rounded-2xl bg-white xl:shadow-sm xl:border border-slate-100 p-4 overflow-y-auto pb-[140px] xl:pb-4">
          <ActiveComponent />
        </div>
      </section>

      {/* @protected EXPERT_F01_CORE_COMPONENT */}
      {/* ExpertCorner MUST be present in the wizard layout sidebar with mode prop. */}
      {/* DO NOT REMOVE or replace: this is the critical call-site for Expert Corner features. */}
      {/* Rechts: Navigation + ExpertCorner - Hidden on mobile, always visible on desktop */}
      <aside className="hidden xl:flex xl:row-start-1 xl:col-start-3 flex-col min-h-0 gap-4">
        {/* Vertical Navigation */}
        {chapterFlow && chapterFlow.length > 0 && (
          <nav className="flex-shrink-0 glass-light-strong rounded-2xl glass-shadow p-4 space-y-1.5">
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
            {/* Overzicht button */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={[
                "relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg mt-2 border",
                showPreview
                  ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                  : "bg-white/40 text-blue-600 border-blue-200 hover:bg-blue-50",
              ].join(" ")}
            >
              <span className="text-sm font-bold">📋 Overzicht</span>
            </button>
          </nav>
        )}

        <ExpertCorner mode={expertMode} />
      </aside>

      {/* Mobile Chat Input with Expert and Save buttons */}
      <MobileChatInput />
    </div>
  );
}
