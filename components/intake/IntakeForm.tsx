// components/intake/IntakeForm.tsx
"use client";

import type { TriageState } from "@/lib/stores/useWizardState";

// STAP 1: Verwijder 'useState' en 'useWizardState'. Die horen hier niet.
// import { useState } from "react";
// import { useWizardState } from "@/lib/stores/useWizardState";

// STAP 2: Definieer de props die het component verwacht
type Props = {
  s: TriageState | undefined; // ← Laat undefined toe (voor hydration safety)
  setS: (patch: Partial<TriageState>) => void; // 'setS' is de functie om de state bij te werken
};

// Defensive defaults als s undefined is
const DEFAULT_FORM_STATE: TriageState = {
  projectType: null,
  projectSize: null,
  intent: [],
  urgentie: null,
};

// STAP 3: Accepteer 's' en 'setS' als props
export default function IntakeForm({ s, setS }: Props) {
  // STAP 4: Gebruik defensive fallback
  const formState = s ?? DEFAULT_FORM_STATE;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium mb-1">Projecttype</span>
        <select
          className="w-full border rounded px-3 py-2"
          // STAP 5: Gebruik formState om de waarde te lezen
          value={formState.projectType ?? ""}
          // STAP 6: Gebruik 'setS' om de waarde bij te werken
          onChange={(e) =>
            setS({
              projectType: (e.target.value as any) || null,
            })
          }
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
          value={formState.projectSize ?? ""}
          onChange={(e) =>
            setS({
              projectSize: (e.target.value as any) || null,
            })
          }
        >
          <option value="">Kies...</option>
          <option value="klein">Klein (&lt; 50m²)</option>
          <option value="midden">Middel (50-200m²)</option>
          <option value="groot">Groot (&gt; 200m²)</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-sm font-medium mb-1">Urgentie</span>
        <select
          className="w-full border rounded px-3 py-2"
          value={formState.urgentie ?? ""}
          onChange={(e) =>
            setS({
              urgentie: (e.target.value as any) || null,
            })
          }
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
          {["architect_start", "contractor_quote", "scenario_exploration"].map((intent) => (
            <label key={intent} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formState.intent ?? []).includes(intent as any)}
                onChange={(e) => {
                  const current = formState.intent ?? [];
                  const updated = e.target.checked
                    ? [...current, intent as any]
                    : current.filter((i) => i !== intent);
                  setS({ intent: updated });
                }}
                className="rounded"
              />
              <span className="text-sm">
                {intent === "architect_start" && "Architect in actie"}
                {intent === "contractor_quote" && "Offerte ophalen"}
                {intent === "scenario_exploration" && "Mogelijkheden verkennen"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}