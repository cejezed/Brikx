// lib/ai/essentials.ts
// ✅ v3.6: Essentials-classificatie - GEEN hard blocks meer
// De AI moet ALTIJD kunnen reageren, ook zonder projectType
// ⚠️ Field IDs moet matchen met CHAPTER_SCHEMAS output

import type { MissingItem } from "@/lib/ai/missing";

/**
 * CRITICAL: LEEG - we blokkeren de AI NOOIT
 *
 * ✅ v3.6 WIJZIGING: projectType is NIET meer critical.
 * Reden: Een "hard block" zorgt voor geforceerde, onlogische nudges.
 * De AI moet ALTIJD kunnen reageren op de gebruiker, ook als projectType
 * nog niet is ingevuld. De AI kan het op een natuurlijke manier vragen
 * wanneer het relevant is in het gesprek.
 */
export const CRITICAL_ESSENTIALS = new Set<string>([
  // LEEG - geen hard blocks
]);

/**
 * STRONG: Belangrijke velden voor volledige PvE
 *
 * ✅ v3.6 WIJZIGING: Deze velden triggeren GEEN automatische nudges meer.
 * Ze worden alleen gebruikt voor voortgangsberekening, niet voor geforceerde vragen.
 * De AI vraagt hier alleen naar wanneer het LOGISCH is in het gesprek.
 */
export const STRONG_ESSENTIALS = new Set([
  "ruimtes.rooms",
  "budget.budgetTotaal",
]);

/**
 * NICE_TO_HAVE: Extra context (silent if missing)
 * - techniek.heatingSystem, ventilationSystem
 * - duurzaam.ambitie (energy ambition level)
 * ⚠️ Verify field names match CHAPTER_SCHEMAS exactly
 */
export const NICE_TO_HAVE = new Set([
  "techniek.heatingSystem",    // Not "heating", not "verwarming"
  "techniek.ventilationSystem", // Not "ventilatie"
  "duurzaam.ambitie",           // Energy/sustainability ambition
]);

/**
 * Classify missing items into severity bands
 * Returns: { critical, strong, nice, hasCritical, hasStrong }
 */
export function classifyMissing(missing: MissingItem[]) {
  const tag = (m: MissingItem) => `${m.chapter}.${m.fieldId}`;

  const critical = missing.filter((m) =>
    CRITICAL_ESSENTIALS.has(tag(m))
  );

  const strong = missing.filter((m) =>
    STRONG_ESSENTIALS.has(tag(m)) &&
    !CRITICAL_ESSENTIALS.has(tag(m))
  );

  const nice = missing.filter((m) =>
    NICE_TO_HAVE.has(tag(m)) &&
    !STRONG_ESSENTIALS.has(tag(m)) &&
    !CRITICAL_ESSENTIALS.has(tag(m))
  );

  return {
    critical,
    strong,
    nice,
    hasCritical: critical.length > 0,
    hasStrong: strong.length > 0,
    hasNice: nice.length > 0,
  };
}

/**
 * Generate soft nudge text for STRONG essentials
 * Uses template: "Zou u ook {{fields}} willen aanvullen?"
 */
export function makeSoftNudgeForStrong(strong: MissingItem[]): string | null {
  if (strong.length === 0) return null;

  const fields = strong
    .map((m) => m.label)
    .join(" en ");

  return `Zou u ook {{${fields}}} willen aanvullen? Dat helpt me beter contextualiseren.`;
}

/**
 * DEBUG: Print current essentials config
 * (Use for schema alignment verification)
 */
export function debugEssentialsConfig(): void {
  console.log("[essentials] CRITICAL:", Array.from(CRITICAL_ESSENTIALS));
  console.log("[essentials] STRONG:", Array.from(STRONG_ESSENTIALS));
  console.log("[essentials] NICE:", Array.from(NICE_TO_HAVE));
}