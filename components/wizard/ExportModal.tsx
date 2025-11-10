'use client';

import React from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ProjectType } from '@/types/wizard';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  const triage = useWizardState((s) => s.triage);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);

  if (!open) return null;

  const payload = {
    projectType: triage?.projectType as ProjectType | undefined,
    urgency: triage?.urgency || triage?.urgentie,
    budget: triage?.budget,
    triage,
    chapterAnswers,
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brikx-pve-export.json';
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 mb-2">
          <h2 className="text-lg font-semibold">
            Exporteer jouw Programma van Eisen
          </h2>
          <p className="text-sm text-slate-600">
            Je export bevat je projectbasis, wensen, budget en risico-indicaties.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          <pre className="max-h-64 overflow-y-auto rounded-md bg-slate-50 p-3 text-[10px] text-slate-700">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-xs border border-slate-300"
          >
            Annuleer
          </button>
          <button
            onClick={handleDownload}
            className="rounded-xl px-3 py-2 text-xs bg-slate-900 text-white"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
