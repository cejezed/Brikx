"use client";
import React from "react";
import { useWizardState } from "@/lib/stores/useWizardState";

type Props = {
  chapter: string;
  fieldId: string;
  children: React.ReactNode;
};

export default function FocusTarget({ chapter, fieldId, children }: Props) {
  const focusedField = useWizardState((s: any) => s.focusedField);
  const currentChapter = useWizardState((s: any) => s.currentChapter);

  const isFocused = focusedField === fieldId && currentChapter === chapter;

  return (
    <div
      data-spotlight-scope
      data-focused={isFocused ? "true" : "false"}
      className={isFocused ? "bkx-spotlight" : ""}
    >
      {children}
    </div>
  );
}
