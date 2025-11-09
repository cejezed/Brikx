// components/chat/HumanHandoffModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function snapshotWizard() {
  try {
    const s = (useWizardState as any).getState?.() ?? {};
    return {
      triage: s.triage ?? {},
      chapterAnswers: s.chapterAnswers ?? {},
      currentChapter: s.currentChapter ?? s.triage?.currentChapter ?? null,
      chapterFlow: Array.isArray(s.chapterFlow) ? s.chapterFlow : [],
      stateVersion: s.stateVersion ?? 1,
    };
  } catch {
    return {};
  }
}

export default function HumanHandoffModal({ isOpen, onClose }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    question: '',
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.email.trim()) {
      setError('Vul minimaal je vraag en e-mailadres in.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ctx = snapshotWizard();
      const res = await fetch('/api/human-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          name: formData.name || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          context: {
            wizard: ctx,
            timestamp: new Date().toISOString(),
            source: 'brikx-wizard-chat',
          },
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          json?.error || 'Er ging iets mis bij het versturen van je vraag.'
        );
      }

      setSubmitted(true);
      toast({
        title: 'Verstuurd',
        description: 'We nemen binnen 24 uur contact met je op.',
      });

      // modal sluiten + resetten na korte delay
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ question: '', name: '', email: '', phone: '' });
        setError(null);
      }, 1800);
    } catch (err: any) {
      console.error('[human-handoff]', err);
      const msg =
        err?.message || 'Onbekende fout bij het versturen van je vraag.';
      setError(msg);
      toast({
        variant: 'destructive',
        title: 'Versturen mislukt',
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0d3d4d] to-[#1992c2] text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-full grid place-items-center">
                🏗️
              </div>
              <div>
                <h3 className="font-bold text-lg">Vraag aan de architect</h3>
                <p className="text-xs text-white/80">
                  Stuur je PvE + context direct naar een menselijk expert.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isSubmitting}
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {!submitted ? (
            <>
              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-[#1992c2]" />
                <p>
                  We sturen je ingevulde gegevens mee zodat een architect snel
                  kan beoordelen wat past bij jouw project. Je krijgt reactie
                  via e-mail.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-sm">
                  <span className="flex items-center gap-2 text-slate-800 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    Jouw vraag
                  </span>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-3 py-2 min-h-[80px] text-sm"
                    placeholder="Beschrijf kort je project of vraag. Bijv.: 'We twijfelen tussen uitbouw en opbouw, kun je meekijken naar haalbaarheid en budget?'"
                    required
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="flex items-center gap-2 text-slate-800 mb-1">
                      <User className="w-4 h-4" />
                      Naam (optioneel)
                    </span>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      placeholder="Je naam"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="flex items-center gap-2 text-slate-800 mb-1">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      placeholder="jij@example.nl"
                      required
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="flex items-center gap-2 text-slate-800 mb-1">
                    <Phone className="w-4 h-4" />
                    Telefoon (optioneel)
                  </span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    placeholder="Alleen als je gebeld wilt worden"
                  />
                </label>

                {error && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d3d4d] text-white text-sm font-medium hover:bg-[#0b3340] disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? (
                    'Versturen…'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Verstuur naar architect
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-slate-400 text-center mt-3">
                We reageren normaal binnen 24 uur op werkdagen.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                Bedankt voor je vraag!
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                We nemen zo snel mogelijk contact met je op via e-mail.
              </p>
              {formData.email && (
                <p className="text-xs text-[#0d3d4d]">
                  Bevestiging gestuurd naar {formData.email}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
