// /types/chat.ts
// ✅ Single source of truth: gebruik de WizardState/TriageData uit /types/wizard
export type { WizardState, TriageData } from "@/types/wizard";

// Overige types die specifiek zijn voor chat/SSE

export interface ChatRequest {
  query: string;
  wizardState: import("@/types/wizard").WizardState;
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: {
    type: string;
    confidence: number;
    action?: string;
    chapter?: string;
    field?: string;
  };
}

// === SSE events ===
export type ChatSSEEventType =
  | "metadata"
  | "patch"
  | "stream"
  | "rag_metadata"
  | "error"
  | "done";

export interface ChatSSEEvent {
  event: ChatSSEEventType;
  data: string; // JSON-stringified payload
}

export type PolicyType =
  | "APPLY_OPTIMISTIC"
  | "APPLY_WITH_INLINE_VERIFY"
  | "ASK_CLARIFY"
  | "CLASSIFY";

export interface MetadataEvent {
  intent:
    | "VULLEN_DATA"
    | "ADVIES_VRAAG"
    | "NAVIGATIE"
    | "NUDGE"
    | "SMALLTALK";
  confidence: number; // 0.0–1.0
  policy: PolicyType;
  nudge?: string;
  stateVersion: number;
}

export interface PatchEvent {
  chapter: string;
  delta: {
    path: string; // e.g. "rooms" of "wensen[0]"
    operation: "add" | "set" | "append" | "remove";
    value?: any;
  };
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
