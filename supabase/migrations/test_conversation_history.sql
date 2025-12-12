-- Test script for conversation_history migration
-- Run this after migration to verify everything works
-- Week 1, Day 1 - Database Schema Verification

-- ============================================================================
-- VERIFICATION TESTS
-- ============================================================================

-- Test 1: Verify table exists
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'conversation_history';

-- Expected: 1 row with table_name = 'conversation_history'

-- Test 2: Verify columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversation_history'
ORDER BY ordinal_position;

-- Expected: 10 columns (id, user_id, project_id, role, message, source, wizard_state_snapshot, triggers_handled, patches_applied, created_at)

-- Test 3: Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversation_history';

-- Expected: 3 indexes (PRIMARY KEY + idx_conversation_history_user_project_time + idx_conversation_history_user_time)

-- Test 4: Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'conversation_history';

-- Expected: rowsecurity = true

-- Test 5: Verify RLS policies
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'conversation_history';

-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- Test 6: Verify CHECK constraints
SELECT
  conname,
  contype,
  consrc
FROM pg_constraint
WHERE conrelid = 'conversation_history'::regclass
  AND contype = 'c';

-- Expected: 2 CHECK constraints (role IN (...), source IN (...))

-- ============================================================================
-- SAMPLE DATA INSERT (for development testing)
-- ============================================================================
-- NOTE: Requires a valid user_id from auth.users table
-- Replace 'YOUR_USER_ID' with actual UUID from auth.users

-- INSERT INTO conversation_history (user_id, project_id, role, message, source)
-- VALUES (
--   'YOUR_USER_ID'::uuid,
--   gen_random_uuid(),
--   'user',
--   'Ik wil een grote keuken met kookeiland',
--   'user'
-- );

-- INSERT INTO conversation_history (user_id, project_id, role, message, source)
-- VALUES (
--   'YOUR_USER_ID'::uuid,
--   (SELECT project_id FROM conversation_history WHERE user_id = 'YOUR_USER_ID'::uuid LIMIT 1),
--   'assistant',
--   'Prima! Ik noteer een grote keuken met kookeiland voor u.',
--   'ai'
-- );

-- ============================================================================
-- SAMPLE QUERY (ConversationMemory.load() pattern)
-- ============================================================================
-- This is what ConversationMemory.ts will actually use

-- SELECT
--   id,
--   role,
--   message,
--   source,
--   wizard_state_snapshot,
--   triggers_handled,
--   patches_applied,
--   created_at
-- FROM conversation_history
-- WHERE user_id = 'YOUR_USER_ID'::uuid
--   AND project_id = 'YOUR_PROJECT_ID'::uuid
-- ORDER BY created_at DESC
-- LIMIT 20;

-- ============================================================================
-- CLEANUP (optional - for development reset)
-- ============================================================================

-- DELETE FROM conversation_history WHERE user_id = 'YOUR_USER_ID'::uuid;

-- ============================================================================
-- VERIFICATION COMPLETE
-- ============================================================================
