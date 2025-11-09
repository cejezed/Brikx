// components/chat/ChatPanel.tsx
'use client';

import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import HumanHandoffModal from './HumanHandoffModal';
import detectFastIntent from '@/lib/chat/detectFastIntent';
import applyChatResponse from '@/lib/chat/applyChatResponse';
import type { ChapterKey } from '@/types/chat';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ChatSSEEventName =
  | 'metadata'
  | 'patch'
  | 'navigate'
  | 'stream'
  | 'rag_metadata'
  | 'error'
  | 'done';

const WELCOME_MESSAGE: Msg = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Hoi! Ik ben **Jules**, uw digitale bouwcoach.\n\n' +
    'Ik help u om stap voor stap een professioneel Programma van Eisen (PvE) op te bouwen.\n\n' +
    'Tip: U kunt gewoon typen wat u wilt, bijvoorbeeld:\n' +
    '- "budget 250k"\n' +
    '- "we willen 3 slaapkamers en een werkkamer"\n' +
    '- "ga naar wensen"\n\n' +
    'Ik vul de wizard en navigeer automatisch mee. Waar zal ik mee beginnen?',
};

// Leest direct uit Zustand, zonder extra renders
function snapshotWizardState() {
  const s =
    (useWizardState as any).getState?.() ??
    {};
  return {
    stateVersion: s.stateVersion ?? 1,
    triage: s.triage ?? {},
    chapterAnswers: s.chapterAnswers ?? {},
    currentChapter:
      s.currentChapter ??
      s.triage?.currentChapter ??
      undefined,
    chapterFlow: Array.isArray(s.chapterFlow)
      ? s.chapterFlow
      : [],
    focusedField: s.focusedField,
    showExportModal: !!s.showExportModal,
  };
}

export default function ChatPanel() {
  const goToChapter = useWizardState(
    (s: any) => s.goToChapter
  );
  const patchTriage = useWizardState(
    (s: any) => s.patchTriage
  );
  const patchChapterAnswer = useWizardState(
    (s: any) => s.patchChapterAnswer
  );

  const [messages, setMessages] =
    useState<Msg[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] =
    useState(false);
  const [showHandoff, setShowHandoff] =
    useState(false);

  const abortRef =
    useRef<AbortController | null>(null);
  const streamingIdRef =
    useRef<string | null>(null);

  // Append tekst aan laatste streaming-assistantbericht
  const appendStream = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      setMessages((prev) => {
        let id = streamingIdRef.current;
        if (!id) {
          id = crypto.randomUUID();
          streamingIdRef.current = id;
          return [
            ...prev,
            {
              id,
              role: 'assistant',
              text: chunk,
            },
          ];
        }
        return prev.map((m) =>
          m.id === id
            ? {
                ...m,
                text: (m.text || '') + chunk,
              }
            : m
        );
      });
    },
    []
  );

  const startAssistantMessage =
    useCallback(() => {
      const id = crypto.randomUUID();
      streamingIdRef.current = id;
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          text: '',
        },
      ]);
    }, []);

  const stopStreaming = useCallback(() => {
    streamingIdRef.current = null;
    setLoading(false);
  }, []);

  const handleSSEChunk = useCallback(
    (
      event: ChatSSEEventName,
      rawData: string
    ) => {
      let data: any = rawData;

      try {
        if (
          rawData &&
          (rawData.startsWith('{') ||
            rawData.startsWith('['))
        ) {
          data = JSON.parse(rawData);
        }
      } catch {
        data = { text: rawData };
      }

      // Eerst via applyChatResponse proberen
      const applied = applyChatResponse(
        undefined,
        (() => {
          switch (event) {
            case 'patch':
              return { patch: data };
            case 'navigate':
              return { navigate: data };
            case 'stream':
              return {
                text:
                  typeof data ===
                  'string'
                    ? data
                    : data.text,
              };
            default:
              return { [event]: data };
          }
        })(),
        {
          patchTriage:
            patchTriage || undefined,
          patchChapterAnswer:
            patchChapterAnswer ||
            undefined,
          goToChapter:
            goToChapter || undefined,
          appendStream: (t: string) =>
            appendStream(t),
        }
      );

      if (applied?.applied) {
        return;
      }

      // Extra fallback handling
      switch (event) {
        case 'stream': {
          const text =
            typeof data === 'string'
              ? data
              : typeof data?.text ===
                'string'
              ? data.text
              : '';
          if (!text) return;
          appendStream(text);
          break;
        }
        case 'navigate': {
          const ch: ChapterKey | undefined =
            typeof data?.chapter ===
            'string'
              ? data.chapter
              : undefined;
          if (ch && goToChapter)
            goToChapter(ch);
          break;
        }
        case 'error': {
          const msg =
            data?.message ||
            'Er ging iets mis bij het verwerken van uw vraag.';
          appendStream(`\n⚠️ ${msg}`);
          stopStreaming();
          break;
        }
        case 'done': {
          stopStreaming();
          break;
        }
        default:
          break;
      }
    },
    [
      appendStream,
      goToChapter,
      patchChapterAnswer,
      patchTriage,
      stopStreaming,
    ]
  );

  // Let op: accepteert optionele tekst, zodat ChatInput
  // `onSend(text)` kan aanroepen.
  const sendMessage = useCallback(
    async (rawText?: string) => {
      const wizardState =
        snapshotWizardState();

      const q = (rawText ?? '')
        .trim();
      if (!q || loading) return;

      // user message toevoegen
      const userId =
        crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: userId,
          role: 'user',
          text: q,
        },
      ]);
      setLoading(true);

      // vorige stream afbreken
      if (abortRef.current)
        abortRef.current.abort();
      const ac =
        new AbortController();
      abortRef.current = ac;

      const clientFastIntent =
        detectFastIntent(q) ||
        undefined;

      // nieuwe assistant bubble
      startAssistantMessage();

      let res: Response;
      try {
        res = await fetch(
          '/api/chat',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Accept:
                'text/event-stream',
            },
            body: JSON.stringify({
              query: q,
              wizardState,
              mode: 'PREVIEW',
              clientFastIntent,
            }),
            signal: ac.signal,
          }
        );
      } catch (err: any) {
        appendStream(
          `⚠️ Ik kon de server niet bereiken (${err?.message || 'onbekende fout'}).`
        );
        stopStreaming();
        return;
      }

      if (!res.ok || !res.body) {
        appendStream(
          `⚠️ Serverfout (${res.status}): ${res.statusText || 'onbekend'}.`
        );
        stopStreaming();
        return;
      }

      const reader =
        res.body.getReader();
      const decoder =
        new TextDecoder('utf-8');
      let buffer = '';

      try {
        // SSE: "event: x\ndata: {...}\n\n"
        while (true) {
          const {
            value,
            done,
          } = await reader.read();
          if (done) break;
          buffer +=
            decoder.decode(
              value,
              { stream: true }
            );

          let idx: number;
          while (
            (idx =
              buffer.indexOf(
                '\n\n'
              )) !== -1
          ) {
            const rawEvent =
              buffer
                .slice(0, idx)
                .trim();
            buffer =
              buffer.slice(
                idx + 2
              );

            if (!rawEvent)
              continue;

            let eventName: ChatSSEEventName | null =
              null;
            let dataStr = '';

            for (const line of rawEvent.split(
              '\n'
            )) {
              if (
                line.startsWith(
                  'event:'
                )
              ) {
                eventName =
                  line
                    .slice(6)
                    .trim() as ChatSSEEventName;
              } else if (
                line.startsWith(
                  'data:'
                )
              ) {
                dataStr +=
                  line
                    .slice(5)
                    .trim();
              }
            }

            if (!eventName)
              continue;
            handleSSEChunk(
              eventName,
              dataStr
            );
          }
        }
      } catch (err: any) {
        if (ac.signal.aborted) {
          appendStream(
            '\n(⚠️ Chat onderbroken)'
          );
        } else {
          appendStream(
            `\n⚠️ Fout tijdens lezen van het antwoord: ${
              err?.message ||
              'onbekend'
            }`
          );
        }
      } finally {
        stopStreaming();
      }
    },
    [
      appendStream,
      handleSSEChunk,
      loading,
      startAssistantMessage,
      stopStreaming,
    ]
  );

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      stopStreaming();
    }
  }, [stopStreaming]);

  return (
    <>
      <div className="flex flex-col h-full border rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Brikx Assistent
            </div>
            <div className="text-sm text-slate-700">
              Context-aware chat gekoppeld aan uw PvE-wizard
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowHandoff(true)}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-300 hover:bg-slate-100"
            >
              Menselijke architect
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              msg={m}
            />
          ))}
          {loading && (
            <div className="text-xs text-slate-400 mt-1">
              Jules is aan het typen…
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2">
          <ChatInput
            onSend={(text) =>
              sendMessage(text)
            }
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Slimme koppeling: antwoorden kunnen direct uw
            hoofdstukken invullen of u naar het juiste
            onderdeel sturen.
          </p>
          {loading && (
            <button
              type="button"
              onClick={handleAbort}
              className="mt-1 px-2 py-1 text-[10px] border rounded"
            >
              Stop antwoord
            </button>
          )}
        </div>
      </div>

      <HumanHandoffModal
        isOpen={showHandoff}
        onClose={() => setShowHandoff(false)}
      />
    </>
  );
}
