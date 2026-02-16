// lib/pveCheck/patches.ts — 3-step patch generator
// Step 1: LLM gives suggestedText based on document context + gap info
// Step 2: Code builds PatchEvent
// Step 3: CHAPTER_SCHEMAS validates
import type { PatchEvent, ChapterKey } from "@/types/project";
import type { PveGap, PvePatchPlan } from "@/types/pveCheck";
import { validateChapter } from "@/lib/wizard/CHAPTER_SCHEMAS";
import { getRubricItem } from "@/lib/pveCheck/rubric";
import { buildKnowledgeContext, type KnowledgePerChapter } from "@/lib/pveCheck/knowledge";

// ============================================================================
// STEP 1: LLM SUGGESTED TEXT — document-aware
// ============================================================================

async function llmSuggestText(
  gap: PveGap,
  documentSnippet: string | undefined,
  knowledgeContext: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const rubricItem = getRubricItem(gap.fieldId);
  const example = rubricItem?.exampleGood ?? "";

  // Build a context block from what the document already says
  const contextParts: string[] = [];
  if (gap.currentValue) {
    contextParts.push(`Huidige tekst in het document: "${gap.currentValue}"`);
  }
  if (gap.evidence?.snippet) {
    contextParts.push(`Citaat uit het document (p.${gap.evidence.page}): "${gap.evidence.snippet.slice(0, 200)}"`);
  }
  if (documentSnippet && !gap.evidence?.snippet) {
    contextParts.push(`Relevante passage uit het document: "${documentSnippet.slice(0, 300)}"`);
  }
  const docContext = contextParts.length > 0
    ? contextParts.join("\n")
    : "Er staat niets over dit onderwerp in het document.";

  // Add Kennisbank context if available
  const knowledgeBlock = knowledgeContext
    ? `\n\n${knowledgeContext}`
    : "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `Je bent een PvE-specialist met kennis van bouwregelgeving en best practices. Schrijf een concreet verbetervoorstel dat VOORTBOUWT op wat er al in het document staat. Gebruik meetbare termen (aantallen, m², bedragen, deadlines). Schrijf in het Nederlands, max 3 zinnen.

BELANGRIJK:
- Refereer aan de bestaande tekst als die er is ("Het document noemt X, maar specificeert niet Y")
- Maak het voorstel specifiek voor DIT project, niet generiek
- Gebruik de kennisbank-informatie als die beschikbaar is om je advies te onderbouwen
- Begin niet met "Voeg toe:" of "Specificeer:" maar schrijf de daadwerkelijke tekst die in het PvE zou moeten staan`,
        },
        {
          role: "user",
          content: `Onderdeel: ${gap.label}
Probleem: ${gap.reason}

DOCUMENTCONTEXT:
${docContext}${knowledgeBlock}

Voorbeeld van goede formulering: ${example}

Schrijf de verbetertekst:`,
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

// ============================================================================
// STEP 2: BUILD PATCH EVENT
// ============================================================================

function buildPatchEvent(
  gap: PveGap,
  suggestedText: string,
): PatchEvent | null {
  // Parse chapter from fieldId (e.g., "basis.projectType" → "basis")
  const dotIdx = gap.fieldId.indexOf(".");
  if (dotIdx === -1) return null;

  const chapter = gap.fieldId.slice(0, dotIdx) as ChapterKey;
  const fieldPath = gap.fieldId.slice(dotIdx + 1);

  return {
    chapter,
    delta: {
      path: fieldPath,
      operation: "set",
      value: suggestedText,
    },
  };
}

// ============================================================================
// STEP 3: VALIDATE WITH CHAPTER_SCHEMAS
// ============================================================================

function validatePatch(patchEvent: PatchEvent): boolean {
  // Build a minimal chapter data object with just this field
  const fieldPath = patchEvent.delta.path;
  if (!fieldPath) return false;

  const testData = { [fieldPath]: patchEvent.delta.value };

  // Validate — if the schema rejects it, the patch is invalid
  return validateChapter(patchEvent.chapter, testData);
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function computePatchPlans(
  gaps: PveGap[],
  documentText?: string,
  knowledgeMap?: KnowledgePerChapter,
): Promise<PvePatchPlan[]> {
  // Only generate patches for critical and important gaps
  const patchableGaps = gaps.filter(
    (gap) => gap.severity === "critical" || gap.severity === "important",
  );

  const plans: PvePatchPlan[] = [];

  for (const gap of patchableGaps) {
    // Find a relevant document snippet for this gap (if not already in evidence)
    let snippet: string | undefined;
    if (documentText && !gap.evidence?.snippet) {
      // Try to find nearby text using the gap's fieldId keywords
      const rubricItem = getRubricItem(gap.fieldId);
      if (rubricItem) {
        const lower = documentText.toLowerCase();
        for (const kw of rubricItem.keywords) {
          const idx = lower.indexOf(kw.toLowerCase());
          if (idx !== -1) {
            snippet = documentText.slice(Math.max(0, idx - 100), idx + 300).trim();
            break;
          }
        }
      }
    }

    // Build Kennisbank context for this gap
    const kbContext = knowledgeMap ? buildKnowledgeContext(gap, knowledgeMap) : "";

    // Step 1: LLM suggested text (document-aware + Kennisbank)
    const suggestedText = await llmSuggestText(gap, snippet, kbContext);
    if (!suggestedText) {
      // Fallback: use rubric exampleGood
      const rubricItem = getRubricItem(gap.fieldId);
      plans.push({
        gapId: gap.id,
        fieldId: gap.fieldId,
        suggestedText: rubricItem?.exampleGood ?? "",
        validated: false,
      });
      continue;
    }

    // Step 2: Build PatchEvent
    const patchEvent = buildPatchEvent(gap, suggestedText);

    // Step 3: Validate
    const validated = patchEvent ? validatePatch(patchEvent) : false;

    plans.push({
      gapId: gap.id,
      fieldId: gap.fieldId,
      suggestedText,
      patchEvent: validated ? patchEvent ?? undefined : undefined,
      validated,
    });
  }

  return plans;
}
