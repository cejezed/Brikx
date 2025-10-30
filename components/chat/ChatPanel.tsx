'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import applyChatResponse, { type ChatApiResponse } from '@/lib/chat/applyChatResponse';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { ChapterKey } from '@/types/wizard';
import HumanHandoffModal from '@/app/wizard/components/HumanHandoffModal';
import { logEvent } from '@/lib/logging/logEvent';

// ===== Safe logging: logging mag nooit de UI/flow breken =====
function safeLog(event: string, payload: any = {}) {
  try {
    void logEvent(event, payload);
  } catch {
    // stil falen
  }
}

// === Optioneel: vaste CTA onderin altijd tonen? ===
const ALWAYS_VISIBLE_HANDOFF_CTA = false;

// -------- mini utils/icons --------
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ');
}
const Icon = {
  Bot: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  User: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  AlertTriangle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Loader: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" fill="none" />
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
  variant?: 'handoff-cta';
};

// -------- helpers: parse --------
function toNumberFromBudget(text: string): number | null {
  // vang: "€300.000", "300000", "250k", "1.2m", "€ 275 000"
  const euroMatch = text.match(/€\s*([\d\.\s,]+)/i);
  if (euroMatch) {
    const raw = euroMatch[1].replace(/[^\d]/g, '');
    const n = Number(raw);
    return isFinite(n) && n > 0 ? n : null;
  }
  // ook losse getallen met k/m
  const simple = text.match(/(\d+(\.\d+)?)(\s*[kKmM])?/);
  if (!simple) return null;
  const num = parseFloat(simple[1]);
  const suffix = (simple[3] || '').toLowerCase().trim();
  if (!isFinite(num) || num <= 0) return null;
  if (suffix === 'k') return Math.round(num * 1_000);
  if (suffix === 'm') return Math.round(num * 1_000_000);
  // “250 000” zonder euro/komma’s:
  const spaced = text.replace(/[^\d]/g, '');
  if (spaced.length >= 5 && Number(spaced) > 0) return Number(spaced);
  return Math.round(num);
}

const ROOM_ALIASES: Record<string, string> = {
  woonkamer: 'woonkamer',
  living: 'woonkamer',
  keuken: 'keuken',
  slaapkamer: 'slaapkamer',
  master: 'slaapkamer',
  badkamer: 'badkamer',
  wc: 'toilet',
  toilet: 'toilet',
  werkkamer: 'werkkamer',
  kantoor: 'werkkamer',
  berging: 'berging',
  bijkeuken: 'bijkeuken',
  logeerkamer: 'logeerkamer',
  kinderkamer: 'kinderkamer',
  hobbykamer: 'hobbykamer',
};

// -------- intents (Slimme NLU – client-side) --------
function detectIntent(text: string, addMessage: (m: Message) => void): boolean {
  const lower = text.toLowerCase().trim();
  const ui = useUiStore.getState();
  const setUiState = useUiStore.setState;
  const setWizard = useWizardState.setState;

  // 1) Navigatie (“ga naar …”)
  const navMatch = lower.match(
    /(ga naar|open|toon|spring naar)\s+(budget|wensen|ruimtes|basis|techniek|duurzaamheid|risico|preview)/i
  );
  if (navMatch) {
    const chapter = navMatch[2].toLowerCase() as ChapterKey;
    setUiState({ currentChapter: chapter });
    addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: `✅ Oké, ik ga naar '${chapter}'.` });
    safeLog('intent_detected', { intent: 'navigate', chapter, raw: text });
    return true;
  }

  // 2) Basisdata – projectnaam / locatie
  const basisNameMatch =
    lower.match(/^(project\s*naam|projectnaam)\s*[:\-]\s*(.+)$/i) ||
    lower.match(/^mijn project (heet|is)\s+(.+)$/i);
  if (basisNameMatch) {
    const val = (basisNameMatch[2] || basisNameMatch[3] || '').trim();
    if (val) {
      setWizard((prev: any) => ({
        ...prev,
        chapterAnswers: {
          ...prev.chapterAnswers,
          basis: { ...(prev.chapterAnswers?.basis ?? {}), projectNaam: val },
        },
      }));
      setUiState({ currentChapter: 'basis' });
      ui.setFocusedField?.('basis:projectNaam');
      addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: `📌 Projectnaam ingesteld op: **${val}**.` });
      safeLog('intent_detected', { intent: 'basis_projectnaam', value: val, raw: text });
      return true;
    }
  }

  const basisLocMatch =
    lower.match(/^locatie\s*[:\-]\s*(.+)$/i) ||
    lower.match(/^(we wonen|adres is|lokatie)\s+(.+)$/i);
  if (basisLocMatch) {
    const val = (basisLocMatch[1] || basisLocMatch[2] || '').replace(/^is\s+/, '').trim();
    if (val) {
      setWizard((prev: any) => ({
        ...prev,
        chapterAnswers: {
          ...prev.chapterAnswers,
          basis: { ...(prev.chapterAnswers?.basis ?? {}), locatie: val },
        },
      }));
      setUiState({ currentChapter: 'basis' });
      ui.setFocusedField?.('basis:locatie');
      addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: `📍 Locatie ingesteld op: **${val}**.` });
      safeLog('intent_detected', { intent: 'basis_locatie', value: val, raw: text });
      return true;
    }
  }

  // 3) Budget – accepteer ook losse bedragen als de input *alleen* een bedrag lijkt
  const looksLikeAmountOnly = /^[€\s]*[\d\.\,\s]+[kKmM]?\s*$/.test(lower);
  if (/\bbudget\b/.test(lower) || looksLikeAmountOnly) {
    const n = toNumberFromBudget(lower);
    if (n) {
      setWizard((prev: any) => ({
        ...prev,
        chapterAnswers: {
          ...prev.chapterAnswers,
          budget: { ...(prev.chapterAnswers?.budget ?? {}), bedrag: n },
        },
      }));
      setUiState({ currentChapter: 'budget' });
      ui.setFocusedField?.('budget:bedrag');
      addMessage({
        id: crypto.randomUUID(),
        kind: 'assistant',
        text: `💶 Budget genoteerd: **€${n.toLocaleString('nl-NL')}**. U kunt dit later altijd aanpassen.`,
      });
      safeLog('intent_detected', { intent: 'budget_set', value: n, raw: text, mode: looksLikeAmountOnly ? 'implicit' : 'explicit' });
      return true;
    }
  }

  // 4) Ruimtes – “ik wil een woonkamer”, “voeg keuken toe”, “slaapkamer erbij”
  const roomMatch =
    lower.match(/(voeg|zet|maak)\s+([a-zà-ÿ\- ]+)\s+(toe|erbij)/i) ||
    lower.match(/ik wil (een|nog een|nog)\s+([a-zà-ÿ\- ]+)/i) ||
    lower.match(/^([a-zà-ÿ\- ]+)\s+(toevoegen|erbij)$/i);
  if (roomMatch) {
    const raw = (roomMatch[2] || roomMatch[1] || '').trim();
    const lastWord = raw.split(/\s+/).pop() || raw;
    const canonical = ROOM_ALIASES[lastWord] || lastWord;
    if (/^[a-zà-ÿ\-]+$/i.test(canonical)) {
      const newRoom = { id: crypto.randomUUID(), type: canonical, tag: 'public', details: [] as string[] };
      setWizard((prev: any) => {
        const list = prev.chapterAnswers?.ruimtes ?? [];
        return {
          ...prev,
          chapterAnswers: {
            ...prev.chapterAnswers,
            ruimtes: [...list, newRoom],
          },
        };
      });
      setUiState({ currentChapter: 'ruimtes' });
      (ui.setFocusedField?.('ruimtes:namen') ?? ui.setFocusedField?.('ruimtes:list'));
      addMessage({
        id: crypto.randomUUID(),
        kind: 'assistant',
        text: `🏷️ **${canonical}** is toegevoegd bij Ruimtes. Wilt u een indicatie van m² of speciale wensen noteren?`,
        suggestions: [
          { label: '30 m²', value: 'oppervlakte 30 m2' },
          { label: 'Veel daglicht', value: 'wens: veel daglicht' },
          { label: 'Open keuken', value: 'wens: open keuken' },
        ],
      });
      safeLog('intent_detected', { intent: 'room_add', roomType: canonical, raw: text });
      return true;
    }
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
  const [handoffPending, setHandoffPending] = useState(ALWAYS_VISIBLE_HANDOFF_CTA);
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
    // 1) Smart Intents (client-side)
    if (detectIntent(query, addMessage)) {
      safeLog('chat_flow', { stage: 'handled_by_client_intent', query });
      return;
    }

    // 2) Nudge Gate (essentiële velden eerst)
    const state = useWizardState.getState();
    const basis = state.chapterAnswers?.basis ?? {};
    const essentialsMissing = !basis.projectNaam || !basis.locatie;
    if (essentialsMissing) {
      const nextField = !basis.projectNaam ? 'projectNaam' : 'locatie';
      const nextKey = `basis:${nextField}`;
      addMessage({
        id: crypto.randomUUID(),
        kind: 'assistant',
        text: `Mag ik eerst de **${nextField}** noteren? Dan kan ik gerichter helpen.`,
      });
      useUiStore.getState().setFocusedField(nextKey);
      useUiStore.setState({ currentChapter: 'basis' });
      safeLog('nudge_gate_block', { missingField: nextField, query });
      return;
    }

    // 3) Backend-call (fallback)
    safeLog('chat_backend_call', { query });
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: query, state }),
    });

    const data = (await res.json().catch(() => ({}))) as Partial<ChatApiResponse>;

    if (data?.reply) {
      addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: String(data.reply) });
    }

    if (Array.isArray(data?.actions)) {
      for (const action of data.actions) {
        if (action?.type === 'handoff') {
          addMessage({
            id: crypto.randomUUID(),
            kind: 'assistant',
            text: `Dit onderwerp vraagt vaak om maatwerk${(action as any).reason ? ` (${(action as any).reason})` : ''}.`,
          });
          addMessage({ id: crypto.randomUUID(), kind: 'card', variant: 'handoff-cta' });
          setHandoffPending(true);
          safeLog('handoff_suggested', { source: 'backend_action', reason: (action as any)?.reason || null });
        }
      }
      applyChatResponse({ reply: String(data?.reply ?? ''), actions: data.actions });
    }
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

            // CTA kaart voor handoff
            if (m.kind === 'card' && m.variant === 'handoff-cta') {
              return (
                <Bubble key={m.id} kind="card" fieldActive={fieldActive}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="text-sm">💡 Menselijke hulp nodig?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setHandoffOpen(true);
                          safeLog('handoff_open_clicked', { source: 'inline_card' });
                        }}
                        className="rounded-lg bg-[#0d3d4d] text-white text-sm px-3 py-1.5 hover:opacity-90"
                      >
                        Praat met architect
                      </button>
                      <a
                        href="/contact?source=handoff"
                        className="text-sm underline"
                        onClick={() => safeLog('handoff_contact_link', { source: 'inline_card' })}
                      >
                        Of ga naar contact
                      </a>
                    </div>
                  </div>
                </Bubble>
              );
            }

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

        {/* VASTE CTA-BALK */}
        {(ALWAYS_VISIBLE_HANDOFF_CTA || handoffPending) && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm">
              💡 Menselijke hulp beschikbaar. Klik om direct met de architect te schakelen.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setHandoffOpen(true);
                  safeLog('handoff_open_clicked', { source: 'sticky_bar' });
                }}
                className="rounded-lg bg-[#0d3d4d] text-white text-sm px-3 py-1.5 hover:opacity-90"
              >
                Praat met architect
              </button>
              <a
                href="/contact?source=chat-cta"
                className="text-sm underline"
                onClick={() => safeLog('handoff_contact_link', { source: 'sticky_bar' })}
              >
                Of ga naar contact
              </a>
              {!ALWAYS_VISIBLE_HANDOFF_CTA && (
                <button
                  type="button"
                  onClick={() => {
                    setHandoffPending(false);
                    safeLog('handoff_sticky_bar_dismiss', {});
                  }}
                  className="text-xs opacity-70 hover:opacity-100"
                  title="Verberg"
                >
                  Sluiten
                </button>
              )}
            </div>
          </div>
        )}

        {/* INPUT + extra handoff-link */}
        <div className="mt-3">
          <ChatInput
            onSend={(text) => {
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: 'user', text }]);
              void callChat(text);
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setHandoffOpen(true);
                safeLog('handoff_open_clicked', { source: 'below_input_link' });
              }}
              className="text-sm underline text-[#0d3d4d] hover:text-[#082a33]"
            >
              Liever direct met een architect spreken?
            </button>
            <span className="text-xs text-gray-500">
              Slimme modus actief · simpele opdrachten worden lokaal verwerkt
            </span>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <HumanHandoffModal
        isOpen={handoffOpen}
        onClose={() => {
          setHandoffOpen(false);
          safeLog('handoff_closed', {});
        }}
      />
    </>
  );
}

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
