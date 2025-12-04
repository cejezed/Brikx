// components/premium/PremiumTechDetails.tsx
// v3.x: Premium integratie – Uitgebreide techniek details voor Premium gebruikers

"use client";

import React from "react";
import type { TechniekData } from "@/types/project";

interface PremiumTechDetailsProps {
  data?: TechniekData;
}

/**
 * Premium techniek component voor PvE rapport.
 *
 * Toont uitgebreide technische informatie:
 * - Ventilatiestrategie per ruimte met specificaties
 * - Akoestische richtlijnen en normwaarden
 * - Verlichtingsplan met luxniveaus
 * - Materiaalkeuze met textuur en duurzaamheid
 *
 * BELANGRIJK: Gebaseerd op bestaande data, geen extra verplichte velden.
 */
export default function PremiumTechDetails({ data }: PremiumTechDetailsProps) {
  if (!data) return null;

  return (
    <div className="mt-6 space-y-6">
      {/* Ventilatiestrategie */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Ventilatiestrategie
        </h4>
        <p className="text-sm text-blue-800 mb-4">
          Op basis van jouw ventilatie-ambitie ({data.ventilationAmbition || 'onbekend'}) adviseren we:
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-blue-900 mb-1">Woonkamer & eetkamer</p>
            <p className="text-blue-700">
              Minimum ventilatiecapaciteit: 0.9 dm³/s per m². Bij mechanische ventilatie:
              zorg voor stille units (&lt;30dB) en plaatsing afvoerpunten minimaal 15cm van plafond.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-blue-900 mb-1">Slaapkamers</p>
            <p className="text-blue-700">
              Nachtventilatie: 0.7 dm³/s per m². CO2-gestuurde ventilatie aanbevolen voor
              optimaal slaapklimaat. Overweeg WTW (Warmte Terugwin) voor energiebesparing.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-blue-900 mb-1">Badkamer & toilet</p>
            <p className="text-blue-700">
              Vochtsgestuurde afzuiging: minimum 21 dm³/s (badkamer), 14 dm³/s (toilet).
              Naloop minimaal 10 minuten. Voorkom koudebruggen bij doorvoeren.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-blue-900 mb-1">Keuken</p>
            <p className="text-blue-700">
              Mechanische afzuigkap: minimum 300 m³/h (recirculatie) of 400 m³/h (afvoer naar buiten).
              Aanbevolen: afvoer naar buiten met zelfsluitende klep tegen terugstroming.
            </p>
          </div>
        </div>
      </div>

      {/* Akoestiek */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Akoestische Richtlijnen
        </h4>
        <p className="text-sm text-purple-800 mb-4">
          Voor comfort en gezondheid zijn deze normwaarden belangrijk:
        </p>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-purple-900">Luchtgeluidisolatie</p>
            <ul className="mt-2 space-y-1 text-purple-700">
              <li>• Tussen woningen: R<sub>A,2</sub> ≥ 52 dB</li>
              <li>• Binnenwanden: R<sub>A,2</sub> ≥ 40 dB</li>
              <li>• Slaapkamer-badkamer: R<sub>A,2</sub> ≥ 47 dB</li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-purple-900">Contactgeluidisolatie</p>
            <ul className="mt-2 space-y-1 text-purple-700">
              <li>• Vloeren: L<sub>n,w</sub> ≤ 54 dB</li>
              <li>• Trappen: extra demping aanbevolen</li>
              <li>• Leidingen: trillingvrije bevestiging</li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-purple-900">Nagalmtijd (T<sub>60</sub>)</p>
            <ul className="mt-2 space-y-1 text-purple-700">
              <li>• Woonkamer: 0.4 - 0.6 sec</li>
              <li>• Slaapkamer: 0.3 - 0.5 sec</li>
              <li>• Hal/gang: 0.5 - 0.8 sec</li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-purple-900">Achtergrondgeluid</p>
            <ul className="mt-2 space-y-1 text-purple-700">
              <li>• Slaapkamer: &lt; 30 dB(A)</li>
              <li>• Woonkamer: &lt; 35 dB(A)</li>
              <li>• Keuken: &lt; 40 dB(A)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verlichting */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Verlichtingsplan (Luxniveaus)
        </h4>
        <p className="text-sm text-amber-800 mb-4">
          Aanbevolen verlichtingssterktes volgens NEN-EN 12464:
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Woonkamer (algemeen)</span>
            <span className="text-amber-700">150-200 lux</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Leeshoek</span>
            <span className="text-amber-700">300-500 lux</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Keuken (werkvlak)</span>
            <span className="text-amber-700">500 lux</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Badkamer (spiegel)</span>
            <span className="text-amber-700">300-400 lux</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Slaapkamer</span>
            <span className="text-amber-700">100-150 lux (dimbaar)</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded p-2">
            <span className="text-amber-900 font-medium">Gang/trap</span>
            <span className="text-amber-700">100 lux (bewegingssensor)</span>
          </div>
        </div>

        <p className="text-xs text-amber-700 mt-3 italic">
          Tip: Kies LED-verlichting met kleurtemperatuur 2700-3000K (warm wit)
          voor woonruimtes, 4000K (neutraal wit) voor werkruimtes.
        </p>
      </div>

      {/* Materiaalkeuze */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Materiaalkeuze Overwegingen
        </h4>
        <p className="text-sm text-green-800 mb-4">
          Technische aandachtspunten per materiaalcategorie:
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-green-900 mb-1">Vloeren</p>
            <p className="text-green-700">
              <strong>Hout:</strong> Vochtgevoelig, expansievoeg vereist. <strong>Tegel:</strong>
              Koude-effect, vloerverwarming aanbevolen. <strong>PVC/Vinyl:</strong> Emissie-arm
              (DIBT-keurmerk), goede geluidisolatie met ondervloer.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-green-900 mb-1">Wanden</p>
            <p className="text-green-700">
              <strong>Gipsplaat:</strong> Brandwerend (A2), vochtwerend voor natte ruimtes.
              <strong>Baksteen:</strong> Thermische massa, akoestisch voordeel. <strong>Hout:</strong>
              Diffusieopen, regulerend voor binnenklimaat.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-green-900 mb-1">Afwerking</p>
            <p className="text-green-700">
              <strong>Verf:</strong> Emissie-arm (Milieukeur), dampopen. <strong>Behang:</strong>
              Diffusiewerend, vermijd in vochtige ruimtes. <strong>Tegels:</strong> Hygiënisch,
              let op voegbreedte en dilatatie.
            </p>
          </div>
        </div>

        <p className="text-xs text-green-700 mt-3 italic">
          Let op: Alle materialen moeten voldoen aan Bouwbesluit eisen voor brandveiligheid
          (klasse A1-D) en emissies (AgBB-schema).
        </p>
      </div>
    </div>
  );
}
