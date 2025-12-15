"use client";

import React, { useEffect, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import GlobalProgressBar from "./GlobalProgressBar";
import DocumentOverview from "./DocumentOverview";
import ActiveWizardCard from "./ActiveWizardCard";
import ChatFeed from "./ChatFeed";
import MobileChatInput from "@/components/wizard/MobileChatInput";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default function MobileWizardLayout() {
  const isMobile = useIsMobile();
  const [showOverview, setShowOverview] = useState(false);
  const currentChapter = useWizardState((s) => s.currentChapter);

  if (!isMobile) {
    // safeguard: render nothing, desktop layout neemt over
    return null;
  }

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sticky progress */}
      <div className="sticky top-0 z-40 p-3 pb-2 bg-gradient-to-b from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent shadow-sm">
        <GlobalProgressBar onOpenOverview={() => setShowOverview(true)} />
      </div>

      {/* Content area with constrained scroll */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 px-3 pb-[140px]">
        <div className="flex-1 min-h-0">
          <div className="h-full max-h-[45vh] min-h-[180px]">
            <ChatFeed className="h-full" />
          </div>
        </div>

        <div className="flex-shrink-0">
          <ActiveWizardCard key={currentChapter} />
        </div>
      </div>

      {/* Fixed input with safe padding accounted for above via pb-[140px] */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <MobileChatInput />
      </div>

      {showOverview && <DocumentOverview onClose={() => setShowOverview(false)} />}
    </div>
  );
}
