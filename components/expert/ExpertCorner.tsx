// /components/expert/ExpertCorner.tsx
// ✅ 100% v3.1 Conform (met wildcard support)

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import ExportModal from '@/components/wizard/ExportModal';
import WizardProgressBar from '@/components/wizard/ProgressBar';
import { isFocusedOn } from '@/lib/wizard/focusKeyHelper'; // ✅ WILDCARD MATCH

import staticRules, { type TipItem } from './rules';
import { Kennisbank } from '@/lib/rag/Kennisbank';
import type { ChapterKey } from '@/types/project';

export type ExpertCornerMode = 'PREVIEW' | 'PREMIUM';

interface ExpertCornerProps {
  /** Optioneel; default = "PREVIEW". Gebruik "PREMIUM" voor extra RAG/AI-blokken. */
  mode?: ExpertCornerMode;
}

type RagSnippet = { text: string; [k: string]: any };

export default function ExpertCorner({ mode: modeProp = 'PREVIEW' }: ExpertCornerProps) {
  // ✅ v3.1: Lees 'focusedField' uit store (null = geen focus)
  const focusedField = useWizardState((s) => s.focusedField ?? null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [ragSnippets, setRagSnippets] = useState<RagSnippet[]>([]);
  const [ragLoading, setRagLoading] = useState(false);

  // Gebruik de effectieve modus (prop of default)
  const mode: ExpertCornerMode = modeProp;

  // ✅ v3.1: Logica voor statische tips (met wildcard support!)
  const staticTips: TipItem[] = useMemo(() => {
    if (!focusedField) return [];

    const [chapter, fieldId] = focusedField.split(':');
    if (!chapter || !fieldId) return [];

    const chapterRules = (staticRules as Record<string, TipItem[]>)[chapter];
    if (!chapterRules) return [];

    // ✅ FIXED: Gebruik isFocusedOn voor wildcard pattern matching
    return chapterRules.filter((tip) =>
      isFocusedOn(focusedField, chapter as ChapterKey, tip.id)
    );
  }, [focusedField]);

  // ✅ v3.1: Logica voor RAG (alleen in PREMIUM)
  useEffect(() => {
    if (mode !== 'PREMIUM' || !focusedField) {
      setRagSnippets([]);
      return;
    }

    const [chapter, fieldId] = focusedField.split(':');
    if (!chapter || !fieldId) return;

    setRagLoading(true);

    const query = `Geef contextuele tips voor ${fieldId} in het hoofdstuk ${chapter}`;

    Kennisbank.query(query, { chapter: chapter as ChapterKey, isPremium: true })
      .then((ragContext: any) => {
        const docs: RagSnippet[] = Array.isArray(ragContext?.docs) ? ragContext.docs : [];
        setRagSnippets(docs);
      })
      .catch((err: unknown) => {
        console.error('ExpertCorner RAG failed:', err);
        setRagSnippets([]);
      })
      .finally(() => {
        setRagLoading(false);
      });
  }, [focusedField, mode]);

  const hasTips =
    staticTips.length > 0 || (mode === 'PREMIUM' && (ragLoading || ragSnippets.length > 0));

  return (
    <>
      <aside className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
        {/* Progress Bar */}
        <div className="flex-shrink-0 mb-4">
          <WizardProgressBar />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Expert corner
          </div>
          <div className="text-xs text-slate-700">
            {focusedField
              ? `Tips voor: ${focusedField}`
              : 'Korte checks & tips op basis van jouw input.'}
          </div>
        </div>

        {/* Scrollbare inhoud */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700">
          {!hasTips && (
            <p className="text-slate-500 italic">
              Klik op een veld in het midden, of stel een vraag in de chat, om hier contextuele tips
              te zien.
            </p>
          )}

          {/* Render Statische Tips */}
          {staticTips.length > 0 && (
            <div className="space-y-2">
              {staticTips.map((tip) => (
                <div
                  key={tip.id}
                  className={`p-2 rounded-md ${
                    tip.severity === 'warning'
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-slate-50'
                  }`}
                >
                  {tip.text}
                </div>
              ))}
            </div>
          )}

          {/* Render AI (RAG) Tips */}
          {mode === 'PREMIUM' && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400 pt-2 border-t">
                AI Inzichten (Premium)
              </div>
              {ragLoading && (
                <p className="text-slate-500 italic">AI-inzichten ophalen...</p>
              )}

              {!ragLoading && ragSnippets.length === 0 && focusedField && (
                <p className="text-slate-500 italic">
                  Geen specifieke AI-inzichten gevonden voor dit veld.
                </p>
              )}

              {ragSnippets.map((snippet, index) => (
                <div
                  key={index}
                  className="p-2 rounded-md bg-blue-50 border border-blue-200 text-blue-800"
                >
                  {snippet.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer met vaste save/export-knop */}
        <div className="flex-shrink-0 pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-slate-600">PvE opslaan of delen</div>
            <div className="text-[9px] text-slate-400">
              Exporteer als JSON wanneer jij er klaar voor bent.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-2 text-[10px] rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Opslaan &amp; export
          </button>
        </div>
      </aside>

      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </>
  );
}
