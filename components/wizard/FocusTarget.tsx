// /components/wizard/FocusTarget.tsx
'use client';

import { useWizardState } from '@/lib/stores/useWizardState';
// ✅ v3.0: Helper wordt nu gebruikt
import { isFocusedOn } from '@/lib/wizard/focusKeyHelper'; 
import { useEffect, useRef } from 'react';
import type { ChapterKey } from '@/types/project';

interface FocusTargetProps {
  chapter: ChapterKey;
  fieldId: string;
  children: React.ReactNode;
  highlightDuration?: number; // Optional: customize highlight duration
}

export default function FocusTarget({ 
  chapter, 
  fieldId, 
  children,
  highlightDuration = 2000 
}: FocusTargetProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // ✅ v3.0: Lees focusedField uit store (en zet undefined om naar null)
  const focusedField = useWizardState((s) => s.focusedField ?? null);
  const setFocusedField = useWizardState((s) => s.setFocusedField);
  
  // ✅ Type-safe focus key checking
  const isFocused = isFocusedOn(focusedField, chapter, fieldId);

  useEffect(() => {
    if (isFocused && ref.current) {
      // 1. Scroll to field
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 2. Auto-remove highlight after duration
      const timer = setTimeout(() => {
        // ⚠️ FIX: De store verwacht 'null' om de focus te wissen, geen 'undefined'.
        setFocusedField(null); 
      }, highlightDuration);

      return () => clearTimeout(timer);
    }
  }, [isFocused, highlightDuration, setFocusedField]);

  return (
    <div
      ref={ref}
      className={`rounded-xl transition-all duration-200 ${
        isFocused 
          ? 'ring-2 ring-accent bg-accent/5 shadow-md'
          : ''
      }`}
    >
      {children}
    </div>
  );
}