import { describe, it, expect, beforeEach, vi } from "vitest";
import { ArchitectEventRouter } from "@/lib/ai/ArchitectEventRouter";
import type { ArchitectEvent } from "@/lib/ai/ArchitectTriggers";
import type { WizardState } from "@/types/project";
import { orchestrateTurn } from "@/lib/ai/orchestrateTurn";

vi.mock("@/lib/ai/orchestrateTurn", () => ({
  orchestrateTurn: vi.fn(async (input: any) => ({
    response: input.query || "Auto response",
    patches: [{ foo: "bar" }],
    metadata: {
      intent: "clarify",
      turnPlan: { goal: "clarify", allowPatches: false } as any,
      tokensUsed: 0,
      attempts: 1,
      usedFallback: false,
      intelligenceTrace: {
        behavior: undefined,
        anticipation: [],
        conflicts: [],
        contextPruned: false,
        guardVerdict: "APPROVED",
      },
    },
  })),
}));

const wizardState: WizardState = {
  stateVersion: 1,
  chapterAnswers: {},
  chapterFlow: [],
  currentChapter: "basis",
  focusedField: null,
  showExportModal: false,
  mode: "PREVIEW",
  triage: undefined,
};

const evtBase = (overrides: Partial<ArchitectEvent>): ArchitectEvent => ({
  id: "evt-1",
  type: "chapter_entered",
  source: "user_input",
  projectId: "p1",
  userId: "u1",
  timestamp: new Date().toISOString(),
  priority: "low",
  ...overrides,
});

describe("ArchitectEventRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses chapter_start path for chapter_entered with non-empty query", async () => {
    const router = new ArchitectEventRouter("p1");
    const evt = evtBase({ type: "chapter_entered", chapter: "basis" });

    const processed = await router.processEvent(evt, { wizardState, projectId: "p1", userId: "u1" });

    expect(processed).toBe(true);
    const call = vi.mocked(orchestrateTurn).mock.calls[0]?.[0];
    expect(call.triggerType).toBe("chapter_start");
    expect(typeof call.query).toBe("string");
    expect(call.query).not.toHaveLength(0);
    expect(call.query).toContain("Context:");
    expect(call.query).toContain("Inzicht:");
    expect(call.query).toContain("Actie:");
    expect(call.interactionMode).toBe("auto");
  });

  it("strips patches and enforces single question for auto mode", async () => {
    vi.mocked(orchestrateTurn).mockResolvedValueOnce({
      response: "Eerste vraag? Tweede vraag?",
      patches: [{ foo: "bar" }],
      metadata: {
        intent: "clarify",
        turnPlan: { goal: "clarify", allowPatches: true } as any,
        tokensUsed: 0,
        attempts: 1,
        usedFallback: false,
        intelligenceTrace: {
          behavior: undefined,
          anticipation: [],
          conflicts: [],
          contextPruned: false,
          guardVerdict: "APPROVED",
        },
      },
    } as any);

    const router = new ArchitectEventRouter("p1");
    const evt = evtBase({ type: "budget_edited", priority: "medium", payload: { newBudget: 120000 } });

    const processed = await router.processEvent(evt, { wizardState, projectId: "p1", userId: "u1" });

    expect(processed).toBe(true);
    expect(router.lastPatches).toEqual([]);
    expect(router.lastResponse).toMatch(/Context:/);
    expect(router.lastResponse).toMatch(/Inzicht:/);
    expect(router.lastResponse).toMatch(/Actie:/);
    const questionMarks = (router.lastResponse?.match(/\?/g) || []).length;
    expect(questionMarks).toBeLessThanOrEqual(1);
  });

  it("sanitizes informal language and emojis, rebuilds structure when missing", async () => {
    vi.mocked(orchestrateTurn).mockResolvedValueOnce({
      response: "Hey je 👋 Dit is los zonder kopjes? Vraag 1? Vraag 2?",
      patches: [],
      metadata: {
        intent: "clarify",
        turnPlan: { goal: "clarify", allowPatches: true } as any,
        tokensUsed: 0,
        attempts: 1,
        usedFallback: false,
        intelligenceTrace: {
          behavior: undefined,
          anticipation: [],
          conflicts: [],
          contextPruned: false,
          guardVerdict: "APPROVED",
        },
      },
    } as any);

    const router = new ArchitectEventRouter("p1");
    const evt = evtBase({ type: "chapter_completed", chapter: "basis" });

    const processed = await router.processEvent(evt, { wizardState, projectId: "p1", userId: "u1" });

    expect(processed).toBe(true);
    expect(router.lastResponse).toMatch(/Context:/);
    expect(router.lastResponse).toMatch(/Inzicht:/);
    expect(router.lastResponse).toMatch(/Actie:/);
    expect(router.lastResponse).not.toMatch(/👋/);
    expect(router.lastResponse?.toLowerCase()).not.toMatch(/\bje\b/);
    const questionMarks = (router.lastResponse?.match(/\?/g) || []).length;
    expect(questionMarks).toBeLessThanOrEqual(1);
  });

  it("retries on contract violation and falls back to deterministic template if still invalid", async () => {
    vi.mocked(orchestrateTurn)
      .mockResolvedValueOnce({
        response: "Losse tekst zonder labels en teveel? vragen? ❗️",
        patches: [],
        metadata: { intent: "clarify", turnPlan: { goal: "clarify", allowPatches: true } as any } as any,
      } as any)
      .mockResolvedValueOnce({
        response: "Nog steeds geen Context of Actie? ?",
        patches: [],
        metadata: { intent: "clarify", turnPlan: { goal: "clarify", allowPatches: true } as any } as any,
      } as any);

    const router = new ArchitectEventRouter("p1");
    const evt = evtBase({ type: "wizard_idle" });

    const processed = await router.processEvent(evt, { wizardState, projectId: "p1", userId: "u1" });

    expect(processed).toBe(true);
    expect(vi.mocked(orchestrateTurn).mock.calls.length).toBe(2);
    expect(router.lastResponse).toMatch(/Context:/);
    expect(router.lastResponse).toMatch(/Inzicht:/);
    expect(router.lastResponse).toMatch(/Actie:/);
    const questionMarks = (router.lastResponse?.match(/\?/g) || []).length;
    expect(questionMarks).toBeLessThanOrEqual(1);
  });
});
