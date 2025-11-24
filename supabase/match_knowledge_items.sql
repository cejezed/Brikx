-- ============================================================================
-- match_knowledge_items: Semantic search voor kennisbank items
-- ============================================================================
-- Deze functie combineert knowledge_vectors (embeddings) met knowledge_items (content)
-- voor semantic search op de Brikx kennisbank.
--
-- Vereist:
-- - pgvector extensie: CREATE EXTENSION IF NOT EXISTS vector;
-- - knowledge_items tabel met id, title, summary, content, onderwerpen, chapter
-- - knowledge_vectors tabel met item_id, embedding (vector(1536))
--
-- Gebruik vanuit TypeScript:
--   const { data } = await supabase.rpc('match_knowledge_items', {
--     query_embedding: [...],  // 1536-dimensionale vector van OpenAI
--     match_threshold: 0.5,    // Minimum similarity score (0-1)
--     match_count: 5           // Maximum aantal resultaten
--   });
-- ============================================================================

-- Maak de RPC functie
CREATE OR REPLACE FUNCTION match_knowledge_items(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  title text,
  summary text,
  content text,
  onderwerpen text[],
  chapter int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ki.id,
    ki.title,
    ki.summary,
    ki.content,
    ki.onderwerpen,
    ki.chapter,
    1 - (kv.embedding <=> query_embedding) AS similarity
  FROM
    knowledge_vectors kv
  INNER JOIN
    knowledge_items ki ON ki.id = kv.item_id
  WHERE
    1 - (kv.embedding <=> query_embedding) > match_threshold
  ORDER BY
    kv.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_knowledge_items TO authenticated;
GRANT EXECUTE ON FUNCTION match_knowledge_items TO service_role;

-- ============================================================================
-- Index voor snellere vector similarity search
-- ============================================================================
-- IVFFlat index voor betere performance bij grotere datasets
-- Pas 'lists' aan op basis van dataset grootte (typisch sqrt(n) tot n/1000)

-- DROP INDEX IF EXISTS knowledge_vectors_embedding_idx;
-- CREATE INDEX knowledge_vectors_embedding_idx ON knowledge_vectors
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Alternatief: HNSW index (betere kwaliteit, meer geheugen)
-- CREATE INDEX knowledge_vectors_embedding_hnsw_idx ON knowledge_vectors
-- USING hnsw (embedding vector_cosine_ops);
