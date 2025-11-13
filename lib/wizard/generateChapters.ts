// /lib/wizard/generateChapters.ts
// BRIKX Build v3.0 - Dynamische chapter flow o.b.v. Shared Brain
//
// Principes:
// - Input = volledige WizardState (geen aparte triage-objecten).
// - Flow past zich aan op basis van BasisData.projectType.
// - Alleen geldige ChapterKeys: 'basis' | 'ruimtes' | 'wensen' | 'budget' | 'techniek' | 'duurzaam' | 'risico'.
// - Geen 'preview' als chapter; dat is puur UI/route.

import type { ChapterKey, WizardState, BasisData } from "@/types/project";

export function generateChapters(wizardState: WizardState): ChapterKey[] {
  const basis = wizardState.chapterAnswers.basis as BasisData | undefined;
  const projectType = basis?.projectType; // 'nieuwbouw' | 'verbouwing' | 'bijgebouw' | 'hybride' | 'anders'

  const flow: ChapterKey[] = [
    "basis",
    "ruimtes",
    "wensen",
    "budget",
  ];

  // Techniek & Duurzaam bij “serieuze” schil/gebouw-ingrepen
  if (
    projectType === "nieuwbouw" ||
    projectType === "verbouwing" ||
    projectType === "bijgebouw" ||
    projectType === "hybride"
  ) {
    flow.push("techniek", "duurzaam");
  }

  // Risico alleen bij complexere trajecten
  if (
    projectType === "nieuwbouw" ||
    projectType === "verbouwing" ||
    projectType === "hybride"
  ) {
    flow.push("risico");
  }

  // Dedup + guard op geldige keys
  const seen = new Set<ChapterKey>();
  const ordered: ChapterKey[] = [];

  for (const ch of flow) {
    if (
      (ch === "basis" ||
        ch === "ruimtes" ||
        ch === "wensen" ||
        ch === "budget" ||
        ch === "techniek" ||
        ch === "duurzaam" ||
        ch === "risico") &&
      !seen.has(ch)
    ) {
      seen.add(ch);
      ordered.push(ch);
    }
  }

  return ordered;
}

export function isChapterInFlow(
  chapter: ChapterKey,
  wizardState: WizardState
): boolean {
  return generateChapters(wizardState).includes(chapter);
}

export function getNextChapter(
  current: ChapterKey,
  wizardState: WizardState
): ChapterKey | undefined {
  const flow = generateChapters(wizardState);
  const idx = flow.indexOf(current);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : undefined;
}

export function getPreviousChapter(
  current: ChapterKey,
  wizardState: WizardState
): ChapterKey | undefined {
  const flow = generateChapters(wizardState);
  const idx = flow.indexOf(current);
  return idx > 0 ? flow[idx - 1] : undefined;
}
