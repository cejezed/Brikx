import type {
  BasisData,
  RuimtesData,
  WensenData,
  BudgetData,
  TechniekData,
  DuurzaamData,
  RisicoData,
  WizardState,
} from "@/types/project";
import {
  computePermitStatus,
  computeComplexity,
  computeBudgetFit,
  computeOverallRisk,
  computeBudgetWarning,
} from "./heuristics";

/**
 * View model voor PvE-rapport.
 * Maps WizardState naar een rapport-vriendelijke structuur.
 *
 * Alle chapter data wordt 1-op-1 overgenomen uit WizardState.
 * Meta-velden worden berekend via heuristieken in de view layer.
 */
export type PvEView = {
  // Metadata
  projectNaam?: string;
  laatstBijgewerkt: string;
  versie: string;

  // Chapter data (direct from WizardState.chapterAnswers)
  basis?: BasisData;
  ruimtes?: RuimtesData;
  wensen?: WensenData;
  budget?: BudgetData;
  techniek?: TechniekData;
  duurzaam?: DuurzaamData;
  risico?: RisicoData;

  // Afgeleide velden (computed in buildPvEView)
  meta: {
    vergunningVerwachting: "Geen" | "Omgevingsvergunning" | "Bouwvergunning";
    complexiteitsScore: "Laag" | "Gemiddeld" | "Hoog";
    budgetFit: string;
    overallRisk: "laag" | "medium" | "hoog";
    budgetWarning: string | null; // v3.x: Premium - veilige budget waarschuwing
  };
};

// @protected PVE_F01_CORE_VIEW
// buildPvEView creates the PvE (Program of Requirements) view model from wizard state.
// DO NOT REMOVE or change the structure without updating config/features.registry.json and check-features.sh.
/**
 * Bouwt een PvEView van de huidige wizard state.
 *
 * Deze functie is puur view-logic: geen side-effects, geen database calls.
 * Alle afgeleide velden worden berekend op basis van de input state.
 *
 * @param state - De huidige WizardState uit de Zustand store
 * @returns PvEView - View model voor het PvE-rapport
 */
export function buildPvEView(state: WizardState): PvEView {
  const chapters = state.chapterAnswers;

  return {
    // Metadata
    projectNaam: chapters.basis?.projectNaam || "Nieuw Brikx Project",
    laatstBijgewerkt: new Date().toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    versie: `${state.stateVersion || 1}.0`,

    // Chapter data (1-op-1 mapping)
    basis: chapters.basis,
    ruimtes: chapters.ruimtes,
    wensen: chapters.wensen,
    budget: chapters.budget,
    techniek: chapters.techniek,
    duurzaam: chapters.duurzaam,
    risico: chapters.risico,

    // Afgeleide meta-velden (heuristieken)
    meta: {
      vergunningVerwachting: computePermitStatus(chapters.basis),
      complexiteitsScore: computeComplexity(chapters),
      budgetFit: computeBudgetFit(chapters.budget),
      overallRisk: computeOverallRisk(chapters.risico),
      budgetWarning: computeBudgetWarning(chapters), // v3.x: Premium - veilige budget warning
    },
  };
}
