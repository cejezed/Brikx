// components/premium/PremiumSustainabilityDetails.tsx
// v3.x: Premium integratie – Uitgebreide duurzaamheid details voor Premium gebruikers

"use client";

import React from "react";
import type { DuurzaamData } from "@/types/project";

interface PremiumSustainabilityDetailsProps {
  data?: DuurzaamData;
}

/**
 * Premium duurzaamheid component voor PvE rapport.
 *
 * Toont uitgebreide duurzaamheidsinformatie:
 * - CO2-impact indicatie per bouwdeel
 * - Circulariteit en demontage-advies
 * - Isolatiewaarden (Rc-waarden) per bouwdeel
 * - Zomercomfort en oververhittingsrisico
 *
 * BELANGRIJK: Gebaseerd op bestaande data, veilige indicaties (geen exacte berekeningen).
 */
export default function PremiumSustainabilityDetails({
  data,
}: PremiumSustainabilityDetailsProps) {
  if (!data) return null;

  return (
    <div className="mt-6 space-y-6">
      {/* CO2 Impact */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          CO2-Impact Indicatie
        </h4>
        <p className="text-sm text-emerald-800 mb-4">
          Indicatieve Environmental Cost Indicator (ECI) per materiaalcategorie.
          Lagere waarden = duurzamer.
        </p>

        <div className="space-y-2 text-sm">
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-emerald-900">Fundering & Vloeren</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                ~35-45% van totale impact
              </span>
            </div>
            <ul className="space-y-1 text-emerald-700 text-xs">
              <li>• <strong>Beton (traditioneel):</strong> Hoog (ECI ~1.2-1.5 per kg)</li>
              <li>• <strong>Gerecycled beton:</strong> Lager (ECI ~0.8-1.0 per kg)</li>
              <li>• <strong>Houtskeletbouw:</strong> Laagst (ECI ~0.2-0.4 per kg, CO2-opslag)</li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-emerald-900">Gevels & Isolatie</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                ~25-35% van totale impact
              </span>
            </div>
            <ul className="space-y-1 text-emerald-700 text-xs">
              <li>• <strong>Minerale wol:</strong> Gemiddeld (ECI ~0.9-1.1 per kg)</li>
              <li>• <strong>PIR/PUR-isolatie:</strong> Hoger (ECI ~1.3-1.6 per kg)</li>
              <li>• <strong>Cellulose/houtvezel:</strong> Laag (ECI ~0.3-0.5 per kg, biobased)</li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-emerald-900">Installaties</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                ~15-20% van totale impact
              </span>
            </div>
            <ul className="space-y-1 text-emerald-700 text-xs">
              <li>• <strong>CV-ketel (gas):</strong> Laagste initieel, hoogste gebruik</li>
              <li>• <strong>Warmtepomp:</strong> Hoger initieel, laagste gebruik (bij groene stroom)</li>
              <li>• <strong>PV-panelen:</strong> Terugverdientijd CO2: ~2-4 jaar</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-emerald-700 mt-3 italic">
          Tip: Gebruik de Nationale Milieudatabase (NMD) voor exacte product-specifieke waarden.
        </p>
      </div>

      {/* Circulariteit */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
        <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Circulariteit & Demontage-advies
        </h4>
        <p className="text-sm text-teal-800 mb-4">
          Toekomstbestendig bouwen betekent bouwen met het einde in gedachten.
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-teal-900 mb-2">Principes voor circulair bouwen</p>
            <div className="grid md:grid-cols-2 gap-2 text-teal-700 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Demontabel:</strong> Schroeven i.p.v. lijmen/lassen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Monomaterialen:</strong> Vermijd composieten waar mogelijk</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Gestandaardiseerd:</strong> Gebruik gangbare maten</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Toegankelijk:</strong> Installaties bereikbaar voor onderhoud</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Gids materiaalgebruik:</strong> Documenteer alle materialen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-500">✓</span>
                <span><strong>Duurzaamheid:</strong> Kies lange levensduur (&gt;50 jaar)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-teal-900 mb-2">Demontage-vriendelijkheid per onderdeel</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Houten gevelbekleding (geschroefd)</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Uitstekend</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Gipsplaatwanden (geschroefd)</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Goed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Leidingwerk (gekoppeld)</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Goed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Tegelwerk (verlijmd)</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">Matig</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Traditionele chape (gestort)</span>
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">Beperkt</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Spouwmuurisolatie (geïnjecteerd)</span>
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Niet</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-teal-700 mt-3 italic">
          Overweeg een Materiaalpasspoort aan te leggen voor toekomstige hergebruik of recycling.
        </p>
      </div>

      {/* Rc-waarden */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-5">
        <h4 className="font-semibold text-sky-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Isolatiewaarden (Rc-waarden)
        </h4>
        <p className="text-sm text-sky-800 mb-4">
          Aanbevolen Rc-waarden volgens Bouwbesluit en BENG-eisen (nieuwbouw &gt;2021):
        </p>

        <div className="space-y-2 text-sm">
          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sky-900">Gevel (buitenmuren)</p>
                <p className="text-xs text-sky-600">Wettelijk minimum / Advies BENG-proof</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-900">Rc ≥ 4.7 m²K/W</p>
                <p className="text-xs text-sky-700">Advies: Rc 5.5 - 6.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sky-900">Dak (hellend of plat)</p>
                <p className="text-xs text-sky-600">Wettelijk minimum / Advies BENG-proof</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-900">Rc ≥ 6.3 m²K/W</p>
                <p className="text-xs text-sky-700">Advies: Rc 7.0 - 8.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sky-900">Vloer (begane grond)</p>
                <p className="text-xs text-sky-600">Wettelijk minimum / Advies BENG-proof</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-900">Rc ≥ 3.7 m²K/W</p>
                <p className="text-xs text-sky-700">Advies: Rc 4.5 - 5.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sky-900">Glas (HR++ of beter)</p>
                <p className="text-xs text-sky-600">U-waarde (let op: lagere U = beter)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-900">U ≤ 1.65 W/m²K</p>
                <p className="text-xs text-sky-700">Advies: U 0.8 - 1.2 (triple)</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-sky-700 mt-3 italic">
          Let op: Hogere Rc-waarden zijn vaak kosteneffectief door lagere energiekosten.
          Overweeg minimaal de adviesniveaus voor toekomstbestendigheid.
        </p>
      </div>

      {/* Zomercomfort */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
        <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Zomercomfort & Oververhitting
        </h4>
        <p className="text-sm text-orange-800 mb-4">
          Goed geïsoleerde woningen kunnen in de zomer oververhit raken. Let op deze factoren:
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white rounded p-3">
            <p className="font-medium text-orange-900 mb-2">Risicofactoren oververhitting</p>
            <div className="space-y-1 text-orange-700 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-orange-500">⚠</span>
                <span><strong>Grote glasoppervlakken op zuid/west:</strong> Zonnewering essentieel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">⚠</span>
                <span><strong>Beperkte thermische massa:</strong> Houtskelet warmt snel op</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">⚠</span>
                <span><strong>Onvoldoende nachtventilatie:</strong> Hitte blijft hangen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">⚠</span>
                <span><strong>Dakisolatie zonder spouw:</strong> Warmte-accumulatie</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-orange-900 mb-2">Maatregelen voor zomercomfort</p>
            <div className="grid md:grid-cols-2 gap-2 text-orange-700 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Buitenzonwering (screens, luiken)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Thermische massa (beton, steen)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Nachtventilatie (geautomatiseerd)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Overstekken/luifels bij ramen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Groene daken (isolatie + verkoeling)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Lichte kleuren (reflectie)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <p className="font-medium text-orange-900 mb-1">Norm: TO juli-indicator</p>
            <p className="text-orange-700 text-xs">
              De TO juli-indicator meet het risico op oververhitting. De norm is:
              <strong> ≤ 1.2 °C·uur per m²</strong> (gewenst) of max. <strong>6500 GTO</strong> (toelaatbaar).
              Vraag een TOjuli-berekening aan bij de adviseur voor zekerheid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
