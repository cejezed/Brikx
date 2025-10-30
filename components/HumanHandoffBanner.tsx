// components/HumanHandoffBanner.tsx
'use client';

import { useState } from 'react';
import { UserCircle, X } from 'lucide-react';

export default function HumanHandoffBanner() {
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  return (
    <>
      {/* Human Handoff Banner */}
      <div className="mt-6 border-t bg-blue-50 px-3 py-2 flex items-center gap-2 text-xs rounded-b-xl">
        <span className="text-blue-700">💡 Loop je vast?</span>
        <button
          onClick={() => setShowHandoffModal(true)}
          className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1 transition-colors"
        >
          <UserCircle className="w-3 h-3" />
          Vraag aan architect
        </button>
      </div>

      {/* Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowHandoffModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-[#0d3d4d]">
                Vraag aan de Architect
              </h3>
              <button
                onClick={() => setShowHandoffModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Je kunt deze form action koppelen aan je bestaande human-handoff endpoint */}
            <form action="/contact/architect" method="GET" className="px-5 py-4 space-y-4">
              <p className="text-sm text-neutral-700">
                Stel uw gerichte vraag. Ik lees mee en reageer meestal binnen 24 uur.
              </p>

              <div className="grid gap-3">
                <label htmlFor="naam" className="text-sm font-medium text-neutral-700">Naam</label>
                <input
                  id="naam"
                  name="naam"
                  className="rounded-md border border-neutral-300 p-2 outline-none focus:ring-2 focus:ring-[#10b981]"
                  required
                />

                <label htmlFor="email" className="text-sm font-medium text-neutral-700">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="rounded-md border border-neutral-300 p-2 outline-none focus:ring-2 focus:ring-[#10b981]"
                  required
                />

                <label htmlFor="vraag" className="text-sm font-medium text-neutral-700">Uw vraag</label>
                <textarea
                  id="vraag"
                  name="vraag"
                  rows={5}
                  placeholder="Beschrijf uw vraag zo concreet mogelijk…"
                  className="rounded-md border border-neutral-300 p-2 outline-none focus:ring-2 focus:ring-[#10b981]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="px-4 py-2 text-sm rounded-full border border-neutral-300 hover:bg-neutral-50"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm rounded-full bg-[#10b981] text-white font-semibold hover:bg-[#059669]"
                >
                  Verstuur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
