// /lib/stores/useChatStore.ts
// ============================================================================
// BRIKX Build v3.x - Chat Store (Shared Brain Client)
// - Beheert chatgeschiedenis
// - Roept /api/chat aan met WizardState-snapshot
// - Verwerkt SSE-events volgens types/chat.ts
// - Stuurt patches door naar useWizardState.applyPatch()
// - Stuurt navigatie door naar useWizardState.goToChapter()
// - Slaat metadata (intent/policy/RAG/navigate) op voor debug
// - Doet GEEN eigen triage en GEEN directe chapterAnswers-mutaties
//
// ✅ WIJZIGING: Nu met 'persist' middleware om chatgeschiedenis
//    in localStorage op te slaan.
// ============================================================================

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { useWizardState } from "./useWizardState";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  ChatRequest,
  ChatSSEEventName,
  MetadataEvent,
  PatchEvent,
  StreamEvent,
  ErrorEvent,
  RagMetadataEvent,
  NavigateEvent,
  ExpertFocusEvent, // ✅ v3.8
} from "@/types/chat";
import type { ChapterKey, WizardState as CoreWizardState } from "@/types/project";

// ============================================================================
// Types
// ============================================================================

export type ChatRole = "user" | "assistant" | "system" | "architect";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

interface ChatStoreState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error?: string;

  // Debug / inzicht
  lastMetadata?: MetadataEvent;
  lastRag?: RagMetadataEvent;
  lastNavigate?: NavigateEvent;

  abortController?: AbortController;

  sendMessage: (query: string, mode?: "PREVIEW" | "PREMIUM") => Promise<void>;
  appendSystemMessage: (content: string) => void;
  appendArchitectMessage: (content: string) => void;
  reset: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: nanoid(),
    role,
    content,
    createdAt: Date.now(),
  };
}

/**
 * Materialize incomplete WizardState to full type
 * (voor SSE patch validation)
 */
function materializeWizardState(
  ws: Partial<CoreWizardState>
): CoreWizardState {
  return {
    stateVersion: ws.stateVersion ?? 1,
    chapterAnswers: (ws.chapterAnswers ?? {}) as CoreWizardState["chapterAnswers"],
    chapterFlow: (ws.chapterFlow ?? []) as CoreWizardState["chapterFlow"],
    currentChapter: ws.currentChapter,
    focusedField: ws.focusedField ?? null,
    showExportModal: ws.showExportModal ?? false,
  } as CoreWizardState;
}

/**
 * Snapshot van WizardState voor ChatRequest (Shared Brain)
 * ⚠️ Geef exact het shape van CoreWizardState terug (gène extra props)
 */
function buildWizardSnapshot(): CoreWizardState {
  const {
    stateVersion,
    chapterAnswers,
    currentChapter,
    chapterFlow,
    focusedField,
    showExportModal,
  } = useWizardState.getState();

  return materializeWizardState({
    stateVersion,
    chapterAnswers,
    currentChapter,
    chapterFlow,
    focusedField,
    showExportModal,
  });
}

// ============================================================================
// Store
// ============================================================================

export const useChatStore = create(
  persist<ChatStoreState>(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      error: undefined,

      lastMetadata: undefined,
      lastRag: undefined,
      lastNavigate: undefined,

      abortController: undefined,

      // ====================================================================
      // System message helper
      // ====================================================================
      appendSystemMessage: (content: string) =>
        set((state) => ({
          messages: [...state.messages, createMessage("system", content)],
        })),
      appendArchitectMessage: (content: string) =>
        set((state) => ({
          messages: [...state.messages, createMessage("architect", content)],
        })),

      // ====================================================================
      // Reset chat history (wizard-state blijft staan)
      // ====================================================================
      reset: () => {
        const { abortController } = get();
        if (abortController) abortController.abort();

        set({
          messages: [],
          isStreaming: false,
          error: undefined,
          lastMetadata: undefined,
          lastRag: undefined,
          lastNavigate: undefined,
          abortController: undefined,
        });
      },

      // ====================================================================
      // Core: Verstuur bericht + SSE verwerken
      // ====================================================================
      sendMessage: async (query: string, mode = "PREVIEW") => {
        const trimmed = query.trim();
        if (!trimmed) return;

        // Collect history for context
        const currentMessages = get().messages;
        const history = currentMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-6)
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // Stop evt. vorige stream
        const previous = get().abortController;
        if (previous) previous.abort();

        const abortController = new AbortController();

        // 1) Voeg user-bericht toe
        set((state) => ({
          messages: [...state.messages, createMessage("user", trimmed)],
          isStreaming: true,
          error: undefined,
          abortController,
        }));

        // 2) Bouw payload met gedeelde WizardState snapshot
        const wizardState = buildWizardSnapshot();

        const payload: ChatRequest = {
          query: trimmed,
          wizardState,
          mode,
          history,
        };

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json",
            },
            signal: abortController.signal,
          });

          if (!response.ok || !response.body) {
            const text = await response.text().catch(() => "");
            throw new Error(
              text || `Chat API error (${response.status} ${response.statusText})`
            );
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");

          // Streaming buffer voor huidig assistant-antwoord
          let assistantId = nanoid();
          let sseBuffer = "";

          const pushAssistant = (chunk: string, done = false) => {
            if (!chunk && !done) return;

            set((state) => {
              const idx = state.messages.findIndex((m) => m.id === assistantId);

              // Eerste chunk → nieuw bericht
              if (idx === -1) {
                const msg = createMessage("assistant", chunk);
                msg.id = assistantId;
                return {
                  ...state,
                  messages: [...state.messages, msg],
                };
              }

              // Append aan bestaand bericht
              const messages = [...state.messages];
              const current = messages[idx];
              messages[idx] = {
                ...current,
                content: current.content + chunk,
              };
              return { ...state, messages };
            });

            if (done) {
              // Volgend antwoord krijgt nieuwe id
              assistantId = nanoid();
            }
          };

          // ==================================================================
          // SSE event handler
          // ==================================================================
          const handleSSEEvent = (event: ChatSSEEventName, dataRaw: string) => {
            switch (event) {
              case "metadata": {
                const meta = JSON.parse(dataRaw) as MetadataEvent;
                set({ lastMetadata: meta });
                return;
              }

              case "patch": {
                const patch = JSON.parse(dataRaw) as PatchEvent;
                const { applyPatch, setFocusedField } = useWizardState.getState();
                applyPatch(patch.chapter, patch.delta, "ai");

                // ✅ v3.6: Focus het ingevulde veld zodat de gebruiker ziet wat er is aangepast
                if (patch.delta?.path) {
                  const focusKey = `${patch.chapter}:${patch.delta.path}` as `${string}:${string}`;
                  setFocusedField(focusKey);
                }
                return;
              }

              case "navigate": {
                const nav = JSON.parse(dataRaw) as NavigateEvent;
                set({ lastNavigate: nav });

                if (nav?.chapter) {
                  const { goToChapter } = useWizardState.getState();
                  goToChapter(nav.chapter as ChapterKey, "ai");
                }
                return;
              }

              case "reset": {
                // ✅ v3.6: Reset de wizard state wanneer de AI action="reset" stuurt
                console.log("[Chat SSE] Reset event received - clearing wizard AND chat");
                const { reset: resetWizard } = useWizardState.getState();
                resetWizard();

                // Ook de chat history wissen zodat de conversatie opnieuw begint
                set({
                  messages: [],
                  lastMetadata: undefined,
                  lastRag: undefined,
                  lastNavigate: undefined,
                });
                return;
              }

              case "undo": {
                // ✅ v3.7: Undo de laatste patch wanneer de AI action="undo" stuurt
                console.log("[Chat SSE] Undo event received");
                const { undo } = useWizardState.getState();
                if (typeof undo === "function") {
                  undo();
                } else {
                  console.warn("[Chat SSE] Undo function not available in wizard state");
                }
                return;
              }

              case "rag_metadata": {
                const rag = JSON.parse(dataRaw) as RagMetadataEvent;
                set({ lastRag: rag });
                return;
              }

              case "expert_focus": {
                // ✅ v3.8: Chat → ExpertCorner sync
                // Wanneer de AI een veld/topic identificeert, update de ExpertCorner focus
                const expertFocus = JSON.parse(dataRaw) as ExpertFocusEvent;
                console.log("[Chat SSE] Expert focus event received:", expertFocus);
                if (expertFocus?.focusKey) {
                  const { setFocusedField } = useWizardState.getState();
                  setFocusedField(expertFocus.focusKey as `${string}:${string}`);
                }
                return;
              }

              case "stream": {
                const stream = JSON.parse(dataRaw) as StreamEvent;

                if (stream?.text) {
                  pushAssistant(stream.text, !!(stream as any).done);
                } else if ((stream as any).done) {
                  pushAssistant("", true);
                }
                return;
              }

              case "error": {
                const err = JSON.parse(dataRaw) as ErrorEvent;
                console.error("[Chat SSE error]", err);
                set({
                  error: err.message || "Er ging iets mis in de chat.",
                });
                return;
              }

              case "done": {
                // Sluit lopende assistant-stream netjes af
                pushAssistant("", true);
                set({
                  isStreaming: false,
                  abortController: undefined,
                });
                return;
              }
            }
          };

          // ==================================================================
          // SSE chunk parser
          // ==================================================================
          const processSSEChunk = (chunk: string) => {
            sseBuffer += chunk;

            const blocks = sseBuffer.split("\n\n");
            // Laatste block kan incompleet zijn → bewaren
            sseBuffer = blocks.pop() || "";

            for (const block of blocks) {
              const trimmedBlock = block.trim();
              if (!trimmedBlock) continue;

              const lines = trimmedBlock.split("\n");
              const eventLine = lines.find((l) => l.startsWith("event:"));
              const dataLines = lines.filter((l) => l.startsWith("data:"));

              const eventName = eventLine
                ? (eventLine.replace("event:", "").trim() as ChatSSEEventName)
                : null;

              const dataRaw = dataLines
                .map((l) => l.replace("data:", "").trim())
                .join("");

              if (!eventName || !dataRaw) {
                console.warn("[SSE] Malformed event block skipped:", {
                  eventName,
                  dataRaw,
                  block,
                });
                continue;
              }

              try {
                handleSSEEvent(eventName, dataRaw);
              } catch (e) {
                console.error("[SSE] Failed to handle event", eventName, e);
              }
            }
          };

          // ==================================================================
          // Lees-loop
          // ==================================================================
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, {
              stream: true,
            });
            if (text) {
              processSSEChunk(text);
            }
          }

          // Extra veiligheidsnet: als server geen "done" stuurde
          set((state) => ({
            ...state,
            isStreaming: false,
            abortController: undefined,
          }));
        } catch (err: any) {
          if (err?.name === "AbortError") {
            // Handmatig afgebroken → geen error tonen
            set({
              isStreaming: false,
              abortController: undefined,
            });
            return;
          }

          console.error("[Chat] sendMessage error", err);
          set({
            isStreaming: false,
            error:
              err?.message ||
              "Onbekende fout bij het verzenden van het bericht.",
            abortController: undefined,
          });
        }
      },
    }),
    {
      // Persist configuratie
      name: "brikx-chat-storage",
      storage: createJSONStorage(() => localStorage),

      // Sla alleen de messages array op
      // (niet isStreaming, abortController, etc)
      // ✅ FIXED: Type casting to any to satisfy Zustand persist typing
      // We only persist messages, other fields are runtime-only state
      partialize: (state) => ({ messages: state.messages }) as any,
    }
  )
);

export default useChatStore;
