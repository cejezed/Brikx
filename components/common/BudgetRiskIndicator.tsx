// components/common/BudgetRiskIndicator.tsx
// ✅ v3.17: Visuele Budget Risk Indicator
// Toont groen/oranje/rood status voor budget vs must-have wensen

"use client";

import React, { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { analyzeBudgetRisk } from "@/lib/analysis/budgetRiskAnalysis";
import type { BasisData, BudgetData, WensenData } from "@/types/project";

const RISK_STYLES = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "✓",
    iconBg: "bg-green-500",
    title: "Budget in balans",
    titleColor: "text-green-800",
  },
  orange: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⚠",
    iconBg: "bg-amber-500",
    title: "Let op: budget is krap",
    titleColor: "text-amber-800",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "!",
    iconBg: "bg-red-500",
    title: "Budget onvoldoende",
    titleColor: "text-red-800",
  },
};

type Props = {
  compact?: boolean; // Voor gebruik in sidebar/preview
};

export default function BudgetRiskIndicator({ compact = false }: Props) {
  const budgetData = useWizardState(
    (s) => s.chapterAnswers?.budget as BudgetData | undefined
  );
  const wensenData = useWizardState(
    (s) => s.chapterAnswers?.wensen as WensenData | undefined
  );
  const basisData = useWizardState(
    (s) => s.chapterAnswers?.basis as BasisData | undefined
  );

  const analysis = useMemo(
    () => analyzeBudgetRisk(budgetData, wensenData, basisData),
    [budgetData, wensenData, basisData]
  );

  // Niet tonen als er geen budget óf geen must-haves zijn
  if (!analysis.availableBudget || analysis.mustHaveCount === 0) {
    return null;
  }

  const style = RISK_STYLES[analysis.riskLevel];

  if (compact) {
    // Compacte versie voor sidebar
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${style.bg} ${style.border} border`}
      >
        <span
          className={`w-5 h-5 rounded-full ${style.iconBg} text-white text-xs flex items-center justify-center font-bold`}
        >
          {style.icon}
        </span>
        <span className={`text-xs font-medium ${style.titleColor}`}>
          {style.title}
        </span>
      </div>
    );
  }

  // Volledige versie
  return (
    <div
      className={`rounded-xl ${style.bg} ${style.border} border p-4 space-y-3`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className={`w-8 h-8 rounded-full ${style.iconBg} text-white text-sm flex items-center justify-center font-bold flex-shrink-0`}
        >
          {style.icon}
        </span>
        <div>
          <h4 className={`font-semibold text-sm ${style.titleColor}`}>
            {style.title}
          </h4>
          <p className="text-xs text-gray-700 mt-0.5">{analysis.message}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/60 rounded px-2 py-1.5">
          <span className="text-gray-500">Must-haves:</span>{" "}
          <strong>{analysis.mustHaveCount}</strong>
        </div>
        <div className="bg-white/60 rounded px-2 py-1.5">
          <span className="text-gray-500">Budget:</span>{" "}
          <strong>€{analysis.availableBudget.toLocaleString("nl-NL")}</strong>
        </div>
        {analysis.shortfall > 0 && (
          <div className="col-span-2 bg-white/60 rounded px-2 py-1.5 text-red-700">
            <span className="text-gray-500">Geschat tekort:</span>{" "}
            <strong>€{analysis.shortfall.toLocaleString("nl-NL")}</strong>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <ul className="text-xs text-gray-700 space-y-1">
          {analysis.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-gray-400">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
