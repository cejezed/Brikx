// lib/pveCheck/knowledge.ts — Kennisbank integration for PvE Check
// Queries the knowledge base per chapter to enrich gaps and patches
// with project-specific advice from the Brikx Kennisbank.

import { Kennisbank, type RagResult } from "@/lib/rag/Kennisbank";
import type { ChapterKey, RAGDoc } from "@/types/project";
import type { PveGap, PveCheckIntakeData } from "@/types/pveCheck";

// ============================================================================
// TYPES
// ============================================================================

export type KnowledgePerChapter = Map<ChapterKey, RagResult>;

export type GapKnowledge = {
  /** Short advice from Kennisbank, shown in gap card */
  hint: string;
  /** Source article titles (for attribution) */
  sources: string[];
  /** Full RAG docs (for patch LLM context) */
  docs: RAGDoc[];
};

// ============================================================================
// QUERY KENNISBANK PER CHAPTER
// ============================================================================

/**
 * Query Kennisbank for each chapter that has gaps.
 * One query per chapter, using intake context for better relevance.
 */
export async function queryKnowledgeForGaps(
  gaps: PveGap[],
  intake: PveCheckIntakeData,
): Promise<KnowledgePerChapter> {
  // Get unique chapters with gaps
  const chapters = [...new Set(gaps.map((g) => g.chapter))];

  const results = new Map<ChapterKey, RagResult>();

  // Query in parallel (one per chapter)
  const promises = chapters.map(async (chapter) => {
    // Build a targeted query from intake + chapter context
    const chapterGaps = gaps.filter((g) => g.chapter === chapter);
    const gapLabels = chapterGaps.slice(0, 3).map((g) => g.label).join(", ");

    const query = `${intake.archetype} ${intake.projectType} ${chapter}: ${gapLabels}`;

    try {
      const result = await Kennisbank.query(query, {
        chapter,
        limit: 3,
      });
      results.set(chapter, result);
    } catch (err) {
      console.warn(`[knowledge] Kennisbank query failed for chapter ${chapter}:`, err);
    }
  });

  await Promise.all(promises);
  return results;
}

// ============================================================================
// ENRICH GAPS WITH KNOWLEDGE HINTS
// ============================================================================

/**
 * Find relevant knowledge for a specific gap.
 * Returns a short hint + source titles + full docs for LLM context.
 */
export function getGapKnowledge(
  gap: PveGap,
  knowledgeMap: KnowledgePerChapter,
): GapKnowledge | null {
  const chapterResult = knowledgeMap.get(gap.chapter);
  if (!chapterResult || chapterResult.docs.length === 0) return null;

  // Score docs by relevance to this specific gap
  const gapKeywords = gap.label.toLowerCase().split(/\s+/);
  const scoredDocs = chapterResult.docs.map((doc) => {
    const docLower = doc.text.toLowerCase();
    const score = gapKeywords.reduce((sum, kw) => sum + (docLower.includes(kw) ? 1 : 0), 0);
    return { doc, score };
  });

  // Sort by relevance, take top 2
  scoredDocs.sort((a, b) => b.score - a.score);
  const relevantDocs = scoredDocs.filter((d) => d.score > 0).slice(0, 2);

  if (relevantDocs.length === 0) {
    // Fall back to first available doc
    if (chapterResult.docs.length > 0) {
      const doc = chapterResult.docs[0];
      return {
        hint: extractHint(doc.text),
        sources: [extractTitle(doc.text)],
        docs: [doc],
      };
    }
    return null;
  }

  const docs = relevantDocs.map((d) => d.doc);
  const hint = extractHint(docs[0].text);
  const sources = docs.map((d) => extractTitle(d.text));

  return { hint, sources, docs };
}

/**
 * Enrich a list of gaps with knowledge hints (mutates gaps in place).
 * Adds `knowledgeHint` to each gap that has relevant Kennisbank content.
 */
export function enrichGapsWithKnowledge(
  gaps: PveGap[],
  knowledgeMap: KnowledgePerChapter,
): void {
  for (const gap of gaps) {
    const knowledge = getGapKnowledge(gap, knowledgeMap);
    if (knowledge) {
      gap.knowledgeHint = knowledge.hint;
    }
  }
}

// ============================================================================
// BUILD LLM CONTEXT FROM KNOWLEDGE
// ============================================================================

/**
 * Build a Kennisbank context string for the patch LLM.
 * Includes relevant knowledge articles + customer examples.
 */
export function buildKnowledgeContext(
  gap: PveGap,
  knowledgeMap: KnowledgePerChapter,
): string {
  const chapterResult = knowledgeMap.get(gap.chapter);
  if (!chapterResult) return "";

  const parts: string[] = [];

  // Knowledge articles
  if (chapterResult.docs.length > 0) {
    const docTexts = chapterResult.docs
      .slice(0, 2)
      .map((d) => d.text.slice(0, 300))
      .join("\n---\n");
    parts.push(`KENNISBANK CONTEXT:\n${docTexts}`);
  }

  // Customer examples (if available)
  if (chapterResult.examples && chapterResult.examples.length > 0) {
    const exampleTexts = chapterResult.examples
      .slice(0, 2)
      .map((ex) => {
        const implications = ex.interpretation?.designImplications?.slice(0, 2).join("; ") ?? "";
        return `Klantvoorbeeld: "${ex.userQuery}" → ${implications}`;
      })
      .join("\n");
    parts.push(`KLANTVOORBEELDEN:\n${exampleTexts}`);
  }

  return parts.join("\n\n");
}

// ============================================================================
// HELPERS
// ============================================================================

/** Extract first meaningful sentence from a doc text (strip markdown) */
function extractHint(text: string): string {
  // Remove markdown bold markers
  const clean = text.replace(/\*\*/g, "");
  // Get the summary part (after title line)
  const lines = clean.split("\n").filter((l) => l.trim());
  const summary = lines.length > 1 ? lines.slice(1).join(" ") : lines[0] ?? "";
  // Take first ~200 chars, ending at sentence boundary
  const truncated = summary.slice(0, 200);
  const lastDot = truncated.lastIndexOf(".");
  return lastDot > 50 ? truncated.slice(0, lastDot + 1) : truncated + "...";
}

/** Extract title from doc text (assumes **Title** format) */
function extractTitle(text: string): string {
  const match = text.match(/\*\*(.+?)\*\*/);
  return match ? match[1] : text.slice(0, 60);
}
