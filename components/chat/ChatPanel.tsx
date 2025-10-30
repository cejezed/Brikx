'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { ChapterKey } from '@/types/wizard';
import HumanHandoffModal from '@/app/wizard/components/HumanHandoffModal';

// -------- mini utils/icons --------
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ');
}
const Icon = {
  Bot: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>
    </svg>
  ),
  User: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  AlertTriangle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Loader: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25"/>
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
};

// -------- types --------
type Choice = { label: string; value: string };
type Suggestion = { label: string; value: string };
type MessageKind = 'assistant' | 'user' | 'system' | 'card';
type Message = {
  id: string;
  kind: MessageKind;
  text?: string;
  fieldId?: string;
  info?: string;
  loading?: boolean;
  choices?: Choice[];
  suggestions?: Suggestion[];
  cardVariant?: 'tip' | 'warning' | 'success';
};

// -------- bubbles --------
function SuggestionChips({ suggestions, onPick }: { suggestions: Suggestion[]; onPick: (s: Suggestion) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s.value}
          onClick={() => onPick(s)}
          className="rounded-full bg-[#0d3d4d] text-white px-3 py-1.5 text-xs hover:opacity-90 transition"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ChoiceButtons({ choices, onSelect }: { choices: Choice[]; onSelect: (c: Choice) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {choices.map((c) => (
        <button
          key={c.value}
          onClick={() => onSelect(c)}
          className="rounded-full border border-[#0d3d4d]/20 bg-white px-3 py-1.5 text-sm hover:border-[#4db8ba] hover:bg-[#e6f4f5] transition"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function Bubble({
  kind, children, fieldActive,
}: {
  kind: MessageKind; children?: React.ReactNode; fieldActive?: boolean;
}) {
  const isAssistant = kind === 'assistant' || kind === 'card';
  return (
    <div className={cx('w-full flex gap-2 md:gap-3', isAssistant ? 'justify-start' : 'justify-end')} aria-live="polite">
      {isAssistant && (
        <div className={cx('h-8 w-8 shrink-0 mt-1 grid place-items-center rounded-full text-white', fieldActive ? 'bg-[#4db8ba]' : 'bg-[#0d3d4d]')} aria-hidden>
          <Icon.Bot style={{ width: 18, height: 18 }} />
        </div>
      )}
      <div
        className={cx(
          'max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
          fieldActive && 'ring-2 ring-[#4db8ba]/40',
          kind === 'assistant' && 'bg-white text-gray-900',
          kind === 'card' && 'bg-amber-50 text-amber-900',
          kind === 'user' && 'bg-[#0d3d4d] text-white',
          kind === 'system' && 'bg-gray-100 text-gray-700'
        )}
      >
        <div className="text-[15px] leading-relaxed">{children}</div>
      </div>
      {!isAssistant && (
        <div className="h-8 w-8 shrink-0 mt-1 grid place-items-center rounded-full bg-[#4db8ba] text-white" aria-hidden>
          <Icon.User style={{ width: 18, height: 18 }} />
        </div>
      )}
    </div>
  );
}

// -------- simpele intents (optioneel) --------
function detectIntent(text: string, addMessage: (m: Message) => void): boolean {
  const lower = text.toLowerCase().trim();

  const navMatch = lower.match(/(ga naar|open|toon|spring naar)\s+(budget|wensen|ruimtes|basis|techniek|duurzaamheid|risico|preview)/i);
  if (navMatch) {
    const chapter = navMatch[2].toLowerCase() as ChapterKey;
    useUiStore.setState({ currentChapter: chapter });
    addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: `✅ Oké, ik ga naar '${chapter}'.` });
    return true;
  }
  return false;
}

// -------- component --------
export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm1',
      kind: 'assistant',
      text: 'Welkom! Vertel uw budget, gewenste ruimtes of wensen — ik vul de wizard en navigeer mee.',
    },
    { id: 'm2', kind: 'card', text: 'Tip: korte, concrete antwoorden werken het beste. U kunt later verfijnen.', cardVariant: 'tip' },
  ]);

  const [handoffOpen, setHandoffOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const addMessage = (m: Message) => setMessages((prev) => [...prev, m]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const currentFieldId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.kind === 'assistant' && m.fieldId);
    return last?.fieldId;
  }, [messages]);

  async function callChat(query: string) {
    if (detectIntent(query, addMessage)) return;

    // Optionele nudge-gate (kan weg als je super-simpel wilt)
    const state = useWizardState.getState();
    const basis = state.chapterAnswers?.basis ?? {};
    const essentialsMissing = !basis?.projectNaam || !basis?.locatie;
    if (essentialsMissing) {
      const nextField = !basis?.projectNaam ? 'projectNaam' : 'locatie';
      const nextKey = `basis:${nextField}`;
      addMessage({
        id: crypto.randomUUID(),
        kind: 'assistant',
        text: `Mag ik eerst de **${nextField}** noteren? Dan kan ik gerichter helpen.`,
      });
      useUiStore.getState().setFocusedField(nextKey);
      useUiStore.setState({ currentChapter: 'basis' });
      return;
    }

    // Demo-respons
    addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: '👍 Begrepen. (Demo: backend-call hier)' });
  }

  function onChoice(_msg: Message, choice: Choice) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: 'user', text: choice.label }]);
    void callChat(choice.value || choice.label);
  }
  function onSuggestion(_msg: Message, s: Suggestion) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: 'user', text: s.label }]);
    void callChat(s.value || s.label);
  }

  return (
    <>
      <div className="flex h-[70dvh] flex-col bg-[#f3fafb] rounded-xl p-3 md:p-4 border border-[#0d3d4d]/10 shadow-sm">
        {/* HEADER met groene gradient (zoals modal) */}
        <div className="rounded-lg px-4 py-3 shadow-sm text-white bg-gradient-to-r from-[#0d3d4d] to-[#4db8ba]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full grid place-items-center bg-white/15">
              <Icon.Bot style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div className="text-sm font-semibold">Chat met Jules, uw assistent</div>
              <div className="text-xs text-white/80">Eén stap tegelijk · helder en menselijk</div>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div
          ref={listRef}
          className="mt-3 flex-1 overflow-y-auto rounded-lg bg-white border border-[#0d3d4d]/10 p-3 md:p-4 space-y-3"
        >
          {messages.map((m) => {
            const fieldActive = Boolean(m.fieldId && m.fieldId === currentFieldId);

            if (m.kind === 'card') {
              return (
                <Bubble key={m.id} kind="card" fieldActive={fieldActive}>
                  <div className="flex items-start gap-2">
                    <Icon.AlertTriangle className="mt-0.5" style={{ width: 16, height: 16 }} />
                    <div>{m.text}</div>
                  </div>
                </Bubble>
              );
            }

            return (
              <Bubble key={m.id} kind={m.kind} fieldActive={fieldActive}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {!!m.choices?.length && <ChoiceButtons choices={m.choices} onSelect={(c) => onChoice(m, c)} />}
                {!!m.suggestions?.length && <SuggestionChips suggestions={m.suggestions} onPick={(s) => onSuggestion(m, s)} />}
                {m.loading && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500">
                    <span className="inline-block animate-spin"><Icon.Loader style={{ width: 14, height: 14 }} /></span>
                    Verwerken…
                  </div>
                )}
              </Bubble>
            );
          })}
        </div>

        {/* VASTE CTA-BALK (altijd zichtbaar) */}
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm">
            💡 Kom je er niet uit? Klik hieronder om direct met de architect te schakelen.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHandoffOpen(true)}
              className="rounded-lg bg-[#0d3d4d] text-white text-sm px-3 py-1.5 hover:opacity-90"
            >
              Praat met architect
            </button>
            <a href="/contact?source=chat-cta" className="text-sm underline">
              Of ga naar contact
            </a>
          </div>
        </div>

        {/* INPUT */}
        <div className="mt-3">
          <ChatInput
            onSend={(text) => {
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: 'user', text }]);
              void callChat(text);
            }}
          />
        </div>
      </div>

      {/* MODAL */}
      <HumanHandoffModal isOpen={handoffOpen} onClose={() => setHandoffOpen(false)} />
    </>
  );
}

function ChatInput({ onSend }: { onSend: (t: string) => void }) {
  const [v, setV] = useState('');
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = v.trim();
        if (!t) return;
        onSend(t);
        setV('');
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Typ uw vraag of opdracht…"
        className="flex-1 rounded-xl border border-[#0d3d4d]/20 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4db8ba]/40"
      />
      <button type="submit" className="rounded-xl bg-[#0d3d4d] text-white px-4 py-2 hover:opacity-90">
        Stuur
      </button>
    </form>
  );
}
