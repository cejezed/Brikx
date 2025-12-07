// /components/expert/ExpertCorner.tsx
// ✅ v3.1 Conform (met wildcard support)
// ✅ v3.2 WIJZIGING: WizardProgressBar vervangen door CircularProgress
// ✅ v3.3 WIJZIGING: Footer vervangen door Auth-bewuste SaveProgressCard-logica
// ✅ v3.4 FIX: ExportModal en JSON-export knop verwijderd om auth-flow af te dwingen
// ✅ v3.8 WIJZIGING: getExpertTips utility voor TECHNIEK_TIPS integratie
// ✅ v3.9 WIJZIGING: UI Polish met TipCard, TipSkeleton, ExpertCornerHeader

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { getExpertTips, type CategorizedTip } from "@/lib/expert/getExpertTips"; // ✅ v3.9
import { Lightbulb, AlertCircle } from "lucide-react";
import rules from "@/components/expert/rules"; // ✅ v3.12: Import rules for fallback
// ❌ REMOVED: Kennisbank import (server-only) - now using /api/expert endpoint
// ✅ v3.9: Nieuwe UI componenten
import TipCard from "./TipCard";
import TipSkeleton from "./TipSkeleton";
import ExpertCornerHeader from "./ExpertCornerHeader";
// ✅ v3.11: Customer Examples Insights
import { InsightSection } from "./InsightSection";
import { InsightCard } from "./InsightCard";
import { useExpertInsights } from "@/lib/hooks/useExpertInsights";
import type { Insight } from "@/lib/insights/types";

export type ExpertCornerMode = "PREVIEW" | "PREMIUM";

interface ExpertCornerProps {
  /** Optioneel; default = "PREVIEW". Gebruik "PREMIUM" voor extra RAG/AI-blokken. */
  mode?: ExpertCornerMode;
}

type RagSnippet = { text: string; source?: string;[k: string]: unknown };

export default function ExpertCorner({
  mode: modeProp = "PREVIEW",
}: ExpertCornerProps) {
  // ✅ Bestaande ExpertCorner State
  const focusedField = useWizardState((s) => s.focusedField ?? null);
  const basisData = useWizardState((s) => s.chapterAnswers?.basis); // ✅ v3.10: Voor lifestyle hints
  const currentChapter = useWizardState((s) => s.currentChapter); // ✅ v3.12

  const [ragSnippets, setRagSnippets] = useState<RagSnippet[]>([]);
  const [lifestyleHints, setLifestyleHints] = useState<string[]>([]); // ✅ v3.10: Lifestyle hints state
  const [ragLoading, setRagLoading] = useState(false);

  const mode: ExpertCornerMode = modeProp;

  // ✅ v3.8: Gecombineerde tips via getExpertTips utility (statisch + TECHNIEK_TIPS)
  const { allTips: staticTips } = useMemo(() => {
    return getExpertTips(focusedField);
  }, [focusedField]);

  // ✅ v3.12: Fallback logic om Archive-gedrag te nabootsen (altijd tips tonen per chapter)
  const displayTips = useMemo(() => {
    // 1. Als er specifieke focus-tips zijn, toon die (prioriteit)
    if (staticTips.length > 0) return staticTips;

    // 2. Anders: toon de eerste algemene tip van de huidige chapter (fallback)
    // Gebruik 'basis' als default als currentChapter nog leeg is (bij eerste load)
    const effectiveChapter = currentChapter || "basis";

    if (effectiveChapter && rules[effectiveChapter] && rules[effectiveChapter].length > 0) {
      const firstTip = rules[effectiveChapter][0];
      return [{
        ...firstTip,
        category: effectiveChapter as any,
      }];
    }

    return [];
  }, [staticTips, currentChapter]);

  // ✅ v3.11: Customer Examples Insights (Fase 1 + 2 + 3)
  const { data: insightsData, isLoading: insightsLoading } = useExpertInsights();
  const insights = insightsData?.insights || [];
  const designTips = insights.filter((insight) => insight.type === 'DESIGN_TIP');
  const similarChoices = insights.filter((insight) => insight.type === 'SIMILAR_CHOICE');
  const budgetWarnings = insights.filter((insight) => insight.type === 'BUDGET_WARNING');
  const roomBestPractices = insights.filter((insight) => insight.type === 'ROOM_BEST_PRACTICE');

  useEffect(() => {
    if (mode !== "PREMIUM" || !focusedField) {
      setRagSnippets([]);
      setLifestyleHints([]); // ✅ v3.10: Leegmaken bij niet-premium
      return;
    }
    const [chapter, fieldId] = focusedField.split(":");
    if (!chapter || !fieldId) return;

    setRagLoading(true);
    const query = `Geef contextuele tips voor ${fieldId} in het hoofdstuk ${chapter}`;

    // ✅ v3.10: Use API endpoint with basisData for lifestyle hints
    fetch("/api/expert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        chapter,
        focusKey: focusedField,
        basisData, // ✅ v3.10: Stuur basisData mee voor lifestyle profiling
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const docs: RagSnippet[] = Array.isArray(data?.ragDocs) ? data.ragDocs : [];
        setRagSnippets(docs);

        // ✅ v3.10: Lifestyle hints verwerken
        const hints: string[] = Array.isArray(data?.lifestyleHints) ? data.lifestyleHints : [];
        setLifestyleHints(hints);
      })
      .catch((err: unknown) => {
        console.error("ExpertCorner API failed:", err);
        setRagSnippets([]);
        setLifestyleHints([]);
      })
      .finally(() => {
        setRagLoading(false);
      });
  }, [focusedField, mode, basisData]);

  // ✅ v3.9: Bereken totaal aantal tips voor header (v3.11: + insights)
  const totalTipCount =
    displayTips.length +
    ragSnippets.length +
    lifestyleHints.length +
    insights.length +
    (mode === "PREMIUM" && ragLoading ? 0 : 0);

  const hasTips =
    displayTips.length > 0 ||
    lifestyleHints.length > 0 ||
    (mode === "PREMIUM" && (ragLoading || ragSnippets.length > 0));

  return (
    <div className="flex flex-col p-4 w-full">
      {/* Header removed as requested */}

      {/* Inhoud container - no longer fixed scroll, adjusts to parent */}
      <div className="space-y-4 text-xs text-slate-700 mt-3">
        {/* Empty state - styled as card */}
        {!hasTips && !ragLoading && (
          <div className="border rounded-2xl p-5 text-center backdrop-blur-sm bg-white/30 border-slate-200">
            <div className="inline-flex justify-center items-center w-8 h-8 rounded-full mb-2 bg-white border border-slate-200">
              <AlertCircle size={14} className="text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500">
              Geen specifieke tips voor dit onderdeel.
            </p>
          </div>
        )}

        {/* ✅ v3.9: Loading skeleton */}
        {ragLoading && mode === "PREMIUM" && (
          <TipSkeleton count={2} />
        )}

        {/* ✅ Fase 2: Co-occurrence "Anderen kozen ook" insights */}
        {similarChoices.length > 0 && (
          <InsightSection title="Anderen kozen ook" severity="info">
            {similarChoices.map((insight: Insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </InsightSection>
        )}

        {/* ✅ Fase 1: Customer Examples Design Tips */}
        {designTips.length > 0 && (
          <InsightSection title="Ontwerp Tips">
            {designTips.map((insight: Insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </InsightSection>
        )}

        {/* ✅ Fase 3: Budget & Risk Warnings */}
        {budgetWarnings.length > 0 && (
          <InsightSection title="Budget & risico" severity="warning">
            {budgetWarnings.map((insight: Insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </InsightSection>
        )}

        {/* ✅ Fase 3: Room Best Practices */}
        {roomBestPractices.length > 0 && (
          <InsightSection title="Best practices per ruimte">
            {roomBestPractices.map((insight: Insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </InsightSection>
        )}

        {/* Insights loading state */}
        {insightsLoading && (
          <TipSkeleton count={2} />
        )}

        {/* ✅ v3.9: Static & Techniek tips met archive/temp design */}
        {displayTips.length > 0 && (
          <div className="border rounded-2xl p-5 shadow-sm relative overflow-hidden group backdrop-blur-sm bg-emerald-50/80 border-emerald-100">
            {/* Glowing effect */}
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 bg-emerald-200/50"></div>

            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm bg-emerald-600 text-white">
                <Lightbulb size={14} fill="currentColor" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Expert Tip
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              {displayTips.map((tip) => (
                <p
                  key={tip.id}
                  className="text-xs leading-relaxed font-medium text-emerald-900"
                >
                  {tip.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ✅ v3.10: Lifestyle hints (Premium) */}
        {mode === "PREMIUM" && lifestyleHints.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase text-slate-400 pt-2 border-t">
              Persoonlijk Advies
            </div>
            {lifestyleHints.map((hint, index) => (
              <TipCard
                key={`lifestyle_${index}`}
                id={`lifestyle_${index}`}
                text={hint}
                category="leefstijl"
                severity="info"
              />
            ))}
          </div>
        )}

        {/* ✅ v3.9: RAG tips met TipCard (Premium) */}
        {mode === "PREMIUM" && ragSnippets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase text-slate-400 pt-2 border-t">
              AI Inzichten (Premium)
            </div>
            {ragSnippets.map((snippet, index) => (
              <TipCard
                key={`rag_${index}`}
                id={`rag_${index}`}
                text={snippet.text}
                category="rag"
                severity="info"
              />
            ))}
          </div>
        )}

        {/* Empty RAG state */}
        {mode === "PREMIUM" &&
          !ragLoading &&
          ragSnippets.length === 0 &&
          focusedField &&
          staticTips.length === 0 && (
            <p className="text-slate-500 italic">
              Geen specifieke AI-inzichten gevonden voor dit veld.
            </p>
          )}
      </div>
    </div>
  );
}
