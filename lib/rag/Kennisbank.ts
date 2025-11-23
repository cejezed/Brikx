// /lib/rag/Kennisbank.ts
// ✅ v3.9: Hybrid RAG - Semantic search (pgvector) + keyword fallback
// Uses OpenAI embeddings + Supabase pgvector for semantic similarity

import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import type { RAGDoc } from "@/types/project";

// ============================================================================
// Types
// ============================================================================

export interface KnowledgeItem {
  id: string;
  chapter: number;
  title: string;
  summary: string;
  content: string;
  onderwerpen: string[];
  projectsoorten: string[];
}

// Re-export for backwards compatibility
export type { RAGDoc };

export interface RagResult {
  topicId: string;
  docs: RAGDoc[];
  cacheHit: boolean;
  searchType?: "semantic" | "keyword"; // ✅ v3.9: Track which search was used
}

export interface QueryOptions {
  chapter?: string;
  isPremium?: boolean;
  limit?: number;
  useSemanticSearch?: boolean; // ✅ v3.9: Toggle semantic search
}

// ============================================================================
// Configuration
// ============================================================================

const EMBEDDING_MODEL = "text-embedding-3-small";
const MATCH_THRESHOLD = 0.7; // Minimum similarity score (0-1)

const CHAPTER_TO_NUMBER: Record<string, number> = {
  basis: 1,
  ruimtes: 2,
  wensen: 3,
  budget: 4,
  techniek: 5,
  duurzaam: 6,
  risico: 7,
};

// ============================================================================
// Kennisbank class
// ============================================================================

export class Kennisbank {
  /**
   * Query the knowledge base for relevant documents
   * ✅ v3.9: Hybrid approach - semantic search first, keyword fallback
   */
  static async query(
    query: string,
    options: QueryOptions = {}
  ): Promise<RagResult> {
    const { chapter, limit = 3, useSemanticSearch = true } = options;

    // Try semantic search first (if enabled and API key available)
    if (useSemanticSearch && process.env.OPENAI_API_KEY) {
      try {
        const semanticResult = await this.semanticQuery(query, { chapter, limit });
        if (semanticResult.docs.length > 0) {
          console.log(`[Kennisbank] Semantic search returned ${semanticResult.docs.length} results`);
          return semanticResult;
        }
        console.log("[Kennisbank] Semantic search returned no results, falling back to keyword search");
      } catch (err) {
        console.error("[Kennisbank] Semantic search failed, falling back to keyword search:", err);
      }
    }

    // Fallback to keyword search
    return this.keywordQuery(query, { chapter, limit });
  }

  /**
   * ✅ v3.9: Semantic search using OpenAI embeddings + pgvector
   */
  static async semanticQuery(
    query: string,
    options: { chapter?: string; limit?: number } = {}
  ): Promise<RagResult> {
    const { chapter, limit = 3 } = options;

    try {
      // 1. Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      if (!queryEmbedding) {
        return { topicId: "general", docs: [], cacheHit: false, searchType: "semantic" };
      }

      // 2. Call the Supabase RPC function for vector similarity search
      const { data: vectorMatches, error: vectorError } = await supabaseAdmin
        .rpc("match_knowledge_vectors", {
          query_embedding: queryEmbedding,
          match_threshold: MATCH_THRESHOLD,
          match_count: limit * 2, // Get extra for chapter filtering
        });

      if (vectorError) {
        console.error("[Kennisbank] Vector search error:", vectorError);
        throw vectorError;
      }

      if (!vectorMatches || vectorMatches.length === 0) {
        console.log("[Kennisbank] No vector matches found");
        return { topicId: "general", docs: [], cacheHit: false, searchType: "semantic" };
      }

      console.log(`[Kennisbank] Vector search found ${vectorMatches.length} matches`);

      // 3. Fetch full knowledge items for matched IDs
      const matchedIds = vectorMatches.map((m: { item_id: string }) => m.item_id);

      let itemsQuery = supabaseAdmin
        .from("knowledge_items")
        .select("id, chapter, title, summary, content, onderwerpen, projectsoorten")
        .in("id", matchedIds);

      // Filter by chapter if specified
      if (chapter && CHAPTER_TO_NUMBER[chapter]) {
        itemsQuery = itemsQuery.eq("chapter", CHAPTER_TO_NUMBER[chapter]);
      }

      const { data: items, error: itemsError } = await itemsQuery;

      if (itemsError || !items) {
        console.error("[Kennisbank] Error fetching knowledge items:", itemsError);
        return { topicId: "general", docs: [], cacheHit: false, searchType: "semantic" };
      }

      // 4. Sort items by similarity score and limit
      const similarityMap = new Map(
        vectorMatches.map((m: { item_id: string; similarity: number }) => [m.item_id, m.similarity])
      );

      const sortedItems = items
        .map((item) => ({
          ...item,
          similarity: similarityMap.get(item.id) ?? 0,
        }))
        .sort((a, b) => (b.similarity as number) - (a.similarity as number))
        .slice(0, limit);

      // 5. Determine topic from top result
      const topicId = sortedItems.length > 0
        ? sortedItems[0].onderwerpen?.[0] || "general"
        : "general";

      // 6. Map to RAGDoc format
      const ragDocs: RAGDoc[] = sortedItems.map((item) => ({
        id: item.id,
        text: `**${item.title}**\n${item.summary}`,
        source: item.onderwerpen?.[0] || "kennisbank",
      }));

      return {
        topicId,
        docs: ragDocs,
        cacheHit: false,
        searchType: "semantic",
      };
    } catch (err) {
      console.error("[Kennisbank] Semantic query error:", err);
      throw err; // Re-throw to trigger fallback
    }
  }

  /**
   * Generate embedding for a text using OpenAI
   */
  private static async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Kennisbank] Embedding API error:", errorText);
        return null;
      }

      const data = await response.json();
      return data.data?.[0]?.embedding || null;
    } catch (err) {
      console.error("[Kennisbank] Embedding generation error:", err);
      return null;
    }
  }

  /**
   * Keyword-based search (original implementation, now as fallback)
   */
  static async keywordQuery(
    query: string,
    options: { chapter?: string; limit?: number } = {}
  ): Promise<RagResult> {
    const { chapter, limit = 3 } = options;

    try {
      const keywords = extractKeywords(query);

      if (keywords.length === 0) {
        console.log("[Kennisbank] No keywords extracted from query");
        return { topicId: "general", docs: [], cacheHit: false, searchType: "keyword" };
      }

      console.log("[Kennisbank] Keyword search with:", keywords);

      let dbQuery = supabaseAdmin
        .from("knowledge_items")
        .select("id, chapter, title, summary, content, onderwerpen, projectsoorten");

      if (chapter && CHAPTER_TO_NUMBER[chapter]) {
        dbQuery = dbQuery.eq("chapter", CHAPTER_TO_NUMBER[chapter]);
      }

      const { data, error } = await dbQuery.limit(limit * 3);

      if (error) {
        console.error("[Kennisbank] Supabase error:", error);
        return { topicId: "general", docs: [], cacheHit: false, searchType: "keyword" };
      }

      if (!data || data.length === 0) {
        console.log("[Kennisbank] No knowledge items found");
        return { topicId: "general", docs: [], cacheHit: false, searchType: "keyword" };
      }

      const scoredResults = data.map((item) => {
        const score = calculateRelevanceScore(item, keywords);
        return { ...item, score };
      });

      const topResults = scoredResults
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`[Kennisbank] Keyword search found ${topResults.length} relevant items`);

      const topicId = topResults.length > 0
        ? topResults[0].onderwerpen?.[0] || "general"
        : "general";

      const ragDocs: RAGDoc[] = topResults.map((item) => ({
        id: item.id,
        text: `**${item.title}**\n${item.summary}`,
        source: item.onderwerpen?.[0] || "kennisbank",
      }));

      return {
        topicId,
        docs: ragDocs,
        cacheHit: false,
        searchType: "keyword",
      };
    } catch (err) {
      console.error("[Kennisbank] Keyword query error:", err);
      return { topicId: "general", docs: [], cacheHit: false, searchType: "keyword" };
    }
  }

  /**
   * Get a specific knowledge item by ID
   */
  static async getById(id: string): Promise<KnowledgeItem | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("knowledge_items")
        .select("id, chapter, title, summary, content, onderwerpen, projectsoorten")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as KnowledgeItem;
    } catch {
      return null;
    }
  }

  /**
   * Get all knowledge items for a specific topic
   */
  static async getByTopic(topic: string, limit = 5): Promise<KnowledgeItem[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("knowledge_items")
        .select("id, chapter, title, summary, content, onderwerpen, projectsoorten")
        .contains("onderwerpen", [topic])
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data as KnowledgeItem[];
    } catch {
      return [];
    }
  }
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Extract relevant keywords from a query
 * Removes common Dutch stop words and short words
 */
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "de", "het", "een", "van", "en", "in", "is", "op", "te", "dat",
    "die", "voor", "met", "zijn", "er", "aan", "om", "als", "dan",
    "wat", "hoe", "waar", "wanneer", "waarom", "welke", "wie",
    "kan", "kun", "kunt", "moet", "wil", "wilt", "zou", "zal",
    "ik", "je", "jij", "u", "we", "wij", "ze", "zij", "mijn", "uw",
    "ook", "maar", "of", "nog", "naar", "bij", "uit", "tot", "wel",
    "niet", "geen", "al", "zo", "heel", "erg", "best", "graag",
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\sàáâãäåèéêëìíîïòóôõöùúûüç]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculate relevance score based on keyword matches
 */
function calculateRelevanceScore(
  item: KnowledgeItem,
  keywords: string[]
): number {
  let score = 0;

  const titleLower = (item.title || "").toLowerCase();
  const summaryLower = (item.summary || "").toLowerCase();
  const contentLower = (item.content || "").toLowerCase();
  const onderwerpen = (item.onderwerpen || []).map((o) => o.toLowerCase());

  for (const keyword of keywords) {
    if (titleLower.includes(keyword)) {
      score += 10;
    }
    if (onderwerpen.some((o) => o.includes(keyword))) {
      score += 8;
    }
    if (summaryLower.includes(keyword)) {
      score += 5;
    }
    if (contentLower.includes(keyword)) {
      score += 2;
    }
  }

  return score;
}
