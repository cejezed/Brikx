// components/premium/PremiumRiskDetails.tsx
// v3.x: Fase 5 – Premium risico-verdieping voor PvE rapport

"use client";

import React from "react";
import type { RisicoData, Risk, RiskType } from "@/types/project";

interface PremiumRiskDetailsProps {
  data?: RisicoData;
}

/**
 * Premium risico component voor PvE rapport.
 *
 * Toont uitgebreide risico-analyse op 4 domeinen:
 * - Bouwkundig (technical/quality)
 * - Functioneel (quality/other)
 * - Planning (planning/budget)
 * - Communicatie (other)
 *
 * BELANGRIJK: Geen bedragen, geen garanties, alleen signalering en gesprekspunten.
 * Bouwt voort op bestaande risico's uit wizard, met generieke fallback.
 */
export default function PremiumRiskDetails({ data }: PremiumRiskDetailsProps) {
  const risks = data?.risks || [];

  // Groepeer risico's per domein
  const technicalRisks = risks.filter((r) => r.type === "technical" || r.type === "quality");
  const planningRisks = risks.filter((r) => r.type === "planning" || r.type === "budget");
  const communicationRisks = risks.filter((r) => r.type === "other");

  const hasTechnical = technicalRisks.length > 0;
  const hasPlanning = planningRisks.length > 0;
  const hasCommunication = communicationRisks.length > 0;
  const hasAnyRisks = risks.length > 0;

  return (
    <div className="mt-6 space-y-6">
      {/* Domein 1: Bouwkundig & Technisch */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
        <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Bouwkundig & Technisch
        </h4>

        {hasTechnical ? (
          <div className="space-y-3">
            {technicalRisks.map((risk) => (
              <div key={risk.id} className="bg-white rounded p-3">
                <p className="text-sm font-medium text-orange-900 mb-1">
                  {risk.description}
                </p>
                {risk.mitigation && (
                  <p className="text-xs text-orange-700 italic">
                    → {risk.mitigation}
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-orange-700 mt-3">
              <strong>Gesprekspunten:</strong> Bespreek deze aspecten met uw architect en constructeur.
              Vraag naar ervaringen met vergelijkbare projecten.
            </p>
          </div>
        ) : (
          <div className="text-sm text-orange-800 space-y-2">
            <p>
              <strong>Veelvoorkomende technische aandachtspunten:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Funderingskwaliteit bij bestaande bouw</li>
              <li>Verborgen gebreken in draagconstructie</li>
              <li>Isolatie-aansluitingen en koudebruggen</li>
              <li>Aansluiting nieuw-op-oud materiaal</li>
            </ul>
            <p className="text-xs italic mt-2">
              Tip: Laat altijd een bouwkundige inspectie uitvoeren voordat u begint.
            </p>
          </div>
        )}
      </div>

      {/* Domein 2: Planning & Doorlooptijd */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Planning & Doorlooptijd
        </h4>

        {hasPlanning ? (
          <div className="space-y-3">
            {planningRisks.map((risk) => (
              <div key={risk.id} className="bg-white rounded p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {risk.description}
                </p>
                {risk.mitigation && (
                  <p className="text-xs text-blue-700 italic">
                    → {risk.mitigation}
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-blue-700 mt-3">
              <strong>Aanbeveling:</strong> Bouw altijd buffer in voor vergunningen en onvoorziene vertragingen.
            </p>
          </div>
        ) : (
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Typische planningsrisico's:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Vergunningstrajecten duren langer dan verwacht (3-6 maanden)</li>
              <li>Levertijden van materialen en installaties</li>
              <li>Beschikbaarheid van goede aannemers</li>
              <li>Weersomstandigheden bij buitenwerk</li>
            </ul>
            <p className="text-xs italic mt-2">
              Tip: Plan minstens 20% extra tijd in uw planning voor onvoorziene zaken.
            </p>
          </div>
        )}
      </div>

      {/* Domein 3: Communicatie & Afstemming */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Communicatie & Samenwerking
        </h4>

        {hasCommunication ? (
          <div className="space-y-3">
            {communicationRisks.map((risk) => (
              <div key={risk.id} className="bg-white rounded p-3">
                <p className="text-sm font-medium text-purple-900 mb-1">
                  {risk.description}
                </p>
                {risk.mitigation && (
                  <p className="text-xs text-purple-700 italic">
                    → {risk.mitigation}
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-purple-700 mt-3">
              <strong>Let op:</strong> Helder communiceren en vastleggen van afspraken voorkomt veel problemen.
            </p>
          </div>
        ) : (
          <div className="text-sm text-purple-800 space-y-2">
            <p>
              <strong>Aandachtspunten in samenwerking:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Verwachtingen afstemmen tussen alle partijen</li>
              <li>Duidelijke beslismomenten en verantwoordelijkheden</li>
              <li>Meerwerk tijdig bespreken en vastleggen</li>
              <li>Regelmatige voortgangsgesprekken plannen</li>
            </ul>
            <p className="text-xs italic mt-2">
              Tip: Leg belangrijke afspraken altijd schriftelijk vast (mail of bouwdagboek).
            </p>
          </div>
        )}
      </div>

      {/* Veelgemaakte fouten (altijd tonen) */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
        <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Veelgemaakte Fouten bij Vergelijkbare Projecten
        </h4>
        <div className="text-sm text-stone-700 space-y-3">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-stone-900 mb-1">1. Te krappe budgettering</p>
            <p className="text-xs">
              Veel projecten starten met te weinig buffer. Reken op 10-15% onvoorziene kosten
              bovenop uw initiële raming.
            </p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="font-medium text-stone-900 mb-1">2. Onderschatting van regelgeving</p>
            <p className="text-xs">
              Vergunningstrajecten en BENG-eisen kunnen complex zijn. Schakel tijdig
              een adviseur in voor deze aspecten.
            </p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="font-medium text-stone-900 mb-1">3. Onduidelijke scope</p>
            <p className="text-xs">
              "We zien het wel" leidt tot discussies. Leg vooraf vast wat wél en niet bij
              het project hoort (bijv. tuin, inrichting, witgoed).
            </p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="font-medium text-stone-900 mb-1">4. Te laat starten met selectie</p>
            <p className="text-xs">
              Goede aannemers en adviseurs zijn vaak maanden vooruit volgeboekt. Start
              tijdig met zoeken en selecteren.
            </p>
          </div>
        </div>
      </div>

      {/* Samenvattende tip (alleen bij ingevoerde risico's) */}
      {hasAnyRisks && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <p className="text-sm text-amber-800">
            <strong>💡 Advies:</strong> U heeft {risks.length} {risks.length === 1 ? "risico" : "risico's"} geïdentificeerd.
            Bespreek deze in uw eerste gesprek met de architect of aannemer. Zij kunnen
            per risico aangeven wat realistische maatregelen zijn.
          </p>
        </div>
      )}
    </div>
  );
}
