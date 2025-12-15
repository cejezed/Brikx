import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ArchitectEventQueue } from "@/lib/ai/ArchitectEventQueue";
import type { ArchitectEvent } from "@/lib/ai/ArchitectTriggers";

const baseEvent = (overrides: Partial<ArchitectEvent> = {}): ArchitectEvent => ({
  id: overrides.id ?? "evt-1",
  type: overrides.type ?? "chapter_entered",
  source: overrides.source ?? "user_input",
  projectId: overrides.projectId,
  userId: overrides.userId,
  timestamp: overrides.timestamp ?? new Date().toISOString(),
  priority: overrides.priority ?? "low",
  chapter: overrides.chapter,
  fieldPath: overrides.fieldPath,
  payload: overrides.payload,
});

describe("ArchitectEventQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces and flushes highest priority first", async () => {
    const flushed: ArchitectEvent[] = [];
    const queue = new ArchitectEventQueue("p1", (evt) => {
      flushed.push(evt);
    });

    queue.enqueue([
      baseEvent({ id: "low", priority: "low" }),
      baseEvent({ id: "high", priority: "high" }),
    ]);

    expect(flushed.length).toBe(0);
    await vi.advanceTimersByTimeAsync(700);
    expect(flushed.length).toBe(0);

    await vi.advanceTimersByTimeAsync(100); // 800ms total >= debounce
    expect(flushed.length).toBe(1);
    expect(flushed[0].id).toBe("high");
  });

  it("dedupes identical events within TTL", async () => {
    const flushed: ArchitectEvent[] = [];
    const queue = new ArchitectEventQueue("p1", (evt) => {
      flushed.push(evt);
    });

    const evt = baseEvent({ id: "dedupe", type: "budget_edited", priority: "medium", payload: { id: "b1" } });
    queue.enqueue([evt]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(1);

    vi.setSystemTime(new Date(10_000));
    queue.enqueue([evt]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(1);

    vi.setSystemTime(new Date(31_000));
    queue.enqueue([evt]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(2);
  });

  it("enforces rate limit of 10s per project", async () => {
    const flushed: ArchitectEvent[] = [];
    const queue = new ArchitectEventQueue("p1", (evt) => {
      flushed.push(evt);
    });

    queue.enqueue([baseEvent({ id: "first", priority: "high" })]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(1);

    vi.setSystemTime(new Date(1_000));
    queue.enqueue([baseEvent({ id: "second", priority: "high", payload: { id: "second" } })]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(1);

    vi.setSystemTime(new Date(11_000));
    queue.enqueue([baseEvent({ id: "third", priority: "high", payload: { id: "third" } })]);
    await vi.runAllTimersAsync();
    expect(flushed.length).toBe(2);
  });
});
