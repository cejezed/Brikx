// /components/expert/ExpertCorner.tsx
// ✅ v3.1 Conform (met wildcard support)
// ✅ v3.2 WIJZIGING: WizardProgressBar vervangen door CircularProgress
// ✅ v3.3 WIJZIGING: Footer vervangen door Auth-bewuste SaveProgressCard-logica
// ✅ v3.4 FIX: ExportModal en JSON-export knop verwijderd om auth-flow af te dwingen
// ✅ v3.8 WIJZIGING: getExpertTips utility voor TECHNIEK_TIPS integratie
// ✅ v3.9 WIJZIGING: UI Polish met TipCard, TipSkeleton, ExpertCornerHeader

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { getExpertTips, type CategorizedTip } from "@/lib/expert/getExpertTips"; // ✅ v3.9
import { Kennisbank } from "@/lib/rag/Kennisbank";
import type { ChapterKey, WizardState } from "@/types/project";
import CircularProgress from "@/components/common/CircularProgress";
import { getCompletionPercentage } from "@/lib/ai/missing";

// ✅ v3.9: Nieuwe UI componenten
import TipCard from "./TipCard";
import TipSkeleton from "./TipSkeleton";
import ExpertCornerHeader from "./ExpertCornerHeader";

import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/useAuth"; // (Onze nieuwe hook)
import Link from "next/link";

export type ExpertCornerMode = "PREVIEW" | "PREMIUM";

interface ExpertCornerProps {
  /** Optioneel; default = "PREVIEW". Gebruik "PREMIUM" voor extra RAG/AI-blokken. */
  mode?: ExpertCornerMode;
}

type RagSnippet = { text: string; source?: string; [k: string]: unknown };

/** Extract/serialiseer voortgang (Aangepast voor v3.5) */
function useSerializedProgress() {
  const fullState = useWizardState((s) => s as WizardState);

  const dataToSave = {
    projectMeta: fullState.projectMeta,
    chapterAnswers: fullState.chapterAnswers,
    currentChapter: fullState.currentChapter,
    chapterFlow: fullState.chapterFlow,
    stateVersion: fullState.stateVersion,
  };

  const payload = useMemo(
    () => ({
      meta: { ts: new Date().toISOString() },
      values: dataToSave,
    }),
    [
      fullState.stateVersion,
      fullState.currentChapter,
      fullState.chapterAnswers,
      fullState.projectMeta,
    ]
  );

  return payload;
}

export default function ExpertCorner({
  mode: modeProp = "PREVIEW",
}: ExpertCornerProps) {
  // ✅ Bestaande ExpertCorner State
  const focusedField = useWizardState((s) => s.focusedField ?? null);
  // const [exportModalOpen, setExportModalOpen] = useState(false); // 👈 VERWIJDERD
  const [ragSnippets, setRagSnippets] = useState<RagSnippet[]>([]);
  const [ragLoading, setRagLoading] = useState(false);

  // ✅ Voortgangslogica
  const rawProgress = useWizardState((state) =>
    getCompletionPercentage(state as WizardState)
  );
  const displayProgress = Math.max(20, rawProgress);
  const mode: ExpertCornerMode = modeProp;

  // 👇 Nieuwe State voor Auth & Opslaan
  const { toast } = useToast();
  const wizardData = useSerializedProgress();
  const [busy, setBusy] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();

  // 👇 Nieuwe Functie voor Opslaan
  const saveRemote = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: wizardData.values }),
      });

      const resBody = await res.json();
      if (!res.ok) throw new Error(resBody.error || "Onbekende serverfout");

      toast({
        title: "Voortgang opgeslagen",
        description: "Uw voortgang is veilig bewaard in uw account.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Opslaan mislukt",
        description: e?.message ?? "Onbekende fout",
      });
    } finally {
      setBusy(false);
    }
  };

  // ✅ v3.8: Gecombineerde tips via getExpertTips utility (statisch + TECHNIEK_TIPS)
  const { allTips: staticTips } = useMemo(() => {
    return getExpertTips(focusedField);
  }, [focusedField]);

  useEffect(() => {
    if (mode !== "PREMIUM" || !focusedField) {
      setRagSnippets([]);
      return;
    }
    const [chapter, fieldId] = focusedField.split(":");
    if (!chapter || !fieldId) return;

    setRagLoading(true);
    const query = `Geef contextuele tips voor ${fieldId} in het hoofdstuk ${chapter}`;
    Kennisbank.query(query, { chapter: chapter as ChapterKey, isPremium: true })
      .then((ragContext: any) => {
        const docs: RagSnippet[] = Array.isArray(ragContext?.docs)
          ? ragContext.docs
          : [];
        setRagSnippets(docs);
      })
      .catch((err: unknown) => {
        console.error("ExpertCorner RAG failed:", err);
        setRagSnippets([]);
      })
      .finally(() => {
        setRagLoading(false);
      });
  }, [focusedField, mode]);

  // ✅ v3.9: Bereken totaal aantal tips voor header
  const totalTipCount =
    staticTips.length +
    ragSnippets.length +
    (mode === "PREMIUM" && ragLoading ? 0 : 0);

  const hasTips =
    staticTips.length > 0 ||
    (mode === "PREMIUM" && (ragLoading || ragSnippets.length > 0));

  return (
    <>
      <aside className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
        {/* Progress Bar */}
        <div className="flex-shrink-0 mb-4">
          <CircularProgress
            value={displayProgress}
            label="PvE Compleet"
            subtitle="Voortgang"
            size={80}
            stroke={7}
          />
        </div>

        {/* ✅ v3.9: Nieuwe sticky header component */}
        <ExpertCornerHeader
          focusedField={focusedField}
          tipCount={totalTipCount}
        />

        {/* Scrollbare inhoud */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700 mt-3">
          {/* Empty state */}
          {!hasTips && !ragLoading && (
            <p className="text-slate-500 italic">
              Klik op een veld in het midden, of stel een vraag in de chat, om
              hier contextuele tips te zien.
            </p>
          )}

          {/* ✅ v3.9: Loading skeleton */}
          {ragLoading && mode === "PREMIUM" && (
            <TipSkeleton count={2} />
          )}

          {/* ✅ v3.9: Static & Techniek tips met TipCard */}
          {staticTips.length > 0 && (
            <div className="space-y-2">
              {staticTips.map((tip) => (
                <TipCard
                  key={tip.id}
                  id={tip.id}
                  text={tip.text}
                  category={tip.category}
                  severity={tip.severity}
                />
              ))}
            </div>
          )}

          {/* ✅ v3.9: RAG tips met TipCard (Premium) */}
          {mode === "PREMIUM" && ragSnippets.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400 pt-2 border-t">
                AI Inzichten (Premium)
              </div>
              {ragSnippets.map((snippet, index) => (
                <TipCard
                  key={`rag_${index}`}
                  id={`rag_${index}`}
                  text={snippet.text}
                  category="rag"
                  severity="info"
                />
              ))}
            </div>
          )}

          {/* Empty RAG state */}
          {mode === "PREMIUM" &&
            !ragLoading &&
            ragSnippets.length === 0 &&
            focusedField &&
            staticTips.length === 0 && (
              <p className="text-slate-500 italic">
                Geen specifieke AI-inzichten gevonden voor dit veld.
              </p>
            )}
        </div>

        {/* 👇 --- FOOTER: Auth-bewuste voortgang --- 👇 */}
        <div className="flex-shrink-0 pt-3 mt-3 border-t border-slate-100">
          {authLoading && (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--brx-ink)]">
                Voortgang
              </div>
              <p className="text-xs text-gray-400">Authenticatie checken...</p>
            </div>
          )}

          {!authLoading && user && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-[var(--brx-ink)]">
                Account & Voortgang
              </div>
              <p className="text-xs text-gray-500 truncate">
                U bent ingelogd als {user.email}.
              </p>
              <button
                onClick={saveRemote}
                disabled={busy}
                className="brx-pill teal text-sm disabled:opacity-50 w-full"
              >
                {busy ? "Opslaan…" : "Voortgang Opslaan"}
              </button>
              <button
                onClick={signOut}
                className="text-xs text-gray-500 hover:text-gray-700 underline w-full text-center"
              >
                Uitloggen
              </button>
            </div>
          )}

          {!authLoading && !user && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-[var(--brx-ink)]">
                Bewaar uw voortgang
              </div>
              <p className="text-xs text-gray-500">
                Maak een account aan of log in om uw voortgang veilig op te
                slaan.
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="brx-pill teal text-sm text-center flex-1"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="brx-pill outline text-sm text-center flex-1"
                >
                  Registreren
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* De ExportModal is hier nu ook permanent verwijderd */}
      {/* <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} /> */}
    </>
  );
}
