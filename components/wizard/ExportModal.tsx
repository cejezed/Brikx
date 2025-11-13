// /components/wizard/ExportModal.tsx
"use client";

import React, { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { BasisData } from "@/types/project";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportModal({ open, onClose }: ExportModalProps) {
  // ⬇️ Losse selectors (geen object-literal → geen infinite loop)
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const stateVersion = useWizardState((s) => s.stateVersion);
  const setShowExportModal = useWizardState((s) => s.setShowExportModal);

  const canExport = useMemo(() => {
    // Heel lichtgewicht check: minimaal projectType bekend
    const basis = chapterAnswers?.basis as Partial<BasisData> | undefined;
    return typeof basis?.projectType === "string" && basis.projectType.length > 0;
  }, [chapterAnswers]);

  if (!open) return null;

  function handleClose() {
    // defensief aanroepen
    if (typeof setShowExportModal === "function") setShowExportModal(false);
    onClose?.();
  }

  function downloadJSON() {
    const payload = {
      version: stateVersion,
      exportedAt: new Date().toISOString(),
      data: chapterAnswers ?? {},
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brikx-wizard-export-v${stateVersion}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="w-[560px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4">
          <h2 id="export-modal-title" className="text-lg font-semibold text-slate-900">
            Exporteer uw PvE-gegevens
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            U exporteert de huidige ingevulde gegevens uit de wizard. U kunt dit bestand later
            weer importeren of delen voor review.
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>State-versie</span>
            <span className="font-mono text-slate-900">v{stateVersion}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Minimale validatie</span>
            <span className={canExport ? "text-green-600" : "text-amber-600"}>
              {canExport ? "Projecttype aanwezig" : "Projecttype ontbreekt (aanbevolen)"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Annuleren
          </button>
          <button
            onClick={downloadJSON}
            disabled={!canExport}
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              canExport ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-400 cursor-not-allowed"
            }`}
            type="button"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}
