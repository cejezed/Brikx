// /lib/ai/missing.ts
// ✅ BRIKX Build v3.0 - Smart Essentials
// - Budget niet essentieel (mag onbekend zijn)
// - Alleen echt cruciale velden blokkeren de AI-triage

import type { WizardState, ChapterKey } from "@/types/project";

export type MissingItem = {
  chapter: ChapterKey;
  fieldId: string;
  label: string;
  severity: "required" | "recommended";
};

type EssentialField = {
  fieldId: string;
  label: string;
  severity?: "required" | "recommended";
};

/**
 * Essential fields per chapter (v3.0)
 * Alleen deze velden tellen mee voor Smart Essentials / minimale PvE-basis.
 *
 * ✅ v3.5 WIJZIGING: Aangepast aan ProjectMeta-structuur.
 * 'basis' velden zijn nu 'recommended' (ze komen uit Stap 0 / projectMeta).
 * 'wensen', 'budget', en 'techniek' zijn NU 'required' voor een realistische voortgangsmeting.
 */
const ESSENTIALS: Record<ChapterKey, EssentialField[]> = {
  basis: [
    {
      fieldId: "projectType",
      label: "Projecttype",
      severity: "recommended", // <-- WAS 'required'
    },
    {
      fieldId: "projectNaam",
      label: "Projectnaam",
      severity: "recommended",
    },
    {
      fieldId: "locatie",
      label: "Locatie",
      severity: "recommended",
    },
  ],

  ruimtes: [
    {
      fieldId: "rooms",
      label: "Ruimtes (globale indeling)",
      severity: "required", // <-- BLIJFT 'required'
    },
  ],

  wensen: [
    {
      fieldId: "wishes",
      label: "Wensen en prioriteiten",
      severity: "required", // <-- WAS 'recommended'
    },
  ],

  budget: [
    {
      fieldId: "budgetTotaal",
      label: "Totaal budget (indicatief)",
      severity: "required", // <-- WAS 'recommended'
    },
    {
      fieldId: "bandbreedte",
      label: "Budget-bandbreedte",
      severity: "recommended",
    },
  ],

  techniek: [
    {
      fieldId: "isolatie",
      label: "Isolatie / schil",
      severity: "required", // <-- WAS 'recommended'
    },
    {
      fieldId: "ventilatie",
      label: "Ventilatie",
      severity: "required", // <-- WAS 'recommended'
    },
    {
      fieldId: "verwarming",
      label: "Verwarming",
      severity: "required", // <-- WAS 'recommended'
    },
  ],

  duurzaam: [
    {
      fieldId: "energieLabel",
      label: "Energie-doelstelling / verduurzaming",
      severity: "recommended",
    },
  ],

  risico: [
    {
      fieldId: "risks",
      label: "Risico's en aandachtspunten",
      severity: "recommended",
    },
  ],
};

/**
 * Check if a value exists and is not empty
 */
function hasValue(value: any): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  // Budget kan onbekend zijn; als het er wél staat (ook 0), dan telt het als ingevuld.
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return !!value;
}

/**
 * Get the value from state for a specific chapter field
 */
function getFieldValue(
  state: WizardState,
  chapter: ChapterKey,
  fieldId: string
): any {
  const chapterData = state.chapterAnswers?.[chapter];
  if (!chapterData) return null;

  // Eenvoudige ondersteuning voor bv. "rooms[0].name":
  // Voor essentials is "heeft deze lijst items" genoeg.
  if (fieldId.includes("[")) {
    const baseField = fieldId.split("[")[0];
    return (chapterData as any)[baseField];
  }

  return (chapterData as any)[fieldId];
}

/**
 * Compute all missing REQUIRED fields from wizard state
 * (recommended wordt NIET meegenomen als blocking)
 */
export function computeMissingFields(
  state: WizardState
): MissingItem[] {
  const out: MissingItem[] = [];

  const chapters: ChapterKey[] = [
    "basis",
    "ruimtes",
    "wensen",
    "budget",
    "techniek",
    "duurzaam",
    "risico",
  ];

  for (const chapter of chapters) {
    const essentialFields = ESSENTIALS[chapter] || [];

    for (const field of essentialFields) {
      if (field.severity !== "required") continue;

      const value = getFieldValue(
        state,
        chapter,
        field.fieldId
      );

      if (!hasValue(value)) {
        out.push({
          chapter,
          fieldId: field.fieldId,
          label: field.label,
          severity: "required",
        });
      }
    }
  }

  return out;
}

/**
 * Bepaal de "volgende beste" missing field
 * Prioriteit:
 * 1) required in huidige hoofdstuk
 * 2) required in andere hoofdstukken
 */
export function nextMissing(
  state: WizardState,
  currentChapter?: ChapterKey | null
): MissingItem | null {
  const all = computeMissingFields(state);
  if (all.length === 0) return null;

  if (currentChapter) {
    const inCurrent = all.find(
      (m) =>
        m.chapter === currentChapter &&
        m.severity === "required"
    );
    if (inCurrent) return inCurrent;
  }

  const required = all.find(
    (m) => m.severity === "required"
  );
  if (required) return required;

  return all[0] ?? null;
}

/**
 * Groepeer ontbrekende required items per hoofdstuk
 */
export function groupMissingByChapter(
  state: WizardState
): Record<ChapterKey, MissingItem[]> {
  const all = computeMissingFields(state);
  return all.reduce(
    (acc, m) => {
      if (!acc[m.chapter]) acc[m.chapter] = [];
      acc[m.chapter].push(m);
      return acc;
    },
    {} as Record<ChapterKey, MissingItem[]>
  );
}

/**
 * Is alle verplichte basis gevuld?
 */
export function isComplete(
  state: WizardState
): boolean {
  return computeMissingFields(state).length === 0;
}

/**
 * Completion-percentage op basis van REQUIRED essentials
 */
export function getCompletionPercentage(
  state: WizardState
): number {
  let total = 0;
  let filled = 0;

  const chapters: ChapterKey[] = [
    "basis",
    "ruimtes",
    "wensen",
    "budget",
    "techniek",
    "duurzaam",
    "risico",
  ];

  for (const chapter of chapters) {
    const essentialFields = ESSENTIALS[chapter] || [];

    for (const field of essentialFields) {
      if (field.severity !== "required") continue;
      total++;
      const value = getFieldValue(
        state,
        chapter,
        field.fieldId
      );
      if (hasValue(value)) filled++;
    }
  }

  return total > 0
    ? Math.round((filled / total) * 100)
    : 0;
}
