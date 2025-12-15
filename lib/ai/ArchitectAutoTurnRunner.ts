// ArchitectAutoTurnRunner v1.1
// Client-side runner: detect user-originated changes -> enqueue -> process via router -> push architect message

"use client";

import { detectArchitectEvents, type ArchitectEvent, type TriggerContext } from "./ArchitectTriggers";
import { ArchitectEventQueue } from "./ArchitectEventQueue";
import { ArchitectEventRouter } from "./ArchitectEventRouter";
import type { WizardState } from "@/types/project";
import { useChatStore } from "@/lib/stores/useChatStore";

type RunnerContext = {
  projectId?: string;
  userId?: string;
};

const IDLE_MS = 30_000;

type ProjectRuntime = {
  queue: ArchitectEventQueue;
  router: ArchitectEventRouter;
  idleTimer: any;
  latestState?: WizardState;
  latestUserId?: string;
};

const runtimes = new Map<string, ProjectRuntime>();

function getRuntime(projectId: string, userId?: string): ProjectRuntime {
  let runtime = runtimes.get(projectId);
  if (!runtime) {
    const router = new ArchitectEventRouter(projectId);
    const queue = new ArchitectEventQueue(projectId, (evt) => processEvent(projectId, evt));
    runtime = { queue, router, idleTimer: null };
    runtimes.set(projectId, runtime);
  }
  if (userId) {
    runtime.latestUserId = userId;
  }
  return runtime;
}

function resetIdle(projectId: string, ctx?: RunnerContext & TriggerContext) {
  if (ctx?.lastChangeSource && ctx.lastChangeSource !== "user") return;
  const runtime = getRuntime(projectId, ctx?.userId);
  if (runtime.idleTimer) clearTimeout(runtime.idleTimer);
  runtime.idleTimer = setTimeout(() => {
    const chatState = useChatStore.getState();
    if (chatState.isStreaming) return;
    runtime.queue.enqueue([
      {
        id: crypto.randomUUID(),
        type: "wizard_idle",
        source: "user_input",
        projectId,
        userId: ctx?.userId,
        timestamp: new Date().toISOString(),
        priority: "low",
      } as any,
    ]);
  }, IDLE_MS);
}

async function processEvent(projectId: string, evt: ArchitectEvent) {
  const runtime = runtimes.get(projectId);
  if (!runtime?.latestState) return;
  const processed = await runtime.router.processEvent(evt, {
    wizardState: runtime.latestState,
    projectId,
    userId: runtime.latestUserId ?? "auto",
  });
  if (!processed || !runtime.router.lastResponse) return;
  const chat = useChatStore.getState();
  chat.appendArchitectMessage(runtime.router.lastResponse);
}

export async function handleUserStateChange(
  prev: WizardState,
  next: WizardState,
  ctx?: RunnerContext & TriggerContext
) {
  const projectId = ctx?.projectId ?? "default";
  const runtime = getRuntime(projectId, ctx?.userId);
  runtime.latestState = next;
  resetIdle(projectId, ctx);
  const events = detectArchitectEvents(prev, next, ctx);
  if (!events.length) return;
  runtime.queue.enqueue(events);
}

export function resetArchitectRunnerState() {
  for (const runtime of runtimes.values()) {
    if (runtime.idleTimer) {
      clearTimeout(runtime.idleTimer);
    }
    runtime.queue.reset();
    runtime.router.reset();
  }
  runtimes.clear();
}

export function setLastAutoTurn(projectId: string, ts: number) {
  const runtime = getRuntime(projectId);
  runtime.queue.setLastSent(ts);
}
