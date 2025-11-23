// /components/expert/ExpertCornerHeader.tsx
// ✅ v3.9: Sticky header voor ExpertCorner

"use client";

import React from "react";

interface ExpertCornerHeaderProps {
  focusedField: string | null;
  tipCount: number;
}

export default function ExpertCornerHeader({ focusedField, tipCount }: ExpertCornerHeaderProps) {
  // Parse focusedField naar leesbare vorm
  const getDisplayText = () => {
    if (!focusedField) {
      return "Korte checks & tips op basis van uw input.";
    }

    const [chapter, fieldId] = focusedField.split(":");
    if (!chapter || !fieldId) {
      return `Tips voor: ${focusedField}`;
    }

    // Maak chapter naam leesbaar
    const chapterNames: Record<string, string> = {
      basis: "Basisgegevens",
      wensen: "Wensen",
      techniek: "Techniek",
      budget: "Budget",
      planning: "Planning",
    };

    const chapterName = chapterNames[chapter] ?? chapter;
    return `${chapterName} › ${fieldId}`;
  };

  return (
    <div className="flex-shrink-0 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Expert Corner
        </div>
        {tipCount > 0 && (
          <span className="text-[10px] font-medium text-slate-400">
            {tipCount} {tipCount === 1 ? "tip" : "tips"}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-700 mt-1 truncate" title={focusedField ?? undefined}>
        {getDisplayText()}
      </div>
    </div>
  );
}
