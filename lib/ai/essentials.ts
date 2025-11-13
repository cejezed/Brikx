// lib/ai/essentials.ts
// ✅ v3.3: Essentials-classificatie per veldniveau
// ⚠️ Field IDs moet matchen met CHAPTER_SCHEMAS output

import type { MissingItem } from "@/lib/ai/missing";

/**
 * CRITICAL: Absolute requirements (user can't proceed without these)
 * - basis.projectType: Nodig voor triage logic
 */
export const CRITICAL_ESSENTIALS = new Set([
  "basis.projectType",
]);

/**
 * STRONG: Highly recommended (soft nudge if missing, but don't block)
 * - ruimtes.rooms: Need at least context of space planning
 * - budget.budgetTotaal: Essential for cost advice
 * ⚠️ Check these IDs against your CHAPTER_SCHEMAS!
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