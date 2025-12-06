// /components/chapters/ChapterBasis.tsx
// ✅ v3.13 Conform: Met onFocus-handlers om de ExpertCorner te activeren + DossierChecklist

"use client";

import React, { useEffect, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { generateChapters } from "@/lib/wizard/generateChapters";
import type { ChapterKey, BasisData, BudgetData } from "@/types/project";
import FocusTarget from "@/components/wizard/FocusTarget";
import ChapterControls from "@/components/wizard/ChapterControls";
// ✅ v3.0: Importeer de focus-helper
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";
// ✅ v3.13: Dossier & Documenten checklist
import DossierChecklist from "@/app/wizard/components/DossierChecklist";

const CHAPTER: ChapterKey = "basis";

export default function ChapterBasis() {
  // Losse selectors
  const basisRaw = useWizardState(
    (s) => s.chapterAnswers.basis as BasisData | undefined
  );
  const budgetRaw = useWizardState(
    (s) => s.chapterAnswers.budget as BudgetData | undefined
  );
  const chapterFlowRaw = useWizardState((s) => s.chapterFlow);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);
  const setChapterFlow = useWizardState((s) => s.setChapterFlow);
  const currentChapter = useWizardState((s) => s.currentChapter);

  // ✅ STAP 1: Haal de setter voor de ExpertCorner op
  const setFocusedField = useWizardState((s) => s.setFocusedField);

  // ✅ v3.13: Dossier sectie toggle state
  const [showDossier, setShowDossier] = useState(false);

  // Fallbacks
  const basisData: BasisData = basisRaw ?? ({} as BasisData);
  const budgetData: BudgetData = budgetRaw ?? ({} as BudgetData);
  const chapterFlow = chapterFlowRaw ?? [];

  // ✅ Loop-veilige hook: stelt alleen in als dit niet de actieve chapter is
  useEffect(() => {
    if (currentChapter !== CHAPTER) setCurrentChapter(CHAPTER);
  }, [currentChapter, setCurrentChapter]);

  // ✅ Loop-veilige hook: update de flow alleen als het projectType wijzigt
  useEffect(() => {
    const state = useWizardState.getState();
    const newFlow = generateChapters(state);
    const same =
      newFlow.length === chapterFlow.length &&
      newFlow.every((v, i) => v === chapterFlow[i]);
    if (!same) setChapterFlow(newFlow);
  }, [basisData?.projectType, chapterFlow, setChapterFlow]);

  // ✅ v3.0 Unified updater (alle Basis-velden behalve budget)
  const update = <K extends keyof BasisData>(field: K, value: BasisData[K]) => {
    updateChapterData(CHAPTER, (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Specifieke handler voor budget:
  // schrijft DIRECT naar budget.budgetTotaal zodat Basis & Budget dezelfde bron delen
  const updateBudget = (raw: string) => {
    const val =
      raw.trim() === "" ? undefined : Number(raw.replace(/\D+/g, ""));
    updateChapterData("budget", (prev) => ({
      ...prev,
      budgetTotaal: val,
    }));
  };

  // ✅ STAP 2: Helper-functie voor focus
  const handleFocus = (fieldId: keyof BasisData) => {
    setFocusedField(createFocusKey(CHAPTER, fieldId));
  };

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <FocusTarget chapter={CHAPTER} fieldId="__header">
        <header>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-slate-900">
            De Basis.
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl text-slate-500">
            Laten we de fundering leggen. Vertel ons de basisgegevens zodat de wizard zich aanpast aan uw project.
          </p>
        </header>
      </FocusTarget>

      <div className="space-y-10">

      {/* PROJECT TYPE */}
      <FocusTarget chapter={CHAPTER} fieldId="projectType">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Wat voor project wilt u uitwerken?
          </label>
          <select
            className="glass-select w-full"
            value={basisData?.projectType ?? ""}
            onFocus={() => handleFocus("projectType")}
            onChange={(e) =>
              update("projectType", e.target.value as BasisData["projectType"])
            }
          >
            <option value="">Kies een optie…</option>
            <option value="nieuwbouw">Nieuwbouw woning</option>
            <option value="verbouwing">Verbouwing / renovatie</option>
            <option value="bijgebouw">Bijgebouw / uitbreiding</option>
            <option value="hybride">Hybride / combinatie</option>
            <option value="anders">Anders / weet ik nog niet precies</option>
          </select>
          <p className="text-xs text-slate-500">
            Uw keuze bepaalt welke hoofdstukken verschijnen.
          </p>
        </div>
      </FocusTarget>

      {/* PROJECT NAME & LOCATION - Side by side */}
      <div className="grid md:grid-cols-2 gap-8">
        <FocusTarget chapter={CHAPTER} fieldId="projectNaam">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Projectnaam
            </label>
            <input
              className="glass-input w-full"
              value={basisData?.projectNaam ?? ""}
              onFocus={() => handleFocus("projectNaam")}
              onChange={(e) => update("projectNaam", e.target.value)}
              placeholder="Bijv. Uitbouw Serre"
            />
          </div>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER} fieldId="locatie">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Locatie
            </label>
            <input
              className="glass-input w-full"
              value={basisData?.locatie ?? ""}
              onFocus={() => handleFocus("locatie")}
              onChange={(e) => update("locatie", e.target.value)}
              placeholder="Postcode + Huisnr."
            />
          </div>
        </FocusTarget>
      </div>

      {/* BUDGET */}
      <FocusTarget chapter={CHAPTER} fieldId="budget">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Budget Indicatie
          </label>
          <div className="relative rounded-2xl p-2 border-2 focus-within:ring-4 transition-all backdrop-blur-sm bg-white/40 border-white/50 focus-within:border-brikx-400 focus-within:ring-brikx-400/20 shadow-sm">
            <input
              type="text"
              inputMode="numeric"
              value={budgetData?.budgetTotaal ? `€ ${Number(budgetData.budgetTotaal).toLocaleString('nl-NL')}` : ""}
              onFocus={(e) => {
                handleFocus("budget");
                if (budgetData?.budgetTotaal) {
                  e.target.value = String(budgetData.budgetTotaal);
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  const num = Number(e.target.value.replace(/\D/g, ''));
                  e.target.value = `€ ${num.toLocaleString('nl-NL')}`;
                }
              }}
              onChange={(e) => updateBudget(e.target.value.replace(/\D/g, ''))}
              placeholder="€ 0"
              className="w-full text-4xl font-black tracking-tight bg-transparent px-6 py-4 focus:outline-none placeholder:text-slate-400 text-slate-900"
            />
          </div>
          <p className="text-xs text-slate-500">
            Dit wordt de basis voor het <strong>Budget</strong>-hoofdstuk.
          </p>
        </div>
      </FocusTarget>

      {/* PROJECT SIZE */}
      <FocusTarget chapter={CHAPTER} fieldId="projectSize">
        <label className="block text-sm font-medium text-slate-800">
          Hoe groot is het ongeveer?
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={basisData?.projectSize ?? ""}
          // ✅ STAP 3: Voeg onFocus toe
          onFocus={() => handleFocus("projectSize")}
          onChange={(e) =>
            update("projectSize", e.target.value as BasisData["projectSize"])
          }
        >
          <option value="">Kies een categorie…</option>
          <option value="<75m2">Compact (&lt; 75 m²)</option>
          <option value="75-150m2">Normaal (75–150 m²)</option>
          <option value="150-250m2">Ruim (150–250 m²)</option>
          <option value=">250m2">Groot (&gt; 250 m²)</option>
        </select>
      </FocusTarget>

      {/* URGENCY */}
      <FocusTarget chapter={CHAPTER} fieldId="urgency">
        <label className="block text-sm font-medium text-slate-800">
          Wanneer wilt u ongeveer starten?
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={basisData?.urgency ?? ""}
          // ✅ STAP 3: Voeg onFocus toe
          onFocus={() => handleFocus("urgency")}
          onChange={(e) =>
            update("urgency", e.target.value as BasisData["urgency"])
          }
        >
          <option value="">Kies een indicatie…</option>
          <option value="<3mnd">Binnen 3 maanden</option>
          <option value="3-6mnd">Binnen 3–6 maanden</option>
          <option value="6-12mnd">Binnen 6–12 maanden</option>
          <option value=">12mnd">Langer dan 12 maanden</option>
          <option value="onzeker">Nog geen idee</option>
        </select>
      </FocusTarget>

      {/* EXPERIENCE */}
      <FocusTarget chapter={CHAPTER} fieldId="ervaring">
        <label className="block text-sm font-medium text-slate-800">
          Hoe ervaren bent u met bouwprojecten?
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={basisData?.ervaring ?? ""}
          // ✅ STAP 3: Voeg onFocus toe
          onFocus={() => handleFocus("ervaring")}
          onChange={(e) =>
            update("ervaring", e.target.value as BasisData["ervaring"])
          }
        >
          <option value="">Kies een optie…</option>
          <option value="starter">Dit is mijn eerste keer</option>
          <option value="enigszins">Ik heb eerder een project gedaan</option>
          <option value="ervaren">Ik ben zeer ervaren / professioneel</option>
        </select>
      </FocusTarget>

      {/* TOELICHTING */}
      <FocusTarget chapter={CHAPTER} fieldId="toelichting">
        <label className="block">
          <span className="block text-sm font-medium mb-1">
            Korte toelichting (optioneel)
          </span>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-24 text-sm"
            value={basisData?.toelichting ?? ""}
            // ✅ STAP 3: Voeg onFocus toe
            onFocus={() => handleFocus("toelichting")}
            onChange={(e) => update("toelichting", e.target.value)}
            placeholder="Beschrijf kort wat u wilt bereiken. Dit geeft de AI context."
          />
        </label>
      </FocusTarget>

      {/* ✅ v3.13: DOSSIER & DOCUMENTEN CHECKLIST */}
      {basisData?.projectType && (
        <FocusTarget chapter={CHAPTER} fieldId="documentStatus">
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowDossier(!showDossier)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Dossier & Documenten
                </h2>
                <p className="text-sm text-slate-500">
                  Welke documenten en inspiratie heeft u al verzameld?
                </p>
              </div>
              <span className="text-2xl text-slate-400">
                {showDossier ? "−" : "+"}
              </span>
            </button>

            {showDossier && (
              <div className="mt-4">
                <DossierChecklist
                  onComplete={() => {
                    // Optioneel: scroll naar navigation of feedback
                    console.log("[Basis] DossierChecklist completed");
                  }}
                />
              </div>
            )}
          </div>
        </FocusTarget>
      )}

      </div>

      {/* NAVIGATION */}
      <ChapterControls
        chapters={chapterFlow.map((ch: ChapterKey) => ({
          key: ch,
          title: ch, // (Idealiter zou dit een 'mooie' titel moeten zijn)
        }))}
        activeIndex={0} // (Aanname: Basis is altijd 0)
      />
    </section>
  );
}
