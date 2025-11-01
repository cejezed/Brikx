// components/chat/ChatPanel.tsx
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';

// Los, tolerant type voor serverpatches (contract-onafhankelijk)
type PatchEvent =
  | { target?: 'triage' | 'chapterAnswers' | 'ui' | string; payload?: any; stateVersion?: number }
  | { triage?: Record<string, any>; chapterAnswers?: Record<string, any> }
  | Record<string, any>;

type Msg = { id: string; role: 'user'|'assistant'; text: string };
type ChatSSEEventName = 'metadata'|'patch'|'navigate'|'stream'|'error'|'done';

function cx(...p: Array<string|false|undefined>) { return p.filter(Boolean).join(' '); }

export default function ChatPanel() {
  // Lees alleen wat gegarandeerd bestaat uit de store
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const triage = useWizardState((s) => s.triage);
  const stateVersion = useWizardState((s) => (s as any).stateVersion);
  const goToChapter = useWizardState((s: any) => s.goToChapter);
  const patchTriage = useWizardState((s: any) => s.patchTriage);
  const patchChapterAnswer = useWizardState((s: any) => s.patchChapterAnswer);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController|null>(null);

  const wsForApi = useMemo(
    () => ({ chapterAnswers, triage, stateVersion }),
    [chapterAnswers, triage, stateVersion]
  );

  // Flexibele applicator voor serverpatches (geen afhankelijkheid van store-implementatiedetail)
  const applyPatchFlexible = useCallback((data: PatchEvent) => {
    if (!data) return;
    const d: any = data;

    // 1) Expliciet target/payload patroon
    if (d.target === 'triage' && d.payload && patchTriage) {
      patchTriage(d.payload);
      return;
    }
    if (d.target === 'chapterAnswers' && d.payload && typeof d.payload === 'object' && patchChapterAnswer) {
      for (const [ch, delta] of Object.entries(d.payload)) {
        patchChapterAnswer(ch as string, delta);
      }
      return;
    }

    // 2) Breder patroon (root-level keys)
    if (d.triage && patchTriage) {
      patchTriage(d.triage);
    }
    if (d.chapterAnswers && typeof d.chapterAnswers === 'object' && patchChapterAnswer) {
      for (const [ch, delta] of Object.entries(d.chapterAnswers)) {
        patchChapterAnswer(ch as string, delta);
      }
    }
    // 3) Optioneel: andere targets negeren of loggen
    // console.debug('[patch:unhandled]', d);
  }, [patchTriage, patchChapterAnswer]);

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
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: `⚠️ Serverfout: ${(res as any)?.statusText ?? 'geen body'}` },
      ]);
      setLoading(false);
      return;
    }

    const dec = new TextDecoder();
    const reader = res.body.getReader();
    let buf = '';
    const assistId = crypto.randomUUID();
    setMsgs((m) => [...m, { id: assistId, role: 'assistant', text: '' }]);

    const append = (t: string) =>
      setMsgs((m) => m.map((x) => (x.id === assistId ? { ...x, text: x.text + t } : x)));

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
          try { applyPatchFlexible(data as PatchEvent); } catch (e) { console.warn('patch error', e, data); }
        } else if (ev === 'navigate') {
          const ch = String((data?.chapter ?? '')).trim() as ChapterKey;
          goToChapter?.(ch);
        } else if (ev === 'stream') {
          append(typeof data === 'string' ? data : (data?.text ?? ''));
        } else if (ev === 'error') {
          append('\n⚠️ Er ging iets mis.');
        } else if (ev === 'done') {
          // einde
        }
      }
    }

    setLoading(false);
  }, [value, loading, wsForApi, applyPatchFlexible, goToChapter]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border bg-white">
      {/* Header met groene gradient zoals gevraagd */}
      <div
        className="rounded-t-2xl px-4 py-3 text-white flex items-center gap-2"
        style={{ background: 'linear-gradient(90deg, #0d3d4d 0%, #4db8ba 100%)' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="font-semibold">Chat met Jules</div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-gray-500 text-sm">
            Tip: typ bijv. <em>“budget 250k”</em>, <em>“3 slaapkamers”</em> of <em>“woonkamer 30 m²”</em> — de wizard wordt automatisch gevuld.
          </div>
        )}
        {msgs.map((m) => (
          <div
            key={m.id}
            className={cx(
              'max-w-[85%] whitespace-pre-wrap leading-relaxed',
              m.role === 'user'
                ? 'ml-auto rounded-xl bg-[#e7f3f4] px-3 py-2'
                : 'mr-auto rounded-xl bg-gray-50 px-3 py-2'
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Sticky input */}
      <div className="sticky bottom-0 z-[5] border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#4db8ba]"
            placeholder="Typ je bericht…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !value.trim()}
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white',
              loading ? 'bg-gray-400' : 'bg-[#0d3d4d] hover:bg-[#0b3341]'
            )}
            title="Versturen"
          >
            Verstuur
          </button>
        </div>
      </div>
    </div>
  );
}
