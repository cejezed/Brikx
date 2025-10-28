// lib/ai/missing.ts

/**
 * Stap 3 – Missing Fields & Nudge
 * --------------------------------
 * Dit bestand bepaalt welke "essentiële" velden per hoofdstuk minimaal nodig zijn
 * en geeft hulpfuncties terug om nudges te tonen en direct te kunnen focussen
 * (chapter + fieldId) via jouw spotlight-lus.
 *
 * Afspraken:
 * - keys in ESSENTIALS komen overeen met bestaande chapter keys in je wizard.
 * - fieldId correspondeert met je FocusTarget wrappers in het Canvas.
 * - label is leesbare UI-tekst voor nudge-buttons.
 */

export type MissingItem = {
  chapter: string;
  fieldId: string;
  label: string;
  severity: "required" | "recommended";
};

type EssentialField = {
  fieldId: string;
  label: string;
  severity?: "required" | "recommended";
};

/** Definieer de essentiële velden per hoofdstuk (breid gerust uit). */
const ESSENTIALS: Record<string, EssentialField[]> = {
  intake: [
    { fieldId: "archetype",   label: "Project (archetype)", severity: "required" },
    { fieldId: "projectType", label: "Projecttype",          severity: "required" },
    { fieldId: "intent",      label: "Intentie",             severity: "recommended" },
    { fieldId: "budget",      label: "Budget",               severity: "recommended" },
  ],
  basis: [
    { fieldId: "projectNaam", label: "Projectnaam",          severity: "recommended" },
    { fieldId: "locatie",     label: "Locatie",              severity: "recommended" },
  ],
  wensen: [
    { fieldId: "prioriteiten", label: "Belangrijkste prioriteiten", severity: "recommended" },
  ],
  budget: [
    { fieldId: "totaalBudget", label: "Totaal budget", severity: "required" },
  ],
  techniek: [
    { fieldId: "warmtepomp", label: "Warmtepompkeuze", severity: "recommended" },
  ],
  risico: [
    { fieldId: "algemeen", label: "Algemene aandachtspunten", severity: "recommended" },
  ],
};

/**
 * Lees helpers uit je bestaande wizardState.
 * Pas hier de selectors aan als jouw state-structuur anders heet.
 */
function hasValue(state: any, chapter: string, fieldId: string): boolean {
  const answers = state?.chapterAnswers ?? {};
  const ch = answers[chapter];
  if (ch == null) return false;

  // veld kan string/number/boolean/object zijn
  const v = ch[fieldId];
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Vind de missende essentials in de volledige wizard-state. */
export function computeMissingFields(state: any): MissingItem[] {
  const out: MissingItem[] = [];

  for (const chapter of Object.keys(ESSENTIALS)) {
    for (const field of ESSENTIALS[chapter]) {
      if (!hasValue(state, chapter, field.fieldId)) {
        out.push({
          chapter,
          fieldId: field.fieldId,
          label: field.label,
          severity: field.severity ?? "required"
        });
      }
    }
  }
  return out;
}

/**
 * Kies de "volgende beste" ontbrekende: required vóór recommended,
 * en houd (optioneel) rekening met currentChapter om prioriteit te geven.
 */
export function nextMissing(state: any, currentChapter?: string | null): MissingItem | null {
  const all = computeMissingFields(state);
  if (all.length === 0) return null;

  // 1) eerst required in currentChapter
  if (currentChapter) {
    const hit = all.find(m => m.chapter === currentChapter && m.severity === "required");
    if (hit) return hit;
  }

  // 2) dan required overall
  const required = all.find(m => m.severity === "required");
  if (required) return required;

  // 3) dan recommended in currentChapter
  if (currentChapter) {
    const hit2 = all.find(m => m.chapter === currentChapter);
    if (hit2) return hit2;
  }

  // 4) anders de eerste de beste
  return all[0];
}

/** Groepeer ontbrekende items per hoofdstuk (handig voor UI). */
export function groupMissingByChapter(state: any): Record<string, MissingItem[]> {
  const all = computeMissingFields(state);
  return all.reduce<Record<string, MissingItem[]>>((acc, m) => {
    if (!acc[m.chapter]) acc[m.chapter] = [];
    acc[m.chapter].push(m);
    return acc;
  }, {});
}
