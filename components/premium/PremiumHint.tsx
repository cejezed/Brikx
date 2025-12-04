// components/premium/PremiumHint.tsx
// v3.x: Premium integratie – Subtiele hint voor Premium features in wizard

"use client";

import React, { useState } from "react";
import { useIsPremium } from "@/lib/stores/useAccountStore";
import PremiumModal, { type PremiumFeature } from "./PremiumModal";

interface PremiumHintProps {
  feature: PremiumFeature;
  title: string;
  description: string;
}

/**
 * Subtiele Premium hint voor gebruik in wizard chapters.
 *
 * UX principes:
 * - Zichtbaar maar niet opdringerig
 * - Informatief: toont wat Premium biedt in deze context
 * - Optioneel: gebruiker kan negeren zonder gevolgen
 * - Geen hard block: wizard werkt perfect zonder Premium
 *
 * Gebruik:
 * ```tsx
 * <PremiumHint
 *   feature="tech"
 *   title="Premium: Uitgebreide Techniek"
 *   description="Ventilatiestrategie, akoestiek, verlichting en materialen"
 * />
 * ```
 */
export default function PremiumHint({
  feature,
  title,
  description,
}: PremiumHintProps) {
  const isPremium = useIsPremium();
  const [modalOpen, setModalOpen] = useState(false);

  // Premium gebruikers zien geen hint
  if (isPremium) return null;

  const handleUpgrade = () => {
    // TODO: Redirect naar checkout of pricing page
    console.log("[PremiumHint] Upgrade clicked for feature:", feature);
    // Voor nu: sluit modal (later: redirect naar /checkout?feature=tech)
    setModalOpen(false);
  };

  return (
    <>
      <div className="mt-6 border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-blue-900">{title}</h4>
            <p className="text-sm text-blue-700 mt-1">{description}</p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 underline transition-colors"
          >
            Meer info
          </button>
        </div>
      </div>

      {/* Modal */}
      <PremiumModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpgrade={handleUpgrade}
        feature={feature}
      />
    </>
  );
}
