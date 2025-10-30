// components/chapters/Preview.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { buildPreview } from '@/lib/preview/buildPreview';
import { printPreviewToPdf } from '@/lib/export/print';
import { computeEssentialIssues, type EssentialIssue } from '@/utils/essentials';
import { useToast as useRealToast } from '@/components/ui/toast';

// ---------------
// Veilige UI (werkt ook zonder provider)
// ---------------
function PreviewUI({ toast }: { toast: (o: { variant?: string; title?: string; description?: string }) => void }) {
  const triage = useWizardState((s) => s.triage) ?? {};
  const answers = useWizardState((s) => s.chapterAnswers) ?? {};
  const archetype = triage?.projectType ?? 'unknown';
  const goTo = useWizardState((s) => s.goToChapter);

  const [showIssues, setShowIssues] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basis: true,
    ruimtes: true,
    wensen: true,
    budget: true,
    techniek: true,
    duurzaamheid: true,
  });

  const pv = useMemo(() => buildPreview({ triage: triage as any, chapterAnswers: answers }), [triage, answers]);
  const essentials = useMemo<EssentialIssue[]>(
    () => {
      try {
        return computeEssentialIssues({ triage: triage as any, archetype, answers });
      } catch (e) {
        console.warn('essentials error:', e);
        return [];
      }
    },
    [triage, archetype, answers]
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSend = () => {
    try {
      const issuesNow = computeEssentialIssues({ triage: triage as any, archetype, answers });
      if (issuesNow.length > 0) {
        setShowIssues(true);
        toast({
          variant: 'warning',
          title: 'Nog niet compleet',
          description: 'Er missen nog essentiële zaken. Bekijk de lijst hieronder.',
        });
        return;
      }
    } catch (e) {
      console.warn('send error:', e);
    }
    toast({ variant: 'success', title: 'Verstuurd', description: 'Je PvE is compleet en is verstuurd. (Demo)' });
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ triage, answers, preview: pv }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brikx-pve.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ variant: 'success', title: 'JSON gedownload' });
  };

  const downloadPdf = () => {
    try {
      printPreviewToPdf(pv);
      toast({ variant: 'success', title: 'PDF gedownload' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF fout', description: String(e) });
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Preview & Versturen</h2>
          <p className="text-xs text-gray-600 mt-1">
            Controleer al je ingevulde gegevens. Verstuur je PvE of download het als PDF/JSON.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded hover:bg-gray-50 text-sm transition"
            onClick={downloadPdf}
          >
            📄 PDF
          </button>
          <button 
            type="button" 
            className="px-3 py-2 border rounded hover:bg-gray-50 text-sm transition"
            onClick={downloadJson}
          >
            📋 JSON
          </button>
          <button
            type="button"
            className="px-3 py-2 border rounded bg-[#0d3d4d] text-white hover:opacity-90 text-sm transition"
            onClick={handleSend}
          >
            ✓ Verstuur
          </button>
        </div>
      </header>

      {/* ESSENTIALS ALERT */}
      {showIssues && (
        <div className="border rounded-lg bg-amber-50 p-4 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-amber-900">⚠️ Essentiële onderdelen</h3>
            <button
              className="text-xs underline text-amber-700 hover:text-amber-900"
              onClick={() => setShowIssues(false)}
            >
              Verbergen
            </button>
          </div>
          {essentials.length === 0 ? (
            <p className="text-sm text-amber-900">
              ✅ Alles is ingevuld! Je PvE is compleet.
            </p>
          ) : (
            <ul className="space-y-2">
              {essentials.map((e) => (
                <li key={e.id} className="bg-white/80 border border-amber-100 rounded p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-amber-900">{e.title}</p>
                      <p className="text-gray-700 mt-0.5">{e.message}</p>
                    </div>
                    {linkFor(e)?.label && (
                      <button
                        type="button"
                        className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50 whitespace-nowrap"
                        onClick={() => goTo(linkFor(e)!.chapter)}
                      >
                        → {linkFor(e)!.label}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* OVERZICHT: Alle ingevulde gegevens */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">📋 Ingevulde Gegevens</h3>

        {/* INTAKE / TRIAGE */}
        <CollapsibleSection
          title="🎯 Projecttype & Urgentie"
          section="intake"
          isOpen={expandedSections.intake}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <DataItem label="Projecttype" value={triage?.projectType} />
            <DataItem label="Projectgrootte" value={triage?.projectSize} />
            <DataItem label="Intentie" value={triage?.intent} />
            <DataItem label="Urgentie" value={triage?.urgency} />
            <DataItem label="Budget" value={formatCurrency(triage?.budget)} />
          </div>
        </CollapsibleSection>

        {/* BASIS */}
        {answers?.basis && (
          <CollapsibleSection
            title="🏠 Basisgegevens"
            section="basis"
            isOpen={expandedSections.basis}
            onToggle={toggleSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <DataItem label="Projectnaam" value={answers.basis.projectName} />
              <DataItem label="Locatie / Adres" value={answers.basis.location} />
              <DataItem label="Oppervlakte (m²)" value={answers.basis.totalArea} />
              <DataItem label="Bewoners" value={answers.basis.inhabitants} />
              <div className="md:col-span-2">
                <DataItem label="Aanvullende info" value={answers.basis.notes} />
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* RUIMTES */}
        {answers?.ruimtes && Array.isArray(answers.ruimtes) && answers.ruimtes.length > 0 && (
          <CollapsibleSection
            title={`🏘️ Ruimtes (${answers.ruimtes.length})`}
            section="ruimtes"
            isOpen={expandedSections.ruimtes}
            onToggle={toggleSection}
          >
            <div className="space-y-2">
              {answers.ruimtes.map((room: any, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm border border-gray-200">
                  <p className="font-medium">{room.name || '(naamloos)'} — {room.type}</p>
                  <div className="mt-1 text-gray-700 space-y-1">
                    {room.m2 && <p>📐 {room.m2} m²</p>}
                    {room.wensen && room.wensen.length > 0 && (
                      <p>✓ Wensen: {room.wensen.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* WENSEN */}
        {answers?.wensen && (
          <CollapsibleSection
            title="⭐ Wensen & Prioriteiten"
            section="wensen"
            isOpen={expandedSections.wensen}
            onToggle={toggleSection}
          >
            <div className="space-y-2 text-sm">
              <DataItem label="Belangrijkste wens" value={answers.wensen.mainWish} />
              <DataItem label="Ergernissen huidig huis" value={answers.wensen.currentIssues} />
              <DataItem label="Stijlvoorkeur" value={answers.wensen.stylePreference} />
              {answers.wensen.specialRequests && (
                <DataItem label="Speciale wensen" value={answers.wensen.specialRequests} />
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* BUDGET */}
        {answers?.budget && (
          <CollapsibleSection
            title="💰 Budget & Planning"
            section="budget"
            isOpen={expandedSections.budget}
            onToggle={toggleSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <DataItem label="Budgetklasse" value={answers.budget.class} />
              <DataItem label="Totaalbudget" value={formatCurrency(answers.budget.total)} />
              <DataItem label="Start planning" value={answers.budget.startDate} />
              <DataItem label="Duur (maanden)" value={answers.budget.duration} />
              {answers.budget.notes && (
                <div className="md:col-span-2">
                  <DataItem label="Opmerkingen" value={answers.budget.notes} />
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* TECHNIEK */}
        {answers?.techniek && (
          <CollapsibleSection
            title="⚙️ Techniek"
            section="techniek"
            isOpen={expandedSections.techniek}
            onToggle={toggleSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <DataItem label="Bouwmethode" value={answers.techniek.buildMethod} />
              <DataItem label="Ventilatie" value={answers.techniek.ventilation} />
              <DataItem label="Verwarming" value={answers.techniek.heating} />
              <DataItem label="Koeling" value={answers.techniek.cooling} />
              <DataItem label="PV/Zonnepanelen" value={answers.techniek.pv} />
              <DataItem label="Isolatiedoel (Rc)" value={answers.techniek.insulationTargetRc} />
              {answers.techniek.notes && (
                <div className="md:col-span-2">
                  <DataItem label="Opmerkingen" value={answers.techniek.notes} />
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* DUURZAAMHEID */}
        {answers?.duurzaamheid && (
          <CollapsibleSection
            title="🌱 Duurzaamheid"
            section="duurzaamheid"
            isOpen={expandedSections.duurzaamheid}
            onToggle={toggleSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <DataItem label="Hoofdfocus" value={answers.duurzaamheid.focus} />
              <DataItem label="Materialen" value={answers.duurzaamheid.materials} />
              <DataItem label="Regenwater" value={answers.duurzaamheid.rainwater} />
              <DataItem label="Groendak" value={answers.duurzaamheid.greenRoof} />
              <DataItem label="EPC-doel" value={answers.duurzaamheid.epcTarget} />
              {answers.duurzaamheid.insulationUpgrade !== undefined && (
                <DataItem 
                  label="Isolatie-upgrade" 
                  value={answers.duurzaamheid.insulationUpgrade ? 'Ja' : 'Nee'} 
                />
              )}
              {answers.duurzaamheid.notes && (
                <div className="md:col-span-2">
                  <DataItem label="Opmerkingen" value={answers.duurzaamheid.notes} />
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* FOOTER CTA */}
      <div className="border-t pt-4 flex gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-50 text-sm transition"
          onClick={() => window.scrollTo(0, 0)}
        >
          ↑ Naar boven
        </button>
      </div>
    </section>
  );
}

// =====================
// Helper Components
// =====================

function CollapsibleSection({
  title,
  section,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  section: string;
  isOpen: boolean;
  onToggle: (s: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        onClick={() => onToggle(section)}
      >
        <span className="font-semibold text-left">{title}</span>
        <span className="text-xl">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-gray-600 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium mt-0.5">{value}</p>
    </div>
  );
}

function formatCurrency(value?: number | null): string {
  if (!value) return '—';
  return `€${value.toLocaleString('nl-NL')}`;
}

/** Links voor "essentials" */
function linkFor(e: EssentialIssue): { chapter: any; label: string } | null {
  const rel = e.related?.[0] ?? '';
  if (rel.startsWith('basis.')) return { chapter: 'basis', label: 'Basis' };
  if (rel === 'ruimtes') return { chapter: 'ruimtes', label: 'Ruimtes' };
  if (rel === 'wensen') return { chapter: 'wensen', label: 'Wensen' };
  if (rel === 'budget') return { chapter: 'budget', label: 'Budget' };
  if (rel === 'techniek') return { chapter: 'techniek', label: 'Techniek' };
  if (rel === 'duurzaamheid') return { chapter: 'duurzaamheid', label: 'Duurzaamheid' };
  if (rel === 'intake.archetype') return { chapter: 'intake', label: 'Start' };
  return null;
}

/* ---------------
   Error-safe export met toast fallback
   --------------- */
function PreviewWithToast() {
  const { toast } = useRealToast();
  return <PreviewUI toast={(o) => toast(o)} />;
}

function PreviewNoToast() {
  const logToast = (o: { variant?: string; title?: string; description?: string }) =>
    console.log('[toast:fallback]', o.title ?? '', o.description ?? '');
  return <PreviewUI toast={logToast} />;
}

class ToastBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return <PreviewNoToast />;
    return this.props.children as React.ReactNode;
  }
}

export default function Preview() {
  return (
    <ToastBoundary>
      <PreviewWithToast />
    </ToastBoundary>
  );
}