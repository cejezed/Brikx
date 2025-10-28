"use client";

import React, { useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useWizardState } from "@/lib/stores/useWizardState";

/** Veilig waarde lezen uit genest object */
function get(obj: any, path: string, fallback?: any) {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj) ?? fallback;
}

/** Extract/serialiseer voortgang (pas paden gerust aan naar jouw store) */
function useSerializedProgress() {
  const full = useWizardState?.((s: any) => s) ?? {};
  const values =
    full.values ?? full.form ?? full.pve ?? full.answers ?? full.data ?? full;

  const currentStep = full.currentStep ?? full.ui?.currentStep ?? null;
  const progress    = full.progress ?? null;
  const completed   = full.completedSteps ?? null;
  const total       = full.totalSteps ?? null;

  const payload = useMemo(() => ({
    meta: { currentStep, progress, completed, total, ts: new Date().toISOString() },
    values,
  }), [currentStep, progress, completed, total, values]);

  return payload;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SaveProgressCard() {
  const { toast } = useToast();
  const data = useSerializedProgress();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const canSave = EMAIL_RE.test(email);

  const saveLocal = () => {
    try {
      const key = `brikx-progress:${email.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(data));
      toast({ title: "Voortgang lokaal opgeslagen", description: "We hebben een kopie in deze browser gezet." });
    } catch {}
  };

  const saveRemote = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, data }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Voortgang opgeslagen", description: "We hebben je voortgang veilig bewaard." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Opslaan mislukt", description: e?.message ?? "Onbekende fout" });
      // val altijd terug op lokaal
      saveLocal();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="brx-card p-3 space-y-2">
      <div className="text-sm font-semibold text-[var(--brx-ink)]">Bewaar je voortgang</div>
      <p className="text-xs text-gray-500">Vul je e-mail in, dan kun je later verder waar je was.</p>

      <div className="flex items-center gap-2">
        <input
          type="email"
          inputMode="email"
          placeholder="jij@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[var(--brx-accent)] focus:ring-2 focus:ring-[var(--brx-accent)]/20"
        />
        <button
          onClick={saveRemote}
          disabled={!canSave || busy}
          className="brx-pill teal text-sm disabled:opacity-50"
        >
          {busy ? "Opslaan…" : "Opslaan"}
        </button>
      </div>

      <div className="text-[11px] text-gray-400">
        We slaan de ingevulde velden en stapinfo op. Je kunt altijd een export maken vanuit de preview.
      </div>
    </div>
  );
}
