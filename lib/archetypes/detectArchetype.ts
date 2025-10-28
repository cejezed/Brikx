import { TriageData } from "@/types/wizard";
import { Archetype } from "@/types/archetype";

export function detectArchetype(triage: TriageData): Archetype {
  const { projectType, intent, budget } = triage;

  if (projectType === "nieuwbouw") {
    if (budget > 200000) return "nieuwbouw_woning";
    return "bijgebouw";
  }

  if (projectType === "verbouwing") {
    if (intent === "contractor_quote" && budget > 150000) return "complete_renovatie";
    if (intent === "scenario_exploration") return "verbouwing_zolder";
    return "aanbouw";
  }

  if (projectType === "hybride") {
    return "hybride_project";
  }

  return "anders"; // fallback
}
