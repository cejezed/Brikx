-- ====================================
-- Fase 2: Tag Co-occurrence Materialized View
-- ====================================
-- Pre-compute tag pair statistics voor snelle co-occurrence lookups
-- Refresh: 1x per dag via cron job
--
-- IMPORTANT: Dit vervangt de eenvoudige tag_cooccurrence uit Fase 1
-- met een rijkere versie met confidence metrics en source traceability

-- Drop oude versie uit Fase 1 (indien aanwezig)
DROP MATERIALIZED VIEW IF EXISTS tag_cooccurrence CASCADE;

-- Create nieuwe versie met volledige metrics
CREATE MATERIALIZED VIEW tag_cooccurrence AS
WITH example_tag_pairs AS (
  -- Generate all tag pairs binnen elke example
  SELECT
    ce.id AS example_id,
    ce.quality_score,
    ce.interpretation->>'chapter' AS chapter,
    t1.tag AS tag_a,
    t2.tag AS tag_b
  FROM customer_examples ce
  CROSS JOIN LATERAL unnest(ce.tags) AS t1(tag)
  CROSS JOIN LATERAL unnest(ce.tags) AS t2(tag)
  WHERE
    t1.tag < t2.tag  -- Avoid duplicates (A,B) == (B,A)
    AND ce.quality_score >= 0.7  -- Only high-quality examples
)
SELECT
  tag_a,
  tag_b,
  COUNT(DISTINCT example_id) AS cooccurrence_count,
  ROUND(AVG(quality_score)::numeric, 2) AS avg_quality,
  ARRAY_AGG(DISTINCT chapter) FILTER (WHERE chapter IS NOT NULL) AS chapters,
  ARRAY_AGG(DISTINCT example_id) AS source_example_ids,

  -- Confidence metric: support ratio
  ROUND((COUNT(DISTINCT example_id)::float /
    NULLIF((SELECT COUNT(*) FROM customer_examples WHERE quality_score >= 0.7), 0))::numeric, 4)
    AS support_ratio  -- What % of all examples contain this pair?
FROM example_tag_pairs
GROUP BY tag_a, tag_b
HAVING COUNT(DISTINCT example_id) >= 5  -- Min 5 co-occurrences voor statistisch relevantie
ORDER BY cooccurrence_count DESC;

-- Indexes voor snelle tag lookups
CREATE INDEX idx_tag_cooccurrence_tag_a ON tag_cooccurrence(tag_a);
CREATE INDEX idx_tag_cooccurrence_tag_b ON tag_cooccurrence(tag_b);
CREATE INDEX idx_tag_cooccurrence_count ON tag_cooccurrence(cooccurrence_count DESC);

-- ====================================
-- RPC Function: get_tag_cooccurrences
-- ====================================
-- Find tags that frequently co-occur with given input tags
--
-- IMPORTANT: Returns uuid[] for source_example_ids (consistent met CustomerExample.id)

CREATE OR REPLACE FUNCTION get_tag_cooccurrences(
  input_tags text[],
  min_count int DEFAULT 5,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  tag text,
  cooccurrence_count bigint,
  avg_quality numeric,
  confidence float,
  source_example_ids uuid[]  -- uuid[] instead of text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN tc.tag_a = ANY(input_tags) THEN tc.tag_b
      ELSE tc.tag_a
    END AS tag,
    tc.cooccurrence_count,
    tc.avg_quality,
    -- Confidence = avg_quality * log(count) * support_ratio
    (tc.avg_quality * LOG(tc.cooccurrence_count + 1) * tc.support_ratio)::float AS confidence,
    tc.source_example_ids
  FROM tag_cooccurrence tc
  WHERE
    (tc.tag_a = ANY(input_tags) OR tc.tag_b = ANY(input_tags))
    AND tc.cooccurrence_count >= min_count
  ORDER BY confidence DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- ====================================
-- Helper Function: refresh_materialized_view
-- ====================================
-- Generic function to refresh any materialized view
-- Used by cron jobs and manual refresh scripts

CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('REFRESH MATERIALIZED VIEW %I', view_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- Initial Refresh
-- ====================================
-- Populate view with initial data (run once on migration)

REFRESH MATERIALIZED VIEW tag_cooccurrence;

-- Verify data
DO $$
DECLARE
  row_count int;
BEGIN
  SELECT COUNT(*) INTO row_count FROM tag_cooccurrence;
  RAISE NOTICE 'tag_cooccurrence materialized view created with % tag pairs', row_count;
END
$$;

-- ====================================
-- CRON SETUP INSTRUCTIONS
-- ====================================
-- Option A: Supabase pg_cron (Dashboard → Database → Cron Jobs)
--   Schedule: 0 3 * * * (daily at 3 AM)
--   SQL: SELECT refresh_materialized_view('tag_cooccurrence');
--
-- Option B: Vercel Cron (see app/api/cron/refresh-cooccurrence/route.ts)
--   Add to vercel.json:
--   {
--     "crons": [{
--       "path": "/api/cron/refresh-cooccurrence",
--       "schedule": "0 3 * * *"
--     }]
--   }
