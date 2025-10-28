// components/intake/IntakeForm.tsx
'use client';

import { useWizardState } from '@/lib/stores/useWizardState';

export default function IntakeForm() {
  const triage = useWizardState((s) => s.triage);
  const setTriage = useWizardState((s) => s.setTriage);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium mb-1">Projecttype</span>
        <select
          className="w-full border rounded px-3 py-2"
          value={triage.projectType ?? ''}
          onChange={(e) => setTriage({ projectType: (e.target.value as any) || null })}
        >
          <option value="">Kies...</option>
          <option value="nieuwbouw_woning">Nieuwbouw Woning</option>
          <option value="complete_renovatie">Complete Renovatie</option>
          <option value="bijgebouw">Bijgebouw</option>
          <option value="verbouwing_zolder">Verbouwing Zolder</option>
          <option value="hybride_project">Hybride Project</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1">Projectgrootte</span>
        <select
          className="w-full border rounded px-3 py-2"
          value={triage.projectSize ?? ''}
          onChange={(e) => setTriage({ projectSize: (e.target.value as any) || null })}
        >
          <option value="">Kies...</option>
          <option value="klein">Klein (&lt; 50m²)</option>
          <option value="midden">Middel (50–200m²)</option>
          <option value="groot">Groot (&gt; 200m²)</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1">Urgentie</span>
        <select
          className="w-full border rounded px-3 py-2"
          value={triage.urgentie ?? ''}
          onChange={(e) => setTriage({ urgentie: (e.target.value as any) || null })}
        >
          <option value="">Kies...</option>
          <option value="laag">Laag - Ik heb tijd</option>
          <option value="middel">Middel - Normaal tempo</option>
          <option value="hoog">Hoog - Snel graag</option>
        </select>
      </label>

      {/* Checkboxen voor intent */}
      <fieldset className="border rounded p-3">
        <legend className="text-sm font-medium mb-2">Wat is je doel? (meerdere mogelijk)</legend>
        <div className="space-y-2">
          {(['architect_start', 'contractor_quote', 'scenario_exploration'] as const).map((intent) => {
            const checked = (triage.intent ?? []).includes(intent);
            return (
              <label key={intent} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = triage.intent ?? [];
                    const updated = e.target.checked ? [...current, intent] : current.filter((i) => i !== intent);
                    setTriage({ intent: updated });
                  }}
                  className="rounded"
                />
                <span className="text-sm">
                  {intent === 'architect_start' && 'Architect in actie'}
                  {intent === 'contractor_quote' && 'Offerte ophalen'}
                  {intent === 'scenario_exploration' && 'Mogelijkheden verkennen'}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
