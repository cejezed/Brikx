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
    <div className="min-h-[100dvh] w-full flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="p-3 pb-2">
        <GlobalProgressBar onOpenOverview={() => setShowOverview(true)} />
      </div>

      <div className="flex-1 flex flex-col gap-3 px-3 pb-28">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatFeed />
        </div>

        <ActiveWizardCard key={currentChapter} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <MobileChatInput />
      </div>

      {showOverview && <DocumentOverview onClose={() => setShowOverview(false)} />}
    </div>
  );
}
