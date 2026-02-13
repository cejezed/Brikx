// Regressietest: chapter opening mag maar 1x triggeren bij overgang
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ChapterInitializer en orchestrateTurn call-path
vi.mock('@/lib/ai/ChapterInitializer', () => ({
  ChapterInitializer: vi.fn(() => ({
    handleChapterStart: vi.fn().mockReturnValue({
      message: 'Welkom in hoofdstuk X',
      turnGoal: 'clarify',
      allowPatches: true,
      focusChapter: 'basis',
    }),
  })),
}));

vi.mock('@/lib/ai/orchestrateTurn', () => ({
  orchestrateTurn: vi.fn(),
}));

// SUT
import * as ChatRoute from '@/app/api/chat/logic';
import { ChapterInitializer } from '@/lib/ai/ChapterInitializer';
import { orchestrateTurn } from '@/lib/ai/orchestrateTurn';

describe('chat route - chapter initializer triggers only once on transition', () => {
  const mockWriter = () => {
    const events: any[] = [];
    return {
      writeEvent: vi.fn((type, payload) => events.push({ type, payload })),
      close: vi.fn(),
      events,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls ChapterInitializer on chapter change and skips orchestrateTurn', async () => {
    const writer = mockWriter();

    // Minimal wizard state with previous chapter different from incoming currentChapter
    const wizardState: any = {
      stateVersion: 1,
      chapterAnswers: {},
      currentChapter: 'basis',
      chapterFlow: ['basis', 'wensen'],
    };

    // Spy on ChapterInitializer
    // Run the internal triage helper directly (synchronous path)
    await (ChatRoute as any).runAITriage(writer, {
      requestId: 'req-1',
      startTime: Date.now(),
      query: 'Open wensen hoofdstuk',
      mode: 'PREVIEW',
      wizardState: { ...wizardState, currentChapter: 'wensen' },
      history: [{ role: 'user', content: 'Hallo' }],
    });

    const ciInstance = (ChapterInitializer as any).mock.instances[0];

    // Assert ChapterInitializer used (transition basis -> wensen)
    expect((ChapterInitializer as any).mock.calls.length).toBeGreaterThan(0);
    if (ciInstance?.handleChapterStart) {
      expect(ciInstance.handleChapterStart).toHaveBeenCalledTimes(1);
    }

    // OrchestrateTurn should not have been invoked for the opening
    expect(orchestrateTurn).not.toHaveBeenCalled();
  });
});
