"use client";

import React, { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useUiStore } from "@/lib/stores/useUiStore";
import ChatPanel from "@/components/chat/ChatPanel";

import Basis from "@/components/chapters/Basis";
import Wensen from "@/components/chapters/Wensen";
import Ruimtes from "@/components/chapters/Ruimtes";
import Budget from "@/components/chapters/Budget";
import Techniek from "@/components/chapters/Techniek";
import Duurzaamheid from "@/components/chapters/Duurzaamheid";
import Risico from "@/components/chapters/Risico";
import Preview from "@/components/chapters/Preview";

// Lokale definitie: we willen hier alleen de namen die we daadwerkelijk routen.
// Niet koppelen aan types/chat of types/wizard om cross-import ellende te voorkomen.
type UiChapterKey =
  | "basis"
  | "wensen"
  | "ruimtes"
  | "budget"
  | "techniek"
  | "duurzaam"
  | "risico"
  | "preview"
  | (string & {});

const CHAPTER_COMPONENTS: Partial<Record<UiChapterKey, React.ComponentType>> = {
  basis: Basis,
  wensen: Wensen,
  ruimtes: Ruimtes,
  budget: Budget,
  techniek: Techniek,
  duurzaam: Duurzaamheid,
  risico: Risico,
  preview: Preview,
};

export default function WizardRouter() {
  const chapterFlow = useWizardState((s) => s.chapterFlow) ?? [];
  const currentChapterFromState = useWizardState((s) => s.currentChapter);
  const triage = useWizardState((s) => s.triage);
  const setCurrentChapterUi = useUiStore((s) => s.setCurrentChapter);

  const activeChapter: UiChapterKey = useMemo(() => {
    // 1) expliciet vanuit wizardState
    if (
      currentChapterFromState &&
      typeof currentChapterFromState === "string"
    ) {
      return currentChapterFromState as UiChapterKey;
    }

    // 2) triage.currentChapter als fallback
    if (triage?.currentChapter && typeof triage.currentChapter === "string") {
      return triage.currentChapter as UiChapterKey;
    }

    // 3) eerste chapter uit flow
    if (Array.isArray(chapterFlow) && chapterFlow.length > 0) {
      return chapterFlow[0] as UiChapterKey;
    }

    // 4) default
    return "basis";
  }, [currentChapterFromState, triage?.currentChapter, chapterFlow]);

  // UI-store sync (breadcrumbs / focus / etc.)
  if (setCurrentChapterUi) {
    // cast naar any om het verschil tussen types/chat en types/wizard niet hier te laten ontploffen
    setCurrentChapterUi(activeChapter as any);
  }

  const ActiveComponent =
    CHAPTER_COMPONENTS[activeChapter] ??
    CHAPTER_COMPONENTS["basis"] ??
    Basis;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(420px,1.2fr)] gap-6 max-w-7xl mx-auto">
      <div className="min-h-[480px]">
        <ActiveComponent />
      </div>
      <div className="min-h-[480px]">
        <ChatPanel />
      </div>
    </div>
  );
}
