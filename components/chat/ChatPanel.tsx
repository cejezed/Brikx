'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useChatStore } from '@/lib/stores/useChatStore';
import type { ChatRequest, ChatSSEEventName, MetadataEvent, PatchEvent, NavigateEvent } from '@/types/chat';
import HumanHandoffModal from '@/components/chat/HumanHandoffModal';
import { Bot, SendHorizonal, LifeBuoy } from 'lucide-react';

type Props = { compact?: boolean };

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export default function ChatPanel({ compact }: Props) {
  const { stateVersion, chapterAnswers, triage, applyServerPatch, goToChapter } = useWizardState();
  const { messages, pushMessage, appendAssistantChunk, resetAssistantMessage } = useChatStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const wizardStateForApi = useMemo(
    () => ({ stateVersion, chapterAnswers, triage }),
    [stateVersion, chapterAnswers, triage]
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    pushMessage({ id: crypto.randomUUID(), role: 'user', text: query });
    setInput('');
    setLoading(true);

    const body: ChatRequest = { query, wizardState: wizardStateForApi as any, mode: 'PREVIEW' };

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let gotAnyEvent = false;
    const timeout = setTimeout(() => {
      if (!gotAnyEvent) {
        const id = resetAssistantMessage();
        appendAssistantChunk(id, '⚠️ Er komt geen antwoord van de server. Controleer of /api/chat draait.');
      }
    }, 8000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(body),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const id = resetAssistantMessage();
        appendAssistantChunk(id, `⚠️ Fout ${res.status}: ${res.statusText || 'Geen stream body'}`);
        setLoading(false);
        clearTimeout(timeout);
        return;
      }

      const assistantMsgId = resetAssistantMessage();

      await readSSE(res.body, (evt, data) => {
        gotAnyEvent = true;
        switch (evt) {
          case 'metadata': {
            const meta = data as MetadataEvent;
            if (meta.policy === 'ASK_CLARIFY' && meta.nudge) {
              appendAssistantChunk(assistantMsgId, meta.nudge + '\n\n');
            }
            break;
          }
          case 'patch': {
            try {
              applyServerPatch(data as PatchEvent);
            } catch (e) {
              console.error('[ChatPanel] applyServerPatch error', e, data);
            }
            break;
          }
          case 'navigate': {
            const nav = data as NavigateEvent;
            // @ts-expect-error union past op ChapterKey
            goToChapter(nav.chapter);
            break;
          }
          case 'stream': {
            const t = (data?.text ?? '') as string;
            if (t) appendAssistantChunk(assistantMsgId, t);
            break;
          }
          case 'error': {
            appendAssistantChunk(assistantMsgId, '\n\n⚠️ Er ging iets mis. Probeer nog eens.');
            break;
          }
          case 'done': {
            break;
          }
          default:
            break;
        }
      });
    } catch (e: any) {
      console.error('[ChatPanel] stream error', e);
      const id = resetAssistantMessage();
      appendAssistantChunk(id, `⚠️ Netwerkfout: ${String(e?.message ?? e)}`);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [
    input,
    loading,
    wizardStateForApi,
    pushMessage,
    resetAssistantMessage,
    appendAssistantChunk,
    applyServerPatch,
    goToChapter,
  ]);

  return (
    <div className={cx(
      'flex h-full max-h-full min-h-0 flex-col rounded-2xl border bg-white',
      compact && 'text-sm'
    )}>
      {/* Header met gradient */}
      <div className="rounded-t-2xl px-4 py-3 text-white flex items-center gap-2"
           style={{ background: 'linear-gradient(90deg, #0d3d4d 0%, #4db8ba 100%)' }}>
        <Bot className="w-5 h-5" />
        <div className="font-semibold">Chat met Jules</div>
        <div className="ml-auto">
          <button
            onClick={() => setHandoffOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
            title="Menselijke hulp"
          >
            <LifeBuoy className="w-4 h-4" />
            Hulp
          </button>
        </div>
      </div>

      {/* Messages: eigen scroll; laat ruimte vrij voor sticky input */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">
            Voorbeelden: <em>“projectnaam Villa Dijk”</em>, <em>“locatie Tilburg”</em>, <em>“bewoners 3”</em>, <em>“budget 250k”</em>, <em>“3 slaapkamers”</em>, <em>“woonkamer 30 m2”</em>, <em>“ga naar budget”</em>, <em>“daglicht in de keuken”</em>.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cx(
              'max-w-[85%] leading-relaxed whitespace-pre-wrap',
              m.role === 'user' ? 'ml-auto rounded-xl bg-[#e7f3f4] px-3 py-2' : 'mr-auto rounded-xl bg-gray-50 px-3 py-2'
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Sticky input: verdwijnt nooit uit beeld */}
      <div className="sticky bottom-0 z-[5] border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#4db8ba]"
            placeholder="Typ je bericht…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cx('inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white', loading ? 'bg-gray-400' : 'bg-[#0d3d4d] hover:bg-[#0b3341]')}
            title="Versturen"
          >
            <SendHorizonal className="w-4 h-4" />
            Verstuur
          </button>
        </div>
      </div>

      {/* Kleine debugbar (mag weg als het werkt) */}
      <div className="border-t bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <div><strong>basis.projectNaam:</strong> {String((chapterAnswers as any)?.basis?.projectNaam ?? '—')}</div>
        <div className="grid grid-cols-2 gap-2">
          <div><strong>locatie:</strong> {String((chapterAnswers as any)?.basis?.locatie ?? '—')}</div>
          <div><strong>bewoners:</strong> {String((chapterAnswers as any)?.basis?.bewonersAantal ?? '—')}</div>
        </div>
        <div><strong>oppervlakteM2:</strong> {String((chapterAnswers as any)?.basis?.oppervlakteM2 ?? '—')}</div>
        <div><strong>ruimtes.count:</strong> {Array.isArray((chapterAnswers as any)?.ruimtes) ? (chapterAnswers as any).ruimtes.length : 0}</div>
      </div>

      <HumanHandoffModal open={handoffOpen} onClose={() => setHandoffOpen(false)} />
    </div>
  );
}

async function readSSE(
  body: ReadableStream<Uint8Array>,
  onEvent: (evt: ChatSSEEventName, data: any) => void
) {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx).trimEnd();
      buffer = buffer.slice(idx + 2);

      let event: ChatSSEEventName = 'stream';
      let data: any = {};
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim() as ChatSSEEventName;
        } else if (line.startsWith('data:')) {
          const payload = line.slice(5).trim();
          if (payload) {
            try { data = JSON.parse(payload); } catch { data = { text: payload }; }
          }
        }
      }
      onEvent(event, data);
    }
  }
}
