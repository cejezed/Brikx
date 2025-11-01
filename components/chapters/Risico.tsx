// components/chapters/Risico.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useToast as useRealToast } from '@/components/ui/toast'; // ✅ juiste import

/** -------------------------------------------
 *  UI-layer die nooit crasht als Toast ontbreekt
 * ------------------------------------------- */

// Een simpele UI-component die een toast-functie als prop krijgt
function RisicoUI({ toast }: { toast: (o: { title?: string; description?: string }) => void }) {
  // @ts-ignore - accepts partial/dynamic chapter data at runtime
  const risicoObj = useWizardState((s) => s.chapterAnswers?.risico ?? {}) as Record<string, any>;
  // @ts-ignore - accepts partial patches at runtime
  const patchChapter = useWizardState((s) => s.patchChapterAnswer);

  const [busy, setBusy] = useState(false);

  const summary: string = useMemo(() => {
    if (typeof risicoObj?.summary === 'string') return risicoObj.summary;
    return 'Nog geen risicoanalyse uitgevoerd. Klik op “Opnieuw scannen” om te starten.';
  }, [risicoObj]);

  async function rescan() {
    try {
      setBusy(true);
      // 🔧 hier zou normaal je echte risico-logic komen (AI/regels/etc.)
      // We mocken een output:
      const newSummary =
        '⚠️ Mogelijke aandachtspunten:\n' +
        '- Budgetdruk bij isolatiepakket\n' +
        '- Doorlooptijd vergunningstraject onzeker\n' +
        '- Installatiekeuze beïnvloedt TCO\n';

      // Schrijf naar de store via generieke API
      patchChapter('risico', { summary: newSummary, updatedAt: new Date().toISOString() });

      toast({
        title: 'Risicoanalyse ververst',
        description: 'Nieuwe signalen zijn toegevoegd aan je overzicht.',
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
    try {
      await navigator.clipboard.writeText(summary || '');
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
          {busy ? 'Scannen…' : 'Opnieuw scannen'}
        </button>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          Kopiëren
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 whitespace-pre-wrap text-sm leading-relaxed">
        {summary}
      </div>
    </div>
  );
}

// Probeert de echte useToast te gebruiken
function RisicoWithToast() {
  const { toast } = useRealToast();
  return <RisicoUI toast={(o) => toast(o)} />;
}

// Fallback zonder provider (geen hook-gebruik!)
function RisicoNoToast() {
  const logToast = (o: { title?: string; description?: string }) => {
    // Minimalistische fallback zodat de UI niet crasht
    // en je toch feedback ziet in de console.
    // eslint-disable-next-line no-console
    console.log('[toast:fallback]', o.title ?? '', o.description ?? '');
  };
  return <RisicoUI toast={logToast} />;
}

// Error boundary die provider-fouten opvangt (zoals “useToast must be used within <ToastProvider>”)
class ToastBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // geen-op: we schakelen over naar fallback UI
  }
  render() {
    if (this.state.hasError) return <RisicoNoToast />;
    return this.props.children as React.ReactNode;
  }
}

/** -------------------------------------------
 *  Default export – veilig met provider óf zonder
 * ------------------------------------------- */
export default function Risico() {
  return (
    <ToastBoundary>
      <RisicoWithToast />
    </ToastBoundary>
  );
}