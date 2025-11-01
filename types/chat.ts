// /types/chat.ts
// Canonical types — Build v2.0

export type ChatMode = "PREVIEW" | "PREMIUM";

export type ChapterKey =
  | "basis"
  | "budget"
  | "ruimtes"
  | "wensen"
  | "techniek"
  | "duurzaamheid"
  | "risico"
  | "preview";

export type ErvaringLevel = "starter" | "ervaren";

export interface TriageData {
  projectType?: string;      // "nieuwbouw" | "verbouwing" | "aanbouw" | ...
  projectSize?: string;      // "klein" | "middel" | "groot" | ...
  intent?: string[];         // bv. ["uitbouw","zolder","duurzaam"]
  budget?: number;           // totaalbudget in euro's
  currentChapter?: ChapterKey;

  // Canoniek (NL) conform Build v2.0:
  urgentie?: string;         // bv. "nu", "3-6 mnd", "6-12 mnd"
  ervaring?: ErvaringLevel;  // "starter" | "ervaren"

  /** @deprecated Gebruik 'urgentie'. Gelaten voor backward-compat. */
  urgency?: string;
}

export interface WizardState {
  stateVersion: number;
  chapterAnswers?: Record<string, any>;
  triage?: TriageData;
  currentChapter?: ChapterKey;
  focusedField?: string;
  showExportModal?: boolean; // voor ExportModal.tsx usage
}

export type PatchOperation = "set" | "add" | "remove" | "merge" | "append";

export interface PatchEvent {
  chapter: ChapterKey;
  delta: {
    path: string;                 // dotted path of key ("" toegestaan voor speciale helpers)
    operation: PatchOperation;
    value?: any;                  // optioneel voor remove
  };
}

export type ChatSSEEventName =
  | "metadata"
  | "patch"
  | "navigate"
  | "stream"
  | "rag_metadata"
  | "error"
  | "done";

export interface ChatRequest {
  query: string;
  wizardState: WizardState;
  mode: ChatMode;
  clientFastIntent?: {
    type: string;
    confidence: number;
    action?: string;
    chapter?: ChapterKey;
    field?: string;
  };
}

export interface MetadataEvent {
  intent: "VULLEN_DATA" | "ADVIES_VRAAG" | "NAVIGATIE" | "NUDGE" | "SMALLTALK" | "CLASSIFY";
  confidence: number;
  policy: "APPLY_OPTIMISTIC" | "APPLY_WITH_INLINE_VERIFY" | "ASK_CLARIFY" | "CLASSIFY";
  nudge?: string;
  stateVersion: number;
}
