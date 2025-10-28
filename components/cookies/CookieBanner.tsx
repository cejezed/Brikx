"use client";

import { useConsent } from "./ConsentProvider";
import { useState } from "react";

export default function CookieBanner() {
  const { isSet, acceptAll, rejectAll, settingsOpen, openSettings, closeSettings, consent, setConsent } = useConsent();
  const [local, setLocal] = useState({ ...consent });

  if (isSet && !settingsOpen) return null;

  return (
    <>
      {!isSet && !settingsOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
          <div className="max-w-[900px] w-full bg-[--color-surface-green] border border-neutral-200 shadow-lg rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-1">Cookies bij Brikx</h2>
            <p className="text-sm text-neutral-700 mb-4">
              We gebruiken noodzakelijke cookies en—na toestemming—analytische cookies (GA4).
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={acceptAll} className="rounded-full px-5 py-2 bg-[#10b981] text-white font-semibold hover:bg-[#059669] transition">
                Alles accepteren
              </button>
              <button onClick={rejectAll} className="rounded-full px-5 py-2 bg-white border border-neutral-300 font-semibold hover:bg-neutral-50 transition">
                Alles weigeren
              </button>
              <button onClick={openSettings} className="rounded-full px-5 py-2 bg-white border border-neutral-300 font-semibold hover:bg-neutral-50 transition">
                Instellingen
              </button>
              <a href="/cookies" className="ml-auto text-sm underline">Meer info</a>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-[680px] bg-white rounded-2xl p-6 md:p-8 relative">
            <h3 className="text-xl font-semibold">Cookie-instellingen</h3>
            <p className="text-sm text-neutral-600 mb-4">Pas je voorkeuren aan. Noodzakelijke cookies staan altijd aan.</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <input type="checkbox" checked disabled className="mt-1" />
                <div>
                  <div className="font-medium">Noodzakelijk</div>
                  <div className="text-sm text-neutral-600">Voor basisfunctionaliteit en beveiliging.</div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input type="checkbox" checked={local.preferences} onChange={(e) => setLocal(s => ({ ...s, preferences: e.target.checked }))} className="mt-1" />
                <div>
                  <div className="font-medium">Voorkeuren</div>
                  <div className="text-sm text-neutral-600">Onthoudt keuzes zoals taal of layout.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input type="checkbox" checked={local.analytics} onChange={(e) => setLocal(s => ({ ...s, analytics: e.target.checked }))} className="mt-1" />
                <div>
                  <div className="font-medium">Analytisch (GA4)</div>
                  <div className="text-sm text-neutral-600">Helpt ons de site te verbeteren. Alleen na toestemming.</div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-end">
              <button onClick={rejectAll} className="rounded-full px-5 py-2 bg-white border border-neutral-300 font-semibold hover:bg-neutral-50 transition">
                Alles weigeren
              </button>
              <button onClick={() => setConsent({ ...local })} className="rounded-full px-5 py-2 bg-white border border-neutral-300 font-semibold hover:bg-neutral-50 transition">
                Alleen selectie toestaan
              </button>
              <button onClick={() => { setConsent({ ...local }); closeSettings(); }} className="rounded-full px-5 py-2 bg-[#10b981] text-white font-semibold hover:bg-[#059669] transition">
                Opslaan & sluiten
              </button>
            </div>

            <button onClick={closeSettings} className="absolute top-3 right-3 rounded-full w-9 h-9 bg-neutral-100 hover:bg-neutral-200" aria-label="Sluiten" title="Sluiten">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
