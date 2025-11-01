"use client";

import React from "react";

type Props = {
  current: number; // 1-based index
  total: number;
  label?: string;  // bv. "Stap"
  className?: string;
};

/**
 * Compacte voortgang + balkje (rechtsboven in header).
 */
export default function WizardProgress({ current, total, label = "Stap", className = "" }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((current / Math.max(1, total)) * 100)));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-[13px] md:text-sm text-gray-600">
        <span className="font-medium text-[#0d3d4d]">{label} {current}/{total}</span>
      </div>
      <div className="w-28 md:w-36 h-2 rounded-full bg-gray-200 overflow-hidden" aria-label="Voortgang">
        <div
          className="h-full bg-[#4db8ba]"
          style={{ width: `${pct}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          role="progressbar"
        />
      </div>
    </div>
  );
}