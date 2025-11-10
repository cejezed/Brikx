"use client";

import React, { useState } from "react";
import { X, Send, User, Mail, Phone, MessageSquare, AlertCircle } from "lucide-react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useToast } from "@/components/ui/use-toast";

type Props = { isOpen: boolean; onClose: () => void };

function snapshotWizard() {
  try {
    const s = (useWizardState as any)?.getState?.() ?? {};
    const values =
      s.values ?? s.form ?? s.pve ?? s.answers ?? s.data ?? {};
    return {
      currentChapter: s.currentChapter ?? s.ui?.currentChapter ?? null,
      focusedField: s.focusedField ?? s.ui?.focusedField ?? null,
      completedSteps: s.completedSteps ?? null,
      totalSteps: s.totalSteps ?? null,
      progress: s.progress ?? null,
      values,
    };
  } catch {
    return {};
  }
}

export default function HumanHandoffModal({ isOpen, onClose }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ question: "", name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const ctx = snapshotWizard();
      const res = await fetch("/api/human-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          context: { ...ctx, timestamp: new Date().toISOString() },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Er ging iets mis bij verzenden");

      setSubmitted(true);
      toast({ title: "Verstuurd", description: "We nemen binnen 24 uur contact op." });

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ question: "", name: "", email: "", phone: "" });
          setError(null);
        }, 250);
      }, 2400);
    } catch (err: any) {
      console.error("[handoff] error:", err);
      setError(err?.message ?? "Onbekende fout");
      toast({ variant: "destructive", title: "Versturen mislukt", description: err?.message ?? "Onbekende fout" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header - VAST */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[var(--brx-ink)] to-[var(--brx-accent)] text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full grid place-items-center">🏗️</div>
              <div>
                <h3 className="font-bold text-lg">Vraag aan de Architect</h3>
                <p className="text-xs text-white/80">We helpen je graag verder</p>
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

        {/* Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!submitted ? (
            <>
              <div className="bg-[#eef7f7] border border-[var(--brx-accent)]/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-[var(--brx-ink)]">
                  Heb je een specifieke vraag waar je tegenaan loopt? Stel je vraag hieronder en we helpen je binnen 24 uur verder.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Fout bij verzenden</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Waar loop je tegenaan? *
                  </label>
                  <textarea
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Beschrijf je vraag of uitdaging..."
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brx-accent)] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hoe specifieker, hoe beter we je kunnen helpen</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Naam
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Je naam"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brx-accent)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="je@email.nl"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brx-accent)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Telefoonnummer (optioneel)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 12345678"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brx-accent)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Voor een snellere reactie via telefoon</p>
                </div>

                <p className="text-xs text-gray-500 text-center">We reageren binnen 24 uur</p>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Bedankt voor je vraag!</h4>
              <p className="text-gray-600 mb-4">We nemen binnen 24 uur contact met je op via email.</p>
              <p className="text-sm text-[var(--brx-ink)] font-medium">✓ Bevestiging verstuurd naar {formData.email}</p>
            </div>
          )}
        </div>

        {/* Button - VAST ONDERIN */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            type="submit"
            disabled={isSubmitting || submitted}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-[var(--brx-ink)] to-[var(--brx-accent)] text-white py-3 rounded-lg font-semibold hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Versturen...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Verstuur vraag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}