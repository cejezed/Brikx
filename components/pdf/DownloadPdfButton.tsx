"use client";

import React, { useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { WizardState } from "@/types/project";

type DownloadPdfButtonProps = {
  label?: string;
  className?: string;
};

function buildWizardSnapshot(state: WizardState): Partial<WizardState> {
  return {
    stateVersion: state.stateVersion,
    chapterAnswers: state.chapterAnswers,
    currentChapter: state.currentChapter,
    chapterFlow: state.chapterFlow,
    mode: state.mode,
  };
}

export default function DownloadPdfButton({
  label = "Download PvE als PDF",
  className = "",
}: DownloadPdfButtonProps) {
  const wizardState = useWizardState((s) => s as WizardState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setLoading(true);

    try {
      const snapshot = buildWizardSnapshot(wizardState);

      const res = await fetch("/api/pdf", {
        // ⚠️ Pas dit pad aan naar jouw daadwerkelijke export-endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wizardState: snapshot }),
      });

      if (!res.ok) {
        throw new Error(
          `PDF generatie mislukt (${res.status} ${res.statusText})`
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Brikx-PvE.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("[DownloadPdfButton] error", e);
      setError(
        e?.message ||
          "Er ging iets mis bij het genereren van de PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "PDF genereren..." : label}
      </button>
      {error && (
        <p className="text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
