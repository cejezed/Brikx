'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import applyChatResponse, { type ChatApiResponse } from '@/lib/chat/applyChatResponse';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { ChapterKey } from '@/types/wizard';

// Mini utils
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ');
}

// Icons
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
  Info: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  ChevronDown: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronUp: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  AlertTriangle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Loader: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25"/>
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
};

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
  confirmText?: string;
};

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
  kind, children, info, onToggleInfo, infoOpen, fieldActive,
}: {
  kind: MessageKind; children: React.ReactNode; info?: string; onToggleInfo?: () => void; infoOpen?: boolean; fieldActive?: boolean;
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
        {!!info && onToggleInfo && (
          <button type="button" onClick={onToggleInfo} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#0d3d4d] hover:underline">
            <Icon.Info style={{ width: 14, height: 14 }} />
            Waarom deze vraag?
            {infoOpen ? <Icon.ChevronUp style={{ width: 14, height: 14 }} /> : <Icon.ChevronDown style={{ width: 14, height: 14 }} />}
          </button>
        )}
        {infoOpen && info && (
          <div className="mt-2 text-sm rounded-xl bg-[#e6f4f5] text-[#0d3d4d] p-3">{info}</div>
        )}
      </div>
      {!isAssistant && (
        <div className="h-8 w-8 shrink-0 mt-1 grid place-items-center rounded-full bg-[#4db8ba] text-white" aria-hidden>
          <Icon.User style={{ width: 18, height: 18 }} />
        </div>
      )}
    </div>
  );
}

/**
 * 🧠 SMART INTENTS - Client-side NLU
 * Detecteer en verwerk lokaal voordat we /api/chat aanroepen
 */
function detectIntent(text: string, addMessage: (m: Message) => void): boolean {
  const lower = text.toLowerCase().trim();

  // ============================================================
  // INTENT 1: NAVIGATIE (goToChapter)
  // ============================================================
  const navMatch = lower.match(/(ga naar|open|toon|spring naar)\s+(budget|wensen|ruimtes|basis|techniek|duurzaamheid|risico|preview)/i);
  if (navMatch) {
    const chapter = navMatch[2].toLowerCase() as ChapterKey;
    useUiStore.setState({ currentChapter: chapter });
    addMessage({
      id: crypto.randomUUID(),
      kind: 'assistant',
      text: `✅ Oké, ik ga naar '${chapter}'.`,
    });
    return true;
  }

  // ============================================================
  // INTENT 2: PROJECTNAAM / LOCATIE (Basis data)
  // ============================================================
  const nameMatch = lower.match(/(projectnaam|naam|project)[:\s]+(.+?)(?:\.|$)/i);
  if (nameMatch && nameMatch[2].trim().length > 2) {
    const value = nameMatch[2].trim();
    const wizardState = useWizardState.getState();
    
    // Update data state
    wizardState.setChapterAnswer('basis', {
      ...(wizardState.chapterAnswers.basis || {}),
      projectNaam: value,
    });

    // Update UI state (Spotlight-lus)
    useUiStore.setState({ focusedField: 'basis:projectNaam' });

    addMessage({
      id: crypto.randomUUID(),
      kind: 'assistant',
      text: `✅ Projectnaam: '${value}'. Mooi! Waar is dit project?`,
    });
    return true;
  }

  const locMatch = lower.match(/(locatie|plaats|adres)[:\s]+(.+?)(?:\.|$)/i);
  if (locMatch && locMatch[2].trim().length > 2) {
    const value = locMatch[2].trim();
    const wizardState = useWizardState.getState();
    
    wizardState.setChapterAnswer('basis', {
      ...(wizardState.chapterAnswers.basis || {}),
      locatie: value,
    });

    useUiStore.setState({ focusedField: 'basis:locatie' });

    addMessage({
      id: crypto.randomUUID(),
      kind: 'assistant',
      text: `✅ Locatie: '${value}'. Prima!`,
    });
    return true;
  }

  // ============================================================
  // INTENT 3: BUDGET
  // ============================================================
  const budgetMatch = lower.match(/(?:budget|€|euro)[\s:]*(\d+[\d\.]*(?:k)?)/i);
  if (budgetMatch && (lower.includes('budget') || lower.includes('euro') || lower.includes('€'))) {
    let bedrag = parseFloat(budgetMatch[1].replace('k', '000').replace('.', ''));
    
    if (bedrag < 1000) bedrag *= 1000; // "100" → 100.000
    
    const wizardState = useWizardState.getState();
    wizardState.setChapterAnswer('budget', {
      ...(wizardState.chapterAnswers.budget || {}),
      bedrag,
    });

    useUiStore.setState({ focusedField: 'budget:bedrag' });

    addMessage({
      id: crypto.randomUUID(),
      kind: 'assistant',
      text: `✅ Budget ingesteld op €${bedrag.toLocaleString('nl-NL')}. Goed om te weten!`,
    });
    return true;
  }

  // ============================================================
  // INTENT 4: RUIMTES TOEVOEGEN
  // ============================================================
  const roomMatch = lower.match(/(?:voeg toe|ik wil|wil graag|voeg|zet)\s*(\d*)\s*(woonkamer|keuken|slaapkamer|badkamer|kantoor|garage|tuin|veranda)/i);
  if (roomMatch) {
    const count = roomMatch[1] ? parseInt(roomMatch[1], 10) : 1;
    const roomType = roomMatch[2];

    const wizardState = useWizardState.getState();
    const currentRooms = wizardState.chapterAnswers.ruimtes || [];

    // Add rooms
    for (let i = 0; i < count; i++) {
      currentRooms.push({
        id: crypto.randomUUID(),
        naam: `${roomType} ${i + 1}`,
        oppervlakte: null,
        wensen: [],
      });
    }

    wizardState.setChapterAnswer('ruimtes', currentRooms);

    // Focus on ruimtes tab
    useUiStore.setState({
      currentChapter: 'ruimtes',
      focusedField: 'ruimtes:naam',
    });

    addMessage({
      id: crypto.randomUUID(),
      kind: 'assistant',
      text: `✅ ${count} ${roomType}(s) toegevoegd! Je kunt ze nu aanpassen in de Ruimtes tab.`,
    });
    return true;
  }

  // Geen intent gevonden
  return false;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm1',
      kind: 'assistant',
      text: 'Welkom! Vertel uw budget, gewenste ruimtes of wensen — ik vul de wizard en navigeer mee.',
      info: 'We beginnen met de kern: budget, ruimtes en wensen. Ik vraag door als iets onduidelijk is.',
      fieldId: 'intake.project_type',
      choices: [
        { label: 'Nieuwbouw', value: 'nieuwbouw' },
        { label: 'Verbouwing', value: 'verbouwing' },
      ],
    },
    { id: 'm2', kind: 'card', text: 'Tip: korte, concrete antwoorden werken het beste. U kunt later verfijnen.', cardVariant: 'tip' },
  ]);
  const [infoOpenIds, setInfoOpenIds] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);

  const toggleInfo = (id: string) => setInfoOpenIds((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const addMessage = (m: Message) => setMessages((prev) => [...prev, m]);

  async function callChat(query: string) {
    // EERST: Try smart intents
    if (detectIntent(query, addMessage)) {
      return; // ✅ Intent handled, stop hier
    }

    // ANDERS: Call /api/chat voor complexere vragen
    const state = useWizardState.getState();
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: query, state }),
    });
    const data = (await res.json().catch(() => ({}))) as Partial<ChatApiResponse>;

    if (data?.reply) addMessage({ id: crypto.randomUUID(), kind: 'assistant', text: String(data.reply) });
    if (Array.isArray(data?.actions)) {
      applyChatResponse({ reply: String(data?.reply ?? ''), actions: data!.actions! });
    }
  }

  function onChoice(_msg: Message, choice: Choice) {
    addMessage({ id: crypto.randomUUID(), kind: 'user', text: choice.label });
    void callChat(choice.value || choice.label);
  }

  function onSuggestion(_msg: Message, s: Suggestion) {
    addMessage({ id: crypto.randomUUID(), kind: 'user', text: s.label });
    void callChat(s.value || s.label);
  }

  const currentFieldId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.kind === 'assistant' && m.fieldId);
    return last?.fieldId;
  }, [messages]);

  return (
    <div className="flex h-[70dvh] flex-col bg-[#f3fafb] rounded-xl p-3 md:p-4 border border-[#0d3d4d]/10 shadow-sm">
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm border border-[#0d3d4d]/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full grid place-items-center bg-[#0d3d4d] text-white"><Icon.Bot style={{ width: 18, height: 18 }} /></div>
          <div>
            <div className="text-sm font-semibold text-[#0d3d4d]">Chat met Jules, uw assistent</div>
            <div className="text-xs text-gray-500">Eén stap tegelijk · helder en menselijk</div>
          </div>
        </div>
      </div>

      <div ref={listRef} className="mt-3 flex-1 overflow-y-auto rounded-lg bg-white border border-[#0d3d4d]/10 p-3 md:p-4 space-y-3">
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
            <Bubble
              key={m.id}
              kind={m.kind}
              info={m.info}
              onToggleInfo={m.info ? () => toggleInfo(m.id) : undefined}
              infoOpen={!!infoOpenIds[m.id]}
              fieldActive={fieldActive}
            >
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

      <div className="mt-3">
        <ChatInput
          onSend={(text) => {
            addMessage({ id: crypto.randomUUID(), kind: 'user', text });
            void callChat(text);
          }}
        />
      </div>
    </div>
  );
}

// Eenvoudige input onderaan
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