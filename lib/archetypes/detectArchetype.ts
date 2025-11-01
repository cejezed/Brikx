// /lib/archetypes/detectArchetype.ts
// Archetype-detectie — defensief t.o.v. optionele intent

import type { TriageData } from "@/types/chat";

export type Archetype =
  | "nieuwbouw_woning"
  | "nieuwbouw_compact"
  | "verbouwing_woonhuis"
  | "aanbouw_uitbouw"
  | "zolder_dakopbouw"
  | "renovatie_energetisch"
  | "onbekend";

export function detectArchetype(triage: TriageData): Archetype {
  const projectType = triage?.projectType?.toLowerCase();
  const budget = Number.isFinite(triage?.budget as number) ? (triage!.budget as number) : undefined;

  // intent is optioneel; zet altijd veilig naar Set
  const intentTags = new Set(
    (triage?.intent ?? [])
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim())
  );

  // 1) Direct op projectType
  if (projectType === "nieuwbouw") {
    if ((budget ?? 0) > 200_000) return "nieuwbouw_woning";
    return "nieuwbouw_compact";
  }

  if (projectType === "verbouwing") {
    if (intentTags.has("uitbouw") || intentTags.has("aanbouw") || intentTags.has("serre")) {
      return "aanbouw_uitbouw";
    }
    if (intentTags.has("zolder") || intentTags.has("dakopbouw") || intentTags.has("dakkapel")) {
      return "zolder_dakopbouw";
    }
    if (
      intentTags.has("isoleren") ||
      intentTags.has("duurzaam") ||
      intentTags.has("energetisch") ||
      intentTags.has("warmtepomp")
    ) {
      return "renovatie_energetisch";
    }
    return "verbouwing_woonhuis";
  }

  if (projectType === "aanbouw" || projectType === "uitbouw") {
    return "aanbouw_uitbouw";
  }

  if (projectType === "zolder" || projectType === "dakopbouw") {
    return "zolder_dakopbouw";
  }

  // 2) Zonder projectType → heuristiek via intent-tags
  if (intentTags.has("uitbouw") || intentTags.has("aanbouw")) return "aanbouw_uitbouw";
  if (intentTags.has("zolder") || intentTags.has("dakopbouw") || intentTags.has("dakkapel"))
    return "zolder_dakopbouw";
  if (
    intentTags.has("isoleren") ||
    intentTags.has("energetisch") ||
    intentTags.has("duurzaam") ||
    intentTags.has("warmtepomp")
  )
    return "renovatie_energetisch";

  // 3) Fallback
  return "onbekend";
}
