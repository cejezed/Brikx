// ArchitectEventQueue v1.1 - effective debounce (leading), priority, rate limit, dedupe

import type { ArchitectEvent } from "./ArchitectTriggers";

type Priority = "high" | "medium" | "low";

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

export type FlushMeta = { enqueueTs: number; flushTs: number };
type FlushCallback = (evt: ArchitectEvent, meta: FlushMeta) => void | Promise<void>;

export class ArchitectEventQueue {
  private queue: ArchitectEvent[] = [];
  private debounceTimer: any = null;
  private isFlushing = false;
  private lastSentTs: number | null = null;
  private dedupeCache: Map<string, number> = new Map();
  private enqueueTimestamps: Map<string, number> = new Map();
  private readonly dedupeTTL = 30_000; // 30s
  private readonly debounceMs = 750;
  private readonly rateMs = 10_000;

  constructor(private readonly projectId: string, private onFlush?: FlushCallback) {}

  setFlushCallback(cb: FlushCallback) {
    this.onFlush = cb;
  }

  enqueue(events: ArchitectEvent[]) {
    if (!events || events.length === 0) return;
    for (const evt of events) {
      const dedupeKey = this.buildDedupeKey(evt);
      const now = Date.now();
      const lastSeen = this.dedupeCache.get(dedupeKey);
      if (lastSeen !== undefined && now - lastSeen < this.dedupeTTL) continue;
      this.dedupeCache.set(dedupeKey, now);
      // ensure project id is set for rate limiting
      const enriched = { ...evt, projectId: evt.projectId ?? this.projectId };
      this.queue.push(enriched);
      this.enqueueTimestamps.set(enriched.id, now);
    }

    this.scheduleFlush();
  }

  reset() {
    this.queue = [];
    this.dedupeCache.clear();
    this.enqueueTimestamps.clear();
    this.lastSentTs = null;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.isFlushing = false;
  }

  setLastSent(ts: number) {
    this.lastSentTs = ts;
  }

  private scheduleFlush() {
    if (this.debounceTimer) return;
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushLeading();
    }, this.debounceMs);
  }

  private async flushLeading() {
    if (this.isFlushing) return;
    this.isFlushing = true;
    try {
      const evt = this.popHighestPriority();
      if (!evt) return;

      const now = Date.now();
      if (this.lastSentTs !== null && now - this.lastSentTs < this.rateMs) {
        // Rate limited: drop this event but keep cache timestamps
        return;
      }
      this.lastSentTs = now;
      if (this.onFlush) {
        const enqueueTs = this.enqueueTimestamps.get(evt.id) ?? now;
        await this.onFlush(evt, { enqueueTs, flushTs: now });
      }
      this.enqueueTimestamps.delete(evt.id);
    } finally {
      this.isFlushing = false;
      if (this.queue.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  private popHighestPriority(): ArchitectEvent | null {
    if (this.queue.length === 0) return null;
    this.queue.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
    return this.queue.shift() ?? null;
  }

  private buildDedupeKey(evt: ArchitectEvent): string {
    const chapter = evt.chapter ?? "";
    const trigger = evt.type ?? "";
    const id = evt.payload?.id ?? evt.id ?? "";
    let payloadSignature = "";
    try {
      payloadSignature = evt.payload ? JSON.stringify(evt.payload) : "";
    } catch {
      payloadSignature = "";
    }
    return `${trigger}:${chapter}:${id}:${payloadSignature}`;
  }
}
