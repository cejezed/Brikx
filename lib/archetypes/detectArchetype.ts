// /lib/archetypes/detectArchetype.ts
// Archetype-detectie — defensief t.o.v. optionele intent/budget/projectType

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
  // projectType veilig normaliseren
  const projectType =
    typeof triage?.projectType === "string" && triage.projectType.trim().length > 0
      ? triage.projectType.toLowerCase().trim()
      : undefined;

  // budget alleen meenemen als het een eindig getal is
  const budget =
    typeof triage?.budget === "number" && Number.isFinite(triage.budget)
      ? triage.budget
      : undefined;

  // intent kan string of array of leeg zijn → naar array normaliseren
  const intents: unknown[] = Array.isArray(triage?.intent)
    ? (triage!.intent as unknown[])
    : typeof triage?.intent === "string" && triage.intent.trim().length > 0
    ? [triage.intent]
    : [];

  // naar Set met schone lowercase tags
  const intentTags = new Set(
    intents
      .filter((v: unknown) => v != null && String(v).trim().length > 0)
      .map((s: unknown) => String(s).toLowerCase().trim())
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
