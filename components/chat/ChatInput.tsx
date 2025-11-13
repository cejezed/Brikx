'use client';

import React, { useCallback, useRef, useEffect } from 'react';

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
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
          className="px-3 py-2 text-xs rounded-2xl border border-slate-300"
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="px-3 py-2 text-xs rounded-2xl bg-slate-900 text-white disabled:opacity-40"
        >
          Stuur
        </button>
      )}
    </div>
  );
}
