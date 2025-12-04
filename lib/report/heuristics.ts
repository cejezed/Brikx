import type {
  BasisData,
  RisicoData,
  BudgetData,
  ChapterDataMap,
} from "@/types/project";

/**
 * Bepaalt de verwachte vergunningsstatus op basis van projectgegevens.
 *
 * Heuristiek:
 * - Nieuwbouw → meestal Bouwvergunning
 * - Verbouwing/uitbreiding → meestal Omgevingsvergunning
 * - Bijgebouw → mogelijk vergunningvrij, anders Omgevingsvergunning
 * - Hybride/Anders → Omgevingsvergunning
 *
 * @param basis - BasisData uit wizard
 * @returns Vergunningsstatus string
 */
export function computePermitStatus(
  basis?: BasisData
): "Geen" | "Omgevingsvergunning" | "Bouwvergunning" {
  if (!basis || !basis.projectType) return "Geen";

  // Heuristiek op basis van projectType
  if (basis.projectType === "nieuwbouw") {
    return "Bouwvergunning";
  }

  if (basis.projectType === "verbouwing" || basis.projectType === "hybride") {
    return "Omgevingsvergunning";
  }

  if (basis.projectType === "bijgebouw") {
    // Bijgebouwen zijn vaak vergunningvrij, maar niet altijd
    return "Omgevingsvergunning";
  }

  return "Omgevingsvergunning";
}

/**
 * Berekent een complexiteitsscore op basis van alle chapter-data.
 *
 * Scoring systeem:
 * - Veel kamers (>10) → +2 punten, (>5) → +1 punt
 * - Monument → +2 punten
 * - Zeer ambitieus techniek (PV/verwarming) → +1 punt elk
 * - Hoog energielabel (A+++/A++++) → +2 punten
 * - Veel must-have wensen (>10) → +1 punt
 *
 * Score → Complexiteit:
 * - >= 4 → Hoog
 * - >= 2 → Gemiddeld
 * - < 2 → Laag
 *
 * @param chapters - Alle chapter data uit wizard
 * @returns Complexiteitsscore
 */
export function computeComplexity(
  chapters: Partial<ChapterDataMap>
): "Laag" | "Gemiddeld" | "Hoog" {
  let score = 0;

  // Factor 1: Aantal kamers
  const roomCount = chapters.ruimtes?.rooms?.length ?? 0;
  if (roomCount > 10) score += 2;
  else if (roomCount > 5) score += 1;

  // Factor 2: Projectsize (grotere projecten zijn complexer)
  const size = chapters.basis?.projectSize;
  if (size === ">250m2") score += 2;
  else if (size === "150-250m2") score += 1;

  // Factor 3: Techniek ambities (max = hoogste niveau)
  if (chapters.techniek?.pvAmbition === "max") score += 1;
  if (chapters.techniek?.heatingAmbition === "max") score += 1;
  if (chapters.techniek?.ventilationAmbition === "max") score += 1;

  // Factor 4: Duurzaamheid ambities
  const energyLabel = chapters.duurzaam?.energieLabel;
  if (energyLabel && ["A+++", "A++++"].includes(energyLabel)) {
    score += 2;
  }

  // Factor 5: Aantal must-have wensen
  const mustHaveCount =
    chapters.wensen?.wishes?.filter((w) => w.priority === "must").length ?? 0;
  if (mustHaveCount > 10) score += 1;

  // Score naar label
  if (score >= 4) return "Hoog";
  if (score >= 2) return "Gemiddeld";
  return "Laag";
}

/**
 * Bepaalt budget fit op basis van budgetgegevens.
 *
 * Heuristiek:
 * - Geen budget ingevuld → "Budget nog niet ingevuld"
 * - Budget < 75k voor verbouwing/renovatie → "Budget waarschijnlijk te krap"
 * - Budget < 150k voor nieuwbouw → "Budget waarschijnlijk te krap"
 * - Budget > 1M → "Ruim budget beschikbaar"
 * - Anders → "Budget lijkt redelijk bij dit projecttype"
 *
 * NB: Dit is een placeholder totdat we echte kostenramingen integreren.
 *
 * @param budget - BudgetData uit wizard
 * @returns Budget fit beschrijving
 */
export function computeBudgetFit(budget?: BudgetData): string {
  if (!budget?.budgetTotaal) {
    return "Budget nog niet ingevuld";
  }

  const total = budget.budgetTotaal;

  // Heuristiek op basis van budget grootte
  if (total < 75000) {
    return "Budget waarschijnlijk te krap voor een substantiële verbouwing";
  }

  if (total < 150000) {
    return "Budget geschikt voor kleinere verbouwing, mogelijk krap voor nieuwbouw";
  }

  if (total > 1000000) {
    return "Ruim budget beschikbaar voor alle type projecten";
  }

  // Check bandbreedte als die er is
  if (budget.bandbreedte) {
    const [min, max] = budget.bandbreedte;
    if (min && max) {
      if (total >= min && total <= max) {
        return "Budget past binnen de aanbevolen bandbreedte";
      } else if (total < min) {
        return "Budget onder aanbevolen minimum, mogelijk risico op budgetoverschrijding";
      } else {
        return "Budget boven aanbevolen maximum, voldoende buffer aanwezig";
      }
    }
  }

  return "Budget lijkt redelijk bij dit projecttype (exacte raming volgt)";
}

/**
 * Bepaalt overall risk op basis van alle risico-items.
 *
 * Logica:
 * - Geen risico's → "laag"
 * - Minstens één "hoog" → "hoog"
 * - Minstens één "medium" (maar geen "hoog") → "medium"
 * - Alleen "laag" → "laag"
 *
 * @param risico - RisicoData uit wizard
 * @returns Overall risk severity
 */
export function computeOverallRisk(
  risico?: RisicoData
): "laag" | "medium" | "hoog" {
  if (!risico?.risks || risico.risks.length === 0) {
    return "laag";
  }

  const severities = risico.risks.map((r) => r.severity);

  // Als er minstens één "hoog" is → overall hoog
  if (severities.includes("hoog")) return "hoog";

  // Als er minstens één "medium" is → overall medium
  if (severities.includes("medium")) return "medium";

  // Anders → laag
  return "laag";
}

/**
 * v3.x: Premium integratie – Budget warning heuristic
 *
 * Berekent een veilige budget warning op basis van project eigenschappen.
 *
 * BELANGRIJK: Deze functie gebruikt ALLEEN heuristieken, NOOIT AI-gegenereerde bedragen.
 * Alle waarschuwingen zijn veilig en generiek, zonder specifieke kostenclaims.
 *
 * Logica:
 * - Groot project (>180m²) + laag budget (<200k) → waarschuwing
 * - Veel must-have wensen (>8) + gemiddeld budget → waarschuwing
 * - Hoge tech ambities (max) + laag budget → waarschuwing
 * - Nieuwbouw + budget <250k → waarschuwing
 * - Anders → geen waarschuwing
 *
 * @param chapters - Alle chapter data uit wizard
 * @returns Budget warning tekst of null
 */
export function computeBudgetWarning(
  chapters: Partial<ChapterDataMap>
): string | null {
  const budget = chapters.budget?.budgetTotaal;
  const basis = chapters.basis;
  const wensen = chapters.wensen;
  const techniek = chapters.techniek;

  // Geen budget ingevuld → geen warning
  if (!budget) return null;

  // Heuristiek 1: Groot project met krap budget
  const totalM2 = chapters.ruimtes?.rooms?.reduce((sum, room) => {
    const m2 = typeof room.m2 === "number" ? room.m2 : 0;
    return sum + m2;
  }, 0) || 0;

  if (totalM2 > 180 && budget < 200000) {
    return "Let op: Voor een project van deze omvang (>180m²) is het budget aan de krappe kant. Overweeg extra buffer voor onvoorziene kosten.";
  }

  // Heuristiek 2: Veel must-have wensen met gemiddeld budget
  const mustHaveCount =
    wensen?.wishes?.filter((w) => w.priority === "must").length ?? 0;

  if (mustHaveCount > 8 && budget < 300000) {
    return "Let op: Je hebt veel must-have wensen. Overweeg prioritering of extra budget om alle wensen te realiseren.";
  }

  // Heuristiek 3: Hoge tech ambities met krap budget
  const hasHighTechAmbition =
    techniek?.pvAmbition === "max" ||
    techniek?.heatingAmbition === "max" ||
    techniek?.ventilationAmbition === "max";

  if (hasHighTechAmbition && budget < 250000) {
    return "Let op: Maximale technische ambities vereisen vaak significant budget. Overweeg fasering of budgetuitbreiding.";
  }

  // Heuristiek 4: Nieuwbouw met krap budget
  if (basis?.projectType === "nieuwbouw" && budget < 250000) {
    return "Let op: Nieuwbouw projecten hebben vaak hogere kosten dan initieel verwacht. Zorg voor voldoende buffer.";
  }

  // Heuristiek 5: Budget onder bandbreedte minimum
  if (chapters.budget?.bandbreedte) {
    const [min] = chapters.budget.bandbreedte;
    if (typeof min === "number" && budget < min) {
      return "Let op: Je budget ligt onder de aanbevolen minimale bandbreedte. Dit kan leiden tot keuzes die afbreuk doen aan je ambities.";
    }
  }

  // Geen waarschuwing nodig
  return null;
}
