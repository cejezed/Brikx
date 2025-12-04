// components/premium/PremiumModal.tsx
// v3.x: Premium integratie – Soft upsell modal voor Premium features

"use client";

import React from "react";

export type PremiumFeature = "tech" | "sustainability" | "moodboard" | "pve";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature?: PremiumFeature;
}

/**
 * Soft upsell modal voor Premium features.
 *
 * UX principes:
 * - Transparant: toont wat Premium biedt
 * - Geen druk: altijd een vriendelijke close optie
 * - Feature-specifiek: messaging past zich aan aan context
 * - Respect: geen misleidende claims of tijdsdruk
 */
export default function PremiumModal({
  isOpen,
  onClose,
  onUpgrade,
  feature,
}: PremiumModalProps) {
  if (!isOpen) return null;

  const content = getFeatureContent(feature);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {content.title}
          </h2>
          <p className="text-gray-600 mt-2">{content.subtitle}</p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Met Premium krijg je:
          </h3>
          <ul className="space-y-2">
            {content.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ontgrendel Premium
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Misschien later
          </button>
        </div>

        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Sluiten"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Feature-specifieke content voor de modal.
 */
function getFeatureContent(feature?: PremiumFeature) {
  switch (feature) {
    case "tech":
      return {
        title: "Ontgrendel Uitgebreide Techniek",
        subtitle: "Diepere technische uitwerking voor professionals",
        features: [
          "Ventilatiestrategie per ruimte met specificaties",
          "Akoestische richtlijnen en normwaarden",
          "Verlichtingsplan met luxniveaus en type armaturen",
          "Materiaalkeuze met textuur, kleur en duurzaamheid",
          "Technische adviezen gebaseerd op jouw project",
        ],
      };

    case "sustainability":
      return {
        title: "Ontgrendel Sustainability+",
        subtitle: "Extra duurzaamheidsinzichten voor toekomstbestendig bouwen",
        features: [
          "CO2-impact per materiaalsoort en bouwdeel",
          "Circulariteit-analyse met demontage-advies",
          "Isolatiewaarden per bouwdeel (Rc-waarden)",
          "Zomercomfort-berekening met oververhittingsrisico",
          "Duurzaamheidsadvies afgestemd op jouw ambities",
        ],
      };

    case "moodboard":
      return {
        title: "Ontgrendel Moodboard Module",
        subtitle: "Visuele inspiratie direct in je PvE",
        features: [
          "Upload tot 30 inspiratie-afbeeldingen",
          "AI clustering in categorieën (materialen, kleuren, ruimtes)",
          "Automatische stijlherkenning en tags",
          "Professionele presentatie in het PvE-rapport",
          "Download je moodboard als PDF of afbeeldingset",
        ],
      };

    case "pve":
      return {
        title: "Ontgrendel Premium PvE",
        subtitle: "Professionele uitbreiding van je programma van eisen",
        features: [
          "Uitgebreide techniek met ventilatie, akoestiek en verlichting",
          "Sustainability+ met CO2, circulariteit en comfort",
          "Budgetstructuur met kostenposten (zonder bedragen)",
          "Uitgebreide risico's per domein met gesprekspoints",
          "Volledige moodboard module met uploads",
        ],
      };

    default:
      return {
        title: "Ontgrendel Premium PvE",
        subtitle: "Professionele uitbreiding van je programma van eisen",
        features: [
          "Uitgebreide technische hoofdstukken met meer diepgang",
          "Extra duurzaamheidsinzichten en analyse",
          "Budgetstructuur en verborgen kosten overzicht",
          "Uitgebreide risico-analyse per domein",
          "Volledige moodboard module met uploads",
        ],
      };
  }
}
