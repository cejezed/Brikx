// /types/chat.ts
// Chat- & SSE-contract volgens BRIKX BUILD MANIFEST v3.0
// Belangrijk: project-types via import("./project") refereren (geen lokale schaduwtypes)

// Re-export: maak van chat.ts de centrale hub
export type {
  ChapterKey,
  PatchEvent,
  PatchDelta,
  WizardState,
  BasisData,
} from "./project";

// ==== Intent & Policy ====
export type Intent =
  | "VULLEN_DATA"
  | "ADVIES_VRAAG"
  | "NAVIGATIE"
  | "NUDGE"
  | "SMALLTALK"
  | "CLASSIFY";

export type Policy =
  | "APPLY_OPTIMISTIC"
  | "APPLY_WITH_INLINE_VERIFY"
  | "ASK_CLARIFY"
  | "JUST_ANSWER"
  | "JUST_NUDGE"
  | "IGNORE";

// ==== Events ====
export interface MetadataEvent {
  intent: Intent;
  confidence: number; // 0.0 - 1.0
  policy: Policy;
  stateVersion: number;
}

export interface StreamEvent {
  text: string;
  done?: boolean;
}

export interface ErrorEvent {
  message: string;
  recoverable?: boolean;
}

export interface RagMetadataEvent {
  nuggets: Array<{
    id: string;
    title: string;
    source: string;
    relevance: number;
    tags?: string[];
  }>;
}

// Navigatie-event naar een specifiek hoofdstuk
export interface NavigateEvent {
  chapter: import("./project").ChapterKey;
}

// ==== SSE ====
export type ChatSSEEventName =
  | "metadata"
  | "patch"
  | "stream"
  | "rag_metadata"
  | "navigate"
  | "error"
  | "done";

export type ChatSSEEvent =
  | { event: "metadata"; data: MetadataEvent }
  | { event: "patch"; data: import("./project").PatchEvent }
  | { event: "stream"; data: StreamEvent }
  | { event: "rag_metadata"; data: RagMetadataEvent }
  | { event: "navigate"; data: NavigateEvent }
  | { event: "error"; data: ErrorEvent }
  | { event: "done"; data: string };

// ==== Client Fast Intent ====
export interface ClientFastIntent {
  type: string;
  confidence: number;
  action?: string;
  chapter?: import("./project").ChapterKey;
  field?: string;
}

// ==== Chat request/response ====
export interface ChatRequest {
  query: string;
  wizardState: import("./project").WizardState; // gedeelde state
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: ClientFastIntent;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface ChatResponse {
  intent: Intent;
  confidence: number;
  policy: Policy;
  patch?: import("./project").PatchEvent; // ONLY 'set' | 'append' | 'remove'
  response: string;
  nudge?: string;
  metadata?: {
    latencyMs?: number;
    tokensUsed?: number;
    conflict?: boolean;
  };
}

// ==== Legacy/compat: TriageData (alleen als hulp-type voor oude utils) ====
export interface TriageData {
  projectType?: string | null;
  ervaring?: "starter" | "gemiddeld" | "ervaren" | string | null;
  intent?: string | null;
  urgentie?: "laag" | "normaal" | "hoog" | string | null;
  budget?: number | null;
}
// Tip: langzaam uitfaseren; triage hoort niet in WizardState.
