// /types/wizard.ts
// Dunne wrapper rond de centrale chat/wizard types.

import type { ChapterKey, TriageData, WizardState } from "./chat";

export type { ChapterKey, TriageData, WizardState };

// ProjectType gebruikt in ExportModal / buildPreview mapping
export type ProjectType =
  | "nieuwbouw"
  | "verbouw"
  | "aanbouw"
  | "dakopbouw"
  | "renovatie"
  | "interieur"
  | "herbestemming"
  | "overig";
