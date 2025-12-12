-- Migration: conversation_history table for Architect Intelligence Layer v3.1
-- Purpose: Persist conversation turns for ConversationMemory module
-- Date: 2025-12-11
-- Week 1, Day 1 - Database Schema Setup

-- ============================================================================
-- TABLE: conversation_history
-- ============================================================================
-- Stores all conversation turns between user and AI assistant.
-- Used by ConversationMemory.load() to retrieve recent context.
-- Supports semantic search for relevant past conversations (future feature).

CREATE TABLE IF NOT EXISTS conversation_history (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User & Project identification
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL,

  -- Message metadata
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message text NOT NULL,
  source text NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'ai', 'system')),

  -- Optional snapshots & metadata
  wizard_state_snapshot jsonb,
  triggers_handled text[],
  patches_applied jsonb[],

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance indexes for common queries

-- Primary query pattern: Get recent turns for user + project
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_project_time
  ON conversation_history (user_id, project_id, created_at DESC);

-- Secondary query pattern: Get all recent turns for user (across projects)
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_time
  ON conversation_history (user_id, created_at DESC);

-- Future: Semantic search on message content (for RAG)
-- CREATE INDEX IF NOT EXISTS idx_conversation_history_message_fts
--   ON conversation_history USING gin(to_tsvector('english', message));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Ensure users can only access their own conversation history

-- Enable RLS on the table
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can SELECT their own conversation turns
CREATE POLICY "Users can view their own conversation history"
  ON conversation_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own conversation turns
CREATE POLICY "Users can insert their own conversation turns"
  ON conversation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own conversation turns (for corrections)
CREATE POLICY "Users can update their own conversation turns"
  ON conversation_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own conversation turns (cleanup)
CREATE POLICY "Users can delete their own conversation turns"
  ON conversation_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================

COMMENT ON TABLE conversation_history IS
  'Architect Intelligence Layer v3.1: Persistent conversation history for ConversationMemory module';

COMMENT ON COLUMN conversation_history.user_id IS
  'Foreign key to auth.users - user who created this turn';

COMMENT ON COLUMN conversation_history.project_id IS
  'UUID of the wizard project (from WizardState) - NOT a foreign key to allow offline projects';

COMMENT ON COLUMN conversation_history.role IS
  'Message role: user (human), assistant (AI), or system (automated)';

COMMENT ON COLUMN conversation_history.source IS
  'Source of the turn: user (human input), ai (AI-generated), system (automated trigger)';

COMMENT ON COLUMN conversation_history.message IS
  'The actual message text content';

COMMENT ON COLUMN conversation_history.wizard_state_snapshot IS
  'Optional snapshot of WizardState at time of this turn (for debugging/replay)';

COMMENT ON COLUMN conversation_history.triggers_handled IS
  'Array of FieldTrigger IDs that were processed in this turn';

COMMENT ON COLUMN conversation_history.patches_applied IS
  'Array of PatchEvent objects that were applied in this turn';

-- ============================================================================
-- TEST QUERY EXAMPLES
-- ============================================================================

-- Example 1: Get recent 20 turns for a user + project
-- SELECT * FROM conversation_history
-- WHERE user_id = 'xxx' AND project_id = 'yyy'
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Example 2: Get conversation summary (turn count)
-- SELECT
--   user_id,
--   project_id,
--   COUNT(*) as turn_count,
--   MAX(created_at) as last_turn_at
-- FROM conversation_history
-- GROUP BY user_id, project_id;

-- Example 3: Find turns mentioning specific field (future semantic search)
-- SELECT * FROM conversation_history
-- WHERE message ILIKE '%budget%'
-- AND user_id = 'xxx'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
