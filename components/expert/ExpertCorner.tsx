'use client';

import React, { useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import ExportModal from '@/components/wizard/ExportModal';

export default function ExpertCorner() {
  const triage = useWizardState((s) => s.triage);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const [open, setOpen] = useState(false);

  const hasContent =
    (triage && Object.keys(triage).length > 0) ||
    (chapterAnswers && Object.keys(chapterAnswers).length > 0);

  return (
    <>
      <aside className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
        {/* Header */}
        <div className="flex-shrink-0 mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Expert corner
          </div>
          <div className="text-xs text-slate-700">
            Korte checks & tips op basis van jouw input.
          </div>
        </div>

        {/* Scrollbare inhoud */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700">
          {hasContent ? (
            <>
              <p>✓ We bouwen live mee aan je Programma van Eisen.</p>
              <p>✓ Antwoorden uit de chat vullen direct deze samenvatting.</p>
              <p>✓ Klaar of wil je delen met architect/aannemer/gemeente?</p>
            </>
          ) : (
            <p className="text-slate-500">
              Start links in de wizard of in de chat. Hier verschijnen straks
              samenvattingen, risico’s en export-opties.
            </p>
          )}
        </div>

        {/* Footer met vaste save/export-knop */}
        <div className="flex-shrink-0 pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-medium text-slate-600">
              PvE opslaan of delen
            </div>
            <div className="text-[9px] text-slate-400">
              Exporteer als JSON wanneer jij er klaar voor bent.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-2 text-[10px] rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Opslaan &amp; export
          </button>
        </div>
      </aside>

      <ExportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
