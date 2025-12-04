-- Migration: Add embeddings support to customer_examples
-- Date: 2025-01-03
-- Purpose: Enable vector similarity search for ExpertCorner insights

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (OpenAI text-embedding-3-small = 1536 dimensions)
ALTER TABLE customer_examples
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_examples_tags
  ON customer_examples USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_examples_quality
  ON customer_examples(quality_score)
  WHERE quality_score >= 0.7;

-- Vector index for similarity search (ivfflat)
-- lists=100 is suitable for ~1000-10000 rows
CREATE INDEX IF NOT EXISTS idx_examples_embedding
  ON customer_examples
  USING ivfflat(embedding vector_cosine_ops)
  WITH (lists = 100);

-- RPC function for vector similarity search
CREATE OR REPLACE FUNCTION match_customer_examples(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  user_query text,
  interpretation jsonb,
  tags text[],
  quality_score real,
  embedding vector(1536),
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    user_query,
    interpretation,
    tags,
    quality_score,
    embedding,
    1 - (embedding <=> query_embedding) as similarity
  FROM customer_examples
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Materialized view for tag co-occurrence (Fase 2, maar alvast klaarzetten)
CREATE MATERIALIZED VIEW IF NOT EXISTS tag_cooccurrence AS
SELECT
  t1.tag as tag1,
  t2.tag as tag2,
  COUNT(*) as co_count,
  AVG(quality_score) as avg_quality
FROM customer_examples,
     LATERAL unnest(tags) t1(tag),
     LATERAL unnest(tags) t2(tag)
WHERE t1.tag < t2.tag  -- avoid duplicates (tag1, tag2) = (tag2, tag1)
  AND quality_score >= 0.7
GROUP BY t1.tag, t2.tag
HAVING COUNT(*) >= 3;  -- minimum 3 voorbeelden

CREATE UNIQUE INDEX IF NOT EXISTS idx_tag_cooccurrence_tags
  ON tag_cooccurrence(tag1, tag2);

-- Refresh function (voor later - cron job)
COMMENT ON MATERIALIZED VIEW tag_cooccurrence IS
  'Refresh weekly via: SELECT refresh_materialized_view(''tag_cooccurrence'');';
