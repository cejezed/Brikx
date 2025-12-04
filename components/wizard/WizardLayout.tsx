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
        {/* Tabs - Horizontally scrollable */}
        {chapterFlow && chapterFlow.length > 0 && (
          <nav className="flex-shrink-0 bg-white/95 backdrop-blur px-1 pt-2 pb-2 pr-4 flex gap-2 overflow-x-auto border-b border-slate-100 scrollbar-hide">
            {chapterFlow.map((ch) => (
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
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0",
                  activeChapter === ch && !showPreview
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                {CHAPTER_LABELS[ch] ?? ch}
              </button>
            ))}
            {/* Overzicht knop - Preview van alle ingevulde data */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0 border",
                showPreview
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50",
              ].join(" ")}
            >
              Overzicht
            </button>
          </nav>
        )}

        {/* Content - ALLEEN DEZE SCROLLT - Extra padding bottom on mobile for chat input */}
        <div className="mt-0 xl:mt-3 flex-1 min-h-0 xl:rounded-2xl bg-white xl:shadow-sm xl:border border-slate-100 p-4 overflow-y-auto pb-[140px] xl:pb-4">
          <ActiveComponent />
        </div>
      </section>

      {/* @protected EXPERT_F01_CORE_COMPONENT */}
      {/* ExpertCorner MUST be present in the wizard layout sidebar with mode prop. */}
      {/* DO NOT REMOVE or replace: this is the critical call-site for Expert Corner features. */}
      {/* Rechts: ExpertCorner - Hidden on mobile, always visible on desktop */}
      <aside className="hidden xl:flex xl:row-start-1 xl:col-start-3 flex-col min-h-0">
        <ExpertCorner mode={expertMode} />
      </aside>

      {/* Mobile Chat Input with Expert and Save buttons */}
      <MobileChatInput />
    </div>
  );
}
