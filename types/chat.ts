export type Mode = "PREVIEW" | "PREMIUM";

export type ClientFastIntent = {
  type:
    | "NAVIGATE"
    | "SET_BUDGET_DELTA"
    | "SET_ROOMS"
    | "SET_PROJECT_NAME"
    | "FOCUS_FIELD";
  payload?: any;
  confidence: number; // 0..1
};

export type WizardState = {
  stateVersion: number;
  triage?: {
    project_type?: string | null;
    project_size?: "klein" | "midden" | "groot" | null;
  } | null;
  chapterAnswers?: Record<string, any>;
};

export type ChatRequest = {
  query: string;
  clientFastIntent?: ClientFastIntent | null;
  wizardState: WizardState;
  mode: Mode;
};

export type Intent =
  | "VULLEN_DATA"
  | "ADVIES_VRAAG"
  | "NAVIGATIE"
  | "SMALLTALK"
  | "OUT_OF_SCOPE";

export type Policy =
  | "APPLY_OPTIMISTIC"
  | "APPLY_WITH_INLINE_VERIFY"
  | "ASK_CLARIFY"
  | "CLASSIFY";

export type Delta =
  | { kind: "number:add"; path: string; value: number }
  | { kind: "array:append"; path: string; value: unknown }
  | { kind: "object:merge"; path: string; value: Record<string, unknown> };

export type PatchEnvelope = {
  chapter: string;
  delta: Delta;
};

export type RagMeta = {
  activated: boolean;
  topicId?: string;
  cacheHit?: boolean;
  docCount?: number;
};

export type ChatResponse = {
  intent: Intent;
  confidence: number;
  policy: Policy;
  patch?: PatchEnvelope | null;
  response: string;
  nudge?: string | null;
  rag?: RagMeta | null;
  metadata: {
    latencyMs: Record<string, number>;
    tokensUsed?: Record<string, number>;
    logId: string;
  };
};

export const ConfidencePolicy = {
  for(confidence: number): Policy {
    if (confidence >= 0.95) return "APPLY_OPTIMISTIC";
    if (confidence >= 0.7) return "APPLY_WITH_INLINE_VERIFY";
    if (confidence >= 0.5) return "ASK_CLARIFY";
    return "CLASSIFY";
  },
};
