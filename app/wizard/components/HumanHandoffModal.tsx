'use client';

import React from 'react';
import { X, PhoneOutgoing, Mail } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function HumanHandoffModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[min(680px,92vw)]">
        {/* Header met Brikx-achtige groene gradient */}
        <div className="rounded-t-2xl px-6 py-5 text-white"
             style={{ background: 'linear-gradient(90deg, #0d3d4d 0%, #4db8ba 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Menselijke hulp nodig?</h3>
            <button onClick={onClose} aria-label="Sluiten">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-white/90">
            Kom je er even niet uit? Plan een belletje of stuur een bericht—wij kijken met je mee.
          </p>
        </div>

        {/* Body */}
        <div className="rounded-b-2xl bg-white p-6 shadow-[0_28px_72px_rgba(6,24,44,.14)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:hallo@brikx.app?subject=Handoff%20Wizard%20hulp"
              className="flex items-center gap-3 rounded-xl border p-4 hover:shadow"
            >
              <Mail className="w-5 h-5" />
              <div>
                <div className="font-medium">Stuur e-mail</div>
                <div className="text-sm text-gray-600">hallo@brikx.app</div>
              </div>
            </a>
            <a
              href="tel:+31101234567"
              className="flex items-center gap-3 rounded-xl border p-4 hover:shadow"
            >
              <PhoneOutgoing className="w-5 h-5" />
              <div>
                <div className="font-medium">Bel direct</div>
                <div className="text-sm text-gray-600">010 – 123 45 67</div>
              </div>
            </a>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
