"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  chapter: string;
  fieldId: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * FocusTarget
 * - Markeer velden adresserbaar via data-attributen.
 * - Luistert naar window-event:  new CustomEvent("brikx:focus", { detail: { chapter, fieldId, scroll?: boolean } })
 * - Als het matcht → highlight + (optioneel) scrollIntoView.
 */
export default function FocusTarget({ chapter, fieldId, children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const match = detail.chapter === chapter && detail.fieldId === fieldId;
      setFocused(Boolean(match));
      if (match && detail.scroll !== false) {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    window.addEventListener("brikx:focus", handler as EventListener);
    return () => window.removeEventListener("brikx:focus", handler as EventListener);
  }, [chapter, fieldId]);

  return (
    <div
      ref={ref}
      data-chapter={chapter}
      data-field={fieldId}
      data-focused={focused ? "true" : "false"}
      className={className}
    >
      <div className={`rounded-xl transition-all duration-200 ${focused ? "ring-2 ring-[#4db8ba] bg-[#f6fbfc]" : ""}`}>
        {children}
      </div>
    </div>
  );
}
