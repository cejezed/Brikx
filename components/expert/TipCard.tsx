// /components/expert/TipCard.tsx
// ✅ v3.9: Card component voor ExpertCorner tips

"use client";

import React from "react";
import TipCategoryBadge, { type TipCategory } from "./TipCategoryBadge";

export interface TipCardProps {
  id: string;
  text: string;
  category: TipCategory;
  severity?: "info" | "warning" | "danger";
}

const severityStyles: Record<string, string> = {
  info: "bg-white/30 border-slate-200/40",
  warning: "bg-amber-50/40 border-amber-300/50",
  danger: "bg-red-50/40 border-red-300/50",
};

export default function TipCard({ id, text, category, severity = "info" }: TipCardProps) {
  const borderStyle = severityStyles[severity] ?? severityStyles.info;

  return (
    <div
      className={`rounded-lg border p-3 transition-all duration-200 hover:bg-white/50 ${borderStyle}`}
    >
      <div className="flex items-start gap-2">
        <TipCategoryBadge category={category} />
        <p className="flex-1 text-xs text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
