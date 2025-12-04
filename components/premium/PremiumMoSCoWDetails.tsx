// components/premium/PremiumMoSCoWDetails.tsx
// v3.x: Fase 5 – Premium MoSCoW-analyse voor PvE rapport

"use client";

import React from "react";
import type { WensenData } from "@/types/project";

interface PremiumMoSCoWDetailsProps {
  data?: WensenData;
}

/**
 * Premium MoSCoW component voor PvE rapport.
 *
 * Toont distributie-analyse van wensen:
 * - Overzicht must/nice/optional/wont counts
 * - Eenvoudige ASCII-visualisatie
 * - Veilige heuristische insights (geen conflictdetectie op inhoud)
 *
 * BELANGRIJK: Geen AI, geen semantische analyse, alleen distributie-statistiek.
 */
export default function PremiumMoSCoWDetails({ data }: PremiumMoSCoWDetailsProps) {
  const wishes = data?.wishes || [];

  if (wishes.length === 0) {
    return null;
  }

  // Tel per priority
  const mustCount = wishes.filter((w) => w.priority === "must").length;
  const niceCount = wishes.filter((w) => w.priority === "nice").length;
  const optionalCount = wishes.filter((w) => w.priority === "optional").length;
  const wontCount = wishes.filter((w) => w.priority === "wont").length;
  const total = wishes.length;

  // Bereken percentages
  const mustPct = total > 0 ? Math.round((mustCount / total) * 100) : 0;
  const nicePct = total > 0 ? Math.round((niceCount / total) * 100) : 0;
  const optionalPct = total > 0 ? Math.round((optionalCount / total) * 100) : 0;
  const wontPct = total > 0 ? Math.round((wontCount / total) * 100) : 0;

  // Simpele bar helper (max 20 chars)
  const getBar = (percentage: number) => {
    const filled = Math.round((percentage / 100) * 20);
    return "█".repeat(filled) + "░".repeat(20 - filled);
  };

  // Heuristische insights (veilig, geen semantiek)
  const getDistributionInsight = () => {
    const insights: string[] = [];

    // Heuristiek 1: Hoog must-aandeel
    if (mustPct > 60) {
      insights.push(
        "U heeft relatief veel must-haves. Dit vraagt om scherpe keuzes en heldere afweging met uw architect."
      );
    } else if (mustPct < 30 && total > 5) {
      insights.push(
        "Er is ruimte voor flexibiliteit: relatief weinig must-haves betekent dat u kunt schuiven bij budget- of planningskeuzes."
      );
    }

    // Heuristiek 2: Nice/optional mix
    if (nicePct + optionalPct > 50) {
      insights.push(
        "Uw nice-to-haves en optional wensen bieden ruimte om te faseren of bij te sturen als het project dat vraagt."
      );
    }

    // Heuristiek 3: Won't-haves aanwezig
    if (wontCount > 0) {
      insights.push(
        `U heeft ${wontCount} anti-${wontCount === 1 ? "wens" : "wensen"} benoemd. Belangrijk: bewaak deze tijdens gesprekken met adviseurs en aannemers.`
      );
    }

    // Heuristiek 4: Weinig wensen totaal
    if (total < 5) {
      insights.push(
        "Relatief weinig wensen ingevuld. Overweeg om later meer toe te voegen als u verder nadenkt over het project."
      );
    }

    return insights;
  };

  const insights = getDistributionInsight();

  return (
    <div className="mt-6 space-y-6">
      {/* Overzicht */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          MoSCoW Distributie
        </h4>

        <div className="space-y-3 text-sm">
          {/* Must-haves */}
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-red-900">Must-have</span>
              <span className="text-red-700 font-semibold">{mustCount} ({mustPct}%)</span>
            </div>
            <div className="font-mono text-xs text-red-600">
              {getBar(mustPct)}
            </div>
            <p className="text-xs text-red-700 mt-1 italic">
              Essentieel voor project
            </p>
          </div>

          {/* Nice-to-haves */}
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-green-900">Nice-to-have</span>
              <span className="text-green-700 font-semibold">{niceCount} ({nicePct}%)</span>
            </div>
            <div className="font-mono text-xs text-green-600">
              {getBar(nicePct)}
            </div>
            <p className="text-xs text-green-700 mt-1 italic">
              Gewenst, maar niet strikt noodzakelijk
            </p>
          </div>

          {/* Optional */}
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-blue-900">Optional</span>
              <span className="text-blue-700 font-semibold">{optionalCount} ({optionalPct}%)</span>
            </div>
            <div className="font-mono text-xs text-blue-600">
              {getBar(optionalPct)}
            </div>
            <p className="text-xs text-blue-700 mt-1 italic">
              Bonus, als het past
            </p>
          </div>

          {/* Won't-haves (alleen tonen als > 0) */}
          {wontCount > 0 && (
            <div className="bg-white rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-stone-900">Won't-have (anti-wensen)</span>
                <span className="text-stone-700 font-semibold">{wontCount} ({wontPct}%)</span>
              </div>
              <div className="font-mono text-xs text-stone-600">
                {getBar(wontPct)}
              </div>
              <p className="text-xs text-stone-700 mt-1 italic">
                Expliciet niet gewenst
              </p>
            </div>
          )}
        </div>

        {/* Totaal */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-900">Totaal aantal wensen</span>
            <span className="text-sm font-bold text-blue-900">{total}</span>
          </div>
        </div>
      </div>

      {/* Heuristische Insights */}
      {insights.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Aandachtspunten
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded p-3">
                <p className="text-sm text-amber-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Praktische Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
        <h4 className="font-semibold text-green-900 mb-3">
          💡 Praktische Tips voor MoSCoW
        </h4>
        <div className="space-y-2 text-sm text-green-800">
          <div className="flex items-start gap-2">
            <span className="text-green-600 flex-shrink-0">•</span>
            <p>
              <strong>Must-haves:</strong> Deze moeten in fase 1. Als het budget krap is,
              heroverweeg dan of alles echt "must" is.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 flex-shrink-0">•</span>
            <p>
              <strong>Nice/Optional:</strong> Ideaal voor fasering of als "meerwerk budget".
              Zo blijft uw project betaalbaar én toekomstbestendig.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 flex-shrink-0">•</span>
            <p>
              <strong>Won't-haves:</strong> Communiceer deze expliciet naar uw adviseur.
              Dit voorkomt voorstellen die u niet wilt.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 flex-shrink-0">•</span>
            <p>
              <strong>Herbeoordeel regelmatig:</strong> Tijdens het ontwerpproces kunnen
              prioriteiten verschuiven. Dat is normaal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
