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
  info: "bg-white/60 backdrop-blur-md border-white/50",
  warning: "bg-amber-50/60 backdrop-blur-md border-amber-200/50",
  danger: "bg-red-50/60 backdrop-blur-md border-red-200/50",
};

export default function TipCard({ id, text, category, severity = "info" }: TipCardProps) {
  const borderStyle = severityStyles[severity] ?? severityStyles.info;

  return (
    <div
      className={`rounded-xl border-2 p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${borderStyle}`}
    >
      <div className="flex items-start gap-2">
        <TipCategoryBadge category={category} />
        <p className="flex-1 text-xs text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
