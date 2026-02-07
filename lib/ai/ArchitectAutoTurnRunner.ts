// ArchitectAutoTurnRunner v1.1
// Client-side runner: detect user-originated changes -> enqueue -> process via server auto-turn -> push architect message

"use client";

import { detectArchitectEvents, type ArchitectEvent, type TriggerContext } from "./ArchitectTriggers";
import { ArchitectEventQueue, type FlushMeta } from "./ArchitectEventQueue";
import type { WizardState } from "@/types/project";
import { useChatStore } from "@/lib/stores/useChatStore";
import { useWizardState } from "@/lib/stores/useWizardState";
import { processSSEStream } from "@/lib/sse/client";
import type {
  ChatSSEEventName,
  ErrorEvent,
  ExpertFocusEvent,
  MetadataEvent,
  NavigateEvent,
  PatchEvent,
  RagMetadataEvent,
  StreamEvent,
} from "@/types/chat";

type RunnerContext = {
  projectId?: string;
  userId?: string;
};

const IDLE_MS = 30_000;

type ProjectRuntime = {
  queue: ArchitectEventQueue;
  idleTimer: any;
  latestState?: WizardState;
  latestUserId?: string;
  awaitingUserInput: boolean;
};

const runtimes = new Map<string, ProjectRuntime>();

function getRuntime(projectId: string, userId?: string): ProjectRuntime {
  let runtime = runtimes.get(projectId);
  if (!runtime) {
    const queue = new ArchitectEventQueue(projectId, (evt, meta) => processEvent(projectId, evt, meta));
    runtime = { queue, idleTimer: null, awaitingUserInput: false };
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
  if (runtime.awaitingUserInput) return;
  if (runtime.idleTimer) clearTimeout(runtime.idleTimer);
  runtime.idleTimer = setTimeout(() => {
    const chatState = useChatStore.getState();
    if (chatState.isStreaming) return;
    if (runtime.awaitingUserInput) return;
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

async function processEvent(projectId: string, evt: ArchitectEvent, meta?: FlushMeta) {
  const runtime = runtimes.get(projectId);
  if (!runtime?.latestState) return;
  if (runtime.awaitingUserInput) return;

  const chat = useChatStore.getState();
  let responseText = "";
  let hasAppended = false;

  try {
    const payload = {
      event: evt,
      wizardState: runtime.latestState,
      projectId,
      userId: runtime.latestUserId ?? "auto",
      queueMeta: meta,
    };

    const response = await fetch("/api/auto-turn", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok || !response.body) {
      console.warn("[AutoTurn] Server error", response.status, response.statusText);
      return;
    }

    const handleSSEEvent = (event: ChatSSEEventName, dataRaw: string) => {
      switch (event) {
        case "metadata": {
          const metaEvt = JSON.parse(dataRaw) as MetadataEvent;
          useChatStore.setState({ lastMetadata: metaEvt });
          return;
        }

        case "patch": {
          const patch = JSON.parse(dataRaw) as PatchEvent;
          if (patch.requiresConfirmation) {
            const { addProposal } = useChatStore.getState();
            addProposal(patch, evt.id);
            if (patch.delta?.path) {
              const { setFocusedField } = useWizardState.getState();
              const focusKey = `${patch.chapter}:${patch.delta.path}` as `${string}:${string}`;
              setFocusedField(focusKey);
            }
            return;
          }
          const { applyPatch, setFocusedField } = useWizardState.getState();
          applyPatch(patch.chapter, patch.delta, "ai");
          if (patch.delta?.path) {
            const focusKey = `${patch.chapter}:${patch.delta.path}` as `${string}:${string}`;
            setFocusedField(focusKey);
          }
          return;
        }

        case "navigate": {
          const nav = JSON.parse(dataRaw) as NavigateEvent;
          useChatStore.setState({ lastNavigate: nav });
          if (nav?.chapter) {
            const { goToChapter } = useWizardState.getState();
            goToChapter(nav.chapter as any, "ai");
          }
          return;
        }

        case "reset": {
          const { reset: resetWizard } = useWizardState.getState();
          resetWizard();
          useChatStore.setState({
            messages: [],
            lastMetadata: undefined,
            lastRag: undefined,
            lastNavigate: undefined,
            proposals: [],
          });
          return;
        }

        case "undo": {
          const { undo } = useWizardState.getState();
          if (typeof undo === "function") undo();
          return;
        }

        case "rag_metadata": {
          const rag = JSON.parse(dataRaw) as RagMetadataEvent;
          useChatStore.setState({ lastRag: rag });
          return;
        }

        case "expert_focus": {
          const expertFocus = JSON.parse(dataRaw) as ExpertFocusEvent;
          if (expertFocus?.focusKey) {
            const { setFocusedField } = useWizardState.getState();
            setFocusedField(expertFocus.focusKey as `${string}:${string}`);
          }
          return;
        }

        case "chat_session": {
          const session = JSON.parse(dataRaw);
          const { chatSession: currentSession } = useWizardState.getState();
          useWizardState.setState({
            chatSession: {
              ...currentSession,
              ...session,
            },
          });
          return;
        }

        case "stream": {
          const streamEvt = JSON.parse(dataRaw) as StreamEvent;
          if (streamEvt?.text) {
            responseText += streamEvt.text;
          }
          return;
        }

        case "error": {
          const err = JSON.parse(dataRaw) as ErrorEvent;
          console.error("[AutoTurn SSE error]", err);
          useChatStore.setState({
            error: err.message || "Er ging iets mis in de auto-turn.",
          });
          return;
        }

        case "done": {
          if (!hasAppended && responseText.trim()) {
            chat.appendArchitectMessage(responseText.trim());
            hasAppended = true;
            runtime.awaitingUserInput = true;
          }
          return;
        }
      }
    };

    await processSSEStream(
      response,
      (eventName, dataRaw) => {
        try {
          handleSSEEvent(eventName, dataRaw);
        } catch (e) {
          console.error("[AutoTurn SSE] Failed to handle event", eventName, e);
        }
      },
      (info) => {
        console.warn("[AutoTurn SSE] Malformed event block skipped:", info);
      }
    );

    if (!hasAppended && responseText.trim()) {
      chat.appendArchitectMessage(responseText.trim());
      runtime.awaitingUserInput = true;
    }
  } catch (error) {
    console.error("[AutoTurn] processEvent error", error);
  }
}

export async function handleUserStateChange(
  prev: WizardState,
  next: WizardState,
  ctx?: RunnerContext & TriggerContext
) {
  const projectId = ctx?.projectId ?? "default";
  const runtime = getRuntime(projectId, ctx?.userId);
  runtime.awaitingUserInput = false;
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
    runtime.awaitingUserInput = false;
  }
  runtimes.clear();
}

export function setLastAutoTurn(projectId: string, ts: number) {
  const runtime = getRuntime(projectId);
  runtime.queue.setLastSent(ts);
}
