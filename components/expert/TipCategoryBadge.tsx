// /components/expert/TipCategoryBadge.tsx
// ✅ v3.9: Category badge voor ExpertCorner tips

"use client";

import React from "react";

export type TipCategory = "basis" | "techniek" | "leefstijl" | "rag";

interface TipCategoryBadgeProps {
  category: TipCategory;
}

const categoryConfig: Record<TipCategory, { bg: string; text: string; label: string }> = {
  basis: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Basis",
  },
  techniek: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Techniek",
  },
  leefstijl: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Leefstijl",
  },
  rag: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "AI Inzicht",
  },
};

export default function TipCategoryBadge({ category }: TipCategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[1px] text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
