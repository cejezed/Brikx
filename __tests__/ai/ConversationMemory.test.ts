// __tests__/ai/ConversationMemory.test.ts
// Test suite for ConversationMemory module
// Week 1, Day 2 - Test-First Development

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ConversationTurn, ConversationMemoryResult } from '@/types/ai';

// Mock the Supabase client singleton (must use factory function for hoisting)
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Import after mocking
import { ConversationMemory } from '@/lib/ai/ConversationMemory';
import { supabase } from '@/lib/supabase/client';

const mockSupabaseClient = supabase as any;

describe('ConversationMemory', () => {
  const TEST_USER_ID = 'user-123';
  const TEST_PROJECT_ID = 'project-456';

  let memory: ConversationMemory;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    memory = new ConversationMemory(TEST_USER_ID, TEST_PROJECT_ID);
  });

  // ============================================================================
  // TEST SUITE 1: load() method
  // ============================================================================

  describe('load()', () => {
    it('returns empty result for new user with no conversation history', async () => {
      // Mock Supabase to return empty array
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        order: mockOrder,
      });
      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const result = await memory.load();

      expect(result).toEqual({
        recent: [],
        summary: null,
        turnCount: 0,
        hasLongHistory: false,
      });

      // Verify correct Supabase query
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversation_history');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', TEST_USER_ID);
      expect(mockEq).toHaveBeenCalledWith('project_id', TEST_PROJECT_ID);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(20); // Default maxTurns
    });

    it('returns all 5 turns when only 5 exist', async () => {
      const mockTurns: ConversationTurn[] = [
        {
          id: '5',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'assistant',
          message: 'Turn 5',
          timestamp: Date.now(),
          source: 'ai',
        },
        {
          id: '4',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'user',
          message: 'Turn 4',
          timestamp: Date.now() - 1000,
          source: 'user',
        },
        {
          id: '3',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'assistant',
          message: 'Turn 3',
          timestamp: Date.now() - 2000,
          source: 'ai',
        },
        {
          id: '2',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'user',
          message: 'Turn 2',
          timestamp: Date.now() - 3000,
          source: 'user',
        },
        {
          id: '1',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'user',
          message: 'Turn 1',
          timestamp: Date.now() - 4000,
          source: 'user',
        },
      ];

      setupMockQuery(mockTurns);

      const result = await memory.load();

      expect(result.recent).toHaveLength(5);
      expect(result.turnCount).toBe(5);
      expect(result.hasLongHistory).toBe(false); // <20 turns
      expect(result.summary).toBeNull(); // No summarization yet
    });

    it('returns only most recent 20 turns when 25 exist', async () => {
      // Create 25 mock turns
      const mockTurns: ConversationTurn[] = Array.from({ length: 25 }, (_, i) => ({
        id: `turn-${25 - i}`,
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: i % 2 === 0 ? 'user' : 'assistant',
        message: `Message ${25 - i}`,
        timestamp: Date.now() - i * 1000,
        source: i % 2 === 0 ? 'user' : 'ai',
      }));

      // Supabase returns only 20 (LIMIT 20)
      setupMockQuery(mockTurns.slice(0, 20));

      const result = await memory.load();

      expect(result.recent).toHaveLength(20);
      expect(result.turnCount).toBe(20);
      expect(result.hasLongHistory).toBe(true); // >=20 turns
    });

    it('orders turns by newest first (descending created_at)', async () => {
      const mockTurns: ConversationTurn[] = [
        {
          id: 'newest',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'assistant',
          message: 'Latest message',
          timestamp: Date.now(),
          source: 'ai',
        },
        {
          id: 'older',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'user',
          message: 'Earlier message',
          timestamp: Date.now() - 10000,
          source: 'user',
        },
      ];

      setupMockQuery(mockTurns);

      const result = await memory.load();

      expect(result.recent[0].id).toBe('newest');
      expect(result.recent[1].id).toBe('older');
    });

    it('respects custom maxTurns parameter', async () => {
      const mockTurns: ConversationTurn[] = Array.from({ length: 10 }, (_, i) => ({
        id: `turn-${i}`,
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'user',
        message: `Message ${i}`,
        timestamp: Date.now() - i * 1000,
        source: 'user',
      }));

      setupMockQuery(mockTurns);

      await memory.load(10);

      // Verify limit was called with 10, not default 20
      const mockLimit = mockSupabaseClient.from().select().eq().eq().order().limit;
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  // ============================================================================
  // TEST SUITE 2: addTurn() method
  // ============================================================================

  describe('addTurn()', () => {
    it('successfully persists a new turn and returns it with generated id', async () => {
      const newTurn: Omit<ConversationTurn, 'id'> = {
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'user',
        message: 'Ik wil een grote keuken',
        timestamp: Date.now(),
        source: 'user',
      };

      const insertedTurn: ConversationTurn = {
        ...newTurn,
        id: 'generated-uuid-123',
      };

      // Mock Supabase insert
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [insertedTurn],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      const result = await memory.addTurn(newTurn);

      expect(result).toEqual(insertedTurn);
      expect(result?.id).toBe('generated-uuid-123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversation_history');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: TEST_USER_ID,
        project_id: TEST_PROJECT_ID,
        role: 'user',
        message: 'Ik wil een grote keuken',
        source: 'user',
      }));
    });

    it('includes optional fields when provided (wizardStateSnapshot, triggersHandled)', async () => {
      const newTurn: Omit<ConversationTurn, 'id'> = {
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'assistant',
        message: 'Prima! Ik noteer dat.',
        timestamp: Date.now(),
        source: 'ai',
        wizardStateSnapshot: { currentChapter: 'ruimtes' },
        triggersHandled: ['trigger-1', 'trigger-2'],
        patchesApplied: [{ chapter: 'ruimtes', delta: { operation: 'append' } }],
      };

      const insertedTurn: ConversationTurn = {
        ...newTurn,
        id: 'uuid-456',
      };

      setupMockInsert(insertedTurn);

      const result = await memory.addTurn(newTurn);

      expect(result?.wizardStateSnapshot).toEqual({ currentChapter: 'ruimtes' });
      expect(result?.triggersHandled).toEqual(['trigger-1', 'trigger-2']);
      expect(result?.patchesApplied).toHaveLength(1);
    });
  });

  // ============================================================================
  // TEST SUITE 3: getRelevantContext() method
  // ============================================================================

  describe('getRelevantContext()', () => {
    it('returns turns matching keyword search (case-insensitive)', async () => {
      const mockTurns: ConversationTurn[] = [
        {
          id: 'match-1',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'user',
          message: 'Wat kost een BUDGET van 500k?',
          timestamp: Date.now(),
          source: 'user',
        },
        {
          id: 'match-2',
          userId: TEST_USER_ID,
          projectId: TEST_PROJECT_ID,
          role: 'assistant',
          message: 'Voor een budget van 500k...',
          timestamp: Date.now() - 1000,
          source: 'ai',
        },
      ];

      setupMockQuery(mockTurns);

      const result = await memory.getRelevantContext('budget');

      expect(result).toHaveLength(2);
      expect(result[0].message).toContain('BUDGET');
      expect(result[1].message).toContain('budget');
    });

    it('returns empty array when no matches found', async () => {
      setupMockQuery([]);

      const result = await memory.getRelevantContext('nonexistent');

      expect(result).toEqual([]);
    });

    it('limits results to specified limit (default 5)', async () => {
      const mockTurns: ConversationTurn[] = Array.from({ length: 10 }, (_, i) => ({
        id: `turn-${i}`,
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'user',
        message: 'Contains keyword search',
        timestamp: Date.now() - i * 1000,
        source: 'user',
      }));

      // Mock returns only 5 (LIMIT 5)
      setupMockQuery(mockTurns.slice(0, 5));

      const result = await memory.getRelevantContext('keyword', 5);

      expect(result).toHaveLength(5);
    });

    it('respects custom limit parameter', async () => {
      const mockTurns: ConversationTurn[] = Array.from({ length: 3 }, (_, i) => ({
        id: `turn-${i}`,
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'user',
        message: 'Test message',
        timestamp: Date.now(),
        source: 'user',
      }));

      setupMockQuery(mockTurns);

      await memory.getRelevantContext('test', 3);

      const mockLimit = mockSupabaseClient.from().select().eq().eq().ilike().order().limit;
      expect(mockLimit).toHaveBeenCalledWith(3);
    });
  });

  // ============================================================================
  // TEST SUITE 4: Error Handling
  // ============================================================================

  describe('error handling', () => {
    it('load() returns safe defaults on database error (never throws)', async () => {
      // Mock database error
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST301' },
      });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      // Should NOT throw
      const result = await memory.load();

      expect(result).toEqual({
        recent: [],
        summary: null,
        turnCount: 0,
        hasLongHistory: false,
      });
    });

    it('addTurn() returns null on insert error (graceful degradation)', async () => {
      const newTurn: Omit<ConversationTurn, 'id'> = {
        userId: TEST_USER_ID,
        projectId: TEST_PROJECT_ID,
        role: 'user',
        message: 'Test',
        timestamp: Date.now(),
        source: 'user',
      };

      // Mock insert error
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });
      mockInsert.mockReturnValue({ select: mockSelect });

      const result = await memory.addTurn(newTurn);

      expect(result).toBeNull();
    });

    it('getRelevantContext() returns empty array on query error', async () => {
      // Mock query error
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIlike = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
      });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ ilike: mockIlike });
      mockIlike.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });

      const result = await memory.getRelevantContext('test');

      expect(result).toEqual([]);
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS FOR TEST SETUP
// ============================================================================

/**
 * Setup mock Supabase query to return specific turns
 */
function setupMockQuery(turns: ConversationTurn[]) {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockResolvedValue({ data: turns, error: null });
  const mockIlike = vi.fn().mockReturnThis();

  mockSupabaseClient.from.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder, ilike: mockIlike });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockIlike.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ limit: mockLimit });
}

/**
 * Setup mock Supabase insert to return specific turn
 */
function setupMockInsert(turn: ConversationTurn) {
  const mockInsert = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockResolvedValue({ data: [turn], error: null });

  mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });
  mockInsert.mockReturnValue({ select: mockSelect });
}
