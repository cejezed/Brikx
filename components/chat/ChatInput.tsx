'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAbort?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onAbort,
  disabled,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled) onSend();
      }
    },
    [onSend, disabled],
  );

  // Focus input after message is sent
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="relative flex items-center gap-2">
      <input
        ref={inputRef}
        className="flex-1 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm px-4 py-3 pr-12 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brikx-500/20 focus:border-brikx-400 shadow-sm transition-all duration-200"
        placeholder="Stel je vraag aan Jules over je (ver)bouwplannen…"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      {disabled && onAbort ? (
        <button
          type="button"
          onClick={onAbort}
          className="absolute right-2 p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 shadow-lg"
          aria-label="Stop genereren"
        >
          <X size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="absolute right-2 p-2 rounded-xl bg-gradient-to-tr from-brikx-500 to-emerald-400 hover:from-brikx-600 hover:to-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brikx-500/25 hover:shadow-xl hover:shadow-brikx-500/30"
          aria-label="Verstuur bericht"
        >
          <Send size={18} />
        </button>
      )}
    </div>
  );
}
