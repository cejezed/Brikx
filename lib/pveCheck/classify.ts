// lib/pveCheck/classify.ts — LLM section classification + nudge + evidence
// P2: Sliding-window chunking — full document coverage
// P5: missingFieldContext as Record (JSON-serializable)
import type { ChapterDataMap, ChapterKey } from "@/types/project";
import type {
  PveClassifiedField,
  PveClassifyResult,
  PveRubric,
  PveRubricItem,
  EvidenceRef,
  PveCheckIntakeData,
  PveMissingFieldContext,
} from "@/types/pveCheck";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";

// ============================================================================
// CHUNKING CONFIG (P2)
// ============================================================================

const CHUNK_SIZE = 8_000;   // chars per chunk sent to LLM
const CHUNK_OVERLAP = 1_000; // overlap between chunks to avoid boundary misses
const CONFIDENCE_THRESHOLD = 0.45; // fields below this go to missingFields

// ============================================================================
// VAGUENESS DETECTION (deterministic, first-class)
// ============================================================================

const VAGUE_TERMS = [
  "ongeveer",
  "misschien",
  "later",
  "onbekend",
  "nog te bepalen",
  "indicatief",
  "eventueel",
  "nader te bepalen",
  "in overleg",
  "afhankelijk van",
  "mogelijk",
  "te zijner tijd",
];

function isVague(text: string): { vague: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const term of VAGUE_TERMS) {
    if (lower.includes(term)) {
      return { vague: true, reason: `Bevat vage term: "${term}"` };
    }
  }
  return { vague: false };
}

// ============================================================================
// EVIDENCE EXTRACTION (deterministic: keyword match in pages[])
// ============================================================================

function findEvidence(
  pages: string[],
  keywords: string[],
  _text: string,
): EvidenceRef | undefined {
  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = pages[pageIdx];
    if (!pageText) continue;

    const lower = pageText.toLowerCase();
    for (const keyword of keywords) {
      const idx = lower.indexOf(keyword.toLowerCase());
      if (idx === -1) continue;

      const snippetStart = Math.max(0, idx - 100);
      const snippetEnd = Math.min(pageText.length, idx + keyword.length + 300);
      const snippet = pageText.slice(snippetStart, snippetEnd).trim();

      return {
        snippet: snippet.slice(0, 400),
        page: pageIdx + 1,
        startOffset: idx,
        endOffset: idx + keyword.length,
      };
    }
  }
  return undefined;
}

// ============================================================================
// NUDGE (Build v2.0 Pijler 1) — before LLM call
// ============================================================================

export function buildNudge(intake: PveCheckIntakeData): string {
  const parts: string[] = [];
  parts.push(`Project: ${intake.archetype} (${intake.projectType})`);
  parts.push(`Locatie: ${intake.locatie}`);
  parts.push(`Budget: ${intake.budgetRange}`);
  parts.push(`Duurzaamheid: ${intake.duurzaamheidsAmbitie}`);
  parts.push(`Doel: ${intake.analyseDoel ?? "architect"}`);
  if (intake.bouwjaar) parts.push(`Bouwjaar: ${intake.bouwjaar}`);
  const quickEntries = Object.entries(intake.quickAnswers ?? {}).filter(
    ([, value]) => value.trim().length > 0,
  );
  if (quickEntries.length > 0) {
    const formatted = quickEntries
      .slice(0, 8)
      .map(([fieldId, value]) => `${fieldId}=${value}`)
      .join("; ");
    parts.push(`Aanvullende antwoorden gebruiker: ${formatted}`);
  }
  return parts.join(". ") + ".";
}

function buildGoalDirective(intake: PveCheckIntakeData): string {
  const doel = intake.analyseDoel ?? "architect";
  if (doel === "aannemer") {
    return "FOCUS AANNEMER: beoordeel extra streng op uitvoeringsduidelijkheid (maatvoering, materialen, planning, verantwoordelijkheden, toetsbare eisen voor offerte).";
  }
  return "FOCUS ARCHITECT: beoordeel extra streng op ontwerpkaders (ruimteprogramma, functionele eisen, kwaliteitsniveau, prioriteiten en randvoorwaarden).";
}

// ============================================================================
// LLM CLASSIFICATION — per chunk
// ============================================================================

type LLMClassifyField = {
  fieldId: string;
  chapter: string;
  value: string;
  confidence: number;
  quote: string;
  observation: string;
  weakness: string;
};

type LLMMissingField = {
  fieldId: string;
  whyMissing: string;
  nearbyContext: string;
};

type LLMClassifyResponse = {
  fields: LLMClassifyField[];
  missingFields: LLMMissingField[];
  documentSummary?: string;
};

function buildSystemPrompt(
  rubric: PveRubric,
  nudgeSummary: string,
  chunkInfo: string,
  goalDirective: string,
): string {
  const fieldList = rubric.items
    .map(
      (item) =>
        `- ${item.id} (chapter: ${item.chapter}, field: ${item.fieldId}): ${item.label}. Keywords: ${item.keywords.join(", ")}. Kwaliteitscriterium: ${item.qualityCriteria}`,
    )
    .join("\n");

  return `Je bent een senior bouwkundig adviseur die een Programma van Eisen (PvE) beoordeelt.

CONTEXT: ${nudgeSummary}
${chunkInfo}
${goalDirective}

RUBRIC VELDEN (beoordeel ALLEEN deze velden — voeg geen andere toe):
${fieldList}

OPDRACHT:
Lees het tekstfragment grondig. Per rubric-veld:
1. Bepaal of DIT FRAGMENT dit onderwerp behandelt
2. Als JA (confidence ≥ ${CONFIDENCE_THRESHOLD}): citeer de tekst, beoordeel kwaliteit, benoem zwaktes
3. Als NEE of twijfelachtig: zet in missingFields met uitleg

JSON FORMAAT (antwoord ALLEEN hiermee):
{
  "documentSummary": "<1-2 zinnen: wat voor document is dit, wat is de scope/fase, hoe volledig voelt het aan? Specifiek voor DIT document, niet generiek.>",
  "fields": [
    {
      "fieldId": "<rubric-item-id, exact>",
      "chapter": "<chapter>",
      "value": "<samenvatting van wat het fragment zegt>",
      "confidence": <0.0-1.0>,
      "quote": "<EXACT citaat uit het fragment, max 200 tekens>",
      "observation": "<wat goed is, 1 zin>",
      "weakness": "<wat ontbreekt/zwak is en WAAROM dat problematisch is voor dit project, 1 zin>"
    }
  ],
  "missingFields": [
    {
      "fieldId": "<rubric-item-id>",
      "whyMissing": "<waarom dit een probleem is voor DIT specifieke project>",
      "nearbyContext": "<gerelateerde tekst die er wel staat, of 'Geen'>"
    }
  ]
}

REGELS:
- quote = LETTERLIJK citaat, niet parafraseren
- confidence < ${CONFIDENCE_THRESHOLD} → altijd missingFields, nooit fields
- weakness: specifiek voor dit project, niet generiek
- Vermeld ALLEEN velden die in DIT fragment staan — niet speculeren over andere delen van het document`;
}

async function llmClassifyChunk(
  chunk: string,
  rubric: PveRubric,
  nudgeSummary: string,
  chunkInfo: string,
  goalDirective: string,
): Promise<LLMClassifyResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(rubric, nudgeSummary, chunkInfo, goalDirective) },
        { role: "user", content: `Beoordeel dit PvE-fragment:\n\n${chunk}` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { fields: [], missingFields: [] };

  try {
    const parsed = JSON.parse(content) as LLMClassifyResponse;
    return {
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      documentSummary: typeof parsed.documentSummary === "string" ? parsed.documentSummary : undefined,
    };
  } catch {
    return { fields: [], missingFields: [] };
  }
}

// ============================================================================
// CHUNKING (P2)
// ============================================================================

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    // Try to break at a paragraph boundary
    let breakPoint = end;
    if (end < text.length) {
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > start + CHUNK_SIZE * 0.6) {
        breakPoint = lastNewline + 1;
      }
    }
    chunks.push(text.slice(start, breakPoint));
    if (breakPoint >= text.length) break;
    start = breakPoint - CHUNK_OVERLAP; // overlap
  }
  return chunks;
}

// ============================================================================
// MERGE CHUNK RESULTS — highest confidence per fieldId wins (P2)
// ============================================================================

function mergeChunkResults(results: LLMClassifyResponse[]): LLMClassifyResponse {
  // Best field per fieldId (highest confidence)
  const bestFields = new Map<string, LLMClassifyField>();
  for (const result of results) {
    for (const field of result.fields) {
      const existing = bestFields.get(field.fieldId);
      if (!existing || field.confidence > existing.confidence) {
        bestFields.set(field.fieldId, field);
      }
    }
  }

  // Missing field context: collect from all chunks, prefer most specific
  // A field is "missing" only if NO chunk found it with confidence >= threshold
  const missingMap = new Map<string, LLMMissingField>();
  for (const result of results) {
    for (const mf of result.missingFields) {
      // Skip if it was found in another chunk
      if (bestFields.has(mf.fieldId)) continue;
      // Keep the entry with most context
      const existing = missingMap.get(mf.fieldId);
      if (!existing || mf.nearbyContext.length > existing.nearbyContext.length) {
        missingMap.set(mf.fieldId, mf);
      }
    }
  }

  // documentSummary: use the first chunk's summary (it has full context intro)
  const documentSummary = results.find(r => r.documentSummary)?.documentSummary;

  return {
    fields: Array.from(bestFields.values()),
    missingFields: Array.from(missingMap.values()),
    documentSummary,
  };
}

// ============================================================================
// MAPPED DATA BUILDER
// ============================================================================

function addMappedValue(
  mappedData: Partial<ChapterDataMap>,
  chapter: ChapterKey,
  fieldId: string,
  value: unknown,
): void {
  const data = mappedData as Record<string, Record<string, unknown> | undefined>;
  const chapterData = (data[chapter] ?? {}) as Record<string, unknown>;
  chapterData[fieldId] = value;
  data[chapter] = chapterData;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function classifyDocument(params: {
  text: string;
  pages: string[];
  rubric: PveRubric;
  intake: PveCheckIntakeData;
}): Promise<PveClassifyResult> {
  // Step 1: Build nudge
  const nudgeSummary = buildNudge(params.intake);
  const goalDirective = buildGoalDirective(params.intake);

  // Step 2: Split into chunks + classify each in parallel (P2)
  const chunks = splitIntoChunks(params.text);
  const totalChunks = chunks.length;
  console.log(`[classify] ${totalChunks} chunk(s) for ${params.text.length} chars`);

  const chunkResults = await Promise.all(
    chunks.map((chunk, i) =>
      llmClassifyChunk(
        chunk,
        params.rubric,
        nudgeSummary,
        totalChunks > 1
          ? `Dit is fragment ${i + 1} van ${totalChunks} van het document.`
          : "Dit is het volledige document.",
        goalDirective,
      ).catch((err) => {
        console.error(`[classify] Chunk ${i + 1} failed:`, err);
        return { fields: [], missingFields: [] } as LLMClassifyResponse;
      }),
    ),
  );

  // Step 3: Merge results across chunks
  const merged = mergeChunkResults(chunkResults);

  // Step 4: Build rubric map
  const rubricMap = new Map<string, PveRubricItem>();
  for (const item of params.rubric.items) {
    rubricMap.set(item.id, item);
  }

  // Step 5: Build PveClassifiedField[] with evidence + vagueness
  const mappedData: Partial<ChapterDataMap> = {};
  const fields: PveClassifiedField[] = [];
  const evidenceSnippets: EvidenceRef[] = [];

  for (const llmField of merged.fields) {
    const rubricItem = rubricMap.get(llmField.fieldId);
    if (!rubricItem) continue;

    // Enforce confidence threshold — below it goes to structural gaps
    if (llmField.confidence < CONFIDENCE_THRESHOLD) {
      // Treat as missing
      if (!merged.missingFields.find((m) => m.fieldId === llmField.fieldId)) {
        merged.missingFields.push({
          fieldId: llmField.fieldId,
          whyMissing: llmField.weakness || `${rubricItem.label} is onvoldoende uitgewerkt (confidence: ${llmField.confidence.toFixed(2)}).`,
          nearbyContext: llmField.quote || llmField.value || "Geen",
        });
      }
      continue;
    }

    const chapter = rubricItem.chapter;
    const valueStr = typeof llmField.value === "string" ? llmField.value : String(llmField.value ?? "");

    const vagueCheck = isVague(valueStr);

    let evidence = findEvidence(params.pages, rubricItem.keywords, params.text);
    if (!evidence && llmField.quote) {
      evidence = findEvidence(params.pages, [llmField.quote.slice(0, 50)], params.text);
    }

    addMappedValue(mappedData, chapter, rubricItem.fieldId, llmField.value);

    fields.push({
      fieldId: llmField.fieldId,
      chapter,
      value: llmField.value,
      confidence: llmField.confidence,
      evidence,
      vague: vagueCheck.vague,
      vagueReason: vagueCheck.reason,
      observation: llmField.observation || undefined,
      weakness: llmField.weakness || undefined,
      quote: llmField.quote || undefined,
    });

    if (evidence) evidenceSnippets.push(evidence);
  }

  // Step 6: missingFieldContext as Record (P5 — JSON-serializable)
  const missingFieldContext: Record<string, PveMissingFieldContext> = {};
  for (const mf of merged.missingFields) {
    missingFieldContext[mf.fieldId] = {
      fieldId: mf.fieldId,
      whyMissing: mf.whyMissing,
      nearbyContext: mf.nearbyContext,
    };
  }

  // Step 7: Validate mapped data per chapter
  for (const chapter of Object.keys(mappedData) as ChapterKey[]) {
    const chapterData = (mappedData as Record<string, unknown>)[chapter];
    if (!validateChapter(chapter, chapterData)) {
      console.warn(`[classify] Chapter ${chapter} failed validation, keeping raw data`);
    }
  }

  return {
    mappedData,
    fields,
    nudgeSummary,
    documentSummary: merged.documentSummary,
    evidenceSnippets,
    missingFieldContext,
  };
}
