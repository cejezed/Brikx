// lib/pveCheck/classify.ts — LLM section classification + nudge + evidence
// gpt-4o-mini for cost efficiency (~€0.01-0.05 per call)
import type { ChapterDataMap, ChapterKey } from "@/types/project";
import type {
  PveClassifiedField,
  PveClassifyResult,
  PveRubric,
  PveRubricItem,
  EvidenceRef,
  PveCheckIntakeData,
} from "@/types/pveCheck";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";

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

      // Extract a snippet around the keyword (max 400 chars)
      const snippetStart = Math.max(0, idx - 100);
      const snippetEnd = Math.min(pageText.length, idx + keyword.length + 300);
      const snippet = pageText.slice(snippetStart, snippetEnd).trim();

      return {
        snippet: snippet.slice(0, 400),
        page: pageIdx + 1, // 1-indexed
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

  if (intake.bouwjaar) {
    parts.push(`Bouwjaar: ${intake.bouwjaar}`);
  }

  return parts.join(". ") + ".";
}

// ============================================================================
// LLM CLASSIFICATION (gpt-4o-mini) — document-aware analysis
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
};

async function llmClassify(
  text: string,
  rubric: PveRubric,
  nudgeSummary: string,
): Promise<LLMClassifyResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const fieldList = rubric.items
    .map(
      (item) =>
        `- ${item.id} (chapter: ${item.chapter}, field: ${item.fieldId}): ${item.label}. Keywords: ${item.keywords.join(", ")}. Kwaliteitscriterium: ${item.qualityCriteria}`,
    )
    .join("\n");

  const systemPrompt = `Je bent een senior bouwkundig adviseur die een Programma van Eisen (PvE) beoordeelt.

CONTEXT: ${nudgeSummary}

RUBRIC VELDEN (dit zijn de velden die je moet beoordelen):
${fieldList}

OPDRACHT:
Lees het document grondig. Per rubric-veld:
1. Bepaal of het document dit onderwerp behandelt
2. Als JA: citeer de relevante tekst, beoordeel de kwaliteit, benoem zwaktes
3. Als NEE: leg uit waarom het ontbreekt en wat er WEL in de buurt staat

JSON FORMAAT (antwoord ALLEEN hiermee):
{
  "fields": [
    {
      "fieldId": "<rubric-item-id, exact>",
      "chapter": "<chapter>",
      "value": "<samenvatting van wat het document zegt over dit veld>",
      "confidence": <0.0-1.0>,
      "quote": "<EXACT citaat uit het document, max 200 tekens, zonder aanpassing>",
      "observation": "<wat het document goed doet op dit punt, 1 zin>",
      "weakness": "<wat er ontbreekt of onvoldoende specifiek is, 1 zin>"
    }
  ],
  "missingFields": [
    {
      "fieldId": "<rubric-item-id van veld dat NIET in document staat>",
      "whyMissing": "<korte uitleg waarom dit een probleem is voor DIT specifieke project>",
      "nearbyContext": "<wat het document WEL zegt dat gerelateerd is, of 'Geen gerelateerde tekst gevonden'>"
    }
  ]
}

REGELS:
- quote moet een LETTERLIJK citaat zijn — kopieer exact uit de tekst
- observation en weakness moeten SPECIFIEK zijn voor dit document, niet generiek
- weakness mag niet alleen herhalen dat iets ontbreekt — leg uit WAAROM het een probleem is voor dit specifieke project
- missingFields: elk rubric-veld dat NIET in het document voorkomt
- nearbyContext: citeer tekst die in de buurt komt maar niet voldoet aan het kwaliteitscriterium
- confidence < 0.3 → zet in missingFields, niet in fields`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Beoordeel dit PvE document:\n\n${text.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { fields: [], missingFields: [] };
  }

  try {
    const parsed = JSON.parse(content) as LLMClassifyResponse;
    return {
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
    };
  } catch {
    return { fields: [], missingFields: [] };
  }
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
  // Step 1: Build nudge (before LLM)
  const nudgeSummary = buildNudge(params.intake);

  // Step 2: LLM classification
  const llmResult = await llmClassify(params.text, params.rubric, nudgeSummary);

  // Step 3: Build fields with evidence + vagueness detection
  const mappedData: Partial<ChapterDataMap> = {};
  const fields: PveClassifiedField[] = [];
  const evidenceSnippets: EvidenceRef[] = [];

  // Build a lookup map for rubric items
  const rubricMap = new Map<string, PveRubricItem>();
  for (const item of params.rubric.items) {
    rubricMap.set(item.id, item);
  }

  for (const llmField of llmResult.fields) {
    const rubricItem = rubricMap.get(llmField.fieldId);
    if (!rubricItem) continue; // Not in rubric whitelist → skip

    const chapter = rubricItem.chapter;
    const valueStr = typeof llmField.value === "string" ? llmField.value : String(llmField.value ?? "");

    // Vagueness detection (deterministic)
    const vagueCheck = isVague(valueStr);

    // Evidence: prefer LLM quote, fall back to keyword match
    let evidence = findEvidence(params.pages, rubricItem.keywords, params.text);
    if (!evidence && llmField.quote) {
      // Use LLM-provided quote to find evidence in pages
      evidence = findEvidence(params.pages, [llmField.quote.slice(0, 50)], params.text);
    }

    // Validate via CHAPTER_SCHEMAS field whitelist
    addMappedValue(mappedData, chapter, rubricItem.fieldId, llmField.value);

    const field: PveClassifiedField = {
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
    };

    fields.push(field);

    if (evidence) {
      evidenceSnippets.push(evidence);
    }
  }

  // Step 4: Store missingFields context in classify result
  // (used by gaps.ts for document-specific gap reasons)
  const missingFieldContext = new Map<string, LLMMissingField>();
  for (const mf of llmResult.missingFields) {
    missingFieldContext.set(mf.fieldId, mf);
  }

  // Step 5: Validate mapped data per chapter
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
    evidenceSnippets,
    missingFieldContext,
  };
}
