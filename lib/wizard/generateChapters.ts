// /lib/generateChapters.ts

import type { ChapterKey, TriageData } from "@/types/chat";

/**
 * Generate chapter flow op basis van triage.
 *
 * Build v2.0 principes:
 * - Altijd AI-First Triage (intake) → bepaalt volgorde.
 * - Preview users krijgen basis-flow.
 * - Premium / complexere cases kunnen later uitgebreid worden.
 *
 * Deze implementatie is bewust deterministisch en simpel,
 * zodat server & client exact dezelfde volgorde delen.
 */
export function generateChapters(triage: TriageData | undefined): ChapterKey[] {
  const flow: ChapterKey[] = [];

  // 1) Basis is altijd eerst
  flow.push("basis");

  // 2) Wensen en Ruimtes vrijwel altijd relevant
  flow.push("wensen", "ruimtes");

  // 3) Budget altijd meenemen (centrale as)
  flow.push("budget");

  // 4) Condities op basis van projectType e.d.
  const type = triage?.projectType?.toLowerCase() ?? "";

  if (type.includes("nieuwbouw") || type.includes("uitbouw") || type.includes("verbouwing")) {
    flow.push("techniek");
    flow.push("duurzaam");
  }

  // 5) Risico-module altijd beschikbaar als checklaag (Build v2.0 Pijler 4)
  flow.push("risico");

  // 6) Preview & export samenvatting
  flow.push("preview");

  // Uniek + stabiele volgorde
  return Array.from(new Set(flow));
}
