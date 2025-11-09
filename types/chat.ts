// /types/chat.ts
// Canonische types afgestemd op je bestaande useWizardState, ChatPanel,
// WizardRouter, ExportModal en ProModel (Build v2.0 compatible).

// ─────────────────────────────────────────────
// Hoofdstukken (wizard + navigatie)
// ─────────────────────────────────────────────

export type ChapterKey =
  | "basis"
  | "wensen"
  | "ruimtes"
  | "budget"
  | "techniek"
  | "duurzaam"
  | "risico"
  | "preview"
  | (string & {}); // future-safe / server kan andere keys pushen

// ─────────────────────────────────────────────
// Triage data
// ─────────────────────────────────────────────

export interface TriageData {
  projectType?: string;
  projectSize?: string;
  intent?: string[];          // bijv. ["structured"], ["exploratory"]
  urgentie?: string;          // oude key
  urgency?: string;           // nieuwe / gebruikte key in UI & exports
  budget?: number;
  currentChapter?: ChapterKey;
}

// ─────────────────────────────────────────────
// Shared WizardState (client + server contract)
// Dit is precies de "basis" waar WizardStore op voortbouwt.
// ─────────────────────────────────────────────

export interface WizardState {
  stateVersion: number;

  triage?: TriageData;
  chapterAnswers?: Record<string, any>;

  currentChapter?: ChapterKey;
  chapterFlow?: ChapterKey[];

  focusedField?: string | null;
  showExportModal?: boolean;
}

// ─────────────────────────────────────────────
// Chat / SSE types (sluit aan op bestaande code)
// ─────────────────────────────────────────────

export interface ChatRequest {
  query: string;
  wizardState: WizardState;
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: {
    type: string;
    confidence: number;
    action?: string;
    chapter?: ChapterKey;
    field?: string;
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

export interface MetadataEvent {
  intent:
    | "VULLEN_DATA"
    | "ADVIES_VRAAG"
    | "NAVIGATIE"
    | "NUDGE"
    | "SMALLTALK"
    | "CLASSIFY";
  confidence: number;
  policy:
    | "APPLY_OPTIMISTIC"
    | "APPLY_WITH_INLINE_VERIFY"
    | "ASK_CLARIFY"
    | "CLASSIFY";
  nudge?: string;
  stateVersion: number;
}

export interface PatchDelta {
  path: string;
  operation: "add" | "set" | "append" | "remove";
  value?: any;
}

export interface PatchEvent {
  chapter: ChapterKey | string;
  delta: PatchDelta;
}

export interface StreamEvent {
  text: string;
}

export interface RAGMetadataEvent {
  topicId: string;
  docsRetrieved: number;
  cacheHit: boolean;
}

export interface DoneEvent {
  logId: string;
  tokensUsed: number;
  latencyMs: number;
}

export interface ErrorEvent {
  message: string;
}

export type ChatSSEEvent =
  | { event: "metadata"; data: MetadataEvent }
  | { event: "patch"; data: PatchEvent }
  | { event: "navigate"; data: { chapter?: ChapterKey } }
  | { event: "stream"; data: StreamEvent }
  | { event: "rag_metadata"; data: RAGMetadataEvent }
  | { event: "done"; data: DoneEvent }
  | { event: "error"; data: ErrorEvent };

export interface ChatResponse {
  intent: MetadataEvent["intent"];
  confidence: number;
  policy: MetadataEvent["policy"];
  patch?: PatchEvent;
  response: string;
  nudge?: string;
  metadata?: {
    latencyMs: number;
    tokensUsed: number;
    conflict?: boolean;
  };
}
