// components/premium/PremiumGate.tsx
// v3.x: Premium integratie – Wrapper component voor Premium-only content

"use client";

import React, { useState } from "react";
import { useIsPremium } from "@/lib/stores/useAccountStore";
import PremiumModal, { type PremiumFeature } from "./PremiumModal";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: PremiumFeature;
  fallback?: React.ReactNode;
  blurPreview?: boolean;
}

/**
 * Wrapper component die content verbergt voor free users.
 *
 * Drie render modes:
 * 1. Premium user → toon children normaal
 * 2. Free user + blurPreview → toon blurred preview met click-to-upgrade
 * 3. Free user zonder blurPreview → toon fallback of niets
 *
 * Gebruik:
 * ```tsx
 * // Mode 1: Volledig verbergen
 * <PremiumGate>
 *   <AdvancedTechDetails />
 * </PremiumGate>
 *
 * // Mode 2: Blurred preview (voor PvE rapport)
 * <PremiumGate blurPreview feature="pve">
 *   <PremiumTechDetails />
 * </PremiumGate>
 *
 * // Mode 3: Custom fallback
 * <PremiumGate fallback={<UpgradeButton />}>
 *   <MoodboardUpload />
 * </PremiumGate>
 * ```
 */
export default function PremiumGate({
  children,
  feature,
  fallback,
  blurPreview = false,
}: PremiumGateProps) {
  const isPremium = useIsPremium();
  const [modalOpen, setModalOpen] = useState(false);

  // Premium users: gewoon tonen
  if (isPremium) {
    return <>{children}</>;
  }

  // Free users: blurred preview mode
  if (blurPreview) {
    return (
      <>
        <div className="relative group">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none transition-all duration-200 group-hover:blur-md">
            {children}
          </div>

          {/* Overlay met click-to-upgrade (v3.x: Fase 5 - hover animation) */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:via-white/60 group-hover:to-white/95"
            onClick={() => setModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModalOpen(true);
              }
            }}
          >
            <div className="bg-white shadow-lg rounded-lg px-6 py-4 border border-blue-200 transition-all duration-200 group-hover:shadow-xl group-hover:scale-105 group-focus-within:shadow-xl group-focus-within:scale-105">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">
                    Premium Content
                  </p>
                  <p className="text-sm text-gray-600">
                    Klik om te ontgrendelen
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <PremiumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpgrade={() => {
            setModalOpen(false);
            window.location.href = `/checkout?feature=${feature ?? "pve"}&source=premium-gate`;
          }}
          feature={feature}
        />
      </>
    );
  }

  // Free users: fallback of niets
  return <>{fallback || null}</>;
}
