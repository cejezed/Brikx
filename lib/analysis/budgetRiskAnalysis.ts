// lib/analysis/budgetRiskAnalysis.ts
// ✅ v3.17: Proactieve Budget vs Wensen Analyse
// Analyseert of must-have wensen passen binnen het budget

import type {
  BasisData,
  BudgetData,
  WensenData,
  Wish,
  BudgetRiskLevel,
  BudgetRiskAnalysis,
} from "@/types/project";

// Geschatte kostenfactoren per categorie (grof, ter indicatie)
const COST_FACTORS: Record<string, number> = {
  comfort: 15000,   // gemiddelde impact comfort-wensen
  function: 20000,  // functionele wensen vaak groter
  style: 10000,     // stijlwensen variëren sterk
  other: 12000,     // overig
  default: 15000,   // fallback
};

// Keywords die op dure wensen wijzen
const EXPENSIVE_KEYWORDS = [
  "warmtepomp", "all-electric", "vloerverwarming", "zonnepanelen",
  "uitbouw", "aanbouw", "dakkapel", "kelder", "garage",
  "open keuken", "dragende muur", "doorbraak",
  "badkamer", "wellness", "jacuzzi", "sauna",
  "domotica", "smart home", "zonwering",
];

const VERY_EXPENSIVE_KEYWORDS = [
  "zwembad", "kelder", "lift", "nul-op-de-meter", "passiefhuis",
];

/**
 * Analyseer de verhouding tussen budget en must-have wensen
 * @param budget - Budget data uit het budget-hoofdstuk
 * @param wensen - Wensen data uit het wensen-hoofdstuk
 * @param basis - Optioneel: basis data voor fallback budget
 */
export function analyzeBudgetRisk(
  budget: BudgetData | undefined,
  wensen: WensenData | undefined,
  basis?: BasisData | undefined
): BudgetRiskAnalysis {
  const wishes = wensen?.wishes ?? [];
  const mustHaves = wishes.filter((w) => w.priority === "must");

  // 1️⃣ Kies "beste" budgetbron:
  // - Eerst specifiek Budget-hoofdstuk
  // - Anders globale budget uit Basis
  const chapterBudget = budget?.budgetTotaal ?? 0;
  const basisBudget = basis?.budget ?? 0;
  const availableBudget = chapterBudget || basisBudget;

  // Geen budget ingevuld = kan niet analyseren
  if (!availableBudget || availableBudget <= 0) {
    return {
      riskLevel: "green",
      mustHaveCount: mustHaves.length,
      estimatedMustHaveCost: 0,
      availableBudget: 0,
      shortfall: 0,
      message: "Vul een budget in om de haalbaarheid te analyseren.",
      recommendations: ["Voer uw totaalbudget in bij het hoofdstuk Budget of Basis."],
    };
  }

  // Geen must-haves = geen risico
  if (mustHaves.length === 0) {
    return {
      riskLevel: "green",
      mustHaveCount: 0,
      estimatedMustHaveCost: 0,
      availableBudget,
      shortfall: 0,
      message: "Geen must-have wensen gedefinieerd.",
      recommendations: ['Overweeg uw belangrijkste wensen als "Must-have" te markeren.'],
    };
  }

  // Bereken geschatte kosten per must-have
  const estimatedMustHaveCost = mustHaves.reduce((total, wish) => {
    let baseCost = COST_FACTORS[wish.category ?? "default"] ?? COST_FACTORS.default;
    const text = (wish.text ?? "").toLowerCase();

    // Verhoog kosten voor dure keywords
    if (VERY_EXPENSIVE_KEYWORDS.some((kw) => text.includes(kw))) {
      baseCost *= 3;
    } else if (EXPENSIVE_KEYWORDS.some((kw) => text.includes(kw))) {
      baseCost *= 1.8;
    }

    return total + baseCost;
  }, 0);

  // Budget ratio bepaalt risico
  const ratio = estimatedMustHaveCost / availableBudget;
  const shortfall = Math.max(0, estimatedMustHaveCost - availableBudget);

  let riskLevel: BudgetRiskLevel;
  let message: string;
  let recommendations: string[];

  if (ratio <= 0.6) {
    // GROEN: Must-haves passen ruim binnen budget
    riskLevel = "green";
    message = `Uw ${mustHaves.length} must-have wensen passen naar verwachting binnen uw budget.`;
    recommendations = [
      "Er is ruimte voor nice-to-have wensen.",
      "Houd rekening met 10-15% onvoorziene kosten.",
    ];
  } else if (ratio <= 0.85) {
    // ORANJE: Krap maar haalbaar
    riskLevel = "orange";
    message = `Uw ${mustHaves.length} must-have wensen vergen mogelijk het volledige budget.`;
    recommendations = [
      "Overweeg welke must-haves echt essentieel zijn.",
      "Nice-to-have wensen zijn waarschijnlijk niet haalbaar zonder extra budget.",
      "Plan een gesprek met een architect om prioriteiten scherp te krijgen.",
    ];
  } else {
    // ROOD: Waarschijnlijk niet haalbaar
    riskLevel = "red";
    message = `Uw ${mustHaves.length} must-have wensen overschrijden waarschijnlijk uw budget.`;
    recommendations = [
      `Geschat tekort: €${Math.round(shortfall).toLocaleString("nl-NL")}.`,
      "Maak keuzes: welke must-haves kunt u naar nice-to-have verplaatsen?",
      "Overweeg fasering: sommige wensen kunnen in een latere fase.",
      "Bespreek met Jules welke compromissen mogelijk zijn.",
    ];
  }

  return {
    riskLevel,
    mustHaveCount: mustHaves.length,
    estimatedMustHaveCost: Math.round(estimatedMustHaveCost),
    availableBudget,
    shortfall: Math.round(shortfall),
    message,
    recommendations,
  };
}

/**
 * Genereer een AI-trigger bericht voor Jules wanneer risico oranje/rood is
 * Dit wordt toegevoegd aan de system prompt zodat Jules proactief kan waarschuwen
 */
export function generateBudgetWarningPrompt(analysis: BudgetRiskAnalysis): string | null {
  if (analysis.riskLevel === "green") return null;

  if (analysis.riskLevel === "orange") {
    return `[BUDGET ALERT] De gebruiker heeft ${analysis.mustHaveCount} must-have wensen bij een budget van €${analysis.availableBudget.toLocaleString("nl-NL")}. Dit is krap. Vraag proactief: "Ik zie dat uw must-have wensen het budget volledig opslokken. Wilt u dat we samen kijken welke echt onmisbaar zijn?"`;
  }

  return `[BUDGET ALERT - KRITIEK] De gebruiker heeft ${analysis.mustHaveCount} must-have wensen bij een budget van €${analysis.availableBudget.toLocaleString("nl-NL")}, maar de geschatte kosten zijn hoger. Geschat tekort: €${analysis.shortfall.toLocaleString("nl-NL")}. Vraag: "Uw wensenlijst past waarschijnlijk niet binnen uw budget. Zullen we samen prioriteiten stellen of kijken naar fasering?"`;
}
