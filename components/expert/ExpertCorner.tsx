// components/expert/ExpertCorner.tsx
'use client';

import CircularProgress from '@/components/common/CircularProgress';
import DocumentPreview from '@/components/common/DocumentPreview';
import SaveProgressCard from '@/components/common/SaveProgressCard';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

function computePct(progress?: number, done?: number, total?: number) {
  if (typeof progress === 'number') return progress <= 1 ? Math.round(progress * 100) : Math.round(progress);
  if (typeof done === 'number' && typeof total === 'number' && total > 0) return Math.round((done / total) * 100);
  return 0;
}

export default function ExpertCorner() {
  const completedSteps = useWizardState((s) => s.completedSteps);
  const totalSteps = useWizardState((s) => s.totalSteps);
  const progress = useWizardState((s) => s.progress);

  const setFocusedField = useUiStore((s) => s.setFocusedField);

  const pct = computePct(progress, completedSteps, totalSteps);
  const label =
    typeof completedSteps === 'number' && typeof totalSteps === 'number'
      ? `Stap ${Math.min((completedSteps ?? 0) + 1, totalSteps)}/${totalSteps}`
      : 'Voortgang';

  return (
    <aside aria-label="Adviseur – Expert Corner" className="space-y-4">
      {/* Voortgang */}
      <div className="brx-card p-4 flex items-center justify-between">
        <CircularProgress value={pct} subtitle="Voortgang" label={label} />
      </div>

      {/* Context instructie */}
      <div className="brx-card p-3">
        <div className="text-xs brx-muted">
          Selecteer eerst een onderdeel in het midden — hier verschijnen contextuele tips.
        </div>
      </div>

      {/* Opslaan van voortgang */}
      <SaveProgressCard />

      {/* Tips met klikbare focus (voorbeeld) */}
      <div className="brx-card p-3 space-y-2">
        <div className="text-sm font-semibold">Snel naar veelgebruikte onderdelen</div>
        <div className="flex flex-wrap gap-2">
          <button
            className="text-xs px-2.5 py-1.5 rounded-full border border-[#0d3d4d]/20 hover:bg-[#eef8f8]"
            onClick={() => setFocusedField('budget:bedrag')}
          >
            Budget invullen
          </button>
          <button
            className="text-xs px-2.5 py-1.5 rounded-full border border-[#0d3d4d]/20 hover:bg-[#eef8f8]"
            onClick={() => setFocusedField('ruimtes:naam')}
          >
            Ruimte toevoegen
          </button>
          <button
            className="text-xs px-2.5 py-1.5 rounded-full border border-[#0d3d4d]/20 hover:bg-[#eef8f8]"
            onClick={() => setFocusedField('techniek:isolatie')}
          >
            Isolatie
          </button>
        </div>
      </div>

      {/* Losse architectentip */}
      <div className="brx-tip">
        <div className="text-sm font-semibold mb-1">Tip van Jules</div>
        <p className="text-sm">Vergeet bij een wellnessruimte niet ventilatie en vochtregulatie.</p>
      </div>

      {/* LIVE PREVIEW (sticky) */}
      <div className="md:sticky md:bottom-2">
        <div className="brx-card p-3">
          <DocumentPreview />
        </div>
      </div>
    </aside>
  );
}
