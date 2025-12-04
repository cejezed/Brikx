// components/premium/PremiumBudgetDetails.tsx
// v3.x: Premium integratie – Uitgebreide budget details voor Premium gebruikers

"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface PremiumBudgetDetailsProps {
  budgetWarning?: string | null;
}

/**
 * Premium budget component voor PvE rapport.
 *
 * Toont:
 * - Veilige budget waarschuwing (heuristic-based, geen AI)
 * - Budgetstructuur overzicht (geen bedragen, wel categorieën)
 * - Verborgen kosten checklist
 * - Faseringssuggesties
 *
 * BELANGRIJK: Geen specifieke kostenbedragen, alleen structuur en awareness.
 */
export default function PremiumBudgetDetails({
  budgetWarning,
}: PremiumBudgetDetailsProps) {
  return (
    <div className="mt-6 space-y-6">
      {/* Budget Warning */}
      {budgetWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">
                Budget Signaal
              </h4>
              <p className="text-sm text-amber-800">{budgetWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budgetstructuur Overzicht */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h4 className="font-semibold text-blue-900 mb-3">
          Budgetstructuur – Belangrijkste Kostenposten
        </h4>
        <p className="text-sm text-blue-800 mb-4">
          Een goed gestructureerd budget helpt om overschrijdingen te voorkomen.
          Hieronder de typische hoofdcategorieën voor dit type project:
        </p>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-start">
            <span className="font-medium min-w-[140px]">Bouwkosten:</span>
            <span>Materiaal, arbeid, installaties</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium min-w-[140px]">Advieskosten:</span>
            <span>Architect, constructeur, adviseurs</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium min-w-[140px]">Vergunningen:</span>
            <span>Leges, aansluitkosten</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium min-w-[140px]">Onvoorzien:</span>
            <span>Buffer voor tegenslagen (aanbevolen: 10-15%)</span>
          </li>
        </ul>
      </div>

      {/* Verborgen Kosten Checklist */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
        <h4 className="font-semibold text-stone-900 mb-3">
          Verborgen Kosten – Vergeet Deze Niet
        </h4>
        <p className="text-sm text-stone-600 mb-4">
          Veel projecten lopen uit door kosten die niet in de initiële begroting
          staan. Check deze punten:
        </p>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              Archeologisch onderzoek (bij oudere grond)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              Tijdelijke voorzieningen (stroom, water)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              Bouwplaatskosten (hekken, containers)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              Extra isolatie bij strengere normen
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              Meerwerk door onvoorziene zaken
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">
              BTW (let op: verbouw vs nieuwbouw tarief)
            </span>
          </div>
        </div>
      </div>

      {/* Faseringssuggestie */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
        <h4 className="font-semibold text-green-900 mb-2">
          Overweeg Fasering
        </h4>
        <p className="text-sm text-green-800">
          Als het budget krap is, overweeg dan om het project in fases te
          splitsen. Fase 1 kan de must-have elementen bevatten, terwijl
          nice-to-have wensen in een latere fase gerealiseerd kunnen worden.
          Dit voorkomt budgetoverschrijding en zorgt voor meer financiële rust.
        </p>
      </div>
    </div>
  );
}
