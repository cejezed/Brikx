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
  info: "bg-white border-slate-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200",
};

export default function TipCard({ id, text, category, severity = "info" }: TipCardProps) {
  const borderStyle = severityStyles[severity] ?? severityStyles.info;

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md ${borderStyle}`}
    >
      <div className="flex items-start gap-2">
        <TipCategoryBadge category={category} />
        <p className="flex-1 text-xs text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
