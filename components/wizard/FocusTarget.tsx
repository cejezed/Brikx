'use client';

import { useUiStore } from '@/lib/stores/useUiStore';
import { useEffect, useRef } from 'react';
import type { ChapterKey } from '@/types/wizard';

interface FocusTargetProps {
  chapter: ChapterKey;
  fieldId: string;
  children: React.ReactNode;
}

export default function FocusTarget({ chapter, fieldId, children }: FocusTargetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const focusedField = useUiStore((s) => s.focusedField);
  
  const isFocused = focusedField === `${chapter}:${fieldId}`;

  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current.classList.add('focused-field');
      
      const timer = setTimeout(() => {
        ref.current?.classList.remove('focused-field');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  return (
    <div
      ref={ref}
      className={`rounded-xl transition-all duration-200 ${
        isFocused ? 'ring-2 ring-[#4db8ba] bg-[#f6fbfc]' : ''
      }`}
    >
      {children}
    </div>
  );
}