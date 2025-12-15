import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { handleUserStateChange, resetArchitectRunnerState, setLastAutoTurn } from "@/lib/ai/ArchitectAutoTurnRunner";
import { useChatStore } from "@/lib/stores/useChatStore";
import type { WizardState } from "@/types/project";

vi.mock("@/lib/ai/orchestrateTurn", () => ({
  orchestrateTurn: vi.fn(async () => ({
    response: "Auto msg",
    patches: [],
    metadata: {
      intent: "clarify",
      turnPlan: {
        goal: "clarify",
        priority: "user_query",
        route: "normal",
        reasoning: "",
        allowPatches: false,
      } as any,
      tokensUsed: 0,
      attempts: 1,
      usedFallback: false,
      guardVerdict: "APPROVED",
    },
  })),
}));

const createState = (overrides: Partial<WizardState>): WizardState => ({
  stateVersion: 1,
  chapterAnswers: {},
  chapterFlow: [],
  currentChapter: "basis",
  focusedField: null,
  showExportModal: false,
  mode: "PREVIEW",
  triage: undefined,
  ...overrides,
});

beforeAll(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  });
  if (!(globalThis as any).crypto?.randomUUID) {
    const { randomUUID } = require("crypto");
    (globalThis as any).crypto = { ...(globalThis as any).crypto, randomUUID };
  }
});

beforeEach(() => {
  resetArchitectRunnerState();
  useChatStore.getState().reset();
  vi.useRealTimers();
});

describe("ArchitectAutoTurnRunner wiring", () => {
  it("chapter switch (user) produces architect message via router", async () => {
    vi.useFakeTimers();
    const prev = createState({ currentChapter: "basis" });
    const next = createState({ currentChapter: "ruimtes" });

    await handleUserStateChange(prev, next, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });

    await vi.runAllTimersAsync();

    const msgs = useChatStore.getState().messages;
    const architectMsg = msgs.find((m) => m.role === "architect");
    expect(architectMsg).toBeDefined();
    expect(architectMsg?.content).toMatch(/Context:/);
    expect(architectMsg?.content).toMatch(/Inzicht:/);
    expect(architectMsg?.content).toMatch(/Actie:/);
  });

  it("silence guard: multiple events in one change produce max 1 architect message until next user input", async () => {
    vi.useFakeTimers();
    const prev = createState({
      currentChapter: "basis",
      chapterAnswers: { budget: { budgetTotaal: 100000 } } as any,
    });
    const next = createState({
      currentChapter: "budget",
      chapterAnswers: { budget: { budgetTotaal: 120000 } } as any,
    });

    await handleUserStateChange(prev, next, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });
    await vi.advanceTimersByTimeAsync(800);

    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(1);

    // Fire another idle event without new user change; should be blocked by awaitingUserInput
    vi.advanceTimersByTime(31_000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(1);

    // Now new user change should allow next auto-turn
    const next2 = createState({
      currentChapter: "budget",
      chapterAnswers: { budget: { budgetTotaal: 140000 } } as any,
    });
    await handleUserStateChange(next, next2, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });
    await vi.advanceTimersByTimeAsync(800);
    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(2);
  });

  it("AI/system changes do NOT trigger events", async () => {
    vi.useFakeTimers();
    const prev = createState({ currentChapter: "basis" });
    const next = createState({ currentChapter: "ruimtes" });

    await handleUserStateChange(prev, next, {
      mode: "auto",
      lastChangeSource: "ai",
      projectId: "p1",
      userId: "u1",
    });

    await vi.runAllTimersAsync();

    const msgs = useChatStore.getState().messages;
    expect(msgs.length).toBe(0);
  });

  it("budget change respects rate limit (10s)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
    const prev = createState({ chapterAnswers: { budget: { budgetTotaal: 100000 } } as any });
    const next = createState({ chapterAnswers: { budget: { budgetTotaal: 120000 } } as any });

    await handleUserStateChange(prev, next, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });
    await vi.advanceTimersByTimeAsync(800); // debounce flush
    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(1);

    setLastAutoTurn("p1", 0);
    vi.setSystemTime(new Date(1000));
    const next2 = createState({ chapterAnswers: { budget: { budgetTotaal: 130000 } } as any });
    await handleUserStateChange(next, next2, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });
    await vi.advanceTimersByTimeAsync(800);

    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(1);
    vi.setSystemTime(new Date(11_000));
    const next3 = createState({ chapterAnswers: { budget: { budgetTotaal: 150000 } } as any });
    await handleUserStateChange(next2, next3, {
      mode: "user",
      lastChangeSource: "user",
      projectId: "p1",
      userId: "u1",
    });
    await vi.advanceTimersByTimeAsync(800);

    expect(useChatStore.getState().messages.filter((m) => m.role === "architect").length).toBe(2);
  });
});
