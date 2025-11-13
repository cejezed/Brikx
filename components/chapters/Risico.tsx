// /components/chapters/Risico.tsx
// ✅ v3.0 Conform: Leest RisicoData en gebruikt updateChapterData.

'use client';

import React, { useMemo, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useToast as useRealToast } from '@/components/ui/toast';
// ✅ v3.0: Importeer de *echte* scanfunctie
import { scan } from '@/lib/risk/scan'; 
import type { Risk } from '@/types/project';

/** -------------------------------------------
 * UI-laag
 * ------------------------------------------- */

function RisicoUI({ toast }: { toast: (o: { variant?: string; title?: string; description?: string }) => void }) {
  // ✅ v3.0: Lees de *volledige* state voor de scanfunctie
  const allAnswers = useWizardState((s) => s.chapterAnswers);
  // ✅ v3.0: Lees de specifieke data voor weergave
  const risicoData = useWizardState((s) => s.chapterAnswers.risico);
  // ✅ v3.0: Haal de *correcte* mutatie-functie op
  const updateChapterData = useWizardState((s) => s.updateChapterData);

  const [busy, setBusy] = useState(false);

  // ✅ v3.0: Lees de 'risks' array uit de state
  const risks: Risk[] = useMemo(() => risicoData?.risks ?? [], [risicoData]);

  async function rescan() {
    try {
      setBusy(true);
      
      // 1. ✅ v3.0: Roep de echte scanfunctie aan met de v3.0 state
      const newRisks = scan(allAnswers);

      // 2. ✅ v3.0: Gebruik 'updateChapterData' om de state te bij te werken
      updateChapterData('risico', (prev) => ({
        ...prev,
        risks: newRisks,
        // Eenvoudige logica om een 'overallRisk' te bepalen
        overallRisk: newRisks.some(r => r.severity === 'hoog') 
          ? 'hoog' 
          : newRisks.some(r => r.severity === 'medium') 
          ? 'medium' 
          : newRisks.length > 0 ? 'laag' : undefined,
      }));

      toast({
        title: 'Risicoanalyse ververst',
        description: `${newRisks.length} risico's/signalen gevonden.`,
      });
    } catch (e) {
      toast({
        title: 'Kon risicoanalyse niet verversen',
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  }

  async function copyToClipboard() {
    // ✅ v3.0: Maak een 'summary' van de 'risks' array
    const summary = risks.length > 0
      ? risks.map(r => `[${r.severity || 'laag'}] ${r.description}`).join('\n')
      : 'Geen risico\'s gevonden.';
      
    try {
      await navigator.clipboard.writeText(summary);
      toast({ title: 'Gekopieerd', description: 'De risico-samenvatting staat op het klembord.' });
    } catch (e) {
      toast({ title: 'Kopiëren mislukt', description: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={rescan}
          disabled={busy}
          className="px-3 py-1.5 rounded bg-[#0d3d4d] text-white text-sm disabled:opacity-60"
        >
          {busy ? 'Scannen…' : '(Her)scan project'}
        </button>
        <button
          onClick={copyToClipboard}
          disabled={risks.length === 0}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Kopiëren
        </button>
      </div>

      {/* ✅ v3.0: Render de 'risks' array */}
      <div className="space-y-3">
        {risks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Nog geen risicoanalyse uitgevoerd. Klik op "Scan project" om te starten.
          </div>
        ) : (
          risks.map((risk) => (
            <div 
              key={risk.id} 
              className={`rounded-lg border p-4 ${
                risk.severity === 'hoog' ? 'bg-red-50 border-red-200' :
                risk.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-white border-gray-200'
              }`}
            >
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                risk.severity === 'hoog' ? 'bg-red-100 text-red-800' :
                risk.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                {risk.severity || 'laag'}
              </span>
              <p className="text-sm font-medium mt-2">{risk.description}</p>
              {risk.mitigation && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Suggestie:</strong> {risk.mitigation}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------------------------
// Veiligheids-wrappers (Error Boundary, etc.)
// Deze zijn prima en hoeven niet te wijzigen.
// -------------------------------------------

function RisicoWithToast() {
  const { toast } = useRealToast();
  return <RisicoUI toast={(o) => toast(o)} />;
}

function RisicoNoToast() {
  const logToast = (o: { title?: string; description?: string }) => {
    console.log('[toast:fallback]', o.title ?? '', o.description ?? '');
  };
  return <RisicoUI toast={logToast} />;
}

class ToastBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return <RisicoNoToast />;
    return this.props.children as React.ReactNode;
  }
}

export default function Risico() {
  return (
    <ToastBoundary>
      <RisicoWithToast />
    </ToastBoundary>
  );
}