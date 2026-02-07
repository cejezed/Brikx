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
import { processSSEStream } from "@/lib/sse/client";

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

export interface ProposalItem {
  id: string;
  createdAt: number;
  sourceEventId?: string;
  patch: PatchEvent;
  dedupeKey: string;
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
  proposals: ProposalItem[];

  sendMessage: (query: string, mode?: "PREVIEW" | "PREMIUM") => Promise<void>;
  appendSystemMessage: (content: string) => void;
  appendArchitectMessage: (content: string) => void;
  addProposal: (patch: PatchEvent, sourceEventId?: string) => void;
  applyProposal: (proposalId: string) => void;
  dismissProposal: (proposalId: string) => void;
  clearProposalsForEvent: (sourceEventId: string) => void;
  pruneProposalsByAppliedPatch: (applied: {
    chapter: string;
    path?: string;
    operation?: string;
    value?: any;
  }) => void;
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

function buildProposalDedupeKey(patch: PatchEvent, sourceEventId?: string): string {
  const delta = patch.delta || ({} as any);
  const value = delta.value === undefined ? "undefined" : JSON.stringify(delta.value);
  return [
    sourceEventId || "no-event",
    patch.chapter,
    delta.operation,
    delta.path,
    value,
  ].join("|");
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
      proposals: [],

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
      // Proposals
      // ====================================================================
      addProposal: (patch, sourceEventId) =>
        set((state) => {
          const dedupeKey = buildProposalDedupeKey(patch, sourceEventId);
          if (state.proposals.some((p) => p.dedupeKey === dedupeKey)) {
            return state;
          }
          const proposal: ProposalItem = {
            id: nanoid(),
            createdAt: Date.now(),
            sourceEventId,
            patch,
            dedupeKey,
          };
          return { proposals: [...state.proposals, proposal] };
        }),
      applyProposal: (proposalId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;
        const { applyPatch, setFocusedField } = useWizardState.getState();
        applyPatch(proposal.patch.chapter, proposal.patch.delta, "ai");
        if (proposal.patch.delta?.path) {
          const focusKey = `${proposal.patch.chapter}:${proposal.patch.delta.path}` as `${string}:${string}`;
          setFocusedField(focusKey);
        }
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== proposalId),
        }));
      },
      dismissProposal: (proposalId) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== proposalId),
        })),
      clearProposalsForEvent: (sourceEventId) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.sourceEventId !== sourceEventId),
        })),
      pruneProposalsByAppliedPatch: (applied) =>
        set((state) => {
          if (!applied?.chapter || !applied?.path || !applied?.operation) return state;
          const { chapter, path, operation, value } = applied;
          const appliedValueJson = (() => {
            try {
              return JSON.stringify(value);
            } catch {
              return null;
            }
          })();

          const next = state.proposals.filter((p) => {
            const delta = p.patch.delta;
            if (!delta) return true;
            if (p.patch.chapter !== chapter) return true;
            if (delta.path !== path) return true;
            if (delta.operation !== operation) return true;

            if (operation === "set") {
              try {
                return JSON.stringify(delta.value) !== appliedValueJson;
              } catch {
                return false;
              }
            }

            if (operation === "append") {
              try {
                return JSON.stringify(delta.value) !== appliedValueJson;
              } catch {
                return false;
              }
            }

            return false;
          });

          if (next.length === state.proposals.length) return state;
          return { proposals: next };
        }),

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
          proposals: [],
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

          // Streaming buffer voor huidig assistant-antwoord
          let assistantId = nanoid();

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

              case "chat_session": {
                // ✅ v2.0: Sync chat session intelligence (PIM, Obligations)
                const session = JSON.parse(dataRaw);
                console.log("[Chat SSE] Chat session update received:", session);
                const { chatSession: currentSession } = useWizardState.getState();

                // Update wizard state with new session info
                useWizardState.setState({
                  chatSession: {
                    ...currentSession,
                    ...session
                  }
                });
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

          await processSSEStream(
            response,
            (eventName, dataRaw) => {
              try {
                handleSSEEvent(eventName, dataRaw);
              } catch (e) {
                console.error("[SSE] Failed to handle event", eventName, e);
              }
            },
            (info) => {
              console.warn("[SSE] Malformed event block skipped:", info);
            }
          );

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
