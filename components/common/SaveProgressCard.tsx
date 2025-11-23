"use client";

// Verfijning: Importeer useMemo en Link
import React, { useMemo, useState } from "react"; 
import { useToast } from "@/components/ui/use-toast";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useAuth } from "@/lib/hooks/useAuth"; // Onze nieuwe hook
import Link from "next/link";
import type { WizardState } from "@/types/project"; // Importeer het correcte type

/** Extract/serialiseer voortgang (Aangepast voor v3.5) */
function useSerializedProgress() {
  // Verfijning: Roep de hook correct aan
  const fullState = useWizardState((s) => s as WizardState);

  // Pak alleen de data die we willen opslaan
  const dataToSave = {
    projectMeta: fullState.projectMeta,
    chapterAnswers: fullState.chapterAnswers,
    currentChapter: fullState.currentChapter,
    chapterFlow: fullState.chapterFlow,
    stateVersion: fullState.stateVersion,
  };

  // Verfijning: Gebruik useMemo correct
  const payload = useMemo(() => ({
    meta: { ts: new Date().toISOString() },
    values: dataToSave,
  }), [fullState.stateVersion, fullState.currentChapter]); // Update alleen bij specifieke wijzigingen

  return payload;
}


export default function SaveProgressCard() {
  const { toast } = useToast();
  const wizardData = useSerializedProgress(); // Haalt de serialiseerbare state op
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth(); // Gebruikt de nieuwe hook

  const saveRemote = async () => {
    setBusy(true);
    try {
      // Verstuur alleen de data. De server weet wie de gebruiker is.
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Stuur de 'values' uit de hook
        body: JSON.stringify({ data: wizardData.values }), 
      });

      const resBody = await res.json();
      if (!res.ok) throw new Error(resBody.error || "Onbekende serverfout");

      toast({ title: "Voortgang opgeslagen", description: "Uw voortgang is veilig bewaard in uw account." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Opslaan mislukt", description: e?.message ?? "Onbekende fout" });
    } finally {
      setBusy(false);
    }
  };

  // Toon een laadstatus terwijl de auth-check loopt
  if (loading) {
    return (
      <div className="brx-card p-3 space-y-2">
        <div className="text-sm font-semibold text-[var(--brx-ink)]">Voortgang</div>
        <p className="text-xs text-gray-400">Authenticatie checken...</p>
      </div>
    );
  }

  // ALS DE GEBRUIKER IS INGELOGD
  if (user) {
    return (
      <div className="brx-card p-3 space-y-2">
        <div className="text-sm font-semibold text-[var(--brx-ink)]">Voortgang Opslaan</div>
        <p className="text-xs text-gray-500 truncate">
          U bent ingelogd als {user.email}.
        </p>
        <button
          onClick={saveRemote}
          disabled={busy}
          className="brx-pill teal text-sm disabled:opacity-50 w-full"
        >
          {busy ? "Opslaan…" : "Nu Opslaan"}
        </button>
      </div>
    );
  }

  // ALS DE GEBRUIKER NIET IS INGELOGD
  return (
    <div className="brx-card p-3 space-y-2">
      <div className="text-sm font-semibold text-[var(--brx-ink)]">Bewaar je voortgang</div>
      <p className="text-xs text-gray-500">
        Maak een account aan of log in om uw voortgang veilig op te slaan.
      </p>
      <div className="flex items-center gap-2">
         <Link href="/login" className="brx-pill teal text-sm text-center flex-1">
          Inloggen
         </Link>
         <Link href="/register" className="brx-pill outline text-sm text-center flex-1">
          Registreren
         </Link>
      </div>
    </div>
  );
}