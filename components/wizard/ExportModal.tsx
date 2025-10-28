"use client";

import { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { buildPreview } from "@/lib/preview/buildPreview";
import { printPreviewToPdf } from "@/lib/export/print";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportModal() {
  // 🔒 Hooks: ALTIJD zelfde volgorde en aantal aanroepen
  const open = useWizardState((s) => s.showExportModal);
  const setOpen = useWizardState((s) => s.setShowExportModal);
  const triage = useWizardState((s) => s.triage);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);

  // Deze hook moet óók worden aangeroepen als open=false, dus vóór de early return.
  const preview = useMemo(() => buildPreview({ triage, chapterAnswers }), [triage, chapterAnswers]);

  // Nu pas de early return. Hooks-orde blijft identiek over renders.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <header className="px-5 py-4 border-b">
          <h3 className="text-base font-semibold">Exporteren</h3>
          <p className="text-xs text-gray-600">
            Kies een formaat. PDF gebruikt je browser (Print naar PDF).
          </p>
        </header>

        <div className="p-5 text-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded p-3">
              <div className="font-medium">PDF</div>
              <p className="text-xs text-gray-600">
                We openen een geformatteerde weergave en starten meteen “Print”. Kies daar “Opslaan als PDF”.
              </p>
              <button
                type="button"
                className="mt-2 px-3 py-2 rounded bg-black text-white"
                onClick={() => printPreviewToPdf(preview)}
              >
                Download als PDF
              </button>
            </div>

            <div className="border rounded p-3">
              <div className="font-medium">JSON</div>
              <p className="text-xs text-gray-600">Ruwe data voor verdere verwerking of integratie.</p>
              <button
                type="button"
                className="mt-2 px-3 py-2 rounded border"
                onClick={() => downloadJson("brikx-pve.json", preview)}
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>

        <footer className="px-5 py-4 border-t flex items-center gap-3">
          <button type="button" className="px-3 py-2 rounded border" onClick={() => setOpen(false)}>
            Sluiten
          </button>
        </footer>
      </div>
    </div>
  );
}
