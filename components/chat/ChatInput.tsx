'use client';

import React, { useState } from 'react';

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [val, setVal] = useState('');

  function submit() {
    const t = val.trim();
    if (!t) return;
    onSend(t);
    setVal('');
  }

  return (
    <div className="p-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm outline-none"
          placeholder="Typ je vraag of opdracht…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          onClick={submit}
          className="px-3 py-2 rounded bg-[#0d3d4d] text-white text-sm disabled:opacity-60"
          disabled={!val.trim()}
        >
          Stuur
        </button>
      </div>
    </div>
  );
}
