// types/pveCheck.ts — PvE Check v5.1 types
import type {
  ChapterDataMap,
  ChapterKey,
  PatchEvent,
  Risk,
  RiskSeverity,
} from "@/types/project";
import type { MissingItem } from "@/lib/ai/missing";

// ============================================================================
// CONSTANTS
// ============================================================================

export const RUBRIC_VERSION = "2026-02-23";

// ============================================================================
// INTAKE
// ============================================================================

export type PveProjectType =
  | "nieuwbouw"
  | "verbouwing"
  | "bijgebouw"
  | "hybride"
  | "anders";

export type PveBudgetRange =
  | "< €100k"
  | "€100k-€250k"
  | "€250k-€500k"
  | "€500k-€1M"
  | "> €1M";

export type PveDuurzaamheidsAmbitie =
  | "basis"
  | "normaal"
  | "ambitieus"
  | "zeer_ambitieus";

export type PveAnalyseDoel = "architect" | "aannemer";

export type PveQuickAnswers = Record<string, string>;

export type PveCheckIntakeData = {
  archetype: string;
  projectType: PveProjectType;
  locatie: string;
  postcode4?: string;
  budgetRange: PveBudgetRange;
  bouwjaar?: string;
  duurzaamheidsAmbitie: PveDuurzaamheidsAmbitie;
  analyseDoel?: PveAnalyseDoel;
  /**
   * User-provided answers from the "Snel aanvullen" flow.
   * Key should match rubric item id (e.g. "budget.budgetTotaal").
   */
  quickAnswers?: PveQuickAnswers;
};

// ============================================================================
// DOCUMENT EXTRACTION
// ============================================================================

export type PveDocStats = {
  pageCount: number;
  wordCount: number;
  textHash: string;
};

export type PveExtractResult = {
  text: string;
  textHash: string;
  pageCount: number;
  wordCount: number;
  format: "pdf" | "docx";
  pages: string[];
  documentName: string;
  mime: string;
};

// ============================================================================
// EVIDENCE
// ============================================================================

export type EvidenceRef = {
  snippet: string;
  page: number;
  startOffset: number;
  endOffset: number;
};

// ============================================================================
// RUBRIC
// ============================================================================

export type GapSeverity = "critical" | "important" | "nice_to_have";
export type GapFixEffort = "XS" | "S" | "M";

export type PveRubricItem = {
  id: string;
  chapter: ChapterKey;
  fieldId: string;
  label: string;
  severity: GapSeverity;
  fixEffort: GapFixEffort;
  weight: number;
  keywords: string[];
  qualityCriteria: string;
  riskOverlay: string;
  pitfalls: string[];
  exampleGood: string;
};

export type PveRubric = {
  version: string;
  items: PveRubricItem[];
};

// ============================================================================
// CLASSIFY (LLM output)
// ============================================================================

export type PveClassifiedField = {
  fieldId: string;
  chapter: ChapterKey;
  value: unknown;
  confidence: number;
  evidence?: EvidenceRef;
  vague: boolean;
  vagueReason?: string;
  /** LLM: what the document says well about this field */
  observation?: string;
  /** LLM: what's missing or weak about this field */
  weakness?: string;
  /** LLM: exact quote from the document (max ~200 chars) */
  quote?: string;
};

/** LLM context for missing fields — used by gaps.ts for document-specific reasons */
export type PveMissingFieldContext = {
  fieldId: string;
  whyMissing: string;
  nearbyContext: string;
};

export type PveClassifyResult = {
  mappedData: Partial<ChapterDataMap>;
  fields: PveClassifiedField[];
  nudgeSummary: string | null;
  /** LLM-generated 1-2 sentence summary of the document itself (replaces intake-context nudge) */
  documentSummary?: string;
  evidenceSnippets: EvidenceRef[];
  /** LLM-provided context per missing field (why missing + what's nearby). Plain object for JSON serializability. */
  missingFieldContext: Record<string, PveMissingFieldContext>;
};

// ============================================================================
// SCORING
// ============================================================================

export type ChapterScore = {
  chapter: ChapterKey;
  label: string;
  score: number;
  gapCount: number;
  criticalGapCount: number;
};

export type PveScoreResult = {
  overallScore: number;
  chapterScores: ChapterScore[];
};

// ============================================================================
// GAPS
// ============================================================================

export type PveGap = {
  id: string;
  chapter: ChapterKey;
  fieldId: string;
  label: string;
  severity: GapSeverity;
  fixEffort: GapFixEffort;
  /** Technical explanation (evidence/rubric driven) */
  reason: string;
  /** Human-friendly explanation shown alongside the technical reason (A3) */
  friendlyReason?: string;
  riskOverlay: string;
  evidence?: EvidenceRef;
  currentValue?: string;
  suggestedImprovement?: string;
  patchEvent?: PatchEvent;
  isVagueness: boolean;
  isConflict: boolean;
  conflictWith?: string[];
  /** Kennisbank advice for this gap (set during enrichment) */
  knowledgeHint?: string;
};

// ============================================================================
// CONFLICTS
// ============================================================================

export type HeadlineConflictType =
  | "budget_vs_ambition"
  | "planning_vs_permit"
  | "install_vs_space"
  | "structural_vs_scope"
  | "sustainability_vs_comfort"
  | "scope_vs_responsibility";

export type HeadlineConflict = {
  id: string;
  type: HeadlineConflictType;
  title: string;
  severity: RiskSeverity;
  summary: string;
  relatedFieldIds: string[];
  suggestedNextStep: string;
};

// ============================================================================
// MAPPED DATA
// ============================================================================

export type PveCheckMappedData = {
  mappedChapterData: Partial<ChapterDataMap>;
  patchEvents: PatchEvent[];
  derived: {
    missing: MissingItem[];
    risks: Risk[];
    warnings: string[];
  };
  /** Benchmark deltas — stored here to avoid a separate DB column */
  benchmarkDeltas?: PveBenchmarkDelta[];
  /** P3: compact top-5 action plan based on gaps/conflicts/chapter scores */
  chunkSummary?: PveChunkSummary;
};

// ============================================================================
// PATCHES
// ============================================================================

export type PvePatchPlan = {
  gapId: string;
  fieldId: string;
  suggestedText: string;
  patchEvent?: PatchEvent;
  validated: boolean;
};

// ============================================================================
// BENCHMARK
// ============================================================================

export type PveBenchmarkDelta = {
  metric: string;
  projectType: PveProjectType;
  value: number | null;
  benchmark: number;
  delta: number | null;
};

// ============================================================================
// CHUNK SUMMARY (P3)
// ============================================================================

export type PveChunkActionItem = {
  chapter: ChapterKey;
  fieldId: string;
  label: string;
  severity: GapSeverity;
  fixEffort: GapFixEffort;
  impactScore: number;
  whyNow: string;
  suggestedNextStep: string;
};

export type PveChunkSummary = {
  totalGapCount: number;
  criticalCount: number;
  weakestChapter: ChapterKey | null;
  top5Actions: PveChunkActionItem[];
  followUpQuestions: string[];
  oneLineSummary: string;
};

// ============================================================================
// RESULT (full DB row → frontend)
// ============================================================================

export type ReviewStatus =
  | "none"
  | "pending"
  | "approved"
  | "needs_adjustment";

export type ReviewIssueType =
  | "rubric_gap"
  | "conflict_missed"
  | "vagueness_undetected"
  | "severity_wrong"
  | "llm_mapping_error"
  | "no_issue";

export type PveCheckResult = {
  id: string;
  createdAt: string;
  intake: PveCheckIntakeData;
  intakeHash: string;
  documentId: string;
  documentName: string;
  docStats: PveDocStats;
  nudgeSummary: string | null;
  rubricVersion: string;
  overallScore: number;
  chapterScores: ChapterScore[];
  gaps: PveGap[];
  conflicts: HeadlineConflict[];
  mapped: PveCheckMappedData;
  /** LLM-classified fields per rubric item — saved for DocumentReadSection */
  classifyFields?: PveClassifiedField[];
  criticalGapCount: number;
  conflictCount: number;
  isPremium: boolean;
  paymentIntentId?: string;
  reviewStatus: ReviewStatus;
  reviewCheckedAt?: string;
  reviewNotes?: Record<string, unknown>;
};

// ============================================================================
// ANALYZE API OUTPUT (public response)
// ============================================================================

export type PveAnalyzeOutput = {
  resultId: string;
  idempotent: boolean;
  result: PveCheckResult;
};
