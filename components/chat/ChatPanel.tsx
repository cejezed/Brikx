'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import useWizardState, { type ChapterKey } from '@/lib/stores/useWizardState';

type Msg = { id: string; role: 'user'|'assistant'; text: string };

type ChatSSEEventName = 'metadata'|'patch'|'navigate'|'stream'|'error'|'done';
type PatchEvent = import('@/lib/stores/useWizardState').PatchEvent;

function cx(...p: Array<string|false|undefined>) { return p.filter(Boolean).join(' '); }

export default function ChatPanel() {
  const { chapterAnswers, triage, stateVersion, applyServerPatch, goToChapter } = useWizardState();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController|null>(null);

  const wsForApi = useMemo(() => ({ chapterAnswers, triage, stateVersion }), [chapterAnswers, triage, stateVersion]);

  const send = useCallback(async () => {
    if (!value.trim() || loading) return;
    const q = value.trim();
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: q }]);
    setValue('');
    setLoading(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ query: q, wizardState: wsForApi, mode: 'PREVIEW' }),
      signal: ac.signal,
    }).catch((e) => ({ ok: false, statusText: String(e) } as any));

    if (!res || !('ok' in res) || !res.ok || !res.body) {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: `⚠️ Serverfout: ${(res as any)?.statusText ?? 'geen body'}` }]);
      setLoading(false);
      return;
    }

    const dec = new TextDecoder();
    const reader = res.body.getReader();
    let buf = '';
    const assistId = crypto.randomUUID();
    setMsgs((m) => [...m, { id: assistId, role: 'assistant', text: '' }]);

    const append = (t: string) => setMsgs((m) => m.map((x) => x.id === assistId ? { ...x, text: x.text + t } : x));

    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;
      buf += dec.decode(chunk, { stream: true });

      let idx: number;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, idx).trimEnd();
        buf = buf.slice(idx + 2);

        let ev: ChatSSEEventName = 'stream';
        let data: any = '';
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) ev = line.slice(6).trim() as ChatSSEEventName;
          else if (line.startsWith('data:')) data = line.slice(5).trim();
        }
        try { data = data ? JSON.parse(data) : data; } catch {}

        if (ev === 'patch') {
          try { applyServerPatch(data as PatchEvent); } catch (e) { console.warn('patch error', e, data); }
        } else if (ev === 'navigate') {
          const ch = String((data?.chapter ?? '')).trim() as ChapterKey;
          // één bron van waarheid
          goToChapter(ch);
        } else if (ev === 'stream') {
          append(typeof data === 'string' ? data : (data?.text ?? ''));
        } else if (ev === 'error') {
          append('\n⚠️ Er ging iets mis.');
        } else if (ev === 'done') {
          // nop
        }
      }
    }

    setLoading(false);
  }, [value, loading, wsForApi, applyServerPatch, goToChapter]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border bg-white">
      {/* Header */}
      <div className="rounded-t-2xl px-4 py-3 text-white flex items-center gap-2"
           style={{ background: 'linear-gradient(90deg, #0d3d4d 0%, #4db8ba 100%)' }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
        <div className="font-semibold">Chat met Jules</div>
      </div>

      {/* Messages – DIT element heeft de scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-gray-500 text-sm">
            Probeer: <em>200m2</em>, <em>projectnaam Villa Dijk</em>, <em>woonkamer 30 m2</em>, <em>3 slaapkamers</em>.
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={cx(
            'max-w-[85%] whitespace-pre-wrap leading-relaxed',
            m.role === 'user' ? 'ml-auto rounded-xl bg-[#e7f3f4] px-3 py-2' : 'mr-auto rounded-xl bg-gray-50 px-3 py-2'
          )}>{m.text}</div>
        ))}
      </div>

      {/* Sticky input – moet onderaan dit PANEEL staan (niet in een parent met overflow-hidden) */}
      <div className="sticky bottom-0 z-[5] border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#4db8ba]"
            placeholder="Typ je bericht…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !value.trim()}
            className={cx('inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white', loading ? 'bg-gray-400' : 'bg-[#0d3d4d] hover:bg-[#0b3341]')}
            title="Versturen"
          >
            Verstuur
          </button>
        </div>
      </div>
    </div>
  );
}
