// components/intake/StartWizardFromIntake.tsx
"use client";

import { useEffect } from "react";
import { useWizardState, type TriageState } from "@/lib/stores/useWizardState";
import IntakeForm from "./IntakeForm";

export default function StartWizardFromIntake() {
  // STAP 1: Lees alle data direct uit de store
  const triage = useWizardState((s) => s.triage);
  const centralBudget = useWizardState((s) => s.getBudgetValue?.());
  const patchTriage = useWizardState((s) => s.patchTriage);
  const goToChapter = useWizardState((s) => s.goToChapter);
  const setBudgetValue = useWizardState((s) => s.setBudgetValue);
  const ensureSafety = useWizardState((s) => s.ensureSafety);

  // STAP 2: Zorg dat store geïnitialiseerd is na hydration
  useEffect(() => {
    ensureSafety?.();
  }, [ensureSafety]);

  // STAP 3: Creëer de 'update' functie
  // Deze schrijft wijzigingen *direct* terug naar de store
  const update = (patch: Partial<TriageState>) => {
    patchTriage?.(patch);

    if ("budget" in patch) {
      setBudgetValue?.(patch.budget ?? null);
    }
  };

  // STAP 4: 'handleSave' navigeert alleen
  const handleSave = () => {
    // Zorg dat het budget gesynchroniseerd is
    patchTriage?.({ budget: centralBudget ?? undefined } as any);
    goToChapter?.("basis");
  };

  // STAP 5: Defensive formState (geen crash als triage undefined is)
  // Dit kan voorkomen bij hydration
  const formState: TriageState | undefined = triage;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Start je Project</h2>

      {/* Pass possibly-undefined triage; IntakeForm handelt dit af */}
      <IntakeForm s={formState} setS={update} />

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!triage?.projectType}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Wizard
        </button>
      </div>
    </div>
  );
}