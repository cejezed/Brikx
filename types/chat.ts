// /types/chat.ts

export interface TriageData {
  projectType?: string;
  projectSize?: string;
  urgency?: string;
  budget?: number;
  intent?: string[];
  currentChapter?: string;
}

export interface WizardState {
  stateVersion: number;
  chapterAnswers?: Record<string, any>;
  triage?: TriageData;
  currentChapter?: string;
  focusedField?: string;
}

export interface ChatRequest {
  query: string;
  wizardState: WizardState;
  mode: "PREVIEW" | "PREMIUM";
  clientFastIntent?: {
    type: string;
    confidence: number;
    action?: string;
    chapter?: string;
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
  intent: "VULLEN_DATA" | "ADVIES_VRAAG" | "NAVIGATIE" | "NUDGE" | "SMALLTALK" | "CLASSIFY";
  confidence: number;
  policy: "APPLY_OPTIMISTIC" | "APPLY_WITH_INLINE_VERIFY" | "ASK_CLARIFY" | "CLASSIFY";
  nudge?: string;
  stateVersion: number;
}

export interface NavigateEvent {
  chapter: "basis" | "budget" | "ruimtes" | "wensen" | "techniek" | "duurzaamheid" | "risico" | "preview";
}

export interface PatchEvent {
  chapter: string;
  delta: {
    path: string; // "" = append op hoofdstuk-root (array)
    operation: "add" | "set" | "append" | "remove";
    value?: any;
  };
}

export interface StreamEvent { text: string; }
export interface RAGMetadataEvent { topicId: string; docsRetrieved: number; cacheHit: boolean; }
export interface DoneEvent { logId: string; tokensUsed: number; latencyMs: number; }
