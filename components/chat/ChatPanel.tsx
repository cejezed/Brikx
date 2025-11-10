'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import HumanHandoffModal from './HumanHandoffModal';
import detectFastIntent from '@/lib/chat/detectFastIntent';
import type { ChapterKey } from '@/types/chat';

type MsgRole = 'user' | 'assistant';

type Msg = {
  id: string;
  role: MsgRole;
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
    'Hoi! Ik ben Jules, je digitale bouwcoach.\n\n' +
    'Ik help je stap voor stap naar een professioneel Programma van Eisen (PvE).\n' +
    'Vertel in je eigen woorden je budget, ruimtes, wensen en zorgen; ik vul de wizard met je mee en stuur je naar de juiste stap.',
};

function snapshotWizardState() {
  const s = (useWizardState as any).getState?.() ?? {};
  return {
    stateVersion: s.stateVersion ?? 1,
    triage: s.triage ?? {},
    chapterAnswers: s.chapterAnswers ?? {},
    currentChapter: s.currentChapter ?? s.triage?.currentChapter ?? undefined,
    chapterFlow: Array.isArray(s.chapterFlow) ? s.chapterFlow : [],
    focusedField: s.focusedField ?? null,
    showExportModal: !!s.showExportModal,
  };
}

export default function ChatPanel() {
  const goToChapter = useWizardState((s: any) => s.goToChapter);
  const patchTriage = useWizardState((s: any) => s.patchTriage);
  const patchChapterAnswer = useWizardState((s: any) => s.patchChapterAnswer);

  const [messages, setMessages] = useState<Msg[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const appendStream = useCallback((chunk: string) => {
    if (!chunk) return;

    setMessages((prev) => {
      let id = streamingIdRef.current;

      if (!id) {
        id = crypto.randomUUID();
        streamingIdRef.current = id;
        return [...prev, { id, role: 'assistant', text: chunk }];
      }

      return prev.map((m) =>
        m.id === id ? { ...m, text: (m.text || '') + chunk } : m,
      );
    });
  }, []);

  const startAssistantMessage = useCallback(() => {
    const id = crypto.randomUUID();
    streamingIdRef.current = id;
    setMessages((prev) => [...prev, { id, role: 'assistant', text: '' }]);
  }, []);

  const stopStreaming = useCallback(() => {
    streamingIdRef.current = null;
    setLoading(false);
  }, []);

  const handleSSEChunk = useCallback(
    (event: ChatSSEEventName, rawData: string) => {
      let data: any = rawData;

      try {
        if (rawData && (rawData.startsWith('{') || rawData.startsWith('['))) {
          data = JSON.parse(rawData);
        }
      } catch {
        data = rawData;
      }

      switch (event) {
        case 'stream': {
          const text =
            typeof data === 'string'
              ? data
              : typeof data?.text === 'string'
              ? data.text
              : '';
          if (text) appendStream(text);
          break;
        }

        case 'navigate': {
          const ch: ChapterKey | undefined =
            typeof data?.chapter === 'string' ? data.chapter : undefined;
          if (ch && goToChapter) goToChapter(ch);
          break;
        }

        case 'patch': {
          const patch = data as {
            chapter?: string;
            delta?: {
              path?: string;
              operation?: 'add' | 'set' | 'append' | 'remove';
              value?: any;
            };
          };

          if (
            patch &&
            typeof patch.chapter === 'string' &&
            patch.delta &&
            typeof patch.delta.path === 'string'
          ) {
            const chapter = patch.chapter as ChapterKey;
            const field = patch.delta.path;
            const value = patch.delta.value;

            if (patchChapterAnswer) {
              patchChapterAnswer(chapter, { [field]: value });
            }
          }
          break;
        }

        case 'error': {
          const msg =
            (typeof data === 'string' && data) ||
            data?.message ||
            'Er ging iets mis bij het verwerken van je vraag.';
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
    [appendStream, goToChapter, patchChapterAnswer, stopStreaming],
  );

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    const wizardState = snapshotWizardState();

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: q },
    ]);
    setInput('');
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const clientFastIntent = detectFastIntent(q) || undefined;

    startAssistantMessage();

    let res: Response;
    try {
      res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          query: q,
          wizardState,
          mode: 'PREVIEW',
          clientFastIntent,
        }),
        signal: ac.signal,
      });
    } catch (err: any) {
      appendStream(
        `\n⚠️ Er ging iets mis bij het verbinden met de server: ${
          err?.message || 'onbekende fout'
        }`,
      );
      stopStreaming();
      return;
    }

    if (!res.ok || !res.body) {
      appendStream(
        `\n⚠️ Serverfout (${res.status} ${res.statusText || ''}). Controleer /api/chat.`,
      );
      stopStreaming();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!rawEvent) continue;

          let eventName: ChatSSEEventName | null = null;
          let dataStr = '';

          for (const line of rawEvent.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim() as ChatSSEEventName;
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5).trim();
            }
          }

          if (!eventName) continue;
          handleSSEChunk(eventName, dataStr);
        }
      }
    } catch (err: any) {
      if (ac.signal.aborted) {
        appendStream('\n(⚠️ Chat onderbroken)');
      } else {
        appendStream(
          `\n⚠️ Fout tijdens lezen van het antwoord: ${err?.message || 'onbekend'}`,
        );
      }
    } finally {
      stopStreaming();
    }
  }, [
    input,
    loading,
    appendStream,
    handleSSEChunk,
    startAssistantMessage,
    stopStreaming,
  ]);

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      stopStreaming();
    }
  }, [stopStreaming]);

  return (
    <>
      <div className="flex h-full flex-col border rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Brikx Assistent
            </div>
            <div className="text-sm text-slate-700">
              Context-aware chat gekoppeld aan je PvE-wizard
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHandoff(true)}
            className="px-3 py-1.5 text-xs rounded-full border border-slate-300 hover:bg-slate-100"
          >
            Menselijke architect
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
          {messages.map((m) => (
            <ChatMessage key={m.id} msg={m} />
          ))}
          {loading && (
            <div className="text-xs text-slate-400 mt-1">
              Jules is aan het typen…
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t px-3 py-2">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={loading ? handleAbort : undefined}
            disabled={loading}
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Antwoorden kunnen direct je hoofdstukken invullen of je naar de juiste stap sturen.
          </p>
        </div>
      </div>

      <HumanHandoffModal
        isOpen={showHandoff}
        onClose={() => setShowHandoff(false)}
      />
    </>
  );
}