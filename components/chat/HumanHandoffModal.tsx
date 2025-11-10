'use client';

import React, { useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';

interface HumanHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HumanHandoffModal({
  isOpen,
  onClose,
}: HumanHandoffModalProps) {
  const triage = useWizardState((s) => s.triage);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    try {
      // TODO: vervang dit met echte API-call
      console.log('Human handoff payload', {
        name,
        email,
        extra,
        triage,
        chapterAnswers,
      });

      setDone(true);
      setTimeout(onClose, 800);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header - vast */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-t-2xl">
          <div className="text-xs uppercase tracking-wide text-slate-300">
            Menselijke expert
          </div>
          <div className="text-sm font-semibold">
            Laat je PvE checken door een architect van Brikx
          </div>
          <p className="mt-1 text-[10px] text-slate-200">
            We gebruiken je ingevulde gegevens om gericht mee te kijken. Geen spam, geen gedoe.
          </p>
        </div>

        {/* Body - scrollbaar */}
        <form
          id="handoff-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-xs text-slate-700"
        >
          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-1">
              Naam
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              placeholder="Hoe mogen we je aanspreken?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              placeholder="Waar sturen we onze reactie naartoe?"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-1">
              Extra toelichting (optioneel)
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs min-h-[72px]"
              placeholder="Bijvoorbeeld: waar je nu staat, deadlines, zorgen of specifieke vragen."
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
          </div>

          <div className="text-[9px] text-slate-400">
            Een samenvatting van je huidige PvE (basis, wensen, budget, risico’s) gaat mee naar de expert.
          </div>
        </form>

        {/* Footer - vast onderin */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-2 rounded-b-2xl">
          {done ? (
            <div className="text-[10px] text-emerald-600">
              ✅ Verzonden! We nemen zo snel mogelijk contact met je op.
            </div>
          ) : (
            <div className="text-[9px] text-slate-400">
              We reageren persoonlijk. Meestal binnen één werkdag.
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] rounded-xl border border-slate-300 text-slate-600 hover:bg-white"
              disabled={submitting}
            >
              Sluiten
            </button>
            <button
              type="submit"
              form="handoff-form"
              disabled={submitting || done}
              className="px-3 py-1.5 text-[10px] rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Versturen…' : done ? 'Verzonden' : 'Verstuur aanvraag'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
