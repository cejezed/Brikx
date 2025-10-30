// components/expert/ExpertCorner.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import CircularProgress from '@/components/common/CircularProgress';
import SaveProgressCard from '@/components/common/SaveProgressCard';

import { useWizardState } from '@/stores/wizardStore'; // mode, chapterAnswers
import { useUiStore } from '@/stores/uiStore';          // focusedField

// ⬇️ jouw rules.ts: default export (Record<string, TipItem[]>)
import rules from '@/components/expert/rules';

/** ----------------------------------------------------
 *  Types (afgeleid van rules.ts)
 *  ----------------------------------------------------
 */
type FocusKey = `${string}:${string}`; // bv. "budget:totaalBudget"

type TipItem = { id: string; text: string; severity?: 'info' | 'warning' | 'danger' };
type Rules = Record<string, TipItem[]>;

/** ----------------------------------------------------
 *  Helpers
 *  ----------------------------------------------------
 */
function parseFocus(focus?: string | null) {
  if (!focus || !focus.includes(':')) return { chapter: null as string | null, field: null as string | null };
  const [chapter, field] = focus.split(':', 2);
  return { chapter, field };
}

function clampPct(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** ----------------------------------------------------
 *  Component
 *  ----------------------------------------------------
 */
export default function ExpertCorner() {
  /** ======= Stores ======= */
  const focusedField = useUiStore((s) => s.focusedField) as FocusKey | null;
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const mode = useWizardState((s) => s.mode) as 'preview' | 'premium' | undefined;

  /** ======= Voortgang (F1 / T2) ======= */
  const { pct, label } = useMemo(() => {
    const allChapters = ['basis', 'wensen', 'budget', 'ruimtes', 'techniek', 'duurzaamheid', 'risico'];
    const completed = allChapters.filter((ch) => {
      const answers = (chapterAnswers as Record<string, any> | undefined)?.[ch];
      return !!(answers && Object.keys(answers).length > 0);
    }).length;
    const total = allChapters.length;
    return { pct: clampPct((completed / total) * 100), label: `Stap ${completed}/${total}` };
  }, [chapterAnswers]);

  /** ======= Contextuele tips – filter rules (F2 / T3) ======= */
  const { chapter, field } = parseFocus(focusedField || '');

  const filteredStaticTips = useMemo(() => {
    if (!chapter || !field) return [] as TipItem[];
    const chapterRules = (rules as Rules)[chapter] || [];
    // TipItem.id == fieldId (exact match)
    return chapterRules.filter((r) => r.id === field);
  }, [chapter, field]);

  /** ======= RAG – Premium gating (F3 / T4) ======= */
  type RagSnippet = { id: string; text: string; source?: string };
  type RagCache = Record<FocusKey, RagSnippet[]>;

  const [rag, setRag] = useState<RagSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const cacheRef = useRef<RagCache>({});

  useEffect(() => {
    let isActive = true;
    const key = focusedField as FocusKey;

    setRagError(null);

    // Alleen in premium én bij geldige focus
    if (mode !== 'premium' || !key || !chapter || !field) {
      setRag([]);
      setIsLoading(false);
      return;
    }

    // Cache?
    if (cacheRef.current[key]) {
      setRag(cacheRef.current[key]);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/expert?focus=${encodeURIComponent(key)}&mode=${mode}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!isActive) return;

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `RAG fetch mislukt (${res.status})`);
        }

        const data = (await res.json()) as { snippets?: RagSnippet[] };
        const snippets = (data?.snippets || []).slice(0, 3);

        cacheRef.current[key] = snippets;
        if (isActive) setRag(snippets);
      } catch (err: any) {
        if (isActive) {
          setRagError(err?.message || 'Er ging iets mis bij het ophalen van tips.');
          setRag([]);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [focusedField, mode, chapter, field]);

  /** ======= Render ======= */
  return (
    <aside aria-label="Adviseur – Expert Corner" className="flex h-full flex-col">
      {/* Boven: voortgang (F1) */}
      <div className="brx-card p-3 mb-2">
        <div className="flex items-center justify-center">
          <CircularProgress value={pct} subtitle="Voortgang" label={label} />
        </div>
      </div>

      {/* Midden: contextuele tips (F2, F3, T3, T4) – scrollbaar */}
      <section className="brx-card p-3 flex-1 overflow-y-auto">
        {!chapter || !field ? (
          <p className="text-sm brx-muted">Selecteer een onderdeel in het canvas — tips verschijnen hier.</p>
        ) : (
          <div className="space-y-3">
            {/* Statische architectentips (altijd) */}
            <TipsBlock
              title="Architectentips"
              items={filteredStaticTips}
              emptyText="Geen algemene tips voor dit onderdeel."
            />

            {/* Premium RAG-snippets */}
            {mode === 'premium' && (
              <div>
                <h3 className="text-xs font-semibold text-[#0d3d4d] mb-1.5">AI-inzichten (Premium)</h3>

                {isLoading && <div className="text-xs brx-muted">Bezig met analyseren…</div>}

                {ragError && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
                    {ragError}
                  </div>
                )}

                {!isLoading && !ragError && (
                  <ul className="space-y-1.5">
                    {rag.length === 0 ? (
                      <li className="text-xs brx-muted">Nog geen specifieke AI-inzichten voor dit veld.</li>
                    ) : (
                      rag.map((s) => (
                        <li
                          key={s.id}
                          className="text-xs leading-relaxed bg-[#eef8f8] border border-[#0d3d4d]/15 rounded-md p-2"
                        >
                          {s.text}
                          {s.source && <span className="block mt-1 opacity-70">Bron: {s.source}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Preview-modus uitleg (F3) */}
            {mode !== 'premium' && (
              <div className="text-[11px] brx-muted border border-dashed border-[#0d3d4d]/20 rounded-md p-2">
                U bekijkt de voorbeeldmodus. Premium toont hier extra AI-inzichten op basis van uw projectcontext.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Onder: Opslaan & Registreren (F4) */}
      <div className="mt-2">
        <div className="brx-card p-3">
          <SaveProgressCard />
        </div>
      </div>
    </aside>
  );
}

/** ----------------------------------------------------
 *  Subcomponenten
 *  ----------------------------------------------------
 */
function TipsBlock(props: { title: string; items: TipItem[]; emptyText?: string }) {
  const { title, items, emptyText = '—' } = props;

  return (
    <section>
      <h3 className="text-xs font-semibold text-[#0d3d4d] mb-1.5">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs brx-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map(({ id, text, severity }) => (
            <li
              key={id}
              className="text-xs leading-relaxed bg-white border border-[#0d3d4d]/15 rounded-md p-2"
            >
              <SeverityBadge severity={severity} />
              <span className="align-middle">{text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SeverityBadge({ severity }: { severity?: 'info' | 'warning' | 'danger' }) {
  const label = severity === 'warning' ? 'Let op' : severity === 'danger' ? 'Belangrijk' : 'Info';
  return (
    <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#0d3d4d]/20 bg-[#eef8f8] text-[#0d3d4d] mr-1.5">
      {label}
    </span>
  );
}
