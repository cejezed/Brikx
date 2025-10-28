'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, SkipForward, Undo2, Sparkles, Lightbulb, Wand2 } from 'lucide-react';

export default function ChatInput({
  activeFieldId,
  onSend,
  onSkip,
  onBack,
  onUseDefault,
  onShowExamples,
}: {
  activeFieldId?: string;
  onSend: (text: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onUseDefault: () => void;
  onShowExamples: () => void;
}) {
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Contextuele placeholder-hint
  const placeholder = useMemo(() => {
    if (!activeFieldId) return 'Schrijf je antwoord…';
    if (activeFieldId.includes('budget')) return 'Geef een indicatie van het budget (€)…';
    if (activeFieldId.includes('rooms')) return 'Aantal slaapkamers (bijv. 3)…';
    if (activeFieldId.toLowerCase().includes('stijl') || activeFieldId.toLowerCase().includes('style')) {
      return 'Beschrijf de gewenste stijl (bijv. modern, landelijk, industrieel)…';
    }
    return 'Schrijf je antwoord…';
  }, [activeFieldId]);

  // Auto-resize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue('');
  };

  return (
    <div className="rounded-xl border border-[#0d3d4d]/10 bg-white shadow-sm">
      {/* Actie chips (contextueel boven het inputveld) */}
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <Chip icon={<SkipForward size={14} />} label="Sla deze stap over" onClick={onSkip} />
        <Chip icon={<Undo2 size={14} />} label="Terug naar vorige vraag" onClick={onBack} />
        <Chip icon={<Wand2 size={14} />} label="Gebruik standaard waarde" onClick={onUseDefault} />
        <Chip icon={<Lightbulb size={14} />} label="Toon voorbeelden" onClick={onShowExamples} />
      </div>

      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-transparent bg-[#f7fbfc] px-3 py-2 text-[15px] leading-6 outline-none focus:border-[#4db8ba] focus:bg-white transition"
        />
        <button
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0d3d4d] px-3 py-2 text-white text-sm hover:opacity-90 transition"
        >
          <Send size={16} />
          Verstuur
        </button>
      </div>

      {/* Micro-hint onderin */}
      <div className="px-3 pb-3 text-xs text-gray-500 flex items-center gap-1">
        <Sparkles size={14} />
        <span>Tip: kort en concreet is genoeg—je kunt later verfijnen.</span>
      </div>
    </div>
  );
}

function Chip({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#0d3d4d]/20 bg-white px-3 py-1.5 text-xs hover:border-[#4db8ba] hover:bg-[#e6f4f5] transition"
    >
      {icon}
      {label}
    </button>
  );
}
